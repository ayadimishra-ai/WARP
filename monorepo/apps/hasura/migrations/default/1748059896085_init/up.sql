SET check_function_bodies = false;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE TABLE public."AIBulkDocumentProcessing" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formInvitationId" uuid NOT NULL,
    "processedDocuments" jsonb,
    "requestStatus" text DEFAULT 'Pending'::text NOT NULL,
    "emailSendAt" timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Activity" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    parent_code text
);
CREATE TABLE public."ActivityMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid,
    master_key text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false,
    master_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ActivityTaskRequest" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_id uuid NOT NULL,
    status text,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    task_request_id uuid NOT NULL
);
CREATE TABLE public."AddressDistance" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    from_address_id uuid NOT NULL,
    from_address_latitude numeric(18,8) NOT NULL,
    from_address_longitude numeric(18,8) NOT NULL,
    to_address_id uuid NOT NULL,
    to_address_latitude numeric(18,8) NOT NULL,
    to_address_longitude numeric(18,8) NOT NULL,
    distance numeric(18,6) NOT NULL,
    uom text NOT NULL,
    mode_of_transport text,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL
);
CREATE TABLE public."AddressType" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "AddressTypeName" text NOT NULL,
    "IsManufacturing" boolean NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Addresses" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text,
    client_master_id text,
    full_address text NOT NULL,
    pincode text NOT NULL,
    country_id uuid NOT NULL,
    state_id uuid NOT NULL,
    city_id uuid NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    ownership_type text NOT NULL,
    facility_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    latitude numeric(18,8),
    longitude numeric(18,8),
    "addressLine2" text,
    "addressLine3" text,
    "isDefault" boolean DEFAULT false,
    "gstNumber" text
);
CREATE TABLE public."Answer" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "questionId" uuid NOT NULL,
    data jsonb NOT NULL,
    "submissionId" uuid,
    created_by uuid,
    updated_by uuid,
    status text DEFAULT 'Draft'::text,
    "formFieldId" uuid
);
CREATE TABLE public."AnswerFile" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "sizeInBytes" text NOT NULL,
    provider text NOT NULL,
    path text NOT NULL,
    "answerId" uuid NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."AppGlobalMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    data jsonb NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    type text NOT NULL,
    sub_type text,
    "platformId" uuid NOT NULL
);
CREATE TABLE public."AppRole" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_role_id uuid,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."AppUser" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    organization_id uuid NOT NULL,
    role text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "emailVerified" timestamp with time zone,
    phone text,
    "phoneVerified" timestamp with time zone,
    image text,
    details jsonb,
    "isActive" boolean DEFAULT true,
    "IsPasswordReset" boolean DEFAULT false,
    "isEmailSubscribed" boolean DEFAULT false
);
CREATE TABLE public."AssesseeUserMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "parentCompanyMappingId" uuid,
    "userId" uuid,
    "parentUserId" uuid,
    "questionId" uuid,
    "formFieldId" uuid,
    "formId" uuid,
    "reviewerUserId" uuid,
    "InvitationId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    "IsActive" boolean DEFAULT true,
    "roleId" uuid,
    "Status" text
);
CREATE TABLE public."AssessorConsultantMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    "consultantCompanyId" uuid,
    "assessorCompanyId" uuid,
    "formId" uuid NOT NULL,
    "isActive" boolean NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."CO2EmissionFactorMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    region uuid,
    category text,
    activity text,
    sub_activity text,
    type text,
    sub_type text,
    configuration text,
    fuel_type text,
    factor double precision NOT NULL,
    factor_uom text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    "group" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."City" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    state_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."CompanyForm" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "companyId" uuid NOT NULL,
    "formId" uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."CompanyFormFundtype" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "vcCompanyId" uuid,
    "companyId" uuid NOT NULL,
    "formId" uuid NOT NULL,
    "invitedBy" uuid NOT NULL,
    "fundType" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Country" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    region_code text,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."DataImportHistory" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid,
    import_method text NOT NULL,
    file_name text,
    file_url text,
    status text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    file_metadata jsonb,
    metadata jsonb,
    status_data jsonb,
    activity_code text
);
CREATE TABLE public."ESGBoardComposition" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    director_category text NOT NULL,
    number_of_male_directors numeric NOT NULL,
    number_of_female_directors numeric NOT NULL,
    number_of_other_gender_directors numeric,
    number_of_minority_group_directors numeric,
    number_of_directors_under_30 numeric,
    number_of_directors_from_30_to_50 numeric,
    number_of_directors_above_50 numeric,
    is_the_board_chair_independent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGCSR" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    project_name text NOT NULL,
    theme_of_the_project text NOT NULL,
    number_of_direct_beneficiaries numeric,
    target_beneficiary_group text,
    related_sdgs text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    annual_spend_on_the_project numeric,
    target_set numeric,
    target_achieved numeric
);
CREATE TABLE public."ESGEmployeeDiversity" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    employee_category text NOT NULL,
    male_employees numeric NOT NULL,
    female_employees numeric NOT NULL,
    other_gender_employees numeric,
    minority_group_employees numeric,
    employees_with_disabilities numeric,
    under_thirty_years_old numeric,
    thirty_to_fifty_years_old numeric,
    above_fifty_years_old numeric,
    average_basic_salary_male double precision,
    average_basic_salary_female double precision,
    average_remuneration_male double precision,
    average_remuneration_female double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGEmployeeTurnover" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    employee_category text NOT NULL,
    total_employees integer NOT NULL,
    new_hires numeric NOT NULL,
    exits numeric NOT NULL,
    number_of_voluntary_exits numeric,
    number_of_non_voluntary_exits numeric,
    average_tenure_of_exiting_employees numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGGovernance" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    number_of_whistleblower_cases_reported numeric,
    number_of_whistleblower_cases_resolved numeric,
    number_of_confirmed_corruption_incidents numeric,
    number_of_ethics_violations_reported numeric,
    number_of_ethics_violations_resolved numeric,
    number_of_regulatory_fines numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at time with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGGrievances" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    grievance_category text,
    stakeholder_category text,
    total_number_of_complaints numeric,
    new_complaints numeric,
    complaints_resolved numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGHealthAndSafety" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    workforce_category text,
    total_workforce_covered double precision,
    total_hours_worked double precision,
    fatalities double precision,
    high_consequence_work_related_injuries double precision,
    recordable_work_related_injuries double precision,
    lost_time_injuries double precision,
    near_misses_reported double precision,
    lost_workdays_due_to_injury double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ESGTrainingHours" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    employee_category text NOT NULL,
    total_employees numeric NOT NULL,
    number_of_employees_trained numeric NOT NULL,
    total_training_hours numeric NOT NULL,
    training_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL,
    percentage_employees_certified double precision
);
CREATE TABLE public."EmailConfiguration" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    host text NOT NULL,
    port integer NOT NULL,
    "isSecure" boolean NOT NULL,
    "user" text NOT NULL,
    password text NOT NULL,
    "platformId" uuid NOT NULL,
    "fromEmail" text NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."EmailNotifications" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "emailId" text NOT NULL,
    subject text NOT NULL,
    "invitationId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "mailBody" text,
    status text DEFAULT 'pending'::text,
    error text,
    "ccEmailId" text,
    "configData" jsonb,
    "ccEmails" jsonb,
    "bccEmailId" text,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."EmailTemplate" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "platformId" uuid NOT NULL,
    type text NOT NULL,
    template text NOT NULL,
    subject text,
    "ccEmails" text[],
    "companyId" uuid,
    "formId" uuid,
    "bccEmails" text,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Form" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    tags text[],
    calc json,
    "isDelegateQuestion" boolean,
    "isAIDataPointsAdded" boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FormDetails" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formId" uuid NOT NULL,
    framework text,
    "focusArea" jsonb,
    "timeInMinutes" integer,
    "bodyTemplate" text,
    notes jsonb,
    industry jsonb DEFAULT '[]'::jsonb,
    questions integer DEFAULT 0,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FormField" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    field text NOT NULL,
    type text NOT NULL,
    "fieldOptions" jsonb NOT NULL,
    interface text NOT NULL,
    "interfaceOptions" jsonb,
    display jsonb,
    "displayOptions" jsonb,
    "displayRules" jsonb,
    "validationRules" jsonb,
    "seqIndex" integer NOT NULL,
    "groupField" text NOT NULL,
    "formId" uuid NOT NULL,
    "sectionId" uuid,
    "questionId" uuid,
    tags text[],
    "autoCalculatedCalculation" jsonb,
    subtheme text,
    "recommendationCalc" jsonb,
    "warningRules" jsonb,
    "dataPoint" text,
    "generatedQuestions" text,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FormInvitation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email text NOT NULL,
    "companyId" uuid,
    "formId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    status text,
    created_by uuid,
    updated_by uuid,
    "durationFrom" date,
    "durationTo" date,
    "parentcompanyId" uuid,
    "ParentCompanyMappingId" uuid,
    "interimCheck" jsonb DEFAULT '{"isCarryForward": false, "isRecommendationIcon": false}'::jsonb,
    completion text,
    "isDataCurationSkipped" boolean DEFAULT false
);
CREATE TABLE public."FormResult" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "submissionId" uuid NOT NULL,
    "sectionId" uuid,
    "questionId" uuid,
    score numeric(10,2) DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    recommendations jsonb,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FormSubmission" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "invitationId" uuid NOT NULL,
    remarks text,
    "submittedBy" uuid,
    "approvedBy" uuid,
    "isActive" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'New'::text,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FuelQualityMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    category text,
    value double precision,
    uom text,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    groups jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."FuelTypeMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    type text NOT NULL,
    label text NOT NULL,
    code text NOT NULL,
    description text NOT NULL,
    prefix_symbol text NOT NULL,
    postfix_symbol text NOT NULL,
    metadata jsonb NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGBuyer_Share" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Buyer_Name" text,
    "Location_Code" text,
    method text,
    "by_mass_Mass_of_Products_Purchased" double precision,
    "by_mass_Total_Mass_of_Products_Produced" double precision,
    "by_mass_Mass_of_Products_Produced_UoM" text,
    "by_volume_Volume_of_Products_Purchased" double precision,
    "by_volume_Total_Volume_of_Products_Purchased" double precision,
    "by_volume_Volume_of_Products_Purchased_UoM" text,
    "by_revenue_Market_Value_of_Products_Purchased" double precision,
    "by_revenue_Total_Market_Value_of_Products_Produced" double precision,
    "by_revenue_Market_Value_of_Products_Purchased_UoM" text,
    "by_number_of_units_Number_of_Units_Purchased" double precision,
    "by_number_of_units_Total_Number_of_Units_Produced" double precision,
    meta_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEffluentDischarge" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    created_by uuid,
    updated_by uuid,
    total_effluent_disposed_off double precision DEFAULT '0'::double precision,
    uom_effluent text,
    point_of_discharge text,
    qty_effluent_disposed_off numeric,
    qty_sludge_disposed_off numeric,
    qty_sludge_generated numeric,
    effluent_disposed_off_umo text,
    sludge_disposed_off_umo text,
    sludge_generated_umo text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kpi_total_effluent_disposed_off_litres double precision
);
CREATE TABLE public."GHGEnergyConsumption_FuelPurchased" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergyConsumption_FuelPurchased_Auxiliary" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "GHGEnergyConsumption_FuelPurchased_id" uuid NOT NULL,
    "Type_of_Auxiliary_Fuel_Purchased" text,
    "Used_for_Which_SKUs" text,
    "Quantity_of_fuel_consumed" double precision,
    "Quantity_of_fuel_consumed_uom" text,
    supporting_docs jsonb,
    "kpi_em_Emission_QuantityOfFuelConsumed" double precision,
    "kpi_emf_Emission_QuantityOfFuelConsumed" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergyConsumption_FuelPurchased_General" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "GHGEnergyConsumption_FuelPurchased_id" uuid NOT NULL,
    "Type_of_Fuel_Purchased" text,
    "Quantity_of_fuel_Consumed" double precision,
    "Quantity_of_fuel_Consumed_uom" text,
    "Quality_of_fuel" double precision,
    "Point_of_Consumption" text,
    supporting_docs jsonb,
    "kpi_em_Emission_QuantityOfFuelConsumed" double precision,
    "kpi_emf_Emission_QuantityOfFuelConsumed" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergyConsumption_FuelPurchased_HeatingWater" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "GHGEnergyConsumption_FuelPurchased_id" uuid NOT NULL,
    "Type_of_Fuel_Purchased" text,
    "Quality_of_fuel" double precision,
    "Used_for_Which_SKUs" text,
    "Quantity_of_fuel_consumed" double precision,
    "Quantity_of_fuel_consumed_uom" text,
    supporting_docs jsonb,
    "kpi_em_Emission_QuantityOfFuelConsumed" double precision,
    "kpi_emf_Emission_QuantityOfFuelConsumed" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergyConsumption_FuelPurchased_Transportation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Type_of_Fuel_Purchased" text,
    "Quantity_of_fuel_purchased" double precision NOT NULL,
    "UoM_for_fuel_purchased" text NOT NULL,
    "Distance_travelled" double precision,
    "Transportation_Type" text NOT NULL,
    supporting_docs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid NOT NULL,
    "kpi_emf_Transport_Scope1" double precision,
    "kpi_em_Transport_Scope1" double precision
);
CREATE TABLE public."GHGEnergyConsumption_GridPower" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Name_of_Distribution_Company" text,
    "PowerConsumed_through_Grid_Kwh" double precision,
    "PowerPurchased_through_PPA_Kwh_Renewable" double precision,
    "NameOfCompany_PPA_Renewable" text,
    "PowerPurchased_through_PPA_Kwh_NonRenewable" double precision,
    "NameOfCompany_PPA_NonRenewable" text,
    "PowerPurchased_through_REC_Kwh" double precision,
    "Name_of_company_for_REC" text,
    supporting_docs jsonb,
    "kpi_em_Emission_PowerPurchased_PPA_Renewable" double precision,
    "kpi_emf_Emission_PowerPurchased_PPA_Renewable" double precision,
    "kpi_em_Emission_PowerPurchased_REC" double precision,
    "kpi_emf_Emission_PowerPurchased_REC" double precision,
    "kpi_em_Emission_PowerPurchased_RenewableSources" double precision,
    "kpi_emf_Emission_PowerPurchased_RenewableSources" double precision,
    "kpi_em_Emission_PowerPurchased_NonRenewableSources" double precision,
    "kpi_emf_Emission_PowerPurchased_NonRenewableSources" double precision,
    "kpi_em_Emission_TotalPowerPurchased" double precision,
    "kpi_em_Emission_PowerPurchased_PPA_NonRenewable" double precision,
    "kpi_emf_Emission_PowerPurchased_PPA_NonRenewable" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergy_CaptivePower" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Do_You_Generate_Captive_Power_for_Own_Use" text,
    "Type_of_Captive_Power" text,
    supporting_docs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergy_CaptivePower_NonRenewable" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "GHGEnergyConsumption_CaptivePower_id" uuid NOT NULL,
    "Type_of_Fuel_Used" text,
    "Quantity_of_fuel_consumed" double precision,
    "Quantity_of_fuel_consumed_uom" text,
    "Quality_of_fuel" double precision,
    "Unit_of_Energy_Generated_in_Kwh" double precision,
    supporting_docs jsonb,
    "kpi_em_Emission_EnergyGenerated_kwh" double precision,
    "kpi_emf_Emission_EnergyGenerated_kwh" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGEnergy_CaptivePower_Renewable" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "GHGEnergyConsumption_CaptivePower_id" uuid NOT NULL,
    "Type_of_Technology_Used" text,
    "Year_of_installation" integer,
    "Unit_of_Energy_Generated_in_Kwh" double precision,
    supporting_docs jsonb,
    "kpi_em_Emission_EnergyGenerated_kwh" double precision,
    "kpi_emf_Emission_EnergyGenerated_kwh" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGFreshWater" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    total_fresh_water_used_for_domestic_use double precision NOT NULL,
    total_fresh_water_used_for_industrial_use double precision,
    total_fresh_water_used_for_landscaping double precision,
    total_fresh_water_used_for_miscellaneous_uses double precision,
    uom_freshwater text NOT NULL,
    kpi_total_domestic_use_litres double precision,
    kpi_total_industrial_use_litres double precision,
    kpi_total_landscaping_use_litres double precision,
    kpi_total_miscellaneous_use_litres double precision
);
CREATE TABLE public."GHGGeneralDetails" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Location_Name" text NOT NULL,
    "Location_ID_Code" text NOT NULL,
    "Location_Pincode" text NOT NULL,
    "Location_Type" text NOT NULL,
    "Month_Year" text NOT NULL,
    "Number_Employees" bigint NOT NULL,
    "Number_Operational_Days" integer NOT NULL,
    supporting_docs jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."GHGHarvestedWater" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    total_harvested_water_used_for_domestic_use double precision NOT NULL,
    total_harvested_water_used_for_industrial_use double precision,
    total_harvested_water_used_for_landscaping double precision,
    total_harvested_water_used_for_miscellaneous_uses double precision,
    uom_harvested_water text NOT NULL,
    kpi_total_domestic_use_litres double precision,
    kpi_total_industrial_use_litres double precision,
    kpi_total_landscaping_use_litres double precision,
    kpi_total_miscellaneous_use_litres double precision
);
CREATE TABLE public."GHGMaterialProcurement" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Material_Procured" text,
    "Material_ID" text,
    "Supplier_Status" text,
    "Third_Party_Suppliers_of_Material" text,
    "Locations_Procured_From" text,
    "Location_pin_or_zip_code" text,
    "Transport_Managed_by" text,
    "Mode_of_Transport" text,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Fuel_Used" text,
    "Distance_per_Trip" double precision,
    "Distance_per_Trip_uom" text,
    "Number_of_Trips" double precision,
    "Material_Quantity_Procured" double precision,
    "Material_Quantity_Procured_uom" text,
    supporting_docs jsonb,
    "kpi_Distance_Travelled" double precision,
    "kpi_Distance_Travelled_uom" text,
    "kpi_em_EmissionBy_TravelledDistance" double precision,
    "kpi_emf_EmissionBy_TravelledDistance" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "kpi_em_EmissionBy_MaterialProcured" double precision,
    "kpi_emf_EmissionBy_MaterialProcured" double precision,
    "kpi_emf_EmissionBy_Transport_Rail" double precision,
    "kpi_em_EmissionBy_Transport_Rail" double precision,
    "kpi_emf_EmissionBy_Transport_Air" double precision,
    "kpi_em_EmissionBy_Transport_Air" double precision,
    "kpi_emf_EmissionBy_Transport_Water" double precision,
    "kpi_em_EmissionBy_Transport_Water" double precision,
    "kpi_emf_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport" double precision,
    "kpi_em_EmissionBy_Transport_scope3" double precision,
    "kpi_em_EmissionBy_Transport_scope1" double precision,
    "Material_Code" text,
    "Supplier_Code" text
);
CREATE TABLE public."GHGProductionDetails" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Products_Manufactured_This_Month" text,
    "Product_ID" text,
    "SKUs_Manufactured" text,
    "SKU_ID" text,
    "Units_Of_SKU_Manufactured" double precision,
    "Total_Weight" double precision,
    "Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU" double precision,
    supporting_docs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "Processes_Employed" jsonb,
    manufactured_product_code text,
    manufactured_sku_code text
);
CREATE TABLE public."GHGSludgeDisposal" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    total_sludge_disposed_off double precision DEFAULT 0 NOT NULL,
    uom_sludge_disposed_off text NOT NULL,
    point_of_sludge_disposal text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    kpi_total_sludge_disposed_off_litres double precision
);
CREATE TABLE public."GHGTransport_BusinessTravel" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Mode_of_Transport" text,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Fuel_Used" text,
    "Distance_per_Trip" double precision,
    "Distance_per_Trip_UoM" text,
    "Number_of_Trips" double precision,
    supporting_docs jsonb,
    "kpi_Distance_Travelled" double precision,
    "kpi_Distance_Travelled_uom" text,
    "kpi_em_EmissionBy_TravelledDistance" double precision,
    "kpi_emf_EmissionBy_TravelledDistance" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "Trip_From_Pincode" text,
    "Trip_To_Pincode" text,
    "Trip_Distance" double precision DEFAULT '0'::double precision,
    "Trip_From_Country" text,
    "Trip_To_Country" text,
    "Trip_No_of_Employees_Travelled" numeric DEFAULT '0'::numeric,
    "kpi_emf_EmissionBy_Travel_Road_Bus" double precision,
    "kpi_em_EmissionBy_Travel_Road_Bus" double precision,
    "kpi_emf_EmissionBy_Travel_Road_OtherThanBus" double precision,
    "kpi_em_EmissionBy_Travel_Road_OtherThanBus" double precision,
    "kpi_emf_EmissionBy_Travel_Rail" double precision,
    "kpi_em_EmissionBy_Travel_Rail" double precision,
    "kpi_emf_EmissionBy_Travel_Air" double precision,
    "kpi_em_EmissionBy_Travel_Air" double precision,
    "kpi_em_EmissionBy_Travel_Scope3" double precision
);
CREATE TABLE public."GHGTransport_Downstream" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Which_Products" text,
    "Which_SKUs" text,
    "Destination_Location_Name" text,
    "Destination_pin_or_zip_code" text,
    "Transport_Managed_by" text,
    "Mode_of_Transport" text,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Fuel_Used" text,
    "Distance_per_trip" double precision,
    "Distance_per_trip_UoM" text,
    "Quantity_of_Fuel_Consumed" double precision,
    "Quantity_of_Fuel_Consumed_UoM" text,
    supporting_docs jsonb,
    "kpi_Distance_Travelled" double precision,
    "kpi_Distance_Travelled_uom" text,
    "kpi_em_EmissionBy_TravelledDistance" double precision,
    "kpi_emf_EmissionBy_TravelledDistance" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "Number_of_Trips" integer,
    "Number_of_Skus_Transported" integer,
    "Total_Weight_of_SKUs" double precision DEFAULT '0'::double precision NOT NULL,
    "Total_sku_weight" double precision,
    "kpi_emf_EmissionBy_Transport_Rail" double precision,
    "kpi_em_EmissionBy_Transport_Rail" double precision,
    "kpi_emf_EmissionBy_Transport_Air" double precision,
    "kpi_em_EmissionBy_Transport_Air" double precision,
    "kpi_emf_EmissionBy_Transport_Water" double precision,
    "kpi_em_EmissionBy_Transport_Water" double precision,
    "kpi_emf_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport" double precision,
    "kpi_em_EmissionBy_Transport_scope3" double precision,
    "kpi_em_EmissionBy_Transport_scope1" double precision,
    supplier_code text,
    total_distance_travelled double precision,
    total_distance_travelled_uom text,
    distributed_from_country text,
    distributed_from_location_pincode text,
    distributed_to_country text,
    distributed_to_location_pincode text,
    kpi_total_weight_transported double precision,
    kpi_total_weight_transported_uom text,
    "kpi_emf_EmissionBy_Transport" double precision,
    quantity_dispatched double precision,
    quantity_dispatched_uom text
);
CREATE TABLE public."GHGTransport_EmployeeTravel" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "PercOfEmp_TravBy_CompOwned_Bus" double precision,
    "AvgDailyDist_TravBy_CompOwned_Bus" double precision,
    "AvgDailyDist_TravBy_CompOwned_Bus_UoM" text,
    "PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus" double precision,
    "AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus" double precision,
    "AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM" text,
    "PercOfEmp_TravBy_PublicTrans_4Wheeler" double precision,
    "AvgDailyDist_TravBy_PubTrans_4Wheeler" double precision,
    "AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM" text,
    "PercOfEmp_TravBy_PublicTrans_3Wheeler" double precision,
    "AvgDailyDist_TravBy_PubTrans_3Wheeler" double precision,
    "AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM" text,
    "PercOfEmp_TravBy_PvtVehicle_4Wheeler" double precision,
    "AvgDailyDist_TravBy_PvtVehicle_4Wheeler" double precision,
    "AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM" text,
    "PercOfEmp_TravBy_PvtVehicle_2Wheeler" double precision,
    "AvgDailyDist_TravBy_PvtVehicle_2Wheeler" double precision,
    "AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM" text,
    "PercOfEmp_TravBy_RailSuburban" double precision,
    "AvgDailyDist_TravBy_RailSuburban" double precision,
    "AvgDailyDist_TravBy_RailSuburban_UoM" text,
    supporting_docs jsonb,
    "kpi_NoOf_Emp_TravBy_CompOwned_Bus" double precision,
    "kpi_NoOf_Emp_TravBy_PublicTrans_or_CompContracted_Bus" double precision,
    "kpi_NoOf_Emp_TravBy_PublicTrans_4Wheeler" double precision,
    "kpi_NoOf_Emp_TravBy_PublicTrans_3Wheeler" double precision,
    "kpi_NoOf_Emp_TravBy_PvtVehicle_4Wheeler" double precision,
    "kpi_NoOf_Emp_TravBy_PvtVehicle_2Wheeler" double precision,
    "kpi_NoOf_Emp_TravBy_RailSuburban" double precision,
    "kpi_em_Emp_TravBy_CompOwned_Bus" double precision,
    "kpi_emf_Emp_TravBy_CompOwned_Bus" double precision,
    "kpi_em_Emp_TravBy_PublicTransOrCompContractedBus" double precision,
    "kpi_emf_Emp_TravBy_PublicTransOrCompContractedBus" double precision,
    "kpi_em_Emp_TravBy_PublicTrans_4Wheeler" double precision,
    "kpi_emf_Emp_TravBy_PublicTrans_4Wheeler" double precision,
    "kpi_em_Emp_TravBy_PublicTrans_3Wheeler" double precision,
    "kpi_emf_Emp_TravBy_PublicTrans_3Wheeler" double precision,
    "kpi_em_Emp_TravBy_PvtVehicle_4Wheeler" double precision,
    "kpi_emf_Emp_TravBy_PvtVehicle_4Wheeler" double precision,
    "kpi_em_Emp_TravBy_PvtVehicle_2Wheeler" double precision,
    "kpi_emf_Emp_TravBy_PvtVehicle_2Wheeler" double precision,
    "kpi_em_Emp_TravBy_RailSuburban" double precision,
    "kpi_emf_Emp_TravBy_RailSuburban" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "kpi_TotalDist_TravBy_CompOwned_Bus" double precision,
    "kpi_TotalDist_TravBy_PublicTrans_or_CompContracted_Bus" double precision,
    "kpi_TotalDist_TravBy_PublicTrans_4Wheeler" double precision,
    "kpi_TotalDist_TravBy_PublicTrans_3Wheeler" double precision,
    "kpi_TotalDist_TravBy_PvtVehicle_4Wheeler" double precision,
    "kpi_TotalDist_TravBy_PvtVehicle_2Wheeler" double precision,
    "kpi_TotalDist_TravBy_RailSuburban" double precision,
    "kpi_em_EmissionBy_Travel" double precision,
    "kpi_em_EmissionBy_Travel_Scope1" double precision,
    "kpi_em_EmissionBy_Travel_Scope3" double precision
);
CREATE TABLE public."GHGTransport_Upstream" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    task_request_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Material_Procured" text,
    "Material_ID" text,
    "Supplier_Status" text,
    "Third_Party_Suppliers_of_Material" text,
    "Supplier_code" text,
    "Locations_Procured_From" text,
    "Location_pin_or_zip_code" text,
    "Transport_Managed_by" text,
    "Mode_of_Transport" text,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Fuel_Used" text,
    "Material_Quantity_Procured" double precision,
    "Material_Quantity_Procured_uom" text,
    "Distance_per_Trip" double precision,
    "Distance_per_Trip_uom" text,
    "Number_of_Trips" integer,
    "Quantity_of_Fuel_Consumed" double precision,
    "Quantity_of_Fuel_Consumed_uom" text,
    supporting_docs jsonb,
    "kpi_Distance_Travelled" double precision,
    "kpi_Distance_Travelled_uom" text,
    "kpi_em_EmissionBy_TravelledDistance" double precision,
    "kpi_emf_EmissionBy_TravelledDistance" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "kpi_em_EmissionBy_MaterialProcured" double precision,
    "kpi_emf_EmissionBy_MaterialProcured" double precision,
    "kpi_emf_EmissionBy_Transport_Rail" double precision,
    "kpi_em_EmissionBy_Transport_Rail" double precision,
    "kpi_emf_EmissionBy_Transport_Air" double precision,
    "kpi_em_EmissionBy_Transport_Air" double precision,
    "kpi_emf_EmissionBy_Transport_Water" double precision,
    "kpi_em_EmissionBy_Transport_Water" double precision,
    "kpi_emf_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport_Road" double precision,
    "kpi_em_EmissionBy_Transport" double precision,
    "kpi_em_EmissionBy_Transport_scope3" double precision,
    "kpi_em_EmissionBy_Transport_scope1" double precision,
    total_distance_travelled_in_kilometers double precision,
    "Destination_Location_Country" text,
    "Destination_Location_Pincode" text,
    total_distance_travelled double precision,
    total_distance_travelled_uom text,
    "kpi_emf_EmissionBy_Transport" double precision
);
CREATE TABLE public."GHGWaste" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    "Types_of_Waste_Generated" text,
    "Waste_Disposal_Managed_by" text,
    "Name_of_Third_Party" text,
    "Quantity_of_Waste" double precision,
    "Quantity_of_Waste_UoM" text,
    "Disposal_Mechanism" text,
    "Location_of_Waste_Disposal" text,
    "Location_pin_or_zip_code" text,
    "Who_Managed_Transportation_of_Waste" text,
    "Mode_of_Transport" text,
    "Vehicle_Type_Used_for_Road_Transport" text,
    "Fuel_Used" text,
    "DistOf_WasteDisposalLoction_from_FacilityLocation" text,
    "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM" text,
    supporting_docs jsonb,
    "kpi_DistanceTravlled_For_WasteManagement" double precision,
    "kpi_DistanceTravlled_For_WasteManagement_uom" text,
    "kpi_em_EmissionBy_TransportFor_WasteManagement" double precision,
    "kpi_emf_EmissionBy_TransportFor_WasteManagement" double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "kpi_em_EmissionBy_Generation_of_Waste_Type" double precision,
    "kpi_emf_EmissionBy_Generation_of_Waste_Type" double precision,
    "kpi_em_EmissionBy_TransportFor_Waste_Scope3" double precision,
    "kpi_em_EmissionBy_TransportFor_Waste_Scope1" double precision
);
CREATE TABLE public."GHGWasteWater" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    total_treated_effluent_reused_for_domestic_use double precision NOT NULL,
    total_treated_effluent_reused_for_industrial_use double precision,
    total_treated_effluent_reused_for_landscaping double precision,
    total_treated_effluent_used_for_miscellaneous_uses double precision,
    uom_treated_effluent text NOT NULL,
    kpi_total_domestic_use_litres double precision,
    kpi_total_industrial_use_litres double precision,
    kpi_total_landscaping_use_litres double precision,
    kpi_total_miscellaneous_use_litres double precision
);
CREATE TABLE public."GHGWasteWaterTreatment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    total_influent double precision DEFAULT 0 NOT NULL,
    total_treated_effluent double precision DEFAULT 0 NOT NULL,
    uom_influent_effluent text NOT NULL,
    influent_bod_concentration double precision,
    treated_effluent_bod_concentration double precision,
    uom_bod text NOT NULL,
    influent_cod_concentration double precision,
    treated_effluent_cod_concentration double precision,
    uom_cod text NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kpi_total_treated_effluent_litres double precision,
    kpi_total_treated_ffluent_litres double precision,
    kpi_influent_bod_concentration_mgl double precision,
    kpi_treated_effluent_bod_concentration_mgl double precision,
    kpi_influent_cod_concentration_mgl double precision,
    kpi_treated_effluent_cod_concentration_mgl double precision,
    kpi_total_influent_litres double precision
);
CREATE TABLE public."GHGWastewaterGeneration" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    total_wastewater_generated_from_domestic_use double precision,
    total_wastewater_generated_from_industrial_use double precision,
    uom_wastewater text,
    "point_of_wastewater_disposal_Applicable" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    kpi_total_wastewater_generated_domestic_use_litres double precision,
    kpi_total_wastewater_generated_industrial_use_litres double precision
);
CREATE TABLE public."GHGWaterWithdrawal" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_request_id uuid NOT NULL,
    organization_address_id uuid NOT NULL,
    activity_task_request_id uuid NOT NULL,
    total_fresh_water_withdrawal double precision DEFAULT 0 NOT NULL,
    uom_freshwater text,
    source_of_fresh_water text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    kpi_total_fresh_water_withdrawal_litres double precision
);
COMMENT ON TABLE public."GHGWaterWithdrawal" IS 'GHGWaterWithdrawal';
CREATE TABLE public."GroupForm" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formId" uuid NOT NULL,
    "groupFormId" uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."InterimFormLogs" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "submissionId" uuid NOT NULL,
    "sectionId" uuid,
    "questionId" uuid,
    score numeric DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    recommendations jsonb,
    status text DEFAULT 'Draft'::text,
    "interimAnswerId" uuid,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Interim_Answer" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "questionId" uuid NOT NULL,
    data jsonb NOT NULL,
    "submissionId" uuid,
    created_by uuid,
    updated_by uuid,
    status text DEFAULT ' Draft'::text NOT NULL,
    "formFieldId" uuid,
    "answerId" uuid,
    interim_answer_id uuid,
    "isViewOnly" boolean DEFAULT false
);
CREATE TABLE public."Interim_Comments" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    interim_recommendation_id uuid,
    comments text NOT NULL,
    upload_document text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL,
    filename text,
    "invitationId" uuid
);
CREATE TABLE public."Interim_Recommendation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendations text,
    "expectedDate" timestamp without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'Open'::text NOT NULL,
    interim_answer_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL,
    "ReminderIntervalAfterDueDate" timestamp without time zone,
    answeroption text,
    "questionId" uuid,
    "isApproved" boolean DEFAULT false NOT NULL
);
CREATE TABLE public."InvitationComment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "companyId" uuid NOT NULL,
    "invitationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'Sent'::text NOT NULL,
    content text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "formFieldId" uuid,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."InvitationConsultantMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    "invitationId" uuid NOT NULL,
    "consultantCompanyId" uuid NOT NULL,
    "consultantUserId" uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."KPIEmissionByFuelConsumption" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_Diesel_Consumption" double precision NOT NULL,
    "kpi_em_Gasoline_Consumption" double precision NOT NULL,
    "kpi_em_Biodiesel_Consumption" double precision NOT NULL,
    "kpi_em_Ethanol_Consumption" double precision NOT NULL,
    "kpi_em_LPG_Consumption" double precision NOT NULL,
    "kpi_em_CNG_Consumption" double precision NOT NULL,
    "kpi_em_GaseousNitrogen_Consumption" double precision NOT NULL,
    "kpi_em_GaseousOxygen_Consumption" double precision NOT NULL,
    "kpi_em_LiquidNitrogen_Consumption" double precision NOT NULL,
    "kpi_em_CompressedAir_Consumption" double precision NOT NULL,
    "kpi_em_Electric_Consumption" double precision NOT NULL,
    "kpi_em_JetFuel_Consumption" double precision NOT NULL,
    "kpi_em_SAF_Consumption" double precision NOT NULL,
    "kpi_em_TotalEmission_FuelConsumption" double precision NOT NULL,
    "kpi_em_FuelConsumption_Scope1" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_em_Coal_Consumption" double precision,
    "kpi_em_Petcoke_Consumption" double precision,
    "kpi_em_NaturalGas_Consumption" double precision,
    "kpi_em_Biomass_Consumption" double precision,
    "kpi_em_Bagasse_Consumption" double precision,
    "kpi_em_Kerosene_Consumption" double precision
);
CREATE TABLE public."KPIEmissionByMaterialConsumption" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_TotalEmission_MaterialProcurement" double precision NOT NULL,
    "kpi_em_MaterialProcurement_Scope3" double precision NOT NULL,
    "kpi_em_MaterialProcurement_Scope1" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL
);
CREATE TABLE public."KPIEmissionByMaterialConsumption_Suppliers" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    supplier_id text NOT NULL,
    supplier_name text NOT NULL,
    supplier_category text NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_MaterialProcurement_Scope3" double precision DEFAULT 0 NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_em_TansportUpstreamEmission" double precision DEFAULT '0'::double precision
);
CREATE TABLE public."KPIEmissionByPowerConsumption" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_PowerPurchased_RenewableSources" double precision NOT NULL,
    "kpi_em_PowerPurchased_NonRenewableSources" double precision NOT NULL,
    "kpi_em_TotalPowerPurchased" double precision NOT NULL,
    "kpi_em_Emission_PowerPurchased_PPA_Renewable" double precision NOT NULL,
    "kpi_em_PowerPurchased_PPA_NonRenewable" double precision NOT NULL,
    "kpi_em_Emission_PowerPurchased_REC" double precision NOT NULL,
    "kpi_em_Renewable_CaptivePower" double precision NOT NULL,
    "kpi_em_NonRenewable_CaptivePower" double precision NOT NULL,
    "kpi_em_CaptivePower" double precision NOT NULL,
    "kpi_em_PowerConsumption_Scope2" double precision NOT NULL,
    "kpi_em_PowerConsumption_Scope1" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_CaptivePower_GeneratedUnits" double precision,
    "kpi_TotalPowerPurchased_GeneratedUnits" double precision
);
CREATE TABLE public."KPIEmissionByPowerConsumption_Vendors" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_PowerPurchased_NonRenewableSources" double precision NOT NULL,
    "kpi_em_PowerPurchased_NonRenewableSources_vendor" text NOT NULL,
    "kpi_em_Emission_PowerPurchased_PPA_Renewable" double precision NOT NULL,
    "kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor" text NOT NULL,
    "kpi_em_PowerPurchased_PPA_NonRenewable" double precision NOT NULL,
    "kpi_em_PowerPurchased_PPA_NonRenewable_vendor" text NOT NULL,
    "kpi_em_Emission_PowerPurchased_REC" double precision NOT NULL,
    "kpi_em_Emission_PowerPurchased_REC_vendor" text NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public."KPIEmissionByProducts" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    product_id text NOT NULL,
    product_name text NOT NULL,
    brand_id text NOT NULL,
    brand_name text NOT NULL,
    em_uom text NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    contribution_perc double precision DEFAULT 0 NOT NULL,
    kpi_weight double precision DEFAULT 0 NOT NULL,
    "kpi_em_Total_Emission" double precision NOT NULL
);
CREATE TABLE public."KPIEmissionByTransportation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    em_uom text NOT NULL,
    "kpi_em_UpstreamTransport" double precision NOT NULL,
    "kpi_em_UpstreamTransport_Scope3" double precision NOT NULL,
    "kpi_em_UpstreamTransport_Scope1" double precision NOT NULL,
    "kpi_em_DownstreamTransport" double precision NOT NULL,
    "kpi_em_DownstreamTransport_Scope3" double precision NOT NULL,
    "kpi_em_DownstreamTransport_Scope1" double precision NOT NULL,
    "kpi_em_EmployeeTravel" double precision NOT NULL,
    "kpi_em_EmployeeTravel_Scope3" double precision NOT NULL,
    "kpi_em_EmployeeTravel_Scope1" double precision NOT NULL,
    "kpi_em_BusinessTravel" double precision NOT NULL,
    "kpi_em_BusinessTravel_Scope3" double precision NOT NULL,
    "kpi_em_Transport_WasteManagement" double precision NOT NULL,
    "kpi_em_Transport_WasteManagement_Scope3" double precision NOT NULL,
    "kpi_em_Transport_WasteManagement_Scope1" double precision NOT NULL,
    "kpi_em_TotalEmission_Transport" double precision NOT NULL,
    "kpi_em_Transport_Scope3" double precision NOT NULL,
    "kpi_em_Transport_Scope1" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_em_InternalTransport" double precision,
    "kpi_em_Modes_and_Fuel_Types" jsonb
);
CREATE TABLE public."KPIEmissionByWasteGeneration" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    em_uom text NOT NULL,
    "WasteDisposal_ManagedBy_ThirdParty_Name" text NOT NULL,
    "kpi_em_TotalEmission_WasteGeneration" double precision NOT NULL,
    "kpi_em_WasteGeneration_Scope3" double precision NOT NULL,
    "kpi_em_WasteGeneration_Scope1" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL
);
CREATE TABLE public."KPIEnergy" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    energy_resource_type text,
    source text,
    purpose text,
    resource text,
    kpi_generated_units double precision,
    kpi_generated_units_uom text,
    quantity double precision,
    quantity_uom text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    contract_type text
);
CREATE TABLE public."KPIMain" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    kpi_em_uom text NOT NULL,
    "kpi_em_Total_Emission" double precision NOT NULL,
    "kpi_em_Total_Emission_Scope1" double precision NOT NULL,
    "kpi_em_Total_Emission_Scope2" double precision NOT NULL,
    "kpi_em_Total_Emission_Scope3" double precision NOT NULL,
    "kpi_em_TopEmission_Category" jsonb NOT NULL,
    "kpi_em_TopEmission_Product" jsonb NOT NULL,
    "kpi_em_CurrentEmissionIntensity_PerTonProduction" double precision NOT NULL,
    "kpi_em_CurrentEmissionIntensity_PerEmployee" double precision NOT NULL,
    "kpi_em_CurrentEmissionIntensity_PerProduct" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_StreamOfWork_Upstream" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_StreamOfWork_Operations" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_StreamOfWork_Downstream" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_Categories_Energy" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_Categories_Waste" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_Categories_Transport" double precision NOT NULL,
    "kpi_em_Cont_TotalEmission_Categories_Material" double precision NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_em_Scope3_Cont_Upstream" double precision,
    "kpi_em_Scope3_Cont_Downstream" double precision,
    year numeric NOT NULL,
    "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct" double precision DEFAULT '0'::double precision,
    "kpi_em_CurrentEmissionIntensity_Scope3_PerProduct" double precision DEFAULT '0'::double precision,
    "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction" double precision DEFAULT '0'::double precision NOT NULL,
    "kpi_em_CurrentEmissionIntensity_Scope3_PerTonProduction" double precision DEFAULT '0'::double precision NOT NULL,
    "kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerEmployee" double precision DEFAULT '0'::double precision NOT NULL,
    "kpi_em_CurrentEmissionIntensity_Scope3_PerEmployee" double precision DEFAULT '0'::double precision NOT NULL
);
CREATE TABLE public."KPIWasteManagement" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month numeric NOT NULL,
    year numeric NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    kpi_uom text NOT NULL,
    kpi_waste_generated_type text,
    kpi_waste_disposal_mechanism text,
    kpi_waste_quantity double precision DEFAULT 0 NOT NULL,
    metadata jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    "kpi_em_EmissionBy_TransportFor_WasteManagement" double precision DEFAULT '0'::double precision,
    "kpi_em_EmissionBy_Generation_of_Waste_Type" double precision DEFAULT '0'::double precision
);
CREATE TABLE public."KPIWaterConsumption" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    region_id uuid NOT NULL,
    address_id uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    total_fresh_water_consumption double precision DEFAULT 0 NOT NULL,
    total_waste_water_consumption double precision DEFAULT 0 NOT NULL,
    total_harvested_water_consumption double precision DEFAULT 0 NOT NULL,
    total_water_consumption_uom text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Modules" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "ModuleName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrgBrandMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_master_id text,
    name text NOT NULL,
    code text,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrgMaterialMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_master_id text,
    name text NOT NULL,
    code text,
    type text NOT NULL,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrgProductMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_master_id text,
    name text NOT NULL,
    code text,
    org_brand_master_id uuid,
    organization_address_id uuid NOT NULL,
    type text,
    segment text,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrgSKUMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_master_id text,
    name text NOT NULL,
    code text,
    org_product_master_id uuid NOT NULL,
    weight double precision DEFAULT 0.00 NOT NULL,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    weight_uom text DEFAULT 'kilogram'::text
);
CREATE TABLE public."OrgSkuBomMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_sku_master_id uuid NOT NULL,
    org_material_master_id uuid NOT NULL,
    material_quantity double precision NOT NULL,
    material_quantity_uom text,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrgSupplierMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_master_id text,
    name text NOT NULL,
    code text,
    category text NOT NULL,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Organization" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "Baselineyear" integer DEFAULT 2015 NOT NULL,
    "FinancialYearMonth" text DEFAULT 'January'::text NOT NULL,
    "primaryContact" jsonb,
    details jsonb,
    "parentCompanyId" uuid,
    "platformId" uuid,
    country text,
    "isActive" boolean,
    "IsManufacturing" boolean
);
CREATE TABLE public."OrganizationActivityMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    activity_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."OrganizationAddress" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    address_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."ParentCompanyMapping" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "CompanyId" uuid NOT NULL,
    "ParentCompanyId" uuid,
    "CreatedDate" timestamp with time zone DEFAULT now() NOT NULL,
    "ModifiedDate" timestamp with time zone DEFAULT now() NOT NULL,
    "isActive" boolean DEFAULT true,
    "UserId" uuid,
    "ParentUserId" uuid,
    "AddressId" uuid
);
CREATE TABLE public."Platform" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    "apiKey" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    expiry timestamp with time zone,
    origin text[],
    "Types" jsonb,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Question" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    key text NOT NULL,
    content text NOT NULL,
    tags text[] NOT NULL,
    weightage numeric(10,2) NOT NULL,
    calc jsonb,
    "sectionId" uuid NOT NULL,
    "parentQuestionId" uuid,
    subtheme text,
    "isDelegateQuestion" boolean,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."RaraValidationAndRating" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "invitationId" uuid NOT NULL,
    "submissionId" uuid NOT NULL,
    "formFieldId" uuid NOT NULL,
    type text NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "fileId" text NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Region" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Report_esg_investee_environmental_impact" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    company_name text,
    scope1_emission integer,
    scope2_emission integer,
    scope3_emission integer,
    energy integer,
    annual_waste_quantity integer,
    females_permanent integer,
    males_permanent integer,
    others_permanent integer,
    female_board_members integer,
    independent_board_members integer,
    employees_trained_cybersecurity integer,
    parentcompanyid uuid,
    attribute_energy text,
    value_energy numeric,
    attribute_gender text,
    value_gender integer,
    attribute_boardmemeber text,
    value_boardmemeber integer,
    attribute_ind_memeber text,
    value_ind_memeber integer,
    attribute_train_memeber text,
    value_train_member integer,
    attribute_scope text,
    value_scope integer,
    total_emission integer,
    total_waste integer,
    total_permanent integer
);
CREATE TABLE public."Report_esg_investee_policysummary" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parentcompanyid uuid,
    company_id uuid,
    company_name text,
    attribute text,
    value text
);
CREATE TABLE public."Report_esg_investee_score" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parentcompanyid text,
    company_id uuid,
    company_name text,
    section_name text,
    parent_section_name text,
    esg_section_name text,
    score integer,
    total_esg_weighted_score integer,
    weightage integer,
    is_esg_section boolean,
    is_theme_section boolean,
    sector text,
    environment_category text,
    performance_standard jsonb,
    subtheme text,
    qid uuid,
    is_question boolean,
    duration text
);
CREATE TABLE public."Section" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    key text NOT NULL,
    content text NOT NULL,
    tags text[] NOT NULL,
    weightage numeric(10,2) NOT NULL,
    calc jsonb,
    "sectionId" uuid,
    "formId" uuid NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."SourceFiles" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "originalFileName" text NOT NULL,
    "originalFileUrl" text,
    "fileSize" text,
    "totalDataPointsAdded" integer,
    "ingestionStartAt" timestamp with time zone,
    "ingestionEndAt" timestamp with time zone,
    "currentPage" integer,
    "totalPages" integer,
    status text DEFAULT 'Pending'::text,
    "suggestedDocumentId" uuid,
    "uploadedByUserId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "currentDataPointsCurated" integer,
    error jsonb DEFAULT '{"error": "", "warning": ""}'::jsonb NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Sources" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    "formInvitationId" uuid NOT NULL,
    "sourceFilesId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "copiedFromSourceId" uuid,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."State" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    zone_id uuid,
    country_id uuid,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."SuggestedDocuments" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formId" uuid NOT NULL,
    title text NOT NULL,
    "acceptedFormats" jsonb NOT NULL,
    "maxSize" integer NOT NULL,
    "seqIndex" integer DEFAULT 0 NOT NULL,
    "sampleFileUrl" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "isOther" boolean DEFAULT false NOT NULL,
    "metaData" jsonb DEFAULT jsonb_build_object(),
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."SuggestionSourceMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "suggestionId" uuid NOT NULL,
    "sourceId" uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "suggestionPageNo" integer,
    "suggestionInfoContent" text,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Suggestions" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formFieldId" uuid NOT NULL,
    "formInvitationId" uuid NOT NULL,
    "isSelected" boolean DEFAULT false NOT NULL,
    "selectedByUserId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    suggestion jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."SupplierAddressMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_supplier_master_id uuid NOT NULL,
    address_id uuid NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."TaskRequest" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_address_id uuid NOT NULL,
    month text NOT NULL,
    year integer,
    status text,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."TravelDistance" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_location_pincode text,
    from_location_country text,
    to_location_pincode text,
    to_location_country text,
    distance double precision DEFAULT 0,
    mode_of_transport text,
    metadata jsonb,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public."UomConversionMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_key text NOT NULL,
    to_key text NOT NULL,
    factor double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    metadata jsonb
);
CREATE TABLE public."UomMaster" (
    id uuid NOT NULL,
    category text,
    key text,
    code text,
    label text,
    prefix_symbol text,
    postfix_symbol text,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."User" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" timestamp with time zone,
    phone text,
    "phoneVerified" timestamp with time zone,
    image text,
    details jsonb,
    "companyId" uuid,
    created_by uuid,
    updated_by uuid,
    "isActive" boolean DEFAULT true,
    "IsPasswordReset" boolean DEFAULT false,
    "isEmailSubscribed" boolean DEFAULT true
);
CREATE TABLE public."UserOrganizationAddressMapping" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_address_id uuid,
    organization_id uuid NOT NULL,
    activities jsonb NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."UsermodulePermission" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "ModuleId" uuid NOT NULL,
    "Add" boolean DEFAULT false NOT NULL,
    "Edit" boolean DEFAULT false NOT NULL,
    "View" boolean DEFAULT true NOT NULL,
    "Approve" boolean DEFAULT false NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    "UserId" uuid
);
CREATE TABLE public."ValidationWarningLogs" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "OldValue" jsonb NOT NULL,
    "NewValue" jsonb NOT NULL,
    "Ratio" numeric NOT NULL,
    "formFieldId" uuid NOT NULL,
    "QuestionId" uuid NOT NULL,
    "InvitationId" uuid NOT NULL,
    created_at time without time zone DEFAULT now() NOT NULL,
    updated_at time without time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    "values" jsonb DEFAULT '{"Newvalue": "0", "Oldvalue": "0", "ActualDeviation": "0", "Threshold_Deviation": "0", "Deviation_differential": "0"}'::jsonb NOT NULL,
    "Logtype" text
);
CREATE TABLE public."VehicleTypeMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    type text,
    name text NOT NULL,
    code text,
    configuration text,
    capacity_tons double precision,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    fuels jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    configuration_value jsonb
);
CREATE VIEW public."View_Emission_Intensity_Per_Km_Travelled" AS
 WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM (((public."OrganizationAddress" oa
             JOIN public."Addresses" a ON ((a.id = oa.address_id)))
             JOIN public."City" c ON ((c.id = a.city_id)))
             JOIN public."State" s ON ((s.id = a.state_id)))
        ), cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o."Baselineyear"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('''', to_char(((EXTRACT(year FROM cte_date.date) - (1)::numeric) % (100)::numeric), 'FM00'::text), '-', to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                    ELSE concat('''', to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), '-', to_char(((EXTRACT(year FROM cte_date.date) + (1)::numeric) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                END AS financial_year_quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        ), cte_business_travel AS (
         SELECT gtbt.task_request_id,
            gtbt.organization_address_id,
            sum(COALESCE(gtbt."Trip_Distance", (0)::double precision)) AS "kpi_Distance_Travelled"
           FROM public."GHGTransport_BusinessTravel" gtbt
          GROUP BY gtbt.task_request_id, gtbt.organization_address_id
          ORDER BY gtbt.task_request_id
        ), cte_downstream AS (
         SELECT gtd.task_request_id,
            gtd.organization_address_id,
            sum(COALESCE(gtd.total_distance_travelled, (0)::double precision)) AS "kpi_Distance_Travelled"
           FROM public."GHGTransport_Downstream" gtd
          GROUP BY gtd.task_request_id, gtd.organization_address_id
          ORDER BY gtd.task_request_id
        ), cte_employee_travel AS (
         SELECT gtet.task_request_id,
            gtet.organization_address_id,
            sum(((((((COALESCE(gtet."kpi_TotalDist_TravBy_CompOwned_Bus", (0)::double precision) + COALESCE(gtet."kpi_TotalDist_TravBy_PublicTrans_or_CompContracted_Bus", (0)::double precision)) + COALESCE(gtet."kpi_TotalDist_TravBy_PublicTrans_4Wheeler", (0)::double precision)) + COALESCE(gtet."kpi_TotalDist_TravBy_PublicTrans_3Wheeler", (0)::double precision)) + COALESCE(gtet."kpi_TotalDist_TravBy_PvtVehicle_4Wheeler", (0)::double precision)) + COALESCE(gtet."kpi_TotalDist_TravBy_PvtVehicle_2Wheeler", (0)::double precision)) + COALESCE(gtet."kpi_TotalDist_TravBy_RailSuburban", (0)::double precision))) AS "kpi_Distance_Travelled"
           FROM public."GHGTransport_EmployeeTravel" gtet
          GROUP BY gtet.task_request_id, gtet.organization_address_id
          ORDER BY gtet.task_request_id
        ), cte_upstream AS (
         SELECT gtu.task_request_id,
            gtu.organization_address_id,
            sum(COALESCE(gtu.total_distance_travelled, (0)::double precision)) AS "kpi_Distance_Travelled"
           FROM public."GHGTransport_Upstream" gtu
          GROUP BY gtu.task_request_id, gtu.organization_address_id
          ORDER BY gtu.task_request_id
        ), cte_waste AS (
         SELECT gw.task_request_id,
            gw.organization_address_id,
            sum(COALESCE(gw."kpi_DistanceTravlled_For_WasteManagement", (0)::double precision)) AS "kpi_Distance_Travelled"
           FROM public."GHGWaste" gw
          GROUP BY gw.task_request_id, gw.organization_address_id
          ORDER BY gw.task_request_id
        ), cte_fuel_purchased AS (
         SELECT gcft.task_request_id,
            gcft.organization_address_id,
            sum(COALESCE(gcft."Distance_travelled", (0)::double precision)) AS "kpi_Distance_Travelled"
           FROM public."GHGEnergyConsumption_FuelPurchased_Transportation" gcft
          GROUP BY gcft.task_request_id, gcft.organization_address_id
          ORDER BY gcft.task_request_id
        ), cte_task_requests AS (
         SELECT "TaskRequest".id AS task_request_id,
            "TaskRequest".organization_address_id,
            "TaskRequest".year,
            "TaskRequest".month,
                CASE "TaskRequest".month
                    WHEN 'January'::text THEN 1
                    WHEN 'February'::text THEN 2
                    WHEN 'March'::text THEN 3
                    WHEN 'April'::text THEN 4
                    WHEN 'May'::text THEN 5
                    WHEN 'June'::text THEN 6
                    WHEN 'July'::text THEN 7
                    WHEN 'August'::text THEN 8
                    WHEN 'September'::text THEN 9
                    WHEN 'October'::text THEN 10
                    WHEN 'November'::text THEN 11
                    WHEN 'December'::text THEN 12
                    ELSE NULL::integer
                END AS month_name
           FROM public."TaskRequest"
        ), cte_travel_data AS (
         SELECT ctr.task_request_id,
            ctr.year,
            ctr.month_name,
            ctr.organization_address_id,
            (((((COALESCE(cbt."kpi_Distance_Travelled", (0)::double precision) + COALESCE(cd."kpi_Distance_Travelled", (0)::double precision)) + COALESCE(cet."kpi_Distance_Travelled", (0)::double precision)) + COALESCE(cu."kpi_Distance_Travelled", (0)::double precision)) + COALESCE(cw."kpi_Distance_Travelled", (0)::double precision)) + COALESCE(cfp."kpi_Distance_Travelled", (0)::double precision)) AS "sum_kpi_Distance_Travelled"
           FROM ((((((cte_task_requests ctr
             LEFT JOIN cte_business_travel cbt ON ((cbt.task_request_id = ctr.task_request_id)))
             LEFT JOIN cte_downstream cd ON ((cd.task_request_id = ctr.task_request_id)))
             LEFT JOIN cte_employee_travel cet ON ((cet.task_request_id = ctr.task_request_id)))
             LEFT JOIN cte_upstream cu ON ((cu.task_request_id = ctr.task_request_id)))
             LEFT JOIN cte_waste cw ON ((cw.task_request_id = ctr.task_request_id)))
             LEFT JOIN cte_fuel_purchased cfp ON ((cfp.task_request_id = ctr.task_request_id)))
        ), cte_transport AS (
         SELECT kebt.year,
            kebt.month,
            ca.city_id,
            ca.city_name,
            ca.state_id,
            ca.state_name,
            kebt.address_id,
            ca.address_name AS location_address,
            kebt.organization_id,
            o.name AS organization_name,
            kebt.region_id,
            r.name AS region_name,
            COALESCE(kebt."kpi_em_TotalEmission_Transport", (0)::double precision) AS "kpi_em_TotalEmission_Transport",
            COALESCE(ctd."sum_kpi_Distance_Travelled", (0)::double precision) AS "sum_kpi_Distance_Travelled",
            (COALESCE(kebt."kpi_em_TotalEmission_Transport", (0)::double precision) / NULLIF(COALESCE(ctd."sum_kpi_Distance_Travelled", (0)::double precision), (0)::double precision)) AS "kpi_em_Intensity",
            (COALESCE(kebt."kpi_em_TotalEmission_Transport", (0)::double precision) / NULLIF(sum(COALESCE(kbp.kpi_weight, (0)::double precision)), (0)::double precision)) AS kpi_per_tonne_production
           FROM (((((public."KPIEmissionByTransportation" kebt
             LEFT JOIN public."KPIEmissionByProducts" kbp ON (((kbp.address_id = kebt.address_id) AND (kbp.year = kebt.year) AND (kbp.month = kebt.month))))
             JOIN public."Organization" o ON ((o.id = kebt.organization_id)))
             JOIN public."Region" r ON ((r.id = kebt.region_id)))
             LEFT JOIN cte_address ca ON ((ca.organization_address_id = kebt.address_id)))
             LEFT JOIN cte_travel_data ctd ON (((ctd.organization_address_id = kebt.address_id) AND ((ctd.month_name)::numeric = kebt.month) AND ((ctd.year)::numeric = kebt.year))))
          GROUP BY kebt.year, kebt.month, ca.city_id, ca.city_name, ca.state_id, ca.state_name, kebt.address_id, ca.address_name, kebt.organization_id, o.name, kebt.region_id, r.name, kebt."kpi_em_TotalEmission_Transport", ctd."sum_kpi_Distance_Travelled"
        )
 SELECT cp.date,
    cp.year,
    cp.full_month,
    cp.quarter,
    cp.financial_year_quarter,
    cp.financial_year,
    ct.organization_id,
    ct.organization_name,
    ct.city_name,
    ct.state_name,
    ct.location_address,
    ct.region_name,
    ct."kpi_em_TotalEmission_Transport",
    ct."sum_kpi_Distance_Travelled",
    ct."kpi_em_Intensity",
    COALESCE(ct.kpi_per_tonne_production, (0)::double precision) AS kpi_per_tonne_production,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new
   FROM (cte_period cp
     LEFT JOIN cte_transport ct ON (((ct.month = cp.month) AND ((ct.year)::double precision = cp.year))))
  ORDER BY cp.date;
