import { getSdkInstance } from "@/graphql/server/sdk";
import { PowerBISettings } from '@/types/interface.types';

export async function generateAccessToken(): Promise<string> {
    try {
        const sdk = await getSdkInstance();
        // 1. Fetch Power BI settings from the database
        const result = await sdk.GetPowerBISettings({
            settingsKeys: [
                'POWERBI_AUTH_URL',
                'POWERBI_SCOPE_URL',
                'POWERBI_CLIENT_ID',
                'POWERBI_CLIENT_SECRET'
            ]
        });

        if (!result.Tbl_GlobalSettings || result.Tbl_GlobalSettings.length === 0) {
            throw new Error('Power BI settings not found');
        }

        // Convert settings array to key-value object for easier access
        const settings: PowerBISettings = {};
        result.Tbl_GlobalSettings.forEach(setting => {
            if (setting.SettingsKey && setting.SettingsValue) {
                settings[setting.SettingsKey] = setting.SettingsValue;
            }
        });

        // 3. Prepare the request to get access token
        const POWERBI_AUTH_URL = settings.POWERBI_AUTH_URL;
        const POWERBI_SCOPE_URL = settings.POWERBI_SCOPE_URL;
        const POWERBI_CLIENT_ID = settings.POWERBI_CLIENT_ID;
        const POWERBI_CLIENT_SECRET = settings.POWERBI_CLIENT_SECRET;

        // Create form data
        const formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        formData.append('scope', POWERBI_SCOPE_URL);
        formData.append('client_id', POWERBI_CLIENT_ID);
        formData.append('client_secret', POWERBI_CLIENT_SECRET);

        // Make the request
        const response = await fetch(POWERBI_AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
        }

        const responseData = await response.text();

        return responseData;

    } catch (error) {
        console.error('Error in generateAccessToken:', error);
        throw error; // Re-throw to allow caller to handle the error
    }
}