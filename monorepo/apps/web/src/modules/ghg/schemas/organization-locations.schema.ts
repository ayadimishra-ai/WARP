import { z } from "zod";
import { sanitiseValuesByTypeOfData } from "@/modules/ghg/utils/dom-purifier/dom-purify.client.util";

export const OrganizationLocationFormSchema = (
  organizationHasWWTP: boolean,
  isEdit: boolean,
  isServerSide: boolean = false
) =>
  z.object({
    address_id: isEdit
      ? z.string().uuid({ message: "Invalid UUID format for address_id" })
      : z
          .string()
          .uuid({ message: "Invalid UUID format for address_id" })
          .optional(),
    code: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val.trim() === "") return "";
        return isServerSide ? val : sanitiseValuesByTypeOfData(val.trim());
      })
      .refine((val) => !val || val.length <= 20, {
        message: "Location code must not exceed 20 characters",
      })
      .refine((val) => !val || /^[a-zA-Z0-9_-]+$/.test(val), {
        message:
          "Location code can only contain letters, numbers, hyphens, and underscores (no spaces allowed)",
      }),
    name: z
      .string()
      .min(2, "Location name must be at least 2 characters")
      .max(100, "Location name must not exceed 100 characters")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => /^[a-zA-Z0-9\s]+$/.test(val), {
        message: "Location name can only contain letters, numbers, and spaces",
      }),
    type: z
      .string()
      .min(1, "Location type is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Location type is required",
          };
        }
        return true;
      }),
    ownership_type: z
      .string()
      .min(1, "Ownership type is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Ownership type is required",
          };
        }
        return true;
      }),
    facility_type: z
      .string()
      .min(1, "Facility type is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Facility type is required",
          };
        }
        return true;
      }),
    full_address: z
      .string()
      .min(1, "Full address is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Full address is required",
          };
        }
        return true;
      })
      .refine((val) => val.length >= 10, {
        message: "Full address must be at least 10 characters",
      })
      .refine((val) => val.length <= 300, {
        message: "Full address must not exceed 300 characters",
      })
      .refine((val) => /^[a-zA-Z0-9\s,./-]+$/.test(val), {
        message:
          "Full address can only contain letters, numbers, spaces, and punctuation (, . - /)",
      }),
    country_id: z
      .string()
      .uuid("Invalid country value")
      .min(1, "Country is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Country is required",
          };
        }
        return true;
      }),
    state_id: z
      .string()
      .uuid("Invalid state value")
      .min(1, "State is required")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "State is required",
          };
        }
        return true;
      }),
    city_id: z
      .string()
      .uuid("Invalid city value")
      .min(1, "City is required")
      .refine((val) => {
        if (val === "") {
          return {
            message: "City is required",
          };
        }
        return true;
      }),
    pincode: z
      .string()
      .min(1, "Pin/Zip code is required")
      .max(20, "Pin/Zip code must not exceed 20 characters")
      .transform((val) =>
        isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
      )
      .refine((val) => {
        if (val === "") {
          return {
            message: "Pin/Zip code is required",
          };
        }
        return true;
      }),
    is_wwtp: organizationHasWWTP
      ? z
          .string()
          .min(1, "Please select an option")
          .transform((val) =>
            isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
          )
          .refine((val) => {
            if (val.length >= 1) {
              return {
                message: "Please select an option",
              };
            }
            return true;
          })
      : z
          .string()
          .optional()
          .default("no")
          .transform((val) =>
            isServerSide ? val : sanitiseValuesByTypeOfData(val.trim())
          )
          .refine((val) => {
            if (val.length >= 1) {
              return {
                message: "Please select an option",
              };
            }
            return true;
          }),
  });

// Type inference
export type TOrganizationLocationForm = z.infer<
  ReturnType<typeof OrganizationLocationFormSchema>
>;
