import { z } from "zod";
import { months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

export const TransactionYearMonthSchema = (baseYear: number) =>
  z.object({
    Year: z
      .custom((val) => {
        const value = Number(sanitizeString.v1(String(val)));
        return value >= baseYear && value <= new Date().getFullYear();
      }, "Invalid year")
      .transform((val) => Number(sanitizeString.v2(String(val)))),
    Month: z
      .custom(
        (val) =>
          months
            .map(sanitizeString.v1)
            .includes(sanitizeString.v1(String(val))),
        "This field is required"
      )
      .transform((val) => sanitizeString.v2(String(val))),
  });