CREATE VIEW public."View_KPI_Waste_Management" AS
 WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM (((public."OrganizationAddress" oa
             JOIN public."Addresses" a ON ((a.id = oa.address_id)))
             JOIN public."City" c ON ((c.id = a.city_id)))
             JOIN public."State" s ON ((s.id = a.state_id)))
        ), cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o."Baselineyear"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        ), cte_waste_management AS (
         SELECT kwm.year,
            kwm.month,
            ca.city_id,
            ca.city_name,
            ca.state_id,
            ca.state_name,
            kwm.address_id,
            ca.address_name AS location_address,
            kwm.organization_id,
            o.name AS organization_name,
            kwm.region_id,
            r.name AS region_name,
            kwm.kpi_waste_generated_type,
            kwm.kpi_waste_disposal_mechanism,
            kwm.kpi_waste_quantity
           FROM (((public."KPIWasteManagement" kwm
             JOIN public."Organization" o ON ((o.id = kwm.organization_id)))
             JOIN public."Region" r ON ((r.id = kwm.region_id)))
             LEFT JOIN cte_address ca ON ((ca.organization_address_id = kwm.address_id)))
        )
 SELECT cp.date,
    cp.year,
    cp.full_month,
    cp.quarter,
    cp.financial_year,
    cwm.organization_id,
    cwm.organization_name,
    cwm.city_name,
    cwm.state_name,
    cwm.address_id,
    cwm.location_address,
    cwm.region_name,
    cwm.kpi_waste_generated_type,
    cwm.kpi_waste_disposal_mechanism,
    cwm.kpi_waste_quantity,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new
   FROM (cte_period cp
     LEFT JOIN cte_waste_management cwm ON (((cp.month = cwm.month) AND (cp.year = (cwm.year)::double precision))))
  ORDER BY cp.date;
