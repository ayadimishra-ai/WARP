import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { CustomError } from "~/shared/error/custom-error";
import { GetOPSDBContext } from "~/utils/database/db-context";

const BodySchema = z.object({
  organizationId: z.string().uuid("Invalid organization id"),
});

const SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA = (organizationId: string) => {
  return sql.raw(`
    select
    tr.year,
    tr.month,
    ARRAY_AGG(distinct a.name) AS activity_names
from "ActivityTaskRequest" atr
    left join "Activity" a on a.id = atr.activity_id
    left join "TaskRequest" tr on tr.id = atr.task_request_id
where
    atr.organization_address_id IN (
        select id
        from "OrganizationAddress"
        where organization_id = '${organizationId}'
    )
group by
    tr.year,
    tr.month
order by
    tr.year desc ,
    tr.month desc
limit 1;
  `);
};

async function postHandler(req: NextRequest) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    throw CustomError({
      statusCode: 400,
      message: "Invalid organization id.",
    });
  }
  const orgId = parsed.data.organizationId;
  const dbContext = await GetOPSDBContext();
  const monthlyActivityData = await dbContext.execute(
    SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA(orgId)
  );
  return NextResponse.json({ success: true, data: monthlyActivityData });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
