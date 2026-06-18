import { UUID } from "crypto";

export const BuyerActivityStatus = {
  Completed: "completed",
  Pending: "pending",
  na: "na",
} as const;
export type Status = "completed" | "pending" | "na";

export const recordStatus = {
  Completed: "Completed",
  Pending: "Pending",
  NotApplicable: "Not Applicable",
};

export const buyerShareMethod = {
  by_mass: "by_mass",
  by_volume: "by_volume",
  by_revenue: "by_revenue",
  by_number_of_units: "by_number_of_units",
};

// Define the DataLog type

export type DataLog = {
  location: string;
  month: string;
  material_procurement: string;
  energy_fuel_purchased: string;
  energy_grid_power: string;
  energy_captive_power: string;
  waste: string;
  transport_upstream: string;
  general: string;
  production: string;
  transport_downstream: string;
  transport_employee_travel: string;
  transport_business_travel: string;
  buyer_share: number;
  organizationaddress: string;
  assesmentstatus: string;
};

// Define status icons
export type FilterCount = {
  total_count: number;
  completed: number;
  pending: number;
};

export type LocationDetails = {
  OrganizationId: UUID;
  organizationaddress: UUID;
  month: string;
  year: number;
};
export interface BuyerSupplierAddressMappingsType {
  buyer_org_id: string;
  id: string;
  instance_buyer_supplier_address_id: string;
  instance_supplier_address_id: string;
  supplier_org_id: string;
}