CREATE VIEW public."View_KPI_Water_Consumption" AS
 WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM (((public."OrganizationAddress" oa
             JOIN public."Addresses" a ON ((a.id = oa.address_id)))
             JOIN public."City" c ON ((c.id = a.city_id)))
             JOIN public."State" s ON ((s.id = a.state_id)))
        ), cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o."Baselineyear"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        ), cte_water_consumption AS (
         SELECT kwm.year,
            kwm.month,
            ca.city_id,
            ca.city_name,
            ca.state_id,
            ca.state_name,
            kwm.address_id,
            ca.address_name AS location_address,
            kwm.organization_id,
            o.name AS organization_name,
            kwm.region_id,
            r.name AS region_name,
            kwm.total_fresh_water_consumption,
            kwm.total_waste_water_consumption,
            kwm.total_harvested_water_consumption,
            kwm.total_water_consumption_uom
           FROM (((public."KPIWaterConsumption" kwm
             JOIN public."Organization" o ON ((o.id = kwm.organization_id)))
             JOIN public."Region" r ON ((r.id = kwm.region_id)))
             LEFT JOIN cte_address ca ON ((ca.organization_address_id = kwm.address_id)))
        )
 SELECT cp.date,
    cp.year,
    cp.full_month,
    cp.quarter,
    cp.financial_year,
    cwm.organization_id,
    cwm.organization_name,
    cwm.city_name,
    cwm.state_name,
    cwm.address_id,
    cwm.location_address,
    cwm.region_name,
    cwm.total_fresh_water_consumption,
    cwm.total_waste_water_consumption,
    cwm.total_harvested_water_consumption,
    cwm.total_water_consumption_uom,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new
   FROM (cte_period cp
     LEFT JOIN cte_water_consumption cwm ON (((cp.month = (cwm.month)::numeric) AND (cp.year = (cwm.year)::double precision))))
  ORDER BY cp.date;
