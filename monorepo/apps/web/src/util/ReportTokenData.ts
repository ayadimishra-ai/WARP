import { getSdkInstance } from "@/graphql/server/sdk";
import { TokenRequestData } from '@/types/interface.types';

export async function ReportTokenData(authToken: string, reportId: string, datasetId: string): Promise<string> {
    try {
        const sdk = await getSdkInstance();
        // 1. Get Power BI token URL from global settings
        const result = await sdk.GetPowerBISettings({
            settingsKeys: [
                'POWERBI_TOKEN_URL'
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

        const POWERBI_TOKEN_URL = settings.POWERBI_TOKEN_URL;
        if (!POWERBI_TOKEN_URL) {
            throw new Error('POWERBI_TOKEN_URL not found in settings');
        }

        // 2. Prepare the token request payload
        const requestData: TokenRequestData = {
            datasets: [
                { id: datasetId }
            ],
            reports: [
                { id: reportId }
            ]
        };

        // 3. Make the API request to generate the token
        const response = await fetch(POWERBI_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate report token: ${response.status} - ${errorText}`);
        }

        const responseData = await response.text();

        return responseData;

    } catch (error) {
        console.error('Error in ReportTokenData:', error);
        throw error;
    }
}

export default ReportTokenData;
