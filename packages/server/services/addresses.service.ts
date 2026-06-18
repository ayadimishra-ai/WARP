import { sdk } from "@warp/graphql/generated/server";
import { Addresses_Insert_Input } from "@warp/graphql/generated/types";

export const SaveAddresses = async (body?: any[]) => {
  let isError = false;
  //if (!body?.length) return false;
  if (body === undefined) return false;
  //Get Country ID
  const countryDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "CountryMaster",
  });
  const countryid = countryDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.name === body[0].country
  )[0].id;
  if (!countryid) return false;

  //Get State ID
  const stateDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "StateMaster",
  });
  const stateId = stateDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.name === body[0].state
  )[0].id;
  if (!stateId) return false;

  //Get City ID
  const cityDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "CityMaster",
  });
  const cityId = cityDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.CityName === body[0].city
  )[0].id;
  if (!cityId) return false;

  const formAddressDataArray: Addresses_Insert_Input[] = body.map(
    (AddressDetails: any) => {
      const input: Addresses_Insert_Input = {
        addressType: AddressDetails.addressType,
        addressLine1: AddressDetails.addressLine1,
        addressLine2: AddressDetails.addressLine2,
        addressLine3: AddressDetails.addressLine3,
        poBoxNumber: AddressDetails.poBoxNumber,
        country: countryid,
        state: stateId,
        city: cityId,
        zipcode: AddressDetails.zipcode,
        phoneNo: AddressDetails.phoneNo,
        landMark: AddressDetails.landMark,
        gstNumber: AddressDetails.gstNumber,
        isDefault: AddressDetails.isDefault,
        companyId: AddressDetails.companyId,
        ownershipType: AddressDetails.ownershipType,
        addressLable: AddressDetails.addressLable,
      };
      return input;
    }
  );
  const array = formAddressDataArray.map((item: any) => {
    return item;
  });

  // Duplicate data check
  const addressDetail = await sdk.getAddressDetail({
    addressLine1: array[0].addressLine1,
    addressLine2: array[0].addressLine2,
    addressLine3: array[0].addressLine3,
    poBoxNumber: array[0].poBoxNumber,
    city: array[0].city,
    country: array[0].country,
    state: array[0].state,
    zipcode: array[0].zipcode,
    phoneNo: array[0].phoneNo,
    landMark: array[0].landMark,
    isDefault: array[0].isDefault,
    gstNumber: array[0].gstNumber,
    companyId: array[0].companyId,
    ownershipType: array[0].ownershipType,
    addresstype: array[0].addressType,
    addressLable: array[0].addressLable,
  });
  const result = addressDetail.Addresses.map((item: any) => {
    return item;
  });
  if (result.length > 0) {
    isError = true;
    if (result[0].IsActive === false) {
      const data = await sdk.DeleteAddressDetails({
        id: result[0].id,
        IsActive: true,
      });
      const success =
        data?.update_Addresses?.returning &&
        data?.update_Addresses?.returning?.length > 0;
      if (!success) {
        throw new Error("Failed to Insert Address");
      } else {
        return data?.update_Addresses?.returning;
      }
    } else {
      throw {
        message: "Same Address Details already exist.",
        stack: { data: addressDetail },
      };
    }
  }

  //Insert Data
  if (isError === false) {
    const data = await sdk.insertAddress({
      addressLine1: array[0].addressLine1,
      addressLine2: array[0].addressLine2,
      addressLine3: array[0].addressLine3,
      poBoxNumber: array[0].poBoxNumber,
      city: array[0].city,
      country: array[0].country,
      state: array[0].state,
      zipcode: array[0].zipcode,
      phoneNo: array[0].phoneNo,
      landMark: array[0].landMark,
      isDefault: array[0].isDefault,
      gstNumber: array[0].gstNumber,
      companyId: array[0].companyId,
      ownershipType: array[0].ownershipType,
      addresstype: array[0].addressType,
      addressLable: array[0].addressLable,
    });
    const success =
      data?.insert_Addresses?.returning &&
      data?.insert_Addresses?.returning?.length > 0;
    if (!success) {
      throw new Error("Failed to Save Address");
    } else {
      return data?.insert_Addresses?.returning;
    }
  }
};

