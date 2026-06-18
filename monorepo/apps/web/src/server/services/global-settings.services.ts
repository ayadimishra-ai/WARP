import { getSdkInstance } from "@/graphql/server/sdk";
import type { GetGlobalSettingsDataBySettingsKeyQuery } from "@/graphql/queries/get-global-settings-data-by-settingskey.generated";
import { GlobalSettingsResponse, ServiceResponse } from "@/types/interface.types";
import { getServerEnv } from "@/lib/env/env.server";

export async function getIndexDataGlobalSettings(settingsKeys: string[]): Promise<ServiceResponse<GlobalSettingsResponse>> {
    try {
        const sdk = await getSdkInstance();
        const { Tbl_GlobalSettings } = await sdk.GetGlobalSettingsDataBySettingsKey({
            SettingsKey: settingsKeys
        });

        const response = {
            hits: {
                hits: Tbl_GlobalSettings
                    .filter((setting): setting is GetGlobalSettingsDataBySettingsKeyQuery['Tbl_GlobalSettings'][0] &
                    { GlobalSettingsGuid: string; SettingsKey: string } =>
                        !!setting.GlobalSettingsGuid && !!setting.SettingsKey
                    )
                    .map(setting => ({
                        _source: {
                            globalSettingsGuid: setting.GlobalSettingsGuid,
                            settingsKey: setting.SettingsKey,
                            settingsValue: setting.SettingsValue ?? ''
                        }
                    }))
            }
        };

        return {
            success: true,
            data: response
        };
    } catch (error: any) {
        const env = await getServerEnv();
        console.error('Error in getIndexDataGlobalSettings service:', error);
        return {
            success: false,
            error: {
                message: error.message || 'Failed to fetch global settings',
                status: 500,
                details: env.NODE_ENV === 'development' ? error : undefined
            }
        };
    }
}
