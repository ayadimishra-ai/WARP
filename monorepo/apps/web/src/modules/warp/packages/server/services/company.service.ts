import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  CreateCompanyMutationVariables,
  CreateParentCompanyMappingMutationVariables,
  FormDetails_Bool_Exp,
  GetFormDetailsByIndustryQuery,
  GetFormInvitationDetailsByCompanyIdQuery,
  UpdateCompanyDetailByIdMutationVariables,
} from "@/modules/warp/packages/graphql/generated/types";
import { SourcesType } from "@/modules/warp/packages/shared/constants/app.constants";
import { companySchema } from "@/modules/warp/packages/shared/validation/company.validation";

// type createCompanySuccessResultType = Omit<
//   Pick<CreateCompanyMutation, "insert_Company_one">,
//   "__typename?"
// >;
type createCompanyType = (body: object) => Promise<any>;
type updateCompany = (body: object) => Promise<any>;
type deleteCompany = (id: any) => Promise<any>;
type updateparentcompanymapping = (body: object) => Promise<any>;

export const createCompany: createCompanyType = async (body) => {
  // Company Details yup Validation
  const result = await companySchema.validate(body);

  if (!result || result === undefined) return;

  // Need to check Duplidate data
  const companyList = result.map((data) => data.name);

  const duplicateCompanyList = result
    .map((item, index) => {
      if (companyList.indexOf(item.name) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateCompanyList || duplicateCompanyList.length > 0) {
    throw {
      message: "Some company are duplicate.",
      stack: { data: duplicateCompanyList },
    };
  }

  // Need to check existing data in db
  let companyNameList: string[] = result.map((index) => index.name);

  const companyDetail = await sdk.getCompanyDetailByName({
    newName: companyNameList,
  });

  if (companyDetail.Company.length > 0) {
    throw {
      message: "Company Details already exist.",
      stack: { data: companyDetail },
    };
  }

  // Insert Record in db
  const compnayFinalArrayList: CreateCompanyMutationVariables = {
    input: [],
  };

  compnayFinalArrayList.input = result.map((response: any) => {
    let companyData = {
      ...response,
    };
    return companyData;
  });

  const responseData: any = await sdk.createCompany(compnayFinalArrayList);
  if (responseData.insert_Company.returning.length > 0) {
    const parentCompnayFinalArrayList: CreateParentCompanyMappingMutationVariables =
      {
        input: [],
      };

    const parentCompanyDetail = {
      CompanyId: responseData.insert_Company.returning[0].id,
      ParentCompanyId: null,
    };
    parentCompnayFinalArrayList.input = parentCompanyDetail;
    const resParentCompanyData = await sdk.createParentCompanyMapping(
      parentCompnayFinalArrayList
    );
  }

  if (!responseData) {
    throw new Error("Failed to create Company.");
  }

  // Return Response in api
  const newCompany = responseData.insert_Company?.returning.map(
    (response: any) => {
      delete response.__typename;
      return response;
    }
  );

  return newCompany;
};

export const updateCompany: updateCompany = async (body) => {
  // Company Details yup validation
  const result = await companySchema.validate(body);

  if (!result || result === undefined) return;

  // Need to check Id Duplidate data
  const companyIdList = result.map((index: any) => index.id);
  const companyNameList = result.map((index: any) => index.name);

  const duplicateCompanyIdData = result
    .map((item, index) => {
      if (companyIdList.indexOf(item.id) !== index) return item;
      if (companyNameList.indexOf(item.name) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateCompanyIdData || duplicateCompanyIdData.length > 0) {
    throw {
      message: "Some company details are duplicate.",
      stack: { data: duplicateCompanyIdData },
    };
  }

  // Need to check existing data in db
  let companyBulkId: string[] = result.map((index: any) => index.id);

  const companyDetail = await sdk.getCompanyDetailByBulkId({
    companyIds: companyBulkId,
  });

  if (companyBulkId.length !== companyDetail.Company.length) {
    throw new Error("Some company details not exist.");
  }

  // Insert Record in db
  const compnayFinalArrayList: UpdateCompanyDetailByIdMutationVariables = {
    input: [],
  };

  type detailsObjectType = {
    companyId: string;
    isManufacturing?: boolean;
  };

  let companyIds: Array<String> = [];
  let Manufacturing_invitationIds: Array<String> = [];
  let Non_Manufacturing_invitationIds: Array<String> = [];
  let detailsObject: detailsObjectType[] = [];

  compnayFinalArrayList.input = result.map((response: any) => {
    detailsObject.push({
      companyId: response.id,
      isManufacturing: response.IsManufacturing,
    });
    companyIds.push(response.id);

    let data = {
      where: {
        id: {
          _eq: response.id,
        },
      },
      _set: {
        ...response,
      },
    };
    delete data._set.id;
    return { ...data };
  });
  let responseData: any = [];
  // const updateData: GetFormInvitationDetailsByCompanyIdQuery =
  //   await sdk.getFormInvitationDetailsByCompanyId({
  //     companyId: companyIds,
  //     formId: "012a2471-c0a3-46ea-b6a0-19c2d2bb6de5", // Borrower ESG Assessment Questionnaire
  //   });

  // const InvitationUpdateArrayList: UpdateCompanyDetailByIdMutationVariables = {
  //   input: [],
  // };
  // let responseData: any = [];

  // if (updateData.FormInvitation.length > 0) {
  //   updateData.FormInvitation.map((item: any) => {
  //     //invitationIds.push(item.id);
  //     // if (item.Company?.IsManufacturing !== null) {
  //     const details = detailsObject.filter(
  //       (x) => x.companyId === item.companyId
  //     );
  //     if (details.length > 0) {
  //       if (details[0].isManufacturing !== null) {
  //         if (details[0].isManufacturing === true) {
  //           Manufacturing_invitationIds.push(item.id);
  //         }
  //         if (details[0].isManufacturing === false) {
  //           Non_Manufacturing_invitationIds.push(item.id);
  //         }
  //       }
  //     }
  //     // }
  //   });

  //   if (Non_Manufacturing_invitationIds.length > 0) {
  //     // console.log("Non Manufacturing");

  //     await sdk.updateFormInvitationByCompanyIdAndFormId({
  //       invitationId: Non_Manufacturing_invitationIds,
  //       formId: "54ab2b72-80f4-4545-a5e7-478b571beadd", // Borrower ESG Assessment - Non-manufacturing Business Questionnaire
  //     });
  //   }

  //   if (Manufacturing_invitationIds.length > 0) {
  //     // console.log("Manufacturing");

  //     await sdk.updateFormInvitationByCompanyIdAndFormId({
  //       invitationId: Manufacturing_invitationIds,
  //       formId: "cf82bc85-90c5-48bb-9316-d45de602678c", // Borrower ESG Assessment - Manufacturing Business Questionnaire
  //     });
  //   }

  //   responseData = await sdk.updateCompanyDetailById(compnayFinalArrayList);
  // } else {
  //   // Chiatae ESG Assessment Questionnaire
  //   const updateData: GetFormInvitationDetailsByCompanyIdQuery =
  //     await sdk.getFormInvitationDetailsByCompanyId({
  //       companyId: companyIds,
  //       formId: "e674eea0-98f1-4bd1-a975-46da88e14668", // Chiatae ESG Assessment Questionnaire
  //     });
  //   let industrydata = "";
  //   let invitationId = "";
  //   let metadatainfo = "";
  //   let Manufacturinginfo = null;
  //   let companyIdinfo = "";
  //   updateData.FormInvitation.map((item: any) => {
  //     //invitationIds.push(item.id);
  //     // if (item.Company?.IsManufacturing !== null) {
  //     const details = detailsObject.filter(
  //       (x) => x.companyId === item.companyId
  //     );
  //     if (details.length > 0) {
  //       industrydata = item?.Company?.metadata?.OtherInfo;
  //       invitationId = item.id;
  //       metadatainfo = item?.Company?.metadata;
  //       Manufacturinginfo = item?.Company?.manufacturing;
  //       companyIdinfo = item.companyId;
  //     }
  //     // }
  //   });

  //   if (industrydata === "Agtech") {
  //     await sdk.updateFormInvitationByCompanyIdAndFormId({
  //       invitationId: invitationId,
  //       formId: "c20eeb83-43a7-4bb4-9135-84c10b486ce6", // Agtech
  //     });
  //   }

  //   if (industrydata === "Fintech") {
  //     await sdk.updateFormInvitationByCompanyIdAndFormId({
  //       invitationId: invitationId,
  //       formId: "9d5c337b-303f-4af5-a830-75faeb5aef96", // fintech
  //     });
  //   }

  //   responseData = await sdk.updateCompanyDetailById(compnayFinalArrayList);
  //   // Agtech and fintech industry uodate

  //   let da = await sdk.updateCompanyDetails({
  //     companyId: companyIdinfo,
  //     IsManufacturing: Manufacturinginfo,
  //     metadata: metadatainfo,
  //   });
  // }

  ///update company invitation data
  let industrydata: any = result.map(
    (index: any) => index.CpanelCompanyIndustry
  );
  let where: FormDetails_Bool_Exp;

  where = {
    Form: { Details: { industry: { _contains: industrydata } } },
  };

  const updateData: GetFormDetailsByIndustryQuery =
    await sdk.getFormDetailsByIndustry({
      where,
      // Borrower ESG Assessment Questionnaire
    });
  console.log("updateData", updateData?.Form[0]?.id);

  //   // Agtech and fintech industry update

  const updateData_new: GetFormInvitationDetailsByCompanyIdQuery =
    await sdk.getFormInvitationDetailsByCompanyId({
      companyId: companyIds,
      sourceType: SourcesType.Uploaded?.dbTittle,
    });

  let invitationId = "";
  let FormId = updateData?.Form[0]?.id;
  invitationId = updateData_new?.FormInvitation[0]?.id;
  await sdk.updateFormInvitationByCompanyIdAndFormId({
    invitationId: invitationId,
    formId: FormId, // fintech
    companyid: companyIds,
  });
  ///update company invitation data
  ///update company data start
  let metadatainfo = "";
  let Manufacturinginfo = null;
  let companyIdinfo = "";
  updateData_new.FormInvitation.map((item: any) => {
    //invitationIds.push(item.id);
    // if (item.Company?.IsManufacturing !== null) {
    const details = detailsObject.filter((x) => x.companyId === item.companyId);
    if (details.length > 0) {
      industrydata = item?.Company?.metadata?.OtherInfo;

      metadatainfo = item?.Company?.metadata;
      Manufacturinginfo = item?.Company?.manufacturing;
      companyIdinfo = item.companyId;
    }
    // }
  });

  let da = await sdk.updateCompanyDetails({
    companyId: companyIdinfo,
    IsManufacturing: Manufacturinginfo,
    metadata: metadatainfo,
  });

  responseData = await sdk.updateCompanyDetailById(compnayFinalArrayList);
  ///update company data
  if (!responseData) {
    throw new Error("Failed to Update Company.");
  }

  // Return Response in api
  const updatedCompany = responseData.update_Company_many?.map(
    (response: any) => {
      delete response?.__typename;
      return response;
    }
  );

  return updatedCompany;
};

export const deleteCompany: deleteCompany = async (id) => {
  const { update_Company } = await sdk.deleteCompanyDetailsById({
    id: id,
  });

  if (!update_Company) {
    throw new Error("Failed to Delete Company.");
  }

  // Return Response in api
  const deletedCompany = update_Company?.returning.flatMap((response) => {
    delete response.__typename;
    return response;
  });

  return deletedCompany;
};

// update company mappings

export const updateCompanymapping: updateparentcompanymapping = async (id) => {
  const { update_ParentCompanyMapping } =
    await sdk.UpdateParentCompanyMappingbyId({
      companyId: id,
      parentCompanyId: id,
    });

  if (!update_ParentCompanyMapping) {
    throw new Error("Failed to Delete Company.");
  }

  // Return Response in api
  const deletedCompany = update_ParentCompanyMapping?.affected_rows.valueOf();
  return deletedCompany;
};
