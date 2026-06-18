# ClickHouse Data Revisions & Audit System

## Overview

A high-performance data revision and audit system using ClickHouse as the analytical database for storing data changes, revisions, and audit logs. This system complements the existing PostgreSQL operational database by providing optimized analytics and historical data tracking.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Next.js API   │    │   ClickHouse    │
│ (Operational)   │───▶│  (Business      │───▶│  (Analytics)    │
│ - Live Data     │    │   Logic)        │    │ - Revisions     │
│ - CRUD Ops      │    │ - Triggers      │    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Principles

1. **Single ClickHouse Table**: Minimal schema with JSONB-like String fields
2. **Snapshot + Delta Pattern**: Complete data snapshot + changed fields only
3. **Performance Optimized**: Leverage ClickHouse columnar storage
4. **Minimal Overhead**: Asynchronous data insertion to ClickHouse
5. **Simple Queries**: Easy retrieval with ClickHouse SQL capabilities

---

## ClickHouse Database Schema

### 1. Single Revisions Table (Minimal Design)

```sql
-- Create the revisions table in ClickHouse
CREATE TABLE revisions (
    -- Primary identifiers
    id String DEFAULT generateUUIDv4(),
    table_name String,
    record_id String,
    operation Enum8('INSERT' = 1, 'UPDATE' = 2, 'DELETE' = 3),

    -- Complete row snapshot (JSON as String)
    data String,

    -- Delta changes for UPDATE operations (JSON as String)
    delta String,

    -- Audit metadata
    user_id Nullable(String),
    user_email Nullable(String),
    organization_id Nullable(String),
    ip_address Nullable(String),
    user_agent Nullable(String),

    -- Timestamps
    created_at DateTime64(3) DEFAULT now64(),
    created_date Date DEFAULT toDate(created_at)

) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (table_name, record_id, created_at)
SETTINGS index_granularity = 8192;

-- Create indexes for better query performance
CREATE INDEX idx_table_record ON revisions (table_name, record_id) TYPE minmax GRANULARITY 1;
CREATE INDEX idx_user ON revisions (user_id) TYPE set(100) GRANULARITY 1;
CREATE INDEX idx_operation ON revisions (operation) TYPE set(3) GRANULARITY 1;
```

---

## TypeScript Implementation

### 1. ClickHouse Client Configuration

```typescript
// lib/clickhouse/client.ts
import { createClient } from "@clickhouse/client";
import { serverEnv } from "~/utils/env/env.server";

let clickhouseClient: ReturnType<typeof createClient> | null = null;

export const getClickHouseClient = () => {
  if (!clickhouseClient) {
    clickhouseClient = createClient({
      url: serverEnv.CLICKHOUSE_HOST,
      username: serverEnv.CLICKHOUSE_USER,
      password: serverEnv.CLICKHOUSE_PASSWORD,
      database: "audit_db", // Separate database for audit data
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 0,
      },
    });
  }
  return clickhouseClient;
};
```

### 2. Revision Service

```typescript
// lib/audit/revision.service.ts
import { getClickHouseClient } from "../clickhouse/client";

export interface RevisionData {
  table_name: string;
  record_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: Record<string, any>;
  delta?: Record<string, any>;
  user_id?: string;
  user_email?: string;
  organization_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export class RevisionService {
  private client = getClickHouseClient();

  /**
   * Save revision to ClickHouse (Async - Non-blocking)
   */
  async saveRevision(revisionData: RevisionData): Promise<void> {
    try {
      await this.client.insert({
        table: "revisions",
        values: [
          {
            table_name: revisionData.table_name,
            record_id: revisionData.record_id,
            operation: revisionData.operation,
            data: JSON.stringify(revisionData.data),
            delta: revisionData.delta ? JSON.stringify(revisionData.delta) : "",
            user_id: revisionData.user_id || null,
            user_email: revisionData.user_email || null,
            organization_id: revisionData.organization_id || null,
            ip_address: revisionData.ip_address || null,
            user_agent: revisionData.user_agent || null,
          },
        ],
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("Failed to save revision to ClickHouse:", error);
      // Don't throw - revision failure shouldn't break main operation
    }
  }

  /**
   * Get revision history for a specific record
   */
  async getRecordHistory(
    tableName: string,
    recordId: string,
    limit: number = 50
  ): Promise<any[]> {
    const result = await this.client.query({
      query: `
        SELECT 
          id,
          operation,
          data,
          delta,
          user_email,
          created_at
        FROM revisions 
        WHERE table_name = {tableName:String} 
          AND record_id = {recordId:String}
        ORDER BY created_at DESC 
        LIMIT {limit:UInt32}
      `,
      query_params: {
        tableName,
        recordId,
        limit,
      },
    });

    return result.json();
  }

  /**
   * Get field-specific change history
   */
  async getFieldHistory(
    tableName: string,
    recordId: string,
    fieldName: string
  ): Promise<any[]> {
    const result = await this.client.query({
      query: `
        SELECT 
          operation,
          JSONExtractString(delta, {fieldName:String}) as field_change,
          user_email,
          created_at
        FROM revisions 
        WHERE table_name = {tableName:String} 
          AND record_id = {recordId:String}
          AND operation = 'UPDATE'
          AND JSONHas(delta, {fieldName:String})
        ORDER BY created_at DESC
      `,
      query_params: {
        tableName,
        recordId,
        fieldName,
      },
    });

    return result.json();
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(
    userId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any[]> {
    const result = await this.client.query({
      query: `
        SELECT 
          table_name,
          operation,
          count() as change_count
        FROM revisions 
        WHERE user_id = {userId:String}
          AND created_at BETWEEN {fromDate:DateTime64} AND {toDate:DateTime64}
        GROUP BY table_name, operation
        ORDER BY change_count DESC
      `,
      query_params: {
        userId,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      },
    });

    return result.json();
  }

  /**
   * Get organizational audit summary
   */
  async getOrganizationAudit(
    organizationId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<any[]> {
    const result = await this.client.query({
      query: `
        SELECT 
          toDate(created_at) as date,
          table_name,
          operation,
          count() as change_count,
          uniqExact(user_id) as unique_users
        FROM revisions 
        WHERE organization_id = {organizationId:String}
          AND created_at BETWEEN {fromDate:DateTime64} AND {toDate:DateTime64}
        GROUP BY date, table_name, operation
        ORDER BY date DESC, change_count DESC
      `,
      query_params: {
        organizationId,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      },
    });

    return result.json();
  }
}
```