CREATE VIEW public."View_Kpi_Waste_Emission" AS
 WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM (((public."OrganizationAddress" oa
             JOIN public."Addresses" a ON ((a.id = oa.address_id)))
             JOIN public."City" c ON ((c.id = a.city_id)))
             JOIN public."State" s ON ((s.id = a.state_id)))
        ), cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o."Baselineyear"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat(to_char(((EXTRACT(year FROM cte_date.date) - (1)::numeric) % (100)::numeric), 'FM00'::text), '-', to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                    ELSE concat(to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), '-', to_char(((EXTRACT(year FROM cte_date.date) + (1)::numeric) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                END AS financial_year_quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        ), cte_general_details AS (
         SELECT tr.month,
            tr.year,
                CASE tr.month
                    WHEN 'January'::text THEN 1
                    WHEN 'February'::text THEN 2
                    WHEN 'March'::text THEN 3
                    WHEN 'April'::text THEN 4
                    WHEN 'May'::text THEN 5
                    WHEN 'June'::text THEN 6
                    WHEN 'July'::text THEN 7
                    WHEN 'August'::text THEN 8
                    WHEN 'September'::text THEN 9
                    WHEN 'October'::text THEN 10
                    WHEN 'November'::text THEN 11
                    WHEN 'December'::text THEN 12
                    ELSE NULL::integer
                END AS month_number,
            tr.organization_address_id,
            ggd."Month_Year",
            ggd."Number_Employees"
           FROM (public."TaskRequest" tr
             LEFT JOIN public."GHGGeneralDetails" ggd ON ((ggd.task_request_id = tr.id)))
        ), cte_product_emission AS (
         SELECT "KPIEmissionByProducts".month,
            "KPIEmissionByProducts".year,
            "KPIEmissionByProducts".address_id,
            sum("KPIEmissionByProducts".kpi_weight) AS kpi_weight
           FROM public."KPIEmissionByProducts"
          GROUP BY "KPIEmissionByProducts".month, "KPIEmissionByProducts".year, "KPIEmissionByProducts".address_id
        ), cte_waste_management AS (
         SELECT km.year,
            km.month,
            km.address_id,
            km.organization_id,
            o.name AS organization_name,
            ca.city_name,
            ca.state_name,
            ca.address_name AS location_address,
            r.name AS region_name,
            COALESCE(km."kpi_em_EmissionBy_TransportFor_WasteManagement", (0.0)::double precision) AS "kpi_em_EmissionBy_TransportFor_WasteManagement",
            COALESCE(km."kpi_em_EmissionBy_Generation_of_Waste_Type", (0.0)::double precision) AS "kpi_em_EmissionBy_Generation_of_Waste_Type",
            km.kpi_waste_generated_type,
            km.kpi_waste_quantity,
            km.kpi_waste_disposal_mechanism,
            COALESCE(sum(kpe.kpi_weight), (0)::double precision) AS kpi_weight,
            COALESCE((cgd."Number_Employees")::double precision, (0)::double precision) AS "Number_Employees",
            COALESCE((km.kpi_waste_quantity / (cgd."Number_Employees")::double precision), (0)::double precision) AS waste_generation_intensity_per_employee
           FROM (((((public."KPIWasteManagement" km
             JOIN public."Organization" o ON ((o.id = km.organization_id)))
             JOIN public."Region" r ON ((r.id = km.region_id)))
             LEFT JOIN cte_address ca ON ((ca.organization_address_id = km.address_id)))
             LEFT JOIN cte_product_emission kpe ON (((kpe.address_id = km.address_id) AND (kpe.year = km.year) AND (kpe.month = km.month))))
             LEFT JOIN cte_general_details cgd ON ((((cgd.month_number)::numeric = km.month) AND ((cgd.year)::numeric = km.year) AND (cgd.organization_address_id = km.address_id))))
          GROUP BY km.year, km.month, km.address_id, km.organization_id, o.name, ca.city_name, ca.state_name, ca.address_name, r.name, km."kpi_em_EmissionBy_TransportFor_WasteManagement", km."kpi_em_EmissionBy_Generation_of_Waste_Type", km.kpi_waste_generated_type, km.kpi_waste_quantity, km.kpi_waste_disposal_mechanism, cgd."Number_Employees"
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    cp.full_month,
    cp.quarter,
    cp.financial_year_quarter,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cwm.organization_id,
    cwm.organization_name,
    cwm.city_name,
    cwm.state_name,
    cwm.location_address,
    cwm.region_name,
    cwm."kpi_em_EmissionBy_TransportFor_WasteManagement",
    cwm."kpi_em_EmissionBy_Generation_of_Waste_Type",
    cwm.kpi_waste_generated_type,
    cwm.kpi_waste_quantity,
    cwm.kpi_waste_disposal_mechanism,
    cwm.kpi_weight,
    cwm."Number_Employees",
    cwm.waste_generation_intensity_per_employee
   FROM (cte_period cp
     LEFT JOIN cte_waste_management cwm ON ((((cwm.month)::double precision = (cp.month)::double precision) AND ((cwm.year)::double precision = cp.year))))
  WHERE (cwm.organization_id IS NOT NULL)
  ORDER BY cp.date;
CREATE VIEW public."View_test" AS
 SELECT o.id,
    o.name,
    o.metadata,
    o.is_deleted,
    o.created_at,
    o.updated_at,
    o.created_by,
    o.updated_by,
    o."Baselineyear",
    o."FinancialYearMonth"
   FROM public."Organization" o;
CREATE TABLE public."WasteMaster" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."WebCuration" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "formInvitationId" uuid NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    "startAt" timestamp with time zone DEFAULT now(),
    "endAt" timestamp with time zone DEFAULT now(),
    error jsonb DEFAULT '{"userMessage": "", "technicalError": ""}'::jsonb,
    "isRetry" boolean DEFAULT false NOT NULL,
    "triggeredByUserId" uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."Zone" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    metadata jsonb,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE TABLE public."testEmails" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "emailId" text NOT NULL,
    "ccEmailId" text NOT NULL,
    subject text NOT NULL,
    "invitationId" uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);
CREATE VIEW public.view_electricity_consumption_renewable_vs_non_reneweable AS
 WITH cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o_1."Baselineyear"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o_1."FinancialYearMonth"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            date_part('year'::text, cte_date.date) AS year,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            date_part('month'::text, cte_date.date) AS month,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        )
 SELECT DISTINCT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    k.organization_id,
    k.address_id,
    k.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
        CASE
            WHEN (k.energy_resource_type = 'nonrenewable'::text) THEN 'Non-Renewable'::text
            WHEN (k.energy_resource_type = 'renewable'::text) THEN 'Renewable'::text
            ELSE ''::text
        END AS energy_resource_type,
    (upper("left"(k.source, 1)) || lower(SUBSTRING(k.source FROM 2))) AS source,
        CASE
            WHEN ((k.energy_resource_type = ANY (ARRAY['nonrenewable'::text, 'renewable'::text])) AND (k.source = 'captive'::text)) THEN 'Captive'::text
            ELSE upper(k.contract_type)
        END AS contract_type,
    COALESCE(k.kpi_generated_units, (0.00)::double precision) AS consumption
   FROM (((((public."KPIEnergy" k
     LEFT JOIN cte_period cp ON (((cp.year = (k.year)::double precision) AND (cp.month = (k.month)::double precision))))
     LEFT JOIN public."Region" r ON ((k.region_id = r.id)))
     LEFT JOIN public."Organization" o ON ((k.organization_id = o.id)))
     LEFT JOIN public."OrganizationAddress" oad ON ((k.address_id = oad.id)))
     LEFT JOIN public."Addresses" a ON ((oad.address_id = a.id)))
  WHERE ((k.source = ANY (ARRAY['captive'::text, 'grid'::text])) AND (((TRIM(BOTH FROM lower(k.energy_resource_type)) = 'nonrenewable'::text) AND (TRIM(BOTH FROM lower(k.contract_type)) = 'ppa'::text)) = false))
  GROUP BY cp.date, cp.year, cp.financial_year, cp.full_month, cp.month, cp.quarter, k.organization_id, k.address_id, k.region_id, o.name, r.name, a.name, k.energy_resource_type, k.source, k.contract_type, k.kpi_generated_units
  ORDER BY cp.date;
CREATE VIEW public.view_global_filters AS
 WITH combineddata AS (
         SELECT "KPIMain".organization_id,
            "KPIMain".address_id,
            "KPIMain".region_id,
            "KPIMain".year,
            "KPIMain".month
           FROM public."KPIMain"
        UNION ALL
         SELECT "KPIEmissionByFuelConsumption".organization_id,
            "KPIEmissionByFuelConsumption".address_id,
            "KPIEmissionByFuelConsumption".region_id,
            "KPIEmissionByFuelConsumption".year,
            "KPIEmissionByFuelConsumption".month
           FROM public."KPIEmissionByFuelConsumption"
        UNION ALL
         SELECT "KPIEmissionByMaterialConsumption".organization_id,
            "KPIEmissionByMaterialConsumption".address_id,
            "KPIEmissionByMaterialConsumption".region_id,
            "KPIEmissionByMaterialConsumption".year,
            "KPIEmissionByMaterialConsumption".month
           FROM public."KPIEmissionByMaterialConsumption"
        UNION ALL
         SELECT "KPIEmissionByMaterialConsumption_Suppliers".organization_id,
            "KPIEmissionByMaterialConsumption_Suppliers".address_id,
            "KPIEmissionByMaterialConsumption_Suppliers".region_id,
            "KPIEmissionByMaterialConsumption_Suppliers".year,
            "KPIEmissionByMaterialConsumption_Suppliers".month
           FROM public."KPIEmissionByMaterialConsumption_Suppliers"
        UNION ALL
         SELECT "KPIEmissionByPowerConsumption".organization_id,
            "KPIEmissionByPowerConsumption".address_id,
            "KPIEmissionByPowerConsumption".region_id,
            "KPIEmissionByPowerConsumption".year,
            "KPIEmissionByPowerConsumption".month
           FROM public."KPIEmissionByPowerConsumption"
        UNION ALL
         SELECT "KPIEmissionByPowerConsumption_Vendors".organization_id,
            "KPIEmissionByPowerConsumption_Vendors".address_id,
            "KPIEmissionByPowerConsumption_Vendors".region_id,
            "KPIEmissionByPowerConsumption_Vendors".year,
            "KPIEmissionByPowerConsumption_Vendors".month
           FROM public."KPIEmissionByPowerConsumption_Vendors"
        UNION ALL
         SELECT "KPIEmissionByProducts".organization_id,
            "KPIEmissionByProducts".address_id,
            "KPIEmissionByProducts".region_id,
            "KPIEmissionByProducts".year,
            "KPIEmissionByProducts".month
           FROM public."KPIEmissionByProducts"
        UNION ALL
         SELECT "KPIEmissionByTransportation".organization_id,
            "KPIEmissionByTransportation".address_id,
            "KPIEmissionByTransportation".region_id,
            "KPIEmissionByTransportation".year,
            "KPIEmissionByTransportation".month
           FROM public."KPIEmissionByTransportation"
        UNION ALL
         SELECT "KPIEmissionByWasteGeneration".organization_id,
            "KPIEmissionByWasteGeneration".address_id,
            "KPIEmissionByWasteGeneration".region_id,
            "KPIEmissionByWasteGeneration".year,
            "KPIEmissionByWasteGeneration".month
           FROM public."KPIEmissionByWasteGeneration"
        UNION ALL
         SELECT "KPIEnergy".organization_id,
            "KPIEnergy".address_id,
            "KPIEnergy".region_id,
            "KPIEnergy".year,
            "KPIEnergy".month
           FROM public."KPIEnergy"
        UNION ALL
         SELECT "KPIWasteManagement".organization_id,
            "KPIWasteManagement".address_id,
            "KPIWasteManagement".region_id,
            "KPIWasteManagement".year,
            "KPIWasteManagement".month
           FROM public."KPIWasteManagement"
        UNION ALL
         SELECT "KPIWaterConsumption".organization_id,
            "KPIWaterConsumption".address_id,
            "KPIWaterConsumption".region_id,
            "KPIWaterConsumption".year,
            "KPIWaterConsumption".month
           FROM public."KPIWaterConsumption"
        )
 SELECT DISTINCT cbd.organization_id,
    cbd.address_id,
    cbd.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    (cbd.year)::integer AS year,
    (cbd.month)::integer AS month,
    to_char((to_date((cbd.month)::text, 'MM'::text))::timestamp with time zone, 'Month'::text) AS month_name,
        CASE
            WHEN ((cbd.month)::integer = ANY (ARRAY[1, 2, 3])) THEN concat(((cbd.year - (1)::numeric))::integer, '-', lpad((((cbd.year % (100)::numeric))::integer)::text, 2, '0'::text))
            ELSE concat((cbd.year)::integer, '-', lpad(((((cbd.year + (1)::numeric) % (100)::numeric))::integer)::text, 2, '0'::text))
        END AS financial_year
   FROM ((((combineddata cbd
     LEFT JOIN public."Region" r ON ((cbd.region_id = r.id)))
     LEFT JOIN public."Organization" o ON ((cbd.organization_id = o.id)))
     LEFT JOIN public."OrganizationAddress" oad ON ((cbd.address_id = oad.id)))
     LEFT JOIN public."Addresses" a ON ((oad.address_id = a.id)))
  ORDER BY ((cbd.year)::integer), ((cbd.month)::integer);
CREATE VIEW public.view_overall_emission_from_kpi_main AS
 WITH cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o_1."Baselineyear"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)), '-', ( SELECT o_1."FinancialYearMonth"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    k.organization_id,
    k.address_id,
    k.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    a.type AS location_type,
    k."kpi_em_Cont_TotalEmission_Categories_Energy" AS total_emissions_from_energy,
    k."kpi_em_Total_Emission" AS total_emission,
    k."kpi_em_Total_Emission_Scope1" AS scope1,
    k."kpi_em_Total_Emission_Scope2" AS scope2,
    k."kpi_em_Total_Emission_Scope3" AS scope3,
    k."kpi_em_CurrentEmissionIntensity_PerTonProduction" AS per_tonne_production,
    k."kpi_em_CurrentEmissionIntensity_PerEmployee" AS per_employee,
    k."kpi_em_CurrentEmissionIntensity_PerProduct" AS per_product,
    k."kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct",
    k."kpi_em_CurrentEmissionIntensity_Scope3_PerProduct"
   FROM (((((public."KPIMain" k
     LEFT JOIN cte_period cp ON (((
        CASE
            WHEN ((k.month)::double precision = ANY (ARRAY[(1)::double precision, (2)::double precision, (3)::double precision])) THEN ((k.year)::double precision - (1)::double precision)
            ELSE (k.year)::double precision
        END = (cp.financial_year)::double precision) AND ((k.month)::double precision = (cp.month)::double precision))))
     LEFT JOIN public."Region" r ON ((k.region_id = r.id)))
     LEFT JOIN public."Organization" o ON ((k.organization_id = o.id)))
     LEFT JOIN public."OrganizationAddress" oad ON ((k.address_id = oad.id)))
     LEFT JOIN public."Addresses" a ON ((oad.address_id = a.id)))
  ORDER BY cp.date;
CREATE VIEW public.view_total_electricity_consumption AS
 WITH cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o_1."Baselineyear"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o_1."FinancialYearMonth"
                   FROM public."Organization" o_1
                  WHERE (o_1.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            date_part('year'::text, cte_date.date) AS year,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            date_part('month'::text, cte_date.date) AS month,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    k.organization_id,
    k.address_id,
    k.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    sum(k.kpi_generated_units) AS total_clectricity_consumption
   FROM (((((public."KPIEnergy" k
     LEFT JOIN cte_period cp ON (((cp.year = (k.year)::double precision) AND (cp.month = (k.month)::double precision))))
     LEFT JOIN public."Region" r ON ((k.region_id = r.id)))
     LEFT JOIN public."Organization" o ON ((k.organization_id = o.id)))
     LEFT JOIN public."OrganizationAddress" oad ON ((k.address_id = oad.id)))
     LEFT JOIN public."Addresses" a ON ((oad.address_id = a.id)))
  WHERE ((k.source = 'captive'::text) OR ((k.energy_resource_type = ''::text) AND (k.source = 'grid'::text)))
  GROUP BY k.year, k.month, cp.date, cp.year, cp.financial_year, cp.full_month, cp.month, cp.quarter, k.organization_id, k.address_id, k.region_id, o.name, r.name, a.name
  ORDER BY cp.date;
CREATE VIEW public.view_total_fuel_consumption AS
 WITH cte_date AS (
         SELECT (generate_series(((date_trunc('month'::text, ((concat(( SELECT "Organization"."Baselineyear"
                   FROM public."Organization"
                  WHERE ("Organization".id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT "Organization"."FinancialYearMonth"
                   FROM public."Organization"
                  WHERE ("Organization".id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone))::date)::timestamp with time zone, (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            date_part('year'::text, cte_date.date) AS year,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            date_part('month'::text, cte_date.date) AS month,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cp.full_month,
    cp.month,
    cp.quarter,
    org.organization_id,
    org.address_id,
    org.region_id,
    o.name AS organization_name,
    r.name AS region_name,
    a.name AS location_name,
    COALESCE(sum(k.quantity), (0)::double precision) AS total_fuel_consumption
   FROM ((((((cte_period cp
     CROSS JOIN ( SELECT DISTINCT k_1.organization_id,
            k_1.address_id,
            k_1.region_id
           FROM public."KPIEnergy" k_1) org)
     LEFT JOIN public."KPIEnergy" k ON (((k.organization_id = org.organization_id) AND (k.address_id = org.address_id) AND (k.region_id = org.region_id) AND (cp.year = (k.year)::double precision) AND (cp.month = (k.month)::double precision) AND (k.source = 'fuel_purchased'::text) AND (k.purpose = 'general'::text) AND (k.resource = 'Diesel'::text))))
     LEFT JOIN public."Region" r ON ((org.region_id = r.id)))
     LEFT JOIN public."Organization" o ON ((org.organization_id = o.id)))
     LEFT JOIN public."OrganizationAddress" oad ON ((org.address_id = oad.id)))
     LEFT JOIN public."Addresses" a ON ((oad.address_id = a.id)))
  GROUP BY cp.date, cp.year, cp.financial_year, cp.full_month, cp.month, cp.quarter, org.organization_id, org.address_id, org.region_id, o.name, r.name, a.name
  ORDER BY cp.date;
CREATE VIEW public.view_transport_emission AS
 WITH cte_address AS (
         SELECT a.name AS address_name,
            oa.id AS organization_address_id,
            a.city_id,
            c.name AS city_name,
            a.state_id,
            s.name AS state_name
           FROM (((public."OrganizationAddress" oa
             JOIN public."Addresses" a ON ((a.id = oa.address_id)))
             JOIN public."City" c ON ((c.id = a.city_id)))
             JOIN public."State" s ON ((s.id = a.state_id)))
        ), cte_date AS (
         SELECT (generate_series(date_trunc('month'::text, ((concat(( SELECT o."Baselineyear"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-', ( SELECT o."FinancialYearMonth"
                   FROM public."Organization" o
                  WHERE (o.id = 'cfe37694-341f-4ff7-afe4-97e0e77eaf7e'::uuid)
                 LIMIT 1), '-01'))::date)::timestamp with time zone), (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) - '1 day'::interval), '1 mon'::interval))::date AS date
        ), cte_period AS (
         SELECT cte_date.date,
            to_char((cte_date.date)::timestamp with time zone, 'Month'::text) AS full_month,
            EXTRACT(month FROM cte_date.date) AS month,
            date_part('year'::text, cte_date.date) AS year,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', (EXTRACT(year FROM cte_date.date) - (1)::numeric))
                    ELSE concat('Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)), ' - ', EXTRACT(year FROM cte_date.date))
                END AS quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN concat(to_char(((EXTRACT(year FROM cte_date.date) - (1)::numeric) % (100)::numeric), 'FM00'::text), '-', to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                    ELSE concat(to_char((EXTRACT(year FROM cte_date.date) % (100)::numeric), 'FM00'::text), '-', to_char(((EXTRACT(year FROM cte_date.date) + (1)::numeric) % (100)::numeric), 'FM00'::text), ' Q', EXTRACT(quarter FROM (cte_date.date - '3 mons'::interval)))
                END AS financial_year_quarter,
                CASE
                    WHEN (EXTRACT(month FROM cte_date.date) = ANY (ARRAY[(1)::numeric, (2)::numeric, (3)::numeric])) THEN (EXTRACT(year FROM cte_date.date) - (1)::numeric)
                    ELSE EXTRACT(year FROM cte_date.date)
                END AS financial_year
           FROM cte_date
        ), cte_transport AS (
         SELECT kebt.id,
            kebt.month,
            kebt.year,
            ca.city_id,
            ca.city_name,
            ca.state_id,
            ca.state_name,
            kebt.address_id,
            ca.address_name AS location_address,
            kebt.organization_id,
            o.name AS organization_name,
            kebt.region_id,
            r.name AS region_name,
            kebt."kpi_em_TotalEmission_Transport",
            kebt."kpi_em_UpstreamTransport",
            kebt."kpi_em_DownstreamTransport",
            kebt."kpi_em_Transport_WasteManagement",
            kebt."kpi_em_BusinessTravel",
            kebt."kpi_em_EmployeeTravel",
            kebt."kpi_em_InternalTransport",
            COALESCE(sum(DISTINCT (((elem.modes -> 'mode_of_transport'::text) ->> 'road_emission'::text))::numeric), (0)::numeric) AS "kpi_em_Mode_Road",
            COALESCE(sum(DISTINCT (((elem.modes -> 'mode_of_transport'::text) ->> 'rail_emission'::text))::numeric), (0)::numeric) AS "kpi_em_Mode_Rail",
            COALESCE(sum(DISTINCT (((elem.modes -> 'mode_of_transport'::text) ->> 'water_emission'::text))::numeric), (0)::numeric) AS "kpi_em_Mode_Water",
            COALESCE(sum(DISTINCT (((elem.modes -> 'mode_of_transport'::text) ->> 'air_emission'::text))::numeric), (0)::numeric) AS "kpi_em_Mode_Air",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'diesel'::text))::numeric), (0)::numeric) AS "kpi_em_Diesel_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'biodiesel'::text))::numeric), (0)::numeric) AS "kpi_em_Biodiesel_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'gasoline'::text))::numeric), (0)::numeric) AS "kpi_em_Gasoline_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'cng'::text))::numeric), (0)::numeric) AS "kpi_em_CNG_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'lpg'::text))::numeric), (0)::numeric) AS "kpi_em_LPG_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'electric'::text))::numeric), (0)::numeric) AS "kpi_em_Electric_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'ethanol'::text))::numeric), (0)::numeric) AS "kpi_em_Ethanol_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'gaseous_nitrogen'::text))::numeric), (0)::numeric) AS "kpi_em_Gaseous_Nitrogen_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'gaseous_oxygen'::text))::numeric), (0)::numeric) AS "kpi_em_Gaseous_Oxygen_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'liquid_nitrogen'::text))::numeric), (0)::numeric) AS "kpi_em_Liquid_Nitrogen_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'compressed_air'::text))::numeric), (0)::numeric) AS "kpi_em_Compressed_Air_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'jet_fuel'::text))::numeric), (0)::numeric) AS "kpi_em_Jet_Fuel_Consumption",
            COALESCE(sum(DISTINCT (((elem.modes -> 'fuels'::text) ->> 'saf'::text))::numeric), (0)::numeric) AS "kpi_em_SAF_Consumption"
           FROM ((((public."KPIEmissionByTransportation" kebt
             JOIN public."Organization" o ON ((o.id = kebt.organization_id)))
             JOIN public."Region" r ON ((r.id = kebt.region_id)))
             LEFT JOIN cte_address ca ON ((ca.organization_address_id = kebt.address_id)))
             LEFT JOIN LATERAL jsonb_array_elements(kebt."kpi_em_Modes_and_Fuel_Types") elem(modes) ON (true))
          GROUP BY kebt.id, kebt.month, kebt.year, ca.city_id, ca.city_name, ca.state_id, ca.state_name, kebt.address_id, ca.address_name, kebt.organization_id, o.name, kebt.region_id, r.name, kebt."kpi_em_TotalEmission_Transport", kebt."kpi_em_UpstreamTransport", kebt."kpi_em_DownstreamTransport", kebt."kpi_em_Transport_WasteManagement", kebt."kpi_em_BusinessTravel", kebt."kpi_em_EmployeeTravel", kebt."kpi_em_InternalTransport"
        )
 SELECT cp.date,
    cp.year,
    cp.financial_year,
    concat(cp.financial_year, '-', ((cp.financial_year + (1)::numeric) - (2000)::numeric)) AS financial_year_new,
    cp.full_month,
    cp.quarter,
    cp.financial_year_quarter,
    ct.organization_id,
    ct.organization_name,
    ct.city_name,
    ct.state_name,
    ct.location_address,
    ct.region_name,
    ct."kpi_em_TotalEmission_Transport",
    ct."kpi_em_UpstreamTransport",
    ct."kpi_em_DownstreamTransport",
    ct."kpi_em_Transport_WasteManagement",
    ct."kpi_em_BusinessTravel",
    ct."kpi_em_EmployeeTravel",
    ct."kpi_em_InternalTransport",
    ct."kpi_em_Mode_Road",
    ct."kpi_em_Mode_Rail",
    ct."kpi_em_Mode_Air",
    ct."kpi_em_Mode_Water",
    ct."kpi_em_Diesel_Consumption",
    ct."kpi_em_Biodiesel_Consumption",
    ct."kpi_em_Gasoline_Consumption",
    ct."kpi_em_CNG_Consumption",
    ct."kpi_em_LPG_Consumption",
    ct."kpi_em_Electric_Consumption",
    ct."kpi_em_Ethanol_Consumption",
    ct."kpi_em_Gaseous_Nitrogen_Consumption",
    ct."kpi_em_Gaseous_Oxygen_Consumption",
    ct."kpi_em_Liquid_Nitrogen_Consumption",
    ct."kpi_em_Compressed_Air_Consumption",
    ct."kpi_em_Jet_Fuel_Consumption",
    ct."kpi_em_SAF_Consumption"
   FROM (cte_period cp
     LEFT JOIN cte_transport ct ON ((((ct.month)::double precision = (cp.month)::double precision) AND ((ct.year)::double precision = cp.year))))
  WHERE (ct.organization_id IS NOT NULL)
  ORDER BY cp.date;
