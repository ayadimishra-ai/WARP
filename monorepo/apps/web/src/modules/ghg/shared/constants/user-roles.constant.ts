export const USER_ROLES = {
  OrganizationAdmin: "OrganizationAdmin",
  LocationExecutive: "LocationExecutive",
  SuperAdmin: "SuperAdmin",
};

export const isSuperAdmin = (role: string) => role === USER_ROLES.SuperAdmin;
export const isOrganizationAdmin = (role: string) =>
  role === USER_ROLES.OrganizationAdmin;
export const isLocationExecutive = (role: string) =>
  role === USER_ROLES.LocationExecutive;
