import { array, object, string } from "yup";
import { sanitiseValuesByTypeOfData } from "../utils/dom-purifier/dom-purify.client.util";

const InvitationNewUserSchema = object({
  userForm: array().of(
    object({
      locationId: string(),
      location: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? "")),
      email: string()
        .email("Invalid email address")
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .required("Email id is required")
        .test("Email is required", (val) => val !== "")
        .label("Email"),
      fullName: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .test("Full Name is required", (val) => val !== "")
        .label("Full Name")
        .required("Full Name is required"),
      mobileNumber: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .label("Contact numbar"),
      reviewerFullName: string()
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .optional()
        .label("Reviewer Full Name")
        .test(
          "not-same-as-reporter",
          "Reviewer cannot be the same as Reporter",
          function (value) {
            const { fullName } = this.parent;
            if (!value) return true; // Optional field
            return value !== fullName;
          }
        ),
      reviewerEmail: string()
        .email("Invalid email address")
        .transform((val) => sanitiseValuesByTypeOfData(val?.trim() ?? ""))
        .optional()
        .label("Reviewer Email")
        .test(
          "not-same-as-reporter",
          "Reviewer email cannot be the same as Reporter email",
          function (value) {
            const { email } = this.parent;
            if (!value) return true; // Optional field
            return value.toLowerCase() !== email.toLowerCase();
          }
        ),
    })
  ),
});

export default InvitationNewUserSchema;
