import { UUID } from "crypto";

export interface SupplierAddressDataType {
  OrganizationAddress: OrganizationAddress[];
}

export interface OrganizationAddress {
  Address: Address;
}

export interface Address {
  id: string;
  ownership_type: string;
  type: string;
  pincode: string;
}

export interface SupplierAddressMappingType {
  id: string;
  org_supplier_master_id: string;
  OrgSupplierMaster: OrgSupplierMaster;
  address_id: string;
  Address: AddressType;
}

export interface OrgSupplierMaster {
  id: string;
  client_master_id: string;
}

export interface AddressType {
  pincode: string;
  client_master_id: string;
  code: string;
}

export interface buyerUpstreamDataType {
  organizationaddress: UUID;
  month: string;
  year: number;
  buyer_name: string;
  buyer_org_id: string;
  instance_buyer_supplier_address_id: string;
  upstream: GHGTransportUpstream[];
  buyerShare: GhgbuyerShare[];
  buyerShareStatus: string;
}

export interface TaskRequest {
  id: string;
  month: string;
  year: number;
  OrganizationAddress: {
    address_id: string;
    Address: {
      name: string;
      pincode: string;
    };
  };
}

export interface GHGTransportUpstream {
  id: string;
  Location_pin_or_zip_code: string | null;
  Supplier_code: string | null;
  Destination_Location_Pincode: string | null;
  TaskRequest: TaskRequest;
}

export interface upStreamDataType {
  GHGTransport_Upstream: GHGTransportUpstream[];
}

export interface buyerType {
  is_deleted: boolean;
  metadata: any;
  status: string;
  buyer_org_id: UUID;
  id: string;
  supplier_org_id: UUID;
  instance_supplier_address_id: UUID;
  instance_buyer_supplier_address_id: UUID;
}
export interface buyerShareDataType {
  Organization: Organization[];
  TaskRequest: TaskRequestType[];
}

export interface Organization {
  metadata: Metadaum[];
}

export interface Metadaum {
  BuyerShareMethod: string;
}

export interface TaskRequestType {
  GHGBuyer_Shares: GhgbuyerShare[];
}

export interface GhgbuyerShare {
  Buyer_Name: string;
  method: string;
  by_mass_Mass_of_Products_Purchased: number;
  by_mass_Total_Mass_of_Products_Produced: number;
  by_volume_Volume_of_Products_Purchased: any;
  by_volume_Total_Volume_of_Products_Purchased: any;
  by_revenue_Market_Value_of_Products_Purchased: any;
  by_revenue_Total_Market_Value_of_Products_Produced: any;
  by_number_of_units_Number_of_Units_Purchased: any;
  by_number_of_units_Total_Number_of_Units_Produced: any;
}
