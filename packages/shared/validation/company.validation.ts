import * as yup from "yup";
import { array, object } from "yup";

export const companySchema = array().of(
  object({
    id: yup.string(),
    name: yup.string().required("Company name is required"),
    // primaryContact: yup.object({
    //   name: yup.string().required("Name is required"),
    //   email: yup.string().email().required("Email is required"),
    //   phone: yup
    //     .string()
    //     .matches(
    //       /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
    //       "Phone number is not valid"
    //     )
    //     .required("Phone is required"),
    // }),
    // details: yup.object({}),
    // parentCompanyId: yup.string(),
    // platformId: yup.string(),
    created_by: yup.string().required("Created by is required"),
    updated_by: yup.string().required("Updated by is required"),
    // country: yup.string(),
  })
);
