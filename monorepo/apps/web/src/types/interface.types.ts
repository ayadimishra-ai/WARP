import { CompanyStatus } from "@/constants/companyStatus.constants";

export interface UserPagesPermissionVM {
  pageGuid: string;
  pageName: string;
  pageUrl: string | null;
}

export interface ResetPasswordEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  status200OK?: number;
  saveresult?: string;
}

export interface EmailConfig {
  FromMail: string;
  ToMail: string;
  MessageBody: string;
  Subject: string;
  Host: string;
  Port: number;
  UserId: string;
  Password: string;
  Header?: string;
  CCMail?: string[];
  BCCMail?: string[];
}

// Power BI Interfaces
export interface GetAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ReportValue {
  id: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
}

export interface GetReportsDetails {
  value: ReportValue[];
}

export interface GetReportsTokenDetails {
  token: string;
  tokenId: string;
  expiration: string;
}

export interface PowerBIResponse {
  embedUrl?: string;
  token?: string;
  id?: string;
  filters?: string;
  sectionurl?: string;
  dashboardHeight?: string;
  isBorder?: boolean;
  isPowerBiReport?: boolean;
}

export interface ResponseValues {
  value: PowerBIResponse;
  isOnline?: boolean;
  date1?: string;
  date2?: string;
}

export interface PowerBIReportDetails {
  TokenExpirationTime?: any;
  PowerBIReportFilters?: string | null;
  PowerBIReportSections?: string | null;
  PowerBIGuid: any;
}

export interface PowerBISettings {
  [key: string]: string;
}

export interface TokenRequestData {
  datasets: Array<{ id: string }>;
  reports: Array<{ id: string }>;
}

export interface TokenResponse {
  token: string;
  tokenId: string;
  expiration: string;
}

export interface MenuItem {
  pageguid: string;
  menuType: string;
  menuDisplayOrder: number;
  iconName: string;
  priority: number;
  pageKey: string;
  url: string | null;
  resourceValue: string;
  roleName: string;
  rn: number;
  isParentMenu: number;
  hasChild: number;
  parentPageGuid: string | null;
}

export interface MenuServiceResponse {
  success: boolean;
  data?: {
    table1: MenuItem[];
  };
  error?: string;
  status?: number;
  details?: string;
}

export interface UserLoginLog {
  UserLoginLogsGuid: string;
  UserGuid: string;
  LoginDate: string;
  ClientIP: string;
}

export interface RegistrationCheckResponse {
  isEligible: boolean;
  userExists: boolean;
  userData: any; // Consider replacing 'any' with a more specific type if possible
  companyStatus?: CompanyStatus;
  hasCPanelId: boolean;
}

export interface ResetPasswordResponse {
  status200OK: number;
  saveresult: string;
  data?: any;
}

export interface GetUserAccountDetailsRequest {
  userGuid: string;
  languageGuid: string;
}

export interface UserAccount {
  UserGuid: string;
  EmailId: string;
  FirstName?: string | null;
  LastName?: string | null;
  CompanyName?: string | null;
  UserProfileImage?: string | null;
  RoleName?: string;
  CountryName?: string;
}

export interface UserResponse {
  userGuid: string;
  emailId: string;
  roleName: string;
  name: string;
  organization: string;
  countryName: string;
  userProfileImage: string | null;
}

export interface DynamicResponse {
  [key: string]: UserResponse[];
}

export interface GetDashboardUrlsRequest {
  companyGuid: string;
  dashboardType: string;
}

