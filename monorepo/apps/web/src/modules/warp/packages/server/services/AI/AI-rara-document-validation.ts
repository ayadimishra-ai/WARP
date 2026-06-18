import { apiRequest } from "@/modules/warp/packages/client/libs/api-request";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { SourceFiles_Updates } from "@/modules/warp/packages/graphql/generated/types";
import { raraAPIReqBody } from "@/modules/warp/packages/shared/constants/app.constants";

export const raraDocumentValidation = async (
  raraRequestBody: raraAPIReqBody
) => {
  let response: any = [];
  const updateData: SourceFiles_Updates[] = [];
  for (let i = 0; i < raraRequestBody?.raraAPIBody.length; i++) {
    const resultdata = await apiRequest.post(
      raraRequestBody?.reqUrl,
      JSON.stringify({
        document_name: raraRequestBody?.raraAPIBody[i].document_name,
        company_name: raraRequestBody?.raraAPIBody[i].company_name,
        document_url: raraRequestBody?.raraAPIBody[i].document_url,
        parentCompanies: raraRequestBody?.raraAPIBody[i].parentCompanies,
      }),
      raraRequestBody?.configData
    );
    if (resultdata?.statusText == "OK" && resultdata?.status == 200) {
      response.push({ raraAPIResponse: resultdata?.data });
      if (raraRequestBody?.isDBUpdation) {
        let raraMessage: string = "";
        if (
          resultdata &&
          (!!resultdata?.data?.error || resultdata?.data === "")
        ) {
          raraMessage = `Invalid ${raraRequestBody?.raraAPIBody[i].document_name} file`;
        } else if (
          resultdata?.data?.valid?.toString()?.toLowerCase() === "false"
        ) {
          raraMessage = resultdata?.data?.explanation;
        }
        updateData.push({
          where: {
            id: {
              _eq: raraRequestBody?.raraAPIBody[i].sourceFileId,
            },
          },
          _set: {
            error: {
              warning: raraMessage,
              error: raraRequestBody?.raraAPIBody[i]?.error?.error,
            },
          },
        });
      }
    }
  }
  const dataUpdation = sdk.bulkUpdateSourceFiles({
    SourceFiles: updateData,
  });
  response.push({ dbUpdation: dataUpdation });
  return response;
};
