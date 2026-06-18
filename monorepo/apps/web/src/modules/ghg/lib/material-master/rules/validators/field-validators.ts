/**
 * Field-Level Validators for Material Master
 *
 * Contains Zod schemas for all 8 material master fields.
 * These validators handle format, length, data type, and field-specific rules.
 */

import { z } from "zod";
import {
  ADDITIONAL_INFORMATION,
  MATERIAL_CLASSIFICATION,
  MATERIAL_CODE,
  MATERIAL_DESCRIPTION,
  MATERIAL_NAME,
  MATERIAL_TYPE,
  MATERIAL_TYPES,
  MATERIAL_WEIGHT,
  UOM_MATERIAL_WEIGHT,
  UOM_OPTIONS,
} from "@/modules/ghg/shared/constants/material-master-activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { CONSTRAINTS } from "../material-master-rules.config";

/**
 * Material Name: Required, max 500 chars, alphanumeric + (. - _ ; ,)
 */
export const materialNameSchema = z.preprocess(
  (val) => {
    if (typeof val !== "string") return String(val);
    return val;
  },
  z
    .string({
      required_error: `${MATERIAL_NAME} is required`,
      invalid_type_error: `Invalid Input: ${MATERIAL_NAME} must be a text value`,
    })
    .max(CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_NAME, {
      message: `${MATERIAL_NAME} cannot exceed ${CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_NAME} characters`,
    })
    .transform((val) => val.trim().replace(/\s+/g, " ")) // Collapse multiple spaces
    .refine((val) => val !== "", {
      message: `${MATERIAL_NAME} is required`,
    })
    .refine(
      (val) =>
        val !== null &&
        val !== undefined &&
        val !== "null" &&
        val !== "undefined" &&
        val !== "",
      {
        message: `Invalid Input: ${MATERIAL_NAME} cannot be null, undefined, or empty`,
      }
    )
    .refine((val) => /^[a-zA-Z0-9 .\-_;,]*$/.test(val), {
      message: `Invalid Input: ${MATERIAL_NAME} may only contain alphanumeric characters and special characters (. - _ ; ,)`,
    })
);

/**
 * Material Code: Required, max 500 chars, unique in file, alphanumeric + (. - _ ; ,), NO SPACES
 * CRITICAL: This field is IMMUTABLE after creation
 */
export const materialCodeSchema = z.preprocess(
  (val) => {
    if (typeof val !== "string") return String(val);
    return val;
  },
  z
    .string({
      required_error: `${MATERIAL_CODE} is required`,
    })
    .max(CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_CODE, {
      message: `${MATERIAL_CODE} cannot exceed ${CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_CODE} characters`,
    })
    .transform((val) => val.trim().replace(/\s+/g, " ")) // Collapse spaces for validation
    .refine((val) => val !== "", {
      message: `${MATERIAL_CODE} is required`,
    })
    .refine(
      (val) =>
        val !== null &&
        val !== undefined &&
        val !== "null" &&
        val !== "undefined" &&
        val !== "",
      {
        message: `Invalid Input: ${MATERIAL_CODE} cannot be null, undefined, or empty`,
      }
    )
    .refine((val) => /^[a-zA-Z0-9.\-_;,]*$/.test(val), {
      message: `Invalid Input: ${MATERIAL_CODE} may only contain alphanumeric characters and special characters (. - _ ; ,)`,
    })
);

/**
 * Material Type: Required, must match dropdown values (MATERIAL_TYPES)
 * CRITICAL: Cannot update if activity data exists (Scenario D)
 */
export const materialTypeSchema = z
  .string({
    required_error: `${MATERIAL_TYPE} is required`,
    invalid_type_error: `Invalid Input: ${MATERIAL_TYPE} must be a text value`,
  })
  .transform((val) => val.trim())
  .refine((val) => val !== "", {
    message: `${MATERIAL_TYPE} is required`,
  })
  .refine(
    (val) => {
      const normalizedVal = sanitizeString.v1(val);
      return MATERIAL_TYPES.some(
        (type) => sanitizeString.v1(type) === normalizedVal
      );
    },
    {
      message: `Invalid Input: ${MATERIAL_TYPE} must be one of: ${MATERIAL_TYPES.join(", ")}`,
    }
  );