ALTER TABLE ONLY public."AIBulkDocumentProcessing"
    ADD CONSTRAINT "AIBulkDocumentProcessing_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ActivityMaster"
    ADD CONSTRAINT "ActivityMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_code_key" UNIQUE (code);
ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AddressDistance"
    ADD CONSTRAINT "AddressDistance_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AddressType"
    ADD CONSTRAINT "AddressType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AnswerFile"
    ADD CONSTRAINT "AnswerFile_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_submissionId_questionId_formFieldId_key" UNIQUE ("submissionId", "questionId", "formFieldId");
ALTER TABLE ONLY public."AppGlobalMaster"
    ADD CONSTRAINT "AppGlobalMaster_key_key" UNIQUE (key);
ALTER TABLE ONLY public."AppGlobalMaster"
    ADD CONSTRAINT "AppGlobalMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AppRole"
    ADD CONSTRAINT "AppRole_name_key" UNIQUE (name);
ALTER TABLE ONLY public."AppRole"
    ADD CONSTRAINT "AppRole_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_email_key" UNIQUE (email);
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_name_key" UNIQUE (name);
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."AssessorConsultantMapping"
    ADD CONSTRAINT "AssessorConsultantMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."CO2EmissionFactorMaster"
    ADD CONSTRAINT "CO2EmissionFactorMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."CompanyFormFundtype"
    ADD CONSTRAINT "CompanyFormFundtype_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_companyId_formId_key" UNIQUE ("companyId", "formId");
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Country"
    ADD CONSTRAINT "Country_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."DataImportHistory"
    ADD CONSTRAINT "DataImportHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."EmailConfiguration"
    ADD CONSTRAINT "EmailConfig_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."EmailNotifications"
    ADD CONSTRAINT "EmailNotifications_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FormDetails"
    ADD CONSTRAINT "FormDetails_formId_key" UNIQUE ("formId");
