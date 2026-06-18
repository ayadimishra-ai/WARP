import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";

const SQL_QUERY_GET_ORGANIZATION_DETAILS_BY_ID = (organizationId: string) => {
  return sql.raw(`
    select * from "Organization"
    where id = '${organizationId}'
  `);
};

export const GET = async (req: NextRequest) => {
  // const data = await serverSDK.getActivities();
  const orgId = "cfe37694-341f-4ff7-afe4-97e0e77eaf7e";

  const dbContext = await GetOPSDBContext();

  const result = await dbContext.execute(
    SQL_QUERY_GET_ORGANIZATION_DETAILS_BY_ID(orgId)
  );

  return NextResponse.json({ message: "This is GET request", result });
};

export const POST = async (req: NextRequest) => {
  const data = await req.json();
  return NextResponse.json({ message: "This is POST request", data });
};