/**
 * Material Weight: Optional, non-negative, max 4 decimals
 */
export const materialWeightSchema = z
  .unknown()
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    },
    {
      message: `Invalid Input: ${MATERIAL_WEIGHT} must be a non-negative number`,
    }
  )
  .refine(
    (val) => {
      if (val === undefined) return true;
      const numStr = String(val);
      const decimalPart = numStr.split(".")[1];
      return (
        !decimalPart ||
        decimalPart.length <= CONSTRAINTS.MAX_DECIMAL_PLACES.MATERIAL_WEIGHT
      );
    },
    {
      message: `Invalid Input: ${MATERIAL_WEIGHT} can have at most ${CONSTRAINTS.MAX_DECIMAL_PLACES.MATERIAL_WEIGHT} decimal places`,
    }
  );

/**
 * UoM of Material Weight: Conditional (required if weight provided), must match dropdown (UOM_OPTIONS)
 * CRITICAL: Mismatch with existing UoM triggers Scenario C (notification)
 */
export const uomMaterialWeightSchema = z
  .unknown()
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return String(val).trim();
  })
  .refine(
    (val) => {
      if (val === undefined || val === "") return true;
      const normalizedVal = sanitizeString.v1(val);
      return UOM_OPTIONS.some(
        (uom) => sanitizeString.v1(uom) === normalizedVal
      );
    },
    {
      message: `Invalid Input: ${UOM_MATERIAL_WEIGHT} must be one of: ${UOM_OPTIONS.join(", ")}`,
    }
  );

/**
 * Material Classification: Optional, max 500 chars
 */
export const materialClassificationSchema = z
  .unknown()
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return String(val).trim().replace(/\s+/g, " ");
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      return val.length <= CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_CLASSIFICATION;
    },
    {
      message: `${MATERIAL_CLASSIFICATION} cannot exceed ${CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_CLASSIFICATION} characters`,
    }
  );

/**
 * Material Description: Optional, max 4000 chars
 */
export const materialDescriptionSchema = z
  .unknown()
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return String(val).trim().replace(/\s+/g, " ");
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      return val.length <= CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_DESCRIPTION;
    },
    {
      message: `${MATERIAL_DESCRIPTION} cannot exceed ${CONSTRAINTS.MAX_FIELD_LENGTH.MATERIAL_DESCRIPTION} characters`,
    }
  );

/**
 * Additional Information: Optional, max 4000 chars
 */
export const additionalInformationSchema = z
  .unknown()
  .optional()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return String(val).trim().replace(/\s+/g, " ");
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      return val.length <= CONSTRAINTS.MAX_FIELD_LENGTH.ADDITIONAL_INFORMATION;
    },
    {
      message: `${ADDITIONAL_INFORMATION} cannot exceed ${CONSTRAINTS.MAX_FIELD_LENGTH.ADDITIONAL_INFORMATION} characters`,
    }
  );

/**
 * Combined Material Master Schema
 * Used for field-level validation before business rule checks
 */
export const materialMasterFieldSchema = () => {
  return z
    .object({
      [MATERIAL_NAME]: materialNameSchema,
      [MATERIAL_CODE]: materialCodeSchema,
      [MATERIAL_TYPE]: materialTypeSchema,
      [MATERIAL_WEIGHT]: materialWeightSchema,
      [UOM_MATERIAL_WEIGHT]: uomMaterialWeightSchema,
      [MATERIAL_CLASSIFICATION]: materialClassificationSchema,
      [MATERIAL_DESCRIPTION]: materialDescriptionSchema,
      [ADDITIONAL_INFORMATION]: additionalInformationSchema,
    })
    .superRefine((data, ctx) => {
      const weight = data[MATERIAL_WEIGHT];
      const uom = data[UOM_MATERIAL_WEIGHT];
      // Conditional validation: If Material Weight is provided, UoM Material Weight is mandatory
      if (weight !== undefined && weight !== null && weight !== "") {
        if (uom === undefined || uom === null || uom === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [UOM_MATERIAL_WEIGHT],
            message: `${UOM_MATERIAL_WEIGHT} is required if ${MATERIAL_WEIGHT} is provided`,
          });
        }
      }
    });
};
