//import { getUserOrganizationId } from "~/lib/auth/auth.client";

import { getUserOrganizationId } from "~/lib/auth/auth.client";

const toggleValueByOrgId = (
  organizationId: string,
  true_value: any,
  false_value: any
) => {
  let access_token = null;
  let _organzationId = null;
  if (typeof window !== "undefined") {
    access_token = window.localStorage.getItem("access_token");
    _organzationId = access_token ? getUserOrganizationId(access_token) : null;
  }

  if (_organzationId && _organzationId === organizationId) {
    return true_value;
  } else {
    return false_value;
  }
};
export default toggleValueByOrgId;
