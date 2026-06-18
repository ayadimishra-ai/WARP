import { getSdkInstance } from "@/graphql/server/sdk";

export async function getReportDetails(authToken: string): Promise<string> {
    try {
        const sdk = await getSdkInstance();
        // 1. Get Power BI URL from global settings
        const result = await sdk.GetPowerBISettings({
            settingsKeys: [
                'POWERBI_URL'
            ]
        });

        if (!result.Tbl_GlobalSettings || result.Tbl_GlobalSettings.length === 0) {
            throw new Error('Power BI settings not found');
        }

        // Convert settings array to key-value object
        const settings: Record<string, string> = {};
        result.Tbl_GlobalSettings.forEach(setting => {
            if (setting.SettingsKey && setting.SettingsValue) {
                settings[setting.SettingsKey] = setting.SettingsValue;
            }
        });

        const POWERBI_URL = settings.POWERBI_URL;
        if (!POWERBI_URL) {
            throw new Error('POWERBI_URL not found in settings');
        }

        // 2. Make the API request to get report details
        const response = await fetch(`${POWERBI_URL}groups/495f6cb3-b76c-4225-ad99-4b84411de16e/reports/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch report details: ${response.status} - ${errorText}`);
        }

        const responseData = await response.text();

        return responseData;

    } catch (error) {
        console.error('Error in getReportDetails:', error);
        throw error;
    }
}

export default getReportDetails;