ALTER TABLE ONLY public."FormDetails"
    ADD CONSTRAINT "FormDetails_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_submissionId_sectionId_questionId_key" UNIQUE ("submissionId", "sectionId", "questionId");
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Form"
    ADD CONSTRAINT "Form_name_key" UNIQUE (name);
ALTER TABLE ONLY public."Form"
    ADD CONSTRAINT "Form_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FuelQualityMaster"
    ADD CONSTRAINT "FuelQualityMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."FuelTypeMaster"
    ADD CONSTRAINT "FuelTypeMaster_code_key" UNIQUE (code);
ALTER TABLE ONLY public."FuelTypeMaster"
    ADD CONSTRAINT "FuelTypeMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEffluentDischarge"
    ADD CONSTRAINT "GHGEffluentDischarge_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Auxiliary"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Auxiliary_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_General"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_General_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_HeatingWater"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_HeatingWater_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Transportation_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_NonRenewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_NonRenewable_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_Renewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_Renewable_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGFreshWater"
    ADD CONSTRAINT "GHGFreshWater_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGHarvestedWater"
    ADD CONSTRAINT "GHGHarvestedWater_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGSludgeDisposal"
    ADD CONSTRAINT "GHGSludgeDisposal_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGTransport_BusinessTravel"
    ADD CONSTRAINT "GHGTransport_BusinessTravel_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGWasteWaterTreatment"
    ADD CONSTRAINT "GHGWasteWaterTreatment_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGWasteWater"
    ADD CONSTRAINT "GHGWasteWater_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGWastewaterGeneration"
    ADD CONSTRAINT "GHGWastewaterGeneration_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_formId_groupFormId_key" UNIQUE ("formId", "groupFormId");
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_formFieldId_submissionId_questionId_key" UNIQUE ("formFieldId", "submissionId", "questionId");
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Interim_Comments"
    ADD CONSTRAINT "Interim_Comments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Interim_Recommendation"
    ADD CONSTRAINT "Interim_Recommendation_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByFuelConsumption"
    ADD CONSTRAINT "KPIEmissionByFuelConsumption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByMaterialConsumption_Suppliers"
    ADD CONSTRAINT "KPIEmissionByMaterialConsumption_Suppliers_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByMaterialConsumption"
    ADD CONSTRAINT "KPIEmissionByMaterialConsumption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByPowerConsumption_Vendors"
    ADD CONSTRAINT "KPIEmissionByPowerConsumption_Vendors_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByPowerConsumption"
    ADD CONSTRAINT "KPIEmissionByPowerConsumption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByProducts"
    ADD CONSTRAINT "KPIEmissionByProducts_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByTransportation"
    ADD CONSTRAINT "KPIEmissionByTransportation_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEmissionByWasteGeneration"
    ADD CONSTRAINT "KPIEmissionByWasteGeneration_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIEnergy"
    ADD CONSTRAINT "KPIEnergy_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIMain"
    ADD CONSTRAINT "KPIMain_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIWasteManagement"
    ADD CONSTRAINT "KPIWasteManagement_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."KPIWaterConsumption"
    ADD CONSTRAINT "KPIWaterConsumption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgBrandMaster"
    ADD CONSTRAINT "OrgBrandMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgMaterialMaster"
    ADD CONSTRAINT "OrgMaterialMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgSKUMaster"
    ADD CONSTRAINT "OrgSKUMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrgSupplierMaster"
    ADD CONSTRAINT "OrgSupplierMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrganizationActivityMapping"
    ADD CONSTRAINT "OrganizationActivityMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."OrganizationAddress"
    ADD CONSTRAINT "OrganizationAddress_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_pkey" PRIMARY KEY ("Id");