### 3. Business Logic Integration

```typescript
// lib/audit/audit-middleware.ts
import { RevisionService } from "./revision.service";
import { getClientIP } from "~/utils/common-functions";

export interface AuditContext {
  user_id?: string;
  user_email?: string;
  organization_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditMiddleware {
  private revisionService = new RevisionService();

  /**
   * Wrap database operations with audit logging
   */
  async withAudit<T>(
    operation: () => Promise<T>,
    auditData: {
      table_name: string;
      record_id: string;
      operation_type: "INSERT" | "UPDATE" | "DELETE";
      old_data?: Record<string, any>;
      new_data?: Record<string, any>;
    },
    context: AuditContext
  ): Promise<T> {
    // Execute the main operation
    const result = await operation();

    // Prepare revision data
    const revisionData = {
      table_name: auditData.table_name,
      record_id: auditData.record_id,
      operation: auditData.operation_type,
      data: auditData.new_data || auditData.old_data || {},
      ...context,
    };

    // Calculate delta for UPDATE operations
    if (
      auditData.operation_type === "UPDATE" &&
      auditData.old_data &&
      auditData.new_data
    ) {
      revisionData.delta = this.calculateDelta(
        auditData.old_data,
        auditData.new_data
      );
    }

    // Save to ClickHouse asynchronously
    this.revisionService.saveRevision(revisionData).catch(console.error);

    return result;
  }

  /**
   * Calculate field-level changes
   */
  private calculateDelta(
    oldData: Record<string, any>,
    newData: Record<string, any>
  ): Record<string, any> {
    const delta: Record<string, any> = {};

    // Check for changed fields
    for (const key of Object.keys(newData)) {
      if (oldData[key] !== newData[key]) {
        delta[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    }

    // Check for removed fields
    for (const key of Object.keys(oldData)) {
      if (!(key in newData)) {
        delta[key] = {
          old: oldData[key],
          new: null,
        };
      }
    }

    return delta;
  }
}
```

---

## API Integration Examples

### 1. Server Actions with Audit

```typescript
// app/actions/users.ts
"use server";

import { revalidatePath } from "next/cache";
import { AuditMiddleware } from "~/lib/audit/audit-middleware";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { getServerSession } from "next-auth";

export async function updateUser(userId: string, userData: any) {
  const session = await getServerSession();
  const dbContext = await GetOPSDBContext();
  const auditMiddleware = new AuditMiddleware();

  // Get current user data
  const currentUser = await dbContext.query.Users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Update with audit
  const result = await auditMiddleware.withAudit(
    async () => {
      return await dbContext
        .update(Users)
        .set(userData)
        .where(eq(Users.id, userId))
        .returning();
    },
    {
      table_name: "Users",
      record_id: userId,
      operation_type: "UPDATE",
      old_data: currentUser,
      new_data: { ...currentUser, ...userData },
    },
    {
      user_id: session?.user?.id,
      user_email: session?.user?.email,
      organization_id: session?.user?.organizationId,
    }
  );

  revalidatePath("/admin/users");
  return result;
}
```

