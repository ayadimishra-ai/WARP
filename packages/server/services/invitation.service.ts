import { useUserSession } from "@warp/client/hooks/use-user-session";
import { sdk } from "@warp/graphql/generated/server";
import { FormInvitation_Insert_Input } from "@warp/graphql/generated/types";
import { FormInvitationStatus } from "@warp/shared/constants/app.constants";
import { encryptionDecryption } from "../../client/hooks/encryption-decryption";
import { sendCompanyInvitationEmail } from "./notification.service";
const { choosemethod } = encryptionDecryption();
//get default finacial year
const getCurrentFinancialYear = () => {
  let fromDate = "";
  let toDate = "";
  const today = new Date();
  if (today.getMonth() + 1 <= 3) {
    fromDate = today.getFullYear() - 1 + "-04-01";
    toDate = today.getFullYear() + "-03-31";
  } else {
    fromDate = today.getFullYear() + "-04-01";
    toDate = today.getFullYear() + 1 + "-03-31";
  }
  return { fromDate: fromDate, toDate: toDate };
};

const getPreviousFinancialYear = () => {
  let fromDate = "";
  let toDate = "";
  const today = new Date();
  if (today.getMonth() + 1 <= 3) {
    fromDate = today.getFullYear() - 2 + "-04-01";
    toDate = today.getFullYear() - 1 + "-03-31";
  } else {
    fromDate = today.getFullYear() - 1 + "-04-01";
    toDate = today.getFullYear() + "-03-31";
  }

  return { fromDate: fromDate, toDate: toDate };
};

export const createInvitation = async (body?: any[]) => {
  if (!body?.length) return false;
  //   console.log({ body });
  let isError = false;
  const getfinacialyear = getPreviousFinancialYear();
  //onsole.log({ getfinacialyear });
  // Need to check existing data in db
  let companyBulkId: string[] = body.map((index: any) => index.companyId);

  //console.log({ companyBulkId });

  //company existing check
  const companyDetail = await sdk.getCompanyDetailByBulkId({
    companyIds: companyBulkId,
  });

  //   console.log({ companyDetail });

  if (companyBulkId.length !== companyDetail.Company.length) {
    isError = true;
    throw new Error("Some company details not exist.");
  }

  let parentcompanyId =
    companyDetail?.Company?.map(
      (x: any) => x.ParentCompanyMappings[0]["ParentCompanyId"]
    ) ?? [];
  // Validating existing data
  const result = await sdk
    .GetExistingFormInvitation({
      formId: body[0].formId,
      durationFrom: getfinacialyear.fromDate,
      durationTo: getfinacialyear.toDate,
      companyId: companyBulkId,
      parentcompanyId: parentcompanyId ?? "",
    })
    .catch((error) => {
      console.log(error);
    });

  // Validating manual Invitaion Check

  const manualInvitaionCheck = await sdk.GetExistingFormInvitationEkyc({
    companyId: companyBulkId,
    formId: body[0].formId,
  });

  if (result && result.FormInvitation.length > 0) {
    isError = true;
    throw new Error("Assessment is already taken for selected period");
  }
  if (manualInvitaionCheck && manualInvitaionCheck.FormInvitation.length > 0) {
    isError = true;
  }
  //let groupencarray: any = [];
  for (let b = 0; b < body.length; b++) {
    body[b].email = await choosemethod(body[b].email, "encrypt");
    // const _company = companyDetail?.Company?.find(
    //   (m) => m.id === body[b].companyId
    // );
    //let encd = await choosemethod(_company?.primaryContact?.email, "encrypt");
    // groupencarray.push({
    //   email: _company?.primaryContact?.email,
    //   encdata: body[b].email,
    // });
  }

  // start looping to get data from body array
  const formInvitationDataArray: FormInvitation_Insert_Input[] = body.map(
    (InviteDetails: any) => {
      // console.log({ InviteDetails });
      const session = useUserSession();
      //First check valid companyId
      const _company = companyDetail?.Company?.find(
        (m) => m.id === InviteDetails.companyId
      );
      // console.log({ _company });
      //Otherwise throw the exception
      if (!_company) {
        isError = true;
        throw new Error("Invalid company found");
      }
      // console.log({ _company });
      //Create an array of Form Invitation
      const input: FormInvitation_Insert_Input = {
        companyId: InviteDetails.companyId,
        formId: InviteDetails.formId,
        email: _company?.primaryContact?.email ?? InviteDetails.email,
        status: FormInvitationStatus.Invited,
        created_by: null,
        updated_by: null,
        durationFrom: getfinacialyear.fromDate,
        durationTo: getfinacialyear.toDate,
        parentcompanyId: session?.company?.id ?? parentcompanyId[0] ?? null,
      };
      // console.log({ input });
      return input;
    }
  );

  //   console.log({ isError });
  if (isError === false) {
    const array = formInvitationDataArray.map((item: any) => {
      // console.log({ item: item.Promise });
      return item;
    });
    // console.log({ formInvitationDataArray: array });

    const data = await sdk.InsertFormInvitationNewCompany({
      object: array,
    });

    const success =
      data?.insert_FormInvitation?.returning &&
      data?.insert_FormInvitation?.returning?.length > 0;

    if (!success) {
      throw new Error("Failed to send invitation");
    } else {
      const sendInvitationEmailPromisses =
        data?.insert_FormInvitation?.returning?.map(
          async (invitation: any) => {
            // console.log(invitation.id);
            return sendCompanyInvitationEmail({
              invitationId: invitation.id,
              emailType: "FormInvitation",
              companyId: "",
              formId: "",
              platformId: String(await useUserSession()?.platform?.id),
            });
          }
          //   fetch("/api/email-invitation", {
          //     method: "POST",
          //     headers: {
          //       "content-type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       id: invitation.id,
          //       type: "FormInvitation",
          //       companyId: null,
          //     }),
          //   })
        ) ?? [];

      await Promise.all(sendInvitationEmailPromisses);
      return "success";
    }
  }
};
