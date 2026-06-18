import { object, string } from "yup";

import { AppRoles } from "../constants/app.constants";

const CreateUserSchema = object({
  name: string().required("User name is required"),
  email: string().required("User email is required"),
  phone: string(),
  role: string()
    .oneOf(
      Object.values(AppRoles).filter((role) => role != AppRoles.Platform),
      "Invalid role"
    )
    .required("User role is required"),
  details: object(),
});

export default CreateUserSchema;