export interface TblCompanyDashboardMapping {
  companyDashboardMappingGuid: string;
  companyGuid?: string;
  dashboardType: string;
  url: string;
  createdDate?: Date;
  createdBy?: string;
  modifiedDate?: Date;
  modifiedBy?: string;
  companyType: string;
  displayOrder?: number;
  columnSize?: number;
  iframeStyle: string;
  isActive?: boolean;
  locationUrl: string;
  reportName: string;
  isBorder: boolean;
  isPowerBiReport: boolean;
  dashboardHeight: string;
  companyGu?: {
    companyGuid: string;
    cpanelCompanyId: string;
    company_name: string;
  };
  createdByNavigation?: {
    userGuid: string;
    firstName: string;
    lastName: string;
  };
  modifiedByNavigation?: {
    userGuid: string;
    firstName: string;
    lastName: string;
  };
  hideTabs?: string[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export type UserExistResponse = {
  status200OK: number;
  saveresult: {
    tblUsers: {
      userGuid: string;
      firstName: string | null;
      cpanelUserId: number | null;
      opsUserId: number | null;
      emailId: string | null;
      mobileNumber: string | null;
      isVerified: boolean | null;
    };
    listTblRoles: Array<{
      roleGuid: string | null;
      roleName: string | null;
      isActive: boolean | null;
      createdDateUtc: string | null;
    }>;
    userStatusVM: {
      checkStatus: string;
    };
  };
};

export interface UserVM {
  userGuid: string;
  emailId: string;
  languageGuid: string;
  companyGuid: string;
  firstName: string;
  lastName: string;
  userInitial: string;
  showGradeLevel: boolean;
  parentGuid: string;
  userStatus: string;
  isNewsLetterSubscribed: boolean;
  companyLogo: string;
  isManufacturing: boolean;
  location: string;
  opsUrl: string;
}

export interface RoleVM {
  roleName: string;
  rolePriority: string;
  roleGuid: string;
}

export interface PermissionVM {
  userGuid: string;
  pageKey: string;
  rights: string;
  platformType: string;
}

export interface CountryVM {
  countryGuid: string;
  countryName: string;
}

export interface UserStatusVM {
  checkStatus: string;
}

export interface IsUserValidResponse {
  status200OK: number;
  user: {
    usersVM: UserVM;
    rolesVM: RoleVM;
    permissionsVM: PermissionVM[];
    userMappedCountryVM: CountryVM[];
    userStatusVM: UserStatusVM;
    warpToken: string;
    opsToken: string | null;
    opsUrl: string | null;
    platform_token: string;
    platform_token_expires_in: number;
  };
}

export type ServiceResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
};

export interface UserVM {
  userGuid: string;
  emailId: string;
  languageGuid: string;
  companyGuid: string;
  firstName: string;
  lastName: string;
  userInitial: string;
  showGradeLevel: boolean;
  parentGuid: string;
  userStatus: string;
  isNewsLetterSubscribed: boolean;
  companyLogo: string;
  isManufacturing: boolean;
  location: string;
  opsUrl: string;
}

export interface RoleVM {
  roleName: string;
  rolePriority: string;
  roleGuid: string;
}

export interface CountryVM {
  countryGuid: string;
  countryName: string;
}

export interface UserStatusVM {
  checkStatus: string;
}

export interface IsUserValidResponse {
  status200OK: number;
  user: {
    usersVM: UserVM;
    rolesVM: RoleVM;
    permissionsVM: PermissionVM[];
    userMappedCountryVM: CountryVM[];
    userStatusVM: UserStatusVM;
    warpToken: string;
    opsToken: string | null;
    opsUrl: string | null;
    platform_token: string;
    platform_token_expires_in: number;
  };
}

export interface ResetLinkResponse {
  status200OK: number;
  saveresult: string;
}

export interface UserInput {
  EmailId: string;
  Password?: string;
  IsActive?: boolean;
  FirstName?: string;
  LastName?: string;
  CompanyName?: string;
  IsNewsLetterSubscribed?: boolean;
  CompanyWebsite?: string;
  ParentCompany?: string;
  ERPSupplierId?: string;
  LanguageGuid?: string | null;
  SystemId?: string | null;
  NumberOfFailedLoginAttempts?: number;
  IsLocked?: boolean;
  UserProfileImage?: string | null;
  CountryGuid?: string | null;
  MobileNumber?: string | null;
  ReportsTo?: string | null;
  userposition?: string | null;
  CpanelUserId?: string | null;
  OPSUserId?: string | null;
  isEmailSubscribed?: boolean;
  CreatedDate?: string;
  ModifiedDate?: string;
  CompanyCountryId?: string | null;
  UserPhoneNo?: string | null;
  CPanelCompanyId?: string | null;
  BusinessTypeGuid?: string | null;
}

export interface RegistrationResult {
  status200OK: number;
  saveresult?: string;
  userguid?: string;
  companyGuid?: string;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

export type LanguageResourceHit = {
  _source: {
    languageResourceGuid: string;
    pageKey: string | null;
    resourceKey: string | null;
    resourceValue: string | null;
    languageGuid: string | null;
    isActive: boolean | null;
    createdDate: string | null;
  };
};

// Example: adjust your type to match this structure
export interface LanguageResourcesResponse {
  hits: {
    hits: Array<{
      _source: {
        languageResourceGuid: string;
        pageKey: string | null;
        resourceKey: string | null;
        resourceValue: string | null;
        languageGuid: string | null;
        isActive: boolean | null;
        createdDate: string | null;
      };
    }>;
  };
}

export type GlobalSettingsHit = {
  _source: {
    globalSettingsGuid: string;
    settingsKey: string;
    settingsValue: string;
  };
};

export type GlobalSettingsResponse = {
  hits: {
    hits: GlobalSettingsHit[];
  };
};

export interface Invitation {
  Form: { id: string };
  email: string;
  parentcompanyId: string;
}

export interface Invitation {
  Form: { id: string };
  email: string;
  parentcompanyId: string;
}

export interface SupplierOnboardingAccountData {
  email: string;
  mobile: string;
  password: string;
  userName: string;
  userGuid: string;
  gstNumber: string;
  companyRegistrationNo: string;
  yearEstablished: string;
  legalStructureName: string;
  legalStructureguid: string;
  companyWebsite: string;
  companyname: string;
  partnertypeguid: string;
  partnertype: string;
  country: string;
  countryguid: string;
  companyStatus: string;
  result: string;
}

export type EmailDetailVM = {
  EmailTemplateGuid: string;
  FromMail: string;
  TOMail: string;
  MessageBody: string;
  Subject: string;
  Host: string;
  Port: number;
  UserId: string;
  Password: string;
  Header: string;
  CCMail: string[];
  BCCMail: string[];
};

export interface DecryptParams {
  encryptionKey: string;
  encryptionIV: string;
}

export interface ChangePasswordParams {
  UserGuid: string;
  Password: string;
}

export interface ErrorData {
  code: number;
  message: string;
  stack: string;
}
export interface RaraResponse<T = any> {
  data: T | null;
  error: ErrorData | null;
}

export type UserPermission = {
  Tbl_Permission: {
    __typename?: "Tbl_Permissions";
    PageGuid?: string;
    ResourceKey?: string | null;
    MenuType?: string | null;
    Tbl_Page: {
      PageKey: string;
      PlatformType?: string | null;
    };
  } | null;
};

export interface FormInvitationResponse {
  Form: {
    id: string;
    name: string;
  };
  email: string;
  parentcompanyId: string;
  FormName: string;
  CompanyName: string;
  InvitationId: string;
  TestCreationId: string;
  CompanyId: string;
  CpanelCompanyId: string;
  reviewerDetails: {
    id: string;
    name: string;
    email: string;
    isNewReviewer: boolean;
  } | null;
reviewerParentCompanyId: string;
}

export interface EmailEncryptDecryptParams {
  email: string;
  type: string;
}

export interface PasswordEncryptDecryptParams {
  password: string;
  type: string;
}

export interface SessionInput {
  UserId: string;
  PlatformToken: string;
  WarpToken?: string;
  OpsToken?: string;
  BrowserToken?: string;
  Status?: string;
  Metadata?: Record<string, unknown>;
  BrowserName?: string | null;
  ClientIp?: string | null;
  StatusMetadata?: Record<string, unknown>;
  LoggedIn?: string | null;
  PasswordReset?: string | null;
  CreatedDate?: string;
  ModifiedDate?: string;
  TypeOfLogout?: string;
}

export interface userSessionDataResult {
  status200OK: number;
  saveresult?: string;
  success?: boolean;
  error?: {
    message: string;
    status?: number;
  };
  data?: { [key: string]: any };
}

export interface updateCompanyMobileNumberRequest {
  userName: string;
  email: string;
  mobileNumber: string;
  CPanelCompanyId: string;
}

export interface updateCompanyMobileNumberResponse {
  status200OK: number;
  saveresult: string;
  data?: any;
}
