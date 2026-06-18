import { object, string } from "yup";

const CompnayPrimaryContactSchema = object({
  name: string().required(),
  email: string().email().required(),
  phone: string(),
});

const CreateCompanySchema = object({
  name: string().required("Company name is required"),
  primaryContact: CompnayPrimaryContactSchema,
  details: object(),
  country: string().required("Country is required"),
});

export default CreateCompanySchema;
