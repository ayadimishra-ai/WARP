/**
 * API Request/Response Interfaces
 */

// Common Error Response
export interface ErrorResponse {
    success: boolean;
    error: string;
    details?: string;
    status?: number;
}

// Auth Interfaces
export interface LoginRequestBody {
    EmailId: string;       // Required field - must be a valid email
    Password: string; 
    PlatformToken?: string; // Optional field
    BrowserToken?: string; // Optional field
    BrowserName?: string;  // Optional field
}

// Menu Interfaces
export interface MenuListRequest {
    roleGuid: string;
    userGuid: string;
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

// User Interfaces
export interface UserExistsRequest {
    Mobile?: string;
    Email?: string;
}

// Company Interfaces
export interface CompanyDetails {
    cpanelCompanyId?: string; // UUID
}

// Settings Interfaces
export interface GlobalSetting {
    SettingsKey: string;
    SettingsValue: string;
}

export interface GlobalSettingsRequest {
    settingsKeys: string[];
}

// Language Resources
export interface LanguageResourcesRequest {
    pageKeys: string[];
    languageCode?: string;
}
