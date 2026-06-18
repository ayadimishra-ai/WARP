import { getSdkInstance } from "@/graphql/server/sdk";
import { Order_By } from "@/graphql/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const authToken = "EzqUt3IXQxidMdRA";

const ValSchema = z.object({
  op_organization_id: z.string().min(1).max(100),
  user_ids: z
    .array(z.string().min(1))
    .min(1, "At least one user ID is required")
    .optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
  page_index: z.number().int().min(0).optional(),
  page_size: z.number().int().min(1).max(100).optional(),
  user_id: z.string().min(1).optional()
});

const POST = async (req: Request) => {
  try {
    const token = req.headers.get("Authorization");

    if (token !== authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      op_organization_id,
      user_ids,
      sort_order,
      page_index,
      page_size,
      user_id
    } = ValSchema.parse(body);

    let sortOrderEnum: Order_By = Order_By.Asc;
    if (sort_order === "desc") {
      sortOrderEnum = Order_By.Desc;
    }

    // Build dynamic where clause
    const whereClause: any = {
      op_organizaion_id: { _eq: op_organization_id }
    };

    // Add conditions dynamically based on provided parameters
    const andConditions: any[] = [];

    if (user_ids && user_ids.length > 0) {
      andConditions.push({ op_user_id: { _in: user_ids } });
    }

    if (user_id) {
      andConditions.push({ op_user_id: { _neq: user_id } });
    }

    // Add _and clause only if there are conditions
    if (andConditions.length > 0) {
      whereClause._and = andConditions;
    }

    const sdk = await getSdkInstance();
    const data = await sdk.getLastLoginDetailsByOrganizaionId({
      where: whereClause,
      sortOrder: sortOrderEnum,
      pageIndex: page_index,
      pageSize: page_size
    });

    return NextResponse.json({
      success: true,
      data: data.view_last_user_login
    });
  } catch (error) {
    console.error("Error fetching login details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export { POST };
