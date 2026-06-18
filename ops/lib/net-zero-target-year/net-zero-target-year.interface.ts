export interface INetZeroTargetYearInput {
  mechanism_type: string;
  baseline_year: string;
  targets: ITarget[];
}

export interface ITarget {
  uuid: string;
  target_year: string;
  reduction_percentage: string;
}

export interface IEmissionReductionPlan {
  mechanism_type: string;
  targets: ITarget[];
  baseline_year: string;
}

export interface IOrganization {
  id: string;
  name: string;
  Baselineyear: string | number | null;
  FinancialYearMonth: string | null;
  metadata: Record<string, any> | null;
  net_zero_metadata: IEmissionReductionPlan | null;
}