ALTER TABLE ONLY public."Platform"
    ADD CONSTRAINT "Platform_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."RaraValidationAndRating"
    ADD CONSTRAINT "RaraValidationAndRating_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Report_esg_investee_environmental_impact"
    ADD CONSTRAINT "Report_esg_environmental_impact_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Report_esg_investee_policysummary"
    ADD CONSTRAINT "Report_esg_investee_policysummary_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Report_esg_investee_score"
    ADD CONSTRAINT "Report_esg_investee_score_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."SourceFiles"
    ADD CONSTRAINT "SourceFiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT "Sources_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."SuggestedDocuments"
    ADD CONSTRAINT "SuggestedDocuments_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT "SuggestionSourceMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."SupplierAddressMapping"
    ADD CONSTRAINT "SupplierAddressMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."TaskRequest"
    ADD CONSTRAINT "TaskRequest_organization_address_id_month_year_key" UNIQUE (organization_address_id, month, year);
ALTER TABLE ONLY public."TaskRequest"
    ADD CONSTRAINT "TaskRequest_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."TravelDistance"
    ADD CONSTRAINT "TravelDistance_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."UomConversionMaster"
    ADD CONSTRAINT "UomConversionMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."UomMaster"
    ADD CONSTRAINT "UomMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."UsermodulePermission"
    ADD CONSTRAINT "UsermodulePermission_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_pkey" PRIMARY KEY ("Id");
ALTER TABLE ONLY public."VehicleTypeMaster"
    ADD CONSTRAINT "VehicleTypeMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."WasteMaster"
    ADD CONSTRAINT "WasteMaster_name_key" UNIQUE (name);
ALTER TABLE ONLY public."WasteMaster"
    ADD CONSTRAINT "WasteMaster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."WebCuration"
    ADD CONSTRAINT "WebCurationLogs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Zone"
    ADD CONSTRAINT "Zone_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."testEmails"
    ADD CONSTRAINT "testEmails_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."SourceFiles"
    ADD CONSTRAINT unique_original_file_url UNIQUE ("originalFileUrl");
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT unique_suggestionid_sourceid UNIQUE ("suggestionId", "sourceId");
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT unique_url_forminvitationid UNIQUE (url, "formInvitationId");
CREATE TRIGGER "set_public_AIBulkDocumentProcessing_updated_at" BEFORE UPDATE ON public."AIBulkDocumentProcessing" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_AddressType_updated_at" BEFORE UPDATE ON public."AddressType" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_Answer_updated_at" BEFORE UPDATE ON public."Answer" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_ESGEmployeeDiversity_updated_at" BEFORE UPDATE ON public."ESGEmployeeDiversity" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_ESGEmployeeTurnover_updated_at" BEFORE UPDATE ON public."ESGEmployeeTurnover" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_EmailConfig_updated_at" BEFORE UPDATE ON public."EmailConfiguration" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_EmailTemplate_updated_at" BEFORE UPDATE ON public."EmailTemplate" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_FormField_updated_at" BEFORE UPDATE ON public."FormField" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_FormResult_updated_at" BEFORE UPDATE ON public."FormResult" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_Platform_updated_at" BEFORE UPDATE ON public."Platform" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_Question_updated_at" BEFORE UPDATE ON public."Question" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE TRIGGER "set_public_Section_updated_at" BEFORE UPDATE ON public."Section" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
ALTER TABLE ONLY public."AIBulkDocumentProcessing"
    ADD CONSTRAINT "AIBulkDocumentProcessing_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AIBulkDocumentProcessing"
    ADD CONSTRAINT "AIBulkDocumentProcessing_formInvitationId_fkey" FOREIGN KEY ("formInvitationId") REFERENCES public."FormInvitation"(id);
