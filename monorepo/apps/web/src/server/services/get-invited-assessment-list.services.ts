import axios from 'axios';
import { getSdkInstance } from '@/graphql/server/sdk';
import { getServerEnv } from "@/lib/env/env.server";
import { FormInvitationResponse } from '@/types/interface.types';
import { globalSetting } from '@/util/globalSetting';
import { debug } from 'console';
import { user } from '@/lib/db/auth-schema';
import { permission } from 'process';
import { promise } from 'zod';

export async function GetInvitedAssessmentList(
    companyCpanelId: string, formId?: string, requestEmail?: string
): Promise<{ success: boolean; message: string; error?: any }> {
    try {
        const sdk = await getSdkInstance();
        const settings = await globalSetting();
        if (!settings.accessTokenUrl || !settings.clientId || !settings.clientSecret) {
            throw new Error('Missing WARP API configuration');
        }

        const warpUrl = settings.accessTokenUrl + "api/get-invited-assessmentlist-by-companyId";

        const response = await axios({
            method: 'post',
            url: warpUrl,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'x-warp-shared-key': settings.clientId,
                'x-warp-shared-secret': settings.clientSecret
            },
            data: { companyId: companyCpanelId }
        });

        if (!response.data?.response?.FormInvitation) {
            return { success: true, message: 'No invitations found' };
        }

        const Companyinvites = response.data.response.FormInvitation as FormInvitationResponse[];
        const invites = formId ? Companyinvites.filter(invite => invite.email.toLowerCase().trim() === requestEmail?.toLowerCase().trim()) : Companyinvites;
        const reviewerEmails = invites.flatMap(invite =>
        invite.reviewerDetails?.email ? [invite.reviewerDetails.email] : []
        );
        if (invites.length === 0) {
            return { success: true, message: 'No invitations found' };
        }

        // 2. Get company and role mapping once
        const { Tbl_Companies } = await sdk.GetCompanyByCpanelId({ cpanelCompanyId: companyCpanelId });
        const company = Tbl_Companies?.[0];
        if (!company) return { success: false, message: 'Company not found' };

        const { Tbl_CompanyRoleMapping, Tbl_UserCompanyMapping } = await sdk.GetCompanyRoleMapping({
            companyGuid: company.CompanyGuid
        });
        let roleRec = Tbl_CompanyRoleMapping?.[0];
        const userRoleRec= Tbl_UserCompanyMapping?.[0];
        let isBuyer = roleRec?.Tbl_Role?.RoleName === 'BUYER';
        let isSupplier = roleRec?.Tbl_Role?.RoleName === 'SUPPLIER';
        let isVentureCapitalist = roleRec?.Tbl_Role?.RoleName === 'VENTURECAPITALIST';
        let isLocationExecutive = roleRec?.Tbl_Role?.RoleName === 'LOCATIONEXECUTIVE';
        let iscarbonAccountant = roleRec?.Tbl_Role?.RoleName === 'CARBONACCOUNTANT';



        if (iscarbonAccountant) {
            // For Canbon Accountant role, we need to check the user's actual role mapping as it can be either CARBONACCOUNTANT or LOCATIONEXECUTIVE
                isLocationExecutive = true;
            // userRoleRec?.Tbl_User?.Tbl_UserRoleMappings?.forEach(mapping => {
            //     if (mapping.Tbl_Role?.RoleName === 'CARBONACCOUNTANT') {
            //         iscarbonAccountant = true;
            //     }
            //     if (mapping.Tbl_Role?.RoleName === 'LOCATIONEXECUTIVE') {
            //         isLocationExecutive = true;
            //     }
            // });
        }

        // 3. Pre-fetch all unique form IDs and parent company IDs
        const formIds = [...new Set(invites.map(inv => inv.Form.id))];
        const parentCpanelIds = [...new Set(invites.map(inv => inv.parentcompanyId))];

        // 4. Batch fetch all forms
        const formsResponse = await Promise.all(
            formIds.map(formId =>
                sdk.GetWarpFormById({ formId })
                    .then(res => ({
                        formId,
                        form: res.Tbl_WarpForms?.[0]
                    }))
                    .catch(() => ({ formId, form: null }))
            )
        );
        const formsMap = new Map(formsResponse
            .filter(item => item.form)
            .map(item => [item.formId, item.form]));

        // 5. Batch fetch all parent companies
        const parentCompaniesResponse = await Promise.all(
            parentCpanelIds.map(cpanelId =>
                sdk.GetCompanyByCpanelId({ cpanelCompanyId: cpanelId })
                    .then(res => ({
                        cpanelId,
                        company: res.Tbl_Companies?.[0]
                    }))
                    .catch(() => ({ cpanelId, company: null }))
            )
        );
        const parentCompaniesMap = new Map(parentCompaniesResponse
            .filter(item => item.company)
            .map(item => [item.cpanelId, item.company]));

        // Remove commented out code and unused dashboardTypes variable

        // 7. Get all unique emails for batch user lookup
        // const emails = [...new Set(invites.map(inv => inv.email.toLowerCase()))];
        const emails = [
        ...new Set(
            invites
            .flatMap(inv => [inv.email, inv.reviewerDetails?.email])
            .filter(Boolean)
            .map(email => email!.toLowerCase())
        )
        ];
        const usersResponse = await Promise.all(
            emails.map(email =>
                sdk.GetUserByEmail({ email: email.toUpperCase() })
                    .then(res => ({
                        email,
                        user: res.Tbl_Users?.[0],
                        userPermissions: res.Tbl_Users?.[0]?.Tbl_UserRoleMappings || []
                    }))
                    .catch(() => ({ email, user: null, userPermissions: [] }))
            )
        );
        const userMap = new Map(usersResponse
            .filter(item => item.user)
            .map(item => [item.email.toUpperCase(), item.user]));
        debugger;
        const userPermissions = new Map(usersResponse
            .filter(item => item.user)
            .map(item => [item.email.toUpperCase(), item.userPermissions]));
        // userPermissions.forEach((permissions, email) => {
        //     return userPermissions.get(email)?.[0]?.RoleGuid;
        // });

        const roleGuid = emails.length > 0 ? userPermissions.get(requestEmail?.toUpperCase() || emails[0])?.[0]?.RoleGuid : undefined;
        const userRoleName = emails.length > 0 ? userPermissions.get(requestEmail?.toUpperCase() || emails[0])?.[0]?.Tbl_Role?.RoleName : undefined;
        let IsUserRoleFound = false;
        if (!!roleGuid) {
            if (userRoleName !== roleRec?.Tbl_Role?.RoleName) {
                roleRec = Tbl_CompanyRoleMapping?.[0];
                isBuyer = userRoleName === 'BUYER';
                isSupplier = userRoleName === 'SUPPLIER';
                isVentureCapitalist = userRoleName === 'VENTURECAPITALIST';
                isLocationExecutive = userRoleName === 'LOCATIONEXECUTIVE';
                iscarbonAccountant = userRoleName === 'CARBONACCOUNTANT';
                IsUserRoleFound = true;
            }
        }
        // 8. Get all pages and permissions in batch
        const pageKeys = ['Assessments', 'dashboard', 'Assess', 'Assessments_reporting', 'DocumentRepository', 'ChatWithSnowkapAI'];
        const pagesResponse = await Promise.all(
            pageKeys.map(key =>
                sdk.GetPageByKey({ pageKey: key })
                    .then(res => ({
                        key,
                        page: res.Tbl_Pages?.[0]
                    }))
                    .catch(() => ({ key, page: null }))
            )
        );
        const pages = pagesResponse
            .filter(item => item.page)
            .map(item => ({
                pageKey: item.key,
                pageGuid: item.page!.PageGuid
            }));

            let RoleGuid = roleGuid;
            if(IsUserRoleFound){ 
                RoleGuid = roleGuid;
            }else if(roleRec?.Tbl_Role?.RoleName === "CARBONACCOUNTANT"){
                const { Tbl_Roles } = await sdk.GetRoleByName({
                    roleName: "LOCATIONEXECUTIVE"
                    });
                    RoleGuid = Tbl_Roles?.[0]?.RoleGuid;
            }

        const permissionsResponse = await Promise.all(
            pages.map(page =>
                sdk.GetPermissionsByRoleAndPagesGuid({
                    roleGuid: RoleGuid || roleRec?.Tbl_Role?.RoleGuid || '',
                    pageGuid: page.pageGuid,
                })
                    .then(res => ({
                        pageGuid: page.pageGuid,
                        permission: res.Tbl_Permissions?.[0]
                    }))
                    .catch(() => ({ pageGuid: page.pageGuid, permission: null }))
            )
        );
        const permissionMap = new Map(
            permissionsResponse
                .filter(item => item.permission)
                .map(item => [item.pageGuid, item.permission])
        );

        const grantUserPermission = async (
            userGuid: string,
            permissionGuids: string[]
        ) => {
            try {
                // debugger;
                if (!permissionGuids?.length) return;

                // Check for existing permissions to avoid duplicate entries
                const { Tbl_UserPermissions } =
                    await sdk.GetUserPermissionsByUserAndPermissionGuid({
                        userGuid,
                        permissionGuids: permissionGuids
                    });

                const existingGuids = new Set(Tbl_UserPermissions?.map(p => p.PermissionGuid) || []);
                const missingGuids = permissionGuids.filter(id => !existingGuids.has(id));

                if (missingGuids.length > 0) {
                    const permissionInputs = missingGuids.map(permissionGuid => ({
                        UserGuid: userGuid,
                        PermissionGuid: permissionGuid,
                        Rights: "W"
                    }));
                    
                    await sdk.insertUserPermissions({
                        input: permissionInputs
                    });
                }
            } catch (error) {
                console.error(`Error granting permissions to user ${userGuid}:`, error);
            }
        };

        // Process invitations sequentially to avoid race conditions and duplicate entries
        for (const invite of invites) {
            try {
                const form = formsMap.get(invite.Form.id);
                const email = invite.email.toUpperCase();
                const parentCompany = parentCompaniesMap.get(invite.parentcompanyId);
                const user = userMap.get(email);
                const reviewerEmail = invite.reviewerDetails?.email?.toUpperCase();
                const reviewerUser = reviewerEmail ? userMap.get(reviewerEmail) : null;
                // Process dashboard mapping if form exists
                if (form?.PageKey) {
                    // Map PageKey to DashboardType
                    const dashboardType: string = form.PageKey === 'PostdealESGReport' ? 'postdealesgreport'
                        : form.PageKey === 'PredealESGReport' ? 'predealesgreport'
                            : form.PageKey === 'ChirataeESGInvesteeQuestionnaireAnnual' ? 'chirataeesginvesteequestionnaireannual'
                                : '';

                    if (!dashboardType) continue;

                    const companyGuid = await sdk.GetMappedCompanyGuid({ DashboardType: dashboardType });
                    // Get the mapped company's template
                    const mappedCompanyGuid = companyGuid?.Tbl_CompanyDashboardMapping[0]?.CompanyGuid;
                    if (mappedCompanyGuid) {
                        const { Tbl_CompanyDashboardMapping: templates } = await sdk.GetCompanyDashboardMapping({
                            companyGuid: mappedCompanyGuid,
                            DashboardType: dashboardType
                        });
                        // Find the template that matches our criteria
                        const template = templates?.find(t =>
                            t.CompanyType === 'Portfolio Company' &&
                            t.DashboardType === dashboardType
                        );

                        if (template) {
                            // Check if this mapping already exists
                            const { Tbl_CompanyDashboardMapping: existingMappings } = await sdk.GetCompanyDashboardMapping({
                                companyGuid: company?.CompanyGuid,
                                DashboardType: dashboardType
                            });
                            const hasMapping = existingMappings?.some(m =>
                                m.CompanyType === 'Portfolio Company' &&
                                m.DashboardType === dashboardType
                            );
                            if (!hasMapping) {
                                await sdk.InsertCompanyDashboardMapping({
                                    object: {
                                        CompanyGuid: company.CompanyGuid,
                                        DashboardType: template.DashboardType,
                                        Url: template.Url,
                                        CompanyType: 'Portfolio Company',
                                        DisplayOrder: template.DisplayOrder,
                                        ColumnSize: template.ColumnSize,
                                        IFrameStyle: template.IFrameStyle,
                                        IsActive: template.IsActive,
                                        ReportName: template.ReportName,
                                        DashboardHeight: template.DashboardHeight,
                                        IsBorder: template.IsBorder,
                                        IsPowerBiReport: template.IsPowerBiReport,
                                    }
                                });
                            }
                        }
                    }
                }
                // Process assessment mapping
                if (parentCompany) {
                    await sdk.UpsertAssessmentMapping({
                        input: {
                            AssesseeCompanyGuid: company.CompanyGuid,
                            AssessorCompanyGuid: parentCompany.CompanyGuid,
                            CreatedDate: new Date().toISOString()
                        },
                    });
                }
                // Process permissions based on role
                if (user) {
                    const form_type = form?.formtype || '';
                    
                    // Collect relevant permissions based on role and form type
                    const getRelevantPermissions = () => pages
                        .filter(page => {
                            // if (isBuyer) return true; // Buyers get all pages in the list
                            return (form_type === "Report" && page.pageKey === "Assessments_reporting") ||
                                   (form_type === "Assessment" && (page.pageKey === "Assessments" || page.pageKey === "Assess")) ||
                                   ["dashboard", "DocumentRepository", "ChatWithSnowkapAI"].includes(page.pageKey);
                        })
                        .map(page => permissionMap.get(page.pageGuid)?.PermissionGuid)
                        .filter((id): id is string => !!id);

                    if (isBuyer) {
                        await grantUserPermission(user.UserGuid, getRelevantPermissions());
                    } else if (isVentureCapitalist || isLocationExecutive || iscarbonAccountant) {
                        const permissions = getRelevantPermissions();
                        await grantUserPermission(user.UserGuid, permissions);
                        
                        // Also grant to reviewer if applicable
                        if (reviewerUser && (isVentureCapitalist || isLocationExecutive)) {
                            await grantUserPermission(reviewerUser.UserGuid, permissions);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing invitation for ${invite.email}:`, error);
            }
        }

        return { success: true, message: 'Invitation processing complete' };
    } catch (error: any) {
        const env = await getServerEnv();
        console.error('Error in getInvitedAssessmentsList:', error);
        return {
            success: false,
            message: 'Error processing invitations',
            error: {
                message: error.message,
                ...(env.NODE_ENV === 'development' && { stack: error.stack })
            },
        };
    }
}

export async function GetInvitedAssessmentListExistingUser(
    InvitationId: string,
    formId: string,
    userId: string,
    parentcompanyuserId: string
): Promise<{ success: boolean; message: string; error?: any }> {
    try {
        const sdk = await getSdkInstance();
        const settings = await globalSetting();
        let parentcompanyId = "";
        let cpanelcompanyId = "";
        // Create a single invitation object with the available data

        // 2. Get company and role mapping once
        const { Tbl_Users } = await sdk.GetUserByCpanelId({
            cpanelUserId: userId
        });
        if (Tbl_Users) {
            cpanelcompanyId = Tbl_Users?.[0]?.Tbl_UserCompanyMappings?.[0]?.Tbl_Company?.CPanelCompanyId || "";
        }
        // 3. Get parent company and role mapping once
        const Tbl_Users_parent: any = await sdk.GetUserByCpanelId({
            cpanelUserId: parentcompanyuserId
        });

        if (Tbl_Users_parent) {
            const userData = Tbl_Users_parent?.Tbl_Users?.[0]
            const parentcompdata = userData?.Tbl_UserCompanyMappings?.[0]?.Tbl_Company;
            parentcompanyId = parentcompdata.CPanelCompanyId || "";
        }
        // Create invitation object with all required fields
        const invites = [{
            Form: {
                id: formId,
                name: '' // We don't have this info but it's required by the type
            },
            email: Tbl_Users?.[0]?.EmailId || '',
            parentcompanyId: parentcompanyId,
            FormName: '', // We don't have this info but it's required by the type
            CompanyName: '', // We don't have this info but it's required by the type
            InvitationId: InvitationId,
            TestCreationId: '', // We don't have this info but it's required by the type
            CompanyId: '',  // Required field
            CpanelCompanyId: ''  // Required field
        }] as FormInvitationResponse[];


        // Get company details with the correct type

        const companyResponse = await sdk.GetCompanyByCpanelId({
            cpanelCompanyId: cpanelcompanyId
        });
        const company = companyResponse.Tbl_Companies?.[0];
        const roleRec = Tbl_Users?.[0]?.Tbl_UserCompanyMappings?.[0]?.Tbl_Company?.Tbl_CompanyRoleMappings?.[0]?.Tbl_Role;
        const isBuyer = roleRec?.RoleName === 'BUYER';
        const isSupplier = roleRec?.RoleName === 'SUPPLIER';
        const isVentureCapitalist = roleRec?.RoleName === 'VENTURECAPITALIST';
        const isLocationExecutive = roleRec?.RoleName === 'LOCATIONEXECUTIVE';
        const iscarbonAccountant = roleRec?.RoleName === 'CARBONACCOUNTANT';

        // 3. Pre-fetch all unique form IDs and parent company IDs
        const formIds = [formId];
        const parentCpanelIds = [parentcompanyId];

        // 4. Batch fetch all forms
        const formsResponse = await Promise.all(
            formIds.map((formId) =>
                sdk
                    .GetWarpFormById({ formId })
                    .then((res) => ({
                        formId,
                        form: res.Tbl_WarpForms?.[0]
                    }))
                    .catch(() => ({ formId, form: null }))
            )
        );
        const formsMap = new Map(
            formsResponse
                .filter((item) => item.form)
                .map((item) => [item.formId, item.form])
        );

        // 5. Batch fetch all parent companies
        const parentCompaniesResponse = await Promise.all(
            parentCpanelIds.map((cpanelId) =>
                sdk
                    .GetCompanyByCpanelId({ cpanelCompanyId: cpanelId })
                    .then((res) => ({
                        cpanelId,
                        company: res.Tbl_Companies?.[0]
                    }))
                    .catch(() => ({ cpanelId, company: null }))
            )
        );
        const parentCompaniesMap = new Map(
            parentCompaniesResponse
                .filter((item) => item.company)
                .map((item) => [item.cpanelId, item.company])
        );


        // Remove commented out code and unused dashboardTypes variable

        // 7. Get all unique emails for batch user lookup
        const userMap = new Map(Tbl_Users.map(user => [user.UserGuid.toLowerCase(), user]));
        // 8. Get all pages and permissions in batch
        const pageKeys = ['Assessments', 'dashboard', 'Assess', 'Assessments_reporting', 'DocumentRepository', 'ChatWithSnowkapAI'];
        const pagesResponse = await Promise.all(
            pageKeys.map(key =>
                sdk.GetPageByKey({ pageKey: key })
                    .then(res => ({
                        key,
                        page: res.Tbl_Pages?.[0]
                    }))
                    .catch(() => ({ key, page: null }))
            )
        );
        const pages = pagesResponse
            .filter(item => item.page)
            .map(item => ({
                pageKey: item.key,
                pageGuid: item.page!.PageGuid
            }));
        const permissionsResponse = await Promise.all(
            pages.map(page =>
                sdk.GetPermissionsByRoleAndPagesGuid({
                    roleGuid: roleRec?.RoleGuid || '',
                    pageGuid: page.pageGuid,
                })
                    .then(res => ({
                        pageGuid: page.pageGuid,
                        permission: res.Tbl_Permissions?.[0]
                    }))
                    .catch(() => ({ pageGuid: page.pageGuid, permission: null }))
            )
        );
        const permissionMap = new Map(
            permissionsResponse
                .filter(item => item.permission)
                .map(item => [item.pageGuid, item.permission])
        );

        const grantUserPermission = async (
          userGuid: string,
          permissionGuids: string[]
        ) => {
            try {
                if (!permissionGuids?.length) return;

                const { Tbl_UserPermissions } =
                    await sdk.GetUserPermissionsByUserAndPermissionGuid({
                        userGuid,
                        permissionGuids: permissionGuids
                    });

                const existingGuids = new Set(Tbl_UserPermissions?.map(p => p.PermissionGuid) || []);
                const missingGuids = permissionGuids.filter(id => !existingGuids.has(id));

                if (missingGuids.length > 0) {
                    const permissionInputs = missingGuids.map(permissionGuid => ({
                        UserGuid: userGuid,
                        PermissionGuid: permissionGuid,
                        Rights: "W"
                    }));
                    
                    await sdk.insertUserPermissions({
                        input: permissionInputs
                    });
                }
            } catch (error) {
                console.error(`Error granting permissions to user ${userGuid}:`, error);
            }
        };

        // Process invitations sequentially to avoid race conditions and duplicate entries
        for (const invite of invites) {
            try {
                const form = formsMap.get(invite.Form.id);
                const email = invite.email.toLowerCase();
                const parentCompany = parentCompaniesMap.get(invite.parentcompanyId);
                const user = Tbl_Users?.[0]//userMap.get(email);  
                const reviewerEmail = invite.reviewerDetails?.email?.toLowerCase();
                const reviewerUser = reviewerEmail ? userMap.get(reviewerEmail) : null;
                // Process dashboard mapping if form exists
                if (form?.PageKey) {
                    // Map PageKey to DashboardType
                    const dashboardType: string = form.PageKey === 'PostdealESGReport' ? 'postdealesgreport'
                        : form.PageKey === 'PredealESGReport' ? 'predealesgreport'
                            : form.PageKey === 'ChirataeESGInvesteeQuestionnaireAnnual' ? 'chirataeesginvesteequestionnaireannual'
                                : '';

                    if (!dashboardType) continue;

                    const companyGuid = await sdk.GetMappedCompanyGuid({
                        DashboardType: dashboardType
                    });
                    // Get the mapped company's template
                    const mappedCompanyGuid =
                        companyGuid?.Tbl_CompanyDashboardMapping[0]?.CompanyGuid;
                    if (mappedCompanyGuid) {
                        const { Tbl_CompanyDashboardMapping: templates } =
                            await sdk.GetCompanyDashboardMapping({
                                companyGuid: mappedCompanyGuid,
                                DashboardType: dashboardType
                            });
                        // Find the template that matches our criteria
                        const template = templates?.find(
                            (t) =>
                                t.CompanyType === "Portfolio Company" &&
                                t.DashboardType === dashboardType
                        );

                        if (template) {
                            // Check if this mapping already exists
                            const { Tbl_CompanyDashboardMapping: existingMappings } = await sdk.GetCompanyDashboardMapping({
                                companyGuid: company?.CompanyGuid,
                                DashboardType: dashboardType
                            });
                            const hasMapping = existingMappings?.some(m =>
                                m.CompanyType === 'Portfolio Company' &&
                                m.DashboardType === dashboardType
                            );
                            if (!hasMapping) {
                                if (!company?.CompanyGuid) {
                                    console.error('Company or CompanyGuid is undefined');
                                    continue;
                                }
                                await sdk.InsertCompanyDashboardMapping({
                                    object: {
                                        CompanyGuid: company.CompanyGuid,
                                        DashboardType: template.DashboardType,
                                        Url: template.Url,
                                        CompanyType: 'Portfolio Company',
                                        DisplayOrder: template.DisplayOrder,
                                        ColumnSize: template.ColumnSize,
                                        IFrameStyle: template.IFrameStyle,
                                        IsActive: template.IsActive,
                                        ReportName: template.ReportName,
                                        DashboardHeight: template.DashboardHeight,
                                        IsBorder: template.IsBorder,
                                        IsPowerBiReport: template.IsPowerBiReport,
                                    }
                                });
                            }
                        }
                    }
                }
                // Process assessment mapping
                if (parentCompany) {
                    await sdk.UpsertAssessmentMapping({
                        input: {
                            AssesseeCompanyGuid: company.CompanyGuid,
                            AssessorCompanyGuid: parentCompany.CompanyGuid,
                            CreatedDate: new Date().toISOString()
                        },
                    });
                }
                // Process permissions
                if (user) {
                    const form_type = form?.formtype || '';
                    const getRelevantPermissions = () => pages
                        .filter(page => {
                            // if (isBuyer || isSupplier) return true;
                            return (form_type === "Report" && page.pageKey === "Assessments_reporting") ||
                                   (form_type === "Assessment" && (page.pageKey === "Assessments" || page.pageKey === "Assess")) ||
                                   ["dashboard", "DocumentRepository", "ChatWithSnowkapAI"].includes(page.pageKey);
                        })
                        .map(page => permissionMap.get(page.pageGuid)?.PermissionGuid)
                        .filter((id): id is string => !!id);

                    if (isBuyer || isSupplier) {
                        await grantUserPermission(user.UserGuid, getRelevantPermissions());
                    } else if (isVentureCapitalist || isLocationExecutive || iscarbonAccountant) {
                        const permissions = getRelevantPermissions();
                        await grantUserPermission(user.UserGuid, permissions);
                        
                        if (reviewerUser && (isVentureCapitalist)) {
                            await grantUserPermission(reviewerUser.UserGuid, permissions);
                        }
                    }
                }
            } catch (error) {
                console.error(
                    `Error processing invitation for ${invite.email}:`,
                    error
                );
            }
        }

        return { success: true, message: "Invitation processing complete" };
    } catch (error: any) {
        const env = await getServerEnv();
        console.error("Error in GetInvitedAssessmentList:", error);
        return {
            success: false,
            message: "Error processing invitations",
            error: {
                message: error.message,
                ...(env.NODE_ENV === "development" && { stack: error.stack })
            }
        };
    }
}