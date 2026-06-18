import { array, string } from "yup";
import CreateCompanySchema from "./create-company.schema";
import CreateUserSchema from "./create-user.schema";

export const BulkInsertCompanySchema = array()
  .of(
    CreateCompanySchema.shape({
      id: string().required("Company Id is required"),
    })
  )
  .required("Data required")
  .min(1, "Empty array, atleast one item required");

export const BulkInsertUsersSchema = array()
  .of(
    CreateUserSchema.shape({
      id: string().required("User Id is required"),
    })
  )
  .required("Data required")
  .min(1, "Empty array, atleast one item required");
