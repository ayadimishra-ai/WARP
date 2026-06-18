import { array, object, string } from "yup";
import { sanitiseValuesByTypeOfData } from "../utils/dom-purifier/dom-purify.client.util";

const InvitationNewCompanySchema = object({
  companyForm: array().of(
    object({
      companyId: string(),
      companyName: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .required("Company name is required")
        .test("Company name is required", (val) => val !== ""),
      country: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .required("Country is required")
        .test("Country is required", (val) => val !== ""),
      primaryContactName: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .required("Primary contact name is required")
        .test("Primary contact name is required", (val) => val !== ""),
      primaryContactEmail: string()
        .email("Invalid email address")
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .required("Primary contact email is required")
        .test("Primary contact email is required", (val) => val !== "")
        .label("Primary contact email"),
      primaryContactMobileNumber: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .label("Primary contact number"),
      ismanufacturing: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .label("Manufacturing"),
    })
  ),
});

export default InvitationNewCompanySchema;
