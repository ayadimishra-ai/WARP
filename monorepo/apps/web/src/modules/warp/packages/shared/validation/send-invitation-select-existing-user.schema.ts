import * as yup from "yup";

export const SendInvitationSelectExistingUserSchema = yup.object({
  selectedLocationIds: yup.string(),
  selectedEmailIds: yup
    .array(yup.string().required())
    //.min(1, "Select at-least one email to proceed")
    .required(),
  duration: yup
    .object({
      fromDate: yup.date().required(),
      toDate: yup.date().required(),
    })
    .required(),
  reviewerFullName: yup
    .string()
    .optional()
    .test(
      "not-same-as-reporter",
      "Reviewer cannot be the same as Reporter",
      function (value) {
        const { selectedEmailIds } = this.parent;
        if (!value) return true; // Optional field
        // We can't validate against reporter name here as it's just an ID
        // This validation will be done in the component
        return true;
      }
    ),
  reviewerEmail: yup
    .string()
    .optional()
    .email("Invalid email address")
    .test(
      "not-same-as-reporter",
      "Reviewer email cannot be the same as Reporter email",
      function (value) {
        if (!value) return true; // Optional field
        // Validation for same email will be done in the component
        return true;
      }
    ),
});

export type SendInvitationSelectExistingUserType =
  typeof SendInvitationSelectExistingUserSchema.__outputType;
