# Simple Revisions and History Audit System

## Overview

A minimal, efficient revision tracking system for PostgreSQL that stores snapshots of updated rows with delta information for changed fields only.

## Core Principles

1. **Single Table Design**: One optimized table with JSONB for efficiency
2. **Snapshot + Delta**: Store complete row data AND changed fields in one record
3. **PostgreSQL Optimized**: Leverage JSONB performance and GIN indexing
4. **Zero JOINs**: All revision data accessible in single query

## Database Schema Design

### Single Optimized Revisions Table

```sql
CREATE TABLE revisions (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

    -- Complete row data (current state after operation)
    revision_data JSONB NOT NULL,

    -- Changed fields only (for UPDATE operations) - much more efficient than separate table
    changed_fields JSONB, -- {"field_name": {"old": value, "new": value}, ...}

    -- Audit metadata
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Essential indexes for performance
CREATE INDEX idx_revisions_table_record ON revisions(table_name, record_id);
CREATE INDEX idx_revisions_created_at ON revisions(created_at DESC);
CREATE INDEX idx_revisions_user ON revisions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_revisions_operation ON revisions(operation);

-- GIN index for efficient JSONB queries on changed fields
CREATE INDEX idx_revisions_changed_fields ON revisions USING GIN(changed_fields)
WHERE changed_fields IS NOT NULL;
```

## Simple Trigger Implementation

### Generic Revision Trigger Function

```sql
CREATE OR REPLACE FUNCTION create_revision_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields_data JSONB := '{}';
    field_key TEXT;
    old_val JSONB;
    new_val JSONB;
BEGIN
    -- Prepare data based on operation
    CASE TG_OP
        WHEN 'INSERT' THEN
            new_data := to_jsonb(NEW);
            old_data := NULL;
        WHEN 'UPDATE' THEN
            new_data := to_jsonb(NEW);
            old_data := to_jsonb(OLD);

            -- Build changed fields JSON for UPDATE operations
            FOR field_key IN SELECT jsonb_object_keys(old_data)
            LOOP
                old_val := old_data -> field_key;
                new_val := new_data -> field_key;

                -- Only include fields that actually changed
                IF old_val IS DISTINCT FROM new_val THEN
                    changed_fields_data := changed_fields_data ||
                        jsonb_build_object(
                            field_key,
                            jsonb_build_object('old', old_val, 'new', new_val)
                        );
                END IF;
            END LOOP;

        WHEN 'DELETE' THEN
            new_data := NULL;
            old_data := to_jsonb(OLD);
    END CASE;

    -- Insert single revision record with all data
    INSERT INTO revisions (
        table_name,
        record_id,
        operation,
        revision_data,
        changed_fields,
        user_id,
        user_email,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT), -- Assumes 'id' column exists
        TG_OP,
        COALESCE(new_data, old_data),
        CASE WHEN TG_OP = 'UPDATE' AND changed_fields_data != '{}'
             THEN changed_fields_data
             ELSE NULL END,
        current_setting('app.user_id', true),
        current_setting('app.user_email', true),
        current_setting('app.ip_address', true)::INET,
        current_setting('app.user_agent', true)
    );

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the main operation if revision fails
        RAISE WARNING 'Revision trigger failed: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Adding Triggers to Tables

```sql
-- Example: Add revision tracking to users table
CREATE TRIGGER users_revision_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_revision_trigger();

-- Example: Add revision tracking to organizations table
CREATE TRIGGER organizations_revision_trigger
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_revision_trigger();
```

## TypeScript Service Integration

### Simple Revision Service

```typescript
// lib/revision-service.ts
interface Revision {
  id: string;
  tableName: string;
  recordId: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  revisionData: any;
  changedFields?: Record<string, { old: any; new: any }>;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

interface FieldChange {
  fieldName: string;
  oldValue: any;
  newValue: any;
}

export class RevisionService {
  // Get revision history for a record - SINGLE QUERY, NO JOINS!
  async getRevisionHistory(
    tableName: string,
    recordId: string,
    limit = 50
  ): Promise<Revision[]> {
    const query = `
      SELECT 
        id,
        table_name,
        record_id,
        operation,
        revision_data,
        changed_fields,
        user_id,
        user_email,
        ip_address,
        user_agent,
        created_at
      FROM revisions 
      WHERE table_name = $1 AND record_id = $2 
      ORDER BY created_at DESC 
      LIMIT $3
    `;

    const result = await this.db.query(query, [tableName, recordId, limit]);
    return result.rows.map((row) => ({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      operation: row.operation,
      revisionData: row.revision_data,
      changedFields: row.changed_fields,
      userId: row.user_id,
      userEmail: row.user_email,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    }));
  }

  // Get field changes from a revision - extracted from JSONB
  getFieldChanges(revision: Revision): FieldChange[] {
    if (!revision.changedFields) return [];

    return Object.entries(revision.changedFields).map(
      ([fieldName, change]) => ({
        fieldName,
        oldValue: change.old,
        newValue: change.new,
      })
    );
  }

  // Get specific revision with parsed field changes
  async getRevisionDetail(revisionId: string): Promise<{
    revision: Revision;
    fieldChanges: FieldChange[];
  } | null> {
    const query = `
      SELECT 
        id, table_name, record_id, operation, revision_data, changed_fields,
        user_id, user_email, ip_address, user_agent, created_at
      FROM revisions 
      WHERE id = $1
    `;

    const result = await this.db.query(query, [revisionId]);

    if (result.rows.length === 0) return null;

    const revision = result.rows[0];
    const fieldChanges = this.getFieldChanges(revision);

    return { revision, fieldChanges };
  }