ALTER TABLE ONLY public."AIBulkDocumentProcessing"
    ADD CONSTRAINT "AIBulkDocumentProcessing_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityMaster"
    ADD CONSTRAINT "ActivityMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityMaster"
    ADD CONSTRAINT "ActivityMaster_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityMaster"
    ADD CONSTRAINT "ActivityMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public."Activity"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ActivityTaskRequest"
    ADD CONSTRAINT "ActivityTaskRequest_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_parent_code_fkey" FOREIGN KEY (parent_code) REFERENCES public."Activity"(code) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AddressDistance"
    ADD CONSTRAINT "AddressDistance_from_address_id_fkey" FOREIGN KEY (from_address_id) REFERENCES public."Addresses"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AddressDistance"
    ADD CONSTRAINT "AddressDistance_to_address_id_fkey" FOREIGN KEY (to_address_id) REFERENCES public."Addresses"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AddressType"
    ADD CONSTRAINT "AddressType_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AddressType"
    ADD CONSTRAINT "AddressType_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_city_id_fkey" FOREIGN KEY (city_id) REFERENCES public."City"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_country_id_fkey" FOREIGN KEY (country_id) REFERENCES public."Country"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_state_id_fkey" FOREIGN KEY (state_id) REFERENCES public."State"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AnswerFile"
    ADD CONSTRAINT "AnswerFile_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES public."Answer"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AnswerFile"
    ADD CONSTRAINT "AnswerFile_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AnswerFile"
    ADD CONSTRAINT "AnswerFile_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."FormSubmission"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppGlobalMaster"
    ADD CONSTRAINT "AppGlobalMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppGlobalMaster"
    ADD CONSTRAINT "AppGlobalMaster_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES public."Platform"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppGlobalMaster"
    ADD CONSTRAINT "AppGlobalMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppRole"
    ADD CONSTRAINT "AppRole_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppRole"
    ADD CONSTRAINT "AppRole_parent_role_id_fkey" FOREIGN KEY (parent_role_id) REFERENCES public."AppRole"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppRole"
    ADD CONSTRAINT "AppRole_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_role_fkey" FOREIGN KEY (role) REFERENCES public."AppRole"(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AppUser"
    ADD CONSTRAINT "AppUser_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_FormFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_FormId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_InvitationId_fkey" FOREIGN KEY ("InvitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_QuestionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_parentCompanyMappingId_fkey" FOREIGN KEY ("parentCompanyMappingId") REFERENCES public."ParentCompanyMapping"("Id") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."AppRole"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssesseeUserMapping"
    ADD CONSTRAINT "AssesseeUserMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssessorConsultantMapping"
    ADD CONSTRAINT "AssessorConsultantMapping_assessorCompanyId_fkey" FOREIGN KEY ("assessorCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssessorConsultantMapping"
    ADD CONSTRAINT "AssessorConsultantMapping_consultantCompanyId_fkey" FOREIGN KEY ("consultantCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."AssessorConsultantMapping"
    ADD CONSTRAINT "AssessorConsultantMapping_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CO2EmissionFactorMaster"
    ADD CONSTRAINT "CO2EmissionFactorMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CO2EmissionFactorMaster"
    ADD CONSTRAINT "CO2EmissionFactorMaster_region_fkey" FOREIGN KEY (region) REFERENCES public."Region"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CO2EmissionFactorMaster"
    ADD CONSTRAINT "CO2EmissionFactorMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_state_id_fkey" FOREIGN KEY (state_id) REFERENCES public."State"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyFormFundtype"
    ADD CONSTRAINT "CompanyFormFundtype_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyFormFundtype"
    ADD CONSTRAINT "CompanyFormFundtype_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyFormFundtype"
    ADD CONSTRAINT "CompanyFormFundtype_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyFormFundtype"
    ADD CONSTRAINT "CompanyFormFundtype_vcCompanyId_fkey" FOREIGN KEY ("vcCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."CompanyForm"
    ADD CONSTRAINT "CompanyForm_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Country"
    ADD CONSTRAINT "Country_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Country"
    ADD CONSTRAINT "Country_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."DataImportHistory"
    ADD CONSTRAINT "DataImportHistory_activity_code_fkey" FOREIGN KEY (activity_code) REFERENCES public."Activity"(code) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."DataImportHistory"
    ADD CONSTRAINT "DataImportHistory_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."DataImportHistory"
    ADD CONSTRAINT "DataImportHistory_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."DataImportHistory"
    ADD CONSTRAINT "DataImportHistory_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGBoardComposition"
    ADD CONSTRAINT "ESGBoardComposition_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGCSR"
    ADD CONSTRAINT "ESGCSR_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeDiversity"
    ADD CONSTRAINT "ESGEmployeeDiversity_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGEmployeeTurnover"
    ADD CONSTRAINT "ESGEmployeeTurnover_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGovernance"
    ADD CONSTRAINT "ESGGovernance_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGGrievances"
    ADD CONSTRAINT "ESGGrievances_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGHealthAndSafety"
    ADD CONSTRAINT "ESGHealthAndSafety_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ESGTrainingHours"
    ADD CONSTRAINT "ESGTrainingHours_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailConfiguration"
    ADD CONSTRAINT "EmailConfig_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES public."Platform"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailConfiguration"
    ADD CONSTRAINT "EmailConfiguration_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailConfiguration"
    ADD CONSTRAINT "EmailConfiguration_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailNotifications"
    ADD CONSTRAINT "EmailNotifications_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailNotifications"
    ADD CONSTRAINT "EmailNotifications_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES public."Platform"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormDetails"
    ADD CONSTRAINT "FormDetails_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormDetails"
    ADD CONSTRAINT "FormDetails_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormDetails"
    ADD CONSTRAINT "FormDetails_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_ParentCompanyMappingId_fkey" FOREIGN KEY ("ParentCompanyMappingId") REFERENCES public."ParentCompanyMapping"("Id") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormInvitation"
    ADD CONSTRAINT "FormInvitation_parentcompanyId_fkey" FOREIGN KEY ("parentcompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."FormSubmission"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormResult"
    ADD CONSTRAINT "FormResult_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FormSubmission"
    ADD CONSTRAINT "FormSubmission_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Form"
    ADD CONSTRAINT "Form_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Form"
    ADD CONSTRAINT "Form_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FuelQualityMaster"
    ADD CONSTRAINT "FuelQualityMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FuelQualityMaster"
    ADD CONSTRAINT "FuelQualityMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FuelTypeMaster"
    ADD CONSTRAINT "FuelTypeMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."FuelTypeMaster"
    ADD CONSTRAINT "FuelTypeMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGBuyer_Share"
    ADD CONSTRAINT "GHGBuyer_Share_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_HeatingWater"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPur_GHGEnergyConsumption_FuelPur_fkey1" FOREIGN KEY ("GHGEnergyConsumption_FuelPurchased_id") REFERENCES public."GHGEnergyConsumption_FuelPurchased"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Auxiliary"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPur_GHGEnergyConsumption_FuelPur_fkey2" FOREIGN KEY ("GHGEnergyConsumption_FuelPurchased_id") REFERENCES public."GHGEnergyConsumption_FuelPurchased"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_General"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurc_GHGEnergyConsumption_FuelPur_fkey" FOREIGN KEY ("GHGEnergyConsumption_FuelPurchased_id") REFERENCES public."GHGEnergyConsumption_FuelPurchased"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchas_activity_task_request_id_fkey1" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchase_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchase_organization_address_id_fkey1" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Auxiliary"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Auxiliary_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Auxiliary"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Auxiliary_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_General"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_General_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_General"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_General_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_HeatingWater"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_HeatingWater_created_by_f" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_HeatingWater"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_HeatingWater_updated_by_f" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Transpo_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Transportation_created_by" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased_Transportation"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_Transportation_updated_by" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_FuelPurchased"
    ADD CONSTRAINT "GHGEnergyConsumption_FuelPurchased_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergyConsumption_GridPower"
    ADD CONSTRAINT "GHGEnergyConsumption_GridPower_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_NonRenewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_NonRen_GHGEnergyConsumption_Captive_fkey" FOREIGN KEY ("GHGEnergyConsumption_CaptivePower_id") REFERENCES public."GHGEnergy_CaptivePower"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_Renewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_Renewa_GHGEnergyConsumption_Captive_fkey" FOREIGN KEY ("GHGEnergyConsumption_CaptivePower_id") REFERENCES public."GHGEnergy_CaptivePower"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_Renewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_Renewable_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower_Renewable"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_Renewable_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGEnergy_CaptivePower"
    ADD CONSTRAINT "GHGEnergy_CaptivePower_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGFreshWater"
    ADD CONSTRAINT "GHGFreshWater_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGFreshWater"
    ADD CONSTRAINT "GHGFreshWater_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGFreshWater"
    ADD CONSTRAINT "GHGFreshWater_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGGeneralDetails"
    ADD CONSTRAINT "GHGGeneralDetails_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGHarvestedWater"
    ADD CONSTRAINT "GHGHarvestedWater_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGHarvestedWater"
    ADD CONSTRAINT "GHGHarvestedWater_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGHarvestedWater"
    ADD CONSTRAINT "GHGHarvestedWater_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGMaterialProcurement"
    ADD CONSTRAINT "GHGMaterialProcurement_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGProductionDetails"
    ADD CONSTRAINT "GHGProductionDetails_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_BusinessTravel"
    ADD CONSTRAINT "GHGTransport_BusinessTravel_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_BusinessTravel"
    ADD CONSTRAINT "GHGTransport_BusinessTravel_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_BusinessTravel"
    ADD CONSTRAINT "GHGTransport_BusinessTravel_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Downstream"
    ADD CONSTRAINT "GHGTransport_Downstream_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_EmployeeTravel"
    ADD CONSTRAINT "GHGTransport_EmployeeTravel_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGTransport_Upstream"
    ADD CONSTRAINT "GHGTransport_Upstream_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWasteWater"
    ADD CONSTRAINT "GHGWasteWater_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWasteWater"
    ADD CONSTRAINT "GHGWasteWater_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWasteWater"
    ADD CONSTRAINT "GHGWasteWater_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaste"
    ADD CONSTRAINT "GHGWaste_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_activity_task_request_id_fkey" FOREIGN KEY (activity_task_request_id) REFERENCES public."ActivityTaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_task_request_id_fkey" FOREIGN KEY (task_request_id) REFERENCES public."TaskRequest"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GHGWaterWithdrawal"
    ADD CONSTRAINT "GHGWaterWithdrawal_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_groupFormId_fkey" FOREIGN KEY ("groupFormId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."GroupForm"
    ADD CONSTRAINT "GroupForm_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_interimAnswerId_fkey" FOREIGN KEY ("interimAnswerId") REFERENCES public."Interim_Answer"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."FormSubmission"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InterimFormLogs"
    ADD CONSTRAINT "InterimFormLogs_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES public."Answer"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_interim_answer_id_fkey" FOREIGN KEY (interim_answer_id) REFERENCES public."Interim_Answer"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."FormSubmission"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Answer"
    ADD CONSTRAINT "Interim_Answer_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Comments"
    ADD CONSTRAINT "Interim_Comments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Comments"
    ADD CONSTRAINT "Interim_Comments_interim_recommendation_id_fkey" FOREIGN KEY (interim_recommendation_id) REFERENCES public."Interim_Recommendation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Comments"
    ADD CONSTRAINT "Interim_Comments_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Comments"
    ADD CONSTRAINT "Interim_Comments_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Recommendation"
    ADD CONSTRAINT "Interim_Recommendation_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Recommendation"
    ADD CONSTRAINT "Interim_Recommendation_interim_answer_id_fkey" FOREIGN KEY (interim_answer_id) REFERENCES public."Interim_Answer"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Recommendation"
    ADD CONSTRAINT "Interim_Recommendation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Interim_Recommendation"
    ADD CONSTRAINT "Interim_Recommendation_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationComment"
    ADD CONSTRAINT "InvitationComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_consultantCompanyId_fkey" FOREIGN KEY ("consultantCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_consultantUserId_fkey" FOREIGN KEY ("consultantUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."InvitationConsultantMapping"
    ADD CONSTRAINT "InvitationConsultantMapping_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgBrandMaster"
    ADD CONSTRAINT "OrgBrandMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgBrandMaster"
    ADD CONSTRAINT "OrgBrandMaster_oranization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgBrandMaster"
    ADD CONSTRAINT "OrgBrandMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgMaterialMaster"
    ADD CONSTRAINT "OrgMaterialMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgMaterialMaster"
    ADD CONSTRAINT "OrgMaterialMaster_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgMaterialMaster"
    ADD CONSTRAINT "OrgMaterialMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_org_brand_master_id_fkey" FOREIGN KEY (org_brand_master_id) REFERENCES public."OrgBrandMaster"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgProductMaster"
    ADD CONSTRAINT "OrgProductMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSKUMaster"
    ADD CONSTRAINT "OrgSKUMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSKUMaster"
    ADD CONSTRAINT "OrgSKUMaster_org_product_master_id_fkey" FOREIGN KEY (org_product_master_id) REFERENCES public."OrgProductMaster"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSKUMaster"
    ADD CONSTRAINT "OrgSKUMaster_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSKUMaster"
    ADD CONSTRAINT "OrgSKUMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_org_material_master_id_fkey" FOREIGN KEY (org_material_master_id) REFERENCES public."OrgMaterialMaster"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_org_sku_master_id_fkey" FOREIGN KEY (org_sku_master_id) REFERENCES public."OrgSKUMaster"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSkuBomMaster"
    ADD CONSTRAINT "OrgSkuBomMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSupplierMaster"
    ADD CONSTRAINT "OrgSupplierMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSupplierMaster"
    ADD CONSTRAINT "OrgSupplierMaster_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrgSupplierMaster"
    ADD CONSTRAINT "OrgSupplierMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationActivityMapping"
    ADD CONSTRAINT "OrganizationActivityMapping_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public."Activity"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationActivityMapping"
    ADD CONSTRAINT "OrganizationActivityMapping_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationActivityMapping"
    ADD CONSTRAINT "OrganizationActivityMapping_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationActivityMapping"
    ADD CONSTRAINT "OrganizationActivityMapping_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationAddress"
    ADD CONSTRAINT "OrganizationAddress_address_id_fkey" FOREIGN KEY (address_id) REFERENCES public."Addresses"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationAddress"
    ADD CONSTRAINT "OrganizationAddress_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationAddress"
    ADD CONSTRAINT "OrganizationAddress_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."OrganizationAddress"
    ADD CONSTRAINT "OrganizationAddress_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES public."Platform"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_AddressId_fkey" FOREIGN KEY ("AddressId") REFERENCES public."Addresses"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_CompanyId_fkey" FOREIGN KEY ("CompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_ParentCompanyId_fkey" FOREIGN KEY ("ParentCompanyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_ParentUserId_fkey" FOREIGN KEY ("ParentUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ParentCompanyMapping"
    ADD CONSTRAINT "ParentCompanyMapping_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Platform"
    ADD CONSTRAINT "Platform_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Platform"
    ADD CONSTRAINT "Platform_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_parentQuestionId_fkey" FOREIGN KEY ("parentQuestionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."RaraValidationAndRating"
    ADD CONSTRAINT "RaraValidationAndRating_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."RaraValidationAndRating"
    ADD CONSTRAINT "RaraValidationAndRating_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."Section"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Section"
    ADD CONSTRAINT "Section_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SourceFiles"
    ADD CONSTRAINT "SourceFiles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SourceFiles"
    ADD CONSTRAINT "SourceFiles_suggestedDocumentId_fkey" FOREIGN KEY ("suggestedDocumentId") REFERENCES public."SuggestedDocuments"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SourceFiles"
    ADD CONSTRAINT "SourceFiles_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT "Sources_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT "Sources_formInvitationId_fkey" FOREIGN KEY ("formInvitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT "Sources_sourceFilesId_fkey" FOREIGN KEY ("sourceFilesId") REFERENCES public."SourceFiles"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Sources"
    ADD CONSTRAINT "Sources_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_country_id_fkey" FOREIGN KEY (country_id) REFERENCES public."Country"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."State"
    ADD CONSTRAINT "State_zone_id_fkey" FOREIGN KEY (zone_id) REFERENCES public."Zone"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestedDocuments"
    ADD CONSTRAINT "SuggestedDocuments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestedDocuments"
    ADD CONSTRAINT "SuggestedDocuments_formId_fkey" FOREIGN KEY ("formId") REFERENCES public."Form"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestedDocuments"
    ADD CONSTRAINT "SuggestedDocuments_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT "SuggestionSourceMapping_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT "SuggestionSourceMapping_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public."Sources"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT "SuggestionSourceMapping_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES public."Suggestions"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SuggestionSourceMapping"
    ADD CONSTRAINT "SuggestionSourceMapping_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_formInvitationId_fkey" FOREIGN KEY ("formInvitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_selectedByUserId_fkey" FOREIGN KEY ("selectedByUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Suggestions"
    ADD CONSTRAINT "Suggestions_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SupplierAddressMapping"
    ADD CONSTRAINT "SupplierAddressMapping_address_id_fkey" FOREIGN KEY (address_id) REFERENCES public."Addresses"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SupplierAddressMapping"
    ADD CONSTRAINT "SupplierAddressMapping_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SupplierAddressMapping"
    ADD CONSTRAINT "SupplierAddressMapping_org_supplier_master_id_fkey" FOREIGN KEY (org_supplier_master_id) REFERENCES public."OrgSupplierMaster"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."SupplierAddressMapping"
    ADD CONSTRAINT "SupplierAddressMapping_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TaskRequest"
    ADD CONSTRAINT "TaskRequest_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TaskRequest"
    ADD CONSTRAINT "TaskRequest_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."TaskRequest"
    ADD CONSTRAINT "TaskRequest_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UomConversionMaster"
    ADD CONSTRAINT "UomConversionMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UomConversionMaster"
    ADD CONSTRAINT "UomConversionMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UomMaster"
    ADD CONSTRAINT "UomMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UomMaster"
    ADD CONSTRAINT "UomMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_organization_address_id_fkey" FOREIGN KEY (organization_address_id) REFERENCES public."OrganizationAddress"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserOrganizationAddressMapping"
    ADD CONSTRAINT "UserOrganizationAddressMapping_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Organization"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UsermodulePermission"
    ADD CONSTRAINT "UsermodulePermission_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UsermodulePermission"
    ADD CONSTRAINT "UsermodulePermission_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."UsermodulePermission"
    ADD CONSTRAINT "UsermodulePermission_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_InvitationId_fkey" FOREIGN KEY ("InvitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_QuestionId_fkey" FOREIGN KEY ("QuestionId") REFERENCES public."Question"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES public."FormField"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."ValidationWarningLogs"
    ADD CONSTRAINT "ValidationWarningLogs_updated_by_fkey2" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."VehicleTypeMaster"
    ADD CONSTRAINT "VehicleTypeMaster_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."VehicleTypeMaster"
    ADD CONSTRAINT "VehicleTypeMaster_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."WebCuration"
    ADD CONSTRAINT "WebCurationLogs_formInvitationId_fkey" FOREIGN KEY ("formInvitationId") REFERENCES public."FormInvitation"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."WebCuration"
    ADD CONSTRAINT "WebCuration_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."WebCuration"
    ADD CONSTRAINT "WebCuration_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."WebCuration"
    ADD CONSTRAINT "WebCuration_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Zone"
    ADD CONSTRAINT "Zone_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."Zone"
    ADD CONSTRAINT "Zone_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."testEmails"
    ADD CONSTRAINT "testEmails_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."testEmails"
    ADD CONSTRAINT "testEmails_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
