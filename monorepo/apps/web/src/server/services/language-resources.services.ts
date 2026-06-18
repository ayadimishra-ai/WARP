import { getSdkInstance } from "@/graphql/server/sdk";
import { getServerEnv } from "@/lib/env/env.server";
import { LanguageResourcesResponse, ServiceResponse } from "@/types/interface.types";

export async function getIndexDataLanguageResources(pageKeys: string[]): Promise<ServiceResponse<LanguageResourcesResponse>> {
    try {
        const sdk = await getSdkInstance();
        const { Tbl_LanguageResources } = await sdk.GetLanguageResourcesData({ pageKey: pageKeys });

        const response = {
            hits: {
                hits: Tbl_LanguageResources.map(resource => ({
                    _source: {
                        languageResourceGuid: resource.LanguageResourceGuid,
                        pageKey: resource.PageKey ?? null,
                        resourceKey: resource.ResourceKey ?? null,
                        resourceValue: resource.ResourceValue ?? null,
                        languageGuid: resource.LanguageGuid ?? null,
                        isActive: resource.IsActive ?? null,
                        createdDate: resource.CreatedDate ?? null
                    }
                }))
            }
        };

        return {
            success: true,
            data: response.hits.hits.length > 0 ? response : undefined,
        };
    } catch (error: any) {
        const env = await getServerEnv();
        console.error('Error in getIndexDataLanguageResources service:', error);
        return {
            success: false,
            error: {
                message: error.message || 'Failed to fetch language resources',
                status: 500,
                details: env.NODE_ENV === 'development' ? error : undefined
            }
        };
    }
}
