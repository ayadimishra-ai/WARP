import * as yup from "yup";
const userValidationSchema = yup.object({
  userName: yup.string().label("User Name").required("User name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email id is required")
    .label("Email"),
});
export default userValidationSchema;
