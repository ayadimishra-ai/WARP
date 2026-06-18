import * as yup from "yup";

export const SendInvitationSelectExistingCompanySchema = yup.object({
  selectedCompanyIds: yup
    .array(yup.string().required())
    //.min(1, "Select atleast one company to proceed further")
    .required(),
  duration: yup
    .object({
      fromDate: yup.date().required(),
      toDate: yup.date().required(),
    })
    .required(),
  fundType: yup.string(),
});

export type SendInvitationSelectExistingCompanyType =
  typeof SendInvitationSelectExistingCompanySchema.__outputType;