  // Find revisions where specific field was changed
  async getRevisionsWithFieldChange(
    tableName: string,
    recordId: string,
    fieldName: string
  ): Promise<Revision[]> {
    const query = `
      SELECT * FROM revisions 
      WHERE table_name = $1 
        AND record_id = $2 
        AND changed_fields ? $3
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [tableName, recordId, fieldName]);
    return result.rows;
  }

  // Restore data to a specific revision
  async restoreToRevision(revisionId: string): Promise<any> {
    const query = "SELECT revision_data FROM revisions WHERE id = $1";
    const result = await this.db.query(query, [revisionId]);

    if (result.rows.length === 0) {
      throw new Error("Revision not found");
    }

    return result.rows[0].revision_data;
  }

  // Get audit trail summary for a record
  async getAuditSummary(tableName: string, recordId: string) {
    const query = `
      SELECT 
        operation,
        COUNT(*) as count,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence,
        array_agg(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as users
      FROM revisions 
      WHERE table_name = $1 AND record_id = $2 
      GROUP BY operation
      ORDER BY last_occurrence DESC
    `;

    const result = await this.db.query(query, [tableName, recordId]);
    return result.rows;
  }

  // Set user context for audit (call before database operations)
  async setUserContext(
    userId: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.db.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    if (userEmail)
      await this.db.query("SELECT set_config('app.user_email', $1, true)", [
        userEmail,
      ]);
    if (ipAddress)
      await this.db.query("SELECT set_config('app.ip_address', $1, true)", [
        ipAddress,
      ]);
    if (userAgent)
      await this.db.query("SELECT set_config('app.user_agent', $1, true)", [
        userAgent,
      ]);
  }
}
```

## Usage Examples

### Setting Up Revision Tracking

```sql
-- 1. Create the single optimized table
-- (Run the schema creation script above)

-- 2. Add triggers to your existing tables
CREATE TRIGGER users_revision_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_revision_trigger();

CREATE TRIGGER organizations_revision_trigger
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_revision_trigger();
```

### Using in Your Application

```typescript
// In your API routes or services
const revisionService = new RevisionService();

// Before making database changes, set user context with all audit info
await revisionService.setUserContext(
  currentUser.id,
  currentUser.email,
  request.ip,
  request.headers["user-agent"]
);

// Make your normal database updates - revisions are automatically created
await updateUser(userId, updatedData);

// Get complete revision history - single query, no joins!
const history = await revisionService.getRevisionHistory("users", userId);

// Get specific revision with parsed field changes
const { revision, fieldChanges } =
  await revisionService.getRevisionDetail(revisionId);

// Find when a specific field was changed
const emailChanges = await revisionService.getRevisionsWithFieldChange(
  "users",
  userId,
  "email"
);

// Get audit summary
const auditSummary = await revisionService.getAuditSummary("users", userId);

// Restore to previous version
const previousData = await revisionService.restoreToRevision(revisionId);
```

## Implementation Steps

1. **Create the single optimized revisions table** with JSONB fields
2. **Create the enhanced trigger function** with changed fields tracking
3. **Add triggers to your tables** (one trigger per table)
4. **Implement the streamlined TypeScript service**
5. **Set comprehensive user context** in your middleware
6. **Query revision data with zero JOINs** in your application

## Simple Cleanup

Periodically clean up old revisions:

```sql
-- Delete revisions older than 2 years
DELETE FROM revisions
WHERE created_at < NOW() - INTERVAL '2 years';
```

## Why Single Table is Superior

**Database Administrator Benefits:**

- ✅ **Zero JOINs**: All revision data in single query - much faster
- ✅ **Reduced I/O**: One table scan instead of multiple
- ✅ **Simpler indexing**: Fewer indexes to maintain
- ✅ **Better caching**: PostgreSQL can cache one table more efficiently
- ✅ **Atomic operations**: All revision data inserted in one transaction
- ✅ **JSONB performance**: PostgreSQL JSONB is highly optimized with GIN indexes

**Query Performance Examples:**

```sql
-- Old approach: Required JOIN
SELECT r.*, fd.field_name, fd.old_value, fd.new_value
FROM revisions r
LEFT JOIN field_deltas fd ON r.id = fd.revision_id
WHERE r.table_name = 'users' AND r.record_id = '123';

-- New approach: Single table query
SELECT * FROM revisions
WHERE table_name = 'users' AND record_id = '123';

-- Find specific field changes with JSONB operators
SELECT * FROM revisions
WHERE table_name = 'users'
  AND record_id = '123'
  AND changed_fields ? 'email';  -- Ultra-fast with GIN index
```

This optimized implementation provides:

- ✅ **Complete row snapshots + field deltas in one record**
- ✅ **Zero-JOIN query patterns** - significantly faster
- ✅ **PostgreSQL JSONB optimization** with GIN indexing
- ✅ **Comprehensive audit metadata** (user, IP, user-agent)
- ✅ **Advanced querying capabilities** (find field-specific changes)
- ✅ **Minimal storage overhead** - JSONB is compressed
- ✅ **Single transaction consistency** - no referential integrity issues
