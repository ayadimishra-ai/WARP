import { pgTable, pgView, uuid, timestamp, text, jsonb, boolean } from "drizzle-orm/pg-core"



export const SupplierInvitations = pgTable("SupplierInvitations", {
	id: uuid("id").defaultRandom().notNull(),
	inviter_org_id: uuid("inviter_org_id").notNull(),
	invitee_org_id: uuid("invitee_org_id").notNull(),
	invitation_date_time: timestamp("invitation_date_time", { withTimezone: true, mode: 'string' }),
	status: text("status"),
	metadata: jsonb("metadata"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
});

export const BuyerSupplierAddressMappings = pgTable("BuyerSupplierAddressMappings", {
	id: uuid("id").defaultRandom().notNull(),
	buyer_org_id: uuid("buyer_org_id").notNull(),
	supplier_org_id: uuid("supplier_org_id").notNull(),
	instance_buyer_supplier_address_id: uuid("instance_buyer_supplier_address_id").notNull(),
	instance_supplier_address_id: uuid("instance_supplier_address_id").notNull(),
	status: text("status").notNull(),
	metadata: jsonb("metadata"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
});

export const EmailTemplates = pgTable("EmailTemplates", {
	id: uuid("id").defaultRandom().notNull(),
	org_id: uuid("org_id"),
	name: text("name"),
	type: text("type"),
	template: text("template"),
	metadata: jsonb("metadata"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
});

export const GlobalConfigs = pgTable("GlobalConfigs", {
	id: uuid("id").defaultRandom().notNull(),
	org_id: uuid("org_id"),
	type: text("type").notNull(),
	configuration: jsonb("configuration"),
	metadata: jsonb("metadata"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
});

export const Organizations = pgTable("Organizations", {
	id: uuid("id").defaultRandom().notNull(),
	instance_org_id: uuid("instance_org_id").notNull(),
	name: text("name"),
	status: text("status"),
	metadata: jsonb("metadata"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
});

export const OrganizationInstances = pgTable("OrganizationInstances", {
	id: uuid("id").defaultRandom().notNull(),
	org_id: uuid("org_id").notNull(),
	status: text("status"),
	is_deleted: boolean("is_deleted").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	created_by: uuid("created_by"),
	updated_by: uuid("updated_by"),
	metadata: jsonb("metadata"),
	configuration: jsonb("configuration"),
});

export const ViewPageDataSupplierMasterMaterialMapping = pgView(
  "view_page_data_supplier_master_material_mapping",
  {
    organization_id: uuid("organization_id"),
    supplier_material_mapping_id: uuid("supplier_material_mapping_id"),
    org_material_master_id: uuid("org_material_master_id"),
    supplier_address_mapping_id: uuid("supplier_address_mapping_id"),
    supplier_code_name: text("supplier_code_name"),
    supplier_address_code_name: text("supplier_address_code_name"),
    material_master_code_name: text("material_master_code_name"),
    from_period: text("from_period"),
    to_period: text("to_period"),
  }
).existing();