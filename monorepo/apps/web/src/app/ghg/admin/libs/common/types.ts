export type TGetUserConversionFactorsSuccess = {
  success: boolean;
  data: {
    uomConversionFactors: {
      id: string;
      from_uom: string;
      to_uom: string;
      from_uom_code: string | null | undefined;
      to_uom_code: string | null | undefined;
      factor: any;
      fuel: string;
      original: {
        id: any;
        from_key: string;
        to_key: string;
        factor: any;
        metadata?: any;
        created_at: any;
        created_by?: any;
        updated_at: any;
        updated_by?: any;
      };
    }[];
    uomMasters: {
      key?: string | null;
      code?: string | null;
      label?: string | null;
      alias?: any | null;
    }[];
  };
  error: any;
};

export type Co2EmissionFactorMasterListData = {
  id: string;
  year: number;
  month: string;
  geography: string;
  category: string;
  activity: string;
  sub_activity: string;
  type?: string;
  sub_type?: string;
  factor: number;
  factor_uom: string;
  metadata?: Record<string, any>[];
  isDefault: string;
  activitySpecific: string;
};

export type Co2EmissionFactorMaterialMasterListData = {
  id: string;
  year: number;
  month: string;
  geography: string;
  activity: string;
  factor: number;
  factor_uom: string;
  organization_id: string;
  organizationName: string;
  metadata?: Record<string, any>[];
  isDefault: string;
  activitySpecific: string;
};