export const updateAddresses = async (body?: any[]) => {
  let isError = false;
  if (body === undefined) return false;
  const countryDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "CountryMaster",
  });
  const countryid = countryDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.name === body[0].country
  )[0].id;
  if (!countryid) return false;
  const stateDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "StateMaster",
  });
  const stateId = stateDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.name === body[0].state
  )[0].id;
  if (!stateId) return false;
  const cityDetails = await sdk.GetGlobalMasterDatabyCityStateCountry({
    type: "CityMaster",
  });
  const cityId = cityDetails?.GlobalMaster[0].data.filter(
    (item: any) => item.CityName === body[0].city
  )[0].id;
  if (!cityId) return false;

  const formAddressDataArray: Addresses_Insert_Input[] = body.map(
    (AddressDetails: any) => {
      const input: Addresses_Insert_Input = {
        id: AddressDetails.id,
        addressType: AddressDetails.addressType,
        addressLine1: AddressDetails.addressLine1,
        addressLine2: AddressDetails.addressLine2,
        addressLine3: AddressDetails.addressLine3,
        poBoxNumber: AddressDetails.poBoxNumber,
        country: countryid,
        state: stateId,
        city: cityId,
        zipcode: AddressDetails.zipcode,
        phoneNo: AddressDetails.phoneNo,
        landMark: AddressDetails.landMark,
        gstNumber: AddressDetails.gstNumber,
        isDefault: AddressDetails.isDefault,
        companyId: AddressDetails.companyId,
        ownershipType: AddressDetails.ownershipType,
        IsActive: AddressDetails.IsActive,
        addressLable: AddressDetails.addressLable,
      };
      return input;
    }
  );
  const array = formAddressDataArray.map((item: any) => {
    return item;
  });
  // Duplicate data check

  const addressDetail = await sdk.getAddressDetail({
    addressLine1: array[0].addressLine1,
    addressLine2: array[0].addressLine2,
    addressLine3: array[0].addressLine3,
    poBoxNumber: array[0].poBoxNumber,
    city: array[0].city,
    country: array[0].country,
    state: array[0].state,
    zipcode: array[0].zipcode,
    phoneNo: array[0].phoneNo,
    landMark: array[0].landMark,
    isDefault: array[0].isDefault,
    gstNumber: array[0].gstNumber,
    companyId: array[0].companyId,
    ownershipType: array[0].ownershipType,
    addresstype: array[0].addressType,
    addressLable: array[0].addressLable,
  });
  const result = addressDetail.Addresses.map((item: any) => {
    return item;
  });
  if (result.length > 0) {
    isError = true;
    if (result[0].IsActive === false) {
      const data = await sdk.DeleteAddressDetails({
        id: result[0].id,
        IsActive: true,
      });
      const success =
        data?.update_Addresses?.returning &&
        data?.update_Addresses?.returning?.length > 0;
      if (!success) {
        throw new Error("Failed to Update Address");
      } else {
        return data?.update_Addresses?.returning;
      }
    } else {
      throw {
        message: "Same Address Details already exist.",
        stack: { data: addressDetail },
      };
    }
  }

  if (isError === false) {
    const data = await sdk.UpdateAddress({
      id: array[0].id,
      addressLine1: array[0].addressLine1,
      addressLine2: array[0].addressLine2,
      addressLine3: array[0].addressLine3,
      poBoxNumber: array[0].poBoxNumber,
      city: array[0].city,
      country: array[0].country,
      state: array[0].state,
      zipcode: array[0].zipcode,
      phoneNo: array[0].phoneNo,
      landMark: array[0].landMark,
      isDefault: array[0].isDefault,
      gstNumber: array[0].gstNumber,
      companyId: array[0].companyId,
      ownershipType: array[0].ownershipType,
      addresstype: array[0].addressType,
      IsActive: array[0].IsActive,
      addressLable: array[0].addressLable,
    });
    const success =
      data?.update_Addresses?.returning &&
      data?.update_Addresses?.returning?.length > 0;
    if (!success) {
      throw new Error("Failed to Update Address");
    } else {
      return data?.update_Addresses?.returning;
    }
  }
};

export const deleteAddresses = async (body?: any[]) => {
  let isError = false;
  if (body === undefined) return false;
  const formAddressDataArray: Addresses_Insert_Input[] = body.map(
    (AddressDetails: any) => {
      const input: Addresses_Insert_Input = {
        id: AddressDetails.id,
        IsActive: AddressDetails.IsActive,
      };
      return input;
    }
  );

  if (isError === false) {
    const array = formAddressDataArray.map((item: any) => {
      return item;
    });

    const data = await sdk.DeleteAddressDetails({
      id: array[0].id,
      IsActive: array[0].IsActive,
    });
    const success =
      data?.update_Addresses?.returning &&
      data?.update_Addresses?.returning?.length > 0;
    if (!success) {
      throw new Error("Failed to UPdate Address");
    } else {
      return data;
    }
  }
};
