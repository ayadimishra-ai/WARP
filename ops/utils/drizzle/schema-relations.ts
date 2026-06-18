import { relations } from "drizzle-orm/relations";
import {
  BuyerSupplierAddressMappings,
  EmailTemplates,
  GlobalConfigs,
  OrganizationInstances,
  Organizations,
  SupplierInvitations,
} from "./schema";

export const OrganizationInstancesRelations = relations(
  OrganizationInstances,
  ({ one }) => ({
    organization: one(Organizations, {
      fields: [OrganizationInstances.org_id],
      references: [Organizations.id],
    }),
  })
);

export const GlobalConfigsRelations = relations(GlobalConfigs, ({ one }) => ({
  organization: one(Organizations, {
    fields: [GlobalConfigs.org_id],
    references: [Organizations.id],
  }),
}));

export const EmailTemplatesRelations = relations(EmailTemplates, ({ one }) => ({
  organization: one(Organizations, {
    fields: [EmailTemplates.org_id],
    references: [Organizations.id],
  }),
}));

export const SupplierInvitationsRelations = relations(
  SupplierInvitations,
  ({ one }) => ({
    invitee_organization: one(Organizations, {
      fields: [SupplierInvitations.invitee_org_id],
      references: [Organizations.id],
    }),
    inviter_organization: one(Organizations, {
      fields: [SupplierInvitations.inviter_org_id],
      references: [Organizations.id],
    }),
  })
);

export const BuyerSupplierAddressMappingsRelations = relations(
  BuyerSupplierAddressMappings,
  ({ one }) => ({
    buyer_organization: one(Organizations, {
      fields: [BuyerSupplierAddressMappings.buyer_org_id],
      references: [Organizations.id],
    }),
    supplier_organization: one(Organizations, {
      fields: [BuyerSupplierAddressMappings.supplier_org_id],
      references: [Organizations.id],
    }),
  })
);
