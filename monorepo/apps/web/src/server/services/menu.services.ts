import { getSdkInstance } from "@/graphql/server/sdk";
import {
  menuRequestSchema,
  MenuRequest
} from "@/lib/validations/menu.validations";
import { MenuItem, MenuServiceResponse } from "@/types/interface.types";

export async function getMenuList(
  params: MenuRequest
): Promise<MenuServiceResponse> {
  // Input validation
  const validation = menuRequestSchema.safeParse(params);
  if (!validation.success) {
    const error = validation.error.errors[0];
    return {
      success: false,
      error: error.message,
      status: 400,
      details: error.path.join(".")
    };
  }

  const { roleGuid, userGuid } = validation.data;
  const sdk = await getSdkInstance();

  try {
    const { Tbl_Permissions, Tbl_Roles } = await sdk.GetMenuList({
      roleGuid: roleGuid.trim(),
      userGuid: userGuid.trim()
    });

    if (!Tbl_Permissions || Tbl_Permissions.length === 0) {
      return {
        success: true,
        data: { table1: [] }
      };
    }

    const formattedData = Tbl_Permissions.map((permission) => {
      const resourceValue =
        permission.Tbl_LanguageResource?.ResourceValue || "";

      const role = Tbl_Roles[0];

      return {
        pageguid: permission.PageGuid,
        menuType: permission.MenuType || "",
        menuDisplayOrder: permission.MenuDisplayOrder || 0,
        iconName: permission.IconName || "",
        priority: role?.Priority || 0,
        pageKey: permission.Tbl_Page?.PageKey || "",
        url: permission.Tbl_Page?.URL || null,
        resourceValue: resourceValue,
        roleName: role?.RoleName || "",
        rn: 1,
        isParentMenu: permission.Tbl_Page?.ParentPageGuid ? 0 : 1,
        hasChild: 0,
        parentPageGuid: permission.Tbl_Page?.ParentPageGuid || null
      };
    }).reduce((acc: MenuItem[], item) => {
      const existingItem = acc.find((i) => i.pageguid === item.pageguid);
      if (!existingItem) {
        acc.push(item);
      }
      return acc;
    }, []);

    return {
      success: true,
      data: {
        table1: formattedData
      }
    };
  } catch (error) {
    console.error("Error in getMenuList service:", error);
    return {
      success: false,
      error: "Failed to fetch menu list",
      details: error instanceof Error ? error.message : "Unknown error",
      status: 500
    };
  }
}