### 2. API Route with Audit

```typescript
// app/api/v1/organizations/[id]/route.ts
import { NextRequest, NextResponse } from "next/next";
import { AuditMiddleware } from "~/lib/audit/audit-middleware";
import { getClientIP } from "~/utils/common-functions";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  const auditMiddleware = new AuditMiddleware();
  const data = await req.json();

  const result = await auditMiddleware.withAudit(
    async () => {
      // Your update logic here
      return await updateOrganization(params.id, data);
    },
    {
      table_name: "Organizations",
      record_id: params.id,
      operation_type: "UPDATE",
      old_data: currentOrgData,
      new_data: data,
    },
    {
      user_id: session?.user?.id,
      user_email: session?.user?.email,
      organization_id: session?.user?.organizationId,
      ip_address: getClientIP(req),
      user_agent: req.headers.get("user-agent") || undefined,
    }
  );

  return NextResponse.json(result);
}
```

---

## Query Examples

### 1. Get Record History

```typescript
// components/audit/record-history.tsx
import { RevisionService } from '~/lib/audit/revision.service';

export async function RecordHistory({ tableName, recordId }: Props) {
  const revisionService = new RevisionService();
  const history = await revisionService.getRecordHistory(tableName, recordId);

  return (
    <div>
      {history.map((revision) => (
        <div key={revision.id}>
          <p>{revision.operation} by {revision.user_email}</p>
          <p>{new Date(revision.created_at).toLocaleString()}</p>
          {revision.delta && (
            <pre>{JSON.stringify(JSON.parse(revision.delta), null, 2)}</pre>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. Audit Dashboard

```typescript
// app/admin/audit/page.tsx
import { RevisionService } from '~/lib/audit/revision.service';

export default async function AuditDashboard() {
  const revisionService = new RevisionService();
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const toDate = new Date();

  const auditSummary = await revisionService.getOrganizationAudit(
    'org-id',
    fromDate,
    toDate
  );

  return (
    <div>
      <h1>Audit Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Table</th>
            <th>Operation</th>
            <th>Changes</th>
            <th>Users</th>
          </tr>
        </thead>
        <tbody>
          {auditSummary.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.table_name}</td>
              <td>{row.operation}</td>
              <td>{row.change_count}</td>
              <td>{row.unique_users}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Cleanup & Maintenance

### 1. Data Retention Policy

```sql
-- Delete revisions older than 2 years
ALTER TABLE revisions DELETE WHERE created_at < now() - INTERVAL 2 YEAR;

-- Or use TTL for automatic cleanup
ALTER TABLE revisions MODIFY TTL created_at + INTERVAL 2 YEAR;
```

### 2. Performance Optimization

```sql
-- Optimize partitions
OPTIMIZE TABLE revisions PARTITION '202410';

-- Check table statistics
SELECT
    table,
    partition,
    formatReadableSize(sum(bytes_on_disk)) as size,
    count() as parts
FROM system.parts
WHERE table = 'revisions'
GROUP BY table, partition;
```

---

## Implementation Checklist

### Phase 1: Basic Setup

- [ ] Create ClickHouse database and revisions table
- [ ] Implement ClickHouse client configuration
- [ ] Create basic RevisionService class
- [ ] Test connection and basic insert operations

### Phase 2: Business Logic Integration

- [ ] Implement AuditMiddleware wrapper
- [ ] Add audit support to critical operations (Users, Organizations)
- [ ] Test with real data operations
- [ ] Implement error handling and retry logic

### Phase 3: Analytics & Reporting

- [ ] Implement audit dashboard components
- [ ] Add field-level change tracking
- [ ] Performance optimization and indexing

### Phase 4: Advanced Features

- [ ] Real-time audit alerts
- [ ] Export functionality
- [ ] Advanced filtering and search
- [ ] Compliance reporting

---

## Benefits of This Approach

### Performance Benefits

- ✅ **ClickHouse Columnar Storage**: Excellent for analytical queries
- ✅ **Asynchronous Inserts**: No impact on main application performance
- ✅ **Partitioning**: Time-based partitions for efficient queries
- ✅ **Minimal Schema**: Simple design with maximum flexibility

### Operational Benefits

- ✅ **Non-blocking**: Audit failures don't affect main operations
- ✅ **Scalable**: ClickHouse handles large volumes efficiently
- ✅ **Cost-effective**: Separate analytical database for audit data
- ✅ **Flexible Queries**: Rich SQL capabilities for complex analysis

### Developer Benefits

- ✅ **Simple Integration**: Easy to add audit to existing operations
- ✅ **JSON Flexibility**: Store any data structure in data/delta fields
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Clean Separation**: Audit logic separated from business logic

This design provides a robust, performant, and maintainable audit system that leverages ClickHouse's strengths while keeping the implementation simple and focused.
