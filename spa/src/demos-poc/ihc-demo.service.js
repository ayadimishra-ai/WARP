
const LOCATIONS = {
    mumbai: "Abu Dhabi",
    nashik: "Dubai",
    pune: "Ras Al Khaimah",
};

const COMPANY_NAME = "M- Ceramics";

export const getLocationName = (emailId, locationName) => {
    const isValidCompany = is_ihc_company(emailId);
    if (!isValidCompany) return locationName;

    const key = String(locationName).toLocaleLowerCase();

    return LOCATIONS[Object.keys(LOCATIONS).find((x)=> key.includes(x))];
};
export const getCompanyName = (emailId, companyName) => {
    const isValidCompany = is_ihc_company(emailId);
    if (!isValidCompany) return companyName;

    return COMPANY_NAME;
};
export const is_ihc_company = (emailId) => {
    if (String(emailId).toLocaleLowerCase() == "ravi@indiaservices.com") {
        return true;
    }
    return false;
};
