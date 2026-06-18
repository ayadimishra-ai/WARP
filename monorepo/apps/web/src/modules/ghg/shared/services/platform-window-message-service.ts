export const sendParamstoParent = (params: Record<string, any>[]) => {
  return JSON.stringify({
    type: "sendParamstoParent",
    data: {
      params: params,
    },
  });
};

export const opRedirectToActivityDataRecords = (params: string | null) => {
  return JSON.stringify({
    type: "op-redirect-to-activity-data-records",
    data: { params },
  });
};

export const opRedirectToDataUploadLogs = () => {
  return JSON.stringify({
    type: "op-redirect-to-data-upload-logs",
    data: {},
  });
};

export const viewVerifyExtractedData = (params: Record<string, any>) => {
  return JSON.stringify({
    type: "op-redirect-to-verify-extracted-data",
    data: { ...params },
  });
};

export const addEditUser = (openDrawer: boolean, userId: string) => {
  return JSON.stringify({
    type: "add-edit-user",
    data: { openDrawer, userId },
  });
};

export const addEditLocation = (openDrawer: boolean, address_id: string) => {
  return JSON.stringify({
    type: "add-edit-location",
    data: { openDrawer, address_id },
  });
};

export const addEditSupplierMaster = (
  openDrawer: boolean,
  address_id: string
) => {
  return JSON.stringify({
    type: "add-edit-supplier-master",
    data: { openDrawer, address_id },
  });
};

export const addEditMaterial = (openDrawer: boolean, materialId: string) => {
  return JSON.stringify({
    type: "add-edit-material",
    data: { openDrawer, materialId },
  });
};

export const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

export const userFormSubmitted = (isFailed: boolean) => {
  return JSON.stringify({
    type: "user-form-submitted",
    isFailed: isFailed,
  });
};
export const saveActivityPopup = (isOpen: boolean) => {
  return JSON.stringify({
    type: "save-activity-popup",
    isOpen: isOpen,
  });
};

export const locationFormSubmitted = (isFailed: boolean) => {
  return JSON.stringify({
    type: "location-form-submitted",
    isFailed: isFailed,
  });
};

export const saveActivityData = (isFailed: boolean) => {
  return JSON.stringify({
    type: "save-activity-data",
    isFailed: isFailed,
  });
};
export const blankUpdateData = () => {
  return JSON.stringify({
    type: "blank-update-data",
  });
};
export const orgDetailsFormSubmitted = (isFailed: boolean) => {
  return JSON.stringify({
    type: "org-details-form-submitted",
    isFailed: isFailed,
  });
};

export const validateRecaptcha = () => {
  return JSON.stringify({
    type: "validate-recaptcha",
    keepCheck: true,
  });
};

export const netZeroTargetYearFormSubmitted = (
  params: Record<string, any>,
  isFailed: boolean
) => {
  return JSON.stringify({
    type: "net-zero-target-year-form-submitted",
    isFailed: isFailed,
    data: { ...params },
  });
};

export const netZeroTargetYearDeleteConfirmation = (
  params: Record<string, any>,
  isFailed: boolean
) => {
  return JSON.stringify({
    type: "net-zero-target-year-delete-confirmation",
    isFailed: isFailed,
    data: { ...params },
  });
};
export const sessionLogoutLoginLink = () => {
  return JSON.stringify({
    type: "session-logout-login-link",
  });
};

export const bulkUploadSupplierMaster = () => {
  return JSON.stringify({
    type: "bulk-upload-supplier-master",
    data: {},
  });
};

export const bulkUploadMaterial = () => {
  return JSON.stringify({
    type: "bulk-upload-material",
    data: {},
  });
};

export const warpContentSize = (height: Number) => {
  return JSON.stringify({
    type: "warp-content-resize",
    data: { height: height },
  });
};

export const confirmDeleteFormEntry = (params: Record<string, any>) => {
  return JSON.stringify({
    type: "confirm-delete-form-entry",
    data: { ...params },
  });
};

export const energyGridPowerFormUpdated = (isDeleted: boolean) => {
  return JSON.stringify({
    type: "energy-grid-power-form-updated",
    data: { isDeleted },
  });
};

export const energyCaptivePowerRenewableFormUpdated = (isDeleted: boolean) => {
  return JSON.stringify({
    type: "energy-captive-power-renewable-form-updated",
    data: { isDeleted },
  });
};

export const energyCaptivePowerFormUpdated = (
  isDeleted: boolean,
  subActivity: string
) => {
  return JSON.stringify({
    type: "energy-captive-power-form-updated",
    data: { isDeleted, subActivity },
  });
};

