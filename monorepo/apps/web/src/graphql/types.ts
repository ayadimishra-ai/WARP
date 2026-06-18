export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  bigint: { input: any; output: any };
  bpchar: { input: any; output: any };
  jsonb: { input: any; output: any };
  numeric: { input: any; output: any };
  timestamp: { input: any; output: any };
  timestamptz: { input: any; output: any };
  uuid: { input: any; output: any };
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Int"]["input"]>;
  _gt?: InputMaybe<Scalars["Int"]["input"]>;
  _gte?: InputMaybe<Scalars["Int"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Int"]["input"]>;
  _lte?: InputMaybe<Scalars["Int"]["input"]>;
  _neq?: InputMaybe<Scalars["Int"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Int"]["input"]>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["String"]["input"]>;
  _gt?: InputMaybe<Scalars["String"]["input"]>;
  _gte?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["String"]["input"]>;
  _in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["String"]["input"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["String"]["input"]>;
  _lt?: InputMaybe<Scalars["String"]["input"]>;
  _lte?: InputMaybe<Scalars["String"]["input"]>;
  _neq?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["String"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["String"]["input"]>;
};

/** columns and relationships of "Tbl_Addresses" */
export type Tbl_Addresses = {
  __typename?: "Tbl_Addresses";
  AddressGuid: Scalars["uuid"]["output"];
  AddressLine1?: Maybe<Scalars["String"]["output"]>;
  AddressLine2?: Maybe<Scalars["String"]["output"]>;
  AddressLine3?: Maybe<Scalars["String"]["output"]>;
  AddressTitle?: Maybe<Scalars["String"]["output"]>;
  AddressTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  AliasGuid?: Maybe<Scalars["uuid"]["output"]>;
  CPanelAddressId?: Maybe<Scalars["String"]["output"]>;
  CityGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  FaxNo?: Maybe<Scalars["String"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  IsDefault?: Maybe<Scalars["Boolean"]["output"]>;
  IsLocationUnderScope?: Maybe<Scalars["Boolean"]["output"]>;
  IsManufacturing?: Maybe<Scalars["Boolean"]["output"]>;
  IsVerified?: Maybe<Scalars["Boolean"]["output"]>;
  LandMark?: Maybe<Scalars["String"]["output"]>;
  Location?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSAddressId?: Maybe<Scalars["String"]["output"]>;
  OwnershipType?: Maybe<Scalars["String"]["output"]>;
  POBoxNumber?: Maybe<Scalars["String"]["output"]>;
  PhoneNo?: Maybe<Scalars["String"]["output"]>;
  StateGuid?: Maybe<Scalars["uuid"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An array relationship */
  Tbl_UserLocationActivityMappings: Array<Tbl_UserLocationActivityMapping>;
  /** An aggregate relationship */
  Tbl_UserLocationActivityMappings_aggregate: Tbl_UserLocationActivityMapping_Aggregate;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  VerifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  Zipcode?: Maybe<Scalars["String"]["output"]>;
};

/** columns and relationships of "Tbl_Addresses" */
export type Tbl_AddressesTbl_UserLocationActivityMappingsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Addresses" */
export type Tbl_AddressesTbl_UserLocationActivityMappings_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

/** aggregated selection of "Tbl_Addresses" */
export type Tbl_Addresses_Aggregate = {
  __typename?: "Tbl_Addresses_aggregate";
  aggregate?: Maybe<Tbl_Addresses_Aggregate_Fields>;
  nodes: Array<Tbl_Addresses>;
};

export type Tbl_Addresses_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_Addresses_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_Addresses_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_Addresses_Aggregate_Bool_Exp_Count>;
};

export type Tbl_Addresses_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_Addresses_Select_Column_Tbl_Addresses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Addresses_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_Addresses_Select_Column_Tbl_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Addresses_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_Addresses" */
export type Tbl_Addresses_Aggregate_Fields = {
  __typename?: "Tbl_Addresses_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Addresses_Max_Fields>;
  min?: Maybe<Tbl_Addresses_Min_Fields>;
};

/** aggregate fields of "Tbl_Addresses" */
export type Tbl_Addresses_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_Addresses" */
export type Tbl_Addresses_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_Addresses_Max_Order_By>;
  min?: InputMaybe<Tbl_Addresses_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_Addresses" */
export type Tbl_Addresses_Arr_Rel_Insert_Input = {
  data: Array<Tbl_Addresses_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Addresses_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_Addresses". All fields are combined with a logical 'AND'. */
export type Tbl_Addresses_Bool_Exp = {
  AddressGuid?: InputMaybe<Uuid_Comparison_Exp>;
  AddressLine1?: InputMaybe<String_Comparison_Exp>;
  AddressLine2?: InputMaybe<String_Comparison_Exp>;
  AddressLine3?: InputMaybe<String_Comparison_Exp>;
  AddressTitle?: InputMaybe<String_Comparison_Exp>;
  AddressTypeGuid?: InputMaybe<Uuid_Comparison_Exp>;
  AliasGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CPanelAddressId?: InputMaybe<String_Comparison_Exp>;
  CityGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  FaxNo?: InputMaybe<String_Comparison_Exp>;
  GSTNumber?: InputMaybe<String_Comparison_Exp>;
  IsDefault?: InputMaybe<Boolean_Comparison_Exp>;
  IsLocationUnderScope?: InputMaybe<Boolean_Comparison_Exp>;
  IsManufacturing?: InputMaybe<Boolean_Comparison_Exp>;
  IsVerified?: InputMaybe<Boolean_Comparison_Exp>;
  LandMark?: InputMaybe<String_Comparison_Exp>;
  Location?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  OPSAddressId?: InputMaybe<String_Comparison_Exp>;
  OwnershipType?: InputMaybe<String_Comparison_Exp>;
  POBoxNumber?: InputMaybe<String_Comparison_Exp>;
  PhoneNo?: InputMaybe<String_Comparison_Exp>;
  StateGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserLocationActivityMappings?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
  Tbl_UserLocationActivityMappings_aggregate?: InputMaybe<Tbl_UserLocationActivityMapping_Aggregate_Bool_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  VerifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  Zipcode?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_Addresses_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Addresses_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_Addresses" */
export enum Tbl_Addresses_Constraint {
  /** unique or primary key constraint on columns "AddressGuid" */
  TblAddressesPkey = "Tbl_Addresses_pkey"
}

/** input type for inserting data into table "Tbl_Addresses" */
export type Tbl_Addresses_Insert_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressLine1?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine2?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine3?: InputMaybe<Scalars["String"]["input"]>;
  AddressTitle?: InputMaybe<Scalars["String"]["input"]>;
  AddressTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AliasGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CPanelAddressId?: InputMaybe<Scalars["String"]["input"]>;
  CityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  FaxNo?: InputMaybe<Scalars["String"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocationUnderScope?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LandMark?: InputMaybe<Scalars["String"]["input"]>;
  Location?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSAddressId?: InputMaybe<Scalars["String"]["input"]>;
  OwnershipType?: InputMaybe<Scalars["String"]["input"]>;
  POBoxNumber?: InputMaybe<Scalars["String"]["input"]>;
  PhoneNo?: InputMaybe<Scalars["String"]["input"]>;
  StateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserLocationActivityMappings?: InputMaybe<Tbl_UserLocationActivityMapping_Arr_Rel_Insert_Input>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  VerifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  Zipcode?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_Addresses_Max_Fields = {
  __typename?: "Tbl_Addresses_max_fields";
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  AddressLine1?: Maybe<Scalars["String"]["output"]>;
  AddressLine2?: Maybe<Scalars["String"]["output"]>;
  AddressLine3?: Maybe<Scalars["String"]["output"]>;
  AddressTitle?: Maybe<Scalars["String"]["output"]>;
  AddressTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  AliasGuid?: Maybe<Scalars["uuid"]["output"]>;
  CPanelAddressId?: Maybe<Scalars["String"]["output"]>;
  CityGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  FaxNo?: Maybe<Scalars["String"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  LandMark?: Maybe<Scalars["String"]["output"]>;
  Location?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSAddressId?: Maybe<Scalars["String"]["output"]>;
  OwnershipType?: Maybe<Scalars["String"]["output"]>;
  POBoxNumber?: Maybe<Scalars["String"]["output"]>;
  PhoneNo?: Maybe<Scalars["String"]["output"]>;
  StateGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  VerifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  Zipcode?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_Addresses" */
export type Tbl_Addresses_Max_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  AddressLine1?: InputMaybe<Order_By>;
  AddressLine2?: InputMaybe<Order_By>;
  AddressLine3?: InputMaybe<Order_By>;
  AddressTitle?: InputMaybe<Order_By>;
  AddressTypeGuid?: InputMaybe<Order_By>;
  AliasGuid?: InputMaybe<Order_By>;
  CPanelAddressId?: InputMaybe<Order_By>;
  CityGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  FaxNo?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  LandMark?: InputMaybe<Order_By>;
  Location?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSAddressId?: InputMaybe<Order_By>;
  OwnershipType?: InputMaybe<Order_By>;
  POBoxNumber?: InputMaybe<Order_By>;
  PhoneNo?: InputMaybe<Order_By>;
  StateGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  VerifiedBy?: InputMaybe<Order_By>;
  Zipcode?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_Addresses_Min_Fields = {
  __typename?: "Tbl_Addresses_min_fields";
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  AddressLine1?: Maybe<Scalars["String"]["output"]>;
  AddressLine2?: Maybe<Scalars["String"]["output"]>;
  AddressLine3?: Maybe<Scalars["String"]["output"]>;
  AddressTitle?: Maybe<Scalars["String"]["output"]>;
  AddressTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  AliasGuid?: Maybe<Scalars["uuid"]["output"]>;
  CPanelAddressId?: Maybe<Scalars["String"]["output"]>;
  CityGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  FaxNo?: Maybe<Scalars["String"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  LandMark?: Maybe<Scalars["String"]["output"]>;
  Location?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSAddressId?: Maybe<Scalars["String"]["output"]>;
  OwnershipType?: Maybe<Scalars["String"]["output"]>;
  POBoxNumber?: Maybe<Scalars["String"]["output"]>;
  PhoneNo?: Maybe<Scalars["String"]["output"]>;
  StateGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  VerifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  Zipcode?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_Addresses" */
export type Tbl_Addresses_Min_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  AddressLine1?: InputMaybe<Order_By>;
  AddressLine2?: InputMaybe<Order_By>;
  AddressLine3?: InputMaybe<Order_By>;
  AddressTitle?: InputMaybe<Order_By>;
  AddressTypeGuid?: InputMaybe<Order_By>;
  AliasGuid?: InputMaybe<Order_By>;
  CPanelAddressId?: InputMaybe<Order_By>;
  CityGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  FaxNo?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  LandMark?: InputMaybe<Order_By>;
  Location?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSAddressId?: InputMaybe<Order_By>;
  OwnershipType?: InputMaybe<Order_By>;
  POBoxNumber?: InputMaybe<Order_By>;
  PhoneNo?: InputMaybe<Order_By>;
  StateGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  VerifiedBy?: InputMaybe<Order_By>;
  Zipcode?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_Addresses" */
export type Tbl_Addresses_Mutation_Response = {
  __typename?: "Tbl_Addresses_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Addresses>;
};

/** input type for inserting object relation for remote table "Tbl_Addresses" */
export type Tbl_Addresses_Obj_Rel_Insert_Input = {
  data: Tbl_Addresses_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Addresses_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Addresses" */
export type Tbl_Addresses_On_Conflict = {
  constraint: Tbl_Addresses_Constraint;
  update_columns?: Array<Tbl_Addresses_Update_Column>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Addresses". */
export type Tbl_Addresses_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  AddressLine1?: InputMaybe<Order_By>;
  AddressLine2?: InputMaybe<Order_By>;
  AddressLine3?: InputMaybe<Order_By>;
  AddressTitle?: InputMaybe<Order_By>;
  AddressTypeGuid?: InputMaybe<Order_By>;
  AliasGuid?: InputMaybe<Order_By>;
  CPanelAddressId?: InputMaybe<Order_By>;
  CityGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  FaxNo?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  IsDefault?: InputMaybe<Order_By>;
  IsLocationUnderScope?: InputMaybe<Order_By>;
  IsManufacturing?: InputMaybe<Order_By>;
  IsVerified?: InputMaybe<Order_By>;
  LandMark?: InputMaybe<Order_By>;
  Location?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSAddressId?: InputMaybe<Order_By>;
  OwnershipType?: InputMaybe<Order_By>;
  POBoxNumber?: InputMaybe<Order_By>;
  PhoneNo?: InputMaybe<Order_By>;
  StateGuid?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserLocationActivityMappings_aggregate?: InputMaybe<Tbl_UserLocationActivityMapping_Aggregate_Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  VerifiedBy?: InputMaybe<Order_By>;
  Zipcode?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_Addresses */
export type Tbl_Addresses_Pk_Columns_Input = {
  AddressGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_Addresses" */
export enum Tbl_Addresses_Select_Column {
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  AddressLine1 = "AddressLine1",
  /** column name */
  AddressLine2 = "AddressLine2",
  /** column name */
  AddressLine3 = "AddressLine3",
  /** column name */
  AddressTitle = "AddressTitle",
  /** column name */
  AddressTypeGuid = "AddressTypeGuid",
  /** column name */
  AliasGuid = "AliasGuid",
  /** column name */
  CPanelAddressId = "CPanelAddressId",
  /** column name */
  CityGuid = "CityGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  FaxNo = "FaxNo",
  /** column name */
  GstNumber = "GSTNumber",
  /** column name */
  IsDefault = "IsDefault",
  /** column name */
  IsLocationUnderScope = "IsLocationUnderScope",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  IsVerified = "IsVerified",
  /** column name */
  LandMark = "LandMark",
  /** column name */
  Location = "Location",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsAddressId = "OPSAddressId",
  /** column name */
  OwnershipType = "OwnershipType",
  /** column name */
  PoBoxNumber = "POBoxNumber",
  /** column name */
  PhoneNo = "PhoneNo",
  /** column name */
  StateGuid = "StateGuid",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  VerifiedBy = "VerifiedBy",
  /** column name */
  Zipcode = "Zipcode"
}

/** select "Tbl_Addresses_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_Addresses" */
export enum Tbl_Addresses_Select_Column_Tbl_Addresses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsDefault = "IsDefault",
  /** column name */
  IsLocationUnderScope = "IsLocationUnderScope",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  IsVerified = "IsVerified"
}

/** select "Tbl_Addresses_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_Addresses" */
export enum Tbl_Addresses_Select_Column_Tbl_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsDefault = "IsDefault",
  /** column name */
  IsLocationUnderScope = "IsLocationUnderScope",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  IsVerified = "IsVerified"
}

/** input type for updating data in table "Tbl_Addresses" */
export type Tbl_Addresses_Set_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressLine1?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine2?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine3?: InputMaybe<Scalars["String"]["input"]>;
  AddressTitle?: InputMaybe<Scalars["String"]["input"]>;
  AddressTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AliasGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CPanelAddressId?: InputMaybe<Scalars["String"]["input"]>;
  CityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  FaxNo?: InputMaybe<Scalars["String"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocationUnderScope?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LandMark?: InputMaybe<Scalars["String"]["input"]>;
  Location?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSAddressId?: InputMaybe<Scalars["String"]["input"]>;
  OwnershipType?: InputMaybe<Scalars["String"]["input"]>;
  POBoxNumber?: InputMaybe<Scalars["String"]["input"]>;
  PhoneNo?: InputMaybe<Scalars["String"]["input"]>;
  StateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  VerifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  Zipcode?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_Addresses" */
export type Tbl_Addresses_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Addresses_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Addresses_Stream_Cursor_Value_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressLine1?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine2?: InputMaybe<Scalars["String"]["input"]>;
  AddressLine3?: InputMaybe<Scalars["String"]["input"]>;
  AddressTitle?: InputMaybe<Scalars["String"]["input"]>;
  AddressTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AliasGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CPanelAddressId?: InputMaybe<Scalars["String"]["input"]>;
  CityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  FaxNo?: InputMaybe<Scalars["String"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocationUnderScope?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LandMark?: InputMaybe<Scalars["String"]["input"]>;
  Location?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSAddressId?: InputMaybe<Scalars["String"]["input"]>;
  OwnershipType?: InputMaybe<Scalars["String"]["input"]>;
  POBoxNumber?: InputMaybe<Scalars["String"]["input"]>;
  PhoneNo?: InputMaybe<Scalars["String"]["input"]>;
  StateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  VerifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  Zipcode?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_Addresses" */
export enum Tbl_Addresses_Update_Column {
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  AddressLine1 = "AddressLine1",
  /** column name */
  AddressLine2 = "AddressLine2",
  /** column name */
  AddressLine3 = "AddressLine3",
  /** column name */
  AddressTitle = "AddressTitle",
  /** column name */
  AddressTypeGuid = "AddressTypeGuid",
  /** column name */
  AliasGuid = "AliasGuid",
  /** column name */
  CPanelAddressId = "CPanelAddressId",
  /** column name */
  CityGuid = "CityGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  FaxNo = "FaxNo",
  /** column name */
  GstNumber = "GSTNumber",
  /** column name */
  IsDefault = "IsDefault",
  /** column name */
  IsLocationUnderScope = "IsLocationUnderScope",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  IsVerified = "IsVerified",
  /** column name */
  LandMark = "LandMark",
  /** column name */
  Location = "Location",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsAddressId = "OPSAddressId",
  /** column name */
  OwnershipType = "OwnershipType",
  /** column name */
  PoBoxNumber = "POBoxNumber",
  /** column name */
  PhoneNo = "PhoneNo",
  /** column name */
  StateGuid = "StateGuid",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  VerifiedBy = "VerifiedBy",
  /** column name */
  Zipcode = "Zipcode"
}

export type Tbl_Addresses_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Addresses_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Addresses_Bool_Exp;
};

/** columns and relationships of "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping = {
  __typename?: "Tbl_AssessmentMapping";
  AssesseeCompanyGuid: Scalars["uuid"]["output"];
  AssessmentMappingGuid: Scalars["uuid"]["output"];
  AssessorCompanyGuid: Scalars["uuid"]["output"];
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  /** An object relationship */
  Tbl_Company: Tbl_Companies;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblCompanyByAssessorcompanyguid: Tbl_Companies;
};

/** aggregated selection of "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Aggregate = {
  __typename?: "Tbl_AssessmentMapping_aggregate";
  aggregate?: Maybe<Tbl_AssessmentMapping_Aggregate_Fields>;
  nodes: Array<Tbl_AssessmentMapping>;
};

export type Tbl_AssessmentMapping_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_AssessmentMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Aggregate_Fields = {
  __typename?: "Tbl_AssessmentMapping_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_AssessmentMapping_Max_Fields>;
  min?: Maybe<Tbl_AssessmentMapping_Min_Fields>;
};

/** aggregate fields of "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_AssessmentMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_AssessmentMapping_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_AssessmentMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_AssessmentMapping_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_AssessmentMapping". All fields are combined with a logical 'AND'. */
export type Tbl_AssessmentMapping_Bool_Exp = {
  AssesseeCompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  AssessmentMappingGuid?: InputMaybe<Uuid_Comparison_Exp>;
  AssessorCompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_AssessmentMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_AssessmentMapping_Bool_Exp>>;
  tblCompanyByAssessorcompanyguid?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_AssessmentMapping" */
export enum Tbl_AssessmentMapping_Constraint {
  /** unique or primary key constraint on columns "AssessmentMappingGuid" */
  TblAssessmentMappingPkey = "Tbl_AssessmentMapping_pkey"
}

/** input type for inserting data into table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Insert_Input = {
  AssesseeCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessmentMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessorCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblCompanyByAssessorcompanyguid?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_AssessmentMapping_Max_Fields = {
  __typename?: "Tbl_AssessmentMapping_max_fields";
  AssesseeCompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  AssessmentMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  AssessorCompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by max() on columns of table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Max_Order_By = {
  AssesseeCompanyGuid?: InputMaybe<Order_By>;
  AssessmentMappingGuid?: InputMaybe<Order_By>;
  AssessorCompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_AssessmentMapping_Min_Fields = {
  __typename?: "Tbl_AssessmentMapping_min_fields";
  AssesseeCompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  AssessmentMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  AssessorCompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by min() on columns of table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Min_Order_By = {
  AssesseeCompanyGuid?: InputMaybe<Order_By>;
  AssessmentMappingGuid?: InputMaybe<Order_By>;
  AssessorCompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Mutation_Response = {
  __typename?: "Tbl_AssessmentMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_AssessmentMapping>;
};

/** on_conflict condition type for table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_On_Conflict = {
  constraint: Tbl_AssessmentMapping_Constraint;
  update_columns?: Array<Tbl_AssessmentMapping_Update_Column>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_AssessmentMapping". */
export type Tbl_AssessmentMapping_Order_By = {
  AssesseeCompanyGuid?: InputMaybe<Order_By>;
  AssessmentMappingGuid?: InputMaybe<Order_By>;
  AssessorCompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblCompanyByAssessorcompanyguid?: InputMaybe<Tbl_Companies_Order_By>;
};

/** primary key columns input for table: Tbl_AssessmentMapping */
export type Tbl_AssessmentMapping_Pk_Columns_Input = {
  AssessmentMappingGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_AssessmentMapping" */
export enum Tbl_AssessmentMapping_Select_Column {
  /** column name */
  AssesseeCompanyGuid = "AssesseeCompanyGuid",
  /** column name */
  AssessmentMappingGuid = "AssessmentMappingGuid",
  /** column name */
  AssessorCompanyGuid = "AssessorCompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate"
}

/** input type for updating data in table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Set_Input = {
  AssesseeCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessmentMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessorCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** Streaming cursor of the table "Tbl_AssessmentMapping" */
export type Tbl_AssessmentMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_AssessmentMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_AssessmentMapping_Stream_Cursor_Value_Input = {
  AssesseeCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessmentMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AssessorCompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** update columns of table "Tbl_AssessmentMapping" */
export enum Tbl_AssessmentMapping_Update_Column {
  /** column name */
  AssesseeCompanyGuid = "AssesseeCompanyGuid",
  /** column name */
  AssessmentMappingGuid = "AssessmentMappingGuid",
  /** column name */
  AssessorCompanyGuid = "AssessorCompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate"
}

export type Tbl_AssessmentMapping_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_AssessmentMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_AssessmentMapping_Bool_Exp;
};

/** columns and relationships of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster = {
  __typename?: "Tbl_BusinessTypeMaster";
  BusinessTypeGuid: Scalars["uuid"]["output"];
  BusinessTypeName: Scalars["String"]["output"];
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  DisplayOrder: Scalars["Int"]["output"];
  Image?: Maybe<Scalars["String"]["output"]>;
  IsActive: Scalars["Boolean"]["output"];
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  /** An array relationship */
  Tbl_CompanyBusinessTypes: Array<Tbl_CompanyBusinessType>;
  /** An aggregate relationship */
  Tbl_CompanyBusinessTypes_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** columns and relationships of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMasterTbl_CompanyBusinessTypesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMasterTbl_CompanyBusinessTypes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** aggregated selection of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Aggregate = {
  __typename?: "Tbl_BusinessTypeMaster_aggregate";
  aggregate?: Maybe<Tbl_BusinessTypeMaster_Aggregate_Fields>;
  nodes: Array<Tbl_BusinessTypeMaster>;
};

export type Tbl_BusinessTypeMaster_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Count>;
};

export type Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_BusinessTypeMaster_Select_Column_Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_BusinessTypeMaster_Select_Column_Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Aggregate_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_aggregate_fields";
  avg?: Maybe<Tbl_BusinessTypeMaster_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_BusinessTypeMaster_Max_Fields>;
  min?: Maybe<Tbl_BusinessTypeMaster_Min_Fields>;
  stddev?: Maybe<Tbl_BusinessTypeMaster_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_BusinessTypeMaster_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_BusinessTypeMaster_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_BusinessTypeMaster_Sum_Fields>;
  var_pop?: Maybe<Tbl_BusinessTypeMaster_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_BusinessTypeMaster_Var_Samp_Fields>;
  variance?: Maybe<Tbl_BusinessTypeMaster_Variance_Fields>;
};

/** aggregate fields of "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_BusinessTypeMaster_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_BusinessTypeMaster_Max_Order_By>;
  min?: InputMaybe<Tbl_BusinessTypeMaster_Min_Order_By>;
  stddev?: InputMaybe<Tbl_BusinessTypeMaster_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_BusinessTypeMaster_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_BusinessTypeMaster_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_BusinessTypeMaster_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_BusinessTypeMaster_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_BusinessTypeMaster_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_BusinessTypeMaster_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Arr_Rel_Insert_Input = {
  data: Array<Tbl_BusinessTypeMaster_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_BusinessTypeMaster_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_BusinessTypeMaster_Avg_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_avg_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Avg_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_BusinessTypeMaster". All fields are combined with a logical 'AND'. */
export type Tbl_BusinessTypeMaster_Bool_Exp = {
  BusinessTypeGuid?: InputMaybe<Uuid_Comparison_Exp>;
  BusinessTypeName?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  DisplayOrder?: InputMaybe<Int_Comparison_Exp>;
  Image?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_BusinessTypeMaster_Bool_Exp>>;
  _not?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_BusinessTypeMaster_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_BusinessTypeMaster" */
export enum Tbl_BusinessTypeMaster_Constraint {
  /** unique or primary key constraint on columns "BusinessTypeGuid" */
  TblBusinessTypeMasterPkey = "Tbl_BusinessTypeMaster_pkey"
}

/** input type for incrementing numeric columns in table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Inc_Input = {
  DisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Insert_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  BusinessTypeName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Arr_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_BusinessTypeMaster_Max_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_max_fields";
  BusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  BusinessTypeName?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  Image?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** order by max() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Max_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  BusinessTypeName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_BusinessTypeMaster_Min_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_min_fields";
  BusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  BusinessTypeName?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  Image?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** order by min() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Min_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  BusinessTypeName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Mutation_Response = {
  __typename?: "Tbl_BusinessTypeMaster_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_BusinessTypeMaster>;
};

/** input type for inserting object relation for remote table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Obj_Rel_Insert_Input = {
  data: Tbl_BusinessTypeMaster_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_BusinessTypeMaster_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_On_Conflict = {
  constraint: Tbl_BusinessTypeMaster_Constraint;
  update_columns?: Array<Tbl_BusinessTypeMaster_Update_Column>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_BusinessTypeMaster". */
export type Tbl_BusinessTypeMaster_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  BusinessTypeName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_BusinessTypeMaster */
export type Tbl_BusinessTypeMaster_Pk_Columns_Input = {
  BusinessTypeGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_BusinessTypeMaster" */
export enum Tbl_BusinessTypeMaster_Select_Column {
  /** column name */
  BusinessTypeGuid = "BusinessTypeGuid",
  /** column name */
  BusinessTypeName = "BusinessTypeName",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DisplayOrder = "DisplayOrder",
  /** column name */
  Image = "Image",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

/** select "Tbl_BusinessTypeMaster_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_BusinessTypeMaster" */
export enum Tbl_BusinessTypeMaster_Select_Column_Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_BusinessTypeMaster_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_BusinessTypeMaster" */
export enum Tbl_BusinessTypeMaster_Select_Column_Tbl_BusinessTypeMaster_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Set_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  BusinessTypeName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_BusinessTypeMaster_Stddev_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_stddev_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Stddev_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_BusinessTypeMaster_Stddev_Pop_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_stddev_pop_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Stddev_Pop_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_BusinessTypeMaster_Stddev_Samp_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_stddev_samp_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Stddev_Samp_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_BusinessTypeMaster_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_BusinessTypeMaster_Stream_Cursor_Value_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  BusinessTypeName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_BusinessTypeMaster_Sum_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_sum_fields";
  DisplayOrder?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Sum_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_BusinessTypeMaster" */
export enum Tbl_BusinessTypeMaster_Update_Column {
  /** column name */
  BusinessTypeGuid = "BusinessTypeGuid",
  /** column name */
  BusinessTypeName = "BusinessTypeName",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DisplayOrder = "DisplayOrder",
  /** column name */
  Image = "Image",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

export type Tbl_BusinessTypeMaster_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_BusinessTypeMaster_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_BusinessTypeMaster_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_BusinessTypeMaster_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_BusinessTypeMaster_Var_Pop_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_var_pop_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Var_Pop_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_BusinessTypeMaster_Var_Samp_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_var_samp_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Var_Samp_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_BusinessTypeMaster_Variance_Fields = {
  __typename?: "Tbl_BusinessTypeMaster_variance_fields";
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_BusinessTypeMaster" */
export type Tbl_BusinessTypeMaster_Variance_Order_By = {
  DisplayOrder?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_Companies = {
  __typename?: "Tbl_Companies";
  CPanelCompanyId?: Maybe<Scalars["String"]["output"]>;
  CPanelCompanyIndustry?: Maybe<Scalars["String"]["output"]>;
  CompanyCode?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid: Scalars["uuid"]["output"];
  CompanyId: Scalars["Int"]["output"];
  CompanyLogo?: Maybe<Scalars["String"]["output"]>;
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  HoldingCompanyName?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  IsManufacturing?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSCompanyId?: Maybe<Scalars["String"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["numeric"]["output"]>;
  ProfileScore?: Maybe<Scalars["numeric"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  /** An array relationship */
  Tbl_Addresses: Array<Tbl_Addresses>;
  /** An aggregate relationship */
  Tbl_Addresses_aggregate: Tbl_Addresses_Aggregate;
  /** An array relationship */
  Tbl_AssessmentMappings: Array<Tbl_AssessmentMapping>;
  /** An aggregate relationship */
  Tbl_AssessmentMappings_aggregate: Tbl_AssessmentMapping_Aggregate;
  /** An array relationship */
  Tbl_CompanyBusinessTypes: Array<Tbl_CompanyBusinessType>;
  /** An aggregate relationship */
  Tbl_CompanyBusinessTypes_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** An array relationship */
  Tbl_CompanyCountries: Array<Tbl_CompanyCountry>;
  /** An aggregate relationship */
  Tbl_CompanyCountries_aggregate: Tbl_CompanyCountry_Aggregate;
  /** An array relationship */
  Tbl_CompanyDashboardMappings: Array<Tbl_CompanyDashboardMapping>;
  /** An aggregate relationship */
  Tbl_CompanyDashboardMappings_aggregate: Tbl_CompanyDashboardMapping_Aggregate;
  /** An array relationship */
  Tbl_CompanyGeneralDetails: Array<Tbl_CompanyGeneralDetails>;
  /** An aggregate relationship */
  Tbl_CompanyGeneralDetails_aggregate: Tbl_CompanyGeneralDetails_Aggregate;
  /** An array relationship */
  Tbl_CompanyRoleMappings: Array<Tbl_CompanyRoleMapping>;
  /** An aggregate relationship */
  Tbl_CompanyRoleMappings_aggregate: Tbl_CompanyRoleMapping_Aggregate;
  /** An array relationship */
  Tbl_CompanyStatusLogs: Array<Tbl_CompanyStatusLog>;
  /** An aggregate relationship */
  Tbl_CompanyStatusLogs_aggregate: Tbl_CompanyStatusLog_Aggregate;
  /** An array relationship */
  Tbl_OPsCompanyDBDetails: Array<Tbl_OPsCompanyDbDetails>;
  /** An aggregate relationship */
  Tbl_OPsCompanyDBDetails_aggregate: Tbl_OPsCompanyDbDetails_Aggregate;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An array relationship */
  Tbl_UserCompanyMappings: Array<Tbl_UserCompanyMapping>;
  /** An aggregate relationship */
  Tbl_UserCompanyMappings_aggregate: Tbl_UserCompanyMapping_Aggregate;
  metadata?: Maybe<Scalars["jsonb"]["output"]>;
  /** An array relationship */
  tblAssessmentmappingsByAssessorcompanyguid: Array<Tbl_AssessmentMapping>;
  /** An aggregate relationship */
  tblAssessmentmappingsByAssessorcompanyguid_aggregate: Tbl_AssessmentMapping_Aggregate;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_AddressesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_Addresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_AssessmentMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_AssessmentMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyBusinessTypesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyBusinessTypes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyCountriesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyCountries_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyDashboardMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyDashboardMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyGeneralDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyGeneralDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyStatusLogsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_CompanyStatusLogs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_OPsCompanyDbDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_OPsCompanyDbDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_UserCompanyMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTbl_UserCompanyMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesMetadataArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTblAssessmentmappingsByAssessorcompanyguidArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Companies" */
export type Tbl_CompaniesTblAssessmentmappingsByAssessorcompanyguid_AggregateArgs =
  {
    distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
    limit?: InputMaybe<Scalars["Int"]["input"]>;
    offset?: InputMaybe<Scalars["Int"]["input"]>;
    order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
    where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  };

/** aggregated selection of "Tbl_Companies" */
export type Tbl_Companies_Aggregate = {
  __typename?: "Tbl_Companies_aggregate";
  aggregate?: Maybe<Tbl_Companies_Aggregate_Fields>;
  nodes: Array<Tbl_Companies>;
};

export type Tbl_Companies_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_Companies_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_Companies_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_Companies_Aggregate_Bool_Exp_Count>;
};

export type Tbl_Companies_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_Companies_Select_Column_Tbl_Companies_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Companies_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Companies_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_Companies_Select_Column_Tbl_Companies_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Companies_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Companies_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Companies_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_Companies" */
export type Tbl_Companies_Aggregate_Fields = {
  __typename?: "Tbl_Companies_aggregate_fields";
  avg?: Maybe<Tbl_Companies_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Companies_Max_Fields>;
  min?: Maybe<Tbl_Companies_Min_Fields>;
  stddev?: Maybe<Tbl_Companies_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_Companies_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_Companies_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_Companies_Sum_Fields>;
  var_pop?: Maybe<Tbl_Companies_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_Companies_Var_Samp_Fields>;
  variance?: Maybe<Tbl_Companies_Variance_Fields>;
};

/** aggregate fields of "Tbl_Companies" */
export type Tbl_Companies_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_Companies" */
export type Tbl_Companies_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_Companies_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_Companies_Max_Order_By>;
  min?: InputMaybe<Tbl_Companies_Min_Order_By>;
  stddev?: InputMaybe<Tbl_Companies_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_Companies_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_Companies_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_Companies_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_Companies_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_Companies_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_Companies_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Tbl_Companies_Append_Input = {
  metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** input type for inserting array relation for remote table "Tbl_Companies" */
export type Tbl_Companies_Arr_Rel_Insert_Input = {
  data: Array<Tbl_Companies_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Companies_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_Companies_Avg_Fields = {
  __typename?: "Tbl_Companies_avg_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Avg_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_Companies". All fields are combined with a logical 'AND'. */
export type Tbl_Companies_Bool_Exp = {
  CPanelCompanyId?: InputMaybe<String_Comparison_Exp>;
  CPanelCompanyIndustry?: InputMaybe<String_Comparison_Exp>;
  CompanyCode?: InputMaybe<String_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyId?: InputMaybe<Int_Comparison_Exp>;
  CompanyLogo?: InputMaybe<String_Comparison_Exp>;
  CompanyName?: InputMaybe<String_Comparison_Exp>;
  CountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Description?: InputMaybe<String_Comparison_Exp>;
  HoldingCompanyName?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  IsManufacturing?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  OPSCompanyId?: InputMaybe<String_Comparison_Exp>;
  ProfileCompletionPercent?: InputMaybe<Numeric_Comparison_Exp>;
  ProfileScore?: InputMaybe<Numeric_Comparison_Exp>;
  StatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_Addresses?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  Tbl_Addresses_aggregate?: InputMaybe<Tbl_Addresses_Aggregate_Bool_Exp>;
  Tbl_AssessmentMappings?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  Tbl_AssessmentMappings_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Bool_Exp>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Bool_Exp>;
  Tbl_CompanyCountries?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  Tbl_CompanyCountries_aggregate?: InputMaybe<Tbl_CompanyCountry_Aggregate_Bool_Exp>;
  Tbl_CompanyDashboardMappings?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
  Tbl_CompanyDashboardMappings_aggregate?: InputMaybe<Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp>;
  Tbl_CompanyGeneralDetails?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
  Tbl_CompanyGeneralDetails_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp>;
  Tbl_CompanyStatusLogs?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
  Tbl_CompanyStatusLogs_aggregate?: InputMaybe<Tbl_CompanyStatusLog_Aggregate_Bool_Exp>;
  Tbl_OPsCompanyDBDetails?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
  Tbl_OPsCompanyDBDetails_aggregate?: InputMaybe<Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserCompanyMappings?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  Tbl_UserCompanyMappings_aggregate?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_Companies_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Companies_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Companies_Bool_Exp>>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  tblAssessmentmappingsByAssessorcompanyguid?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  tblAssessmentmappingsByAssessorcompanyguid_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Bool_Exp>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_Companies" */
export enum Tbl_Companies_Constraint {
  /** unique or primary key constraint on columns "CompanyGuid" */
  TblCompaniesPkey = "Tbl_Companies_pkey"
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Tbl_Companies_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Tbl_Companies_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars["Int"]["input"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Tbl_Companies_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars["String"]["input"]>;
};

/** input type for incrementing numeric columns in table "Tbl_Companies" */
export type Tbl_Companies_Inc_Input = {
  CompanyId?: InputMaybe<Scalars["Int"]["input"]>;
  ProfileCompletionPercent?: InputMaybe<Scalars["numeric"]["input"]>;
  ProfileScore?: InputMaybe<Scalars["numeric"]["input"]>;
};

/** input type for inserting data into table "Tbl_Companies" */
export type Tbl_Companies_Insert_Input = {
  CPanelCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  CPanelCompanyIndustry?: InputMaybe<Scalars["String"]["input"]>;
  CompanyCode?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyId?: InputMaybe<Scalars["Int"]["input"]>;
  CompanyLogo?: InputMaybe<Scalars["String"]["input"]>;
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  HoldingCompanyName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  ProfileCompletionPercent?: InputMaybe<Scalars["numeric"]["input"]>;
  ProfileScore?: InputMaybe<Scalars["numeric"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_Addresses?: InputMaybe<Tbl_Addresses_Arr_Rel_Insert_Input>;
  Tbl_AssessmentMappings?: InputMaybe<Tbl_AssessmentMapping_Arr_Rel_Insert_Input>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Arr_Rel_Insert_Input>;
  Tbl_CompanyCountries?: InputMaybe<Tbl_CompanyCountry_Arr_Rel_Insert_Input>;
  Tbl_CompanyDashboardMappings?: InputMaybe<Tbl_CompanyDashboardMapping_Arr_Rel_Insert_Input>;
  Tbl_CompanyGeneralDetails?: InputMaybe<Tbl_CompanyGeneralDetails_Arr_Rel_Insert_Input>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Arr_Rel_Insert_Input>;
  Tbl_CompanyStatusLogs?: InputMaybe<Tbl_CompanyStatusLog_Arr_Rel_Insert_Input>;
  Tbl_OPsCompanyDBDetails?: InputMaybe<Tbl_OPsCompanyDbDetails_Arr_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserCompanyMappings?: InputMaybe<Tbl_UserCompanyMapping_Arr_Rel_Insert_Input>;
  metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  tblAssessmentmappingsByAssessorcompanyguid?: InputMaybe<Tbl_AssessmentMapping_Arr_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_Companies_Max_Fields = {
  __typename?: "Tbl_Companies_max_fields";
  CPanelCompanyId?: Maybe<Scalars["String"]["output"]>;
  CPanelCompanyIndustry?: Maybe<Scalars["String"]["output"]>;
  CompanyCode?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyId?: Maybe<Scalars["Int"]["output"]>;
  CompanyLogo?: Maybe<Scalars["String"]["output"]>;
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  HoldingCompanyName?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSCompanyId?: Maybe<Scalars["String"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["numeric"]["output"]>;
  ProfileScore?: Maybe<Scalars["numeric"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Max_Order_By = {
  CPanelCompanyId?: InputMaybe<Order_By>;
  CPanelCompanyIndustry?: InputMaybe<Order_By>;
  CompanyCode?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyId?: InputMaybe<Order_By>;
  CompanyLogo?: InputMaybe<Order_By>;
  CompanyName?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  HoldingCompanyName?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSCompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_Companies_Min_Fields = {
  __typename?: "Tbl_Companies_min_fields";
  CPanelCompanyId?: Maybe<Scalars["String"]["output"]>;
  CPanelCompanyIndustry?: Maybe<Scalars["String"]["output"]>;
  CompanyCode?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyId?: Maybe<Scalars["Int"]["output"]>;
  CompanyLogo?: Maybe<Scalars["String"]["output"]>;
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  HoldingCompanyName?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPSCompanyId?: Maybe<Scalars["String"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["numeric"]["output"]>;
  ProfileScore?: Maybe<Scalars["numeric"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Min_Order_By = {
  CPanelCompanyId?: InputMaybe<Order_By>;
  CPanelCompanyIndustry?: InputMaybe<Order_By>;
  CompanyCode?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyId?: InputMaybe<Order_By>;
  CompanyLogo?: InputMaybe<Order_By>;
  CompanyName?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  HoldingCompanyName?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSCompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_Companies" */
export type Tbl_Companies_Mutation_Response = {
  __typename?: "Tbl_Companies_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Companies>;
};

/** input type for inserting object relation for remote table "Tbl_Companies" */
export type Tbl_Companies_Obj_Rel_Insert_Input = {
  data: Tbl_Companies_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Companies_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Companies" */
export type Tbl_Companies_On_Conflict = {
  constraint: Tbl_Companies_Constraint;
  update_columns?: Array<Tbl_Companies_Update_Column>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Companies". */
export type Tbl_Companies_Order_By = {
  CPanelCompanyId?: InputMaybe<Order_By>;
  CPanelCompanyIndustry?: InputMaybe<Order_By>;
  CompanyCode?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyId?: InputMaybe<Order_By>;
  CompanyLogo?: InputMaybe<Order_By>;
  CompanyName?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  HoldingCompanyName?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  IsManufacturing?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPSCompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  Tbl_Addresses_aggregate?: InputMaybe<Tbl_Addresses_Aggregate_Order_By>;
  Tbl_AssessmentMappings_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Order_By>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Order_By>;
  Tbl_CompanyCountries_aggregate?: InputMaybe<Tbl_CompanyCountry_Aggregate_Order_By>;
  Tbl_CompanyDashboardMappings_aggregate?: InputMaybe<Tbl_CompanyDashboardMapping_Aggregate_Order_By>;
  Tbl_CompanyGeneralDetails_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Order_By>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Order_By>;
  Tbl_CompanyStatusLogs_aggregate?: InputMaybe<Tbl_CompanyStatusLog_Aggregate_Order_By>;
  Tbl_OPsCompanyDBDetails_aggregate?: InputMaybe<Tbl_OPsCompanyDbDetails_Aggregate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserCompanyMappings_aggregate?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  tblAssessmentmappingsByAssessorcompanyguid_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_Companies */
export type Tbl_Companies_Pk_Columns_Input = {
  CompanyGuid: Scalars["uuid"]["input"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Tbl_Companies_Prepend_Input = {
  metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** select columns of table "Tbl_Companies" */
export enum Tbl_Companies_Select_Column {
  /** column name */
  CPanelCompanyId = "CPanelCompanyId",
  /** column name */
  CPanelCompanyIndustry = "CPanelCompanyIndustry",
  /** column name */
  CompanyCode = "CompanyCode",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyId = "CompanyId",
  /** column name */
  CompanyLogo = "CompanyLogo",
  /** column name */
  CompanyName = "CompanyName",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Description = "Description",
  /** column name */
  HoldingCompanyName = "HoldingCompanyName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsCompanyId = "OPSCompanyId",
  /** column name */
  ProfileCompletionPercent = "ProfileCompletionPercent",
  /** column name */
  ProfileScore = "ProfileScore",
  /** column name */
  StatusGuid = "StatusGuid",
  /** column name */
  Metadata = "metadata"
}

/** select "Tbl_Companies_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_Companies" */
export enum Tbl_Companies_Select_Column_Tbl_Companies_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsManufacturing = "IsManufacturing"
}

/** select "Tbl_Companies_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_Companies" */
export enum Tbl_Companies_Select_Column_Tbl_Companies_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsManufacturing = "IsManufacturing"
}

/** input type for updating data in table "Tbl_Companies" */
export type Tbl_Companies_Set_Input = {
  CPanelCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  CPanelCompanyIndustry?: InputMaybe<Scalars["String"]["input"]>;
  CompanyCode?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyId?: InputMaybe<Scalars["Int"]["input"]>;
  CompanyLogo?: InputMaybe<Scalars["String"]["input"]>;
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  HoldingCompanyName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  ProfileCompletionPercent?: InputMaybe<Scalars["numeric"]["input"]>;
  ProfileScore?: InputMaybe<Scalars["numeric"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_Companies_Stddev_Fields = {
  __typename?: "Tbl_Companies_stddev_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Stddev_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_Companies_Stddev_Pop_Fields = {
  __typename?: "Tbl_Companies_stddev_pop_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Stddev_Pop_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_Companies_Stddev_Samp_Fields = {
  __typename?: "Tbl_Companies_stddev_samp_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Stddev_Samp_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_Companies" */
export type Tbl_Companies_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Companies_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Companies_Stream_Cursor_Value_Input = {
  CPanelCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  CPanelCompanyIndustry?: InputMaybe<Scalars["String"]["input"]>;
  CompanyCode?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyId?: InputMaybe<Scalars["Int"]["input"]>;
  CompanyLogo?: InputMaybe<Scalars["String"]["input"]>;
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  HoldingCompanyName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsManufacturing?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPSCompanyId?: InputMaybe<Scalars["String"]["input"]>;
  ProfileCompletionPercent?: InputMaybe<Scalars["numeric"]["input"]>;
  ProfileScore?: InputMaybe<Scalars["numeric"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_Companies_Sum_Fields = {
  __typename?: "Tbl_Companies_sum_fields";
  CompanyId?: Maybe<Scalars["Int"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["numeric"]["output"]>;
  ProfileScore?: Maybe<Scalars["numeric"]["output"]>;
};

/** order by sum() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Sum_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_Companies" */
export enum Tbl_Companies_Update_Column {
  /** column name */
  CPanelCompanyId = "CPanelCompanyId",
  /** column name */
  CPanelCompanyIndustry = "CPanelCompanyIndustry",
  /** column name */
  CompanyCode = "CompanyCode",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyId = "CompanyId",
  /** column name */
  CompanyLogo = "CompanyLogo",
  /** column name */
  CompanyName = "CompanyName",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Description = "Description",
  /** column name */
  HoldingCompanyName = "HoldingCompanyName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsManufacturing = "IsManufacturing",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsCompanyId = "OPSCompanyId",
  /** column name */
  ProfileCompletionPercent = "ProfileCompletionPercent",
  /** column name */
  ProfileScore = "ProfileScore",
  /** column name */
  StatusGuid = "StatusGuid",
  /** column name */
  Metadata = "metadata"
}

export type Tbl_Companies_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Tbl_Companies_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Tbl_Companies_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Tbl_Companies_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Tbl_Companies_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_Companies_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Tbl_Companies_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Companies_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Companies_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_Companies_Var_Pop_Fields = {
  __typename?: "Tbl_Companies_var_pop_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Var_Pop_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_Companies_Var_Samp_Fields = {
  __typename?: "Tbl_Companies_var_samp_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Var_Samp_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_Companies_Variance_Fields = {
  __typename?: "Tbl_Companies_variance_fields";
  CompanyId?: Maybe<Scalars["Float"]["output"]>;
  ProfileCompletionPercent?: Maybe<Scalars["Float"]["output"]>;
  ProfileScore?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_Companies" */
export type Tbl_Companies_Variance_Order_By = {
  CompanyId?: InputMaybe<Order_By>;
  ProfileCompletionPercent?: InputMaybe<Order_By>;
  ProfileScore?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType = {
  __typename?: "Tbl_CompanyBusinessType";
  BusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyBusinessTypeGuid: Scalars["uuid"]["output"];
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate: Scalars["timestamptz"]["output"];
  ModiffiedDate: Scalars["timestamptz"]["output"];
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  /** An object relationship */
  Tbl_BusinessTypeMaster?: Maybe<Tbl_BusinessTypeMaster>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** aggregated selection of "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Aggregate = {
  __typename?: "Tbl_CompanyBusinessType_aggregate";
  aggregate?: Maybe<Tbl_CompanyBusinessType_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyBusinessType>;
};

export type Tbl_CompanyBusinessType_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyBusinessType_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Aggregate_Fields = {
  __typename?: "Tbl_CompanyBusinessType_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyBusinessType_Max_Fields>;
  min?: Maybe<Tbl_CompanyBusinessType_Min_Fields>;
};

/** aggregate fields of "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyBusinessType_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyBusinessType_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyBusinessType_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyBusinessType_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyBusinessType". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyBusinessType_Bool_Exp = {
  BusinessTypeGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyBusinessTypeGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  ModiffiedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_BusinessTypeMaster?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyBusinessType_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyBusinessType_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_CompanyBusinessType" */
export enum Tbl_CompanyBusinessType_Constraint {
  /** unique or primary key constraint on columns "CompanyBusinessTypeGuid" */
  TblCompanyBusinessTypePkey = "Tbl_CompanyBusinessType_pkey"
}

/** input type for inserting data into table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Insert_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyBusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModiffiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_BusinessTypeMaster?: InputMaybe<Tbl_BusinessTypeMaster_Obj_Rel_Insert_Input>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyBusinessType_Max_Fields = {
  __typename?: "Tbl_CompanyBusinessType_max_fields";
  BusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyBusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModiffiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Max_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyBusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModiffiedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyBusinessType_Min_Fields = {
  __typename?: "Tbl_CompanyBusinessType_min_fields";
  BusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyBusinessTypeGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModiffiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Min_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyBusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModiffiedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Mutation_Response = {
  __typename?: "Tbl_CompanyBusinessType_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyBusinessType>;
};

/** on_conflict condition type for table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_On_Conflict = {
  constraint: Tbl_CompanyBusinessType_Constraint;
  update_columns?: Array<Tbl_CompanyBusinessType_Update_Column>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyBusinessType". */
export type Tbl_CompanyBusinessType_Order_By = {
  BusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyBusinessTypeGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModiffiedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  Tbl_BusinessTypeMaster?: InputMaybe<Tbl_BusinessTypeMaster_Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyBusinessType */
export type Tbl_CompanyBusinessType_Pk_Columns_Input = {
  CompanyBusinessTypeGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyBusinessType" */
export enum Tbl_CompanyBusinessType_Select_Column {
  /** column name */
  BusinessTypeGuid = "BusinessTypeGuid",
  /** column name */
  CompanyBusinessTypeGuid = "CompanyBusinessTypeGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModiffiedDate = "ModiffiedDate",
  /** column name */
  ModifiedBy = "ModifiedBy"
}

/** input type for updating data in table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Set_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyBusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModiffiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CompanyBusinessType" */
export type Tbl_CompanyBusinessType_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyBusinessType_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyBusinessType_Stream_Cursor_Value_Input = {
  BusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyBusinessTypeGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModiffiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_CompanyBusinessType" */
export enum Tbl_CompanyBusinessType_Update_Column {
  /** column name */
  BusinessTypeGuid = "BusinessTypeGuid",
  /** column name */
  CompanyBusinessTypeGuid = "CompanyBusinessTypeGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModiffiedDate = "ModiffiedDate",
  /** column name */
  ModifiedBy = "ModifiedBy"
}

export type Tbl_CompanyBusinessType_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyBusinessType_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyBusinessType_Bool_Exp;
};

/** columns and relationships of "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry = {
  __typename?: "Tbl_CompanyCountry";
  CompanyCountryGuid: Scalars["uuid"]["output"];
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
  /** An object relationship */
  Tbl_CountryMaster?: Maybe<Tbl_CountryMaster>;
};

/** aggregated selection of "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Aggregate = {
  __typename?: "Tbl_CompanyCountry_aggregate";
  aggregate?: Maybe<Tbl_CompanyCountry_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyCountry>;
};

export type Tbl_CompanyCountry_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_CompanyCountry_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_CompanyCountry_Select_Column_Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_CompanyCountry_Select_Column_Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyCountry_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Aggregate_Fields = {
  __typename?: "Tbl_CompanyCountry_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyCountry_Max_Fields>;
  min?: Maybe<Tbl_CompanyCountry_Min_Fields>;
};

/** aggregate fields of "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyCountry_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyCountry_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyCountry_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyCountry_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyCountry". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyCountry_Bool_Exp = {
  CompanyCountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_CountryMaster?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyCountry_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyCountry_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_CompanyCountry" */
export enum Tbl_CompanyCountry_Constraint {
  /** unique or primary key constraint on columns "CompanyCountryGuid" */
  TblCompanyCountryPkey = "Tbl_CompanyCountry_pkey"
}

/** input type for inserting data into table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Insert_Input = {
  CompanyCountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_CountryMaster?: InputMaybe<Tbl_CountryMaster_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyCountry_Max_Fields = {
  __typename?: "Tbl_CompanyCountry_max_fields";
  CompanyCountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Max_Order_By = {
  CompanyCountryGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyCountry_Min_Fields = {
  __typename?: "Tbl_CompanyCountry_min_fields";
  CompanyCountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Min_Order_By = {
  CompanyCountryGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Mutation_Response = {
  __typename?: "Tbl_CompanyCountry_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyCountry>;
};

/** on_conflict condition type for table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_On_Conflict = {
  constraint: Tbl_CompanyCountry_Constraint;
  update_columns?: Array<Tbl_CompanyCountry_Update_Column>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyCountry". */
export type Tbl_CompanyCountry_Order_By = {
  CompanyCountryGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_CountryMaster?: InputMaybe<Tbl_CountryMaster_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyCountry */
export type Tbl_CompanyCountry_Pk_Columns_Input = {
  CompanyCountryGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyCountry" */
export enum Tbl_CompanyCountry_Select_Column {
  /** column name */
  CompanyCountryGuid = "CompanyCountryGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

/** select "Tbl_CompanyCountry_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_CompanyCountry" */
export enum Tbl_CompanyCountry_Select_Column_Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_CompanyCountry_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_CompanyCountry" */
export enum Tbl_CompanyCountry_Select_Column_Tbl_CompanyCountry_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Set_Input = {
  CompanyCountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CompanyCountry" */
export type Tbl_CompanyCountry_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyCountry_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyCountry_Stream_Cursor_Value_Input = {
  CompanyCountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** update columns of table "Tbl_CompanyCountry" */
export enum Tbl_CompanyCountry_Update_Column {
  /** column name */
  CompanyCountryGuid = "CompanyCountryGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

export type Tbl_CompanyCountry_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyCountry_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyCountry_Bool_Exp;
};

/** columns and relationships of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping = {
  __typename?: "Tbl_CompanyDashboardMapping";
  ColumnSize?: Maybe<Scalars["numeric"]["output"]>;
  CompanyDashboardMappingGuid: Scalars["uuid"]["output"];
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyType?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate: Scalars["timestamptz"]["output"];
  DashboardHeight?: Maybe<Scalars["numeric"]["output"]>;
  DashboardType?: Maybe<Scalars["String"]["output"]>;
  DisplayOrder?: Maybe<Scalars["numeric"]["output"]>;
  HideTabs?: Maybe<Scalars["jsonb"]["output"]>;
  IFrameStyle?: Maybe<Scalars["jsonb"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  IsBorder?: Maybe<Scalars["Boolean"]["output"]>;
  IsPowerBiReport?: Maybe<Scalars["Boolean"]["output"]>;
  LocationUrl?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate: Scalars["timestamptz"]["output"];
  ReportName?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
  Url?: Maybe<Scalars["String"]["output"]>;
};

/** columns and relationships of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMappingHideTabsArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** columns and relationships of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMappingIFrameStyleArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregated selection of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Aggregate = {
  __typename?: "Tbl_CompanyDashboardMapping_aggregate";
  aggregate?: Maybe<Tbl_CompanyDashboardMapping_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyDashboardMapping>;
};

export type Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_CompanyDashboardMapping_Select_Column_Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_CompanyDashboardMapping_Select_Column_Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Aggregate_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_aggregate_fields";
  avg?: Maybe<Tbl_CompanyDashboardMapping_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyDashboardMapping_Max_Fields>;
  min?: Maybe<Tbl_CompanyDashboardMapping_Min_Fields>;
  stddev?: Maybe<Tbl_CompanyDashboardMapping_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_CompanyDashboardMapping_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_CompanyDashboardMapping_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_CompanyDashboardMapping_Sum_Fields>;
  var_pop?: Maybe<Tbl_CompanyDashboardMapping_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_CompanyDashboardMapping_Var_Samp_Fields>;
  variance?: Maybe<Tbl_CompanyDashboardMapping_Variance_Fields>;
};

/** aggregate fields of "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_CompanyDashboardMapping_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyDashboardMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyDashboardMapping_Min_Order_By>;
  stddev?: InputMaybe<Tbl_CompanyDashboardMapping_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_CompanyDashboardMapping_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_CompanyDashboardMapping_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_CompanyDashboardMapping_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_CompanyDashboardMapping_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_CompanyDashboardMapping_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_CompanyDashboardMapping_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Tbl_CompanyDashboardMapping_Append_Input = {
  HideTabs?: InputMaybe<Scalars["jsonb"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyDashboardMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyDashboardMapping_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_CompanyDashboardMapping_Avg_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_avg_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Avg_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyDashboardMapping". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyDashboardMapping_Bool_Exp = {
  ColumnSize?: InputMaybe<Numeric_Comparison_Exp>;
  CompanyDashboardMappingGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyType?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  DashboardHeight?: InputMaybe<Numeric_Comparison_Exp>;
  DashboardType?: InputMaybe<String_Comparison_Exp>;
  DisplayOrder?: InputMaybe<Numeric_Comparison_Exp>;
  HideTabs?: InputMaybe<Jsonb_Comparison_Exp>;
  IFrameStyle?: InputMaybe<Jsonb_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  IsBorder?: InputMaybe<Boolean_Comparison_Exp>;
  IsPowerBiReport?: InputMaybe<Boolean_Comparison_Exp>;
  LocationUrl?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  ReportName?: InputMaybe<String_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Url?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_CompanyDashboardMapping" */
export enum Tbl_CompanyDashboardMapping_Constraint {
  /** unique or primary key constraint on columns "CompanyDashboardMappingGuid" */
  TblCompanyDashboardMappingPkey = "Tbl_CompanyDashboardMapping_pkey"
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Tbl_CompanyDashboardMapping_Delete_At_Path_Input = {
  HideTabs?: InputMaybe<Array<Scalars["String"]["input"]>>;
  IFrameStyle?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Tbl_CompanyDashboardMapping_Delete_Elem_Input = {
  HideTabs?: InputMaybe<Scalars["Int"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["Int"]["input"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Tbl_CompanyDashboardMapping_Delete_Key_Input = {
  HideTabs?: InputMaybe<Scalars["String"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["String"]["input"]>;
};

/** input type for incrementing numeric columns in table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Inc_Input = {
  ColumnSize?: InputMaybe<Scalars["numeric"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["numeric"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["numeric"]["input"]>;
};

/** input type for inserting data into table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Insert_Input = {
  ColumnSize?: InputMaybe<Scalars["numeric"]["input"]>;
  CompanyDashboardMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyType?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["numeric"]["input"]>;
  DashboardType?: InputMaybe<Scalars["String"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["numeric"]["input"]>;
  HideTabs?: InputMaybe<Scalars["jsonb"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["jsonb"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
  LocationUrl?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ReportName?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Url?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_CompanyDashboardMapping_Max_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_max_fields";
  ColumnSize?: Maybe<Scalars["numeric"]["output"]>;
  CompanyDashboardMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyType?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  DashboardHeight?: Maybe<Scalars["numeric"]["output"]>;
  DashboardType?: Maybe<Scalars["String"]["output"]>;
  DisplayOrder?: Maybe<Scalars["numeric"]["output"]>;
  LocationUrl?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ReportName?: Maybe<Scalars["String"]["output"]>;
  Url?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Max_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  CompanyDashboardMappingGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyType?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DashboardType?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  LocationUrl?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ReportName?: InputMaybe<Order_By>;
  Url?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyDashboardMapping_Min_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_min_fields";
  ColumnSize?: Maybe<Scalars["numeric"]["output"]>;
  CompanyDashboardMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyType?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  DashboardHeight?: Maybe<Scalars["numeric"]["output"]>;
  DashboardType?: Maybe<Scalars["String"]["output"]>;
  DisplayOrder?: Maybe<Scalars["numeric"]["output"]>;
  LocationUrl?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ReportName?: Maybe<Scalars["String"]["output"]>;
  Url?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Min_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  CompanyDashboardMappingGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyType?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DashboardType?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  LocationUrl?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ReportName?: InputMaybe<Order_By>;
  Url?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Mutation_Response = {
  __typename?: "Tbl_CompanyDashboardMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyDashboardMapping>;
};

/** on_conflict condition type for table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_On_Conflict = {
  constraint: Tbl_CompanyDashboardMapping_Constraint;
  update_columns?: Array<Tbl_CompanyDashboardMapping_Update_Column>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyDashboardMapping". */
export type Tbl_CompanyDashboardMapping_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  CompanyDashboardMappingGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyType?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DashboardType?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
  HideTabs?: InputMaybe<Order_By>;
  IFrameStyle?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  IsBorder?: InputMaybe<Order_By>;
  IsPowerBiReport?: InputMaybe<Order_By>;
  LocationUrl?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ReportName?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Url?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_CompanyDashboardMapping */
export type Tbl_CompanyDashboardMapping_Pk_Columns_Input = {
  CompanyDashboardMappingGuid: Scalars["uuid"]["input"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Tbl_CompanyDashboardMapping_Prepend_Input = {
  HideTabs?: InputMaybe<Scalars["jsonb"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** select columns of table "Tbl_CompanyDashboardMapping" */
export enum Tbl_CompanyDashboardMapping_Select_Column {
  /** column name */
  ColumnSize = "ColumnSize",
  /** column name */
  CompanyDashboardMappingGuid = "CompanyDashboardMappingGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyType = "CompanyType",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DashboardHeight = "DashboardHeight",
  /** column name */
  DashboardType = "DashboardType",
  /** column name */
  DisplayOrder = "DisplayOrder",
  /** column name */
  HideTabs = "HideTabs",
  /** column name */
  IFrameStyle = "IFrameStyle",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsBorder = "IsBorder",
  /** column name */
  IsPowerBiReport = "IsPowerBiReport",
  /** column name */
  LocationUrl = "LocationUrl",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  ReportName = "ReportName",
  /** column name */
  Url = "Url"
}

/** select "Tbl_CompanyDashboardMapping_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_CompanyDashboardMapping" */
export enum Tbl_CompanyDashboardMapping_Select_Column_Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsBorder = "IsBorder",
  /** column name */
  IsPowerBiReport = "IsPowerBiReport"
}

/** select "Tbl_CompanyDashboardMapping_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_CompanyDashboardMapping" */
export enum Tbl_CompanyDashboardMapping_Select_Column_Tbl_CompanyDashboardMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsBorder = "IsBorder",
  /** column name */
  IsPowerBiReport = "IsPowerBiReport"
}

/** input type for updating data in table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Set_Input = {
  ColumnSize?: InputMaybe<Scalars["numeric"]["input"]>;
  CompanyDashboardMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyType?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["numeric"]["input"]>;
  DashboardType?: InputMaybe<Scalars["String"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["numeric"]["input"]>;
  HideTabs?: InputMaybe<Scalars["jsonb"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["jsonb"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
  LocationUrl?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ReportName?: InputMaybe<Scalars["String"]["input"]>;
  Url?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_CompanyDashboardMapping_Stddev_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_stddev_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Stddev_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_CompanyDashboardMapping_Stddev_Pop_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_stddev_pop_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Stddev_Pop_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_CompanyDashboardMapping_Stddev_Samp_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_stddev_samp_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Stddev_Samp_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyDashboardMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyDashboardMapping_Stream_Cursor_Value_Input = {
  ColumnSize?: InputMaybe<Scalars["numeric"]["input"]>;
  CompanyDashboardMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyType?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["numeric"]["input"]>;
  DashboardType?: InputMaybe<Scalars["String"]["input"]>;
  DisplayOrder?: InputMaybe<Scalars["numeric"]["input"]>;
  HideTabs?: InputMaybe<Scalars["jsonb"]["input"]>;
  IFrameStyle?: InputMaybe<Scalars["jsonb"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
  LocationUrl?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  ReportName?: InputMaybe<Scalars["String"]["input"]>;
  Url?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_CompanyDashboardMapping_Sum_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_sum_fields";
  ColumnSize?: Maybe<Scalars["numeric"]["output"]>;
  DashboardHeight?: Maybe<Scalars["numeric"]["output"]>;
  DisplayOrder?: Maybe<Scalars["numeric"]["output"]>;
};

/** order by sum() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Sum_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_CompanyDashboardMapping" */
export enum Tbl_CompanyDashboardMapping_Update_Column {
  /** column name */
  ColumnSize = "ColumnSize",
  /** column name */
  CompanyDashboardMappingGuid = "CompanyDashboardMappingGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyType = "CompanyType",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DashboardHeight = "DashboardHeight",
  /** column name */
  DashboardType = "DashboardType",
  /** column name */
  DisplayOrder = "DisplayOrder",
  /** column name */
  HideTabs = "HideTabs",
  /** column name */
  IFrameStyle = "IFrameStyle",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsBorder = "IsBorder",
  /** column name */
  IsPowerBiReport = "IsPowerBiReport",
  /** column name */
  LocationUrl = "LocationUrl",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  ReportName = "ReportName",
  /** column name */
  Url = "Url"
}

export type Tbl_CompanyDashboardMapping_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Tbl_CompanyDashboardMapping_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_CompanyDashboardMapping_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Tbl_CompanyDashboardMapping_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyDashboardMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyDashboardMapping_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_CompanyDashboardMapping_Var_Pop_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_var_pop_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Var_Pop_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_CompanyDashboardMapping_Var_Samp_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_var_samp_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Var_Samp_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_CompanyDashboardMapping_Variance_Fields = {
  __typename?: "Tbl_CompanyDashboardMapping_variance_fields";
  ColumnSize?: Maybe<Scalars["Float"]["output"]>;
  DashboardHeight?: Maybe<Scalars["Float"]["output"]>;
  DisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_CompanyDashboardMapping" */
export type Tbl_CompanyDashboardMapping_Variance_Order_By = {
  ColumnSize?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  DisplayOrder?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails = {
  __typename?: "Tbl_CompanyGeneralDetails";
  CompanyGeneralDetailsGuid: Scalars["uuid"]["output"];
  CompanyGuid: Scalars["uuid"]["output"];
  CompanyRegistrationNumber?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  IsGstverified?: Maybe<Scalars["Int"]["output"]>;
  LegalStructureGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Int"]["output"]>;
  PANCardNumber?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_Company: Tbl_Companies;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  YearEstablished?: Maybe<Scalars["Int"]["output"]>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** aggregated selection of "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Aggregate = {
  __typename?: "Tbl_CompanyGeneralDetails_aggregate";
  aggregate?: Maybe<Tbl_CompanyGeneralDetails_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyGeneralDetails>;
};

export type Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Aggregate_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_aggregate_fields";
  avg?: Maybe<Tbl_CompanyGeneralDetails_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyGeneralDetails_Max_Fields>;
  min?: Maybe<Tbl_CompanyGeneralDetails_Min_Fields>;
  stddev?: Maybe<Tbl_CompanyGeneralDetails_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_CompanyGeneralDetails_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_CompanyGeneralDetails_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_CompanyGeneralDetails_Sum_Fields>;
  var_pop?: Maybe<Tbl_CompanyGeneralDetails_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_CompanyGeneralDetails_Var_Samp_Fields>;
  variance?: Maybe<Tbl_CompanyGeneralDetails_Variance_Fields>;
};

/** aggregate fields of "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_CompanyGeneralDetails_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyGeneralDetails_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyGeneralDetails_Min_Order_By>;
  stddev?: InputMaybe<Tbl_CompanyGeneralDetails_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_CompanyGeneralDetails_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_CompanyGeneralDetails_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_CompanyGeneralDetails_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_CompanyGeneralDetails_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_CompanyGeneralDetails_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_CompanyGeneralDetails_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyGeneralDetails_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyGeneralDetails_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_CompanyGeneralDetails_Avg_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_avg_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Avg_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyGeneralDetails". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyGeneralDetails_Bool_Exp = {
  CompanyGeneralDetailsGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyRegistrationNumber?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  GSTNumber?: InputMaybe<String_Comparison_Exp>;
  IsGstverified?: InputMaybe<Int_Comparison_Exp>;
  LegalStructureGuid?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  NumberOfPartners?: InputMaybe<Int_Comparison_Exp>;
  PANCardNumber?: InputMaybe<String_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  YearEstablished?: InputMaybe<Int_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_CompanyGeneralDetails" */
export enum Tbl_CompanyGeneralDetails_Constraint {
  /** unique or primary key constraint on columns "CompanyGeneralDetailsGuid" */
  TblCompanyGeneralDetailsPkey = "Tbl_CompanyGeneralDetails_pkey"
}

/** input type for incrementing numeric columns in table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Inc_Input = {
  IsGstverified?: InputMaybe<Scalars["Int"]["input"]>;
  NumberOfPartners?: InputMaybe<Scalars["Int"]["input"]>;
  YearEstablished?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Insert_Input = {
  CompanyGeneralDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRegistrationNumber?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsGstverified?: InputMaybe<Scalars["Int"]["input"]>;
  LegalStructureGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfPartners?: InputMaybe<Scalars["Int"]["input"]>;
  PANCardNumber?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  YearEstablished?: InputMaybe<Scalars["Int"]["input"]>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyGeneralDetails_Max_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_max_fields";
  CompanyGeneralDetailsGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyRegistrationNumber?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  IsGstverified?: Maybe<Scalars["Int"]["output"]>;
  LegalStructureGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Int"]["output"]>;
  PANCardNumber?: Maybe<Scalars["String"]["output"]>;
  YearEstablished?: Maybe<Scalars["Int"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Max_Order_By = {
  CompanyGeneralDetailsGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRegistrationNumber?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  IsGstverified?: InputMaybe<Order_By>;
  LegalStructureGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  PANCardNumber?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyGeneralDetails_Min_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_min_fields";
  CompanyGeneralDetailsGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyRegistrationNumber?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  GSTNumber?: Maybe<Scalars["String"]["output"]>;
  IsGstverified?: Maybe<Scalars["Int"]["output"]>;
  LegalStructureGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Int"]["output"]>;
  PANCardNumber?: Maybe<Scalars["String"]["output"]>;
  YearEstablished?: Maybe<Scalars["Int"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Min_Order_By = {
  CompanyGeneralDetailsGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRegistrationNumber?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  IsGstverified?: InputMaybe<Order_By>;
  LegalStructureGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  PANCardNumber?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Mutation_Response = {
  __typename?: "Tbl_CompanyGeneralDetails_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyGeneralDetails>;
};

/** on_conflict condition type for table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_On_Conflict = {
  constraint: Tbl_CompanyGeneralDetails_Constraint;
  update_columns?: Array<Tbl_CompanyGeneralDetails_Update_Column>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyGeneralDetails". */
export type Tbl_CompanyGeneralDetails_Order_By = {
  CompanyGeneralDetailsGuid?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRegistrationNumber?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  GSTNumber?: InputMaybe<Order_By>;
  IsGstverified?: InputMaybe<Order_By>;
  LegalStructureGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  PANCardNumber?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyGeneralDetails */
export type Tbl_CompanyGeneralDetails_Pk_Columns_Input = {
  CompanyGeneralDetailsGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyGeneralDetails" */
export enum Tbl_CompanyGeneralDetails_Select_Column {
  /** column name */
  CompanyGeneralDetailsGuid = "CompanyGeneralDetailsGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyRegistrationNumber = "CompanyRegistrationNumber",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  GstNumber = "GSTNumber",
  /** column name */
  IsGstverified = "IsGstverified",
  /** column name */
  LegalStructureGuid = "LegalStructureGuid",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  NumberOfPartners = "NumberOfPartners",
  /** column name */
  PanCardNumber = "PANCardNumber",
  /** column name */
  YearEstablished = "YearEstablished"
}

/** input type for updating data in table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Set_Input = {
  CompanyGeneralDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRegistrationNumber?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsGstverified?: InputMaybe<Scalars["Int"]["input"]>;
  LegalStructureGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfPartners?: InputMaybe<Scalars["Int"]["input"]>;
  PANCardNumber?: InputMaybe<Scalars["String"]["input"]>;
  YearEstablished?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_CompanyGeneralDetails_Stddev_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_stddev_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Stddev_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_CompanyGeneralDetails_Stddev_Pop_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_stddev_pop_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Stddev_Pop_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_CompanyGeneralDetails_Stddev_Samp_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_stddev_samp_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Stddev_Samp_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyGeneralDetails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyGeneralDetails_Stream_Cursor_Value_Input = {
  CompanyGeneralDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRegistrationNumber?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  GSTNumber?: InputMaybe<Scalars["String"]["input"]>;
  IsGstverified?: InputMaybe<Scalars["Int"]["input"]>;
  LegalStructureGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfPartners?: InputMaybe<Scalars["Int"]["input"]>;
  PANCardNumber?: InputMaybe<Scalars["String"]["input"]>;
  YearEstablished?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_CompanyGeneralDetails_Sum_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_sum_fields";
  IsGstverified?: Maybe<Scalars["Int"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Int"]["output"]>;
  YearEstablished?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Sum_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_CompanyGeneralDetails" */
export enum Tbl_CompanyGeneralDetails_Update_Column {
  /** column name */
  CompanyGeneralDetailsGuid = "CompanyGeneralDetailsGuid",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyRegistrationNumber = "CompanyRegistrationNumber",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  GstNumber = "GSTNumber",
  /** column name */
  IsGstverified = "IsGstverified",
  /** column name */
  LegalStructureGuid = "LegalStructureGuid",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  NumberOfPartners = "NumberOfPartners",
  /** column name */
  PanCardNumber = "PANCardNumber",
  /** column name */
  YearEstablished = "YearEstablished"
}

export type Tbl_CompanyGeneralDetails_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_CompanyGeneralDetails_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyGeneralDetails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyGeneralDetails_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_CompanyGeneralDetails_Var_Pop_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_var_pop_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Var_Pop_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_CompanyGeneralDetails_Var_Samp_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_var_samp_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Var_Samp_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_CompanyGeneralDetails_Variance_Fields = {
  __typename?: "Tbl_CompanyGeneralDetails_variance_fields";
  IsGstverified?: Maybe<Scalars["Float"]["output"]>;
  NumberOfPartners?: Maybe<Scalars["Float"]["output"]>;
  YearEstablished?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_CompanyGeneralDetails" */
export type Tbl_CompanyGeneralDetails_Variance_Order_By = {
  IsGstverified?: InputMaybe<Order_By>;
  NumberOfPartners?: InputMaybe<Order_By>;
  YearEstablished?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping = {
  __typename?: "Tbl_CompanyRoleMapping";
  BusinessReady?: Maybe<Scalars["Boolean"]["output"]>;
  CompanyGuid: Scalars["uuid"]["output"];
  CompanyRoleMappingGuid: Scalars["uuid"]["output"];
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid: Scalars["uuid"]["output"];
  StatusGuid: Scalars["uuid"]["output"];
  /** An object relationship */
  Tbl_Company: Tbl_Companies;
  /** An object relationship */
  Tbl_CompanyStatusMaster: Tbl_CompanyStatusMaster;
  /** An object relationship */
  Tbl_Role: Tbl_Roles;
};

/** aggregated selection of "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Aggregate = {
  __typename?: "Tbl_CompanyRoleMapping_aggregate";
  aggregate?: Maybe<Tbl_CompanyRoleMapping_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyRoleMapping>;
};

export type Tbl_CompanyRoleMapping_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_CompanyRoleMapping_Select_Column_Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_CompanyRoleMapping_Select_Column_Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Aggregate_Fields = {
  __typename?: "Tbl_CompanyRoleMapping_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyRoleMapping_Max_Fields>;
  min?: Maybe<Tbl_CompanyRoleMapping_Min_Fields>;
};

/** aggregate fields of "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyRoleMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyRoleMapping_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyRoleMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyRoleMapping_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyRoleMapping". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyRoleMapping_Bool_Exp = {
  BusinessReady?: InputMaybe<Boolean_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyRoleMappingGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  StatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_CompanyStatusMaster?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyRoleMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyRoleMapping_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_CompanyRoleMapping" */
export enum Tbl_CompanyRoleMapping_Constraint {
  /** unique or primary key constraint on columns "CompanyRoleMappingGuid" */
  TblCompanyRoleMappingPkey = "Tbl_CompanyRoleMapping_pkey"
}

/** input type for inserting data into table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Insert_Input = {
  BusinessReady?: InputMaybe<Scalars["Boolean"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_CompanyStatusMaster?: InputMaybe<Tbl_CompanyStatusMaster_Obj_Rel_Insert_Input>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyRoleMapping_Max_Fields = {
  __typename?: "Tbl_CompanyRoleMapping_max_fields";
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyRoleMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Max_Order_By = {
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRoleMappingGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyRoleMapping_Min_Fields = {
  __typename?: "Tbl_CompanyRoleMapping_min_fields";
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyRoleMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Min_Order_By = {
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRoleMappingGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Mutation_Response = {
  __typename?: "Tbl_CompanyRoleMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyRoleMapping>;
};

/** on_conflict condition type for table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_On_Conflict = {
  constraint: Tbl_CompanyRoleMapping_Constraint;
  update_columns?: Array<Tbl_CompanyRoleMapping_Update_Column>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyRoleMapping". */
export type Tbl_CompanyRoleMapping_Order_By = {
  BusinessReady?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyRoleMappingGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_CompanyStatusMaster?: InputMaybe<Tbl_CompanyStatusMaster_Order_By>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyRoleMapping */
export type Tbl_CompanyRoleMapping_Pk_Columns_Input = {
  CompanyRoleMappingGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyRoleMapping" */
export enum Tbl_CompanyRoleMapping_Select_Column {
  /** column name */
  BusinessReady = "BusinessReady",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyRoleMappingGuid = "CompanyRoleMappingGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  StatusGuid = "StatusGuid"
}

/** select "Tbl_CompanyRoleMapping_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_CompanyRoleMapping" */
export enum Tbl_CompanyRoleMapping_Select_Column_Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  BusinessReady = "BusinessReady"
}

/** select "Tbl_CompanyRoleMapping_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_CompanyRoleMapping" */
export enum Tbl_CompanyRoleMapping_Select_Column_Tbl_CompanyRoleMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  BusinessReady = "BusinessReady"
}

/** input type for updating data in table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Set_Input = {
  BusinessReady?: InputMaybe<Scalars["Boolean"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CompanyRoleMapping" */
export type Tbl_CompanyRoleMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyRoleMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyRoleMapping_Stream_Cursor_Value_Input = {
  BusinessReady?: InputMaybe<Scalars["Boolean"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_CompanyRoleMapping" */
export enum Tbl_CompanyRoleMapping_Update_Column {
  /** column name */
  BusinessReady = "BusinessReady",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyRoleMappingGuid = "CompanyRoleMappingGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  StatusGuid = "StatusGuid"
}

export type Tbl_CompanyRoleMapping_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyRoleMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyRoleMapping_Bool_Exp;
};

/** columns and relationships of "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog = {
  __typename?: "Tbl_CompanyStatusLog";
  Comment?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyStatusLogGuid: Scalars["uuid"]["output"];
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NewStatusGuid: Scalars["uuid"]["output"];
  OldStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
};

/** aggregated selection of "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Aggregate = {
  __typename?: "Tbl_CompanyStatusLog_aggregate";
  aggregate?: Maybe<Tbl_CompanyStatusLog_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyStatusLog>;
};

export type Tbl_CompanyStatusLog_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_CompanyStatusLog_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyStatusLog_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Aggregate_Fields = {
  __typename?: "Tbl_CompanyStatusLog_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyStatusLog_Max_Fields>;
  min?: Maybe<Tbl_CompanyStatusLog_Min_Fields>;
};

/** aggregate fields of "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyStatusLog_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyStatusLog_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyStatusLog_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyStatusLog_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyStatusLog". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyStatusLog_Bool_Exp = {
  Comment?: InputMaybe<String_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyStatusLogGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  NewStatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  OldStatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyStatusLog_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyStatusLog_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_CompanyStatusLog" */
export enum Tbl_CompanyStatusLog_Constraint {
  /** unique or primary key constraint on columns "CompanyStatusLogGuid" */
  TblCompanyStatusLogPkey = "Tbl_CompanyStatusLog_pkey"
}

/** input type for inserting data into table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Insert_Input = {
  Comment?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusLogGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NewStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  OldStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyStatusLog_Max_Fields = {
  __typename?: "Tbl_CompanyStatusLog_max_fields";
  Comment?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyStatusLogGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NewStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  OldStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Max_Order_By = {
  Comment?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyStatusLogGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  NewStatusGuid?: InputMaybe<Order_By>;
  OldStatusGuid?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyStatusLog_Min_Fields = {
  __typename?: "Tbl_CompanyStatusLog_min_fields";
  Comment?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyStatusLogGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NewStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  OldStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Min_Order_By = {
  Comment?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyStatusLogGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  NewStatusGuid?: InputMaybe<Order_By>;
  OldStatusGuid?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Mutation_Response = {
  __typename?: "Tbl_CompanyStatusLog_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyStatusLog>;
};

/** on_conflict condition type for table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_On_Conflict = {
  constraint: Tbl_CompanyStatusLog_Constraint;
  update_columns?: Array<Tbl_CompanyStatusLog_Update_Column>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyStatusLog". */
export type Tbl_CompanyStatusLog_Order_By = {
  Comment?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CompanyStatusLogGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  NewStatusGuid?: InputMaybe<Order_By>;
  OldStatusGuid?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyStatusLog */
export type Tbl_CompanyStatusLog_Pk_Columns_Input = {
  CompanyStatusLogGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyStatusLog" */
export enum Tbl_CompanyStatusLog_Select_Column {
  /** column name */
  Comment = "Comment",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyStatusLogGuid = "CompanyStatusLogGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  NewStatusGuid = "NewStatusGuid",
  /** column name */
  OldStatusGuid = "OldStatusGuid",
  /** column name */
  RoleGuid = "RoleGuid"
}

/** input type for updating data in table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Set_Input = {
  Comment?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusLogGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NewStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  OldStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CompanyStatusLog" */
export type Tbl_CompanyStatusLog_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyStatusLog_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyStatusLog_Stream_Cursor_Value_Input = {
  Comment?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusLogGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NewStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  OldStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_CompanyStatusLog" */
export enum Tbl_CompanyStatusLog_Update_Column {
  /** column name */
  Comment = "Comment",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CompanyStatusLogGuid = "CompanyStatusLogGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  NewStatusGuid = "NewStatusGuid",
  /** column name */
  OldStatusGuid = "OldStatusGuid",
  /** column name */
  RoleGuid = "RoleGuid"
}

export type Tbl_CompanyStatusLog_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyStatusLog_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyStatusLog_Bool_Exp;
};

/** columns and relationships of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster = {
  __typename?: "Tbl_CompanyStatusMaster";
  CompanyStatusGuid: Scalars["uuid"]["output"];
  CompanyStatusName: Scalars["String"]["output"];
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  /** An array relationship */
  Tbl_CompanyRoleMappings: Array<Tbl_CompanyRoleMapping>;
  /** An aggregate relationship */
  Tbl_CompanyRoleMappings_aggregate: Tbl_CompanyRoleMapping_Aggregate;
  /** An object relationship */
  Tbl_Role?: Maybe<Tbl_Roles>;
};

/** columns and relationships of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMasterTbl_CompanyRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMasterTbl_CompanyRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** aggregated selection of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Aggregate = {
  __typename?: "Tbl_CompanyStatusMaster_aggregate";
  aggregate?: Maybe<Tbl_CompanyStatusMaster_Aggregate_Fields>;
  nodes: Array<Tbl_CompanyStatusMaster>;
};

export type Tbl_CompanyStatusMaster_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_CompanyStatusMaster_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CompanyStatusMaster_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Aggregate_Fields = {
  __typename?: "Tbl_CompanyStatusMaster_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CompanyStatusMaster_Max_Fields>;
  min?: Maybe<Tbl_CompanyStatusMaster_Min_Fields>;
};

/** aggregate fields of "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CompanyStatusMaster_Max_Order_By>;
  min?: InputMaybe<Tbl_CompanyStatusMaster_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CompanyStatusMaster_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyStatusMaster_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CompanyStatusMaster". All fields are combined with a logical 'AND'. */
export type Tbl_CompanyStatusMaster_Bool_Exp = {
  CompanyStatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CompanyStatusName?: InputMaybe<String_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CompanyStatusMaster_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CompanyStatusMaster_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_CompanyStatusMaster" */
export enum Tbl_CompanyStatusMaster_Constraint {
  /** unique or primary key constraint on columns "CompanyStatusGuid" */
  TblCompanyStatusMasterPkey = "Tbl_CompanyStatusMaster_pkey"
}

/** input type for inserting data into table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Insert_Input = {
  CompanyStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusName?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Arr_Rel_Insert_Input>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CompanyStatusMaster_Max_Fields = {
  __typename?: "Tbl_CompanyStatusMaster_max_fields";
  CompanyStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyStatusName?: Maybe<Scalars["String"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Max_Order_By = {
  CompanyStatusGuid?: InputMaybe<Order_By>;
  CompanyStatusName?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CompanyStatusMaster_Min_Fields = {
  __typename?: "Tbl_CompanyStatusMaster_min_fields";
  CompanyStatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  CompanyStatusName?: Maybe<Scalars["String"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Min_Order_By = {
  CompanyStatusGuid?: InputMaybe<Order_By>;
  CompanyStatusName?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Mutation_Response = {
  __typename?: "Tbl_CompanyStatusMaster_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CompanyStatusMaster>;
};

/** input type for inserting object relation for remote table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Obj_Rel_Insert_Input = {
  data: Tbl_CompanyStatusMaster_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CompanyStatusMaster_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_On_Conflict = {
  constraint: Tbl_CompanyStatusMaster_Constraint;
  update_columns?: Array<Tbl_CompanyStatusMaster_Update_Column>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CompanyStatusMaster". */
export type Tbl_CompanyStatusMaster_Order_By = {
  CompanyStatusGuid?: InputMaybe<Order_By>;
  CompanyStatusName?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Order_By>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Order_By>;
};

/** primary key columns input for table: Tbl_CompanyStatusMaster */
export type Tbl_CompanyStatusMaster_Pk_Columns_Input = {
  CompanyStatusGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CompanyStatusMaster" */
export enum Tbl_CompanyStatusMaster_Select_Column {
  /** column name */
  CompanyStatusGuid = "CompanyStatusGuid",
  /** column name */
  CompanyStatusName = "CompanyStatusName",
  /** column name */
  RoleGuid = "RoleGuid"
}

/** input type for updating data in table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Set_Input = {
  CompanyStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusName?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CompanyStatusMaster" */
export type Tbl_CompanyStatusMaster_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CompanyStatusMaster_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CompanyStatusMaster_Stream_Cursor_Value_Input = {
  CompanyStatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CompanyStatusName?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_CompanyStatusMaster" */
export enum Tbl_CompanyStatusMaster_Update_Column {
  /** column name */
  CompanyStatusGuid = "CompanyStatusGuid",
  /** column name */
  CompanyStatusName = "CompanyStatusName",
  /** column name */
  RoleGuid = "RoleGuid"
}

export type Tbl_CompanyStatusMaster_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CompanyStatusMaster_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CompanyStatusMaster_Bool_Exp;
};

/** columns and relationships of "Tbl_CountryMaster" */
export type Tbl_CountryMaster = {
  __typename?: "Tbl_CountryMaster";
  CountryCode: Scalars["String"]["output"];
  CountryGuid: Scalars["uuid"]["output"];
  CountryName: Scalars["String"]["output"];
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Image?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  MobileCode?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RegionGuid?: Maybe<Scalars["uuid"]["output"]>;
  StatusForSupplier?: Maybe<Scalars["Boolean"]["output"]>;
  /** An array relationship */
  Tbl_CompanyCountries: Array<Tbl_CompanyCountry>;
  /** An aggregate relationship */
  Tbl_CompanyCountries_aggregate: Tbl_CompanyCountry_Aggregate;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** columns and relationships of "Tbl_CountryMaster" */
export type Tbl_CountryMasterTbl_CompanyCountriesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

/** columns and relationships of "Tbl_CountryMaster" */
export type Tbl_CountryMasterTbl_CompanyCountries_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

/** aggregated selection of "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Aggregate = {
  __typename?: "Tbl_CountryMaster_aggregate";
  aggregate?: Maybe<Tbl_CountryMaster_Aggregate_Fields>;
  nodes: Array<Tbl_CountryMaster>;
};

export type Tbl_CountryMaster_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_CountryMaster_Aggregate_Bool_Exp_Count>;
};

export type Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_CountryMaster_Select_Column_Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_CountryMaster_Select_Column_Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_CountryMaster_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Aggregate_Fields = {
  __typename?: "Tbl_CountryMaster_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_CountryMaster_Max_Fields>;
  min?: Maybe<Tbl_CountryMaster_Min_Fields>;
};

/** aggregate fields of "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_CountryMaster_Max_Order_By>;
  min?: InputMaybe<Tbl_CountryMaster_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Arr_Rel_Insert_Input = {
  data: Array<Tbl_CountryMaster_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CountryMaster_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_CountryMaster". All fields are combined with a logical 'AND'. */
export type Tbl_CountryMaster_Bool_Exp = {
  CountryCode?: InputMaybe<String_Comparison_Exp>;
  CountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CountryName?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Image?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  MobileCode?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  RegionGuid?: InputMaybe<Uuid_Comparison_Exp>;
  StatusForSupplier?: InputMaybe<Boolean_Comparison_Exp>;
  Tbl_CompanyCountries?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
  Tbl_CompanyCountries_aggregate?: InputMaybe<Tbl_CompanyCountry_Aggregate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_CountryMaster_Bool_Exp>>;
  _not?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_CountryMaster_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_CountryMaster" */
export enum Tbl_CountryMaster_Constraint {
  /** unique or primary key constraint on columns "CountryGuid" */
  TblCountryMasterPkey = "Tbl_CountryMaster_pkey"
}

/** input type for inserting data into table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Insert_Input = {
  CountryCode?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MobileCode?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RegionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusForSupplier?: InputMaybe<Scalars["Boolean"]["input"]>;
  Tbl_CompanyCountries?: InputMaybe<Tbl_CompanyCountry_Arr_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_CountryMaster_Max_Fields = {
  __typename?: "Tbl_CountryMaster_max_fields";
  CountryCode?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryName?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Image?: Maybe<Scalars["String"]["output"]>;
  MobileCode?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RegionGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Max_Order_By = {
  CountryCode?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CountryName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  MobileCode?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RegionGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_CountryMaster_Min_Fields = {
  __typename?: "Tbl_CountryMaster_min_fields";
  CountryCode?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CountryName?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Image?: Maybe<Scalars["String"]["output"]>;
  MobileCode?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RegionGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Min_Order_By = {
  CountryCode?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CountryName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  MobileCode?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RegionGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Mutation_Response = {
  __typename?: "Tbl_CountryMaster_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_CountryMaster>;
};

/** input type for inserting object relation for remote table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Obj_Rel_Insert_Input = {
  data: Tbl_CountryMaster_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_CountryMaster_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_On_Conflict = {
  constraint: Tbl_CountryMaster_Constraint;
  update_columns?: Array<Tbl_CountryMaster_Update_Column>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_CountryMaster". */
export type Tbl_CountryMaster_Order_By = {
  CountryCode?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CountryName?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Image?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  MobileCode?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RegionGuid?: InputMaybe<Order_By>;
  StatusForSupplier?: InputMaybe<Order_By>;
  Tbl_CompanyCountries_aggregate?: InputMaybe<Tbl_CompanyCountry_Aggregate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_CountryMaster */
export type Tbl_CountryMaster_Pk_Columns_Input = {
  CountryGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_CountryMaster" */
export enum Tbl_CountryMaster_Select_Column {
  /** column name */
  CountryCode = "CountryCode",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CountryName = "CountryName",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Image = "Image",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  MobileCode = "MobileCode",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RegionGuid = "RegionGuid",
  /** column name */
  StatusForSupplier = "StatusForSupplier"
}

/** select "Tbl_CountryMaster_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_CountryMaster" */
export enum Tbl_CountryMaster_Select_Column_Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  StatusForSupplier = "StatusForSupplier"
}

/** select "Tbl_CountryMaster_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_CountryMaster" */
export enum Tbl_CountryMaster_Select_Column_Tbl_CountryMaster_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  StatusForSupplier = "StatusForSupplier"
}

/** input type for updating data in table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Set_Input = {
  CountryCode?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MobileCode?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RegionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusForSupplier?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Streaming cursor of the table "Tbl_CountryMaster" */
export type Tbl_CountryMaster_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_CountryMaster_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_CountryMaster_Stream_Cursor_Value_Input = {
  CountryCode?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CountryName?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Image?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MobileCode?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RegionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusForSupplier?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** update columns of table "Tbl_CountryMaster" */
export enum Tbl_CountryMaster_Update_Column {
  /** column name */
  CountryCode = "CountryCode",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CountryName = "CountryName",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Image = "Image",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  MobileCode = "MobileCode",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RegionGuid = "RegionGuid",
  /** column name */
  StatusForSupplier = "StatusForSupplier"
}

export type Tbl_CountryMaster_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_CountryMaster_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_CountryMaster_Bool_Exp;
};

/** columns and relationships of "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter = {
  __typename?: "Tbl_EmailHeaderFooter";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailHeaderFooterGUID: Scalars["uuid"]["output"];
  HTML?: Maybe<Scalars["String"]["output"]>;
  HeaderFooterName?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** aggregated selection of "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Aggregate = {
  __typename?: "Tbl_EmailHeaderFooter_aggregate";
  aggregate?: Maybe<Tbl_EmailHeaderFooter_Aggregate_Fields>;
  nodes: Array<Tbl_EmailHeaderFooter>;
};

export type Tbl_EmailHeaderFooter_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_EmailHeaderFooter_Aggregate_Bool_Exp_Count>;
};

export type Tbl_EmailHeaderFooter_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Aggregate_Fields = {
  __typename?: "Tbl_EmailHeaderFooter_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_EmailHeaderFooter_Max_Fields>;
  min?: Maybe<Tbl_EmailHeaderFooter_Min_Fields>;
};

/** aggregate fields of "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_EmailHeaderFooter_Max_Order_By>;
  min?: InputMaybe<Tbl_EmailHeaderFooter_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Arr_Rel_Insert_Input = {
  data: Array<Tbl_EmailHeaderFooter_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_EmailHeaderFooter_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_EmailHeaderFooter". All fields are combined with a logical 'AND'. */
export type Tbl_EmailHeaderFooter_Bool_Exp = {
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  EmailHeaderFooterGUID?: InputMaybe<Uuid_Comparison_Exp>;
  HTML?: InputMaybe<String_Comparison_Exp>;
  HeaderFooterName?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_EmailHeaderFooter_Bool_Exp>>;
  _not?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_EmailHeaderFooter_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_EmailHeaderFooter" */
export enum Tbl_EmailHeaderFooter_Constraint {
  /** unique or primary key constraint on columns "EmailHeaderFooterGUID" */
  TblEmailHeaderFooterPkey = "Tbl_EmailHeaderFooter_pkey"
}

/** input type for inserting data into table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Insert_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  HTML?: InputMaybe<Scalars["String"]["input"]>;
  HeaderFooterName?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_EmailHeaderFooter_Max_Fields = {
  __typename?: "Tbl_EmailHeaderFooter_max_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailHeaderFooterGUID?: Maybe<Scalars["uuid"]["output"]>;
  HTML?: Maybe<Scalars["String"]["output"]>;
  HeaderFooterName?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by max() on columns of table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Max_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  HTML?: InputMaybe<Order_By>;
  HeaderFooterName?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_EmailHeaderFooter_Min_Fields = {
  __typename?: "Tbl_EmailHeaderFooter_min_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailHeaderFooterGUID?: Maybe<Scalars["uuid"]["output"]>;
  HTML?: Maybe<Scalars["String"]["output"]>;
  HeaderFooterName?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** order by min() on columns of table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Min_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  HTML?: InputMaybe<Order_By>;
  HeaderFooterName?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Mutation_Response = {
  __typename?: "Tbl_EmailHeaderFooter_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_EmailHeaderFooter>;
};

/** on_conflict condition type for table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_On_Conflict = {
  constraint: Tbl_EmailHeaderFooter_Constraint;
  update_columns?: Array<Tbl_EmailHeaderFooter_Update_Column>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_EmailHeaderFooter". */
export type Tbl_EmailHeaderFooter_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  HTML?: InputMaybe<Order_By>;
  HeaderFooterName?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_EmailHeaderFooter */
export type Tbl_EmailHeaderFooter_Pk_Columns_Input = {
  EmailHeaderFooterGUID: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_EmailHeaderFooter" */
export enum Tbl_EmailHeaderFooter_Select_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailHeaderFooterGuid = "EmailHeaderFooterGUID",
  /** column name */
  Html = "HTML",
  /** column name */
  HeaderFooterName = "HeaderFooterName",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

/** input type for updating data in table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Set_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  HTML?: InputMaybe<Scalars["String"]["input"]>;
  HeaderFooterName?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** Streaming cursor of the table "Tbl_EmailHeaderFooter" */
export type Tbl_EmailHeaderFooter_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_EmailHeaderFooter_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_EmailHeaderFooter_Stream_Cursor_Value_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  HTML?: InputMaybe<Scalars["String"]["input"]>;
  HeaderFooterName?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** update columns of table "Tbl_EmailHeaderFooter" */
export enum Tbl_EmailHeaderFooter_Update_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailHeaderFooterGuid = "EmailHeaderFooterGUID",
  /** column name */
  Html = "HTML",
  /** column name */
  HeaderFooterName = "HeaderFooterName",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate"
}

export type Tbl_EmailHeaderFooter_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_EmailHeaderFooter_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_EmailHeaderFooter_Bool_Exp;
};

/** columns and relationships of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate = {
  __typename?: "Tbl_EmailTemplate";
  BCCEmailId?: Maybe<Scalars["String"]["output"]>;
  Body?: Maybe<Scalars["String"]["output"]>;
  CCEmailId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  EmailHeaderFooterGUID?: Maybe<Scalars["uuid"]["output"]>;
  EmailTemplateGUID: Scalars["uuid"]["output"];
  EmailTemplateName?: Maybe<Scalars["String"]["output"]>;
  FromEmailId?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Subject?: Maybe<Scalars["String"]["output"]>;
  /** An array relationship */
  Tbl_EmailTemplateNotificationDetails: Array<Tbl_EmailTemplateNotificationDetails>;
  /** An aggregate relationship */
  Tbl_EmailTemplateNotificationDetails_aggregate: Tbl_EmailTemplateNotificationDetails_Aggregate;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  ToEmailId?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** columns and relationships of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplateTbl_EmailTemplateNotificationDetailsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplateTbl_EmailTemplateNotificationDetails_AggregateArgs =
  {
    distinct_on?: InputMaybe<
      Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
    >;
    limit?: InputMaybe<Scalars["Int"]["input"]>;
    offset?: InputMaybe<Scalars["Int"]["input"]>;
    order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
    where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  };

/** columns and relationships of "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails = {
  __typename?: "Tbl_EmailTemplateNotificationDetails";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailTemplateGuid?: Maybe<Scalars["uuid"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  /** An object relationship */
  Tbl_EmailTemplate?: Maybe<Tbl_EmailTemplate>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  UserEmailTemplateNotificationGuid: Scalars["uuid"]["output"];
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** aggregated selection of "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Aggregate = {
  __typename?: "Tbl_EmailTemplateNotificationDetails_aggregate";
  aggregate?: Maybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Fields>;
  nodes: Array<Tbl_EmailTemplateNotificationDetails>;
};

export type Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Count>;
};

export type Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_EmailTemplateNotificationDetails_Select_Column_Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_EmailTemplateNotificationDetails_Select_Column_Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Aggregate_Fields = {
  __typename?: "Tbl_EmailTemplateNotificationDetails_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_EmailTemplateNotificationDetails_Max_Fields>;
  min?: Maybe<Tbl_EmailTemplateNotificationDetails_Min_Fields>;
};

/** aggregate fields of "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Max_Order_By>;
  min?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Arr_Rel_Insert_Input = {
  data: Array<Tbl_EmailTemplateNotificationDetails_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_EmailTemplateNotificationDetails_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_EmailTemplateNotificationDetails". All fields are combined with a logical 'AND'. */
export type Tbl_EmailTemplateNotificationDetails_Bool_Exp = {
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  EmailTemplateGuid?: InputMaybe<Uuid_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Tbl_EmailTemplate?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Bool_Exp>>;
  _not?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_EmailTemplateNotificationDetails" */
export enum Tbl_EmailTemplateNotificationDetails_Constraint {
  /** unique or primary key constraint on columns "UserEmailTemplateNotificationGuid" */
  TblEmailTemplateNotificationDetailsPkey = "Tbl_EmailTemplateNotificationDetails_pkey"
}

/** input type for inserting data into table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Insert_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailTemplateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Tbl_EmailTemplate?: InputMaybe<Tbl_EmailTemplate_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_EmailTemplateNotificationDetails_Max_Fields = {
  __typename?: "Tbl_EmailTemplateNotificationDetails_max_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailTemplateGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserEmailTemplateNotificationGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Max_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  EmailTemplateGuid?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_EmailTemplateNotificationDetails_Min_Fields = {
  __typename?: "Tbl_EmailTemplateNotificationDetails_min_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailTemplateGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserEmailTemplateNotificationGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Min_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  EmailTemplateGuid?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Mutation_Response = {
  __typename?: "Tbl_EmailTemplateNotificationDetails_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_EmailTemplateNotificationDetails>;
};

/** on_conflict condition type for table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_On_Conflict = {
  constraint: Tbl_EmailTemplateNotificationDetails_Constraint;
  update_columns?: Array<Tbl_EmailTemplateNotificationDetails_Update_Column>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_EmailTemplateNotificationDetails". */
export type Tbl_EmailTemplateNotificationDetails_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  EmailTemplateGuid?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Tbl_EmailTemplate?: InputMaybe<Tbl_EmailTemplate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_EmailTemplateNotificationDetails */
export type Tbl_EmailTemplateNotificationDetails_Pk_Columns_Input = {
  UserEmailTemplateNotificationGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_EmailTemplateNotificationDetails" */
export enum Tbl_EmailTemplateNotificationDetails_Select_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailTemplateGuid = "EmailTemplateGuid",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  UserEmailTemplateNotificationGuid = "UserEmailTemplateNotificationGuid",
  /** column name */
  UserGuid = "UserGuid"
}

/** select "Tbl_EmailTemplateNotificationDetails_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_EmailTemplateNotificationDetails" */
export enum Tbl_EmailTemplateNotificationDetails_Select_Column_Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_EmailTemplateNotificationDetails_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_EmailTemplateNotificationDetails" */
export enum Tbl_EmailTemplateNotificationDetails_Select_Column_Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Set_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailTemplateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_EmailTemplateNotificationDetails" */
export type Tbl_EmailTemplateNotificationDetails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_EmailTemplateNotificationDetails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_EmailTemplateNotificationDetails_Stream_Cursor_Value_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailTemplateGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserEmailTemplateNotificationGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_EmailTemplateNotificationDetails" */
export enum Tbl_EmailTemplateNotificationDetails_Update_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailTemplateGuid = "EmailTemplateGuid",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  UserEmailTemplateNotificationGuid = "UserEmailTemplateNotificationGuid",
  /** column name */
  UserGuid = "UserGuid"
}

export type Tbl_EmailTemplateNotificationDetails_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_EmailTemplateNotificationDetails_Bool_Exp;
};

/** aggregated selection of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Aggregate = {
  __typename?: "Tbl_EmailTemplate_aggregate";
  aggregate?: Maybe<Tbl_EmailTemplate_Aggregate_Fields>;
  nodes: Array<Tbl_EmailTemplate>;
};

export type Tbl_EmailTemplate_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_EmailTemplate_Aggregate_Bool_Exp_Count>;
};

export type Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_EmailTemplate_Select_Column_Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_EmailTemplate_Select_Column_Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_EmailTemplate_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Aggregate_Fields = {
  __typename?: "Tbl_EmailTemplate_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_EmailTemplate_Max_Fields>;
  min?: Maybe<Tbl_EmailTemplate_Min_Fields>;
};

/** aggregate fields of "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_EmailTemplate_Max_Order_By>;
  min?: InputMaybe<Tbl_EmailTemplate_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Arr_Rel_Insert_Input = {
  data: Array<Tbl_EmailTemplate_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_EmailTemplate_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_EmailTemplate". All fields are combined with a logical 'AND'. */
export type Tbl_EmailTemplate_Bool_Exp = {
  BCCEmailId?: InputMaybe<String_Comparison_Exp>;
  Body?: InputMaybe<String_Comparison_Exp>;
  CCEmailId?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Description?: InputMaybe<String_Comparison_Exp>;
  EmailHeaderFooterGUID?: InputMaybe<Uuid_Comparison_Exp>;
  EmailTemplateGUID?: InputMaybe<Uuid_Comparison_Exp>;
  EmailTemplateName?: InputMaybe<String_Comparison_Exp>;
  FromEmailId?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Subject?: InputMaybe<String_Comparison_Exp>;
  Tbl_EmailTemplateNotificationDetails?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  Tbl_EmailTemplateNotificationDetails_aggregate?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  ToEmailId?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_EmailTemplate_Bool_Exp>>;
  _not?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_EmailTemplate_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_EmailTemplate" */
export enum Tbl_EmailTemplate_Constraint {
  /** unique or primary key constraint on columns "EmailTemplateGUID" */
  TblEmailTemplatePkey = "Tbl_EmailTemplate_pkey"
}

/** input type for inserting data into table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Insert_Input = {
  BCCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  Body?: InputMaybe<Scalars["String"]["input"]>;
  CCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateName?: InputMaybe<Scalars["String"]["input"]>;
  FromEmailId?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Subject?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_EmailTemplateNotificationDetails?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Arr_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  ToEmailId?: InputMaybe<Scalars["String"]["input"]>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_EmailTemplate_Max_Fields = {
  __typename?: "Tbl_EmailTemplate_max_fields";
  BCCEmailId?: Maybe<Scalars["String"]["output"]>;
  Body?: Maybe<Scalars["String"]["output"]>;
  CCEmailId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  EmailHeaderFooterGUID?: Maybe<Scalars["uuid"]["output"]>;
  EmailTemplateGUID?: Maybe<Scalars["uuid"]["output"]>;
  EmailTemplateName?: Maybe<Scalars["String"]["output"]>;
  FromEmailId?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Subject?: Maybe<Scalars["String"]["output"]>;
  ToEmailId?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Max_Order_By = {
  BCCEmailId?: InputMaybe<Order_By>;
  Body?: InputMaybe<Order_By>;
  CCEmailId?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  EmailTemplateGUID?: InputMaybe<Order_By>;
  EmailTemplateName?: InputMaybe<Order_By>;
  FromEmailId?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Subject?: InputMaybe<Order_By>;
  ToEmailId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_EmailTemplate_Min_Fields = {
  __typename?: "Tbl_EmailTemplate_min_fields";
  BCCEmailId?: Maybe<Scalars["String"]["output"]>;
  Body?: Maybe<Scalars["String"]["output"]>;
  CCEmailId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Description?: Maybe<Scalars["String"]["output"]>;
  EmailHeaderFooterGUID?: Maybe<Scalars["uuid"]["output"]>;
  EmailTemplateGUID?: Maybe<Scalars["uuid"]["output"]>;
  EmailTemplateName?: Maybe<Scalars["String"]["output"]>;
  FromEmailId?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  Subject?: Maybe<Scalars["String"]["output"]>;
  ToEmailId?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Min_Order_By = {
  BCCEmailId?: InputMaybe<Order_By>;
  Body?: InputMaybe<Order_By>;
  CCEmailId?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  EmailTemplateGUID?: InputMaybe<Order_By>;
  EmailTemplateName?: InputMaybe<Order_By>;
  FromEmailId?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Subject?: InputMaybe<Order_By>;
  ToEmailId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Mutation_Response = {
  __typename?: "Tbl_EmailTemplate_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_EmailTemplate>;
};

/** input type for inserting object relation for remote table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Obj_Rel_Insert_Input = {
  data: Tbl_EmailTemplate_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_EmailTemplate_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_On_Conflict = {
  constraint: Tbl_EmailTemplate_Constraint;
  update_columns?: Array<Tbl_EmailTemplate_Update_Column>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_EmailTemplate". */
export type Tbl_EmailTemplate_Order_By = {
  BCCEmailId?: InputMaybe<Order_By>;
  Body?: InputMaybe<Order_By>;
  CCEmailId?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Description?: InputMaybe<Order_By>;
  EmailHeaderFooterGUID?: InputMaybe<Order_By>;
  EmailTemplateGUID?: InputMaybe<Order_By>;
  EmailTemplateName?: InputMaybe<Order_By>;
  FromEmailId?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Subject?: InputMaybe<Order_By>;
  Tbl_EmailTemplateNotificationDetails_aggregate?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  ToEmailId?: InputMaybe<Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_EmailTemplate */
export type Tbl_EmailTemplate_Pk_Columns_Input = {
  EmailTemplateGUID: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_EmailTemplate" */
export enum Tbl_EmailTemplate_Select_Column {
  /** column name */
  BccEmailId = "BCCEmailId",
  /** column name */
  Body = "Body",
  /** column name */
  CcEmailId = "CCEmailId",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Description = "Description",
  /** column name */
  EmailHeaderFooterGuid = "EmailHeaderFooterGUID",
  /** column name */
  EmailTemplateGuid = "EmailTemplateGUID",
  /** column name */
  EmailTemplateName = "EmailTemplateName",
  /** column name */
  FromEmailId = "FromEmailId",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  Subject = "Subject",
  /** column name */
  ToEmailId = "ToEmailId"
}

/** select "Tbl_EmailTemplate_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_EmailTemplate" */
export enum Tbl_EmailTemplate_Select_Column_Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_EmailTemplate_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_EmailTemplate" */
export enum Tbl_EmailTemplate_Select_Column_Tbl_EmailTemplate_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Set_Input = {
  BCCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  Body?: InputMaybe<Scalars["String"]["input"]>;
  CCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateName?: InputMaybe<Scalars["String"]["input"]>;
  FromEmailId?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Subject?: InputMaybe<Scalars["String"]["input"]>;
  ToEmailId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_EmailTemplate" */
export type Tbl_EmailTemplate_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_EmailTemplate_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_EmailTemplate_Stream_Cursor_Value_Input = {
  BCCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  Body?: InputMaybe<Scalars["String"]["input"]>;
  CCEmailId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Description?: InputMaybe<Scalars["String"]["input"]>;
  EmailHeaderFooterGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateGUID?: InputMaybe<Scalars["uuid"]["input"]>;
  EmailTemplateName?: InputMaybe<Scalars["String"]["input"]>;
  FromEmailId?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Subject?: InputMaybe<Scalars["String"]["input"]>;
  ToEmailId?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_EmailTemplate" */
export enum Tbl_EmailTemplate_Update_Column {
  /** column name */
  BccEmailId = "BCCEmailId",
  /** column name */
  Body = "Body",
  /** column name */
  CcEmailId = "CCEmailId",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Description = "Description",
  /** column name */
  EmailHeaderFooterGuid = "EmailHeaderFooterGUID",
  /** column name */
  EmailTemplateGuid = "EmailTemplateGUID",
  /** column name */
  EmailTemplateName = "EmailTemplateName",
  /** column name */
  FromEmailId = "FromEmailId",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  Subject = "Subject",
  /** column name */
  ToEmailId = "ToEmailId"
}

export type Tbl_EmailTemplate_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_EmailTemplate_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_EmailTemplate_Bool_Exp;
};

/** columns and relationships of "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings = {
  __typename?: "Tbl_GlobalSettings";
  GlobalSettingsGuid: Scalars["uuid"]["output"];
  IsSuperAdminSetting?: Maybe<Scalars["Boolean"]["output"]>;
  SettingsKey?: Maybe<Scalars["String"]["output"]>;
  SettingsValue?: Maybe<Scalars["String"]["output"]>;
};

/** aggregated selection of "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Aggregate = {
  __typename?: "Tbl_GlobalSettings_aggregate";
  aggregate?: Maybe<Tbl_GlobalSettings_Aggregate_Fields>;
  nodes: Array<Tbl_GlobalSettings>;
};

/** aggregate fields of "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Aggregate_Fields = {
  __typename?: "Tbl_GlobalSettings_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_GlobalSettings_Max_Fields>;
  min?: Maybe<Tbl_GlobalSettings_Min_Fields>;
};

/** aggregate fields of "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_GlobalSettings_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_GlobalSettings". All fields are combined with a logical 'AND'. */
export type Tbl_GlobalSettings_Bool_Exp = {
  GlobalSettingsGuid?: InputMaybe<Uuid_Comparison_Exp>;
  IsSuperAdminSetting?: InputMaybe<Boolean_Comparison_Exp>;
  SettingsKey?: InputMaybe<String_Comparison_Exp>;
  SettingsValue?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_GlobalSettings_Bool_Exp>>;
  _not?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_GlobalSettings_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_GlobalSettings" */
export enum Tbl_GlobalSettings_Constraint {
  /** unique or primary key constraint on columns "GlobalSettingsGuid" */
  TblGlobalSettingsPkey = "Tbl_GlobalSettings_pkey"
}

/** input type for inserting data into table "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Insert_Input = {
  GlobalSettingsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsSuperAdminSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  SettingsKey?: InputMaybe<Scalars["String"]["input"]>;
  SettingsValue?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_GlobalSettings_Max_Fields = {
  __typename?: "Tbl_GlobalSettings_max_fields";
  GlobalSettingsGuid?: Maybe<Scalars["uuid"]["output"]>;
  SettingsKey?: Maybe<Scalars["String"]["output"]>;
  SettingsValue?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_GlobalSettings_Min_Fields = {
  __typename?: "Tbl_GlobalSettings_min_fields";
  GlobalSettingsGuid?: Maybe<Scalars["uuid"]["output"]>;
  SettingsKey?: Maybe<Scalars["String"]["output"]>;
  SettingsValue?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Mutation_Response = {
  __typename?: "Tbl_GlobalSettings_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_GlobalSettings>;
};

/** on_conflict condition type for table "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_On_Conflict = {
  constraint: Tbl_GlobalSettings_Constraint;
  update_columns?: Array<Tbl_GlobalSettings_Update_Column>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_GlobalSettings". */
export type Tbl_GlobalSettings_Order_By = {
  GlobalSettingsGuid?: InputMaybe<Order_By>;
  IsSuperAdminSetting?: InputMaybe<Order_By>;
  SettingsKey?: InputMaybe<Order_By>;
  SettingsValue?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_GlobalSettings */
export type Tbl_GlobalSettings_Pk_Columns_Input = {
  GlobalSettingsGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_GlobalSettings" */
export enum Tbl_GlobalSettings_Select_Column {
  /** column name */
  GlobalSettingsGuid = "GlobalSettingsGuid",
  /** column name */
  IsSuperAdminSetting = "IsSuperAdminSetting",
  /** column name */
  SettingsKey = "SettingsKey",
  /** column name */
  SettingsValue = "SettingsValue"
}

/** input type for updating data in table "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Set_Input = {
  GlobalSettingsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsSuperAdminSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  SettingsKey?: InputMaybe<Scalars["String"]["input"]>;
  SettingsValue?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_GlobalSettings" */
export type Tbl_GlobalSettings_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_GlobalSettings_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_GlobalSettings_Stream_Cursor_Value_Input = {
  GlobalSettingsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  IsSuperAdminSetting?: InputMaybe<Scalars["Boolean"]["input"]>;
  SettingsKey?: InputMaybe<Scalars["String"]["input"]>;
  SettingsValue?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_GlobalSettings" */
export enum Tbl_GlobalSettings_Update_Column {
  /** column name */
  GlobalSettingsGuid = "GlobalSettingsGuid",
  /** column name */
  IsSuperAdminSetting = "IsSuperAdminSetting",
  /** column name */
  SettingsKey = "SettingsKey",
  /** column name */
  SettingsValue = "SettingsValue"
}

export type Tbl_GlobalSettings_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_GlobalSettings_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_GlobalSettings_Bool_Exp;
};

/** columns and relationships of "Tbl_LanguageResources" */
export type Tbl_LanguageResources = {
  __typename?: "Tbl_LanguageResources";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LanguageResourceGuid: Scalars["uuid"]["output"];
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  ResourceValue?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** aggregated selection of "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Aggregate = {
  __typename?: "Tbl_LanguageResources_aggregate";
  aggregate?: Maybe<Tbl_LanguageResources_Aggregate_Fields>;
  nodes: Array<Tbl_LanguageResources>;
};

export type Tbl_LanguageResources_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_LanguageResources_Aggregate_Bool_Exp_Count>;
};

export type Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_LanguageResources_Select_Column_Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_LanguageResources_Select_Column_Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_LanguageResources_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Aggregate_Fields = {
  __typename?: "Tbl_LanguageResources_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_LanguageResources_Max_Fields>;
  min?: Maybe<Tbl_LanguageResources_Min_Fields>;
};

/** aggregate fields of "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_LanguageResources_Max_Order_By>;
  min?: InputMaybe<Tbl_LanguageResources_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Arr_Rel_Insert_Input = {
  data: Array<Tbl_LanguageResources_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_LanguageResources_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_LanguageResources". All fields are combined with a logical 'AND'. */
export type Tbl_LanguageResources_Bool_Exp = {
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  LanguageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  LanguageResourceGuid?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  PageKey?: InputMaybe<String_Comparison_Exp>;
  ResourceKey?: InputMaybe<String_Comparison_Exp>;
  ResourceValue?: InputMaybe<String_Comparison_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_LanguageResources_Bool_Exp>>;
  _not?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_LanguageResources_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_LanguageResources" */
export enum Tbl_LanguageResources_Constraint {
  /** unique or primary key constraint on columns "LanguageResourceGuid" */
  TblLanguageResourcesPkey = "Tbl_LanguageResources_pkey"
}

/** input type for inserting data into table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Insert_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LanguageResourceGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceValue?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_LanguageResources_Max_Fields = {
  __typename?: "Tbl_LanguageResources_max_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LanguageResourceGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  ResourceValue?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Max_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  LanguageGuid?: InputMaybe<Order_By>;
  LanguageResourceGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  ResourceValue?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_LanguageResources_Min_Fields = {
  __typename?: "Tbl_LanguageResources_min_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LanguageResourceGuid?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  ResourceValue?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Min_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  LanguageGuid?: InputMaybe<Order_By>;
  LanguageResourceGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  ResourceValue?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Mutation_Response = {
  __typename?: "Tbl_LanguageResources_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_LanguageResources>;
};

/** input type for inserting object relation for remote table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Obj_Rel_Insert_Input = {
  data: Tbl_LanguageResources_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_LanguageResources_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_On_Conflict = {
  constraint: Tbl_LanguageResources_Constraint;
  update_columns?: Array<Tbl_LanguageResources_Update_Column>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_LanguageResources". */
export type Tbl_LanguageResources_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  LanguageGuid?: InputMaybe<Order_By>;
  LanguageResourceGuid?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  ResourceValue?: InputMaybe<Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_LanguageResources */
export type Tbl_LanguageResources_Pk_Columns_Input = {
  LanguageResourceGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_LanguageResources" */
export enum Tbl_LanguageResources_Select_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  LanguageGuid = "LanguageGuid",
  /** column name */
  LanguageResourceGuid = "LanguageResourceGuid",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  ResourceKey = "ResourceKey",
  /** column name */
  ResourceValue = "ResourceValue"
}

/** select "Tbl_LanguageResources_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_LanguageResources" */
export enum Tbl_LanguageResources_Select_Column_Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_LanguageResources_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_LanguageResources" */
export enum Tbl_LanguageResources_Select_Column_Tbl_LanguageResources_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Set_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LanguageResourceGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceValue?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_LanguageResources" */
export type Tbl_LanguageResources_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_LanguageResources_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_LanguageResources_Stream_Cursor_Value_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LanguageResourceGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  ResourceValue?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_LanguageResources" */
export enum Tbl_LanguageResources_Update_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  LanguageGuid = "LanguageGuid",
  /** column name */
  LanguageResourceGuid = "LanguageResourceGuid",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  ResourceKey = "ResourceKey",
  /** column name */
  ResourceValue = "ResourceValue"
}

export type Tbl_LanguageResources_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_LanguageResources_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_LanguageResources_Bool_Exp;
};

/** columns and relationships of "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails = {
  __typename?: "Tbl_OPsCompanyDBDetails";
  AccessTokenUrl?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsCompanyDBDetailsGuid: Scalars["uuid"]["output"];
  PlatformId?: Maybe<Scalars["String"]["output"]>;
  PlatformSecret?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
};

/** aggregated selection of "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Aggregate = {
  __typename?: "Tbl_OPsCompanyDBDetails_aggregate";
  aggregate?: Maybe<Tbl_OPsCompanyDbDetails_Aggregate_Fields>;
  nodes: Array<Tbl_OPsCompanyDbDetails>;
};

export type Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Count>;
};

export type Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_OPsCompanyDbDetails_Select_Column_Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_OPsCompanyDbDetails_Select_Column_Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Aggregate_Fields = {
  __typename?: "Tbl_OPsCompanyDBDetails_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_OPsCompanyDbDetails_Max_Fields>;
  min?: Maybe<Tbl_OPsCompanyDbDetails_Min_Fields>;
};

/** aggregate fields of "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_OPsCompanyDbDetails_Max_Order_By>;
  min?: InputMaybe<Tbl_OPsCompanyDbDetails_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Arr_Rel_Insert_Input = {
  data: Array<Tbl_OPsCompanyDbDetails_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_OPsCompanyDbDetails_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_OPsCompanyDBDetails". All fields are combined with a logical 'AND'. */
export type Tbl_OPsCompanyDbDetails_Bool_Exp = {
  AccessTokenUrl?: InputMaybe<String_Comparison_Exp>;
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PlatformId?: InputMaybe<String_Comparison_Exp>;
  PlatformSecret?: InputMaybe<String_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Bool_Exp>>;
  _not?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_OPsCompanyDBDetails" */
export enum Tbl_OPsCompanyDbDetails_Constraint {
  /** unique or primary key constraint on columns "OPsCompanyDBDetailsGuid" */
  TblOPsCompanyDbDetailsPkey = "Tbl_OPsCompanyDBDetails_pkey"
}

/** input type for inserting data into table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Insert_Input = {
  AccessTokenUrl?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformId?: InputMaybe<Scalars["String"]["input"]>;
  PlatformSecret?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_OPsCompanyDbDetails_Max_Fields = {
  __typename?: "Tbl_OPsCompanyDBDetails_max_fields";
  AccessTokenUrl?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsCompanyDBDetailsGuid?: Maybe<Scalars["uuid"]["output"]>;
  PlatformId?: Maybe<Scalars["String"]["output"]>;
  PlatformSecret?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Max_Order_By = {
  AccessTokenUrl?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Order_By>;
  PlatformId?: InputMaybe<Order_By>;
  PlatformSecret?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_OPsCompanyDbDetails_Min_Fields = {
  __typename?: "Tbl_OPsCompanyDBDetails_min_fields";
  AccessTokenUrl?: Maybe<Scalars["String"]["output"]>;
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsCompanyDBDetailsGuid?: Maybe<Scalars["uuid"]["output"]>;
  PlatformId?: Maybe<Scalars["String"]["output"]>;
  PlatformSecret?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Min_Order_By = {
  AccessTokenUrl?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Order_By>;
  PlatformId?: InputMaybe<Order_By>;
  PlatformSecret?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Mutation_Response = {
  __typename?: "Tbl_OPsCompanyDBDetails_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_OPsCompanyDbDetails>;
};

/** on_conflict condition type for table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_On_Conflict = {
  constraint: Tbl_OPsCompanyDbDetails_Constraint;
  update_columns?: Array<Tbl_OPsCompanyDbDetails_Update_Column>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_OPsCompanyDBDetails". */
export type Tbl_OPsCompanyDbDetails_Order_By = {
  AccessTokenUrl?: InputMaybe<Order_By>;
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Order_By>;
  PlatformId?: InputMaybe<Order_By>;
  PlatformSecret?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
};

/** primary key columns input for table: Tbl_OPsCompanyDBDetails */
export type Tbl_OPsCompanyDbDetails_Pk_Columns_Input = {
  OPsCompanyDBDetailsGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_OPsCompanyDBDetails" */
export enum Tbl_OPsCompanyDbDetails_Select_Column {
  /** column name */
  AccessTokenUrl = "AccessTokenUrl",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OPsCompanyDbDetailsGuid = "OPsCompanyDBDetailsGuid",
  /** column name */
  PlatformId = "PlatformId",
  /** column name */
  PlatformSecret = "PlatformSecret"
}

/** select "Tbl_OPsCompanyDBDetails_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_OPsCompanyDBDetails" */
export enum Tbl_OPsCompanyDbDetails_Select_Column_Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_OPsCompanyDBDetails_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_OPsCompanyDBDetails" */
export enum Tbl_OPsCompanyDbDetails_Select_Column_Tbl_OPsCompanyDbDetails_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Set_Input = {
  AccessTokenUrl?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformId?: InputMaybe<Scalars["String"]["input"]>;
  PlatformSecret?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_OPsCompanyDBDetails" */
export type Tbl_OPsCompanyDbDetails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_OPsCompanyDbDetails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_OPsCompanyDbDetails_Stream_Cursor_Value_Input = {
  AccessTokenUrl?: InputMaybe<Scalars["String"]["input"]>;
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsCompanyDBDetailsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformId?: InputMaybe<Scalars["String"]["input"]>;
  PlatformSecret?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_OPsCompanyDBDetails" */
export enum Tbl_OPsCompanyDbDetails_Update_Column {
  /** column name */
  AccessTokenUrl = "AccessTokenUrl",
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OPsCompanyDbDetailsGuid = "OPsCompanyDBDetailsGuid",
  /** column name */
  PlatformId = "PlatformId",
  /** column name */
  PlatformSecret = "PlatformSecret"
}

export type Tbl_OPsCompanyDbDetails_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_OPsCompanyDbDetails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_OPsCompanyDbDetails_Bool_Exp;
};

/** columns and relationships of "Tbl_Pages" */
export type Tbl_Pages = {
  __typename?: "Tbl_Pages";
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  PageGuid: Scalars["uuid"]["output"];
  PageKey: Scalars["String"]["output"];
  ParentPageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PlatformType?: Maybe<Scalars["String"]["output"]>;
  /** An array relationship */
  Tbl_Permissions: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  Tbl_Permissions_aggregate: Tbl_Permissions_Aggregate;
  /** An array relationship */
  Tbl_WarpForms: Array<Tbl_WarpForms>;
  /** An aggregate relationship */
  Tbl_WarpForms_aggregate: Tbl_WarpForms_Aggregate;
  URL?: Maybe<Scalars["String"]["output"]>;
};

/** columns and relationships of "Tbl_Pages" */
export type Tbl_PagesTbl_PermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Pages" */
export type Tbl_PagesTbl_Permissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Pages" */
export type Tbl_PagesTbl_WarpFormsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

/** columns and relationships of "Tbl_Pages" */
export type Tbl_PagesTbl_WarpForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

/** aggregated selection of "Tbl_Pages" */
export type Tbl_Pages_Aggregate = {
  __typename?: "Tbl_Pages_aggregate";
  aggregate?: Maybe<Tbl_Pages_Aggregate_Fields>;
  nodes: Array<Tbl_Pages>;
};

/** aggregate fields of "Tbl_Pages" */
export type Tbl_Pages_Aggregate_Fields = {
  __typename?: "Tbl_Pages_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Pages_Max_Fields>;
  min?: Maybe<Tbl_Pages_Min_Fields>;
};

/** aggregate fields of "Tbl_Pages" */
export type Tbl_Pages_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Pages_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_Pages". All fields are combined with a logical 'AND'. */
export type Tbl_Pages_Bool_Exp = {
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  PageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PageKey?: InputMaybe<String_Comparison_Exp>;
  ParentPageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PlatformType?: InputMaybe<String_Comparison_Exp>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp>;
  Tbl_WarpForms?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
  Tbl_WarpForms_aggregate?: InputMaybe<Tbl_WarpForms_Aggregate_Bool_Exp>;
  URL?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_Pages_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Pages_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Pages_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_Pages" */
export enum Tbl_Pages_Constraint {
  /** unique or primary key constraint on columns "PageGuid" */
  TblPagesPkey = "Tbl_Pages_pkey"
}

/** input type for inserting data into table "Tbl_Pages" */
export type Tbl_Pages_Insert_Input = {
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ParentPageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformType?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Arr_Rel_Insert_Input>;
  Tbl_WarpForms?: InputMaybe<Tbl_WarpForms_Arr_Rel_Insert_Input>;
  URL?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_Pages_Max_Fields = {
  __typename?: "Tbl_Pages_max_fields";
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  ParentPageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PlatformType?: Maybe<Scalars["String"]["output"]>;
  URL?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_Pages_Min_Fields = {
  __typename?: "Tbl_Pages_min_fields";
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  ParentPageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PlatformType?: Maybe<Scalars["String"]["output"]>;
  URL?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Tbl_Pages" */
export type Tbl_Pages_Mutation_Response = {
  __typename?: "Tbl_Pages_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Pages>;
};

/** input type for inserting object relation for remote table "Tbl_Pages" */
export type Tbl_Pages_Obj_Rel_Insert_Input = {
  data: Tbl_Pages_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Pages_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Pages" */
export type Tbl_Pages_On_Conflict = {
  constraint: Tbl_Pages_Constraint;
  update_columns?: Array<Tbl_Pages_Update_Column>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Pages". */
export type Tbl_Pages_Order_By = {
  IsActive?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  ParentPageGuid?: InputMaybe<Order_By>;
  PlatformType?: InputMaybe<Order_By>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Order_By>;
  Tbl_WarpForms_aggregate?: InputMaybe<Tbl_WarpForms_Aggregate_Order_By>;
  URL?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_Pages */
export type Tbl_Pages_Pk_Columns_Input = {
  PageGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_Pages" */
export enum Tbl_Pages_Select_Column {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  ParentPageGuid = "ParentPageGuid",
  /** column name */
  PlatformType = "PlatformType",
  /** column name */
  Url = "URL"
}

/** input type for updating data in table "Tbl_Pages" */
export type Tbl_Pages_Set_Input = {
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ParentPageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformType?: InputMaybe<Scalars["String"]["input"]>;
  URL?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "Tbl_Pages" */
export type Tbl_Pages_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Pages_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Pages_Stream_Cursor_Value_Input = {
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  ParentPageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PlatformType?: InputMaybe<Scalars["String"]["input"]>;
  URL?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Tbl_Pages" */
export enum Tbl_Pages_Update_Column {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  ParentPageGuid = "ParentPageGuid",
  /** column name */
  PlatformType = "PlatformType",
  /** column name */
  Url = "URL"
}

export type Tbl_Pages_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Pages_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Pages_Bool_Exp;
};

/** columns and relationships of "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster = {
  __typename?: "Tbl_PasswordManageMaster";
  ChangePasswordGuid: Scalars["uuid"]["output"];
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailId?: Maybe<Scalars["String"]["output"]>;
  EmailToken?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  PasswordCreateDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** aggregated selection of "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Aggregate = {
  __typename?: "Tbl_PasswordManageMaster_aggregate";
  aggregate?: Maybe<Tbl_PasswordManageMaster_Aggregate_Fields>;
  nodes: Array<Tbl_PasswordManageMaster>;
};

/** aggregate fields of "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Aggregate_Fields = {
  __typename?: "Tbl_PasswordManageMaster_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_PasswordManageMaster_Max_Fields>;
  min?: Maybe<Tbl_PasswordManageMaster_Min_Fields>;
};

/** aggregate fields of "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_PasswordManageMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_PasswordManageMaster". All fields are combined with a logical 'AND'. */
export type Tbl_PasswordManageMaster_Bool_Exp = {
  ChangePasswordGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  EmailId?: InputMaybe<String_Comparison_Exp>;
  EmailToken?: InputMaybe<String_Comparison_Exp>;
  Password?: InputMaybe<String_Comparison_Exp>;
  PasswordCreateDate?: InputMaybe<Timestamp_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_PasswordManageMaster_Bool_Exp>>;
  _not?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_PasswordManageMaster_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_PasswordManageMaster" */
export enum Tbl_PasswordManageMaster_Constraint {
  /** unique or primary key constraint on columns "ChangePasswordGuid" */
  TblPasswordManageMasterPkey = "Tbl_PasswordManageMaster_pkey"
}

/** input type for inserting data into table "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Insert_Input = {
  ChangePasswordGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  EmailToken?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  PasswordCreateDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_PasswordManageMaster_Max_Fields = {
  __typename?: "Tbl_PasswordManageMaster_max_fields";
  ChangePasswordGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailId?: Maybe<Scalars["String"]["output"]>;
  EmailToken?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  PasswordCreateDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_PasswordManageMaster_Min_Fields = {
  __typename?: "Tbl_PasswordManageMaster_min_fields";
  ChangePasswordGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  EmailId?: Maybe<Scalars["String"]["output"]>;
  EmailToken?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  PasswordCreateDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** response of any mutation on the table "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Mutation_Response = {
  __typename?: "Tbl_PasswordManageMaster_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_PasswordManageMaster>;
};

/** on_conflict condition type for table "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_On_Conflict = {
  constraint: Tbl_PasswordManageMaster_Constraint;
  update_columns?: Array<Tbl_PasswordManageMaster_Update_Column>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_PasswordManageMaster". */
export type Tbl_PasswordManageMaster_Order_By = {
  ChangePasswordGuid?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  EmailId?: InputMaybe<Order_By>;
  EmailToken?: InputMaybe<Order_By>;
  Password?: InputMaybe<Order_By>;
  PasswordCreateDate?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_PasswordManageMaster */
export type Tbl_PasswordManageMaster_Pk_Columns_Input = {
  ChangePasswordGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_PasswordManageMaster" */
export enum Tbl_PasswordManageMaster_Select_Column {
  /** column name */
  ChangePasswordGuid = "ChangePasswordGuid",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailId = "EmailId",
  /** column name */
  EmailToken = "EmailToken",
  /** column name */
  Password = "Password",
  /** column name */
  PasswordCreateDate = "PasswordCreateDate"
}

/** input type for updating data in table "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Set_Input = {
  ChangePasswordGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  EmailToken?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  PasswordCreateDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** Streaming cursor of the table "Tbl_PasswordManageMaster" */
export type Tbl_PasswordManageMaster_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_PasswordManageMaster_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_PasswordManageMaster_Stream_Cursor_Value_Input = {
  ChangePasswordGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  EmailToken?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  PasswordCreateDate?: InputMaybe<Scalars["timestamp"]["input"]>;
};

/** update columns of table "Tbl_PasswordManageMaster" */
export enum Tbl_PasswordManageMaster_Update_Column {
  /** column name */
  ChangePasswordGuid = "ChangePasswordGuid",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  EmailId = "EmailId",
  /** column name */
  EmailToken = "EmailToken",
  /** column name */
  Password = "Password",
  /** column name */
  PasswordCreateDate = "PasswordCreateDate"
}

export type Tbl_PasswordManageMaster_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_PasswordManageMaster_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_PasswordManageMaster_Bool_Exp;
};

/** columns and relationships of "Tbl_Permissions" */
export type Tbl_Permissions = {
  __typename?: "Tbl_Permissions";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IconName?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  MenuDisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  MenuType?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageGuid: Scalars["uuid"]["output"];
  PermissionGuid: Scalars["uuid"]["output"];
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  RoleGuid: Scalars["uuid"]["output"];
  /** An object relationship */
  Tbl_LanguageResource?: Maybe<Tbl_LanguageResources>;
  /** An object relationship */
  Tbl_Page: Tbl_Pages;
  /** An object relationship */
  Tbl_Role: Tbl_Roles;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An array relationship */
  Tbl_UserPermissions: Array<Tbl_UserPermissions>;
  /** An aggregate relationship */
  Tbl_UserPermissions_aggregate: Tbl_UserPermissions_Aggregate;
  activeiconname?: Maybe<Scalars["String"]["output"]>;
  iconpath?: Maybe<Scalars["String"]["output"]>;
  is_default: Scalars["Boolean"]["output"];
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
  workflow_key: Scalars["jsonb"]["output"];
};

/** columns and relationships of "Tbl_Permissions" */
export type Tbl_PermissionsTbl_UserPermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Permissions" */
export type Tbl_PermissionsTbl_UserPermissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Permissions" */
export type Tbl_PermissionsWorkflow_KeyArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregated selection of "Tbl_Permissions" */
export type Tbl_Permissions_Aggregate = {
  __typename?: "Tbl_Permissions_aggregate";
  aggregate?: Maybe<Tbl_Permissions_Aggregate_Fields>;
  nodes: Array<Tbl_Permissions>;
};

export type Tbl_Permissions_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp_Count>;
};

export type Tbl_Permissions_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_Permissions_Select_Column_Tbl_Permissions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Permissions_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_Permissions_Select_Column_Tbl_Permissions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Permissions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_Permissions" */
export type Tbl_Permissions_Aggregate_Fields = {
  __typename?: "Tbl_Permissions_aggregate_fields";
  avg?: Maybe<Tbl_Permissions_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Permissions_Max_Fields>;
  min?: Maybe<Tbl_Permissions_Min_Fields>;
  stddev?: Maybe<Tbl_Permissions_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_Permissions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_Permissions_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_Permissions_Sum_Fields>;
  var_pop?: Maybe<Tbl_Permissions_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_Permissions_Var_Samp_Fields>;
  variance?: Maybe<Tbl_Permissions_Variance_Fields>;
};

/** aggregate fields of "Tbl_Permissions" */
export type Tbl_Permissions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_Permissions" */
export type Tbl_Permissions_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_Permissions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_Permissions_Max_Order_By>;
  min?: InputMaybe<Tbl_Permissions_Min_Order_By>;
  stddev?: InputMaybe<Tbl_Permissions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_Permissions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_Permissions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_Permissions_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_Permissions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_Permissions_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_Permissions_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Tbl_Permissions_Append_Input = {
  workflow_key?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** input type for inserting array relation for remote table "Tbl_Permissions" */
export type Tbl_Permissions_Arr_Rel_Insert_Input = {
  data: Array<Tbl_Permissions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Permissions_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_Permissions_Avg_Fields = {
  __typename?: "Tbl_Permissions_avg_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Avg_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_Permissions". All fields are combined with a logical 'AND'. */
export type Tbl_Permissions_Bool_Exp = {
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  IconName?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  MenuDisplayOrder?: InputMaybe<Int_Comparison_Exp>;
  MenuType?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  PageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PermissionGuid?: InputMaybe<Uuid_Comparison_Exp>;
  ResourceKey?: InputMaybe<String_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_LanguageResource?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Bool_Exp>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserPermissions?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
  Tbl_UserPermissions_aggregate?: InputMaybe<Tbl_UserPermissions_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_Permissions_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Permissions_Bool_Exp>>;
  activeiconname?: InputMaybe<String_Comparison_Exp>;
  iconpath?: InputMaybe<String_Comparison_Exp>;
  is_default?: InputMaybe<Boolean_Comparison_Exp>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
  workflow_key?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** unique or primary key constraints on table "Tbl_Permissions" */
export enum Tbl_Permissions_Constraint {
  /** unique or primary key constraint on columns "PermissionGuid" */
  TblPermissionsPkey = "Tbl_Permissions_pkey"
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Tbl_Permissions_Delete_At_Path_Input = {
  workflow_key?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Tbl_Permissions_Delete_Elem_Input = {
  workflow_key?: InputMaybe<Scalars["Int"]["input"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Tbl_Permissions_Delete_Key_Input = {
  workflow_key?: InputMaybe<Scalars["String"]["input"]>;
};

/** input type for incrementing numeric columns in table "Tbl_Permissions" */
export type Tbl_Permissions_Inc_Input = {
  MenuDisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Tbl_Permissions" */
export type Tbl_Permissions_Insert_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IconName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MenuDisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  MenuType?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_LanguageResource?: InputMaybe<Tbl_LanguageResources_Obj_Rel_Insert_Input>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Obj_Rel_Insert_Input>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserPermissions?: InputMaybe<Tbl_UserPermissions_Arr_Rel_Insert_Input>;
  activeiconname?: InputMaybe<Scalars["String"]["input"]>;
  iconpath?: InputMaybe<Scalars["String"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  workflow_key?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_Permissions_Max_Fields = {
  __typename?: "Tbl_Permissions_max_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IconName?: Maybe<Scalars["String"]["output"]>;
  MenuDisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  MenuType?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  activeiconname?: Maybe<Scalars["String"]["output"]>;
  iconpath?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Max_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IconName?: InputMaybe<Order_By>;
  MenuDisplayOrder?: InputMaybe<Order_By>;
  MenuType?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  activeiconname?: InputMaybe<Order_By>;
  iconpath?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_Permissions_Min_Fields = {
  __typename?: "Tbl_Permissions_min_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IconName?: Maybe<Scalars["String"]["output"]>;
  MenuDisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  MenuType?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
  ResourceKey?: Maybe<Scalars["String"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  activeiconname?: Maybe<Scalars["String"]["output"]>;
  iconpath?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Min_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IconName?: InputMaybe<Order_By>;
  MenuDisplayOrder?: InputMaybe<Order_By>;
  MenuType?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  activeiconname?: InputMaybe<Order_By>;
  iconpath?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_Permissions" */
export type Tbl_Permissions_Mutation_Response = {
  __typename?: "Tbl_Permissions_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Permissions>;
};

/** input type for inserting object relation for remote table "Tbl_Permissions" */
export type Tbl_Permissions_Obj_Rel_Insert_Input = {
  data: Tbl_Permissions_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Permissions_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Permissions" */
export type Tbl_Permissions_On_Conflict = {
  constraint: Tbl_Permissions_Constraint;
  update_columns?: Array<Tbl_Permissions_Update_Column>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Permissions". */
export type Tbl_Permissions_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IconName?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  MenuDisplayOrder?: InputMaybe<Order_By>;
  MenuType?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  ResourceKey?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  Tbl_LanguageResource?: InputMaybe<Tbl_LanguageResources_Order_By>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Order_By>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserPermissions_aggregate?: InputMaybe<Tbl_UserPermissions_Aggregate_Order_By>;
  activeiconname?: InputMaybe<Order_By>;
  iconpath?: InputMaybe<Order_By>;
  is_default?: InputMaybe<Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
  workflow_key?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_Permissions */
export type Tbl_Permissions_Pk_Columns_Input = {
  PermissionGuid: Scalars["uuid"]["input"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Tbl_Permissions_Prepend_Input = {
  workflow_key?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** select columns of table "Tbl_Permissions" */
export enum Tbl_Permissions_Select_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IconName = "IconName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  MenuDisplayOrder = "MenuDisplayOrder",
  /** column name */
  MenuType = "MenuType",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PermissionGuid = "PermissionGuid",
  /** column name */
  ResourceKey = "ResourceKey",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  Activeiconname = "activeiconname",
  /** column name */
  Iconpath = "iconpath",
  /** column name */
  IsDefault = "is_default",
  /** column name */
  WorkflowKey = "workflow_key"
}

/** select "Tbl_Permissions_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_Permissions" */
export enum Tbl_Permissions_Select_Column_Tbl_Permissions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsDefault = "is_default"
}

/** select "Tbl_Permissions_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_Permissions" */
export enum Tbl_Permissions_Select_Column_Tbl_Permissions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsDefault = "is_default"
}

/** input type for updating data in table "Tbl_Permissions" */
export type Tbl_Permissions_Set_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IconName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MenuDisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  MenuType?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  activeiconname?: InputMaybe<Scalars["String"]["input"]>;
  iconpath?: InputMaybe<Scalars["String"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  workflow_key?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_Permissions_Stddev_Fields = {
  __typename?: "Tbl_Permissions_stddev_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Stddev_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_Permissions_Stddev_Pop_Fields = {
  __typename?: "Tbl_Permissions_stddev_pop_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Stddev_Pop_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_Permissions_Stddev_Samp_Fields = {
  __typename?: "Tbl_Permissions_stddev_samp_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Stddev_Samp_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_Permissions" */
export type Tbl_Permissions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Permissions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Permissions_Stream_Cursor_Value_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IconName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  MenuDisplayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  MenuType?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  ResourceKey?: InputMaybe<Scalars["String"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  activeiconname?: InputMaybe<Scalars["String"]["input"]>;
  iconpath?: InputMaybe<Scalars["String"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  workflow_key?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_Permissions_Sum_Fields = {
  __typename?: "Tbl_Permissions_sum_fields";
  MenuDisplayOrder?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Sum_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_Permissions" */
export enum Tbl_Permissions_Update_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IconName = "IconName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  MenuDisplayOrder = "MenuDisplayOrder",
  /** column name */
  MenuType = "MenuType",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PermissionGuid = "PermissionGuid",
  /** column name */
  ResourceKey = "ResourceKey",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  Activeiconname = "activeiconname",
  /** column name */
  Iconpath = "iconpath",
  /** column name */
  IsDefault = "is_default",
  /** column name */
  WorkflowKey = "workflow_key"
}

export type Tbl_Permissions_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Tbl_Permissions_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Tbl_Permissions_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Tbl_Permissions_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Tbl_Permissions_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_Permissions_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Tbl_Permissions_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Permissions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Permissions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_Permissions_Var_Pop_Fields = {
  __typename?: "Tbl_Permissions_var_pop_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Var_Pop_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_Permissions_Var_Samp_Fields = {
  __typename?: "Tbl_Permissions_var_samp_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Var_Samp_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_Permissions_Variance_Fields = {
  __typename?: "Tbl_Permissions_variance_fields";
  MenuDisplayOrder?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_Permissions" */
export type Tbl_Permissions_Variance_Order_By = {
  MenuDisplayOrder?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails = {
  __typename?: "Tbl_PowerBIReportDetails";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  DashboardHeight?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  PowerBIGuid: Scalars["uuid"]["output"];
  PowerBIReportFilters?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportName?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportSections?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportTokenDetails?: Maybe<Scalars["String"]["output"]>;
  TokenExpirationTime?: Maybe<Scalars["timestamp"]["output"]>;
  UpdatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  isBorder: Scalars["Boolean"]["output"];
  isPowerBiReport: Scalars["Boolean"]["output"];
};

/** aggregated selection of "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Aggregate = {
  __typename?: "Tbl_PowerBIReportDetails_aggregate";
  aggregate?: Maybe<Tbl_PowerBiReportDetails_Aggregate_Fields>;
  nodes: Array<Tbl_PowerBiReportDetails>;
};

/** aggregate fields of "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Aggregate_Fields = {
  __typename?: "Tbl_PowerBIReportDetails_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_PowerBiReportDetails_Max_Fields>;
  min?: Maybe<Tbl_PowerBiReportDetails_Min_Fields>;
};

/** aggregate fields of "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_PowerBiReportDetails_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_PowerBIReportDetails". All fields are combined with a logical 'AND'. */
export type Tbl_PowerBiReportDetails_Bool_Exp = {
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  DashboardHeight?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  PowerBIGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PowerBIReportFilters?: InputMaybe<String_Comparison_Exp>;
  PowerBIReportName?: InputMaybe<String_Comparison_Exp>;
  PowerBIReportSections?: InputMaybe<String_Comparison_Exp>;
  PowerBIReportTokenDetails?: InputMaybe<String_Comparison_Exp>;
  TokenExpirationTime?: InputMaybe<Timestamp_Comparison_Exp>;
  UpdatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_PowerBiReportDetails_Bool_Exp>>;
  _not?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_PowerBiReportDetails_Bool_Exp>>;
  isBorder?: InputMaybe<Boolean_Comparison_Exp>;
  isPowerBiReport?: InputMaybe<Boolean_Comparison_Exp>;
};

/** unique or primary key constraints on table "Tbl_PowerBIReportDetails" */
export enum Tbl_PowerBiReportDetails_Constraint {
  /** unique or primary key constraint on columns "PowerBIGuid" */
  TblPowerBiReportDetailsPkey = "Tbl_PowerBIReportDetails_pkey"
}

/** input type for inserting data into table "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Insert_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PowerBIGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PowerBIReportFilters?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportName?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportSections?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportTokenDetails?: InputMaybe<Scalars["String"]["input"]>;
  TokenExpirationTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  UpdatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  isBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_PowerBiReportDetails_Max_Fields = {
  __typename?: "Tbl_PowerBIReportDetails_max_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  DashboardHeight?: Maybe<Scalars["String"]["output"]>;
  PowerBIGuid?: Maybe<Scalars["uuid"]["output"]>;
  PowerBIReportFilters?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportName?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportSections?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportTokenDetails?: Maybe<Scalars["String"]["output"]>;
  TokenExpirationTime?: Maybe<Scalars["timestamp"]["output"]>;
  UpdatedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_PowerBiReportDetails_Min_Fields = {
  __typename?: "Tbl_PowerBIReportDetails_min_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  DashboardHeight?: Maybe<Scalars["String"]["output"]>;
  PowerBIGuid?: Maybe<Scalars["uuid"]["output"]>;
  PowerBIReportFilters?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportName?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportSections?: Maybe<Scalars["String"]["output"]>;
  PowerBIReportTokenDetails?: Maybe<Scalars["String"]["output"]>;
  TokenExpirationTime?: Maybe<Scalars["timestamp"]["output"]>;
  UpdatedDate?: Maybe<Scalars["timestamp"]["output"]>;
};

/** response of any mutation on the table "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Mutation_Response = {
  __typename?: "Tbl_PowerBIReportDetails_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_PowerBiReportDetails>;
};

/** on_conflict condition type for table "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_On_Conflict = {
  constraint: Tbl_PowerBiReportDetails_Constraint;
  update_columns?: Array<Tbl_PowerBiReportDetails_Update_Column>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_PowerBIReportDetails". */
export type Tbl_PowerBiReportDetails_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  DashboardHeight?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  PowerBIGuid?: InputMaybe<Order_By>;
  PowerBIReportFilters?: InputMaybe<Order_By>;
  PowerBIReportName?: InputMaybe<Order_By>;
  PowerBIReportSections?: InputMaybe<Order_By>;
  PowerBIReportTokenDetails?: InputMaybe<Order_By>;
  TokenExpirationTime?: InputMaybe<Order_By>;
  UpdatedDate?: InputMaybe<Order_By>;
  isBorder?: InputMaybe<Order_By>;
  isPowerBiReport?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_PowerBIReportDetails */
export type Tbl_PowerBiReportDetails_Pk_Columns_Input = {
  PowerBIGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_PowerBIReportDetails" */
export enum Tbl_PowerBiReportDetails_Select_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DashboardHeight = "DashboardHeight",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  PowerBiGuid = "PowerBIGuid",
  /** column name */
  PowerBiReportFilters = "PowerBIReportFilters",
  /** column name */
  PowerBiReportName = "PowerBIReportName",
  /** column name */
  PowerBiReportSections = "PowerBIReportSections",
  /** column name */
  PowerBiReportTokenDetails = "PowerBIReportTokenDetails",
  /** column name */
  TokenExpirationTime = "TokenExpirationTime",
  /** column name */
  UpdatedDate = "UpdatedDate",
  /** column name */
  IsBorder = "isBorder",
  /** column name */
  IsPowerBiReport = "isPowerBiReport"
}

/** input type for updating data in table "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Set_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PowerBIGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PowerBIReportFilters?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportName?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportSections?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportTokenDetails?: InputMaybe<Scalars["String"]["input"]>;
  TokenExpirationTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  UpdatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  isBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Streaming cursor of the table "Tbl_PowerBIReportDetails" */
export type Tbl_PowerBiReportDetails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_PowerBiReportDetails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_PowerBiReportDetails_Stream_Cursor_Value_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  DashboardHeight?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  PowerBIGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PowerBIReportFilters?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportName?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportSections?: InputMaybe<Scalars["String"]["input"]>;
  PowerBIReportTokenDetails?: InputMaybe<Scalars["String"]["input"]>;
  TokenExpirationTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  UpdatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  isBorder?: InputMaybe<Scalars["Boolean"]["input"]>;
  isPowerBiReport?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** update columns of table "Tbl_PowerBIReportDetails" */
export enum Tbl_PowerBiReportDetails_Update_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  DashboardHeight = "DashboardHeight",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  PowerBiGuid = "PowerBIGuid",
  /** column name */
  PowerBiReportFilters = "PowerBIReportFilters",
  /** column name */
  PowerBiReportName = "PowerBIReportName",
  /** column name */
  PowerBiReportSections = "PowerBIReportSections",
  /** column name */
  PowerBiReportTokenDetails = "PowerBIReportTokenDetails",
  /** column name */
  TokenExpirationTime = "TokenExpirationTime",
  /** column name */
  UpdatedDate = "UpdatedDate",
  /** column name */
  IsBorder = "isBorder",
  /** column name */
  IsPowerBiReport = "isPowerBiReport"
}

export type Tbl_PowerBiReportDetails_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_PowerBiReportDetails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_PowerBiReportDetails_Bool_Exp;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_Roles = {
  __typename?: "Tbl_Roles";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDateUtc: Scalars["timestamp"]["output"];
  IsActive: Scalars["Boolean"]["output"];
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ParentRoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  Priority?: Maybe<Scalars["Int"]["output"]>;
  RoleGuid: Scalars["uuid"]["output"];
  RoleName: Scalars["String"]["output"];
  /** An array relationship */
  Tbl_CompanyRoleMappings: Array<Tbl_CompanyRoleMapping>;
  /** An aggregate relationship */
  Tbl_CompanyRoleMappings_aggregate: Tbl_CompanyRoleMapping_Aggregate;
  /** An array relationship */
  Tbl_CompanyStatusMasters: Array<Tbl_CompanyStatusMaster>;
  /** An aggregate relationship */
  Tbl_CompanyStatusMasters_aggregate: Tbl_CompanyStatusMaster_Aggregate;
  /** An array relationship */
  Tbl_Permissions: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  Tbl_Permissions_aggregate: Tbl_Permissions_Aggregate;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An array relationship */
  Tbl_UserRoleMappings: Array<Tbl_UserRoleMapping>;
  /** An aggregate relationship */
  Tbl_UserRoleMappings_aggregate: Tbl_UserRoleMapping_Aggregate;
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_CompanyRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_CompanyRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_CompanyStatusMastersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_CompanyStatusMasters_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_PermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_Permissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_UserRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Roles" */
export type Tbl_RolesTbl_UserRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** aggregated selection of "Tbl_Roles" */
export type Tbl_Roles_Aggregate = {
  __typename?: "Tbl_Roles_aggregate";
  aggregate?: Maybe<Tbl_Roles_Aggregate_Fields>;
  nodes: Array<Tbl_Roles>;
};

export type Tbl_Roles_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_Roles_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_Roles_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_Roles_Aggregate_Bool_Exp_Count>;
};

export type Tbl_Roles_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_Roles_Select_Column_Tbl_Roles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Roles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Roles_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_Roles_Select_Column_Tbl_Roles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Roles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_Roles_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_Roles_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_Roles" */
export type Tbl_Roles_Aggregate_Fields = {
  __typename?: "Tbl_Roles_aggregate_fields";
  avg?: Maybe<Tbl_Roles_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Roles_Max_Fields>;
  min?: Maybe<Tbl_Roles_Min_Fields>;
  stddev?: Maybe<Tbl_Roles_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_Roles_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_Roles_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_Roles_Sum_Fields>;
  var_pop?: Maybe<Tbl_Roles_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_Roles_Var_Samp_Fields>;
  variance?: Maybe<Tbl_Roles_Variance_Fields>;
};

/** aggregate fields of "Tbl_Roles" */
export type Tbl_Roles_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_Roles" */
export type Tbl_Roles_Aggregate_Order_By = {
  avg?: InputMaybe<Tbl_Roles_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_Roles_Max_Order_By>;
  min?: InputMaybe<Tbl_Roles_Min_Order_By>;
  stddev?: InputMaybe<Tbl_Roles_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tbl_Roles_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tbl_Roles_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tbl_Roles_Sum_Order_By>;
  var_pop?: InputMaybe<Tbl_Roles_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tbl_Roles_Var_Samp_Order_By>;
  variance?: InputMaybe<Tbl_Roles_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_Roles" */
export type Tbl_Roles_Arr_Rel_Insert_Input = {
  data: Array<Tbl_Roles_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Roles_On_Conflict>;
};

/** aggregate avg on columns */
export type Tbl_Roles_Avg_Fields = {
  __typename?: "Tbl_Roles_avg_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Avg_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Tbl_Roles". All fields are combined with a logical 'AND'. */
export type Tbl_Roles_Bool_Exp = {
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDateUtc?: InputMaybe<Timestamp_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  ParentRoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Priority?: InputMaybe<Int_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  RoleName?: InputMaybe<String_Comparison_Exp>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Bool_Exp>;
  Tbl_CompanyStatusMasters?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
  Tbl_CompanyStatusMasters_aggregate?: InputMaybe<Tbl_CompanyStatusMaster_Aggregate_Bool_Exp>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_Roles_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Roles_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Roles_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_Roles" */
export enum Tbl_Roles_Constraint {
  /** unique or primary key constraint on columns "RoleName" */
  IxTblRoles = "IX_Tbl_Roles",
  /** unique or primary key constraint on columns "RoleGuid" */
  TblRolesPkey = "Tbl_Roles_pkey"
}

/** input type for incrementing numeric columns in table "Tbl_Roles" */
export type Tbl_Roles_Inc_Input = {
  Priority?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Tbl_Roles" */
export type Tbl_Roles_Insert_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDateUtc?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ParentRoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Priority?: InputMaybe<Scalars["Int"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleName?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_CompanyRoleMappings?: InputMaybe<Tbl_CompanyRoleMapping_Arr_Rel_Insert_Input>;
  Tbl_CompanyStatusMasters?: InputMaybe<Tbl_CompanyStatusMaster_Arr_Rel_Insert_Input>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Arr_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Arr_Rel_Insert_Input>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_Roles_Max_Fields = {
  __typename?: "Tbl_Roles_max_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDateUtc?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ParentRoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  Priority?: Maybe<Scalars["Int"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  RoleName?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Max_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDateUtc?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ParentRoleGuid?: InputMaybe<Order_By>;
  Priority?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  RoleName?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_Roles_Min_Fields = {
  __typename?: "Tbl_Roles_min_fields";
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDateUtc?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ParentRoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  Priority?: Maybe<Scalars["Int"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  RoleName?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Min_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDateUtc?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ParentRoleGuid?: InputMaybe<Order_By>;
  Priority?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  RoleName?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_Roles" */
export type Tbl_Roles_Mutation_Response = {
  __typename?: "Tbl_Roles_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Roles>;
};

/** input type for inserting object relation for remote table "Tbl_Roles" */
export type Tbl_Roles_Obj_Rel_Insert_Input = {
  data: Tbl_Roles_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Roles_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Roles" */
export type Tbl_Roles_On_Conflict = {
  constraint: Tbl_Roles_Constraint;
  update_columns?: Array<Tbl_Roles_Update_Column>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Roles". */
export type Tbl_Roles_Order_By = {
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDateUtc?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  ParentRoleGuid?: InputMaybe<Order_By>;
  Priority?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  RoleName?: InputMaybe<Order_By>;
  Tbl_CompanyRoleMappings_aggregate?: InputMaybe<Tbl_CompanyRoleMapping_Aggregate_Order_By>;
  Tbl_CompanyStatusMasters_aggregate?: InputMaybe<Tbl_CompanyStatusMaster_Aggregate_Order_By>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_Roles */
export type Tbl_Roles_Pk_Columns_Input = {
  RoleGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_Roles" */
export enum Tbl_Roles_Select_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDateUtc = "CreatedDateUtc",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  ParentRoleGuid = "ParentRoleGuid",
  /** column name */
  Priority = "Priority",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  RoleName = "RoleName"
}

/** select "Tbl_Roles_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_Roles" */
export enum Tbl_Roles_Select_Column_Tbl_Roles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_Roles_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_Roles" */
export enum Tbl_Roles_Select_Column_Tbl_Roles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_Roles" */
export type Tbl_Roles_Set_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDateUtc?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ParentRoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Priority?: InputMaybe<Scalars["Int"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleName?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_Roles_Stddev_Fields = {
  __typename?: "Tbl_Roles_stddev_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Stddev_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tbl_Roles_Stddev_Pop_Fields = {
  __typename?: "Tbl_Roles_stddev_pop_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Stddev_Pop_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tbl_Roles_Stddev_Samp_Fields = {
  __typename?: "Tbl_Roles_stddev_samp_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Stddev_Samp_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Tbl_Roles" */
export type Tbl_Roles_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Roles_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Roles_Stream_Cursor_Value_Input = {
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDateUtc?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ParentRoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Priority?: InputMaybe<Scalars["Int"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  RoleName?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_Roles_Sum_Fields = {
  __typename?: "Tbl_Roles_sum_fields";
  Priority?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Sum_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** update columns of table "Tbl_Roles" */
export enum Tbl_Roles_Update_Column {
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDateUtc = "CreatedDateUtc",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  ParentRoleGuid = "ParentRoleGuid",
  /** column name */
  Priority = "Priority",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  RoleName = "RoleName"
}

export type Tbl_Roles_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_Roles_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Roles_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Roles_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_Roles_Var_Pop_Fields = {
  __typename?: "Tbl_Roles_var_pop_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Var_Pop_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tbl_Roles_Var_Samp_Fields = {
  __typename?: "Tbl_Roles_var_samp_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Var_Samp_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tbl_Roles_Variance_Fields = {
  __typename?: "Tbl_Roles_variance_fields";
  Priority?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Tbl_Roles" */
export type Tbl_Roles_Variance_Order_By = {
  Priority?: InputMaybe<Order_By>;
};

/** columns and relationships of "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping = {
  __typename?: "Tbl_UserCompanyMapping";
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  /** An object relationship */
  Tbl_Company?: Maybe<Tbl_Companies>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  UserCompanyMappingGuid: Scalars["uuid"]["output"];
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** aggregated selection of "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Aggregate = {
  __typename?: "Tbl_UserCompanyMapping_aggregate";
  aggregate?: Maybe<Tbl_UserCompanyMapping_Aggregate_Fields>;
  nodes: Array<Tbl_UserCompanyMapping>;
};

export type Tbl_UserCompanyMapping_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_UserCompanyMapping_Select_Column_Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_UserCompanyMapping_Select_Column_Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Aggregate_Fields = {
  __typename?: "Tbl_UserCompanyMapping_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserCompanyMapping_Max_Fields>;
  min?: Maybe<Tbl_UserCompanyMapping_Min_Fields>;
};

/** aggregate fields of "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_UserCompanyMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_UserCompanyMapping_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_UserCompanyMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserCompanyMapping_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_UserCompanyMapping". All fields are combined with a logical 'AND'. */
export type Tbl_UserCompanyMapping_Bool_Exp = {
  CompanyGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  UserCompanyMappingGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserCompanyMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserCompanyMapping_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_UserCompanyMapping" */
export enum Tbl_UserCompanyMapping_Constraint {
  /** unique or primary key constraint on columns "UserCompanyMappingGuid" */
  TblUserCompanyMappingPkey = "Tbl_UserCompanyMapping_pkey"
}

/** input type for inserting data into table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Insert_Input = {
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  UserCompanyMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_UserCompanyMapping_Max_Fields = {
  __typename?: "Tbl_UserCompanyMapping_max_fields";
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserCompanyMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Max_Order_By = {
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  UserCompanyMappingGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_UserCompanyMapping_Min_Fields = {
  __typename?: "Tbl_UserCompanyMapping_min_fields";
  CompanyGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserCompanyMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Min_Order_By = {
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  UserCompanyMappingGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Mutation_Response = {
  __typename?: "Tbl_UserCompanyMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserCompanyMapping>;
};

/** on_conflict condition type for table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_On_Conflict = {
  constraint: Tbl_UserCompanyMapping_Constraint;
  update_columns?: Array<Tbl_UserCompanyMapping_Update_Column>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserCompanyMapping". */
export type Tbl_UserCompanyMapping_Order_By = {
  CompanyGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  Tbl_Company?: InputMaybe<Tbl_Companies_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  UserCompanyMappingGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_UserCompanyMapping */
export type Tbl_UserCompanyMapping_Pk_Columns_Input = {
  UserCompanyMappingGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserCompanyMapping" */
export enum Tbl_UserCompanyMapping_Select_Column {
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  UserCompanyMappingGuid = "UserCompanyMappingGuid",
  /** column name */
  UserGuid = "UserGuid"
}

/** select "Tbl_UserCompanyMapping_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_UserCompanyMapping" */
export enum Tbl_UserCompanyMapping_Select_Column_Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_UserCompanyMapping_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_UserCompanyMapping" */
export enum Tbl_UserCompanyMapping_Select_Column_Tbl_UserCompanyMapping_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Set_Input = {
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserCompanyMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserCompanyMapping" */
export type Tbl_UserCompanyMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserCompanyMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserCompanyMapping_Stream_Cursor_Value_Input = {
  CompanyGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserCompanyMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserCompanyMapping" */
export enum Tbl_UserCompanyMapping_Update_Column {
  /** column name */
  CompanyGuid = "CompanyGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  UserCompanyMappingGuid = "UserCompanyMappingGuid",
  /** column name */
  UserGuid = "UserGuid"
}

export type Tbl_UserCompanyMapping_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserCompanyMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserCompanyMapping_Bool_Exp;
};

/** columns and relationships of "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping = {
  __typename?: "Tbl_UserLocationActivityMapping";
  ActivityGuid?: Maybe<Scalars["uuid"]["output"]>;
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsOrganizationAddressId?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_Address?: Maybe<Tbl_Addresses>;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserLocationActivityGuid: Scalars["uuid"]["output"];
};

/** aggregated selection of "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Aggregate = {
  __typename?: "Tbl_UserLocationActivityMapping_aggregate";
  aggregate?: Maybe<Tbl_UserLocationActivityMapping_Aggregate_Fields>;
  nodes: Array<Tbl_UserLocationActivityMapping>;
};

export type Tbl_UserLocationActivityMapping_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_UserLocationActivityMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_UserLocationActivityMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Aggregate_Fields = {
  __typename?: "Tbl_UserLocationActivityMapping_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserLocationActivityMapping_Max_Fields>;
  min?: Maybe<Tbl_UserLocationActivityMapping_Min_Fields>;
};

/** aggregate fields of "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_UserLocationActivityMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_UserLocationActivityMapping_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_UserLocationActivityMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserLocationActivityMapping_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_UserLocationActivityMapping". All fields are combined with a logical 'AND'. */
export type Tbl_UserLocationActivityMapping_Bool_Exp = {
  ActivityGuid?: InputMaybe<Uuid_Comparison_Exp>;
  AddressGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  OPsOrganizationAddressId?: InputMaybe<String_Comparison_Exp>;
  Tbl_Address?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserLocationActivityGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_UserLocationActivityMapping" */
export enum Tbl_UserLocationActivityMapping_Constraint {
  /** unique or primary key constraint on columns "UserLocationActivityGuid" */
  TblUserLocationActivityMappingPkey = "Tbl_UserLocationActivityMapping_pkey"
}

/** input type for inserting data into table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Insert_Input = {
  ActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsOrganizationAddressId?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Address?: InputMaybe<Tbl_Addresses_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLocationActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_UserLocationActivityMapping_Max_Fields = {
  __typename?: "Tbl_UserLocationActivityMapping_max_fields";
  ActivityGuid?: Maybe<Scalars["uuid"]["output"]>;
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsOrganizationAddressId?: Maybe<Scalars["String"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserLocationActivityGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Max_Order_By = {
  ActivityGuid?: InputMaybe<Order_By>;
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsOrganizationAddressId?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserLocationActivityGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_UserLocationActivityMapping_Min_Fields = {
  __typename?: "Tbl_UserLocationActivityMapping_min_fields";
  ActivityGuid?: Maybe<Scalars["uuid"]["output"]>;
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  OPsOrganizationAddressId?: Maybe<Scalars["String"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserLocationActivityGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Min_Order_By = {
  ActivityGuid?: InputMaybe<Order_By>;
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsOrganizationAddressId?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserLocationActivityGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Mutation_Response = {
  __typename?: "Tbl_UserLocationActivityMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserLocationActivityMapping>;
};

/** on_conflict condition type for table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_On_Conflict = {
  constraint: Tbl_UserLocationActivityMapping_Constraint;
  update_columns?: Array<Tbl_UserLocationActivityMapping_Update_Column>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserLocationActivityMapping". */
export type Tbl_UserLocationActivityMapping_Order_By = {
  ActivityGuid?: InputMaybe<Order_By>;
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OPsOrganizationAddressId?: InputMaybe<Order_By>;
  Tbl_Address?: InputMaybe<Tbl_Addresses_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserLocationActivityGuid?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_UserLocationActivityMapping */
export type Tbl_UserLocationActivityMapping_Pk_Columns_Input = {
  UserLocationActivityGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserLocationActivityMapping" */
export enum Tbl_UserLocationActivityMapping_Select_Column {
  /** column name */
  ActivityGuid = "ActivityGuid",
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OPsOrganizationAddressId = "OPsOrganizationAddressId",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserLocationActivityGuid = "UserLocationActivityGuid"
}

/** input type for updating data in table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Set_Input = {
  ActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsOrganizationAddressId?: InputMaybe<Scalars["String"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLocationActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserLocationActivityMapping" */
export type Tbl_UserLocationActivityMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserLocationActivityMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserLocationActivityMapping_Stream_Cursor_Value_Input = {
  ActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  OPsOrganizationAddressId?: InputMaybe<Scalars["String"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLocationActivityGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserLocationActivityMapping" */
export enum Tbl_UserLocationActivityMapping_Update_Column {
  /** column name */
  ActivityGuid = "ActivityGuid",
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OPsOrganizationAddressId = "OPsOrganizationAddressId",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserLocationActivityGuid = "UserLocationActivityGuid"
}

export type Tbl_UserLocationActivityMapping_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserLocationActivityMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserLocationActivityMapping_Bool_Exp;
};

/** columns and relationships of "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs = {
  __typename?: "Tbl_UserLoginLogs";
  ClientIP?: Maybe<Scalars["String"]["output"]>;
  LoginDate: Scalars["timestamp"]["output"];
  UserGuid: Scalars["uuid"]["output"];
  UserLoginLogsGuid: Scalars["uuid"]["output"];
};

/** aggregated selection of "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Aggregate = {
  __typename?: "Tbl_UserLoginLogs_aggregate";
  aggregate?: Maybe<Tbl_UserLoginLogs_Aggregate_Fields>;
  nodes: Array<Tbl_UserLoginLogs>;
};

/** aggregate fields of "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Aggregate_Fields = {
  __typename?: "Tbl_UserLoginLogs_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserLoginLogs_Max_Fields>;
  min?: Maybe<Tbl_UserLoginLogs_Min_Fields>;
};

/** aggregate fields of "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserLoginLogs_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_UserLoginLogs". All fields are combined with a logical 'AND'. */
export type Tbl_UserLoginLogs_Bool_Exp = {
  ClientIP?: InputMaybe<String_Comparison_Exp>;
  LoginDate?: InputMaybe<Timestamp_Comparison_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserLoginLogsGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserLoginLogs_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserLoginLogs_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_UserLoginLogs" */
export enum Tbl_UserLoginLogs_Constraint {
  /** unique or primary key constraint on columns "UserLoginLogsGuid" */
  TblUserLoginLogsPkey = "Tbl_UserLoginLogs_pkey"
}

/** input type for inserting data into table "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Insert_Input = {
  ClientIP?: InputMaybe<Scalars["String"]["input"]>;
  LoginDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLoginLogsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_UserLoginLogs_Max_Fields = {
  __typename?: "Tbl_UserLoginLogs_max_fields";
  ClientIP?: Maybe<Scalars["String"]["output"]>;
  LoginDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserLoginLogsGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_UserLoginLogs_Min_Fields = {
  __typename?: "Tbl_UserLoginLogs_min_fields";
  ClientIP?: Maybe<Scalars["String"]["output"]>;
  LoginDate?: Maybe<Scalars["timestamp"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserLoginLogsGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** response of any mutation on the table "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Mutation_Response = {
  __typename?: "Tbl_UserLoginLogs_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserLoginLogs>;
};

/** on_conflict condition type for table "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_On_Conflict = {
  constraint: Tbl_UserLoginLogs_Constraint;
  update_columns?: Array<Tbl_UserLoginLogs_Update_Column>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserLoginLogs". */
export type Tbl_UserLoginLogs_Order_By = {
  ClientIP?: InputMaybe<Order_By>;
  LoginDate?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserLoginLogsGuid?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_UserLoginLogs */
export type Tbl_UserLoginLogs_Pk_Columns_Input = {
  UserLoginLogsGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserLoginLogs" */
export enum Tbl_UserLoginLogs_Select_Column {
  /** column name */
  ClientIp = "ClientIP",
  /** column name */
  LoginDate = "LoginDate",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserLoginLogsGuid = "UserLoginLogsGuid"
}

/** input type for updating data in table "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Set_Input = {
  ClientIP?: InputMaybe<Scalars["String"]["input"]>;
  LoginDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLoginLogsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserLoginLogs" */
export type Tbl_UserLoginLogs_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserLoginLogs_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserLoginLogs_Stream_Cursor_Value_Input = {
  ClientIP?: InputMaybe<Scalars["String"]["input"]>;
  LoginDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserLoginLogsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserLoginLogs" */
export enum Tbl_UserLoginLogs_Update_Column {
  /** column name */
  ClientIp = "ClientIP",
  /** column name */
  LoginDate = "LoginDate",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserLoginLogsGuid = "UserLoginLogsGuid"
}

export type Tbl_UserLoginLogs_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserLoginLogs_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserLoginLogs_Bool_Exp;
};

/** columns and relationships of "Tbl_UserPermissions" */
export type Tbl_UserPermissions = {
  __typename?: "Tbl_UserPermissions";
  CreatedDate: Scalars["timestamp"]["output"];
  PermissionGuid: Scalars["uuid"]["output"];
  Rights: Scalars["bpchar"]["output"];
  /** An object relationship */
  Tbl_Permission: Tbl_Permissions;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserPermissionGuid: Scalars["uuid"]["output"];
};

/** aggregated selection of "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Aggregate = {
  __typename?: "Tbl_UserPermissions_aggregate";
  aggregate?: Maybe<Tbl_UserPermissions_Aggregate_Fields>;
  nodes: Array<Tbl_UserPermissions>;
};

export type Tbl_UserPermissions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_UserPermissions_Aggregate_Bool_Exp_Count>;
};

export type Tbl_UserPermissions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Aggregate_Fields = {
  __typename?: "Tbl_UserPermissions_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserPermissions_Max_Fields>;
  min?: Maybe<Tbl_UserPermissions_Min_Fields>;
};

/** aggregate fields of "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_UserPermissions_Max_Order_By>;
  min?: InputMaybe<Tbl_UserPermissions_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Arr_Rel_Insert_Input = {
  data: Array<Tbl_UserPermissions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserPermissions_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_UserPermissions". All fields are combined with a logical 'AND'. */
export type Tbl_UserPermissions_Bool_Exp = {
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  PermissionGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Rights?: InputMaybe<Bpchar_Comparison_Exp>;
  Tbl_Permission?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserPermissionGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserPermissions_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserPermissions_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_UserPermissions" */
export enum Tbl_UserPermissions_Constraint {
  /** unique or primary key constraint on columns "UserPermissionGuid" */
  TblUserPermissionsPkey = "Tbl_UserPermissions_pkey"
}

/** input type for inserting data into table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Insert_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Rights?: InputMaybe<Scalars["bpchar"]["input"]>;
  Tbl_Permission?: InputMaybe<Tbl_Permissions_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserPermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_UserPermissions_Max_Fields = {
  __typename?: "Tbl_UserPermissions_max_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
  Rights?: Maybe<Scalars["bpchar"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserPermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Max_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  Rights?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserPermissionGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_UserPermissions_Min_Fields = {
  __typename?: "Tbl_UserPermissions_min_fields";
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  PermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
  Rights?: Maybe<Scalars["bpchar"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserPermissionGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Min_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  Rights?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserPermissionGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Mutation_Response = {
  __typename?: "Tbl_UserPermissions_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserPermissions>;
};

/** on_conflict condition type for table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_On_Conflict = {
  constraint: Tbl_UserPermissions_Constraint;
  update_columns?: Array<Tbl_UserPermissions_Update_Column>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserPermissions". */
export type Tbl_UserPermissions_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  PermissionGuid?: InputMaybe<Order_By>;
  Rights?: InputMaybe<Order_By>;
  Tbl_Permission?: InputMaybe<Tbl_Permissions_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserPermissionGuid?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_UserPermissions */
export type Tbl_UserPermissions_Pk_Columns_Input = {
  UserPermissionGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserPermissions" */
export enum Tbl_UserPermissions_Select_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  PermissionGuid = "PermissionGuid",
  /** column name */
  Rights = "Rights",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserPermissionGuid = "UserPermissionGuid"
}

/** input type for updating data in table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Set_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Rights?: InputMaybe<Scalars["bpchar"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserPermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserPermissions" */
export type Tbl_UserPermissions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserPermissions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserPermissions_Stream_Cursor_Value_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  PermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Rights?: InputMaybe<Scalars["bpchar"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserPermissionGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserPermissions" */
export enum Tbl_UserPermissions_Update_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  PermissionGuid = "PermissionGuid",
  /** column name */
  Rights = "Rights",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserPermissionGuid = "UserPermissionGuid"
}

export type Tbl_UserPermissions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserPermissions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserPermissions_Bool_Exp;
};

/** columns and relationships of "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping = {
  __typename?: "Tbl_UserRoleMapping";
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid: Scalars["uuid"]["output"];
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  /** An object relationship */
  Tbl_Role: Tbl_Roles;
  /** An object relationship */
  Tbl_User?: Maybe<Tbl_Users>;
  /** An object relationship */
  Tbl_UserRoleMappings_userGuid: Tbl_Users;
  /** An object relationship */
  Tbl_UserStatusMaster?: Maybe<Tbl_UserStatusMaster>;
  UserGuid: Scalars["uuid"]["output"];
  UserRoleMappingGuid: Scalars["uuid"]["output"];
  /** An object relationship */
  tblUserByModifiedby?: Maybe<Tbl_Users>;
};

/** aggregated selection of "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Aggregate = {
  __typename?: "Tbl_UserRoleMapping_aggregate";
  aggregate?: Maybe<Tbl_UserRoleMapping_Aggregate_Fields>;
  nodes: Array<Tbl_UserRoleMapping>;
};

export type Tbl_UserRoleMapping_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp_Count>;
};

export type Tbl_UserRoleMapping_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Aggregate_Fields = {
  __typename?: "Tbl_UserRoleMapping_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserRoleMapping_Max_Fields>;
  min?: Maybe<Tbl_UserRoleMapping_Min_Fields>;
};

/** aggregate fields of "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_UserRoleMapping_Max_Order_By>;
  min?: InputMaybe<Tbl_UserRoleMapping_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Arr_Rel_Insert_Input = {
  data: Array<Tbl_UserRoleMapping_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserRoleMapping_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_UserRoleMapping". All fields are combined with a logical 'AND'. */
export type Tbl_UserRoleMapping_Bool_Exp = {
  AddressGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  RoleGuid?: InputMaybe<Uuid_Comparison_Exp>;
  StatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Bool_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserRoleMappings_userGuid?: InputMaybe<Tbl_Users_Bool_Exp>;
  Tbl_UserStatusMaster?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserRoleMappingGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserRoleMapping_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserRoleMapping_Bool_Exp>>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Tbl_UserRoleMapping" */
export enum Tbl_UserRoleMapping_Constraint {
  /** unique or primary key constraint on columns "UserRoleMappingGuid" */
  TblUserRoleMappingPkey = "Tbl_UserRoleMapping_pkey"
}

/** input type for inserting data into table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Insert_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Obj_Rel_Insert_Input>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserRoleMappings_userGuid?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  Tbl_UserStatusMaster?: InputMaybe<Tbl_UserStatusMaster_Obj_Rel_Insert_Input>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_UserRoleMapping_Max_Fields = {
  __typename?: "Tbl_UserRoleMapping_max_fields";
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserRoleMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Max_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserRoleMappingGuid?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_UserRoleMapping_Min_Fields = {
  __typename?: "Tbl_UserRoleMapping_min_fields";
  AddressGuid?: Maybe<Scalars["uuid"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  RoleGuid?: Maybe<Scalars["uuid"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserRoleMappingGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Min_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserRoleMappingGuid?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Mutation_Response = {
  __typename?: "Tbl_UserRoleMapping_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserRoleMapping>;
};

/** on_conflict condition type for table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_On_Conflict = {
  constraint: Tbl_UserRoleMapping_Constraint;
  update_columns?: Array<Tbl_UserRoleMapping_Update_Column>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserRoleMapping". */
export type Tbl_UserRoleMapping_Order_By = {
  AddressGuid?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  RoleGuid?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  Tbl_Role?: InputMaybe<Tbl_Roles_Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserRoleMappings_userGuid?: InputMaybe<Tbl_Users_Order_By>;
  Tbl_UserStatusMaster?: InputMaybe<Tbl_UserStatusMaster_Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserRoleMappingGuid?: InputMaybe<Order_By>;
  tblUserByModifiedby?: InputMaybe<Tbl_Users_Order_By>;
};

/** primary key columns input for table: Tbl_UserRoleMapping */
export type Tbl_UserRoleMapping_Pk_Columns_Input = {
  UserRoleMappingGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserRoleMapping" */
export enum Tbl_UserRoleMapping_Select_Column {
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  StatusGuid = "StatusGuid",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserRoleMappingGuid = "UserRoleMappingGuid"
}

/** input type for updating data in table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Set_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserRoleMapping" */
export type Tbl_UserRoleMapping_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserRoleMapping_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserRoleMapping_Stream_Cursor_Value_Input = {
  AddressGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  RoleGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserRoleMappingGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserRoleMapping" */
export enum Tbl_UserRoleMapping_Update_Column {
  /** column name */
  AddressGuid = "AddressGuid",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  RoleGuid = "RoleGuid",
  /** column name */
  StatusGuid = "StatusGuid",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserRoleMappingGuid = "UserRoleMappingGuid"
}

export type Tbl_UserRoleMapping_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserRoleMapping_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserRoleMapping_Bool_Exp;
};

/** columns and relationships of "Tbl_UserSessions" */
export type Tbl_UserSessions = {
  __typename?: "Tbl_UserSessions";
  BrowserToken?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate: Scalars["timestamptz"]["output"];
  Metadata?: Maybe<Scalars["jsonb"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate: Scalars["timestamptz"]["output"];
  OpsToken?: Maybe<Scalars["String"]["output"]>;
  PlatformToken?: Maybe<Scalars["String"]["output"]>;
  Status?: Maybe<Scalars["String"]["output"]>;
  StatusMetadata?: Maybe<Scalars["jsonb"]["output"]>;
  /** An object relationship */
  Tbl_User: Tbl_Users;
  UserId: Scalars["uuid"]["output"];
  WarpToken?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["uuid"]["output"];
};

/** columns and relationships of "Tbl_UserSessions" */
export type Tbl_UserSessionsMetadataArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** columns and relationships of "Tbl_UserSessions" */
export type Tbl_UserSessionsStatusMetadataArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregated selection of "Tbl_UserSessions" */
export type Tbl_UserSessions_Aggregate = {
  __typename?: "Tbl_UserSessions_aggregate";
  aggregate?: Maybe<Tbl_UserSessions_Aggregate_Fields>;
  nodes: Array<Tbl_UserSessions>;
};

export type Tbl_UserSessions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tbl_UserSessions_Aggregate_Bool_Exp_Count>;
};

export type Tbl_UserSessions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_UserSessions" */
export type Tbl_UserSessions_Aggregate_Fields = {
  __typename?: "Tbl_UserSessions_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserSessions_Max_Fields>;
  min?: Maybe<Tbl_UserSessions_Min_Fields>;
};

/** aggregate fields of "Tbl_UserSessions" */
export type Tbl_UserSessions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_UserSessions" */
export type Tbl_UserSessions_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_UserSessions_Max_Order_By>;
  min?: InputMaybe<Tbl_UserSessions_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Tbl_UserSessions_Append_Input = {
  Metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** input type for inserting array relation for remote table "Tbl_UserSessions" */
export type Tbl_UserSessions_Arr_Rel_Insert_Input = {
  data: Array<Tbl_UserSessions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserSessions_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_UserSessions". All fields are combined with a logical 'AND'. */
export type Tbl_UserSessions_Bool_Exp = {
  BrowserToken?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  Metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  OpsToken?: InputMaybe<String_Comparison_Exp>;
  PlatformToken?: InputMaybe<String_Comparison_Exp>;
  Status?: InputMaybe<String_Comparison_Exp>;
  StatusMetadata?: InputMaybe<Jsonb_Comparison_Exp>;
  Tbl_User?: InputMaybe<Tbl_Users_Bool_Exp>;
  UserId?: InputMaybe<Uuid_Comparison_Exp>;
  WarpToken?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_UserSessions_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserSessions_Bool_Exp>>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Tbl_UserSessions" */
export enum Tbl_UserSessions_Constraint {
  /** unique or primary key constraint on columns "id" */
  TblUserSessionsPkey = "Tbl_UserSessions_pkey"
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Tbl_UserSessions_Delete_At_Path_Input = {
  Metadata?: InputMaybe<Array<Scalars["String"]["input"]>>;
  StatusMetadata?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Tbl_UserSessions_Delete_Elem_Input = {
  Metadata?: InputMaybe<Scalars["Int"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["Int"]["input"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Tbl_UserSessions_Delete_Key_Input = {
  Metadata?: InputMaybe<Scalars["String"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["String"]["input"]>;
};

/** input type for inserting data into table "Tbl_UserSessions" */
export type Tbl_UserSessions_Insert_Input = {
  BrowserToken?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  Metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  OpsToken?: InputMaybe<Scalars["String"]["input"]>;
  PlatformToken?: InputMaybe<Scalars["String"]["input"]>;
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  Tbl_User?: InputMaybe<Tbl_Users_Obj_Rel_Insert_Input>;
  UserId?: InputMaybe<Scalars["uuid"]["input"]>;
  WarpToken?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_UserSessions_Max_Fields = {
  __typename?: "Tbl_UserSessions_max_fields";
  BrowserToken?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  OpsToken?: Maybe<Scalars["String"]["output"]>;
  PlatformToken?: Maybe<Scalars["String"]["output"]>;
  Status?: Maybe<Scalars["String"]["output"]>;
  UserId?: Maybe<Scalars["uuid"]["output"]>;
  WarpToken?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_UserSessions" */
export type Tbl_UserSessions_Max_Order_By = {
  BrowserToken?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OpsToken?: InputMaybe<Order_By>;
  PlatformToken?: InputMaybe<Order_By>;
  Status?: InputMaybe<Order_By>;
  UserId?: InputMaybe<Order_By>;
  WarpToken?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_UserSessions_Min_Fields = {
  __typename?: "Tbl_UserSessions_min_fields";
  BrowserToken?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  OpsToken?: Maybe<Scalars["String"]["output"]>;
  PlatformToken?: Maybe<Scalars["String"]["output"]>;
  Status?: Maybe<Scalars["String"]["output"]>;
  UserId?: Maybe<Scalars["uuid"]["output"]>;
  WarpToken?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_UserSessions" */
export type Tbl_UserSessions_Min_Order_By = {
  BrowserToken?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OpsToken?: InputMaybe<Order_By>;
  PlatformToken?: InputMaybe<Order_By>;
  Status?: InputMaybe<Order_By>;
  UserId?: InputMaybe<Order_By>;
  WarpToken?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_UserSessions" */
export type Tbl_UserSessions_Mutation_Response = {
  __typename?: "Tbl_UserSessions_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserSessions>;
};

/** on_conflict condition type for table "Tbl_UserSessions" */
export type Tbl_UserSessions_On_Conflict = {
  constraint: Tbl_UserSessions_Constraint;
  update_columns?: Array<Tbl_UserSessions_Update_Column>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserSessions". */
export type Tbl_UserSessions_Order_By = {
  BrowserToken?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  Metadata?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  OpsToken?: InputMaybe<Order_By>;
  PlatformToken?: InputMaybe<Order_By>;
  Status?: InputMaybe<Order_By>;
  StatusMetadata?: InputMaybe<Order_By>;
  Tbl_User?: InputMaybe<Tbl_Users_Order_By>;
  UserId?: InputMaybe<Order_By>;
  WarpToken?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_UserSessions */
export type Tbl_UserSessions_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Tbl_UserSessions_Prepend_Input = {
  Metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["jsonb"]["input"]>;
};

/** select columns of table "Tbl_UserSessions" */
export enum Tbl_UserSessions_Select_Column {
  /** column name */
  BrowserToken = "BrowserToken",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Metadata = "Metadata",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsToken = "OpsToken",
  /** column name */
  PlatformToken = "PlatformToken",
  /** column name */
  Status = "Status",
  /** column name */
  StatusMetadata = "StatusMetadata",
  /** column name */
  UserId = "UserId",
  /** column name */
  WarpToken = "WarpToken",
  /** column name */
  Id = "id"
}

/** input type for updating data in table "Tbl_UserSessions" */
export type Tbl_UserSessions_Set_Input = {
  BrowserToken?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  Metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  OpsToken?: InputMaybe<Scalars["String"]["input"]>;
  PlatformToken?: InputMaybe<Scalars["String"]["input"]>;
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  UserId?: InputMaybe<Scalars["uuid"]["input"]>;
  WarpToken?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserSessions" */
export type Tbl_UserSessions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserSessions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserSessions_Stream_Cursor_Value_Input = {
  BrowserToken?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  Metadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  OpsToken?: InputMaybe<Scalars["String"]["input"]>;
  PlatformToken?: InputMaybe<Scalars["String"]["input"]>;
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusMetadata?: InputMaybe<Scalars["jsonb"]["input"]>;
  UserId?: InputMaybe<Scalars["uuid"]["input"]>;
  WarpToken?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserSessions" */
export enum Tbl_UserSessions_Update_Column {
  /** column name */
  BrowserToken = "BrowserToken",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  Metadata = "Metadata",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  OpsToken = "OpsToken",
  /** column name */
  PlatformToken = "PlatformToken",
  /** column name */
  Status = "Status",
  /** column name */
  StatusMetadata = "StatusMetadata",
  /** column name */
  UserId = "UserId",
  /** column name */
  WarpToken = "WarpToken",
  /** column name */
  Id = "id"
}

export type Tbl_UserSessions_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Tbl_UserSessions_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Tbl_UserSessions_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Tbl_UserSessions_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Tbl_UserSessions_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Tbl_UserSessions_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserSessions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserSessions_Bool_Exp;
};

/** columns and relationships of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster = {
  __typename?: "Tbl_UserStatusMaster";
  Status?: Maybe<Scalars["String"]["output"]>;
  StatusGuid: Scalars["uuid"]["output"];
  /** An array relationship */
  Tbl_UserRoleMappings: Array<Tbl_UserRoleMapping>;
  /** An aggregate relationship */
  Tbl_UserRoleMappings_aggregate: Tbl_UserRoleMapping_Aggregate;
};

/** columns and relationships of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMasterTbl_UserRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMasterTbl_UserRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** aggregated selection of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Aggregate = {
  __typename?: "Tbl_UserStatusMaster_aggregate";
  aggregate?: Maybe<Tbl_UserStatusMaster_Aggregate_Fields>;
  nodes: Array<Tbl_UserStatusMaster>;
};

/** aggregate fields of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Aggregate_Fields = {
  __typename?: "Tbl_UserStatusMaster_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_UserStatusMaster_Max_Fields>;
  min?: Maybe<Tbl_UserStatusMaster_Min_Fields>;
};

/** aggregate fields of "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_UserStatusMaster_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Tbl_UserStatusMaster". All fields are combined with a logical 'AND'. */
export type Tbl_UserStatusMaster_Bool_Exp = {
  Status?: InputMaybe<String_Comparison_Exp>;
  StatusGuid?: InputMaybe<Uuid_Comparison_Exp>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Tbl_UserStatusMaster_Bool_Exp>>;
  _not?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_UserStatusMaster_Bool_Exp>>;
};

/** unique or primary key constraints on table "Tbl_UserStatusMaster" */
export enum Tbl_UserStatusMaster_Constraint {
  /** unique or primary key constraint on columns "StatusGuid" */
  TblUserStatusMasterPkey = "Tbl_UserStatusMaster_pkey"
}

/** input type for inserting data into table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Insert_Input = {
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tbl_UserStatusMaster_Max_Fields = {
  __typename?: "Tbl_UserStatusMaster_max_fields";
  Status?: Maybe<Scalars["String"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_UserStatusMaster_Min_Fields = {
  __typename?: "Tbl_UserStatusMaster_min_fields";
  Status?: Maybe<Scalars["String"]["output"]>;
  StatusGuid?: Maybe<Scalars["uuid"]["output"]>;
};

/** response of any mutation on the table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Mutation_Response = {
  __typename?: "Tbl_UserStatusMaster_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_UserStatusMaster>;
};

/** input type for inserting object relation for remote table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Obj_Rel_Insert_Input = {
  data: Tbl_UserStatusMaster_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_UserStatusMaster_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_On_Conflict = {
  constraint: Tbl_UserStatusMaster_Constraint;
  update_columns?: Array<Tbl_UserStatusMaster_Update_Column>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_UserStatusMaster". */
export type Tbl_UserStatusMaster_Order_By = {
  Status?: InputMaybe<Order_By>;
  StatusGuid?: InputMaybe<Order_By>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Order_By>;
};

/** primary key columns input for table: Tbl_UserStatusMaster */
export type Tbl_UserStatusMaster_Pk_Columns_Input = {
  StatusGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_UserStatusMaster" */
export enum Tbl_UserStatusMaster_Select_Column {
  /** column name */
  Status = "Status",
  /** column name */
  StatusGuid = "StatusGuid"
}

/** input type for updating data in table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Set_Input = {
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_UserStatusMaster" */
export type Tbl_UserStatusMaster_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_UserStatusMaster_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_UserStatusMaster_Stream_Cursor_Value_Input = {
  Status?: InputMaybe<Scalars["String"]["input"]>;
  StatusGuid?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_UserStatusMaster" */
export enum Tbl_UserStatusMaster_Update_Column {
  /** column name */
  Status = "Status",
  /** column name */
  StatusGuid = "StatusGuid"
}

export type Tbl_UserStatusMaster_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_UserStatusMaster_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_UserStatusMaster_Bool_Exp;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_Users = {
  __typename?: "Tbl_Users";
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CompanyWebsite?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CpanelUserId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ERPSupplierId?: Maybe<Scalars["String"]["output"]>;
  EmailId: Scalars["String"]["output"];
  FirstName?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  IsDeleted: Scalars["Boolean"]["output"];
  IsLocked?: Maybe<Scalars["Boolean"]["output"]>;
  IsNewsLetterSubscribed: Scalars["Boolean"]["output"];
  IsVerified?: Maybe<Scalars["Boolean"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LastLoginAttemptTime?: Maybe<Scalars["timestamp"]["output"]>;
  LastName?: Maybe<Scalars["String"]["output"]>;
  LockTime?: Maybe<Scalars["timestamp"]["output"]>;
  MobileNumber?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Int"]["output"]>;
  OPSUserId?: Maybe<Scalars["String"]["output"]>;
  ParentCompany?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  ReportsTo?: Maybe<Scalars["uuid"]["output"]>;
  SetPasswordToken?: Maybe<Scalars["String"]["output"]>;
  ShowGradeLevel?: Maybe<Scalars["Boolean"]["output"]>;
  SystemId?: Maybe<Scalars["bigint"]["output"]>;
  /** An array relationship */
  Tbl_Addresses: Array<Tbl_Addresses>;
  /** An aggregate relationship */
  Tbl_Addresses_aggregate: Tbl_Addresses_Aggregate;
  /** An array relationship */
  Tbl_AssessmentMappings: Array<Tbl_AssessmentMapping>;
  /** An aggregate relationship */
  Tbl_AssessmentMappings_aggregate: Tbl_AssessmentMapping_Aggregate;
  /** An array relationship */
  Tbl_BusinessTypeMasters: Array<Tbl_BusinessTypeMaster>;
  /** An aggregate relationship */
  Tbl_BusinessTypeMasters_aggregate: Tbl_BusinessTypeMaster_Aggregate;
  /** An array relationship */
  Tbl_Companies: Array<Tbl_Companies>;
  /** An aggregate relationship */
  Tbl_Companies_aggregate: Tbl_Companies_Aggregate;
  /** An array relationship */
  Tbl_CompanyBusinessTypes: Array<Tbl_CompanyBusinessType>;
  /** An aggregate relationship */
  Tbl_CompanyBusinessTypes_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** An array relationship */
  Tbl_CompanyGeneralDetails: Array<Tbl_CompanyGeneralDetails>;
  /** An aggregate relationship */
  Tbl_CompanyGeneralDetails_aggregate: Tbl_CompanyGeneralDetails_Aggregate;
  /** An array relationship */
  Tbl_CountryMasters: Array<Tbl_CountryMaster>;
  /** An aggregate relationship */
  Tbl_CountryMasters_aggregate: Tbl_CountryMaster_Aggregate;
  /** An array relationship */
  Tbl_EmailHeaderFooters: Array<Tbl_EmailHeaderFooter>;
  /** An aggregate relationship */
  Tbl_EmailHeaderFooters_aggregate: Tbl_EmailHeaderFooter_Aggregate;
  /** An array relationship */
  Tbl_EmailTemplateNotificationDetails: Array<Tbl_EmailTemplateNotificationDetails>;
  /** An aggregate relationship */
  Tbl_EmailTemplateNotificationDetails_aggregate: Tbl_EmailTemplateNotificationDetails_Aggregate;
  /** An array relationship */
  Tbl_EmailTemplates: Array<Tbl_EmailTemplate>;
  /** An aggregate relationship */
  Tbl_EmailTemplates_aggregate: Tbl_EmailTemplate_Aggregate;
  /** An array relationship */
  Tbl_LanguageResources: Array<Tbl_LanguageResources>;
  /** An aggregate relationship */
  Tbl_LanguageResources_aggregate: Tbl_LanguageResources_Aggregate;
  /** An array relationship */
  Tbl_Permissions: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  Tbl_Permissions_aggregate: Tbl_Permissions_Aggregate;
  /** An array relationship */
  Tbl_Roles: Array<Tbl_Roles>;
  /** An aggregate relationship */
  Tbl_Roles_aggregate: Tbl_Roles_Aggregate;
  /** An array relationship */
  Tbl_UserCompanyMappings: Array<Tbl_UserCompanyMapping>;
  /** An aggregate relationship */
  Tbl_UserCompanyMappings_aggregate: Tbl_UserCompanyMapping_Aggregate;
  /** An array relationship */
  Tbl_UserLocationActivityMappings: Array<Tbl_UserLocationActivityMapping>;
  /** An aggregate relationship */
  Tbl_UserLocationActivityMappings_aggregate: Tbl_UserLocationActivityMapping_Aggregate;
  /** An array relationship */
  Tbl_UserPermissions: Array<Tbl_UserPermissions>;
  /** An aggregate relationship */
  Tbl_UserPermissions_aggregate: Tbl_UserPermissions_Aggregate;
  /** An array relationship */
  Tbl_UserRoleMappings: Array<Tbl_UserRoleMapping>;
  /** An aggregate relationship */
  Tbl_UserRoleMappings_aggregate: Tbl_UserRoleMapping_Aggregate;
  /** An array relationship */
  Tbl_UserRoleMappings_userGuid: Array<Tbl_UserRoleMapping>;
  /** An aggregate relationship */
  Tbl_UserRoleMappings_userGuid_aggregate: Tbl_UserRoleMapping_Aggregate;
  /** An array relationship */
  Tbl_UserSessions: Array<Tbl_UserSessions>;
  /** An aggregate relationship */
  Tbl_UserSessions_aggregate: Tbl_UserSessions_Aggregate;
  UserGuid: Scalars["uuid"]["output"];
  UserProfileImage?: Maybe<Scalars["String"]["output"]>;
  isEmailSubscribed?: Maybe<Scalars["Boolean"]["output"]>;
  isResetPasswordDone: Scalars["Boolean"]["output"];
  /** An array relationship */
  tblBusinesstypemastersByModifiedby: Array<Tbl_BusinessTypeMaster>;
  /** An aggregate relationship */
  tblBusinesstypemastersByModifiedby_aggregate: Tbl_BusinessTypeMaster_Aggregate;
  /** An array relationship */
  tblCompaniesByModifiedby: Array<Tbl_Companies>;
  /** An aggregate relationship */
  tblCompaniesByModifiedby_aggregate: Tbl_Companies_Aggregate;
  /** An array relationship */
  tblCompanybusinesstypesByModifiedby: Array<Tbl_CompanyBusinessType>;
  /** An aggregate relationship */
  tblCompanybusinesstypesByModifiedby_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** An array relationship */
  tblCompanygeneraldetailsByModifiedby: Array<Tbl_CompanyGeneralDetails>;
  /** An aggregate relationship */
  tblCompanygeneraldetailsByModifiedby_aggregate: Tbl_CompanyGeneralDetails_Aggregate;
  /** An array relationship */
  tblCountrymastersByModifiedby: Array<Tbl_CountryMaster>;
  /** An aggregate relationship */
  tblCountrymastersByModifiedby_aggregate: Tbl_CountryMaster_Aggregate;
  /** An array relationship */
  tblEmailheaderfootersByModifiedby: Array<Tbl_EmailHeaderFooter>;
  /** An aggregate relationship */
  tblEmailheaderfootersByModifiedby_aggregate: Tbl_EmailHeaderFooter_Aggregate;
  /** An array relationship */
  tblEmailtemplatesByModifiedby: Array<Tbl_EmailTemplate>;
  /** An aggregate relationship */
  tblEmailtemplatesByModifiedby_aggregate: Tbl_EmailTemplate_Aggregate;
  /** An array relationship */
  tblLanguageresourcesByModifiedby: Array<Tbl_LanguageResources>;
  /** An aggregate relationship */
  tblLanguageresourcesByModifiedby_aggregate: Tbl_LanguageResources_Aggregate;
  /** An array relationship */
  tblPermissionsByModifiedby: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  tblPermissionsByModifiedby_aggregate: Tbl_Permissions_Aggregate;
  /** An array relationship */
  tblRolesByModifiedby: Array<Tbl_Roles>;
  /** An aggregate relationship */
  tblRolesByModifiedby_aggregate: Tbl_Roles_Aggregate;
  /** An array relationship */
  tblUserrolemappingsByModifiedby: Array<Tbl_UserRoleMapping>;
  /** An aggregate relationship */
  tblUserrolemappingsByModifiedby_aggregate: Tbl_UserRoleMapping_Aggregate;
  userposition?: Maybe<Scalars["String"]["output"]>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_AddressesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_Addresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_AssessmentMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_AssessmentMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_BusinessTypeMastersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_BusinessTypeMasters_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CompaniesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_Companies_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CompanyBusinessTypesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CompanyBusinessTypes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CompanyGeneralDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CompanyGeneralDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CountryMastersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_CountryMasters_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailHeaderFootersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailHeaderFooters_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailTemplateNotificationDetailsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailTemplateNotificationDetails_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailTemplatesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_EmailTemplates_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_LanguageResourcesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_LanguageResources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_PermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_Permissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_RolesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserCompanyMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserCompanyMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserLocationActivityMappingsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserLocationActivityMappings_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserPermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserPermissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserRoleMappingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserRoleMappings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserRoleMappings_UserGuidArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserRoleMappings_UserGuid_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserSessionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTbl_UserSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblBusinesstypemastersByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblBusinesstypemastersByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompaniesByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompaniesByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompanybusinesstypesByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompanybusinesstypesByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompanygeneraldetailsByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCompanygeneraldetailsByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCountrymastersByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblCountrymastersByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblEmailheaderfootersByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblEmailheaderfootersByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblEmailtemplatesByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblEmailtemplatesByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblLanguageresourcesByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblLanguageresourcesByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblPermissionsByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblPermissionsByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblRolesByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblRolesByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblUserrolemappingsByModifiedbyArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** columns and relationships of "Tbl_Users" */
export type Tbl_UsersTblUserrolemappingsByModifiedby_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

/** aggregated selection of "Tbl_Users" */
export type Tbl_Users_Aggregate = {
  __typename?: "Tbl_Users_aggregate";
  aggregate?: Maybe<Tbl_Users_Aggregate_Fields>;
  nodes: Array<Tbl_Users>;
};

/** aggregate fields of "Tbl_Users" */
export type Tbl_Users_Aggregate_Fields = {
  __typename?: "Tbl_Users_aggregate_fields";
  avg?: Maybe<Tbl_Users_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Users_Max_Fields>;
  min?: Maybe<Tbl_Users_Min_Fields>;
  stddev?: Maybe<Tbl_Users_Stddev_Fields>;
  stddev_pop?: Maybe<Tbl_Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tbl_Users_Stddev_Samp_Fields>;
  sum?: Maybe<Tbl_Users_Sum_Fields>;
  var_pop?: Maybe<Tbl_Users_Var_Pop_Fields>;
  var_samp?: Maybe<Tbl_Users_Var_Samp_Fields>;
  variance?: Maybe<Tbl_Users_Variance_Fields>;
};

/** aggregate fields of "Tbl_Users" */
export type Tbl_Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Users_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate avg on columns */
export type Tbl_Users_Avg_Fields = {
  __typename?: "Tbl_Users_avg_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** Boolean expression to filter rows from the table "Tbl_Users". All fields are combined with a logical 'AND'. */
export type Tbl_Users_Bool_Exp = {
  CompanyName?: InputMaybe<String_Comparison_Exp>;
  CompanyWebsite?: InputMaybe<String_Comparison_Exp>;
  CountryGuid?: InputMaybe<Uuid_Comparison_Exp>;
  CpanelUserId?: InputMaybe<String_Comparison_Exp>;
  CreatedBy?: InputMaybe<Uuid_Comparison_Exp>;
  CreatedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  ERPSupplierId?: InputMaybe<String_Comparison_Exp>;
  EmailId?: InputMaybe<String_Comparison_Exp>;
  FirstName?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  IsDeleted?: InputMaybe<Boolean_Comparison_Exp>;
  IsLocked?: InputMaybe<Boolean_Comparison_Exp>;
  IsNewsLetterSubscribed?: InputMaybe<Boolean_Comparison_Exp>;
  IsVerified?: InputMaybe<Boolean_Comparison_Exp>;
  LanguageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  LastLoginAttemptTime?: InputMaybe<Timestamp_Comparison_Exp>;
  LastName?: InputMaybe<String_Comparison_Exp>;
  LockTime?: InputMaybe<Timestamp_Comparison_Exp>;
  MobileNumber?: InputMaybe<String_Comparison_Exp>;
  ModifiedBy?: InputMaybe<Uuid_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamp_Comparison_Exp>;
  NumberOfFailedLoginAttempts?: InputMaybe<Int_Comparison_Exp>;
  OPSUserId?: InputMaybe<String_Comparison_Exp>;
  ParentCompany?: InputMaybe<String_Comparison_Exp>;
  Password?: InputMaybe<String_Comparison_Exp>;
  ReportsTo?: InputMaybe<Uuid_Comparison_Exp>;
  SetPasswordToken?: InputMaybe<String_Comparison_Exp>;
  ShowGradeLevel?: InputMaybe<Boolean_Comparison_Exp>;
  SystemId?: InputMaybe<Bigint_Comparison_Exp>;
  Tbl_Addresses?: InputMaybe<Tbl_Addresses_Bool_Exp>;
  Tbl_Addresses_aggregate?: InputMaybe<Tbl_Addresses_Aggregate_Bool_Exp>;
  Tbl_AssessmentMappings?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
  Tbl_AssessmentMappings_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Bool_Exp>;
  Tbl_BusinessTypeMasters?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  Tbl_BusinessTypeMasters_aggregate?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Bool_Exp>;
  Tbl_Companies?: InputMaybe<Tbl_Companies_Bool_Exp>;
  Tbl_Companies_aggregate?: InputMaybe<Tbl_Companies_Aggregate_Bool_Exp>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Bool_Exp>;
  Tbl_CompanyGeneralDetails?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
  Tbl_CompanyGeneralDetails_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp>;
  Tbl_CountryMasters?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  Tbl_CountryMasters_aggregate?: InputMaybe<Tbl_CountryMaster_Aggregate_Bool_Exp>;
  Tbl_EmailHeaderFooters?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
  Tbl_EmailHeaderFooters_aggregate?: InputMaybe<Tbl_EmailHeaderFooter_Aggregate_Bool_Exp>;
  Tbl_EmailTemplateNotificationDetails?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  Tbl_EmailTemplateNotificationDetails_aggregate?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Bool_Exp>;
  Tbl_EmailTemplates?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  Tbl_EmailTemplates_aggregate?: InputMaybe<Tbl_EmailTemplate_Aggregate_Bool_Exp>;
  Tbl_LanguageResources?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  Tbl_LanguageResources_aggregate?: InputMaybe<Tbl_LanguageResources_Aggregate_Bool_Exp>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp>;
  Tbl_Roles?: InputMaybe<Tbl_Roles_Bool_Exp>;
  Tbl_Roles_aggregate?: InputMaybe<Tbl_Roles_Aggregate_Bool_Exp>;
  Tbl_UserCompanyMappings?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
  Tbl_UserCompanyMappings_aggregate?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Bool_Exp>;
  Tbl_UserLocationActivityMappings?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
  Tbl_UserLocationActivityMappings_aggregate?: InputMaybe<Tbl_UserLocationActivityMapping_Aggregate_Bool_Exp>;
  Tbl_UserPermissions?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
  Tbl_UserPermissions_aggregate?: InputMaybe<Tbl_UserPermissions_Aggregate_Bool_Exp>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp>;
  Tbl_UserRoleMappings_userGuid?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  Tbl_UserRoleMappings_userGuid_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp>;
  Tbl_UserSessions?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
  Tbl_UserSessions_aggregate?: InputMaybe<Tbl_UserSessions_Aggregate_Bool_Exp>;
  UserGuid?: InputMaybe<Uuid_Comparison_Exp>;
  UserProfileImage?: InputMaybe<String_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_Users_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Users_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Users_Bool_Exp>>;
  isEmailSubscribed?: InputMaybe<Boolean_Comparison_Exp>;
  isResetPasswordDone?: InputMaybe<Boolean_Comparison_Exp>;
  tblBusinesstypemastersByModifiedby?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
  tblBusinesstypemastersByModifiedby_aggregate?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Bool_Exp>;
  tblCompaniesByModifiedby?: InputMaybe<Tbl_Companies_Bool_Exp>;
  tblCompaniesByModifiedby_aggregate?: InputMaybe<Tbl_Companies_Aggregate_Bool_Exp>;
  tblCompanybusinesstypesByModifiedby?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
  tblCompanybusinesstypesByModifiedby_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Bool_Exp>;
  tblCompanygeneraldetailsByModifiedby?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
  tblCompanygeneraldetailsByModifiedby_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Bool_Exp>;
  tblCountrymastersByModifiedby?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
  tblCountrymastersByModifiedby_aggregate?: InputMaybe<Tbl_CountryMaster_Aggregate_Bool_Exp>;
  tblEmailheaderfootersByModifiedby?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
  tblEmailheaderfootersByModifiedby_aggregate?: InputMaybe<Tbl_EmailHeaderFooter_Aggregate_Bool_Exp>;
  tblEmailtemplatesByModifiedby?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
  tblEmailtemplatesByModifiedby_aggregate?: InputMaybe<Tbl_EmailTemplate_Aggregate_Bool_Exp>;
  tblLanguageresourcesByModifiedby?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
  tblLanguageresourcesByModifiedby_aggregate?: InputMaybe<Tbl_LanguageResources_Aggregate_Bool_Exp>;
  tblPermissionsByModifiedby?: InputMaybe<Tbl_Permissions_Bool_Exp>;
  tblPermissionsByModifiedby_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Bool_Exp>;
  tblRolesByModifiedby?: InputMaybe<Tbl_Roles_Bool_Exp>;
  tblRolesByModifiedby_aggregate?: InputMaybe<Tbl_Roles_Aggregate_Bool_Exp>;
  tblUserrolemappingsByModifiedby?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
  tblUserrolemappingsByModifiedby_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Bool_Exp>;
  userposition?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Tbl_Users" */
export enum Tbl_Users_Constraint {
  /** unique or primary key constraint on columns "UserGuid" */
  TblUsersPkey = "Tbl_Users_pkey",
  /** unique or primary key constraint on columns "EmailId" */
  UqEmail = "UQ_Email"
}

/** input type for incrementing numeric columns in table "Tbl_Users" */
export type Tbl_Users_Inc_Input = {
  NumberOfFailedLoginAttempts?: InputMaybe<Scalars["Int"]["input"]>;
  SystemId?: InputMaybe<Scalars["bigint"]["input"]>;
};

/** input type for inserting data into table "Tbl_Users" */
export type Tbl_Users_Insert_Input = {
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CompanyWebsite?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CpanelUserId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ERPSupplierId?: InputMaybe<Scalars["String"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  FirstName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocked?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsNewsLetterSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LastLoginAttemptTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  LastName?: InputMaybe<Scalars["String"]["input"]>;
  LockTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  MobileNumber?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfFailedLoginAttempts?: InputMaybe<Scalars["Int"]["input"]>;
  OPSUserId?: InputMaybe<Scalars["String"]["input"]>;
  ParentCompany?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  ReportsTo?: InputMaybe<Scalars["uuid"]["input"]>;
  SetPasswordToken?: InputMaybe<Scalars["String"]["input"]>;
  ShowGradeLevel?: InputMaybe<Scalars["Boolean"]["input"]>;
  SystemId?: InputMaybe<Scalars["bigint"]["input"]>;
  Tbl_Addresses?: InputMaybe<Tbl_Addresses_Arr_Rel_Insert_Input>;
  Tbl_AssessmentMappings?: InputMaybe<Tbl_AssessmentMapping_Arr_Rel_Insert_Input>;
  Tbl_BusinessTypeMasters?: InputMaybe<Tbl_BusinessTypeMaster_Arr_Rel_Insert_Input>;
  Tbl_Companies?: InputMaybe<Tbl_Companies_Arr_Rel_Insert_Input>;
  Tbl_CompanyBusinessTypes?: InputMaybe<Tbl_CompanyBusinessType_Arr_Rel_Insert_Input>;
  Tbl_CompanyGeneralDetails?: InputMaybe<Tbl_CompanyGeneralDetails_Arr_Rel_Insert_Input>;
  Tbl_CountryMasters?: InputMaybe<Tbl_CountryMaster_Arr_Rel_Insert_Input>;
  Tbl_EmailHeaderFooters?: InputMaybe<Tbl_EmailHeaderFooter_Arr_Rel_Insert_Input>;
  Tbl_EmailTemplateNotificationDetails?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Arr_Rel_Insert_Input>;
  Tbl_EmailTemplates?: InputMaybe<Tbl_EmailTemplate_Arr_Rel_Insert_Input>;
  Tbl_LanguageResources?: InputMaybe<Tbl_LanguageResources_Arr_Rel_Insert_Input>;
  Tbl_Permissions?: InputMaybe<Tbl_Permissions_Arr_Rel_Insert_Input>;
  Tbl_Roles?: InputMaybe<Tbl_Roles_Arr_Rel_Insert_Input>;
  Tbl_UserCompanyMappings?: InputMaybe<Tbl_UserCompanyMapping_Arr_Rel_Insert_Input>;
  Tbl_UserLocationActivityMappings?: InputMaybe<Tbl_UserLocationActivityMapping_Arr_Rel_Insert_Input>;
  Tbl_UserPermissions?: InputMaybe<Tbl_UserPermissions_Arr_Rel_Insert_Input>;
  Tbl_UserRoleMappings?: InputMaybe<Tbl_UserRoleMapping_Arr_Rel_Insert_Input>;
  Tbl_UserRoleMappings_userGuid?: InputMaybe<Tbl_UserRoleMapping_Arr_Rel_Insert_Input>;
  Tbl_UserSessions?: InputMaybe<Tbl_UserSessions_Arr_Rel_Insert_Input>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserProfileImage?: InputMaybe<Scalars["String"]["input"]>;
  isEmailSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  isResetPasswordDone?: InputMaybe<Scalars["Boolean"]["input"]>;
  tblBusinesstypemastersByModifiedby?: InputMaybe<Tbl_BusinessTypeMaster_Arr_Rel_Insert_Input>;
  tblCompaniesByModifiedby?: InputMaybe<Tbl_Companies_Arr_Rel_Insert_Input>;
  tblCompanybusinesstypesByModifiedby?: InputMaybe<Tbl_CompanyBusinessType_Arr_Rel_Insert_Input>;
  tblCompanygeneraldetailsByModifiedby?: InputMaybe<Tbl_CompanyGeneralDetails_Arr_Rel_Insert_Input>;
  tblCountrymastersByModifiedby?: InputMaybe<Tbl_CountryMaster_Arr_Rel_Insert_Input>;
  tblEmailheaderfootersByModifiedby?: InputMaybe<Tbl_EmailHeaderFooter_Arr_Rel_Insert_Input>;
  tblEmailtemplatesByModifiedby?: InputMaybe<Tbl_EmailTemplate_Arr_Rel_Insert_Input>;
  tblLanguageresourcesByModifiedby?: InputMaybe<Tbl_LanguageResources_Arr_Rel_Insert_Input>;
  tblPermissionsByModifiedby?: InputMaybe<Tbl_Permissions_Arr_Rel_Insert_Input>;
  tblRolesByModifiedby?: InputMaybe<Tbl_Roles_Arr_Rel_Insert_Input>;
  tblUserrolemappingsByModifiedby?: InputMaybe<Tbl_UserRoleMapping_Arr_Rel_Insert_Input>;
  userposition?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_Users_Max_Fields = {
  __typename?: "Tbl_Users_max_fields";
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CompanyWebsite?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CpanelUserId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ERPSupplierId?: Maybe<Scalars["String"]["output"]>;
  EmailId?: Maybe<Scalars["String"]["output"]>;
  FirstName?: Maybe<Scalars["String"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LastLoginAttemptTime?: Maybe<Scalars["timestamp"]["output"]>;
  LastName?: Maybe<Scalars["String"]["output"]>;
  LockTime?: Maybe<Scalars["timestamp"]["output"]>;
  MobileNumber?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Int"]["output"]>;
  OPSUserId?: Maybe<Scalars["String"]["output"]>;
  ParentCompany?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  ReportsTo?: Maybe<Scalars["uuid"]["output"]>;
  SetPasswordToken?: Maybe<Scalars["String"]["output"]>;
  SystemId?: Maybe<Scalars["bigint"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserProfileImage?: Maybe<Scalars["String"]["output"]>;
  userposition?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_Users_Min_Fields = {
  __typename?: "Tbl_Users_min_fields";
  CompanyName?: Maybe<Scalars["String"]["output"]>;
  CompanyWebsite?: Maybe<Scalars["String"]["output"]>;
  CountryGuid?: Maybe<Scalars["uuid"]["output"]>;
  CpanelUserId?: Maybe<Scalars["String"]["output"]>;
  CreatedBy?: Maybe<Scalars["uuid"]["output"]>;
  CreatedDate?: Maybe<Scalars["timestamp"]["output"]>;
  ERPSupplierId?: Maybe<Scalars["String"]["output"]>;
  EmailId?: Maybe<Scalars["String"]["output"]>;
  FirstName?: Maybe<Scalars["String"]["output"]>;
  LanguageGuid?: Maybe<Scalars["uuid"]["output"]>;
  LastLoginAttemptTime?: Maybe<Scalars["timestamp"]["output"]>;
  LastName?: Maybe<Scalars["String"]["output"]>;
  LockTime?: Maybe<Scalars["timestamp"]["output"]>;
  MobileNumber?: Maybe<Scalars["String"]["output"]>;
  ModifiedBy?: Maybe<Scalars["uuid"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamp"]["output"]>;
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Int"]["output"]>;
  OPSUserId?: Maybe<Scalars["String"]["output"]>;
  ParentCompany?: Maybe<Scalars["String"]["output"]>;
  Password?: Maybe<Scalars["String"]["output"]>;
  ReportsTo?: Maybe<Scalars["uuid"]["output"]>;
  SetPasswordToken?: Maybe<Scalars["String"]["output"]>;
  SystemId?: Maybe<Scalars["bigint"]["output"]>;
  UserGuid?: Maybe<Scalars["uuid"]["output"]>;
  UserProfileImage?: Maybe<Scalars["String"]["output"]>;
  userposition?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Tbl_Users" */
export type Tbl_Users_Mutation_Response = {
  __typename?: "Tbl_Users_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Users>;
};

/** input type for inserting object relation for remote table "Tbl_Users" */
export type Tbl_Users_Obj_Rel_Insert_Input = {
  data: Tbl_Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_Users_On_Conflict>;
};

/** on_conflict condition type for table "Tbl_Users" */
export type Tbl_Users_On_Conflict = {
  constraint: Tbl_Users_Constraint;
  update_columns?: Array<Tbl_Users_Update_Column>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_Users". */
export type Tbl_Users_Order_By = {
  CompanyName?: InputMaybe<Order_By>;
  CompanyWebsite?: InputMaybe<Order_By>;
  CountryGuid?: InputMaybe<Order_By>;
  CpanelUserId?: InputMaybe<Order_By>;
  CreatedBy?: InputMaybe<Order_By>;
  CreatedDate?: InputMaybe<Order_By>;
  ERPSupplierId?: InputMaybe<Order_By>;
  EmailId?: InputMaybe<Order_By>;
  FirstName?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  IsDeleted?: InputMaybe<Order_By>;
  IsLocked?: InputMaybe<Order_By>;
  IsNewsLetterSubscribed?: InputMaybe<Order_By>;
  IsVerified?: InputMaybe<Order_By>;
  LanguageGuid?: InputMaybe<Order_By>;
  LastLoginAttemptTime?: InputMaybe<Order_By>;
  LastName?: InputMaybe<Order_By>;
  LockTime?: InputMaybe<Order_By>;
  MobileNumber?: InputMaybe<Order_By>;
  ModifiedBy?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  NumberOfFailedLoginAttempts?: InputMaybe<Order_By>;
  OPSUserId?: InputMaybe<Order_By>;
  ParentCompany?: InputMaybe<Order_By>;
  Password?: InputMaybe<Order_By>;
  ReportsTo?: InputMaybe<Order_By>;
  SetPasswordToken?: InputMaybe<Order_By>;
  ShowGradeLevel?: InputMaybe<Order_By>;
  SystemId?: InputMaybe<Order_By>;
  Tbl_Addresses_aggregate?: InputMaybe<Tbl_Addresses_Aggregate_Order_By>;
  Tbl_AssessmentMappings_aggregate?: InputMaybe<Tbl_AssessmentMapping_Aggregate_Order_By>;
  Tbl_BusinessTypeMasters_aggregate?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Order_By>;
  Tbl_Companies_aggregate?: InputMaybe<Tbl_Companies_Aggregate_Order_By>;
  Tbl_CompanyBusinessTypes_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Order_By>;
  Tbl_CompanyGeneralDetails_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Order_By>;
  Tbl_CountryMasters_aggregate?: InputMaybe<Tbl_CountryMaster_Aggregate_Order_By>;
  Tbl_EmailHeaderFooters_aggregate?: InputMaybe<Tbl_EmailHeaderFooter_Aggregate_Order_By>;
  Tbl_EmailTemplateNotificationDetails_aggregate?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Aggregate_Order_By>;
  Tbl_EmailTemplates_aggregate?: InputMaybe<Tbl_EmailTemplate_Aggregate_Order_By>;
  Tbl_LanguageResources_aggregate?: InputMaybe<Tbl_LanguageResources_Aggregate_Order_By>;
  Tbl_Permissions_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Order_By>;
  Tbl_Roles_aggregate?: InputMaybe<Tbl_Roles_Aggregate_Order_By>;
  Tbl_UserCompanyMappings_aggregate?: InputMaybe<Tbl_UserCompanyMapping_Aggregate_Order_By>;
  Tbl_UserLocationActivityMappings_aggregate?: InputMaybe<Tbl_UserLocationActivityMapping_Aggregate_Order_By>;
  Tbl_UserPermissions_aggregate?: InputMaybe<Tbl_UserPermissions_Aggregate_Order_By>;
  Tbl_UserRoleMappings_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Order_By>;
  Tbl_UserRoleMappings_userGuid_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Order_By>;
  Tbl_UserSessions_aggregate?: InputMaybe<Tbl_UserSessions_Aggregate_Order_By>;
  UserGuid?: InputMaybe<Order_By>;
  UserProfileImage?: InputMaybe<Order_By>;
  isEmailSubscribed?: InputMaybe<Order_By>;
  isResetPasswordDone?: InputMaybe<Order_By>;
  tblBusinesstypemastersByModifiedby_aggregate?: InputMaybe<Tbl_BusinessTypeMaster_Aggregate_Order_By>;
  tblCompaniesByModifiedby_aggregate?: InputMaybe<Tbl_Companies_Aggregate_Order_By>;
  tblCompanybusinesstypesByModifiedby_aggregate?: InputMaybe<Tbl_CompanyBusinessType_Aggregate_Order_By>;
  tblCompanygeneraldetailsByModifiedby_aggregate?: InputMaybe<Tbl_CompanyGeneralDetails_Aggregate_Order_By>;
  tblCountrymastersByModifiedby_aggregate?: InputMaybe<Tbl_CountryMaster_Aggregate_Order_By>;
  tblEmailheaderfootersByModifiedby_aggregate?: InputMaybe<Tbl_EmailHeaderFooter_Aggregate_Order_By>;
  tblEmailtemplatesByModifiedby_aggregate?: InputMaybe<Tbl_EmailTemplate_Aggregate_Order_By>;
  tblLanguageresourcesByModifiedby_aggregate?: InputMaybe<Tbl_LanguageResources_Aggregate_Order_By>;
  tblPermissionsByModifiedby_aggregate?: InputMaybe<Tbl_Permissions_Aggregate_Order_By>;
  tblRolesByModifiedby_aggregate?: InputMaybe<Tbl_Roles_Aggregate_Order_By>;
  tblUserrolemappingsByModifiedby_aggregate?: InputMaybe<Tbl_UserRoleMapping_Aggregate_Order_By>;
  userposition?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_Users */
export type Tbl_Users_Pk_Columns_Input = {
  UserGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_Users" */
export enum Tbl_Users_Select_Column {
  /** column name */
  CompanyName = "CompanyName",
  /** column name */
  CompanyWebsite = "CompanyWebsite",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CpanelUserId = "CpanelUserId",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ErpSupplierId = "ERPSupplierId",
  /** column name */
  EmailId = "EmailId",
  /** column name */
  FirstName = "FirstName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsDeleted = "IsDeleted",
  /** column name */
  IsLocked = "IsLocked",
  /** column name */
  IsNewsLetterSubscribed = "IsNewsLetterSubscribed",
  /** column name */
  IsVerified = "IsVerified",
  /** column name */
  LanguageGuid = "LanguageGuid",
  /** column name */
  LastLoginAttemptTime = "LastLoginAttemptTime",
  /** column name */
  LastName = "LastName",
  /** column name */
  LockTime = "LockTime",
  /** column name */
  MobileNumber = "MobileNumber",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  NumberOfFailedLoginAttempts = "NumberOfFailedLoginAttempts",
  /** column name */
  OpsUserId = "OPSUserId",
  /** column name */
  ParentCompany = "ParentCompany",
  /** column name */
  Password = "Password",
  /** column name */
  ReportsTo = "ReportsTo",
  /** column name */
  SetPasswordToken = "SetPasswordToken",
  /** column name */
  ShowGradeLevel = "ShowGradeLevel",
  /** column name */
  SystemId = "SystemId",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserProfileImage = "UserProfileImage",
  /** column name */
  IsEmailSubscribed = "isEmailSubscribed",
  /** column name */
  IsResetPasswordDone = "isResetPasswordDone",
  /** column name */
  Userposition = "userposition"
}

/** input type for updating data in table "Tbl_Users" */
export type Tbl_Users_Set_Input = {
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CompanyWebsite?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CpanelUserId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ERPSupplierId?: InputMaybe<Scalars["String"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  FirstName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocked?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsNewsLetterSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LastLoginAttemptTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  LastName?: InputMaybe<Scalars["String"]["input"]>;
  LockTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  MobileNumber?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfFailedLoginAttempts?: InputMaybe<Scalars["Int"]["input"]>;
  OPSUserId?: InputMaybe<Scalars["String"]["input"]>;
  ParentCompany?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  ReportsTo?: InputMaybe<Scalars["uuid"]["input"]>;
  SetPasswordToken?: InputMaybe<Scalars["String"]["input"]>;
  ShowGradeLevel?: InputMaybe<Scalars["Boolean"]["input"]>;
  SystemId?: InputMaybe<Scalars["bigint"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserProfileImage?: InputMaybe<Scalars["String"]["input"]>;
  isEmailSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  isResetPasswordDone?: InputMaybe<Scalars["Boolean"]["input"]>;
  userposition?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Tbl_Users_Stddev_Fields = {
  __typename?: "Tbl_Users_stddev_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate stddev_pop on columns */
export type Tbl_Users_Stddev_Pop_Fields = {
  __typename?: "Tbl_Users_stddev_pop_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate stddev_samp on columns */
export type Tbl_Users_Stddev_Samp_Fields = {
  __typename?: "Tbl_Users_stddev_samp_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** Streaming cursor of the table "Tbl_Users" */
export type Tbl_Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Users_Stream_Cursor_Value_Input = {
  CompanyName?: InputMaybe<Scalars["String"]["input"]>;
  CompanyWebsite?: InputMaybe<Scalars["String"]["input"]>;
  CountryGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  CpanelUserId?: InputMaybe<Scalars["String"]["input"]>;
  CreatedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  CreatedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  ERPSupplierId?: InputMaybe<Scalars["String"]["input"]>;
  EmailId?: InputMaybe<Scalars["String"]["input"]>;
  FirstName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsLocked?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsNewsLetterSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  IsVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
  LanguageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  LastLoginAttemptTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  LastName?: InputMaybe<Scalars["String"]["input"]>;
  LockTime?: InputMaybe<Scalars["timestamp"]["input"]>;
  MobileNumber?: InputMaybe<Scalars["String"]["input"]>;
  ModifiedBy?: InputMaybe<Scalars["uuid"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamp"]["input"]>;
  NumberOfFailedLoginAttempts?: InputMaybe<Scalars["Int"]["input"]>;
  OPSUserId?: InputMaybe<Scalars["String"]["input"]>;
  ParentCompany?: InputMaybe<Scalars["String"]["input"]>;
  Password?: InputMaybe<Scalars["String"]["input"]>;
  ReportsTo?: InputMaybe<Scalars["uuid"]["input"]>;
  SetPasswordToken?: InputMaybe<Scalars["String"]["input"]>;
  ShowGradeLevel?: InputMaybe<Scalars["Boolean"]["input"]>;
  SystemId?: InputMaybe<Scalars["bigint"]["input"]>;
  UserGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  UserProfileImage?: InputMaybe<Scalars["String"]["input"]>;
  isEmailSubscribed?: InputMaybe<Scalars["Boolean"]["input"]>;
  isResetPasswordDone?: InputMaybe<Scalars["Boolean"]["input"]>;
  userposition?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Tbl_Users_Sum_Fields = {
  __typename?: "Tbl_Users_sum_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Int"]["output"]>;
  SystemId?: Maybe<Scalars["bigint"]["output"]>;
};

/** update columns of table "Tbl_Users" */
export enum Tbl_Users_Update_Column {
  /** column name */
  CompanyName = "CompanyName",
  /** column name */
  CompanyWebsite = "CompanyWebsite",
  /** column name */
  CountryGuid = "CountryGuid",
  /** column name */
  CpanelUserId = "CpanelUserId",
  /** column name */
  CreatedBy = "CreatedBy",
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  ErpSupplierId = "ERPSupplierId",
  /** column name */
  EmailId = "EmailId",
  /** column name */
  FirstName = "FirstName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  IsDeleted = "IsDeleted",
  /** column name */
  IsLocked = "IsLocked",
  /** column name */
  IsNewsLetterSubscribed = "IsNewsLetterSubscribed",
  /** column name */
  IsVerified = "IsVerified",
  /** column name */
  LanguageGuid = "LanguageGuid",
  /** column name */
  LastLoginAttemptTime = "LastLoginAttemptTime",
  /** column name */
  LastName = "LastName",
  /** column name */
  LockTime = "LockTime",
  /** column name */
  MobileNumber = "MobileNumber",
  /** column name */
  ModifiedBy = "ModifiedBy",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  NumberOfFailedLoginAttempts = "NumberOfFailedLoginAttempts",
  /** column name */
  OpsUserId = "OPSUserId",
  /** column name */
  ParentCompany = "ParentCompany",
  /** column name */
  Password = "Password",
  /** column name */
  ReportsTo = "ReportsTo",
  /** column name */
  SetPasswordToken = "SetPasswordToken",
  /** column name */
  ShowGradeLevel = "ShowGradeLevel",
  /** column name */
  SystemId = "SystemId",
  /** column name */
  UserGuid = "UserGuid",
  /** column name */
  UserProfileImage = "UserProfileImage",
  /** column name */
  IsEmailSubscribed = "isEmailSubscribed",
  /** column name */
  IsResetPasswordDone = "isResetPasswordDone",
  /** column name */
  Userposition = "userposition"
}

export type Tbl_Users_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tbl_Users_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Users_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tbl_Users_Var_Pop_Fields = {
  __typename?: "Tbl_Users_var_pop_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate var_samp on columns */
export type Tbl_Users_Var_Samp_Fields = {
  __typename?: "Tbl_Users_var_samp_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate variance on columns */
export type Tbl_Users_Variance_Fields = {
  __typename?: "Tbl_Users_variance_fields";
  NumberOfFailedLoginAttempts?: Maybe<Scalars["Float"]["output"]>;
  SystemId?: Maybe<Scalars["Float"]["output"]>;
};

/** columns and relationships of "Tbl_WarpForms" */
export type Tbl_WarpForms = {
  __typename?: "Tbl_WarpForms";
  CreatedDate: Scalars["timestamptz"]["output"];
  FormId?: Maybe<Scalars["uuid"]["output"]>;
  FormName?: Maybe<Scalars["String"]["output"]>;
  IsActive?: Maybe<Scalars["Boolean"]["output"]>;
  ModifiedDate: Scalars["timestamptz"]["output"];
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  /** An object relationship */
  Tbl_Page?: Maybe<Tbl_Pages>;
  WarpFormsGuid: Scalars["uuid"]["output"];
  formtype?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["uuid"]["output"];
};

/** aggregated selection of "Tbl_WarpForms" */
export type Tbl_WarpForms_Aggregate = {
  __typename?: "Tbl_WarpForms_aggregate";
  aggregate?: Maybe<Tbl_WarpForms_Aggregate_Fields>;
  nodes: Array<Tbl_WarpForms>;
};

export type Tbl_WarpForms_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Tbl_WarpForms_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Tbl_WarpForms_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Tbl_WarpForms_Aggregate_Bool_Exp_Count>;
};

export type Tbl_WarpForms_Aggregate_Bool_Exp_Bool_And = {
  arguments: Tbl_WarpForms_Select_Column_Tbl_WarpForms_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_WarpForms_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Tbl_WarpForms_Select_Column_Tbl_WarpForms_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Tbl_WarpForms_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Tbl_WarpForms" */
export type Tbl_WarpForms_Aggregate_Fields = {
  __typename?: "Tbl_WarpForms_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_WarpForms_Max_Fields>;
  min?: Maybe<Tbl_WarpForms_Min_Fields>;
};

/** aggregate fields of "Tbl_WarpForms" */
export type Tbl_WarpForms_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** order by aggregate values of table "Tbl_WarpForms" */
export type Tbl_WarpForms_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tbl_WarpForms_Max_Order_By>;
  min?: InputMaybe<Tbl_WarpForms_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Tbl_WarpForms" */
export type Tbl_WarpForms_Arr_Rel_Insert_Input = {
  data: Array<Tbl_WarpForms_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tbl_WarpForms_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Tbl_WarpForms". All fields are combined with a logical 'AND'. */
export type Tbl_WarpForms_Bool_Exp = {
  CreatedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  FormId?: InputMaybe<Uuid_Comparison_Exp>;
  FormName?: InputMaybe<String_Comparison_Exp>;
  IsActive?: InputMaybe<Boolean_Comparison_Exp>;
  ModifiedDate?: InputMaybe<Timestamptz_Comparison_Exp>;
  PageGuid?: InputMaybe<Uuid_Comparison_Exp>;
  PageKey?: InputMaybe<String_Comparison_Exp>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Bool_Exp>;
  WarpFormsGuid?: InputMaybe<Uuid_Comparison_Exp>;
  _and?: InputMaybe<Array<Tbl_WarpForms_Bool_Exp>>;
  _not?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_WarpForms_Bool_Exp>>;
  formtype?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Tbl_WarpForms" */
export enum Tbl_WarpForms_Constraint {
  /** unique or primary key constraint on columns "WarpFormsGuid" */
  TblWarpFormsPkey = "Tbl_WarpForms_pkey"
}

/** input type for inserting data into table "Tbl_WarpForms" */
export type Tbl_WarpForms_Insert_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  FormId?: InputMaybe<Scalars["uuid"]["input"]>;
  FormName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Obj_Rel_Insert_Input>;
  WarpFormsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  formtype?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_WarpForms_Max_Fields = {
  __typename?: "Tbl_WarpForms_max_fields";
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  FormId?: Maybe<Scalars["uuid"]["output"]>;
  FormName?: Maybe<Scalars["String"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  WarpFormsGuid?: Maybe<Scalars["uuid"]["output"]>;
  formtype?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by max() on columns of table "Tbl_WarpForms" */
export type Tbl_WarpForms_Max_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  FormId?: InputMaybe<Order_By>;
  FormName?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  WarpFormsGuid?: InputMaybe<Order_By>;
  formtype?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tbl_WarpForms_Min_Fields = {
  __typename?: "Tbl_WarpForms_min_fields";
  CreatedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  FormId?: Maybe<Scalars["uuid"]["output"]>;
  FormName?: Maybe<Scalars["String"]["output"]>;
  ModifiedDate?: Maybe<Scalars["timestamptz"]["output"]>;
  PageGuid?: Maybe<Scalars["uuid"]["output"]>;
  PageKey?: Maybe<Scalars["String"]["output"]>;
  WarpFormsGuid?: Maybe<Scalars["uuid"]["output"]>;
  formtype?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
};

/** order by min() on columns of table "Tbl_WarpForms" */
export type Tbl_WarpForms_Min_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  FormId?: InputMaybe<Order_By>;
  FormName?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  WarpFormsGuid?: InputMaybe<Order_By>;
  formtype?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Tbl_WarpForms" */
export type Tbl_WarpForms_Mutation_Response = {
  __typename?: "Tbl_WarpForms_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_WarpForms>;
};

/** on_conflict condition type for table "Tbl_WarpForms" */
export type Tbl_WarpForms_On_Conflict = {
  constraint: Tbl_WarpForms_Constraint;
  update_columns?: Array<Tbl_WarpForms_Update_Column>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

/** Ordering options when selecting data from "Tbl_WarpForms". */
export type Tbl_WarpForms_Order_By = {
  CreatedDate?: InputMaybe<Order_By>;
  FormId?: InputMaybe<Order_By>;
  FormName?: InputMaybe<Order_By>;
  IsActive?: InputMaybe<Order_By>;
  ModifiedDate?: InputMaybe<Order_By>;
  PageGuid?: InputMaybe<Order_By>;
  PageKey?: InputMaybe<Order_By>;
  Tbl_Page?: InputMaybe<Tbl_Pages_Order_By>;
  WarpFormsGuid?: InputMaybe<Order_By>;
  formtype?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Tbl_WarpForms */
export type Tbl_WarpForms_Pk_Columns_Input = {
  WarpFormsGuid: Scalars["uuid"]["input"];
};

/** select columns of table "Tbl_WarpForms" */
export enum Tbl_WarpForms_Select_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  FormId = "FormId",
  /** column name */
  FormName = "FormName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  WarpFormsGuid = "WarpFormsGuid",
  /** column name */
  Formtype = "formtype",
  /** column name */
  Id = "id"
}

/** select "Tbl_WarpForms_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Tbl_WarpForms" */
export enum Tbl_WarpForms_Select_Column_Tbl_WarpForms_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** select "Tbl_WarpForms_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Tbl_WarpForms" */
export enum Tbl_WarpForms_Select_Column_Tbl_WarpForms_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = "IsActive"
}

/** input type for updating data in table "Tbl_WarpForms" */
export type Tbl_WarpForms_Set_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  FormId?: InputMaybe<Scalars["uuid"]["input"]>;
  FormName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  WarpFormsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  formtype?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** Streaming cursor of the table "Tbl_WarpForms" */
export type Tbl_WarpForms_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_WarpForms_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_WarpForms_Stream_Cursor_Value_Input = {
  CreatedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  FormId?: InputMaybe<Scalars["uuid"]["input"]>;
  FormName?: InputMaybe<Scalars["String"]["input"]>;
  IsActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  ModifiedDate?: InputMaybe<Scalars["timestamptz"]["input"]>;
  PageGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  PageKey?: InputMaybe<Scalars["String"]["input"]>;
  WarpFormsGuid?: InputMaybe<Scalars["uuid"]["input"]>;
  formtype?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Tbl_WarpForms" */
export enum Tbl_WarpForms_Update_Column {
  /** column name */
  CreatedDate = "CreatedDate",
  /** column name */
  FormId = "FormId",
  /** column name */
  FormName = "FormName",
  /** column name */
  IsActive = "IsActive",
  /** column name */
  ModifiedDate = "ModifiedDate",
  /** column name */
  PageGuid = "PageGuid",
  /** column name */
  PageKey = "PageKey",
  /** column name */
  WarpFormsGuid = "WarpFormsGuid",
  /** column name */
  Formtype = "formtype",
  /** column name */
  Id = "id"
}

export type Tbl_WarpForms_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_WarpForms_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_WarpForms_Bool_Exp;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["bigint"]["input"]>;
  _gt?: InputMaybe<Scalars["bigint"]["input"]>;
  _gte?: InputMaybe<Scalars["bigint"]["input"]>;
  _in?: InputMaybe<Array<Scalars["bigint"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["bigint"]["input"]>;
  _lte?: InputMaybe<Scalars["bigint"]["input"]>;
  _neq?: InputMaybe<Scalars["bigint"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["bigint"]["input"]>>;
};

/** Boolean expression to compare columns of type "bpchar". All fields are combined with logical 'AND'. */
export type Bpchar_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["bpchar"]["input"]>;
  _gt?: InputMaybe<Scalars["bpchar"]["input"]>;
  _gte?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["bpchar"]["input"]>;
  _in?: InputMaybe<Array<Scalars["bpchar"]["input"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["bpchar"]["input"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["bpchar"]["input"]>;
  _lt?: InputMaybe<Scalars["bpchar"]["input"]>;
  _lte?: InputMaybe<Scalars["bpchar"]["input"]>;
  _neq?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["bpchar"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["bpchar"]["input"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["bpchar"]["input"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["bpchar"]["input"]>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = "ASC",
  /** descending ordering of the cursor */
  Desc = "DESC"
}

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars["jsonb"]["input"]>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars["jsonb"]["input"]>;
  _eq?: InputMaybe<Scalars["jsonb"]["input"]>;
  _gt?: InputMaybe<Scalars["jsonb"]["input"]>;
  _gte?: InputMaybe<Scalars["jsonb"]["input"]>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars["String"]["input"]>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _in?: InputMaybe<Array<Scalars["jsonb"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["jsonb"]["input"]>;
  _lte?: InputMaybe<Scalars["jsonb"]["input"]>;
  _neq?: InputMaybe<Scalars["jsonb"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["jsonb"]["input"]>>;
};

/** columns and relationships of "master_policy_document" */
export type Master_Policy_Document = {
  __typename?: "master_policy_document";
  best_practices: Scalars["String"]["output"];
  company_size?: Maybe<Scalars["String"]["output"]>;
  document_key: Scalars["String"]["output"];
  document_name: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  is_default?: Maybe<Scalars["Boolean"]["output"]>;
};

/** aggregated selection of "master_policy_document" */
export type Master_Policy_Document_Aggregate = {
  __typename?: "master_policy_document_aggregate";
  aggregate?: Maybe<Master_Policy_Document_Aggregate_Fields>;
  nodes: Array<Master_Policy_Document>;
};

/** aggregate fields of "master_policy_document" */
export type Master_Policy_Document_Aggregate_Fields = {
  __typename?: "master_policy_document_aggregate_fields";
  avg?: Maybe<Master_Policy_Document_Avg_Fields>;
  count: Scalars["Int"]["output"];
  max?: Maybe<Master_Policy_Document_Max_Fields>;
  min?: Maybe<Master_Policy_Document_Min_Fields>;
  stddev?: Maybe<Master_Policy_Document_Stddev_Fields>;
  stddev_pop?: Maybe<Master_Policy_Document_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Master_Policy_Document_Stddev_Samp_Fields>;
  sum?: Maybe<Master_Policy_Document_Sum_Fields>;
  var_pop?: Maybe<Master_Policy_Document_Var_Pop_Fields>;
  var_samp?: Maybe<Master_Policy_Document_Var_Samp_Fields>;
  variance?: Maybe<Master_Policy_Document_Variance_Fields>;
};

/** aggregate fields of "master_policy_document" */
export type Master_Policy_Document_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Master_Policy_Document_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate avg on columns */
export type Master_Policy_Document_Avg_Fields = {
  __typename?: "master_policy_document_avg_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** Boolean expression to filter rows from the table "master_policy_document". All fields are combined with a logical 'AND'. */
export type Master_Policy_Document_Bool_Exp = {
  _and?: InputMaybe<Array<Master_Policy_Document_Bool_Exp>>;
  _not?: InputMaybe<Master_Policy_Document_Bool_Exp>;
  _or?: InputMaybe<Array<Master_Policy_Document_Bool_Exp>>;
  best_practices?: InputMaybe<String_Comparison_Exp>;
  company_size?: InputMaybe<String_Comparison_Exp>;
  document_key?: InputMaybe<String_Comparison_Exp>;
  document_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_default?: InputMaybe<Boolean_Comparison_Exp>;
};

/** unique or primary key constraints on table "master_policy_document" */
export enum Master_Policy_Document_Constraint {
  /** unique or primary key constraint on columns "id" */
  MasterPolicyDocumentPkey = "master_policy_document_pkey"
}

/** input type for incrementing numeric columns in table "master_policy_document" */
export type Master_Policy_Document_Inc_Input = {
  id?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "master_policy_document" */
export type Master_Policy_Document_Insert_Input = {
  best_practices?: InputMaybe<Scalars["String"]["input"]>;
  company_size?: InputMaybe<Scalars["String"]["input"]>;
  document_key?: InputMaybe<Scalars["String"]["input"]>;
  document_name?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["Int"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate max on columns */
export type Master_Policy_Document_Max_Fields = {
  __typename?: "master_policy_document_max_fields";
  best_practices?: Maybe<Scalars["String"]["output"]>;
  company_size?: Maybe<Scalars["String"]["output"]>;
  document_key?: Maybe<Scalars["String"]["output"]>;
  document_name?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["Int"]["output"]>;
};

/** aggregate min on columns */
export type Master_Policy_Document_Min_Fields = {
  __typename?: "master_policy_document_min_fields";
  best_practices?: Maybe<Scalars["String"]["output"]>;
  company_size?: Maybe<Scalars["String"]["output"]>;
  document_key?: Maybe<Scalars["String"]["output"]>;
  document_name?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["Int"]["output"]>;
};

/** response of any mutation on the table "master_policy_document" */
export type Master_Policy_Document_Mutation_Response = {
  __typename?: "master_policy_document_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Master_Policy_Document>;
};

/** on_conflict condition type for table "master_policy_document" */
export type Master_Policy_Document_On_Conflict = {
  constraint: Master_Policy_Document_Constraint;
  update_columns?: Array<Master_Policy_Document_Update_Column>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

/** Ordering options when selecting data from "master_policy_document". */
export type Master_Policy_Document_Order_By = {
  best_practices?: InputMaybe<Order_By>;
  company_size?: InputMaybe<Order_By>;
  document_key?: InputMaybe<Order_By>;
  document_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_default?: InputMaybe<Order_By>;
};

/** primary key columns input for table: master_policy_document */
export type Master_Policy_Document_Pk_Columns_Input = {
  id: Scalars["Int"]["input"];
};

/** select columns of table "master_policy_document" */
export enum Master_Policy_Document_Select_Column {
  /** column name */
  BestPractices = "best_practices",
  /** column name */
  CompanySize = "company_size",
  /** column name */
  DocumentKey = "document_key",
  /** column name */
  DocumentName = "document_name",
  /** column name */
  Id = "id",
  /** column name */
  IsDefault = "is_default"
}

/** input type for updating data in table "master_policy_document" */
export type Master_Policy_Document_Set_Input = {
  best_practices?: InputMaybe<Scalars["String"]["input"]>;
  company_size?: InputMaybe<Scalars["String"]["input"]>;
  document_key?: InputMaybe<Scalars["String"]["input"]>;
  document_name?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["Int"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate stddev on columns */
export type Master_Policy_Document_Stddev_Fields = {
  __typename?: "master_policy_document_stddev_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate stddev_pop on columns */
export type Master_Policy_Document_Stddev_Pop_Fields = {
  __typename?: "master_policy_document_stddev_pop_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate stddev_samp on columns */
export type Master_Policy_Document_Stddev_Samp_Fields = {
  __typename?: "master_policy_document_stddev_samp_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** Streaming cursor of the table "master_policy_document" */
export type Master_Policy_Document_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Master_Policy_Document_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Master_Policy_Document_Stream_Cursor_Value_Input = {
  best_practices?: InputMaybe<Scalars["String"]["input"]>;
  company_size?: InputMaybe<Scalars["String"]["input"]>;
  document_key?: InputMaybe<Scalars["String"]["input"]>;
  document_name?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["Int"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** aggregate sum on columns */
export type Master_Policy_Document_Sum_Fields = {
  __typename?: "master_policy_document_sum_fields";
  id?: Maybe<Scalars["Int"]["output"]>;
};

/** update columns of table "master_policy_document" */
export enum Master_Policy_Document_Update_Column {
  /** column name */
  BestPractices = "best_practices",
  /** column name */
  CompanySize = "company_size",
  /** column name */
  DocumentKey = "document_key",
  /** column name */
  DocumentName = "document_name",
  /** column name */
  Id = "id",
  /** column name */
  IsDefault = "is_default"
}

export type Master_Policy_Document_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Master_Policy_Document_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Master_Policy_Document_Set_Input>;
  /** filter the rows which have to be updated */
  where: Master_Policy_Document_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Master_Policy_Document_Var_Pop_Fields = {
  __typename?: "master_policy_document_var_pop_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate var_samp on columns */
export type Master_Policy_Document_Var_Samp_Fields = {
  __typename?: "master_policy_document_var_samp_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** aggregate variance on columns */
export type Master_Policy_Document_Variance_Fields = {
  __typename?: "master_policy_document_variance_fields";
  id?: Maybe<Scalars["Float"]["output"]>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: "mutation_root";
  /** delete data from the table: "Tbl_Addresses" */
  delete_Tbl_Addresses?: Maybe<Tbl_Addresses_Mutation_Response>;
  /** delete single row from the table: "Tbl_Addresses" */
  delete_Tbl_Addresses_by_pk?: Maybe<Tbl_Addresses>;
  /** delete data from the table: "Tbl_AssessmentMapping" */
  delete_Tbl_AssessmentMapping?: Maybe<Tbl_AssessmentMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_AssessmentMapping" */
  delete_Tbl_AssessmentMapping_by_pk?: Maybe<Tbl_AssessmentMapping>;
  /** delete data from the table: "Tbl_BusinessTypeMaster" */
  delete_Tbl_BusinessTypeMaster?: Maybe<Tbl_BusinessTypeMaster_Mutation_Response>;
  /** delete single row from the table: "Tbl_BusinessTypeMaster" */
  delete_Tbl_BusinessTypeMaster_by_pk?: Maybe<Tbl_BusinessTypeMaster>;
  /** delete data from the table: "Tbl_Companies" */
  delete_Tbl_Companies?: Maybe<Tbl_Companies_Mutation_Response>;
  /** delete single row from the table: "Tbl_Companies" */
  delete_Tbl_Companies_by_pk?: Maybe<Tbl_Companies>;
  /** delete data from the table: "Tbl_CompanyBusinessType" */
  delete_Tbl_CompanyBusinessType?: Maybe<Tbl_CompanyBusinessType_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyBusinessType" */
  delete_Tbl_CompanyBusinessType_by_pk?: Maybe<Tbl_CompanyBusinessType>;
  /** delete data from the table: "Tbl_CompanyCountry" */
  delete_Tbl_CompanyCountry?: Maybe<Tbl_CompanyCountry_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyCountry" */
  delete_Tbl_CompanyCountry_by_pk?: Maybe<Tbl_CompanyCountry>;
  /** delete data from the table: "Tbl_CompanyDashboardMapping" */
  delete_Tbl_CompanyDashboardMapping?: Maybe<Tbl_CompanyDashboardMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyDashboardMapping" */
  delete_Tbl_CompanyDashboardMapping_by_pk?: Maybe<Tbl_CompanyDashboardMapping>;
  /** delete data from the table: "Tbl_CompanyGeneralDetails" */
  delete_Tbl_CompanyGeneralDetails?: Maybe<Tbl_CompanyGeneralDetails_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyGeneralDetails" */
  delete_Tbl_CompanyGeneralDetails_by_pk?: Maybe<Tbl_CompanyGeneralDetails>;
  /** delete data from the table: "Tbl_CompanyRoleMapping" */
  delete_Tbl_CompanyRoleMapping?: Maybe<Tbl_CompanyRoleMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyRoleMapping" */
  delete_Tbl_CompanyRoleMapping_by_pk?: Maybe<Tbl_CompanyRoleMapping>;
  /** delete data from the table: "Tbl_CompanyStatusLog" */
  delete_Tbl_CompanyStatusLog?: Maybe<Tbl_CompanyStatusLog_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyStatusLog" */
  delete_Tbl_CompanyStatusLog_by_pk?: Maybe<Tbl_CompanyStatusLog>;
  /** delete data from the table: "Tbl_CompanyStatusMaster" */
  delete_Tbl_CompanyStatusMaster?: Maybe<Tbl_CompanyStatusMaster_Mutation_Response>;
  /** delete single row from the table: "Tbl_CompanyStatusMaster" */
  delete_Tbl_CompanyStatusMaster_by_pk?: Maybe<Tbl_CompanyStatusMaster>;
  /** delete data from the table: "Tbl_CountryMaster" */
  delete_Tbl_CountryMaster?: Maybe<Tbl_CountryMaster_Mutation_Response>;
  /** delete single row from the table: "Tbl_CountryMaster" */
  delete_Tbl_CountryMaster_by_pk?: Maybe<Tbl_CountryMaster>;
  /** delete data from the table: "Tbl_EmailHeaderFooter" */
  delete_Tbl_EmailHeaderFooter?: Maybe<Tbl_EmailHeaderFooter_Mutation_Response>;
  /** delete single row from the table: "Tbl_EmailHeaderFooter" */
  delete_Tbl_EmailHeaderFooter_by_pk?: Maybe<Tbl_EmailHeaderFooter>;
  /** delete data from the table: "Tbl_EmailTemplate" */
  delete_Tbl_EmailTemplate?: Maybe<Tbl_EmailTemplate_Mutation_Response>;
  /** delete data from the table: "Tbl_EmailTemplateNotificationDetails" */
  delete_Tbl_EmailTemplateNotificationDetails?: Maybe<Tbl_EmailTemplateNotificationDetails_Mutation_Response>;
  /** delete single row from the table: "Tbl_EmailTemplateNotificationDetails" */
  delete_Tbl_EmailTemplateNotificationDetails_by_pk?: Maybe<Tbl_EmailTemplateNotificationDetails>;
  /** delete single row from the table: "Tbl_EmailTemplate" */
  delete_Tbl_EmailTemplate_by_pk?: Maybe<Tbl_EmailTemplate>;
  /** delete data from the table: "Tbl_GlobalSettings" */
  delete_Tbl_GlobalSettings?: Maybe<Tbl_GlobalSettings_Mutation_Response>;
  /** delete single row from the table: "Tbl_GlobalSettings" */
  delete_Tbl_GlobalSettings_by_pk?: Maybe<Tbl_GlobalSettings>;
  /** delete data from the table: "Tbl_LanguageResources" */
  delete_Tbl_LanguageResources?: Maybe<Tbl_LanguageResources_Mutation_Response>;
  /** delete single row from the table: "Tbl_LanguageResources" */
  delete_Tbl_LanguageResources_by_pk?: Maybe<Tbl_LanguageResources>;
  /** delete data from the table: "Tbl_OPsCompanyDBDetails" */
  delete_Tbl_OPsCompanyDBDetails?: Maybe<Tbl_OPsCompanyDbDetails_Mutation_Response>;
  /** delete single row from the table: "Tbl_OPsCompanyDBDetails" */
  delete_Tbl_OPsCompanyDBDetails_by_pk?: Maybe<Tbl_OPsCompanyDbDetails>;
  /** delete data from the table: "Tbl_Pages" */
  delete_Tbl_Pages?: Maybe<Tbl_Pages_Mutation_Response>;
  /** delete single row from the table: "Tbl_Pages" */
  delete_Tbl_Pages_by_pk?: Maybe<Tbl_Pages>;
  /** delete data from the table: "Tbl_PasswordManageMaster" */
  delete_Tbl_PasswordManageMaster?: Maybe<Tbl_PasswordManageMaster_Mutation_Response>;
  /** delete single row from the table: "Tbl_PasswordManageMaster" */
  delete_Tbl_PasswordManageMaster_by_pk?: Maybe<Tbl_PasswordManageMaster>;
  /** delete data from the table: "Tbl_Permissions" */
  delete_Tbl_Permissions?: Maybe<Tbl_Permissions_Mutation_Response>;
  /** delete single row from the table: "Tbl_Permissions" */
  delete_Tbl_Permissions_by_pk?: Maybe<Tbl_Permissions>;
  /** delete data from the table: "Tbl_PowerBIReportDetails" */
  delete_Tbl_PowerBIReportDetails?: Maybe<Tbl_PowerBiReportDetails_Mutation_Response>;
  /** delete single row from the table: "Tbl_PowerBIReportDetails" */
  delete_Tbl_PowerBIReportDetails_by_pk?: Maybe<Tbl_PowerBiReportDetails>;
  /** delete data from the table: "Tbl_Roles" */
  delete_Tbl_Roles?: Maybe<Tbl_Roles_Mutation_Response>;
  /** delete single row from the table: "Tbl_Roles" */
  delete_Tbl_Roles_by_pk?: Maybe<Tbl_Roles>;
  /** delete data from the table: "Tbl_UserCompanyMapping" */
  delete_Tbl_UserCompanyMapping?: Maybe<Tbl_UserCompanyMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserCompanyMapping" */
  delete_Tbl_UserCompanyMapping_by_pk?: Maybe<Tbl_UserCompanyMapping>;
  /** delete data from the table: "Tbl_UserLocationActivityMapping" */
  delete_Tbl_UserLocationActivityMapping?: Maybe<Tbl_UserLocationActivityMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserLocationActivityMapping" */
  delete_Tbl_UserLocationActivityMapping_by_pk?: Maybe<Tbl_UserLocationActivityMapping>;
  /** delete data from the table: "Tbl_UserLoginLogs" */
  delete_Tbl_UserLoginLogs?: Maybe<Tbl_UserLoginLogs_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserLoginLogs" */
  delete_Tbl_UserLoginLogs_by_pk?: Maybe<Tbl_UserLoginLogs>;
  /** delete data from the table: "Tbl_UserPermissions" */
  delete_Tbl_UserPermissions?: Maybe<Tbl_UserPermissions_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserPermissions" */
  delete_Tbl_UserPermissions_by_pk?: Maybe<Tbl_UserPermissions>;
  /** delete data from the table: "Tbl_UserRoleMapping" */
  delete_Tbl_UserRoleMapping?: Maybe<Tbl_UserRoleMapping_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserRoleMapping" */
  delete_Tbl_UserRoleMapping_by_pk?: Maybe<Tbl_UserRoleMapping>;
  /** delete data from the table: "Tbl_UserSessions" */
  delete_Tbl_UserSessions?: Maybe<Tbl_UserSessions_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserSessions" */
  delete_Tbl_UserSessions_by_pk?: Maybe<Tbl_UserSessions>;
  /** delete data from the table: "Tbl_UserStatusMaster" */
  delete_Tbl_UserStatusMaster?: Maybe<Tbl_UserStatusMaster_Mutation_Response>;
  /** delete single row from the table: "Tbl_UserStatusMaster" */
  delete_Tbl_UserStatusMaster_by_pk?: Maybe<Tbl_UserStatusMaster>;
  /** delete data from the table: "Tbl_Users" */
  delete_Tbl_Users?: Maybe<Tbl_Users_Mutation_Response>;
  /** delete single row from the table: "Tbl_Users" */
  delete_Tbl_Users_by_pk?: Maybe<Tbl_Users>;
  /** delete data from the table: "Tbl_WarpForms" */
  delete_Tbl_WarpForms?: Maybe<Tbl_WarpForms_Mutation_Response>;
  /** delete single row from the table: "Tbl_WarpForms" */
  delete_Tbl_WarpForms_by_pk?: Maybe<Tbl_WarpForms>;
  /** delete data from the table: "master_policy_document" */
  delete_master_policy_document?: Maybe<Master_Policy_Document_Mutation_Response>;
  /** delete single row from the table: "master_policy_document" */
  delete_master_policy_document_by_pk?: Maybe<Master_Policy_Document>;
  /** delete data from the table: "tbl_oauthclients" */
  delete_tbl_oauthclients?: Maybe<Tbl_Oauthclients_Mutation_Response>;
  /** delete single row from the table: "tbl_oauthclients" */
  delete_tbl_oauthclients_by_pk?: Maybe<Tbl_Oauthclients>;
  /** insert data into the table: "Tbl_Addresses" */
  insert_Tbl_Addresses?: Maybe<Tbl_Addresses_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Addresses" */
  insert_Tbl_Addresses_one?: Maybe<Tbl_Addresses>;
  /** insert data into the table: "Tbl_AssessmentMapping" */
  insert_Tbl_AssessmentMapping?: Maybe<Tbl_AssessmentMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_AssessmentMapping" */
  insert_Tbl_AssessmentMapping_one?: Maybe<Tbl_AssessmentMapping>;
  /** insert data into the table: "Tbl_BusinessTypeMaster" */
  insert_Tbl_BusinessTypeMaster?: Maybe<Tbl_BusinessTypeMaster_Mutation_Response>;
  /** insert a single row into the table: "Tbl_BusinessTypeMaster" */
  insert_Tbl_BusinessTypeMaster_one?: Maybe<Tbl_BusinessTypeMaster>;
  /** insert data into the table: "Tbl_Companies" */
  insert_Tbl_Companies?: Maybe<Tbl_Companies_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Companies" */
  insert_Tbl_Companies_one?: Maybe<Tbl_Companies>;
  /** insert data into the table: "Tbl_CompanyBusinessType" */
  insert_Tbl_CompanyBusinessType?: Maybe<Tbl_CompanyBusinessType_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyBusinessType" */
  insert_Tbl_CompanyBusinessType_one?: Maybe<Tbl_CompanyBusinessType>;
  /** insert data into the table: "Tbl_CompanyCountry" */
  insert_Tbl_CompanyCountry?: Maybe<Tbl_CompanyCountry_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyCountry" */
  insert_Tbl_CompanyCountry_one?: Maybe<Tbl_CompanyCountry>;
  /** insert data into the table: "Tbl_CompanyDashboardMapping" */
  insert_Tbl_CompanyDashboardMapping?: Maybe<Tbl_CompanyDashboardMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyDashboardMapping" */
  insert_Tbl_CompanyDashboardMapping_one?: Maybe<Tbl_CompanyDashboardMapping>;
  /** insert data into the table: "Tbl_CompanyGeneralDetails" */
  insert_Tbl_CompanyGeneralDetails?: Maybe<Tbl_CompanyGeneralDetails_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyGeneralDetails" */
  insert_Tbl_CompanyGeneralDetails_one?: Maybe<Tbl_CompanyGeneralDetails>;
  /** insert data into the table: "Tbl_CompanyRoleMapping" */
  insert_Tbl_CompanyRoleMapping?: Maybe<Tbl_CompanyRoleMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyRoleMapping" */
  insert_Tbl_CompanyRoleMapping_one?: Maybe<Tbl_CompanyRoleMapping>;
  /** insert data into the table: "Tbl_CompanyStatusLog" */
  insert_Tbl_CompanyStatusLog?: Maybe<Tbl_CompanyStatusLog_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyStatusLog" */
  insert_Tbl_CompanyStatusLog_one?: Maybe<Tbl_CompanyStatusLog>;
  /** insert data into the table: "Tbl_CompanyStatusMaster" */
  insert_Tbl_CompanyStatusMaster?: Maybe<Tbl_CompanyStatusMaster_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CompanyStatusMaster" */
  insert_Tbl_CompanyStatusMaster_one?: Maybe<Tbl_CompanyStatusMaster>;
  /** insert data into the table: "Tbl_CountryMaster" */
  insert_Tbl_CountryMaster?: Maybe<Tbl_CountryMaster_Mutation_Response>;
  /** insert a single row into the table: "Tbl_CountryMaster" */
  insert_Tbl_CountryMaster_one?: Maybe<Tbl_CountryMaster>;
  /** insert data into the table: "Tbl_EmailHeaderFooter" */
  insert_Tbl_EmailHeaderFooter?: Maybe<Tbl_EmailHeaderFooter_Mutation_Response>;
  /** insert a single row into the table: "Tbl_EmailHeaderFooter" */
  insert_Tbl_EmailHeaderFooter_one?: Maybe<Tbl_EmailHeaderFooter>;
  /** insert data into the table: "Tbl_EmailTemplate" */
  insert_Tbl_EmailTemplate?: Maybe<Tbl_EmailTemplate_Mutation_Response>;
  /** insert data into the table: "Tbl_EmailTemplateNotificationDetails" */
  insert_Tbl_EmailTemplateNotificationDetails?: Maybe<Tbl_EmailTemplateNotificationDetails_Mutation_Response>;
  /** insert a single row into the table: "Tbl_EmailTemplateNotificationDetails" */
  insert_Tbl_EmailTemplateNotificationDetails_one?: Maybe<Tbl_EmailTemplateNotificationDetails>;
  /** insert a single row into the table: "Tbl_EmailTemplate" */
  insert_Tbl_EmailTemplate_one?: Maybe<Tbl_EmailTemplate>;
  /** insert data into the table: "Tbl_GlobalSettings" */
  insert_Tbl_GlobalSettings?: Maybe<Tbl_GlobalSettings_Mutation_Response>;
  /** insert a single row into the table: "Tbl_GlobalSettings" */
  insert_Tbl_GlobalSettings_one?: Maybe<Tbl_GlobalSettings>;
  /** insert data into the table: "Tbl_LanguageResources" */
  insert_Tbl_LanguageResources?: Maybe<Tbl_LanguageResources_Mutation_Response>;
  /** insert a single row into the table: "Tbl_LanguageResources" */
  insert_Tbl_LanguageResources_one?: Maybe<Tbl_LanguageResources>;
  /** insert data into the table: "Tbl_OPsCompanyDBDetails" */
  insert_Tbl_OPsCompanyDBDetails?: Maybe<Tbl_OPsCompanyDbDetails_Mutation_Response>;
  /** insert a single row into the table: "Tbl_OPsCompanyDBDetails" */
  insert_Tbl_OPsCompanyDBDetails_one?: Maybe<Tbl_OPsCompanyDbDetails>;
  /** insert data into the table: "Tbl_Pages" */
  insert_Tbl_Pages?: Maybe<Tbl_Pages_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Pages" */
  insert_Tbl_Pages_one?: Maybe<Tbl_Pages>;
  /** insert data into the table: "Tbl_PasswordManageMaster" */
  insert_Tbl_PasswordManageMaster?: Maybe<Tbl_PasswordManageMaster_Mutation_Response>;
  /** insert a single row into the table: "Tbl_PasswordManageMaster" */
  insert_Tbl_PasswordManageMaster_one?: Maybe<Tbl_PasswordManageMaster>;
  /** insert data into the table: "Tbl_Permissions" */
  insert_Tbl_Permissions?: Maybe<Tbl_Permissions_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Permissions" */
  insert_Tbl_Permissions_one?: Maybe<Tbl_Permissions>;
  /** insert data into the table: "Tbl_PowerBIReportDetails" */
  insert_Tbl_PowerBIReportDetails?: Maybe<Tbl_PowerBiReportDetails_Mutation_Response>;
  /** insert a single row into the table: "Tbl_PowerBIReportDetails" */
  insert_Tbl_PowerBIReportDetails_one?: Maybe<Tbl_PowerBiReportDetails>;
  /** insert data into the table: "Tbl_Roles" */
  insert_Tbl_Roles?: Maybe<Tbl_Roles_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Roles" */
  insert_Tbl_Roles_one?: Maybe<Tbl_Roles>;
  /** insert data into the table: "Tbl_UserCompanyMapping" */
  insert_Tbl_UserCompanyMapping?: Maybe<Tbl_UserCompanyMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserCompanyMapping" */
  insert_Tbl_UserCompanyMapping_one?: Maybe<Tbl_UserCompanyMapping>;
  /** insert data into the table: "Tbl_UserLocationActivityMapping" */
  insert_Tbl_UserLocationActivityMapping?: Maybe<Tbl_UserLocationActivityMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserLocationActivityMapping" */
  insert_Tbl_UserLocationActivityMapping_one?: Maybe<Tbl_UserLocationActivityMapping>;
  /** insert data into the table: "Tbl_UserLoginLogs" */
  insert_Tbl_UserLoginLogs?: Maybe<Tbl_UserLoginLogs_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserLoginLogs" */
  insert_Tbl_UserLoginLogs_one?: Maybe<Tbl_UserLoginLogs>;
  /** insert data into the table: "Tbl_UserPermissions" */
  insert_Tbl_UserPermissions?: Maybe<Tbl_UserPermissions_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserPermissions" */
  insert_Tbl_UserPermissions_one?: Maybe<Tbl_UserPermissions>;
  /** insert data into the table: "Tbl_UserRoleMapping" */
  insert_Tbl_UserRoleMapping?: Maybe<Tbl_UserRoleMapping_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserRoleMapping" */
  insert_Tbl_UserRoleMapping_one?: Maybe<Tbl_UserRoleMapping>;
  /** insert data into the table: "Tbl_UserSessions" */
  insert_Tbl_UserSessions?: Maybe<Tbl_UserSessions_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserSessions" */
  insert_Tbl_UserSessions_one?: Maybe<Tbl_UserSessions>;
  /** insert data into the table: "Tbl_UserStatusMaster" */
  insert_Tbl_UserStatusMaster?: Maybe<Tbl_UserStatusMaster_Mutation_Response>;
  /** insert a single row into the table: "Tbl_UserStatusMaster" */
  insert_Tbl_UserStatusMaster_one?: Maybe<Tbl_UserStatusMaster>;
  /** insert data into the table: "Tbl_Users" */
  insert_Tbl_Users?: Maybe<Tbl_Users_Mutation_Response>;
  /** insert a single row into the table: "Tbl_Users" */
  insert_Tbl_Users_one?: Maybe<Tbl_Users>;
  /** insert data into the table: "Tbl_WarpForms" */
  insert_Tbl_WarpForms?: Maybe<Tbl_WarpForms_Mutation_Response>;
  /** insert a single row into the table: "Tbl_WarpForms" */
  insert_Tbl_WarpForms_one?: Maybe<Tbl_WarpForms>;
  /** insert data into the table: "master_policy_document" */
  insert_master_policy_document?: Maybe<Master_Policy_Document_Mutation_Response>;
  /** insert a single row into the table: "master_policy_document" */
  insert_master_policy_document_one?: Maybe<Master_Policy_Document>;
  /** insert data into the table: "tbl_oauthclients" */
  insert_tbl_oauthclients?: Maybe<Tbl_Oauthclients_Mutation_Response>;
  /** insert a single row into the table: "tbl_oauthclients" */
  insert_tbl_oauthclients_one?: Maybe<Tbl_Oauthclients>;
  /** update data of the table: "Tbl_Addresses" */
  update_Tbl_Addresses?: Maybe<Tbl_Addresses_Mutation_Response>;
  /** update single row of the table: "Tbl_Addresses" */
  update_Tbl_Addresses_by_pk?: Maybe<Tbl_Addresses>;
  /** update multiples rows of table: "Tbl_Addresses" */
  update_Tbl_Addresses_many?: Maybe<
    Array<Maybe<Tbl_Addresses_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_AssessmentMapping" */
  update_Tbl_AssessmentMapping?: Maybe<Tbl_AssessmentMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_AssessmentMapping" */
  update_Tbl_AssessmentMapping_by_pk?: Maybe<Tbl_AssessmentMapping>;
  /** update multiples rows of table: "Tbl_AssessmentMapping" */
  update_Tbl_AssessmentMapping_many?: Maybe<
    Array<Maybe<Tbl_AssessmentMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_BusinessTypeMaster" */
  update_Tbl_BusinessTypeMaster?: Maybe<Tbl_BusinessTypeMaster_Mutation_Response>;
  /** update single row of the table: "Tbl_BusinessTypeMaster" */
  update_Tbl_BusinessTypeMaster_by_pk?: Maybe<Tbl_BusinessTypeMaster>;
  /** update multiples rows of table: "Tbl_BusinessTypeMaster" */
  update_Tbl_BusinessTypeMaster_many?: Maybe<
    Array<Maybe<Tbl_BusinessTypeMaster_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_Companies" */
  update_Tbl_Companies?: Maybe<Tbl_Companies_Mutation_Response>;
  /** update single row of the table: "Tbl_Companies" */
  update_Tbl_Companies_by_pk?: Maybe<Tbl_Companies>;
  /** update multiples rows of table: "Tbl_Companies" */
  update_Tbl_Companies_many?: Maybe<
    Array<Maybe<Tbl_Companies_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyBusinessType" */
  update_Tbl_CompanyBusinessType?: Maybe<Tbl_CompanyBusinessType_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyBusinessType" */
  update_Tbl_CompanyBusinessType_by_pk?: Maybe<Tbl_CompanyBusinessType>;
  /** update multiples rows of table: "Tbl_CompanyBusinessType" */
  update_Tbl_CompanyBusinessType_many?: Maybe<
    Array<Maybe<Tbl_CompanyBusinessType_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyCountry" */
  update_Tbl_CompanyCountry?: Maybe<Tbl_CompanyCountry_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyCountry" */
  update_Tbl_CompanyCountry_by_pk?: Maybe<Tbl_CompanyCountry>;
  /** update multiples rows of table: "Tbl_CompanyCountry" */
  update_Tbl_CompanyCountry_many?: Maybe<
    Array<Maybe<Tbl_CompanyCountry_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyDashboardMapping" */
  update_Tbl_CompanyDashboardMapping?: Maybe<Tbl_CompanyDashboardMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyDashboardMapping" */
  update_Tbl_CompanyDashboardMapping_by_pk?: Maybe<Tbl_CompanyDashboardMapping>;
  /** update multiples rows of table: "Tbl_CompanyDashboardMapping" */
  update_Tbl_CompanyDashboardMapping_many?: Maybe<
    Array<Maybe<Tbl_CompanyDashboardMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyGeneralDetails" */
  update_Tbl_CompanyGeneralDetails?: Maybe<Tbl_CompanyGeneralDetails_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyGeneralDetails" */
  update_Tbl_CompanyGeneralDetails_by_pk?: Maybe<Tbl_CompanyGeneralDetails>;
  /** update multiples rows of table: "Tbl_CompanyGeneralDetails" */
  update_Tbl_CompanyGeneralDetails_many?: Maybe<
    Array<Maybe<Tbl_CompanyGeneralDetails_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyRoleMapping" */
  update_Tbl_CompanyRoleMapping?: Maybe<Tbl_CompanyRoleMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyRoleMapping" */
  update_Tbl_CompanyRoleMapping_by_pk?: Maybe<Tbl_CompanyRoleMapping>;
  /** update multiples rows of table: "Tbl_CompanyRoleMapping" */
  update_Tbl_CompanyRoleMapping_many?: Maybe<
    Array<Maybe<Tbl_CompanyRoleMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyStatusLog" */
  update_Tbl_CompanyStatusLog?: Maybe<Tbl_CompanyStatusLog_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyStatusLog" */
  update_Tbl_CompanyStatusLog_by_pk?: Maybe<Tbl_CompanyStatusLog>;
  /** update multiples rows of table: "Tbl_CompanyStatusLog" */
  update_Tbl_CompanyStatusLog_many?: Maybe<
    Array<Maybe<Tbl_CompanyStatusLog_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CompanyStatusMaster" */
  update_Tbl_CompanyStatusMaster?: Maybe<Tbl_CompanyStatusMaster_Mutation_Response>;
  /** update single row of the table: "Tbl_CompanyStatusMaster" */
  update_Tbl_CompanyStatusMaster_by_pk?: Maybe<Tbl_CompanyStatusMaster>;
  /** update multiples rows of table: "Tbl_CompanyStatusMaster" */
  update_Tbl_CompanyStatusMaster_many?: Maybe<
    Array<Maybe<Tbl_CompanyStatusMaster_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_CountryMaster" */
  update_Tbl_CountryMaster?: Maybe<Tbl_CountryMaster_Mutation_Response>;
  /** update single row of the table: "Tbl_CountryMaster" */
  update_Tbl_CountryMaster_by_pk?: Maybe<Tbl_CountryMaster>;
  /** update multiples rows of table: "Tbl_CountryMaster" */
  update_Tbl_CountryMaster_many?: Maybe<
    Array<Maybe<Tbl_CountryMaster_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_EmailHeaderFooter" */
  update_Tbl_EmailHeaderFooter?: Maybe<Tbl_EmailHeaderFooter_Mutation_Response>;
  /** update single row of the table: "Tbl_EmailHeaderFooter" */
  update_Tbl_EmailHeaderFooter_by_pk?: Maybe<Tbl_EmailHeaderFooter>;
  /** update multiples rows of table: "Tbl_EmailHeaderFooter" */
  update_Tbl_EmailHeaderFooter_many?: Maybe<
    Array<Maybe<Tbl_EmailHeaderFooter_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_EmailTemplate" */
  update_Tbl_EmailTemplate?: Maybe<Tbl_EmailTemplate_Mutation_Response>;
  /** update data of the table: "Tbl_EmailTemplateNotificationDetails" */
  update_Tbl_EmailTemplateNotificationDetails?: Maybe<Tbl_EmailTemplateNotificationDetails_Mutation_Response>;
  /** update single row of the table: "Tbl_EmailTemplateNotificationDetails" */
  update_Tbl_EmailTemplateNotificationDetails_by_pk?: Maybe<Tbl_EmailTemplateNotificationDetails>;
  /** update multiples rows of table: "Tbl_EmailTemplateNotificationDetails" */
  update_Tbl_EmailTemplateNotificationDetails_many?: Maybe<
    Array<Maybe<Tbl_EmailTemplateNotificationDetails_Mutation_Response>>
  >;
  /** update single row of the table: "Tbl_EmailTemplate" */
  update_Tbl_EmailTemplate_by_pk?: Maybe<Tbl_EmailTemplate>;
  /** update multiples rows of table: "Tbl_EmailTemplate" */
  update_Tbl_EmailTemplate_many?: Maybe<
    Array<Maybe<Tbl_EmailTemplate_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_GlobalSettings" */
  update_Tbl_GlobalSettings?: Maybe<Tbl_GlobalSettings_Mutation_Response>;
  /** update single row of the table: "Tbl_GlobalSettings" */
  update_Tbl_GlobalSettings_by_pk?: Maybe<Tbl_GlobalSettings>;
  /** update multiples rows of table: "Tbl_GlobalSettings" */
  update_Tbl_GlobalSettings_many?: Maybe<
    Array<Maybe<Tbl_GlobalSettings_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_LanguageResources" */
  update_Tbl_LanguageResources?: Maybe<Tbl_LanguageResources_Mutation_Response>;
  /** update single row of the table: "Tbl_LanguageResources" */
  update_Tbl_LanguageResources_by_pk?: Maybe<Tbl_LanguageResources>;
  /** update multiples rows of table: "Tbl_LanguageResources" */
  update_Tbl_LanguageResources_many?: Maybe<
    Array<Maybe<Tbl_LanguageResources_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_OPsCompanyDBDetails" */
  update_Tbl_OPsCompanyDBDetails?: Maybe<Tbl_OPsCompanyDbDetails_Mutation_Response>;
  /** update single row of the table: "Tbl_OPsCompanyDBDetails" */
  update_Tbl_OPsCompanyDBDetails_by_pk?: Maybe<Tbl_OPsCompanyDbDetails>;
  /** update multiples rows of table: "Tbl_OPsCompanyDBDetails" */
  update_Tbl_OPsCompanyDBDetails_many?: Maybe<
    Array<Maybe<Tbl_OPsCompanyDbDetails_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_Pages" */
  update_Tbl_Pages?: Maybe<Tbl_Pages_Mutation_Response>;
  /** update single row of the table: "Tbl_Pages" */
  update_Tbl_Pages_by_pk?: Maybe<Tbl_Pages>;
  /** update multiples rows of table: "Tbl_Pages" */
  update_Tbl_Pages_many?: Maybe<Array<Maybe<Tbl_Pages_Mutation_Response>>>;
  /** update data of the table: "Tbl_PasswordManageMaster" */
  update_Tbl_PasswordManageMaster?: Maybe<Tbl_PasswordManageMaster_Mutation_Response>;
  /** update single row of the table: "Tbl_PasswordManageMaster" */
  update_Tbl_PasswordManageMaster_by_pk?: Maybe<Tbl_PasswordManageMaster>;
  /** update multiples rows of table: "Tbl_PasswordManageMaster" */
  update_Tbl_PasswordManageMaster_many?: Maybe<
    Array<Maybe<Tbl_PasswordManageMaster_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_Permissions" */
  update_Tbl_Permissions?: Maybe<Tbl_Permissions_Mutation_Response>;
  /** update single row of the table: "Tbl_Permissions" */
  update_Tbl_Permissions_by_pk?: Maybe<Tbl_Permissions>;
  /** update multiples rows of table: "Tbl_Permissions" */
  update_Tbl_Permissions_many?: Maybe<
    Array<Maybe<Tbl_Permissions_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_PowerBIReportDetails" */
  update_Tbl_PowerBIReportDetails?: Maybe<Tbl_PowerBiReportDetails_Mutation_Response>;
  /** update single row of the table: "Tbl_PowerBIReportDetails" */
  update_Tbl_PowerBIReportDetails_by_pk?: Maybe<Tbl_PowerBiReportDetails>;
  /** update multiples rows of table: "Tbl_PowerBIReportDetails" */
  update_Tbl_PowerBIReportDetails_many?: Maybe<
    Array<Maybe<Tbl_PowerBiReportDetails_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_Roles" */
  update_Tbl_Roles?: Maybe<Tbl_Roles_Mutation_Response>;
  /** update single row of the table: "Tbl_Roles" */
  update_Tbl_Roles_by_pk?: Maybe<Tbl_Roles>;
  /** update multiples rows of table: "Tbl_Roles" */
  update_Tbl_Roles_many?: Maybe<Array<Maybe<Tbl_Roles_Mutation_Response>>>;
  /** update data of the table: "Tbl_UserCompanyMapping" */
  update_Tbl_UserCompanyMapping?: Maybe<Tbl_UserCompanyMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_UserCompanyMapping" */
  update_Tbl_UserCompanyMapping_by_pk?: Maybe<Tbl_UserCompanyMapping>;
  /** update multiples rows of table: "Tbl_UserCompanyMapping" */
  update_Tbl_UserCompanyMapping_many?: Maybe<
    Array<Maybe<Tbl_UserCompanyMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserLocationActivityMapping" */
  update_Tbl_UserLocationActivityMapping?: Maybe<Tbl_UserLocationActivityMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_UserLocationActivityMapping" */
  update_Tbl_UserLocationActivityMapping_by_pk?: Maybe<Tbl_UserLocationActivityMapping>;
  /** update multiples rows of table: "Tbl_UserLocationActivityMapping" */
  update_Tbl_UserLocationActivityMapping_many?: Maybe<
    Array<Maybe<Tbl_UserLocationActivityMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserLoginLogs" */
  update_Tbl_UserLoginLogs?: Maybe<Tbl_UserLoginLogs_Mutation_Response>;
  /** update single row of the table: "Tbl_UserLoginLogs" */
  update_Tbl_UserLoginLogs_by_pk?: Maybe<Tbl_UserLoginLogs>;
  /** update multiples rows of table: "Tbl_UserLoginLogs" */
  update_Tbl_UserLoginLogs_many?: Maybe<
    Array<Maybe<Tbl_UserLoginLogs_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserPermissions" */
  update_Tbl_UserPermissions?: Maybe<Tbl_UserPermissions_Mutation_Response>;
  /** update single row of the table: "Tbl_UserPermissions" */
  update_Tbl_UserPermissions_by_pk?: Maybe<Tbl_UserPermissions>;
  /** update multiples rows of table: "Tbl_UserPermissions" */
  update_Tbl_UserPermissions_many?: Maybe<
    Array<Maybe<Tbl_UserPermissions_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserRoleMapping" */
  update_Tbl_UserRoleMapping?: Maybe<Tbl_UserRoleMapping_Mutation_Response>;
  /** update single row of the table: "Tbl_UserRoleMapping" */
  update_Tbl_UserRoleMapping_by_pk?: Maybe<Tbl_UserRoleMapping>;
  /** update multiples rows of table: "Tbl_UserRoleMapping" */
  update_Tbl_UserRoleMapping_many?: Maybe<
    Array<Maybe<Tbl_UserRoleMapping_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserSessions" */
  update_Tbl_UserSessions?: Maybe<Tbl_UserSessions_Mutation_Response>;
  /** update single row of the table: "Tbl_UserSessions" */
  update_Tbl_UserSessions_by_pk?: Maybe<Tbl_UserSessions>;
  /** update multiples rows of table: "Tbl_UserSessions" */
  update_Tbl_UserSessions_many?: Maybe<
    Array<Maybe<Tbl_UserSessions_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_UserStatusMaster" */
  update_Tbl_UserStatusMaster?: Maybe<Tbl_UserStatusMaster_Mutation_Response>;
  /** update single row of the table: "Tbl_UserStatusMaster" */
  update_Tbl_UserStatusMaster_by_pk?: Maybe<Tbl_UserStatusMaster>;
  /** update multiples rows of table: "Tbl_UserStatusMaster" */
  update_Tbl_UserStatusMaster_many?: Maybe<
    Array<Maybe<Tbl_UserStatusMaster_Mutation_Response>>
  >;
  /** update data of the table: "Tbl_Users" */
  update_Tbl_Users?: Maybe<Tbl_Users_Mutation_Response>;
  /** update single row of the table: "Tbl_Users" */
  update_Tbl_Users_by_pk?: Maybe<Tbl_Users>;
  /** update multiples rows of table: "Tbl_Users" */
  update_Tbl_Users_many?: Maybe<Array<Maybe<Tbl_Users_Mutation_Response>>>;
  /** update data of the table: "Tbl_WarpForms" */
  update_Tbl_WarpForms?: Maybe<Tbl_WarpForms_Mutation_Response>;
  /** update single row of the table: "Tbl_WarpForms" */
  update_Tbl_WarpForms_by_pk?: Maybe<Tbl_WarpForms>;
  /** update multiples rows of table: "Tbl_WarpForms" */
  update_Tbl_WarpForms_many?: Maybe<
    Array<Maybe<Tbl_WarpForms_Mutation_Response>>
  >;
  /** update data of the table: "master_policy_document" */
  update_master_policy_document?: Maybe<Master_Policy_Document_Mutation_Response>;
  /** update single row of the table: "master_policy_document" */
  update_master_policy_document_by_pk?: Maybe<Master_Policy_Document>;
  /** update multiples rows of table: "master_policy_document" */
  update_master_policy_document_many?: Maybe<
    Array<Maybe<Master_Policy_Document_Mutation_Response>>
  >;
  /** update data of the table: "tbl_oauthclients" */
  update_tbl_oauthclients?: Maybe<Tbl_Oauthclients_Mutation_Response>;
  /** update single row of the table: "tbl_oauthclients" */
  update_tbl_oauthclients_by_pk?: Maybe<Tbl_Oauthclients>;
  /** update multiples rows of table: "tbl_oauthclients" */
  update_tbl_oauthclients_many?: Maybe<
    Array<Maybe<Tbl_Oauthclients_Mutation_Response>>
  >;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_AddressesArgs = {
  where: Tbl_Addresses_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Addresses_By_PkArgs = {
  AddressGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_AssessmentMappingArgs = {
  where: Tbl_AssessmentMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_AssessmentMapping_By_PkArgs = {
  AssessmentMappingGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_BusinessTypeMasterArgs = {
  where: Tbl_BusinessTypeMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_BusinessTypeMaster_By_PkArgs = {
  BusinessTypeGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompaniesArgs = {
  where: Tbl_Companies_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Companies_By_PkArgs = {
  CompanyGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyBusinessTypeArgs = {
  where: Tbl_CompanyBusinessType_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyBusinessType_By_PkArgs = {
  CompanyBusinessTypeGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyCountryArgs = {
  where: Tbl_CompanyCountry_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyCountry_By_PkArgs = {
  CompanyCountryGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyDashboardMappingArgs = {
  where: Tbl_CompanyDashboardMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyDashboardMapping_By_PkArgs = {
  CompanyDashboardMappingGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyGeneralDetailsArgs = {
  where: Tbl_CompanyGeneralDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyGeneralDetails_By_PkArgs = {
  CompanyGeneralDetailsGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyRoleMappingArgs = {
  where: Tbl_CompanyRoleMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyRoleMapping_By_PkArgs = {
  CompanyRoleMappingGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyStatusLogArgs = {
  where: Tbl_CompanyStatusLog_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyStatusLog_By_PkArgs = {
  CompanyStatusLogGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyStatusMasterArgs = {
  where: Tbl_CompanyStatusMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CompanyStatusMaster_By_PkArgs = {
  CompanyStatusGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CountryMasterArgs = {
  where: Tbl_CountryMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_CountryMaster_By_PkArgs = {
  CountryGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailHeaderFooterArgs = {
  where: Tbl_EmailHeaderFooter_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailHeaderFooter_By_PkArgs = {
  EmailHeaderFooterGUID: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailTemplateArgs = {
  where: Tbl_EmailTemplate_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailTemplateNotificationDetailsArgs = {
  where: Tbl_EmailTemplateNotificationDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailTemplateNotificationDetails_By_PkArgs =
  {
    UserEmailTemplateNotificationGuid: Scalars["uuid"]["input"];
  };

/** mutation root */
export type Mutation_RootDelete_Tbl_EmailTemplate_By_PkArgs = {
  EmailTemplateGUID: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_GlobalSettingsArgs = {
  where: Tbl_GlobalSettings_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_GlobalSettings_By_PkArgs = {
  GlobalSettingsGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_LanguageResourcesArgs = {
  where: Tbl_LanguageResources_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_LanguageResources_By_PkArgs = {
  LanguageResourceGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_OPsCompanyDbDetailsArgs = {
  where: Tbl_OPsCompanyDbDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_OPsCompanyDbDetails_By_PkArgs = {
  OPsCompanyDBDetailsGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PagesArgs = {
  where: Tbl_Pages_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Pages_By_PkArgs = {
  PageGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PasswordManageMasterArgs = {
  where: Tbl_PasswordManageMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PasswordManageMaster_By_PkArgs = {
  ChangePasswordGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PermissionsArgs = {
  where: Tbl_Permissions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Permissions_By_PkArgs = {
  PermissionGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PowerBiReportDetailsArgs = {
  where: Tbl_PowerBiReportDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_PowerBiReportDetails_By_PkArgs = {
  PowerBIGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_RolesArgs = {
  where: Tbl_Roles_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Roles_By_PkArgs = {
  RoleGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserCompanyMappingArgs = {
  where: Tbl_UserCompanyMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserCompanyMapping_By_PkArgs = {
  UserCompanyMappingGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserLocationActivityMappingArgs = {
  where: Tbl_UserLocationActivityMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserLocationActivityMapping_By_PkArgs = {
  UserLocationActivityGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserLoginLogsArgs = {
  where: Tbl_UserLoginLogs_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserLoginLogs_By_PkArgs = {
  UserLoginLogsGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserPermissionsArgs = {
  where: Tbl_UserPermissions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserPermissions_By_PkArgs = {
  UserPermissionGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserRoleMappingArgs = {
  where: Tbl_UserRoleMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserRoleMapping_By_PkArgs = {
  UserRoleMappingGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserSessionsArgs = {
  where: Tbl_UserSessions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserSessions_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserStatusMasterArgs = {
  where: Tbl_UserStatusMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UserStatusMaster_By_PkArgs = {
  StatusGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_UsersArgs = {
  where: Tbl_Users_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Users_By_PkArgs = {
  UserGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_WarpFormsArgs = {
  where: Tbl_WarpForms_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_WarpForms_By_PkArgs = {
  WarpFormsGuid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Master_Policy_DocumentArgs = {
  where: Master_Policy_Document_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Master_Policy_Document_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Tbl_OauthclientsArgs = {
  where: Tbl_Oauthclients_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Tbl_Oauthclients_By_PkArgs = {
  oauthclientguid: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootInsert_Tbl_AddressesArgs = {
  objects: Array<Tbl_Addresses_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Addresses_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Addresses_OneArgs = {
  object: Tbl_Addresses_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Addresses_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_AssessmentMappingArgs = {
  objects: Array<Tbl_AssessmentMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_AssessmentMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_AssessmentMapping_OneArgs = {
  object: Tbl_AssessmentMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_AssessmentMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_BusinessTypeMasterArgs = {
  objects: Array<Tbl_BusinessTypeMaster_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_BusinessTypeMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_BusinessTypeMaster_OneArgs = {
  object: Tbl_BusinessTypeMaster_Insert_Input;
  on_conflict?: InputMaybe<Tbl_BusinessTypeMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompaniesArgs = {
  objects: Array<Tbl_Companies_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Companies_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Companies_OneArgs = {
  object: Tbl_Companies_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Companies_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyBusinessTypeArgs = {
  objects: Array<Tbl_CompanyBusinessType_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyBusinessType_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyBusinessType_OneArgs = {
  object: Tbl_CompanyBusinessType_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyBusinessType_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyCountryArgs = {
  objects: Array<Tbl_CompanyCountry_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyCountry_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyCountry_OneArgs = {
  object: Tbl_CompanyCountry_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyCountry_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyDashboardMappingArgs = {
  objects: Array<Tbl_CompanyDashboardMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyDashboardMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyDashboardMapping_OneArgs = {
  object: Tbl_CompanyDashboardMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyDashboardMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyGeneralDetailsArgs = {
  objects: Array<Tbl_CompanyGeneralDetails_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyGeneralDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyGeneralDetails_OneArgs = {
  object: Tbl_CompanyGeneralDetails_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyGeneralDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyRoleMappingArgs = {
  objects: Array<Tbl_CompanyRoleMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyRoleMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyRoleMapping_OneArgs = {
  object: Tbl_CompanyRoleMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyRoleMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyStatusLogArgs = {
  objects: Array<Tbl_CompanyStatusLog_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyStatusLog_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyStatusLog_OneArgs = {
  object: Tbl_CompanyStatusLog_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyStatusLog_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyStatusMasterArgs = {
  objects: Array<Tbl_CompanyStatusMaster_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CompanyStatusMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CompanyStatusMaster_OneArgs = {
  object: Tbl_CompanyStatusMaster_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CompanyStatusMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CountryMasterArgs = {
  objects: Array<Tbl_CountryMaster_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_CountryMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_CountryMaster_OneArgs = {
  object: Tbl_CountryMaster_Insert_Input;
  on_conflict?: InputMaybe<Tbl_CountryMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailHeaderFooterArgs = {
  objects: Array<Tbl_EmailHeaderFooter_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_EmailHeaderFooter_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailHeaderFooter_OneArgs = {
  object: Tbl_EmailHeaderFooter_Insert_Input;
  on_conflict?: InputMaybe<Tbl_EmailHeaderFooter_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailTemplateArgs = {
  objects: Array<Tbl_EmailTemplate_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_EmailTemplate_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailTemplateNotificationDetailsArgs = {
  objects: Array<Tbl_EmailTemplateNotificationDetails_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_EmailTemplateNotificationDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailTemplateNotificationDetails_OneArgs = {
  object: Tbl_EmailTemplateNotificationDetails_Insert_Input;
  on_conflict?: InputMaybe<Tbl_EmailTemplateNotificationDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_EmailTemplate_OneArgs = {
  object: Tbl_EmailTemplate_Insert_Input;
  on_conflict?: InputMaybe<Tbl_EmailTemplate_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_GlobalSettingsArgs = {
  objects: Array<Tbl_GlobalSettings_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_GlobalSettings_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_GlobalSettings_OneArgs = {
  object: Tbl_GlobalSettings_Insert_Input;
  on_conflict?: InputMaybe<Tbl_GlobalSettings_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_LanguageResourcesArgs = {
  objects: Array<Tbl_LanguageResources_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_LanguageResources_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_LanguageResources_OneArgs = {
  object: Tbl_LanguageResources_Insert_Input;
  on_conflict?: InputMaybe<Tbl_LanguageResources_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_OPsCompanyDbDetailsArgs = {
  objects: Array<Tbl_OPsCompanyDbDetails_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_OPsCompanyDbDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_OPsCompanyDbDetails_OneArgs = {
  object: Tbl_OPsCompanyDbDetails_Insert_Input;
  on_conflict?: InputMaybe<Tbl_OPsCompanyDbDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PagesArgs = {
  objects: Array<Tbl_Pages_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Pages_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Pages_OneArgs = {
  object: Tbl_Pages_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Pages_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PasswordManageMasterArgs = {
  objects: Array<Tbl_PasswordManageMaster_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_PasswordManageMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PasswordManageMaster_OneArgs = {
  object: Tbl_PasswordManageMaster_Insert_Input;
  on_conflict?: InputMaybe<Tbl_PasswordManageMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PermissionsArgs = {
  objects: Array<Tbl_Permissions_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Permissions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Permissions_OneArgs = {
  object: Tbl_Permissions_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Permissions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PowerBiReportDetailsArgs = {
  objects: Array<Tbl_PowerBiReportDetails_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_PowerBiReportDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_PowerBiReportDetails_OneArgs = {
  object: Tbl_PowerBiReportDetails_Insert_Input;
  on_conflict?: InputMaybe<Tbl_PowerBiReportDetails_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_RolesArgs = {
  objects: Array<Tbl_Roles_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Roles_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Roles_OneArgs = {
  object: Tbl_Roles_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Roles_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserCompanyMappingArgs = {
  objects: Array<Tbl_UserCompanyMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserCompanyMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserCompanyMapping_OneArgs = {
  object: Tbl_UserCompanyMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserCompanyMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserLocationActivityMappingArgs = {
  objects: Array<Tbl_UserLocationActivityMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserLocationActivityMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserLocationActivityMapping_OneArgs = {
  object: Tbl_UserLocationActivityMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserLocationActivityMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserLoginLogsArgs = {
  objects: Array<Tbl_UserLoginLogs_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserLoginLogs_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserLoginLogs_OneArgs = {
  object: Tbl_UserLoginLogs_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserLoginLogs_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserPermissionsArgs = {
  objects: Array<Tbl_UserPermissions_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserPermissions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserPermissions_OneArgs = {
  object: Tbl_UserPermissions_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserPermissions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserRoleMappingArgs = {
  objects: Array<Tbl_UserRoleMapping_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserRoleMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserRoleMapping_OneArgs = {
  object: Tbl_UserRoleMapping_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserRoleMapping_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserSessionsArgs = {
  objects: Array<Tbl_UserSessions_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserSessions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserSessions_OneArgs = {
  object: Tbl_UserSessions_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserSessions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserStatusMasterArgs = {
  objects: Array<Tbl_UserStatusMaster_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_UserStatusMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UserStatusMaster_OneArgs = {
  object: Tbl_UserStatusMaster_Insert_Input;
  on_conflict?: InputMaybe<Tbl_UserStatusMaster_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_UsersArgs = {
  objects: Array<Tbl_Users_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Users_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Users_OneArgs = {
  object: Tbl_Users_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Users_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_WarpFormsArgs = {
  objects: Array<Tbl_WarpForms_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_WarpForms_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_WarpForms_OneArgs = {
  object: Tbl_WarpForms_Insert_Input;
  on_conflict?: InputMaybe<Tbl_WarpForms_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Master_Policy_DocumentArgs = {
  objects: Array<Master_Policy_Document_Insert_Input>;
  on_conflict?: InputMaybe<Master_Policy_Document_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Master_Policy_Document_OneArgs = {
  object: Master_Policy_Document_Insert_Input;
  on_conflict?: InputMaybe<Master_Policy_Document_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_OauthclientsArgs = {
  objects: Array<Tbl_Oauthclients_Insert_Input>;
  on_conflict?: InputMaybe<Tbl_Oauthclients_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Tbl_Oauthclients_OneArgs = {
  object: Tbl_Oauthclients_Insert_Input;
  on_conflict?: InputMaybe<Tbl_Oauthclients_On_Conflict>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_AddressesArgs = {
  _set?: InputMaybe<Tbl_Addresses_Set_Input>;
  where: Tbl_Addresses_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Addresses_By_PkArgs = {
  _set?: InputMaybe<Tbl_Addresses_Set_Input>;
  pk_columns: Tbl_Addresses_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Addresses_ManyArgs = {
  updates: Array<Tbl_Addresses_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_AssessmentMappingArgs = {
  _set?: InputMaybe<Tbl_AssessmentMapping_Set_Input>;
  where: Tbl_AssessmentMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_AssessmentMapping_By_PkArgs = {
  _set?: InputMaybe<Tbl_AssessmentMapping_Set_Input>;
  pk_columns: Tbl_AssessmentMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_AssessmentMapping_ManyArgs = {
  updates: Array<Tbl_AssessmentMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_BusinessTypeMasterArgs = {
  _inc?: InputMaybe<Tbl_BusinessTypeMaster_Inc_Input>;
  _set?: InputMaybe<Tbl_BusinessTypeMaster_Set_Input>;
  where: Tbl_BusinessTypeMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_BusinessTypeMaster_By_PkArgs = {
  _inc?: InputMaybe<Tbl_BusinessTypeMaster_Inc_Input>;
  _set?: InputMaybe<Tbl_BusinessTypeMaster_Set_Input>;
  pk_columns: Tbl_BusinessTypeMaster_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_BusinessTypeMaster_ManyArgs = {
  updates: Array<Tbl_BusinessTypeMaster_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompaniesArgs = {
  _append?: InputMaybe<Tbl_Companies_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_Companies_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_Companies_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_Companies_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_Companies_Inc_Input>;
  _prepend?: InputMaybe<Tbl_Companies_Prepend_Input>;
  _set?: InputMaybe<Tbl_Companies_Set_Input>;
  where: Tbl_Companies_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Companies_By_PkArgs = {
  _append?: InputMaybe<Tbl_Companies_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_Companies_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_Companies_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_Companies_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_Companies_Inc_Input>;
  _prepend?: InputMaybe<Tbl_Companies_Prepend_Input>;
  _set?: InputMaybe<Tbl_Companies_Set_Input>;
  pk_columns: Tbl_Companies_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Companies_ManyArgs = {
  updates: Array<Tbl_Companies_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyBusinessTypeArgs = {
  _set?: InputMaybe<Tbl_CompanyBusinessType_Set_Input>;
  where: Tbl_CompanyBusinessType_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyBusinessType_By_PkArgs = {
  _set?: InputMaybe<Tbl_CompanyBusinessType_Set_Input>;
  pk_columns: Tbl_CompanyBusinessType_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyBusinessType_ManyArgs = {
  updates: Array<Tbl_CompanyBusinessType_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyCountryArgs = {
  _set?: InputMaybe<Tbl_CompanyCountry_Set_Input>;
  where: Tbl_CompanyCountry_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyCountry_By_PkArgs = {
  _set?: InputMaybe<Tbl_CompanyCountry_Set_Input>;
  pk_columns: Tbl_CompanyCountry_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyCountry_ManyArgs = {
  updates: Array<Tbl_CompanyCountry_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyDashboardMappingArgs = {
  _append?: InputMaybe<Tbl_CompanyDashboardMapping_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_CompanyDashboardMapping_Inc_Input>;
  _prepend?: InputMaybe<Tbl_CompanyDashboardMapping_Prepend_Input>;
  _set?: InputMaybe<Tbl_CompanyDashboardMapping_Set_Input>;
  where: Tbl_CompanyDashboardMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyDashboardMapping_By_PkArgs = {
  _append?: InputMaybe<Tbl_CompanyDashboardMapping_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_CompanyDashboardMapping_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_CompanyDashboardMapping_Inc_Input>;
  _prepend?: InputMaybe<Tbl_CompanyDashboardMapping_Prepend_Input>;
  _set?: InputMaybe<Tbl_CompanyDashboardMapping_Set_Input>;
  pk_columns: Tbl_CompanyDashboardMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyDashboardMapping_ManyArgs = {
  updates: Array<Tbl_CompanyDashboardMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyGeneralDetailsArgs = {
  _inc?: InputMaybe<Tbl_CompanyGeneralDetails_Inc_Input>;
  _set?: InputMaybe<Tbl_CompanyGeneralDetails_Set_Input>;
  where: Tbl_CompanyGeneralDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyGeneralDetails_By_PkArgs = {
  _inc?: InputMaybe<Tbl_CompanyGeneralDetails_Inc_Input>;
  _set?: InputMaybe<Tbl_CompanyGeneralDetails_Set_Input>;
  pk_columns: Tbl_CompanyGeneralDetails_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyGeneralDetails_ManyArgs = {
  updates: Array<Tbl_CompanyGeneralDetails_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyRoleMappingArgs = {
  _set?: InputMaybe<Tbl_CompanyRoleMapping_Set_Input>;
  where: Tbl_CompanyRoleMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyRoleMapping_By_PkArgs = {
  _set?: InputMaybe<Tbl_CompanyRoleMapping_Set_Input>;
  pk_columns: Tbl_CompanyRoleMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyRoleMapping_ManyArgs = {
  updates: Array<Tbl_CompanyRoleMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusLogArgs = {
  _set?: InputMaybe<Tbl_CompanyStatusLog_Set_Input>;
  where: Tbl_CompanyStatusLog_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusLog_By_PkArgs = {
  _set?: InputMaybe<Tbl_CompanyStatusLog_Set_Input>;
  pk_columns: Tbl_CompanyStatusLog_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusLog_ManyArgs = {
  updates: Array<Tbl_CompanyStatusLog_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusMasterArgs = {
  _set?: InputMaybe<Tbl_CompanyStatusMaster_Set_Input>;
  where: Tbl_CompanyStatusMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusMaster_By_PkArgs = {
  _set?: InputMaybe<Tbl_CompanyStatusMaster_Set_Input>;
  pk_columns: Tbl_CompanyStatusMaster_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CompanyStatusMaster_ManyArgs = {
  updates: Array<Tbl_CompanyStatusMaster_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CountryMasterArgs = {
  _set?: InputMaybe<Tbl_CountryMaster_Set_Input>;
  where: Tbl_CountryMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CountryMaster_By_PkArgs = {
  _set?: InputMaybe<Tbl_CountryMaster_Set_Input>;
  pk_columns: Tbl_CountryMaster_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_CountryMaster_ManyArgs = {
  updates: Array<Tbl_CountryMaster_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailHeaderFooterArgs = {
  _set?: InputMaybe<Tbl_EmailHeaderFooter_Set_Input>;
  where: Tbl_EmailHeaderFooter_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailHeaderFooter_By_PkArgs = {
  _set?: InputMaybe<Tbl_EmailHeaderFooter_Set_Input>;
  pk_columns: Tbl_EmailHeaderFooter_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailHeaderFooter_ManyArgs = {
  updates: Array<Tbl_EmailHeaderFooter_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplateArgs = {
  _set?: InputMaybe<Tbl_EmailTemplate_Set_Input>;
  where: Tbl_EmailTemplate_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplateNotificationDetailsArgs = {
  _set?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Set_Input>;
  where: Tbl_EmailTemplateNotificationDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplateNotificationDetails_By_PkArgs =
  {
    _set?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Set_Input>;
    pk_columns: Tbl_EmailTemplateNotificationDetails_Pk_Columns_Input;
  };

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplateNotificationDetails_ManyArgs =
  {
    updates: Array<Tbl_EmailTemplateNotificationDetails_Updates>;
  };

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplate_By_PkArgs = {
  _set?: InputMaybe<Tbl_EmailTemplate_Set_Input>;
  pk_columns: Tbl_EmailTemplate_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_EmailTemplate_ManyArgs = {
  updates: Array<Tbl_EmailTemplate_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_GlobalSettingsArgs = {
  _set?: InputMaybe<Tbl_GlobalSettings_Set_Input>;
  where: Tbl_GlobalSettings_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_GlobalSettings_By_PkArgs = {
  _set?: InputMaybe<Tbl_GlobalSettings_Set_Input>;
  pk_columns: Tbl_GlobalSettings_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_GlobalSettings_ManyArgs = {
  updates: Array<Tbl_GlobalSettings_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_LanguageResourcesArgs = {
  _set?: InputMaybe<Tbl_LanguageResources_Set_Input>;
  where: Tbl_LanguageResources_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_LanguageResources_By_PkArgs = {
  _set?: InputMaybe<Tbl_LanguageResources_Set_Input>;
  pk_columns: Tbl_LanguageResources_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_LanguageResources_ManyArgs = {
  updates: Array<Tbl_LanguageResources_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_OPsCompanyDbDetailsArgs = {
  _set?: InputMaybe<Tbl_OPsCompanyDbDetails_Set_Input>;
  where: Tbl_OPsCompanyDbDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_OPsCompanyDbDetails_By_PkArgs = {
  _set?: InputMaybe<Tbl_OPsCompanyDbDetails_Set_Input>;
  pk_columns: Tbl_OPsCompanyDbDetails_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_OPsCompanyDbDetails_ManyArgs = {
  updates: Array<Tbl_OPsCompanyDbDetails_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PagesArgs = {
  _set?: InputMaybe<Tbl_Pages_Set_Input>;
  where: Tbl_Pages_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Pages_By_PkArgs = {
  _set?: InputMaybe<Tbl_Pages_Set_Input>;
  pk_columns: Tbl_Pages_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Pages_ManyArgs = {
  updates: Array<Tbl_Pages_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PasswordManageMasterArgs = {
  _set?: InputMaybe<Tbl_PasswordManageMaster_Set_Input>;
  where: Tbl_PasswordManageMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PasswordManageMaster_By_PkArgs = {
  _set?: InputMaybe<Tbl_PasswordManageMaster_Set_Input>;
  pk_columns: Tbl_PasswordManageMaster_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PasswordManageMaster_ManyArgs = {
  updates: Array<Tbl_PasswordManageMaster_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PermissionsArgs = {
  _append?: InputMaybe<Tbl_Permissions_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_Permissions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_Permissions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_Permissions_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_Permissions_Inc_Input>;
  _prepend?: InputMaybe<Tbl_Permissions_Prepend_Input>;
  _set?: InputMaybe<Tbl_Permissions_Set_Input>;
  where: Tbl_Permissions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Permissions_By_PkArgs = {
  _append?: InputMaybe<Tbl_Permissions_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_Permissions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_Permissions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_Permissions_Delete_Key_Input>;
  _inc?: InputMaybe<Tbl_Permissions_Inc_Input>;
  _prepend?: InputMaybe<Tbl_Permissions_Prepend_Input>;
  _set?: InputMaybe<Tbl_Permissions_Set_Input>;
  pk_columns: Tbl_Permissions_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Permissions_ManyArgs = {
  updates: Array<Tbl_Permissions_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PowerBiReportDetailsArgs = {
  _set?: InputMaybe<Tbl_PowerBiReportDetails_Set_Input>;
  where: Tbl_PowerBiReportDetails_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PowerBiReportDetails_By_PkArgs = {
  _set?: InputMaybe<Tbl_PowerBiReportDetails_Set_Input>;
  pk_columns: Tbl_PowerBiReportDetails_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_PowerBiReportDetails_ManyArgs = {
  updates: Array<Tbl_PowerBiReportDetails_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_RolesArgs = {
  _inc?: InputMaybe<Tbl_Roles_Inc_Input>;
  _set?: InputMaybe<Tbl_Roles_Set_Input>;
  where: Tbl_Roles_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Roles_By_PkArgs = {
  _inc?: InputMaybe<Tbl_Roles_Inc_Input>;
  _set?: InputMaybe<Tbl_Roles_Set_Input>;
  pk_columns: Tbl_Roles_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Roles_ManyArgs = {
  updates: Array<Tbl_Roles_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserCompanyMappingArgs = {
  _set?: InputMaybe<Tbl_UserCompanyMapping_Set_Input>;
  where: Tbl_UserCompanyMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserCompanyMapping_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserCompanyMapping_Set_Input>;
  pk_columns: Tbl_UserCompanyMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserCompanyMapping_ManyArgs = {
  updates: Array<Tbl_UserCompanyMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLocationActivityMappingArgs = {
  _set?: InputMaybe<Tbl_UserLocationActivityMapping_Set_Input>;
  where: Tbl_UserLocationActivityMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLocationActivityMapping_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserLocationActivityMapping_Set_Input>;
  pk_columns: Tbl_UserLocationActivityMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLocationActivityMapping_ManyArgs = {
  updates: Array<Tbl_UserLocationActivityMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLoginLogsArgs = {
  _set?: InputMaybe<Tbl_UserLoginLogs_Set_Input>;
  where: Tbl_UserLoginLogs_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLoginLogs_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserLoginLogs_Set_Input>;
  pk_columns: Tbl_UserLoginLogs_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserLoginLogs_ManyArgs = {
  updates: Array<Tbl_UserLoginLogs_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserPermissionsArgs = {
  _set?: InputMaybe<Tbl_UserPermissions_Set_Input>;
  where: Tbl_UserPermissions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserPermissions_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserPermissions_Set_Input>;
  pk_columns: Tbl_UserPermissions_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserPermissions_ManyArgs = {
  updates: Array<Tbl_UserPermissions_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserRoleMappingArgs = {
  _set?: InputMaybe<Tbl_UserRoleMapping_Set_Input>;
  where: Tbl_UserRoleMapping_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserRoleMapping_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserRoleMapping_Set_Input>;
  pk_columns: Tbl_UserRoleMapping_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserRoleMapping_ManyArgs = {
  updates: Array<Tbl_UserRoleMapping_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserSessionsArgs = {
  _append?: InputMaybe<Tbl_UserSessions_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_UserSessions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_UserSessions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_UserSessions_Delete_Key_Input>;
  _prepend?: InputMaybe<Tbl_UserSessions_Prepend_Input>;
  _set?: InputMaybe<Tbl_UserSessions_Set_Input>;
  where: Tbl_UserSessions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserSessions_By_PkArgs = {
  _append?: InputMaybe<Tbl_UserSessions_Append_Input>;
  _delete_at_path?: InputMaybe<Tbl_UserSessions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tbl_UserSessions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tbl_UserSessions_Delete_Key_Input>;
  _prepend?: InputMaybe<Tbl_UserSessions_Prepend_Input>;
  _set?: InputMaybe<Tbl_UserSessions_Set_Input>;
  pk_columns: Tbl_UserSessions_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserSessions_ManyArgs = {
  updates: Array<Tbl_UserSessions_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserStatusMasterArgs = {
  _set?: InputMaybe<Tbl_UserStatusMaster_Set_Input>;
  where: Tbl_UserStatusMaster_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserStatusMaster_By_PkArgs = {
  _set?: InputMaybe<Tbl_UserStatusMaster_Set_Input>;
  pk_columns: Tbl_UserStatusMaster_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UserStatusMaster_ManyArgs = {
  updates: Array<Tbl_UserStatusMaster_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_UsersArgs = {
  _inc?: InputMaybe<Tbl_Users_Inc_Input>;
  _set?: InputMaybe<Tbl_Users_Set_Input>;
  where: Tbl_Users_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Users_By_PkArgs = {
  _inc?: InputMaybe<Tbl_Users_Inc_Input>;
  _set?: InputMaybe<Tbl_Users_Set_Input>;
  pk_columns: Tbl_Users_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Users_ManyArgs = {
  updates: Array<Tbl_Users_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_WarpFormsArgs = {
  _set?: InputMaybe<Tbl_WarpForms_Set_Input>;
  where: Tbl_WarpForms_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_WarpForms_By_PkArgs = {
  _set?: InputMaybe<Tbl_WarpForms_Set_Input>;
  pk_columns: Tbl_WarpForms_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_WarpForms_ManyArgs = {
  updates: Array<Tbl_WarpForms_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Master_Policy_DocumentArgs = {
  _inc?: InputMaybe<Master_Policy_Document_Inc_Input>;
  _set?: InputMaybe<Master_Policy_Document_Set_Input>;
  where: Master_Policy_Document_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Master_Policy_Document_By_PkArgs = {
  _inc?: InputMaybe<Master_Policy_Document_Inc_Input>;
  _set?: InputMaybe<Master_Policy_Document_Set_Input>;
  pk_columns: Master_Policy_Document_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Master_Policy_Document_ManyArgs = {
  updates: Array<Master_Policy_Document_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_OauthclientsArgs = {
  _set?: InputMaybe<Tbl_Oauthclients_Set_Input>;
  where: Tbl_Oauthclients_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Oauthclients_By_PkArgs = {
  _set?: InputMaybe<Tbl_Oauthclients_Set_Input>;
  pk_columns: Tbl_Oauthclients_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Tbl_Oauthclients_ManyArgs = {
  updates: Array<Tbl_Oauthclients_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["numeric"]["input"]>;
  _gt?: InputMaybe<Scalars["numeric"]["input"]>;
  _gte?: InputMaybe<Scalars["numeric"]["input"]>;
  _in?: InputMaybe<Array<Scalars["numeric"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["numeric"]["input"]>;
  _lte?: InputMaybe<Scalars["numeric"]["input"]>;
  _neq?: InputMaybe<Scalars["numeric"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["numeric"]["input"]>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = "asc",
  /** in ascending order, nulls first */
  AscNullsFirst = "asc_nulls_first",
  /** in ascending order, nulls last */
  AscNullsLast = "asc_nulls_last",
  /** in descending order, nulls first */
  Desc = "desc",
  /** in descending order, nulls first */
  DescNullsFirst = "desc_nulls_first",
  /** in descending order, nulls last */
  DescNullsLast = "desc_nulls_last"
}

export type Query_Root = {
  __typename?: "query_root";
  /** An array relationship */
  Tbl_Addresses: Array<Tbl_Addresses>;
  /** An aggregate relationship */
  Tbl_Addresses_aggregate: Tbl_Addresses_Aggregate;
  /** fetch data from the table: "Tbl_Addresses" using primary key columns */
  Tbl_Addresses_by_pk?: Maybe<Tbl_Addresses>;
  /** fetch data from the table: "Tbl_AssessmentMapping" */
  Tbl_AssessmentMapping: Array<Tbl_AssessmentMapping>;
  /** fetch aggregated fields from the table: "Tbl_AssessmentMapping" */
  Tbl_AssessmentMapping_aggregate: Tbl_AssessmentMapping_Aggregate;
  /** fetch data from the table: "Tbl_AssessmentMapping" using primary key columns */
  Tbl_AssessmentMapping_by_pk?: Maybe<Tbl_AssessmentMapping>;
  /** fetch data from the table: "Tbl_BusinessTypeMaster" */
  Tbl_BusinessTypeMaster: Array<Tbl_BusinessTypeMaster>;
  /** fetch aggregated fields from the table: "Tbl_BusinessTypeMaster" */
  Tbl_BusinessTypeMaster_aggregate: Tbl_BusinessTypeMaster_Aggregate;
  /** fetch data from the table: "Tbl_BusinessTypeMaster" using primary key columns */
  Tbl_BusinessTypeMaster_by_pk?: Maybe<Tbl_BusinessTypeMaster>;
  /** An array relationship */
  Tbl_Companies: Array<Tbl_Companies>;
  /** An aggregate relationship */
  Tbl_Companies_aggregate: Tbl_Companies_Aggregate;
  /** fetch data from the table: "Tbl_Companies" using primary key columns */
  Tbl_Companies_by_pk?: Maybe<Tbl_Companies>;
  /** fetch data from the table: "Tbl_CompanyBusinessType" */
  Tbl_CompanyBusinessType: Array<Tbl_CompanyBusinessType>;
  /** fetch aggregated fields from the table: "Tbl_CompanyBusinessType" */
  Tbl_CompanyBusinessType_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** fetch data from the table: "Tbl_CompanyBusinessType" using primary key columns */
  Tbl_CompanyBusinessType_by_pk?: Maybe<Tbl_CompanyBusinessType>;
  /** fetch data from the table: "Tbl_CompanyCountry" */
  Tbl_CompanyCountry: Array<Tbl_CompanyCountry>;
  /** fetch aggregated fields from the table: "Tbl_CompanyCountry" */
  Tbl_CompanyCountry_aggregate: Tbl_CompanyCountry_Aggregate;
  /** fetch data from the table: "Tbl_CompanyCountry" using primary key columns */
  Tbl_CompanyCountry_by_pk?: Maybe<Tbl_CompanyCountry>;
  /** fetch data from the table: "Tbl_CompanyDashboardMapping" */
  Tbl_CompanyDashboardMapping: Array<Tbl_CompanyDashboardMapping>;
  /** fetch aggregated fields from the table: "Tbl_CompanyDashboardMapping" */
  Tbl_CompanyDashboardMapping_aggregate: Tbl_CompanyDashboardMapping_Aggregate;
  /** fetch data from the table: "Tbl_CompanyDashboardMapping" using primary key columns */
  Tbl_CompanyDashboardMapping_by_pk?: Maybe<Tbl_CompanyDashboardMapping>;
  /** An array relationship */
  Tbl_CompanyGeneralDetails: Array<Tbl_CompanyGeneralDetails>;
  /** An aggregate relationship */
  Tbl_CompanyGeneralDetails_aggregate: Tbl_CompanyGeneralDetails_Aggregate;
  /** fetch data from the table: "Tbl_CompanyGeneralDetails" using primary key columns */
  Tbl_CompanyGeneralDetails_by_pk?: Maybe<Tbl_CompanyGeneralDetails>;
  /** fetch data from the table: "Tbl_CompanyRoleMapping" */
  Tbl_CompanyRoleMapping: Array<Tbl_CompanyRoleMapping>;
  /** fetch aggregated fields from the table: "Tbl_CompanyRoleMapping" */
  Tbl_CompanyRoleMapping_aggregate: Tbl_CompanyRoleMapping_Aggregate;
  /** fetch data from the table: "Tbl_CompanyRoleMapping" using primary key columns */
  Tbl_CompanyRoleMapping_by_pk?: Maybe<Tbl_CompanyRoleMapping>;
  /** fetch data from the table: "Tbl_CompanyStatusLog" */
  Tbl_CompanyStatusLog: Array<Tbl_CompanyStatusLog>;
  /** fetch aggregated fields from the table: "Tbl_CompanyStatusLog" */
  Tbl_CompanyStatusLog_aggregate: Tbl_CompanyStatusLog_Aggregate;
  /** fetch data from the table: "Tbl_CompanyStatusLog" using primary key columns */
  Tbl_CompanyStatusLog_by_pk?: Maybe<Tbl_CompanyStatusLog>;
  /** fetch data from the table: "Tbl_CompanyStatusMaster" */
  Tbl_CompanyStatusMaster: Array<Tbl_CompanyStatusMaster>;
  /** fetch aggregated fields from the table: "Tbl_CompanyStatusMaster" */
  Tbl_CompanyStatusMaster_aggregate: Tbl_CompanyStatusMaster_Aggregate;
  /** fetch data from the table: "Tbl_CompanyStatusMaster" using primary key columns */
  Tbl_CompanyStatusMaster_by_pk?: Maybe<Tbl_CompanyStatusMaster>;
  /** fetch data from the table: "Tbl_CountryMaster" */
  Tbl_CountryMaster: Array<Tbl_CountryMaster>;
  /** fetch aggregated fields from the table: "Tbl_CountryMaster" */
  Tbl_CountryMaster_aggregate: Tbl_CountryMaster_Aggregate;
  /** fetch data from the table: "Tbl_CountryMaster" using primary key columns */
  Tbl_CountryMaster_by_pk?: Maybe<Tbl_CountryMaster>;
  /** fetch data from the table: "Tbl_EmailHeaderFooter" */
  Tbl_EmailHeaderFooter: Array<Tbl_EmailHeaderFooter>;
  /** fetch aggregated fields from the table: "Tbl_EmailHeaderFooter" */
  Tbl_EmailHeaderFooter_aggregate: Tbl_EmailHeaderFooter_Aggregate;
  /** fetch data from the table: "Tbl_EmailHeaderFooter" using primary key columns */
  Tbl_EmailHeaderFooter_by_pk?: Maybe<Tbl_EmailHeaderFooter>;
  /** fetch data from the table: "Tbl_EmailTemplate" */
  Tbl_EmailTemplate: Array<Tbl_EmailTemplate>;
  /** An array relationship */
  Tbl_EmailTemplateNotificationDetails: Array<Tbl_EmailTemplateNotificationDetails>;
  /** An aggregate relationship */
  Tbl_EmailTemplateNotificationDetails_aggregate: Tbl_EmailTemplateNotificationDetails_Aggregate;
  /** fetch data from the table: "Tbl_EmailTemplateNotificationDetails" using primary key columns */
  Tbl_EmailTemplateNotificationDetails_by_pk?: Maybe<Tbl_EmailTemplateNotificationDetails>;
  /** fetch aggregated fields from the table: "Tbl_EmailTemplate" */
  Tbl_EmailTemplate_aggregate: Tbl_EmailTemplate_Aggregate;
  /** fetch data from the table: "Tbl_EmailTemplate" using primary key columns */
  Tbl_EmailTemplate_by_pk?: Maybe<Tbl_EmailTemplate>;
  /** fetch data from the table: "Tbl_GlobalSettings" */
  Tbl_GlobalSettings: Array<Tbl_GlobalSettings>;
  /** fetch aggregated fields from the table: "Tbl_GlobalSettings" */
  Tbl_GlobalSettings_aggregate: Tbl_GlobalSettings_Aggregate;
  /** fetch data from the table: "Tbl_GlobalSettings" using primary key columns */
  Tbl_GlobalSettings_by_pk?: Maybe<Tbl_GlobalSettings>;
  /** An array relationship */
  Tbl_LanguageResources: Array<Tbl_LanguageResources>;
  /** An aggregate relationship */
  Tbl_LanguageResources_aggregate: Tbl_LanguageResources_Aggregate;
  /** fetch data from the table: "Tbl_LanguageResources" using primary key columns */
  Tbl_LanguageResources_by_pk?: Maybe<Tbl_LanguageResources>;
  /** An array relationship */
  Tbl_OPsCompanyDBDetails: Array<Tbl_OPsCompanyDbDetails>;
  /** An aggregate relationship */
  Tbl_OPsCompanyDBDetails_aggregate: Tbl_OPsCompanyDbDetails_Aggregate;
  /** fetch data from the table: "Tbl_OPsCompanyDBDetails" using primary key columns */
  Tbl_OPsCompanyDBDetails_by_pk?: Maybe<Tbl_OPsCompanyDbDetails>;
  /** fetch data from the table: "Tbl_Pages" */
  Tbl_Pages: Array<Tbl_Pages>;
  /** fetch aggregated fields from the table: "Tbl_Pages" */
  Tbl_Pages_aggregate: Tbl_Pages_Aggregate;
  /** fetch data from the table: "Tbl_Pages" using primary key columns */
  Tbl_Pages_by_pk?: Maybe<Tbl_Pages>;
  /** fetch data from the table: "Tbl_PasswordManageMaster" */
  Tbl_PasswordManageMaster: Array<Tbl_PasswordManageMaster>;
  /** fetch aggregated fields from the table: "Tbl_PasswordManageMaster" */
  Tbl_PasswordManageMaster_aggregate: Tbl_PasswordManageMaster_Aggregate;
  /** fetch data from the table: "Tbl_PasswordManageMaster" using primary key columns */
  Tbl_PasswordManageMaster_by_pk?: Maybe<Tbl_PasswordManageMaster>;
  /** An array relationship */
  Tbl_Permissions: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  Tbl_Permissions_aggregate: Tbl_Permissions_Aggregate;
  /** fetch data from the table: "Tbl_Permissions" using primary key columns */
  Tbl_Permissions_by_pk?: Maybe<Tbl_Permissions>;
  /** fetch data from the table: "Tbl_PowerBIReportDetails" */
  Tbl_PowerBIReportDetails: Array<Tbl_PowerBiReportDetails>;
  /** fetch aggregated fields from the table: "Tbl_PowerBIReportDetails" */
  Tbl_PowerBIReportDetails_aggregate: Tbl_PowerBiReportDetails_Aggregate;
  /** fetch data from the table: "Tbl_PowerBIReportDetails" using primary key columns */
  Tbl_PowerBIReportDetails_by_pk?: Maybe<Tbl_PowerBiReportDetails>;
  /** An array relationship */
  Tbl_Roles: Array<Tbl_Roles>;
  /** An aggregate relationship */
  Tbl_Roles_aggregate: Tbl_Roles_Aggregate;
  /** fetch data from the table: "Tbl_Roles" using primary key columns */
  Tbl_Roles_by_pk?: Maybe<Tbl_Roles>;
  /** fetch data from the table: "Tbl_UserCompanyMapping" */
  Tbl_UserCompanyMapping: Array<Tbl_UserCompanyMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserCompanyMapping" */
  Tbl_UserCompanyMapping_aggregate: Tbl_UserCompanyMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserCompanyMapping" using primary key columns */
  Tbl_UserCompanyMapping_by_pk?: Maybe<Tbl_UserCompanyMapping>;
  /** fetch data from the table: "Tbl_UserLocationActivityMapping" */
  Tbl_UserLocationActivityMapping: Array<Tbl_UserLocationActivityMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserLocationActivityMapping" */
  Tbl_UserLocationActivityMapping_aggregate: Tbl_UserLocationActivityMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserLocationActivityMapping" using primary key columns */
  Tbl_UserLocationActivityMapping_by_pk?: Maybe<Tbl_UserLocationActivityMapping>;
  /** fetch data from the table: "Tbl_UserLoginLogs" */
  Tbl_UserLoginLogs: Array<Tbl_UserLoginLogs>;
  /** fetch aggregated fields from the table: "Tbl_UserLoginLogs" */
  Tbl_UserLoginLogs_aggregate: Tbl_UserLoginLogs_Aggregate;
  /** fetch data from the table: "Tbl_UserLoginLogs" using primary key columns */
  Tbl_UserLoginLogs_by_pk?: Maybe<Tbl_UserLoginLogs>;
  /** An array relationship */
  Tbl_UserPermissions: Array<Tbl_UserPermissions>;
  /** An aggregate relationship */
  Tbl_UserPermissions_aggregate: Tbl_UserPermissions_Aggregate;
  /** fetch data from the table: "Tbl_UserPermissions" using primary key columns */
  Tbl_UserPermissions_by_pk?: Maybe<Tbl_UserPermissions>;
  /** fetch data from the table: "Tbl_UserRoleMapping" */
  Tbl_UserRoleMapping: Array<Tbl_UserRoleMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserRoleMapping" */
  Tbl_UserRoleMapping_aggregate: Tbl_UserRoleMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserRoleMapping" using primary key columns */
  Tbl_UserRoleMapping_by_pk?: Maybe<Tbl_UserRoleMapping>;
  /** An array relationship */
  Tbl_UserSessions: Array<Tbl_UserSessions>;
  /** An aggregate relationship */
  Tbl_UserSessions_aggregate: Tbl_UserSessions_Aggregate;
  /** fetch data from the table: "Tbl_UserSessions" using primary key columns */
  Tbl_UserSessions_by_pk?: Maybe<Tbl_UserSessions>;
  /** fetch data from the table: "Tbl_UserStatusMaster" */
  Tbl_UserStatusMaster: Array<Tbl_UserStatusMaster>;
  /** fetch aggregated fields from the table: "Tbl_UserStatusMaster" */
  Tbl_UserStatusMaster_aggregate: Tbl_UserStatusMaster_Aggregate;
  /** fetch data from the table: "Tbl_UserStatusMaster" using primary key columns */
  Tbl_UserStatusMaster_by_pk?: Maybe<Tbl_UserStatusMaster>;
  /** fetch data from the table: "Tbl_Users" */
  Tbl_Users: Array<Tbl_Users>;
  /** fetch aggregated fields from the table: "Tbl_Users" */
  Tbl_Users_aggregate: Tbl_Users_Aggregate;
  /** fetch data from the table: "Tbl_Users" using primary key columns */
  Tbl_Users_by_pk?: Maybe<Tbl_Users>;
  /** An array relationship */
  Tbl_WarpForms: Array<Tbl_WarpForms>;
  /** An aggregate relationship */
  Tbl_WarpForms_aggregate: Tbl_WarpForms_Aggregate;
  /** fetch data from the table: "Tbl_WarpForms" using primary key columns */
  Tbl_WarpForms_by_pk?: Maybe<Tbl_WarpForms>;
  /** fetch data from the table: "master_policy_document" */
  master_policy_document: Array<Master_Policy_Document>;
  /** fetch aggregated fields from the table: "master_policy_document" */
  master_policy_document_aggregate: Master_Policy_Document_Aggregate;
  /** fetch data from the table: "master_policy_document" using primary key columns */
  master_policy_document_by_pk?: Maybe<Master_Policy_Document>;
  /** fetch data from the table: "tbl_oauthclients" */
  tbl_oauthclients: Array<Tbl_Oauthclients>;
  /** fetch aggregated fields from the table: "tbl_oauthclients" */
  tbl_oauthclients_aggregate: Tbl_Oauthclients_Aggregate;
  /** fetch data from the table: "tbl_oauthclients" using primary key columns */
  tbl_oauthclients_by_pk?: Maybe<Tbl_Oauthclients>;
  /** fetch data from the table: "view_last_user_login" */
  view_last_user_login: Array<View_Last_User_Login>;
  /** fetch aggregated fields from the table: "view_last_user_login" */
  view_last_user_login_aggregate: View_Last_User_Login_Aggregate;
};

export type Query_RootTbl_AddressesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

export type Query_RootTbl_Addresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

export type Query_RootTbl_Addresses_By_PkArgs = {
  AddressGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_AssessmentMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

export type Query_RootTbl_AssessmentMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

export type Query_RootTbl_AssessmentMapping_By_PkArgs = {
  AssessmentMappingGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_BusinessTypeMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

export type Query_RootTbl_BusinessTypeMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

export type Query_RootTbl_BusinessTypeMaster_By_PkArgs = {
  BusinessTypeGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompaniesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

export type Query_RootTbl_Companies_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

export type Query_RootTbl_Companies_By_PkArgs = {
  CompanyGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyBusinessTypeArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

export type Query_RootTbl_CompanyBusinessType_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

export type Query_RootTbl_CompanyBusinessType_By_PkArgs = {
  CompanyBusinessTypeGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyCountryArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

export type Query_RootTbl_CompanyCountry_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

export type Query_RootTbl_CompanyCountry_By_PkArgs = {
  CompanyCountryGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyDashboardMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

export type Query_RootTbl_CompanyDashboardMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

export type Query_RootTbl_CompanyDashboardMapping_By_PkArgs = {
  CompanyDashboardMappingGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyGeneralDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

export type Query_RootTbl_CompanyGeneralDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

export type Query_RootTbl_CompanyGeneralDetails_By_PkArgs = {
  CompanyGeneralDetailsGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyRoleMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

export type Query_RootTbl_CompanyRoleMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

export type Query_RootTbl_CompanyRoleMapping_By_PkArgs = {
  CompanyRoleMappingGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyStatusLogArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

export type Query_RootTbl_CompanyStatusLog_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

export type Query_RootTbl_CompanyStatusLog_By_PkArgs = {
  CompanyStatusLogGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CompanyStatusMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

export type Query_RootTbl_CompanyStatusMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

export type Query_RootTbl_CompanyStatusMaster_By_PkArgs = {
  CompanyStatusGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_CountryMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

export type Query_RootTbl_CountryMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

export type Query_RootTbl_CountryMaster_By_PkArgs = {
  CountryGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_EmailHeaderFooterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

export type Query_RootTbl_EmailHeaderFooter_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

export type Query_RootTbl_EmailHeaderFooter_By_PkArgs = {
  EmailHeaderFooterGUID: Scalars["uuid"]["input"];
};

export type Query_RootTbl_EmailTemplateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

export type Query_RootTbl_EmailTemplateNotificationDetailsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

export type Query_RootTbl_EmailTemplateNotificationDetails_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

export type Query_RootTbl_EmailTemplateNotificationDetails_By_PkArgs = {
  UserEmailTemplateNotificationGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_EmailTemplate_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

export type Query_RootTbl_EmailTemplate_By_PkArgs = {
  EmailTemplateGUID: Scalars["uuid"]["input"];
};

export type Query_RootTbl_GlobalSettingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_GlobalSettings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_GlobalSettings_Order_By>>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

export type Query_RootTbl_GlobalSettings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_GlobalSettings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_GlobalSettings_Order_By>>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

export type Query_RootTbl_GlobalSettings_By_PkArgs = {
  GlobalSettingsGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_LanguageResourcesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

export type Query_RootTbl_LanguageResources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

export type Query_RootTbl_LanguageResources_By_PkArgs = {
  LanguageResourceGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_OPsCompanyDbDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

export type Query_RootTbl_OPsCompanyDbDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

export type Query_RootTbl_OPsCompanyDbDetails_By_PkArgs = {
  OPsCompanyDBDetailsGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_PagesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Pages_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Pages_Order_By>>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

export type Query_RootTbl_Pages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Pages_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Pages_Order_By>>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

export type Query_RootTbl_Pages_By_PkArgs = {
  PageGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_PasswordManageMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PasswordManageMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PasswordManageMaster_Order_By>>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

export type Query_RootTbl_PasswordManageMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PasswordManageMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PasswordManageMaster_Order_By>>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

export type Query_RootTbl_PasswordManageMaster_By_PkArgs = {
  ChangePasswordGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_PermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

export type Query_RootTbl_Permissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

export type Query_RootTbl_Permissions_By_PkArgs = {
  PermissionGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_PowerBiReportDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PowerBiReportDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PowerBiReportDetails_Order_By>>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

export type Query_RootTbl_PowerBiReportDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PowerBiReportDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PowerBiReportDetails_Order_By>>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

export type Query_RootTbl_PowerBiReportDetails_By_PkArgs = {
  PowerBIGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_RolesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

export type Query_RootTbl_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

export type Query_RootTbl_Roles_By_PkArgs = {
  RoleGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserCompanyMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

export type Query_RootTbl_UserCompanyMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

export type Query_RootTbl_UserCompanyMapping_By_PkArgs = {
  UserCompanyMappingGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserLocationActivityMappingArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

export type Query_RootTbl_UserLocationActivityMapping_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

export type Query_RootTbl_UserLocationActivityMapping_By_PkArgs = {
  UserLocationActivityGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserLoginLogsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserLoginLogs_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLoginLogs_Order_By>>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

export type Query_RootTbl_UserLoginLogs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserLoginLogs_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLoginLogs_Order_By>>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

export type Query_RootTbl_UserLoginLogs_By_PkArgs = {
  UserLoginLogsGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserPermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

export type Query_RootTbl_UserPermissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

export type Query_RootTbl_UserPermissions_By_PkArgs = {
  UserPermissionGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserRoleMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

export type Query_RootTbl_UserRoleMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

export type Query_RootTbl_UserRoleMapping_By_PkArgs = {
  UserRoleMappingGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserSessionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

export type Query_RootTbl_UserSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

export type Query_RootTbl_UserSessions_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UserStatusMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

export type Query_RootTbl_UserStatusMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

export type Query_RootTbl_UserStatusMaster_By_PkArgs = {
  StatusGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_UsersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Users_Order_By>>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

export type Query_RootTbl_Users_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Users_Order_By>>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

export type Query_RootTbl_Users_By_PkArgs = {
  UserGuid: Scalars["uuid"]["input"];
};

export type Query_RootTbl_WarpFormsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

export type Query_RootTbl_WarpForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

export type Query_RootTbl_WarpForms_By_PkArgs = {
  WarpFormsGuid: Scalars["uuid"]["input"];
};

export type Query_RootMaster_Policy_DocumentArgs = {
  distinct_on?: InputMaybe<Array<Master_Policy_Document_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Master_Policy_Document_Order_By>>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

export type Query_RootMaster_Policy_Document_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Policy_Document_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Master_Policy_Document_Order_By>>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

export type Query_RootMaster_Policy_Document_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type Query_RootTbl_OauthclientsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Oauthclients_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Oauthclients_Order_By>>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

export type Query_RootTbl_Oauthclients_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Oauthclients_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Oauthclients_Order_By>>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

export type Query_RootTbl_Oauthclients_By_PkArgs = {
  oauthclientguid: Scalars["uuid"]["input"];
};

export type Query_RootView_Last_User_LoginArgs = {
  distinct_on?: InputMaybe<Array<View_Last_User_Login_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<View_Last_User_Login_Order_By>>;
  where?: InputMaybe<View_Last_User_Login_Bool_Exp>;
};

export type Query_RootView_Last_User_Login_AggregateArgs = {
  distinct_on?: InputMaybe<Array<View_Last_User_Login_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<View_Last_User_Login_Order_By>>;
  where?: InputMaybe<View_Last_User_Login_Bool_Exp>;
};

export type Subscription_Root = {
  __typename?: "subscription_root";
  /** An array relationship */
  Tbl_Addresses: Array<Tbl_Addresses>;
  /** An aggregate relationship */
  Tbl_Addresses_aggregate: Tbl_Addresses_Aggregate;
  /** fetch data from the table: "Tbl_Addresses" using primary key columns */
  Tbl_Addresses_by_pk?: Maybe<Tbl_Addresses>;
  /** fetch data from the table in a streaming manner: "Tbl_Addresses" */
  Tbl_Addresses_stream: Array<Tbl_Addresses>;
  /** fetch data from the table: "Tbl_AssessmentMapping" */
  Tbl_AssessmentMapping: Array<Tbl_AssessmentMapping>;
  /** fetch aggregated fields from the table: "Tbl_AssessmentMapping" */
  Tbl_AssessmentMapping_aggregate: Tbl_AssessmentMapping_Aggregate;
  /** fetch data from the table: "Tbl_AssessmentMapping" using primary key columns */
  Tbl_AssessmentMapping_by_pk?: Maybe<Tbl_AssessmentMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_AssessmentMapping" */
  Tbl_AssessmentMapping_stream: Array<Tbl_AssessmentMapping>;
  /** fetch data from the table: "Tbl_BusinessTypeMaster" */
  Tbl_BusinessTypeMaster: Array<Tbl_BusinessTypeMaster>;
  /** fetch aggregated fields from the table: "Tbl_BusinessTypeMaster" */
  Tbl_BusinessTypeMaster_aggregate: Tbl_BusinessTypeMaster_Aggregate;
  /** fetch data from the table: "Tbl_BusinessTypeMaster" using primary key columns */
  Tbl_BusinessTypeMaster_by_pk?: Maybe<Tbl_BusinessTypeMaster>;
  /** fetch data from the table in a streaming manner: "Tbl_BusinessTypeMaster" */
  Tbl_BusinessTypeMaster_stream: Array<Tbl_BusinessTypeMaster>;
  /** An array relationship */
  Tbl_Companies: Array<Tbl_Companies>;
  /** An aggregate relationship */
  Tbl_Companies_aggregate: Tbl_Companies_Aggregate;
  /** fetch data from the table: "Tbl_Companies" using primary key columns */
  Tbl_Companies_by_pk?: Maybe<Tbl_Companies>;
  /** fetch data from the table in a streaming manner: "Tbl_Companies" */
  Tbl_Companies_stream: Array<Tbl_Companies>;
  /** fetch data from the table: "Tbl_CompanyBusinessType" */
  Tbl_CompanyBusinessType: Array<Tbl_CompanyBusinessType>;
  /** fetch aggregated fields from the table: "Tbl_CompanyBusinessType" */
  Tbl_CompanyBusinessType_aggregate: Tbl_CompanyBusinessType_Aggregate;
  /** fetch data from the table: "Tbl_CompanyBusinessType" using primary key columns */
  Tbl_CompanyBusinessType_by_pk?: Maybe<Tbl_CompanyBusinessType>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyBusinessType" */
  Tbl_CompanyBusinessType_stream: Array<Tbl_CompanyBusinessType>;
  /** fetch data from the table: "Tbl_CompanyCountry" */
  Tbl_CompanyCountry: Array<Tbl_CompanyCountry>;
  /** fetch aggregated fields from the table: "Tbl_CompanyCountry" */
  Tbl_CompanyCountry_aggregate: Tbl_CompanyCountry_Aggregate;
  /** fetch data from the table: "Tbl_CompanyCountry" using primary key columns */
  Tbl_CompanyCountry_by_pk?: Maybe<Tbl_CompanyCountry>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyCountry" */
  Tbl_CompanyCountry_stream: Array<Tbl_CompanyCountry>;
  /** fetch data from the table: "Tbl_CompanyDashboardMapping" */
  Tbl_CompanyDashboardMapping: Array<Tbl_CompanyDashboardMapping>;
  /** fetch aggregated fields from the table: "Tbl_CompanyDashboardMapping" */
  Tbl_CompanyDashboardMapping_aggregate: Tbl_CompanyDashboardMapping_Aggregate;
  /** fetch data from the table: "Tbl_CompanyDashboardMapping" using primary key columns */
  Tbl_CompanyDashboardMapping_by_pk?: Maybe<Tbl_CompanyDashboardMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyDashboardMapping" */
  Tbl_CompanyDashboardMapping_stream: Array<Tbl_CompanyDashboardMapping>;
  /** An array relationship */
  Tbl_CompanyGeneralDetails: Array<Tbl_CompanyGeneralDetails>;
  /** An aggregate relationship */
  Tbl_CompanyGeneralDetails_aggregate: Tbl_CompanyGeneralDetails_Aggregate;
  /** fetch data from the table: "Tbl_CompanyGeneralDetails" using primary key columns */
  Tbl_CompanyGeneralDetails_by_pk?: Maybe<Tbl_CompanyGeneralDetails>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyGeneralDetails" */
  Tbl_CompanyGeneralDetails_stream: Array<Tbl_CompanyGeneralDetails>;
  /** fetch data from the table: "Tbl_CompanyRoleMapping" */
  Tbl_CompanyRoleMapping: Array<Tbl_CompanyRoleMapping>;
  /** fetch aggregated fields from the table: "Tbl_CompanyRoleMapping" */
  Tbl_CompanyRoleMapping_aggregate: Tbl_CompanyRoleMapping_Aggregate;
  /** fetch data from the table: "Tbl_CompanyRoleMapping" using primary key columns */
  Tbl_CompanyRoleMapping_by_pk?: Maybe<Tbl_CompanyRoleMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyRoleMapping" */
  Tbl_CompanyRoleMapping_stream: Array<Tbl_CompanyRoleMapping>;
  /** fetch data from the table: "Tbl_CompanyStatusLog" */
  Tbl_CompanyStatusLog: Array<Tbl_CompanyStatusLog>;
  /** fetch aggregated fields from the table: "Tbl_CompanyStatusLog" */
  Tbl_CompanyStatusLog_aggregate: Tbl_CompanyStatusLog_Aggregate;
  /** fetch data from the table: "Tbl_CompanyStatusLog" using primary key columns */
  Tbl_CompanyStatusLog_by_pk?: Maybe<Tbl_CompanyStatusLog>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyStatusLog" */
  Tbl_CompanyStatusLog_stream: Array<Tbl_CompanyStatusLog>;
  /** fetch data from the table: "Tbl_CompanyStatusMaster" */
  Tbl_CompanyStatusMaster: Array<Tbl_CompanyStatusMaster>;
  /** fetch aggregated fields from the table: "Tbl_CompanyStatusMaster" */
  Tbl_CompanyStatusMaster_aggregate: Tbl_CompanyStatusMaster_Aggregate;
  /** fetch data from the table: "Tbl_CompanyStatusMaster" using primary key columns */
  Tbl_CompanyStatusMaster_by_pk?: Maybe<Tbl_CompanyStatusMaster>;
  /** fetch data from the table in a streaming manner: "Tbl_CompanyStatusMaster" */
  Tbl_CompanyStatusMaster_stream: Array<Tbl_CompanyStatusMaster>;
  /** fetch data from the table: "Tbl_CountryMaster" */
  Tbl_CountryMaster: Array<Tbl_CountryMaster>;
  /** fetch aggregated fields from the table: "Tbl_CountryMaster" */
  Tbl_CountryMaster_aggregate: Tbl_CountryMaster_Aggregate;
  /** fetch data from the table: "Tbl_CountryMaster" using primary key columns */
  Tbl_CountryMaster_by_pk?: Maybe<Tbl_CountryMaster>;
  /** fetch data from the table in a streaming manner: "Tbl_CountryMaster" */
  Tbl_CountryMaster_stream: Array<Tbl_CountryMaster>;
  /** fetch data from the table: "Tbl_EmailHeaderFooter" */
  Tbl_EmailHeaderFooter: Array<Tbl_EmailHeaderFooter>;
  /** fetch aggregated fields from the table: "Tbl_EmailHeaderFooter" */
  Tbl_EmailHeaderFooter_aggregate: Tbl_EmailHeaderFooter_Aggregate;
  /** fetch data from the table: "Tbl_EmailHeaderFooter" using primary key columns */
  Tbl_EmailHeaderFooter_by_pk?: Maybe<Tbl_EmailHeaderFooter>;
  /** fetch data from the table in a streaming manner: "Tbl_EmailHeaderFooter" */
  Tbl_EmailHeaderFooter_stream: Array<Tbl_EmailHeaderFooter>;
  /** fetch data from the table: "Tbl_EmailTemplate" */
  Tbl_EmailTemplate: Array<Tbl_EmailTemplate>;
  /** An array relationship */
  Tbl_EmailTemplateNotificationDetails: Array<Tbl_EmailTemplateNotificationDetails>;
  /** An aggregate relationship */
  Tbl_EmailTemplateNotificationDetails_aggregate: Tbl_EmailTemplateNotificationDetails_Aggregate;
  /** fetch data from the table: "Tbl_EmailTemplateNotificationDetails" using primary key columns */
  Tbl_EmailTemplateNotificationDetails_by_pk?: Maybe<Tbl_EmailTemplateNotificationDetails>;
  /** fetch data from the table in a streaming manner: "Tbl_EmailTemplateNotificationDetails" */
  Tbl_EmailTemplateNotificationDetails_stream: Array<Tbl_EmailTemplateNotificationDetails>;
  /** fetch aggregated fields from the table: "Tbl_EmailTemplate" */
  Tbl_EmailTemplate_aggregate: Tbl_EmailTemplate_Aggregate;
  /** fetch data from the table: "Tbl_EmailTemplate" using primary key columns */
  Tbl_EmailTemplate_by_pk?: Maybe<Tbl_EmailTemplate>;
  /** fetch data from the table in a streaming manner: "Tbl_EmailTemplate" */
  Tbl_EmailTemplate_stream: Array<Tbl_EmailTemplate>;
  /** fetch data from the table: "Tbl_GlobalSettings" */
  Tbl_GlobalSettings: Array<Tbl_GlobalSettings>;
  /** fetch aggregated fields from the table: "Tbl_GlobalSettings" */
  Tbl_GlobalSettings_aggregate: Tbl_GlobalSettings_Aggregate;
  /** fetch data from the table: "Tbl_GlobalSettings" using primary key columns */
  Tbl_GlobalSettings_by_pk?: Maybe<Tbl_GlobalSettings>;
  /** fetch data from the table in a streaming manner: "Tbl_GlobalSettings" */
  Tbl_GlobalSettings_stream: Array<Tbl_GlobalSettings>;
  /** An array relationship */
  Tbl_LanguageResources: Array<Tbl_LanguageResources>;
  /** An aggregate relationship */
  Tbl_LanguageResources_aggregate: Tbl_LanguageResources_Aggregate;
  /** fetch data from the table: "Tbl_LanguageResources" using primary key columns */
  Tbl_LanguageResources_by_pk?: Maybe<Tbl_LanguageResources>;
  /** fetch data from the table in a streaming manner: "Tbl_LanguageResources" */
  Tbl_LanguageResources_stream: Array<Tbl_LanguageResources>;
  /** An array relationship */
  Tbl_OPsCompanyDBDetails: Array<Tbl_OPsCompanyDbDetails>;
  /** An aggregate relationship */
  Tbl_OPsCompanyDBDetails_aggregate: Tbl_OPsCompanyDbDetails_Aggregate;
  /** fetch data from the table: "Tbl_OPsCompanyDBDetails" using primary key columns */
  Tbl_OPsCompanyDBDetails_by_pk?: Maybe<Tbl_OPsCompanyDbDetails>;
  /** fetch data from the table in a streaming manner: "Tbl_OPsCompanyDBDetails" */
  Tbl_OPsCompanyDBDetails_stream: Array<Tbl_OPsCompanyDbDetails>;
  /** fetch data from the table: "Tbl_Pages" */
  Tbl_Pages: Array<Tbl_Pages>;
  /** fetch aggregated fields from the table: "Tbl_Pages" */
  Tbl_Pages_aggregate: Tbl_Pages_Aggregate;
  /** fetch data from the table: "Tbl_Pages" using primary key columns */
  Tbl_Pages_by_pk?: Maybe<Tbl_Pages>;
  /** fetch data from the table in a streaming manner: "Tbl_Pages" */
  Tbl_Pages_stream: Array<Tbl_Pages>;
  /** fetch data from the table: "Tbl_PasswordManageMaster" */
  Tbl_PasswordManageMaster: Array<Tbl_PasswordManageMaster>;
  /** fetch aggregated fields from the table: "Tbl_PasswordManageMaster" */
  Tbl_PasswordManageMaster_aggregate: Tbl_PasswordManageMaster_Aggregate;
  /** fetch data from the table: "Tbl_PasswordManageMaster" using primary key columns */
  Tbl_PasswordManageMaster_by_pk?: Maybe<Tbl_PasswordManageMaster>;
  /** fetch data from the table in a streaming manner: "Tbl_PasswordManageMaster" */
  Tbl_PasswordManageMaster_stream: Array<Tbl_PasswordManageMaster>;
  /** An array relationship */
  Tbl_Permissions: Array<Tbl_Permissions>;
  /** An aggregate relationship */
  Tbl_Permissions_aggregate: Tbl_Permissions_Aggregate;
  /** fetch data from the table: "Tbl_Permissions" using primary key columns */
  Tbl_Permissions_by_pk?: Maybe<Tbl_Permissions>;
  /** fetch data from the table in a streaming manner: "Tbl_Permissions" */
  Tbl_Permissions_stream: Array<Tbl_Permissions>;
  /** fetch data from the table: "Tbl_PowerBIReportDetails" */
  Tbl_PowerBIReportDetails: Array<Tbl_PowerBiReportDetails>;
  /** fetch aggregated fields from the table: "Tbl_PowerBIReportDetails" */
  Tbl_PowerBIReportDetails_aggregate: Tbl_PowerBiReportDetails_Aggregate;
  /** fetch data from the table: "Tbl_PowerBIReportDetails" using primary key columns */
  Tbl_PowerBIReportDetails_by_pk?: Maybe<Tbl_PowerBiReportDetails>;
  /** fetch data from the table in a streaming manner: "Tbl_PowerBIReportDetails" */
  Tbl_PowerBIReportDetails_stream: Array<Tbl_PowerBiReportDetails>;
  /** An array relationship */
  Tbl_Roles: Array<Tbl_Roles>;
  /** An aggregate relationship */
  Tbl_Roles_aggregate: Tbl_Roles_Aggregate;
  /** fetch data from the table: "Tbl_Roles" using primary key columns */
  Tbl_Roles_by_pk?: Maybe<Tbl_Roles>;
  /** fetch data from the table in a streaming manner: "Tbl_Roles" */
  Tbl_Roles_stream: Array<Tbl_Roles>;
  /** fetch data from the table: "Tbl_UserCompanyMapping" */
  Tbl_UserCompanyMapping: Array<Tbl_UserCompanyMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserCompanyMapping" */
  Tbl_UserCompanyMapping_aggregate: Tbl_UserCompanyMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserCompanyMapping" using primary key columns */
  Tbl_UserCompanyMapping_by_pk?: Maybe<Tbl_UserCompanyMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_UserCompanyMapping" */
  Tbl_UserCompanyMapping_stream: Array<Tbl_UserCompanyMapping>;
  /** fetch data from the table: "Tbl_UserLocationActivityMapping" */
  Tbl_UserLocationActivityMapping: Array<Tbl_UserLocationActivityMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserLocationActivityMapping" */
  Tbl_UserLocationActivityMapping_aggregate: Tbl_UserLocationActivityMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserLocationActivityMapping" using primary key columns */
  Tbl_UserLocationActivityMapping_by_pk?: Maybe<Tbl_UserLocationActivityMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_UserLocationActivityMapping" */
  Tbl_UserLocationActivityMapping_stream: Array<Tbl_UserLocationActivityMapping>;
  /** fetch data from the table: "Tbl_UserLoginLogs" */
  Tbl_UserLoginLogs: Array<Tbl_UserLoginLogs>;
  /** fetch aggregated fields from the table: "Tbl_UserLoginLogs" */
  Tbl_UserLoginLogs_aggregate: Tbl_UserLoginLogs_Aggregate;
  /** fetch data from the table: "Tbl_UserLoginLogs" using primary key columns */
  Tbl_UserLoginLogs_by_pk?: Maybe<Tbl_UserLoginLogs>;
  /** fetch data from the table in a streaming manner: "Tbl_UserLoginLogs" */
  Tbl_UserLoginLogs_stream: Array<Tbl_UserLoginLogs>;
  /** An array relationship */
  Tbl_UserPermissions: Array<Tbl_UserPermissions>;
  /** An aggregate relationship */
  Tbl_UserPermissions_aggregate: Tbl_UserPermissions_Aggregate;
  /** fetch data from the table: "Tbl_UserPermissions" using primary key columns */
  Tbl_UserPermissions_by_pk?: Maybe<Tbl_UserPermissions>;
  /** fetch data from the table in a streaming manner: "Tbl_UserPermissions" */
  Tbl_UserPermissions_stream: Array<Tbl_UserPermissions>;
  /** fetch data from the table: "Tbl_UserRoleMapping" */
  Tbl_UserRoleMapping: Array<Tbl_UserRoleMapping>;
  /** fetch aggregated fields from the table: "Tbl_UserRoleMapping" */
  Tbl_UserRoleMapping_aggregate: Tbl_UserRoleMapping_Aggregate;
  /** fetch data from the table: "Tbl_UserRoleMapping" using primary key columns */
  Tbl_UserRoleMapping_by_pk?: Maybe<Tbl_UserRoleMapping>;
  /** fetch data from the table in a streaming manner: "Tbl_UserRoleMapping" */
  Tbl_UserRoleMapping_stream: Array<Tbl_UserRoleMapping>;
  /** An array relationship */
  Tbl_UserSessions: Array<Tbl_UserSessions>;
  /** An aggregate relationship */
  Tbl_UserSessions_aggregate: Tbl_UserSessions_Aggregate;
  /** fetch data from the table: "Tbl_UserSessions" using primary key columns */
  Tbl_UserSessions_by_pk?: Maybe<Tbl_UserSessions>;
  /** fetch data from the table in a streaming manner: "Tbl_UserSessions" */
  Tbl_UserSessions_stream: Array<Tbl_UserSessions>;
  /** fetch data from the table: "Tbl_UserStatusMaster" */
  Tbl_UserStatusMaster: Array<Tbl_UserStatusMaster>;
  /** fetch aggregated fields from the table: "Tbl_UserStatusMaster" */
  Tbl_UserStatusMaster_aggregate: Tbl_UserStatusMaster_Aggregate;
  /** fetch data from the table: "Tbl_UserStatusMaster" using primary key columns */
  Tbl_UserStatusMaster_by_pk?: Maybe<Tbl_UserStatusMaster>;
  /** fetch data from the table in a streaming manner: "Tbl_UserStatusMaster" */
  Tbl_UserStatusMaster_stream: Array<Tbl_UserStatusMaster>;
  /** fetch data from the table: "Tbl_Users" */
  Tbl_Users: Array<Tbl_Users>;
  /** fetch aggregated fields from the table: "Tbl_Users" */
  Tbl_Users_aggregate: Tbl_Users_Aggregate;
  /** fetch data from the table: "Tbl_Users" using primary key columns */
  Tbl_Users_by_pk?: Maybe<Tbl_Users>;
  /** fetch data from the table in a streaming manner: "Tbl_Users" */
  Tbl_Users_stream: Array<Tbl_Users>;
  /** An array relationship */
  Tbl_WarpForms: Array<Tbl_WarpForms>;
  /** An aggregate relationship */
  Tbl_WarpForms_aggregate: Tbl_WarpForms_Aggregate;
  /** fetch data from the table: "Tbl_WarpForms" using primary key columns */
  Tbl_WarpForms_by_pk?: Maybe<Tbl_WarpForms>;
  /** fetch data from the table in a streaming manner: "Tbl_WarpForms" */
  Tbl_WarpForms_stream: Array<Tbl_WarpForms>;
  /** fetch data from the table: "master_policy_document" */
  master_policy_document: Array<Master_Policy_Document>;
  /** fetch aggregated fields from the table: "master_policy_document" */
  master_policy_document_aggregate: Master_Policy_Document_Aggregate;
  /** fetch data from the table: "master_policy_document" using primary key columns */
  master_policy_document_by_pk?: Maybe<Master_Policy_Document>;
  /** fetch data from the table in a streaming manner: "master_policy_document" */
  master_policy_document_stream: Array<Master_Policy_Document>;
  /** fetch data from the table: "tbl_oauthclients" */
  tbl_oauthclients: Array<Tbl_Oauthclients>;
  /** fetch aggregated fields from the table: "tbl_oauthclients" */
  tbl_oauthclients_aggregate: Tbl_Oauthclients_Aggregate;
  /** fetch data from the table: "tbl_oauthclients" using primary key columns */
  tbl_oauthclients_by_pk?: Maybe<Tbl_Oauthclients>;
  /** fetch data from the table in a streaming manner: "tbl_oauthclients" */
  tbl_oauthclients_stream: Array<Tbl_Oauthclients>;
  /** fetch data from the table: "view_last_user_login" */
  view_last_user_login: Array<View_Last_User_Login>;
  /** fetch aggregated fields from the table: "view_last_user_login" */
  view_last_user_login_aggregate: View_Last_User_Login_Aggregate;
  /** fetch data from the table in a streaming manner: "view_last_user_login" */
  view_last_user_login_stream: Array<View_Last_User_Login>;
};

export type Subscription_RootTbl_AddressesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

export type Subscription_RootTbl_Addresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Addresses_Order_By>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

export type Subscription_RootTbl_Addresses_By_PkArgs = {
  AddressGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Addresses_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Addresses_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Addresses_Bool_Exp>;
};

export type Subscription_RootTbl_AssessmentMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

export type Subscription_RootTbl_AssessmentMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_AssessmentMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_AssessmentMapping_Order_By>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

export type Subscription_RootTbl_AssessmentMapping_By_PkArgs = {
  AssessmentMappingGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_AssessmentMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_AssessmentMapping_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_AssessmentMapping_Bool_Exp>;
};

export type Subscription_RootTbl_BusinessTypeMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

export type Subscription_RootTbl_BusinessTypeMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_BusinessTypeMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_BusinessTypeMaster_Order_By>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

export type Subscription_RootTbl_BusinessTypeMaster_By_PkArgs = {
  BusinessTypeGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_BusinessTypeMaster_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_BusinessTypeMaster_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_BusinessTypeMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CompaniesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

export type Subscription_RootTbl_Companies_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Companies_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Companies_Order_By>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

export type Subscription_RootTbl_Companies_By_PkArgs = {
  CompanyGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Companies_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Companies_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Companies_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyBusinessTypeArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyBusinessType_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyBusinessType_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyBusinessType_Order_By>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyBusinessType_By_PkArgs = {
  CompanyBusinessTypeGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyBusinessType_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyBusinessType_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyBusinessType_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyCountryArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyCountry_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyCountry_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyCountry_Order_By>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyCountry_By_PkArgs = {
  CompanyCountryGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyCountry_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyCountry_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyCountry_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyDashboardMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyDashboardMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyDashboardMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyDashboardMapping_By_PkArgs = {
  CompanyDashboardMappingGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyDashboardMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyDashboardMapping_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyDashboardMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyGeneralDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyGeneralDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyGeneralDetails_Order_By>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyGeneralDetails_By_PkArgs = {
  CompanyGeneralDetailsGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyGeneralDetails_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyGeneralDetails_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyGeneralDetails_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyRoleMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyRoleMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyRoleMapping_By_PkArgs = {
  CompanyRoleMappingGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyRoleMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyRoleMapping_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusLogArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusLog_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusLog_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusLog_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusLog_By_PkArgs = {
  CompanyStatusLogGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyStatusLog_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyStatusLog_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyStatusLog_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CompanyStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CompanyStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CompanyStatusMaster_By_PkArgs = {
  CompanyStatusGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CompanyStatusMaster_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CompanyStatusMaster_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CompanyStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CountryMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CountryMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_CountryMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_CountryMaster_Order_By>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

export type Subscription_RootTbl_CountryMaster_By_PkArgs = {
  CountryGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_CountryMaster_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_CountryMaster_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_CountryMaster_Bool_Exp>;
};

export type Subscription_RootTbl_EmailHeaderFooterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

export type Subscription_RootTbl_EmailHeaderFooter_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailHeaderFooter_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailHeaderFooter_Order_By>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

export type Subscription_RootTbl_EmailHeaderFooter_By_PkArgs = {
  EmailHeaderFooterGUID: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_EmailHeaderFooter_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_EmailHeaderFooter_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_EmailHeaderFooter_Bool_Exp>;
};

export type Subscription_RootTbl_EmailTemplateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

export type Subscription_RootTbl_EmailTemplateNotificationDetailsArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

export type Subscription_RootTbl_EmailTemplateNotificationDetails_AggregateArgs =
  {
    distinct_on?: InputMaybe<
      Array<Tbl_EmailTemplateNotificationDetails_Select_Column>
    >;
    limit?: InputMaybe<Scalars["Int"]["input"]>;
    offset?: InputMaybe<Scalars["Int"]["input"]>;
    order_by?: InputMaybe<Array<Tbl_EmailTemplateNotificationDetails_Order_By>>;
    where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
  };

export type Subscription_RootTbl_EmailTemplateNotificationDetails_By_PkArgs = {
  UserEmailTemplateNotificationGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_EmailTemplateNotificationDetails_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<
    InputMaybe<Tbl_EmailTemplateNotificationDetails_Stream_Cursor_Input>
  >;
  where?: InputMaybe<Tbl_EmailTemplateNotificationDetails_Bool_Exp>;
};

export type Subscription_RootTbl_EmailTemplate_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_EmailTemplate_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_EmailTemplate_Order_By>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

export type Subscription_RootTbl_EmailTemplate_By_PkArgs = {
  EmailTemplateGUID: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_EmailTemplate_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_EmailTemplate_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_EmailTemplate_Bool_Exp>;
};

export type Subscription_RootTbl_GlobalSettingsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_GlobalSettings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_GlobalSettings_Order_By>>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

export type Subscription_RootTbl_GlobalSettings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_GlobalSettings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_GlobalSettings_Order_By>>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

export type Subscription_RootTbl_GlobalSettings_By_PkArgs = {
  GlobalSettingsGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_GlobalSettings_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_GlobalSettings_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_GlobalSettings_Bool_Exp>;
};

export type Subscription_RootTbl_LanguageResourcesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

export type Subscription_RootTbl_LanguageResources_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_LanguageResources_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_LanguageResources_Order_By>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

export type Subscription_RootTbl_LanguageResources_By_PkArgs = {
  LanguageResourceGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_LanguageResources_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_LanguageResources_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_LanguageResources_Bool_Exp>;
};

export type Subscription_RootTbl_OPsCompanyDbDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

export type Subscription_RootTbl_OPsCompanyDbDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_OPsCompanyDbDetails_Order_By>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

export type Subscription_RootTbl_OPsCompanyDbDetails_By_PkArgs = {
  OPsCompanyDBDetailsGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_OPsCompanyDbDetails_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_OPsCompanyDbDetails_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_OPsCompanyDbDetails_Bool_Exp>;
};

export type Subscription_RootTbl_PagesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Pages_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Pages_Order_By>>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

export type Subscription_RootTbl_Pages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Pages_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Pages_Order_By>>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

export type Subscription_RootTbl_Pages_By_PkArgs = {
  PageGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Pages_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Pages_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Pages_Bool_Exp>;
};

export type Subscription_RootTbl_PasswordManageMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PasswordManageMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PasswordManageMaster_Order_By>>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

export type Subscription_RootTbl_PasswordManageMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PasswordManageMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PasswordManageMaster_Order_By>>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

export type Subscription_RootTbl_PasswordManageMaster_By_PkArgs = {
  ChangePasswordGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_PasswordManageMaster_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_PasswordManageMaster_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_PasswordManageMaster_Bool_Exp>;
};

export type Subscription_RootTbl_PermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

export type Subscription_RootTbl_Permissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Permissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Permissions_Order_By>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

export type Subscription_RootTbl_Permissions_By_PkArgs = {
  PermissionGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Permissions_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Permissions_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Permissions_Bool_Exp>;
};

export type Subscription_RootTbl_PowerBiReportDetailsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PowerBiReportDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PowerBiReportDetails_Order_By>>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

export type Subscription_RootTbl_PowerBiReportDetails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_PowerBiReportDetails_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_PowerBiReportDetails_Order_By>>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

export type Subscription_RootTbl_PowerBiReportDetails_By_PkArgs = {
  PowerBIGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_PowerBiReportDetails_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_PowerBiReportDetails_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_PowerBiReportDetails_Bool_Exp>;
};

export type Subscription_RootTbl_RolesArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

export type Subscription_RootTbl_Roles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Roles_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Roles_Order_By>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

export type Subscription_RootTbl_Roles_By_PkArgs = {
  RoleGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Roles_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Roles_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Roles_Bool_Exp>;
};

export type Subscription_RootTbl_UserCompanyMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserCompanyMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserCompanyMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserCompanyMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserCompanyMapping_By_PkArgs = {
  UserCompanyMappingGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserCompanyMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserCompanyMapping_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserCompanyMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserLocationActivityMappingArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserLocationActivityMapping_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Tbl_UserLocationActivityMapping_Select_Column>
  >;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLocationActivityMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserLocationActivityMapping_By_PkArgs = {
  UserLocationActivityGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserLocationActivityMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<
    InputMaybe<Tbl_UserLocationActivityMapping_Stream_Cursor_Input>
  >;
  where?: InputMaybe<Tbl_UserLocationActivityMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserLoginLogsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserLoginLogs_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLoginLogs_Order_By>>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

export type Subscription_RootTbl_UserLoginLogs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserLoginLogs_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserLoginLogs_Order_By>>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

export type Subscription_RootTbl_UserLoginLogs_By_PkArgs = {
  UserLoginLogsGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserLoginLogs_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserLoginLogs_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserLoginLogs_Bool_Exp>;
};

export type Subscription_RootTbl_UserPermissionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

export type Subscription_RootTbl_UserPermissions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserPermissions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserPermissions_Order_By>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

export type Subscription_RootTbl_UserPermissions_By_PkArgs = {
  UserPermissionGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserPermissions_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserPermissions_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserPermissions_Bool_Exp>;
};

export type Subscription_RootTbl_UserRoleMappingArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserRoleMapping_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserRoleMapping_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserRoleMapping_Order_By>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserRoleMapping_By_PkArgs = {
  UserRoleMappingGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserRoleMapping_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserRoleMapping_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserRoleMapping_Bool_Exp>;
};

export type Subscription_RootTbl_UserSessionsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

export type Subscription_RootTbl_UserSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserSessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserSessions_Order_By>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

export type Subscription_RootTbl_UserSessions_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserSessions_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserSessions_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserSessions_Bool_Exp>;
};

export type Subscription_RootTbl_UserStatusMasterArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_UserStatusMaster_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_UserStatusMaster_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_UserStatusMaster_Order_By>>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_UserStatusMaster_By_PkArgs = {
  StatusGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_UserStatusMaster_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_UserStatusMaster_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_UserStatusMaster_Bool_Exp>;
};

export type Subscription_RootTbl_UsersArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Users_Order_By>>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

export type Subscription_RootTbl_Users_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Users_Order_By>>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

export type Subscription_RootTbl_Users_By_PkArgs = {
  UserGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Users_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Users_Bool_Exp>;
};

export type Subscription_RootTbl_WarpFormsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

export type Subscription_RootTbl_WarpForms_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_WarpForms_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_WarpForms_Order_By>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

export type Subscription_RootTbl_WarpForms_By_PkArgs = {
  WarpFormsGuid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_WarpForms_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_WarpForms_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_WarpForms_Bool_Exp>;
};

export type Subscription_RootMaster_Policy_DocumentArgs = {
  distinct_on?: InputMaybe<Array<Master_Policy_Document_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Master_Policy_Document_Order_By>>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

export type Subscription_RootMaster_Policy_Document_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Master_Policy_Document_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Master_Policy_Document_Order_By>>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

export type Subscription_RootMaster_Policy_Document_By_PkArgs = {
  id: Scalars["Int"]["input"];
};

export type Subscription_RootMaster_Policy_Document_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Master_Policy_Document_Stream_Cursor_Input>>;
  where?: InputMaybe<Master_Policy_Document_Bool_Exp>;
};

export type Subscription_RootTbl_OauthclientsArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Oauthclients_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Oauthclients_Order_By>>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

export type Subscription_RootTbl_Oauthclients_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tbl_Oauthclients_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Tbl_Oauthclients_Order_By>>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

export type Subscription_RootTbl_Oauthclients_By_PkArgs = {
  oauthclientguid: Scalars["uuid"]["input"];
};

export type Subscription_RootTbl_Oauthclients_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Tbl_Oauthclients_Stream_Cursor_Input>>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

export type Subscription_RootView_Last_User_LoginArgs = {
  distinct_on?: InputMaybe<Array<View_Last_User_Login_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<View_Last_User_Login_Order_By>>;
  where?: InputMaybe<View_Last_User_Login_Bool_Exp>;
};

export type Subscription_RootView_Last_User_Login_AggregateArgs = {
  distinct_on?: InputMaybe<Array<View_Last_User_Login_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<View_Last_User_Login_Order_By>>;
  where?: InputMaybe<View_Last_User_Login_Bool_Exp>;
};

export type Subscription_RootView_Last_User_Login_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<View_Last_User_Login_Stream_Cursor_Input>>;
  where?: InputMaybe<View_Last_User_Login_Bool_Exp>;
};

/** columns and relationships of "tbl_oauthclients" */
export type Tbl_Oauthclients = {
  __typename?: "tbl_oauthclients";
  clientid?: Maybe<Scalars["String"]["output"]>;
  clientsecrete?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  isactive?: Maybe<Scalars["Boolean"]["output"]>;
  oauthclientguid: Scalars["uuid"]["output"];
  servicename?: Maybe<Scalars["String"]["output"]>;
};

/** aggregated selection of "tbl_oauthclients" */
export type Tbl_Oauthclients_Aggregate = {
  __typename?: "tbl_oauthclients_aggregate";
  aggregate?: Maybe<Tbl_Oauthclients_Aggregate_Fields>;
  nodes: Array<Tbl_Oauthclients>;
};

/** aggregate fields of "tbl_oauthclients" */
export type Tbl_Oauthclients_Aggregate_Fields = {
  __typename?: "tbl_oauthclients_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Tbl_Oauthclients_Max_Fields>;
  min?: Maybe<Tbl_Oauthclients_Min_Fields>;
};

/** aggregate fields of "tbl_oauthclients" */
export type Tbl_Oauthclients_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tbl_Oauthclients_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "tbl_oauthclients". All fields are combined with a logical 'AND'. */
export type Tbl_Oauthclients_Bool_Exp = {
  _and?: InputMaybe<Array<Tbl_Oauthclients_Bool_Exp>>;
  _not?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
  _or?: InputMaybe<Array<Tbl_Oauthclients_Bool_Exp>>;
  clientid?: InputMaybe<String_Comparison_Exp>;
  clientsecrete?: InputMaybe<String_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  isactive?: InputMaybe<Boolean_Comparison_Exp>;
  oauthclientguid?: InputMaybe<Uuid_Comparison_Exp>;
  servicename?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "tbl_oauthclients" */
export enum Tbl_Oauthclients_Constraint {
  /** unique or primary key constraint on columns "oauthclientguid" */
  PkTblOauthclients = "pk_tbl_oauthclients"
}

/** input type for inserting data into table "tbl_oauthclients" */
export type Tbl_Oauthclients_Insert_Input = {
  clientid?: InputMaybe<Scalars["String"]["input"]>;
  clientsecrete?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isactive?: InputMaybe<Scalars["Boolean"]["input"]>;
  oauthclientguid?: InputMaybe<Scalars["uuid"]["input"]>;
  servicename?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Tbl_Oauthclients_Max_Fields = {
  __typename?: "tbl_oauthclients_max_fields";
  clientid?: Maybe<Scalars["String"]["output"]>;
  clientsecrete?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  oauthclientguid?: Maybe<Scalars["uuid"]["output"]>;
  servicename?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Tbl_Oauthclients_Min_Fields = {
  __typename?: "tbl_oauthclients_min_fields";
  clientid?: Maybe<Scalars["String"]["output"]>;
  clientsecrete?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  oauthclientguid?: Maybe<Scalars["uuid"]["output"]>;
  servicename?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "tbl_oauthclients" */
export type Tbl_Oauthclients_Mutation_Response = {
  __typename?: "tbl_oauthclients_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Tbl_Oauthclients>;
};

/** on_conflict condition type for table "tbl_oauthclients" */
export type Tbl_Oauthclients_On_Conflict = {
  constraint: Tbl_Oauthclients_Constraint;
  update_columns?: Array<Tbl_Oauthclients_Update_Column>;
  where?: InputMaybe<Tbl_Oauthclients_Bool_Exp>;
};

/** Ordering options when selecting data from "tbl_oauthclients". */
export type Tbl_Oauthclients_Order_By = {
  clientid?: InputMaybe<Order_By>;
  clientsecrete?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  isactive?: InputMaybe<Order_By>;
  oauthclientguid?: InputMaybe<Order_By>;
  servicename?: InputMaybe<Order_By>;
};

/** primary key columns input for table: tbl_oauthclients */
export type Tbl_Oauthclients_Pk_Columns_Input = {
  oauthclientguid: Scalars["uuid"]["input"];
};

/** select columns of table "tbl_oauthclients" */
export enum Tbl_Oauthclients_Select_Column {
  /** column name */
  Clientid = "clientid",
  /** column name */
  Clientsecrete = "clientsecrete",
  /** column name */
  Description = "description",
  /** column name */
  Isactive = "isactive",
  /** column name */
  Oauthclientguid = "oauthclientguid",
  /** column name */
  Servicename = "servicename"
}

/** input type for updating data in table "tbl_oauthclients" */
export type Tbl_Oauthclients_Set_Input = {
  clientid?: InputMaybe<Scalars["String"]["input"]>;
  clientsecrete?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isactive?: InputMaybe<Scalars["Boolean"]["input"]>;
  oauthclientguid?: InputMaybe<Scalars["uuid"]["input"]>;
  servicename?: InputMaybe<Scalars["String"]["input"]>;
};

/** Streaming cursor of the table "tbl_oauthclients" */
export type Tbl_Oauthclients_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tbl_Oauthclients_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tbl_Oauthclients_Stream_Cursor_Value_Input = {
  clientid?: InputMaybe<Scalars["String"]["input"]>;
  clientsecrete?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isactive?: InputMaybe<Scalars["Boolean"]["input"]>;
  oauthclientguid?: InputMaybe<Scalars["uuid"]["input"]>;
  servicename?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "tbl_oauthclients" */
export enum Tbl_Oauthclients_Update_Column {
  /** column name */
  Clientid = "clientid",
  /** column name */
  Clientsecrete = "clientsecrete",
  /** column name */
  Description = "description",
  /** column name */
  Isactive = "isactive",
  /** column name */
  Oauthclientguid = "oauthclientguid",
  /** column name */
  Servicename = "servicename"
}

export type Tbl_Oauthclients_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tbl_Oauthclients_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tbl_Oauthclients_Bool_Exp;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["timestamp"]["input"]>;
  _gt?: InputMaybe<Scalars["timestamp"]["input"]>;
  _gte?: InputMaybe<Scalars["timestamp"]["input"]>;
  _in?: InputMaybe<Array<Scalars["timestamp"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["timestamp"]["input"]>;
  _lte?: InputMaybe<Scalars["timestamp"]["input"]>;
  _neq?: InputMaybe<Scalars["timestamp"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["timestamp"]["input"]>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _in?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _lte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _neq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["uuid"]["input"]>;
  _gt?: InputMaybe<Scalars["uuid"]["input"]>;
  _gte?: InputMaybe<Scalars["uuid"]["input"]>;
  _in?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["uuid"]["input"]>;
  _lte?: InputMaybe<Scalars["uuid"]["input"]>;
  _neq?: InputMaybe<Scalars["uuid"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
};

/** columns and relationships of "view_last_user_login" */
export type View_Last_User_Login = {
  __typename?: "view_last_user_login";
  login_timestamp?: Maybe<Scalars["timestamp"]["output"]>;
  op_organizaion_id?: Maybe<Scalars["String"]["output"]>;
  op_user_id?: Maybe<Scalars["String"]["output"]>;
};

/** aggregated selection of "view_last_user_login" */
export type View_Last_User_Login_Aggregate = {
  __typename?: "view_last_user_login_aggregate";
  aggregate?: Maybe<View_Last_User_Login_Aggregate_Fields>;
  nodes: Array<View_Last_User_Login>;
};

/** aggregate fields of "view_last_user_login" */
export type View_Last_User_Login_Aggregate_Fields = {
  __typename?: "view_last_user_login_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<View_Last_User_Login_Max_Fields>;
  min?: Maybe<View_Last_User_Login_Min_Fields>;
};

/** aggregate fields of "view_last_user_login" */
export type View_Last_User_Login_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<View_Last_User_Login_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "view_last_user_login". All fields are combined with a logical 'AND'. */
export type View_Last_User_Login_Bool_Exp = {
  _and?: InputMaybe<Array<View_Last_User_Login_Bool_Exp>>;
  _not?: InputMaybe<View_Last_User_Login_Bool_Exp>;
  _or?: InputMaybe<Array<View_Last_User_Login_Bool_Exp>>;
  login_timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  op_organizaion_id?: InputMaybe<String_Comparison_Exp>;
  op_user_id?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type View_Last_User_Login_Max_Fields = {
  __typename?: "view_last_user_login_max_fields";
  login_timestamp?: Maybe<Scalars["timestamp"]["output"]>;
  op_organizaion_id?: Maybe<Scalars["String"]["output"]>;
  op_user_id?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type View_Last_User_Login_Min_Fields = {
  __typename?: "view_last_user_login_min_fields";
  login_timestamp?: Maybe<Scalars["timestamp"]["output"]>;
  op_organizaion_id?: Maybe<Scalars["String"]["output"]>;
  op_user_id?: Maybe<Scalars["String"]["output"]>;
};

/** Ordering options when selecting data from "view_last_user_login". */
export type View_Last_User_Login_Order_By = {
  login_timestamp?: InputMaybe<Order_By>;
  op_organizaion_id?: InputMaybe<Order_By>;
  op_user_id?: InputMaybe<Order_By>;
};

/** select columns of table "view_last_user_login" */
export enum View_Last_User_Login_Select_Column {
  /** column name */
  LoginTimestamp = "login_timestamp",
  /** column name */
  OpOrganizaionId = "op_organizaion_id",
  /** column name */
  OpUserId = "op_user_id"
}

/** Streaming cursor of the table "view_last_user_login" */
export type View_Last_User_Login_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: View_Last_User_Login_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type View_Last_User_Login_Stream_Cursor_Value_Input = {
  login_timestamp?: InputMaybe<Scalars["timestamp"]["input"]>;
  op_organizaion_id?: InputMaybe<Scalars["String"]["input"]>;
  op_user_id?: InputMaybe<Scalars["String"]["input"]>;
};
