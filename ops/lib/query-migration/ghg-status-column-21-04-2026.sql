
-- ─── Monthly Activity Summary — Add status to GHG tables : 21-04-2026 ────────
-- RULE-007 extended to GHG rows: NULL/'pending'/'saved' = Pending, 'approved', 'rejected'
-- Mirrors the status lifecycle already on ActivityTaskRequest.
-- After this migration the monthly-activity-summary counts individual GHG rows
-- (not ATR rows) and approval propagates status to each linked GHG row.

ALTER TABLE "GHGWaste"                           
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGWaste"                           
ADD CONSTRAINT "GHGWaste_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGProductionDetails"               
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGProductionDetails"               
ADD CONSTRAINT "GHGProductionDetails_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGEnergyConsumption_FuelPurchased" 
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGEnergyConsumption_FuelPurchased" 
ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGEnergyConsumption_GridPower"     
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGEnergyConsumption_GridPower"     
ADD CONSTRAINT "GHGEnergyConsumption_GridPower_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGEnergy_CaptivePower"             
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGEnergy_CaptivePower"             
ADD CONSTRAINT "GHGEnergy_CaptivePower_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGTransport_Upstream"              
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGTransport_Upstream"              
ADD CONSTRAINT "GHGTransport_Upstream_status_check" CHECK (status IN ('saved','approved','rejected'));




ALTER TABLE "GHGTransport_Downstream"            
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGTransport_Downstream"            
ADD CONSTRAINT "GHGTransport_Downstream_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGTransport_EmployeeTravel"        
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGTransport_EmployeeTravel"        
ADD CONSTRAINT "GHGTransport_EmployeeTravel_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGTransport_BusinessTravel"        
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGTransport_BusinessTravel"        
ADD CONSTRAINT "GHGTransport_BusinessTravel_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGGeneralDetails"                  
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGGeneralDetails"                  
ADD CONSTRAINT "GHGGeneralDetails_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGBuyer_Share"                     
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGBuyer_Share"                     
ADD CONSTRAINT "GHGBuyer_Share_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGMaterialProcurement"             
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGMaterialProcurement"             
ADD CONSTRAINT "GHGMaterialProcurement_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGCapital_Goods"                   
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGCapital_Goods"                   
ADD CONSTRAINT "GHGCapital_Goods_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGProductShareAttribution"        
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGProductShareAttribution"         
ADD CONSTRAINT "GHGProductShareAttribution_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGFreshWater"                      
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGFreshWater"                      
ADD CONSTRAINT "GHGFreshWater_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGWasteWater"                      
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGWasteWater"                      
ADD CONSTRAINT "GHGWasteWater_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGHarvestedWater"                  
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGHarvestedWater"                  
ADD CONSTRAINT "GHGHarvestedWater_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGWaterWithdrawal"                 
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGWaterWithdrawal"                 
ADD CONSTRAINT "GHGWaterWithdrawal_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGWastewaterGeneration"            
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGWastewaterGeneration"            
ADD CONSTRAINT "GHGWastewaterGeneration_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGWasteWaterTreatment"             
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGWasteWaterTreatment"             
ADD CONSTRAINT "GHGWasteWaterTreatment_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGRefrigerantAndACSystems"         
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGRefrigerantAndACSystems"         
ADD CONSTRAINT "GHGRefrigerantAndACSystems_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGFireExtinguisher"                
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGFireExtinguisher"                
ADD CONSTRAINT "GHGFireExtinguisher_status_check" CHECK (status IN ('saved','approved','rejected'));

ALTER TABLE "GHGIndustrialGas"                   
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE "GHGIndustrialGas"                   
ADD constraint "GHGIndustrialGas_status_check" CHECK (status IN ('saved','approved','rejected'));














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


-- Normalize capital-P 'Pending' to NULL
UPDATE "ActivityTaskRequest"
SET status = NULL
WHERE status = 'Pending';

-- Now add the constraint
ALTER TABLE "ActivityTaskRequest"
DROP CONSTRAINT IF EXISTS "ActivityTaskRequest_status_check";

ALTER TABLE "ActivityTaskRequest"
ADD CONSTRAINT "ActivityTaskRequest_status_check"
CHECK (status IN ('saved', 'approved', 'rejected'));


COMMENT ON COLUMN "ActivityTaskRequest".status IS
  'Allowed values: saved | approved | rejected.
   saved    – data entered but not yet reviewed (default on insert).
   approved – approved by an OrganizationAdmin; record is locked.
   rejected – reserved for future use (no reject workflow in V1).';