export const manualEntryConfirmCancel = () => {
  return JSON.stringify({
    type: "manual-entry-confirm-cancel",
  });
};

export const addEditProductMaster = (
  openDrawer: boolean,
  productId: string
) => {
  return JSON.stringify({
    type: "add-edit-product-master",
    data: { openDrawer, productId },
  });
};

export const productMasterFormSubmitted = (isFailed: boolean) => {
  return JSON.stringify({
    type: "product-master-form-submitted",
    isFailed: isFailed,
  });
};

export const bulkUploadProductMaster = () => {
  return JSON.stringify({
    type: "bulk-upload-product-master",
    data: {},
  });
};

/**
 * Sent FROM parent SPA TO the product-master-list embedded iframe.
 * Triggers a full refresh of the Product Master listing table.
 * Send this after the add/edit drawer closes successfully.
 */
export const refreshProductMasterListing = () => {
  return JSON.stringify({
    type: "refresh-product-master-listing",
  });
};

/**
 * Sent FROM parent SPA TO the product-master-list embedded iframe.
 * Triggers a refresh of the Upload History tab (MasterDataImportHistoryTable).
 * Send this after a bulk upload completes successfully.
 */
export const bulkPageRefresh = () => {
  return JSON.stringify({
    type: "bulk-page-refresh",
  });
};

/**
 * Sent FROM iframe TO parent SPA to request delete confirmation for a supplier-material mapping.
 * Parent SPA shows a confirmation dialog, then sends back a "confirm-delete-response" message.
 */
export const confirmDeleteSupplierMaterialMapping = (
  params: Record<string, any>
) =>
  JSON.stringify({
    type: "confirm-delete-supplier-material-mapping",
    data: { ...params },
  });

/**
 * Sent FROM iframe TO parent SPA after a create, update, or delete operation.
 * isFailed=false → success notification; isFailed=true → error notification.
 */
export const supplierMaterialMappingDataChanged = (isFailed: boolean) =>
  JSON.stringify({
    type: "supplier-material-mapping-data-changed",
    isFailed,
  });

export const bulkUploadSupplierMaterialMapping = () =>
  JSON.stringify({
    type: "bulk-upload-supplier-material-mapping",
    data: {},
  });
export const energyFuelPurchasedFormUpdated = (isDeleted: boolean) => {
  return JSON.stringify({
    type: "energy-fuel-purchased-form-updated",
    data: { isDeleted },
  });
};
export const wasteDataFormUpdated = (isDeleted: boolean) => {
  return JSON.stringify({
    type: "waste-data-form-updated",
    data: { isDeleted },
  });
};
// supplier location master list page messages
export const addEditSupplierLocationMaster = (
  openDrawer: boolean,
  supplierLocationId: string
) => {
  return JSON.stringify({
    type: "add-edit-supplier-location-master",
    data: { openDrawer, supplierLocationId },
  });
};

export const supplierLocationMasterFormSubmitted = (isFailed: boolean) => {
  return JSON.stringify({
    type: "supplier-location-master-form-submitted",
    isFailed: isFailed,
  });
};

export const bulkUploadSupplierLocationMaster = () => {
  return JSON.stringify({
    type: "bulk-upload-supplier-location-master",
    data: {},
  });
};

export const refreshSupplierLocationMasterListing = () => {
  return JSON.stringify({
    type: "refresh-supplier-location-master-listing",
  });
};
export const orgDetailsSurePassVerification = (
  isFailed: boolean,
  message: string
) => {
  return JSON.stringify({
    type: "org-details-surepass-verification",
    isFailed: isFailed,
    Message: message,
  });
};

/**
 * Sent FROM the Upload History iframe TO the parent SPA to request opening
 * the Excel bulk-upload popup for the currently active activity.
 * Parent SPA should open the existing bulk-upload modal in response.
 */
export const openExcelBulkUpload = (activityCode?: string) =>
  JSON.stringify({
    type: "open-excel-bulk-upload",
    data: { activityCode: activityCode ?? null },
  });

/**
 * Sent FROM the Upload History iframe TO the parent SPA to request opening
 * the AI upload popup for the currently active activity.
 * Only relevant for AI-enabled activities (currently: energy_grid_power).
 */
export const openAiUpload = (activityCode?: string) =>
  JSON.stringify({
    type: "open-ai-upload",
    data: { activityCode: activityCode ?? null },
  });

  export const opRedirectToProductshareTemplate = () => {
  return JSON.stringify({
    type: "op-redirect-to-productshare-template-download",
    data: {},
  });
};