import { NextRequest } from "next/server";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { saveUOMConversionMasterDetails } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { ISession } from "../../libs/auth/auth-helpers";
import { apiSuperAdminAuthGuard } from "../../libs/guards/api-super-admin.guard";

const ValidateUpsertInput = z.object({
  id: z.string().uuid().optional().nullable(),
  factor: z.number().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Factor must be a positive number",
  }),
  from_key: z.string().min(1, "From UOM is required"),
  to_key: z.string().min(1, "To UOM is required"),
  metadata: z
    .object({
      fuels: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
});

const getHandler = async (req: NextRequest, session: ISession) => {
  const sdk = await getGraphQlServerSDK();
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const uomMasters = await sdk.getUomMasters();

  const searchUom = (key: string) =>
    uomMasters.UomMaster.find(
      (u) => (u.alias || []).includes(key) || u.code === key || u.key === key
    );

  const dataConversionFactors =
    (await sdk.getUomConversionFactors().then((res) =>
      res.UomConversionMaster.flatMap((m) => {
        let fuels = m.metadata?.fuels || [];
        if (fuels.length === 0) {
          fuels.push("");
        }
        fuels = Array.from(new Set(fuels));

        return fuels.map((fuel: string) => ({
          id:
            m.id +
            "|" +
            m.from_key +
            "|" +
            m.to_key +
            "|" +
            fuel +
            "|" +
            m.factor,
          from_uom: searchUom(m.from_key)?.label || m.from_key || null,
          to_uom: searchUom(m.to_key)?.label || m.to_key || null,
          from_uom_code: searchUom(m.from_key)?.code || null,
          to_uom_code: searchUom(m.to_key)?.code || null,
          factor: m.factor || null,
          fuel: fuel || "",
          original: m,
        }));
      })
    )) || [];

  return Response.json({
    success: true,
    error: null,
    data: {
      uomConversionFactors: dataConversionFactors,
      uomMasters: uomMasters.UomMaster,
    },
  });
};

const postHandler = async (req: NextRequest, session: ISession) => {
  const body = await req.json();
  const sdk = await getGraphQlServerSDK();

  const validationResult = ValidateUpsertInput.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      {
        success: false,
        error: "Validation failed",
        data: validationResult.error.format(),
      },
      { status: 400 }
    );
  }

  // Simulate delay for testing

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  const result = await sdk.upsertUomConversionMaster({
    input: {
      id: validationResult.data.id || undefined,
      ...validationResult.data,
      created_by: session.userId,
      updated_by: session.userId,
    },
  });
  saveUOMConversionMasterDetails(result?.insert_UomConversionMaster?.returning);

  return Response.json({
    success: true,
    error: null,
    data: result.insert_UomConversionMaster,
  });
};
const putHandler = async (req: NextRequest, session: ISession) => {};

export const GET = apiExceptionGuard(apiSuperAdminAuthGuard(getHandler));
export const POST = apiExceptionGuard(apiSuperAdminAuthGuard(postHandler));
export const PUT = apiExceptionGuard(apiSuperAdminAuthGuard(putHandler));
