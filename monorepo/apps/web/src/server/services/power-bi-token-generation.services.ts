import { getSdkInstance } from '@/graphql/server/sdk';
import { generateAccessToken } from '@/util/generateAccessToken';
import { getReportDetails } from '@/util/getReportDetails';
import { ReportTokenData } from '@/util/ReportTokenData';
import { GetAuth2Token, GetReportsDetails, GetReportsTokenDetails, PowerBIResponse, ResponseValues } from '@/types/interface.types';

export async function generatePowerBIToken(rname: string) {
    try {
        const sdk = await getSdkInstance();
        // Create a new Date object for the current date and time
        const finalResponse: ResponseValues = {
            value: {
                token: '',
                embedUrl: '',
                id: '',
                dashboardHeight: '',
                isBorder: false,
                isPowerBiReport: false
            },
            isOnline: false,
            date1: '',
            date2: ''
        };
        let expirationToken = new Date();

        const result = await sdk.GetPowerBiReportDetailsByReportName({ rname });

        if (!result.Tbl_PowerBIReportDetails || result.Tbl_PowerBIReportDetails.length === 0) {
            throw new Error('Power BI report not found');
        }

        const powerBiReportDetails = result.Tbl_PowerBIReportDetails[0]

        if (powerBiReportDetails.TokenExpirationTime) {
            expirationToken = new Date(powerBiReportDetails.TokenExpirationTime);
        }

        if (powerBiReportDetails.TokenExpirationTime != null) {

            // Ensure TokenExpirationTime is a Date object
            const tokenExpiration = new Date(powerBiReportDetails.TokenExpirationTime);
            if (isNaN(tokenExpiration.getTime())) {
                throw new Error('Invalid TokenExpirationTime format');
            }

            // Create a date that's 10 minutes before the token expires
            const date1 = new Date(tokenExpiration.getTime() - (10 * 60 * 1000));
            const date2 = new Date();

            if (date1 <= date2) {

                // Token is either expired or about to expire, generate a new one
                const newToken = await generateAccessToken();

                // Parse the access token from the response
                const authToken: GetAuth2Token = JSON.parse(newToken);

                // Get report details using the getReportDetails function
                const reportDetailsResponse = await getReportDetails(authToken.access_token);
                const reportData: GetReportsDetails = JSON.parse(reportDetailsResponse);

                // Find the report by name
                const dataDetails = reportData.value.find(x => x.name === rname);
                if (!dataDetails) {
                    throw new Error(`Report with name '${rname}' not found`);
                }

                // Get the report token data using the ReportTokenData function
                const tokenResponse = await ReportTokenData(
                    authToken.access_token,
                    dataDetails.id,
                    dataDetails.datasetId
                );

                const reportTokenData: GetReportsTokenDetails = JSON.parse(tokenResponse);

                // Prepare the response object with all required fields
                const responseValues: PowerBIResponse = {
                    token: reportTokenData.token,
                    embedUrl: dataDetails.embedUrl,
                    id: dataDetails.id,
                    filters: powerBiReportDetails.PowerBIReportFilters || "",
                    sectionurl: powerBiReportDetails.PowerBIReportSections || "",
                    dashboardHeight: powerBiReportDetails.DashboardHeight || "",
                    isBorder: powerBiReportDetails.isBorder || false,
                    isPowerBiReport: powerBiReportDetails.isPowerBiReport || false
                };

                // Create the final response object with value property
                finalResponse.value = responseValues;


                const PowerBireport = await sdk.GetPowerBiReportDetailsByGuid({
                    guid: powerBiReportDetails.PowerBIGuid
                });

                const PowerBireportDetails1 = PowerBireport.Tbl_PowerBIReportDetails[0];

                // Update PowerBireportDetails1 with serialized response values and token expiration
                if (PowerBireportDetails1) {
                    PowerBireportDetails1.PowerBIReportTokenDetails = JSON.stringify(responseValues);
                    PowerBireportDetails1.TokenExpirationTime = reportTokenData.expiration;
                }

                const updatePowerBireportDetails = await sdk.UpdatePowerBIReportDetails({
                    powerBIGuid: powerBiReportDetails.PowerBIGuid,
                    tokenDetails: JSON.stringify(responseValues),
                    expirationTime: reportTokenData.expiration
                });

                // Add additional properties to the final response value
                finalResponse.isOnline = true;
                finalResponse.date1 = reportTokenData.expiration?.toString() || '';
                finalResponse.date2 = new Date().toISOString();
                finalResponse.value.dashboardHeight = PowerBireportDetails1?.DashboardHeight || '';
                finalResponse.value.isBorder = PowerBireportDetails1?.isBorder || false;
                finalResponse.value.isPowerBiReport = PowerBireportDetails1?.isPowerBiReport || false;
            } else {
                // Use existing token details from the database
                const powerBireportTokenDetailsDB = powerBiReportDetails?.PowerBIReportTokenDetails || '';

                // Parse the stored token details
                const tokenDetails: PowerBIResponse = JSON.parse(powerBireportTokenDetailsDB);

                // Update the final response with the stored token details
                finalResponse.value = tokenDetails;

                // Set the status and dates
                finalResponse.isOnline = false;
                finalResponse.date1 = powerBiReportDetails?.TokenExpirationTime?.toString() || '';
                finalResponse.date2 = date2.toString() || '';

            }
        } else {

            // Calculate dates
            const dateExpiration = powerBiReportDetails.TokenExpirationTime
                ? new Date(powerBiReportDetails.TokenExpirationTime)
                : new Date();

            const date1 = new Date(dateExpiration.getTime() - (10 * 60 * 1000)); // 10 minutes before expiration
            const date2 = new Date();

            const resultData = await generateAccessToken();
            const getAuth2Token: GetAuth2Token = JSON.parse(resultData);

            const resultReportData = await getReportDetails(getAuth2Token.access_token);
            const reportData: GetReportsDetails = JSON.parse(resultReportData);

            const dataDetails = reportData.value.find(x => x.name === rname);
            if (!dataDetails) {
                throw new Error(`Report with name '${rname}' not found`);
            }

            // Get the report token data using the ReportTokenData function
            const tokenResponse = await ReportTokenData(
                getAuth2Token.access_token,
                dataDetails.id,
                dataDetails.datasetId
            );

            const reportTokenData: GetReportsTokenDetails = JSON.parse(tokenResponse);

            // Prepare the response object with all required fields
            const responseValues: PowerBIResponse = {
                token: reportTokenData.token,
                embedUrl: dataDetails.embedUrl,
                id: dataDetails.id,
                filters: powerBiReportDetails.PowerBIReportFilters || "",
                sectionurl: powerBiReportDetails.PowerBIReportSections || "",
                dashboardHeight: powerBiReportDetails.DashboardHeight || "",
                isBorder: powerBiReportDetails.isBorder || false,
                isPowerBiReport: powerBiReportDetails.isPowerBiReport || false
            };

            finalResponse.value = responseValues;

            const PowerBireport = await sdk.GetPowerBiReportDetailsByGuid({
                guid: powerBiReportDetails.PowerBIGuid
            });

            const PowerBireportDetails1 = PowerBireport.Tbl_PowerBIReportDetails[0];

            // Update PowerBireportDetails1 with serialized response values and token expiration
            if (PowerBireportDetails1) {
                PowerBireportDetails1.PowerBIReportTokenDetails = JSON.stringify(responseValues);
                PowerBireportDetails1.TokenExpirationTime = reportTokenData.expiration;
            }

            const updatePowerBireportDetails = await sdk.UpdatePowerBIReportDetails({
                powerBIGuid: powerBiReportDetails.PowerBIGuid,
                tokenDetails: JSON.stringify(responseValues),
                expirationTime: reportTokenData.expiration
            });

            finalResponse.isOnline = true;
            finalResponse.date1 = reportTokenData.expiration?.toString() || '';
            finalResponse.date2 = new Date().toISOString();
            finalResponse.value.dashboardHeight = PowerBireportDetails1?.DashboardHeight || '';
            finalResponse.value.isBorder = PowerBireportDetails1?.isBorder || false;
            finalResponse.value.isPowerBiReport = PowerBireportDetails1?.isPowerBiReport || false;
        }
        return finalResponse;

    } catch (error) {
        console.error('Error in generatePowerBIToken:', error);
        throw error;
    }
}
