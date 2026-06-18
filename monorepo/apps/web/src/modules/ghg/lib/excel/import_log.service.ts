import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { DataImportHistory_Insert_Input } from "@/modules/ghg/graphql/shared/types";

export const import_log = async (
  organization_address_id: UUID,
  import_method: string,
  file_name: string,
  fileUrl: string,
  file_metadata: object,
  status_data: object,
  status: string,
  metadata: object,
  organizationId: UUID
) => {
  let data: DataImportHistory_Insert_Input = {
    organization_address_id: organization_address_id,
    import_method: import_method,
    file_name: file_name,
    file_url: fileUrl,
    file_metadata: file_metadata,
    status: status,
    status_data: status_data,
    metadata: metadata,
  };
  const sdk = await getGraphQlServerSDK();
  let resp = await sdk.insertDataimport({ input: data });
};
