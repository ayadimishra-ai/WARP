import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";

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
  try {
    const body = await req.json();
    const orgId = String(body.organizationId);
    const dbContext = await GetOPSDBContext();
    const monthlyActivityData = await dbContext.execute(
      SQL_QUERY_GET_MONTHLY_ACTIVITY_DATA(orgId)
    );
    return NextResponse.json({ success: true, data: monthlyActivityData });
  } catch (error) {
    throw CustomError({
      statusCode: 400,
      message: "Invalid organization id.",
    });
  }
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
