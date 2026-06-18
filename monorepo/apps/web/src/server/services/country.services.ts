import { getSdkInstance } from '@/graphql/server/sdk';
import { GraphQLError } from 'graphql';

export const getCountryListForSupplier = async () => {
  try {
    const sdk = await getSdkInstance();
    const response = await sdk.GetCountryMaster();

    if (!response || !response.Tbl_CountryMaster) {
      throw new Error('Invalid response structure from GraphQL');
    }

    return response.Tbl_CountryMaster.map(country => ({
      countryGuid: country.CountryGuid,
      countryName: country.CountryName,
      countryCode: country.CountryCode,
      image: country.Image,
      mobileCode: country.MobileCode,
      regionGuid: country.RegionGuid,
      isActive: country.IsActive,
      statusForSupplier: country.StatusForSupplier
    }));
  } catch (error) {
    console.error('Error in getCountryListForSupplier:', error);

    if (error instanceof GraphQLError) {
      throw new Error(`GraphQL Error: ${error.message}`);
    }

    throw new Error('Failed to fetch country list');
  }
};
