-- Migration: ActivityTaskRequest.status — default, constraint, comment
-- 1. Backfill existing NULL / 'pending' rows to 'saved'
-- 2. Set column DEFAULT to 'saved'
-- 3. Add CHECK constraint (saved | approved | rejected)
-- 4. Add column comment

UPDATE "ActivityTaskRequest"
SET status = 'saved'
WHERE status IS NULL OR status = 'pending';
--> statement-breakpoint

ALTER TABLE "ActivityTaskRequest"
  ALTER COLUMN status SET DEFAULT 'saved';
--> statement-breakpoint

ALTER TABLE "ActivityTaskRequest"
  ADD CONSTRAINT "ActivityTaskRequest_status_check"
  CHECK (status IN ('saved', 'approved', 'rejected'));
--> statement-breakpoint

COMMENT ON COLUMN "ActivityTaskRequest".status IS
  'Allowed values: saved | approved | rejected.
   saved    – data entered but not yet reviewed (default on insert).
   approved – approved by an OrganizationAdmin; record is locked.
   rejected – reserved for future use (no reject workflow in V1).';
