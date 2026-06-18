import { RaraResponse } from '@/types/interface.types';
import { globalSetting } from '@/util/globalSetting';
import { getServerEnv } from '@/lib/env/env.server';

function responseObject<T = any>(
  infodata: T | null,
  code: number,
  message: string,
  stack: string,
  isError: boolean
): RaraResponse<T> {
  if (isError) {
    return {
      data: null,
      error: {
        code,
        message,
        stack,
      },
    };
  } else {
    return {
      data: infodata,
      error: null,
    };
  }
}

export async function manageRaraDetails(objData: any) {
  try {
    const env = await getServerEnv();
    const settings = await globalSetting();
    const warpGraphqlUrl = settings.warpGraphqlUrl;
    const warpGraphqlAdminSecret = settings.warpGraphqlAdminSecret;

    if (!warpGraphqlAdminSecret || !warpGraphqlUrl) {
      return responseObject(null, 500, 'Missing GraphQL config', '', true);
    }

    // 1. Fetch form submission and related data
    const query = `
      query getformFieldsbySubmissionId($submissionId: uuid!) {
        FormSubmission(where: {id: {_eq: $submissionId}}) {
          FormInvitation {
            Form {
              id
              FormFields(where: {interfaceOptions: {_has_key: "rara"}}) {
                formId
                id
                interfaceOptions
                questionId
                Answers(where: {submissionId: {_eq: $submissionId}}) {
                  id
                  data
                }
              }
            }
            Company {
              id
              name
              primaryContact
              metadata
            }
          }
        }
        GlobalMaster(where: {type: {_eq: "Rara_integration"}}) {
          id
          platformId
          type
          data
        }
        RaraValidationAndRating(where: {submissionId: {_eq: $submissionId}}) {
          id
          fileId
        }
      }
    `;

    const variables = { submissionId: objData.id };

    const graphqlRes = await fetch(warpGraphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': warpGraphqlAdminSecret,
      },
      body: JSON.stringify({
        operationName: 'getformFieldsbySubmissionId',
        variables,
        query,
      }),
    });

    if (!graphqlRes.ok) {
      return responseObject(null, 500, 'Failed to fetch form data', '', true);
    }

    const responsedata = await graphqlRes.json();
    const data = responsedata.data;

    // Extract relevant data
    const invitation = data.FormSubmission[0]?.FormInvitation;
    if (!invitation) {
      return responseObject(null, 404, 'No invitation found', '', true);
    }

    const formFields = (invitation.Form.FormFields || []).filter((f: any) => f.Answers.length > 0);
    if (formFields.length === 0) {
      return responseObject(null, 500, 'No answers found for RARA Rating.', '', true);
    }

    const companyName = invitation.Company.name;
    const primaryContact = invitation.Company.primaryContact;
    const companySize = primaryContact?.companysize || 'large';
    const companyMetadata = invitation.Company.metadata;

    // Check if RARA feature is enabled for this company
    const isRARAEnabled = companyMetadata?.isRARAEnabled ?? false;
    if (!isRARAEnabled) {
      return responseObject(null, 200, 'RARA feature is disabled for this company', '', false);
    }

    // Prepare files to rate
    const existingRatings = data.RaraValidationAndRating || [];
    const ratingApiBodyInputs: any[] = [];

    // Check for already rated files
    if (existingRatings.length > 0) {
      for (const field of formFields) {
        for (const answer of field.Answers) {
          for (const value of answer.data.value) {
            const fileIdData = value.value[0].fileId;
            const alreadyRated = existingRatings.some((x: any) => x.fileId.includes(fileIdData));
            if (!alreadyRated) {
              ratingApiBodyInputs.push({
                companyName,
                documentType: field.interfaceOptions.rara.documentType,
                fileId: fileIdData.toString(), // Ensure fileId is a string
                file: value.value[0].path,
                formfieldId: field.id,
                companySize: '',
              });
            }
          }
        }
      }
      if (ratingApiBodyInputs.length === 0) {
        return responseObject(null, 500, '', 'Data Already Exist', true);
      }
    }

    // Get RARA API endpoint and auth
    let document_url = '';
    let document_authkey = '';
    if (data.GlobalMaster.length > 0) {
      const urlData = data.GlobalMaster[0].data.find((x: any) => x.name === 'rara-check');
      document_url = urlData?.url;
      document_authkey = urlData?.authkey;
    }

    // If still no files to rate, add all
    if (ratingApiBodyInputs.length === 0) {
      for (const field of formFields) {
        for (const answer of field.Answers) {
          for (const value of answer.data.value) {
            ratingApiBodyInputs.push({
              companyName,
              documentType: field.interfaceOptions.rara.documentType,
              fileId: value.value[0].fileId.toString(), // Ensure fileId is a string
              file: value.value[0].path,
              formfieldId: field.id,
              companySize: '',
            });
          }
        }
      }
    }

    // 2. Call RARA API for each file and collect results
    const ratingValidationTable: any[] = [];
    for (const input of ratingApiBodyInputs) {
      try {
        const raraApiRes = await fetch(document_url, {
          method: 'POST',
          headers: {
            'Authorization': document_authkey,
            'Content-Type': 'application/json',
            "x-ai-services-authorization": env.AI_SERVICES_AUTHORIZATION ?? "",
          },
          body: JSON.stringify({
            company_name: companyName,
            document_key: input.documentType,
            document_url: input.file,
            company_size: companySize,
          }),
        });
        if (!raraApiRes.ok) {
          console.error('RARA API failed:', await raraApiRes.text());
          continue;
        }

        const raraApiData = await raraApiRes.json();
        ratingValidationTable.push({
          id: crypto.randomUUID(),
          invitationId: objData.invitationId,
          submissionId: objData.id,
          formFieldId: input.formfieldId,
          fileId: input.fileId.toString(),
          type: 'validation',
          data: {
            document_rating: parseInt(raraApiData.document_rating),
            reason_for_rating: raraApiData.reason_for_rating,
            recommendations: raraApiData.recommendations,
          },
        });
      } catch (err) {
        // Log error if needed
        continue;
      }
    }

    // 3. Insert ratings into GraphQL
    const insertMutation = `
      mutation insertRaraValidationAndRating($insertData: [RaraValidationAndRating_insert_input!]!) {
        insert_RaraValidationAndRating(
          objects: $insertData,
          on_conflict: {
            constraint: RaraValidationAndRating_pkey,
            update_columns: [data, type]
          }
        ) {
          affected_rows
          returning {
            id
            fileId
          }
        }
      }
    `;

    try {
      const insertRes = await fetch(warpGraphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hasura-Admin-Secret': warpGraphqlAdminSecret,
        },
        body: JSON.stringify({
          operationName: 'insertRaraValidationAndRating',
          variables: { insertData: ratingValidationTable },
          query: insertMutation,
        }),
      });

      // Log the response for debugging
      const responseText = await insertRes.text();

      if (!insertRes.ok) {
        return responseObject(null, 500, 'Failed to insert ratings', responseText, true);
      }

      // Parse the response to check for GraphQL errors
      try {
        const responseJson = JSON.parse(responseText);
        if (responseJson.errors) {
          return responseObject(null, 500, 'GraphQL errors during insertion', JSON.stringify(responseJson.errors), true);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }

      return responseObject(null, 200, 'success', '', false);
    } catch (insertError) {
      return responseObject(null, 500, 'Error during data insertion', insertError instanceof Error ? insertError.message : String(insertError), true);
    }
  } catch (ex: any) {
    return responseObject(null, 500, 'Something went wrong', ex?.message || '', true);
  }
}