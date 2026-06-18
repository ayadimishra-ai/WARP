"use client";
import {
  Button,
  Card,
  Container,
  Flex,
  Group,
  MultiSelect,
  Radio,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { sanitiseValuesByTypeOfData } from "@/modules/ghg/utils/dom-purifier/dom-purify.client.util";
// import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/modules/ghg/shared/configs/firebase-config.server";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import {
  orgDetailsFormSubmitted,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import { toNumber } from "@/modules/ghg/utils/data-transformer.util";
import { getYearRange, months } from "@/modules/ghg/utils/date.util";
import { YearType, YearTypeValue } from "@/modules/ghg/utils/enums";
import { useCaptchaValidationBeforeSubmit } from "../../hooks/google-invisible-recaptcha";
import PhoneNumberInput from "../ui/PhoneNumberInput";
import SelectYearType from "./select-year-type";

type TOrganizationDetails = {
  is_deleted: false;
  metadata: null;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  id: string;
  organization_id: string;
  Organization: {
    name: string;
    metadata: [
      {
        gstNo: string;
      },
    ];
    Baselineyear: number;
    FinancialYearMonth: string;
  };
  updated_by: string;
};

type TIndustryTpe = {
  id: string;
  name: string;
};
const nameRegex = /^[A-Za-z\s]+$/;
// Zod validation schema
const organizationDetailsSchema = z.object({
  orgName: z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .refine((val) => val.trim().length > 0, "Enterprise Name is required."),
  gstNo: z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .refine((val) => val.trim().length > 0, "GST/License number is required."),
  firstName: z
    .string()
    .nullable()
    .transform((val) => val ?? "") // Convert null/undefined to empty string
    .refine((val) => {
      if (!val || val.trim().length === 0) return false;
      return true;
    }, "First Name is required.")
    .refine((val) => {
      if (val && val.trim().length > 0 && val.trim().length < 2) return false;
      return true;
    }, "First Name must be at least 2 characters long.")
    .refine((val) => {
      if (val && val.trim().length > 50) return false;
      return true;
    }, "First Name cannot exceed 50 characters.")
    .refine((val) => {
      if (val && val.trim().length > 0 && !nameRegex.test(val.trim()))
        return false;
      return true;
    }, "First Name should contain only letters and spaces."),
  lastName: z
    .string()
    .nullable() // Add this to accept null values
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val)) // Handle both empty string and null
    .refine(
      (val) => !val || val.length >= 2,
      "Last Name must be at least 2 characters long."
    )
    .refine(
      (val) => !val || val.length <= 50,
      "Last Name cannot exceed 50 characters."
    )
    .refine(
      (val) => !val || nameRegex.test(val),
      "Last Name should contain only letters and spaces."
    ),
  mobileNo: z
    .string()
    .max(20, { message: "Mobile number cannot exceed 20 digits." })
    .nullable()
    .transform((val) => val ?? "")
    .refine((val) => val.trim().length > 0, "Mobile is required."),
  country: z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .refine((val) => val.trim().length > 0, "Country is required."),
  stateName: z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .refine((val) => val.trim().length > 0, "State is required."),
  industryType: z.array(z.string()).min(1, "Industry Type is required."),
  parentCompany: z.string().optional(),
  baselineYear: z
    .unknown()
    .refine(
      (val) => {
        if (val === "" || val === null || val === undefined) {
          return false;
        }
        return true;
      },
      {
        message: "Year is required",
      }
    )
    .refine((q) => toNumber(q) > 0, "The year entered is invalid")
    .transform(toNumber)
    .refine((val) => Number.isInteger(val), {
      message: "The year entered is invalid", // This is the key line for blocking decimals
    })
    .refine(
      (val) => {
        const numVal = Number(val);
        // Reject values with leading zeros when entered as a string
        if (typeof val === "string" && /^0\d+/.test(val)) {
          return false;
        }
        return !isNaN(numVal) && numVal >= 100;
      },
      {
        message: "The year entered is invalid",
      }
    )
    .refine(
      (val) => {
        const numVal = Number(val);
        return !isNaN(numVal) && numVal >= 1900;
      },
      {
        message: "The year entered is invalid",
      }
    )
    .refine((q) => q <= 2099, {
      message: "The year entered is invalid",
    }),
});

function OrganizationDetails() {
  const session: any = useUserSession();
  const token = localStorage.getItem("access_token");
  const [organizationDetails, setOrganizationDetails] =
    useState<TOrganizationDetails | null>(null);
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const [orgName, setOrgName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [mobileNoCountryCode, setMobileNoCountryCode] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("IN");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [industryType, setIndustryType] = useState<string[]>([]);
  const [hasWasteWaterTreatmentPlant, setHasWasteWaterTreatmentPlant] =
    useState<boolean | null>(true);
  const [yearType, setYearType] = useState<YearTypeValue>(YearType.FINANCIAL);
  const [parentCompany, setParentCompany] = useState("");
  const [industryTypeList, setIndustryTypeList] = useState<TIndustryTpe[]>([]);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const isDisabled = hasWasteWaterTreatmentPlant !== null;
  const [countryList, setCountryList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [allCountriesAndStatesList, setAllCountriesAndStatesList] = useState<
    any[]
  >([]);
  const [isReviewSaved, setIsReviewSaved] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    orgName: "",
    gstNo: "",
    firstName: "",
    lastName: "",
    mobileNo: "",
    country: "",
    stateName: "",
    industryType: "",
    baselineYear: "",
  });
  const [hasWaterActivity, setHasWaterActivity] = useState(false);
  const [baselineYear, setBaselineYear] = useState<string>("");

  // console.log("Organization Details States", {
  //   countryList,
  //   country,
  //   mobileNo,
  //   mobileNoCountryCode,
  // });

  //mobile number verification variables
  // const [mobileVerificationState, setMobileVerificationState] = useState({});
  // const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  // const [allCountryCodes, setAllCountryCodes] = useState<string[]>([]);
  // const [otp, setOtp] = useState("");
  // const [verificationId, setVerificationId] = useState("");
  // const [message, setMessage] = useState("");
  // const [isOtpSent, setIsOtpSent] = useState(false);

  //use effect to fetch user details and organizaiton details.
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (session) {
          const { data } = await getOrganizationDetail();

          if (data) {
            const organization = data?.user[0]?.Organization;
            const gstNo =
              organization?.metadata?.find(
                (item: Record<string, any>) => "cin_pan_gst" in item
              )?.cin_pan_gst ?? "";
            const organizationName = organization?.name ?? "";
            const mobile =
              data?.user[0]?.metadata?.mobile || data?.user?.metadata?.mobile;
            const mobileCountryCode =
              data?.user[0]?.metadata?.mobileCountryCode ||
              data?.user?.metadata?.mobileCountryCode;

            const registeredCountry =
              organization?.metadata?.find(
                (item: Record<string, any>) => "CountryOfRegistration" in item
              )?.CountryOfRegistration ?? "";
            const statename =
              organization?.metadata?.find(
                (item: Record<string, any>) => "StateOfRegistration" in item
              )?.StateOfRegistration ?? "";
            const industryTypesFromDb: string[] = organization?.industryType
              ? organization?.industryType?.split(",")
              : [];
            const validIndustryTypes = industryTypesFromDb?.filter((id) =>
              data?.industryType?.some((item: any) => item?.id === id)
            );
            // Ensure unique countries by id
            const countryMap: Record<string, any> = {};
            data?.countryList?.forEach((element: any) => {
              if (element?.id) {
                countryMap[element?.id] = element;
              }
            });
            const selectedCountryObj = Object.values(countryMap)?.find(
              (c: any) => c?.id === registeredCountry
            );

            const defaultCountryCode =
              countryMap?.[selectedCountryObj?.id || ""]?.code || "IN";

            setCountryList(Object.values(countryMap));
            setCountry(selectedCountryObj?.id || "");
            setDefaultCountry(defaultCountryCode);
            setAllCountriesAndStatesList(data?.stateCountry || []);
            // Filter state list for selected country
            let filteredStates: any[] = [];
            if (selectedCountryObj && data?.stateCountry) {
              filteredStates = data?.stateCountry?.filter(
                (item: any) => item?.Country?.id === selectedCountryObj?.id
              );
            }
            if (selectedCountryObj || country.length > 0) {
              setStateList(filteredStates);
              // Set stateName if it exists in filtered states, else blank
              const selectedStateObj = filteredStates?.find(
                (s: any) => s?.id === statename
              );
              setStateName(selectedStateObj?.id || "");
            }

            const parentcomp = organization?.metadata?.find(
              (item: Record<string, any>) => "parentCompany" in item
            )?.parentCompany;

            setParentCompany(parentcomp);
            setIsReviewSaved(organization?.is_review_saved || false);
            setHasWasteWaterTreatmentPlant(
              organization?.hasWasteWaterTreatmentPlant ?? true
            );
            setIndustryType(validIndustryTypes);
            setMobileNo(mobile);
            setMobileNoCountryCode(mobileCountryCode);
            setGstNo(gstNo);
            setOrgName(organizationName);
            setEmail(data?.user[0]?.email);
            setFirstName(data?.user[0]?.first_name);
            setLastName(data?.user[0]?.last_name);
            setOrganizationDetails(data?.user[0] ?? null);
            setIndustryTypeList(data?.industryType || []);
            let hasWaterActivity = data?.OrgActivityDetails?.filter(
              (item: any) => item?.Activity?.code === "water"
            );
            setHasWaterActivity(hasWaterActivity?.length > 0);
            const yearType =
              organization?.FinancialYearMonth === months[3] // "April"
                ? YearType.FINANCIAL
                : YearType.CALENDAR;
            setYearType(yearType);
            setBaselineYear(
              organization?.Baselineyear
                ? String(organization?.Baselineyear)
                : ""
            );
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [session]);

  // Update state list when country changes
  useEffect(() => {
    if (country && allCountriesAndStatesList.length > 0) {
      const filteredStates = allCountriesAndStatesList?.filter(
        (item: any) => item?.Country?.id === country
      );
      setStateList(filteredStates);
      if (!filteredStates?.some((s: any) => s?.id === stateName)) {
        setStateName("");
      }
    } else {
      setStateList([]);
      setStateName("");
    }
  }, [country, allCountriesAndStatesList]);

  //use effect to set waste water radio buttons enable/disable states
  useEffect(() => {
    if (hasWasteWaterTreatmentPlant !== null) {
      setHasWasteWaterTreatmentPlant(hasWasteWaterTreatmentPlant);
      setIsSaveClicked(true);
    }
  }, [organizationDetails]);

  async function getOrganizationDetail() {
    if (session) {
      const url = "/api/v1/master-data/organization-details/form";
      try {
        const response = await apiClientWithAuth.get(url);
        // console.log("response", response);
        if (!response.data) {
          postParentMessage(orgDetailsFormSubmitted(true));
          // throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.data;
      } catch (error) {
        console.error("Error fetching organization details:", error);
        postParentMessage(orgDetailsFormSubmitted(true));
      }
    }
  }

  // Helper function for real-time field validation
  const validateField = (fieldName: string, value: any) => {
    // Don't show validation errors until user has interacted with the form
    if (!hasUserInteracted) return;

    try {
      // Create a minimal object for validation
      const testData = {
        orgName: fieldName === "orgName" ? value : "test",
        gstNo: fieldName === "gstNo" ? value : "test",
        firstName: fieldName === "firstName" ? value : "test",
        lastName: fieldName === "lastName" ? value : "test",
        mobileNo: fieldName === "mobileNo" ? value : "test",
        country: fieldName === "country" ? value : "test",
        stateName: fieldName === "stateName" ? value : "test",
        industryType: fieldName === "industryType" ? value : ["test"],
        parentCompany: fieldName === "parentCompany" ? value : "test",
        baselineYear: fieldName === "baselineYear" ? value : "test",
      };

      const result = organizationDetailsSchema.safeParse(testData);

      if (result.success) {
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      } else {
        // Find error for the specific field
        const fieldError = result.error.errors.find(
          (error) => error.path[0] === fieldName
        );
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [fieldName]: fieldError.message }));
        } else {
          setErrors((prev) => ({ ...prev, [fieldName]: "" }));
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Helper function to clear backend validation errors when user starts typing
  const clearBackendError = (fieldName: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  //handle inputs change
  const handleInputChange = (field: string, value: string | string[]) => {
    // Mark that user has interacted with the form
    setHasUserInteracted(true);

    if (field === "firstname") {
      setFirstName(sanitiseValuesByTypeOfData(value.toString()));
      validateField("firstName", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "lastname") {
      setLastName(sanitiseValuesByTypeOfData(value.toString()));
      validateField("lastName", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "mobileno") {
      const [mobileNumber, countryCode] = value;
      clearBackendError("mobileNo"); // Clear any backend errors for mobile
      setMobileNo(mobileNumber.toString());
      setMobileNoCountryCode(countryCode.toString());
      validateField("mobileNo", mobileNumber.toString());
    } else if (field === "gstno") {
      clearBackendError("gstNo"); // Clear any backend errors for GST
      setGstNo(sanitiseValuesByTypeOfData(value.toString()));
      validateField("gstNo", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "country") {
      setCountry(sanitiseValuesByTypeOfData(value.toString()));
      validateField("country", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "state") {
      setStateName(sanitiseValuesByTypeOfData(value.toString()));
      validateField("stateName", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "industrytype") {
      const arrVal = Array.isArray(value) ? value : [];
      const sanitiseIndustryType = arrVal.map(
        (items) => sanitiseValuesByTypeOfData(items) || ""
      );
      setIndustryType(sanitiseIndustryType);
      validateField("industryType", sanitiseIndustryType);
    } else if (field === "iswastewater") {
      setHasWasteWaterTreatmentPlant(value === "yes" ? true : false);
    } else if (field === "parentcompany") {
      setParentCompany(sanitiseValuesByTypeOfData(value.toString()));
      validateField(
        "parentCompany",
        sanitiseValuesByTypeOfData(value.toString())
      );
    } else if (field === "orgname") {
      setOrgName(sanitiseValuesByTypeOfData(value.toString()));
      validateField("orgName", sanitiseValuesByTypeOfData(value.toString()));
    } else if (field === "yearType") {
      setYearType(sanitiseValuesByTypeOfData(value as YearTypeValue));
    } else if (field === "baselineYear") {
      setBaselineYear(sanitiseValuesByTypeOfData(value.toString()));
      validateField(
        "baselineYear",
        sanitiseValuesByTypeOfData(value.toString())
      );
    }
  };

  //check required validations using Zod
  const validateForm = () => {
    // Mark that user has interacted with the form (for save button click)
    setHasUserInteracted(true);

    const formData = {
      orgName,
      gstNo,
      firstName,
      lastName,
      mobileNo,
      country,
      stateName,
      industryType,
      parentCompany,
      baselineYear,
    };

    const result = organizationDetailsSchema.safeParse(formData);

    if (result.success) {
      // Clear all errors
      setErrors({
        orgName: "",
        gstNo: "",
        firstName: "",
        lastName: "",
        mobileNo: "",
        country: "",
        stateName: "",
        industryType: "",
        baselineYear: "",
      });
      return true;
    } else {
      // Set validation errors
      const newErrors = {
        orgName: "",
        gstNo: "",
        firstName: "",
        lastName: "",
        mobileNo: "",
        country: "",
        stateName: "",
        industryType: "",
        baselineYear: "",
      };

      result.error.errors.forEach((error) => {
        const fieldName = error.path[0] as string;
        if (fieldName in newErrors) {
          newErrors[fieldName as keyof typeof newErrors] = error.message;
        }
      });

      setErrors(newErrors);
      return false;
    }
  };

  //save user and organization details
  async function saveOrganizationDetails() {
    captchaValidationBeforeSubmitHandler(async () => {
      const isValid = validateForm();
      if (!isValid) return;
      if (session) {
        await apiClientWithAuth
          .put("/api/v1/master-data/organization-details/form", {
            id: session.userId,
            name: orgName,
            first_name: firstName,
            last_name: lastName,
            gstNo: gstNo,
            phonenumber: mobileNo,
            mobileCountryCode: mobileNoCountryCode || defaultCountry,
            registeredCountry: country,
            registeredState: stateName,
            industryType: industryType,
            hasWasteWaterTreatmentPlant: hasWasteWaterTreatmentPlant,
            is_review_saved: true,
            parentCompany: parentCompany,
            yearType: yearType,
            baselineYear: baselineYear,
          })
          .then(async (res) => {
            console.log("save data ", res.data);
            if (res?.data?.success === true) {
              postParentMessage(orgDetailsFormSubmitted(false));
              // Refetch data to get updated values
              await getOrganizationDetail().then(({ data: refreshedData }) => {
                if (refreshedData) {
                  // Update isReviewSaved state to disable fields
                  setIsReviewSaved(true);
                  setIsSaveClicked(true);
                }
              });

              return res?.data;
            } else {
              // Handle backend validation errors
              if (res?.data?.message) {
                // Check if the error is related to GST number duplication
                if (
                  res?.data?.message.includes(
                    "GST/License number already exists."
                  ) ||
                  res?.data?.message.includes(
                    "Entered GST/License number already exists."
                  )
                ) {
                  setErrors((prev) => ({
                    ...prev,
                    gstNo: res.data.message,
                  }));
                }
                // Check if the error is related to phone number duplication
                else if (
                  res?.data?.message.includes(
                    "Phone Number already exists for another user."
                  ) ||
                  res?.data?.message.includes(
                    "Entered Phone Number already exists for another user."
                  )
                ) {
                  setErrors((prev) => ({
                    ...prev,
                    mobileNo: res.data.message,
                  }));
                }
                // Handle any other backend validation errors
                else {
                  console.error("Backend validation error:", res.data.message);
                }
              } else {
                postParentMessage(orgDetailsFormSubmitted(true));
              }
            }
          })
          .catch((error) => {
            postParentMessage(orgDetailsFormSubmitted(true));
            console.error("Error saving organization details:", error);
          });
      }
    });
  }

  // function  firebaseOtpMobileVerification(mobileNo: string, selectedCountryCode: string) {
  //     //this.getOTPTimer();
  //     const recaptchaContainer = `<div id='recaptcha-otp'></div>` ;

  //       let recaptcha = new RecaptchaVerifier(auth,'recaptcha-otp', {});
  //       signInWithPhoneNumber(auth, selectedCountryCode + mobileNo, recaptcha).then(data => {
  //         setMobileVerificationState({
  //           confirmationResult: data,
  //           otp: '',
  //           IsSendOTP: true,
  //           openOtpBox: true,
  //           recaptchaContainer: null
  //         })
  //       }).catch((error: any) => {
  //         console.error("Error during Firebase OTP verification:", error);
  //       });

  //   }

  //   // setup recaptcha
  //   const setUpRecaptcha = () => {
  //     return new RecaptchaVerifier(
  //       auth,
  //       "recaptcha-container",
  //       {
  //         size: "invisible",
  //         callback: () => {
  //           console.log("reCAPTCHA verified");
  //         },
  //       }
  //     );
  //   };

  //   // Send OTP
  //   const sendOtp = async () => {
  //     if (mobileNo.length < 10) {
  //       return alert("Enter valid phone number");
  //     }

  // //     const phoneProvider = new firebase.auth.PhoneAuthProvider();
  // // phoneProvider.verifyPhoneNumber(phoneNumber, appVerifier)
  // //   .then(verificationId => {
  // //     const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
  // //     firebase.auth().signInWithCredential(credential);
  // //   })
  // //   .catch(error => {
  // //     console.error("Error during phone authentication:", error);
  // //   });

  //     const appVerifier = setUpRecaptcha();

  //     try {
  //       const confirmation = await signInWithPhoneNumber(auth, selectedCountryCode +  mobileNo, appVerifier);
  //       setVerificationId(confirmation.verificationId);
  //       setMessage("OTP sent successfully!");
  //     } catch (error) {
  //       console.error(error);
  //       setMessage("Failed to send OTP");
  //     }
  //   };

  //   // Verify OTP
  //   const verifyOtp = async () => {
  //     try {
  //       const { PhoneAuthProvider, signInWithCredential } = await import("firebase/auth");
  //       const credential = PhoneAuthProvider.credential(verificationId, otp);
  //       await signInWithCredential(auth, credential);
  //       setMessage("Mobile number verified successfully!");
  //     } catch (error) {
  //       console.error(error);
  //       setMessage("Invalid OTP");
  //     }
  //   };

  //   const handleSendOTPClick = () => {
  //     sendOtp();
  //   }

  //   const handleVerifyOTPClick = () =>{
  //     verifyOtp();
  //   }

  return (
    organizationDetails && (
      <Container px={0} size={"70vw"}>
        <Card
          shadow="sm"
          radius="md"
          style={{
            padding: "61px",
            margin: "39px 0",
            backgroundImage: "url('/org_circle.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right top",
            backgroundSize: "250px",
            position: "relative",
          }}
        >
          <Flex
            mih={50}
            gap="xs"
            justify="flex-start"
            align="flex-start"
            direction="column"
            wrap="wrap"
          >
            <Text size="32px" c="#444444">
              Organization Details
            </Text>
            <Text size="14px" fw={300} mt={25} c="#444444">
              Please review the pre-filled information by Snowkap team. Complete
              the mandatory fields about your organization to proceed.
            </Text>
          </Flex>
          <Group grow align="baseline" mih={80} gap="xl" mt={25}>
            <TextInput
              label="Enterprise Name"
              withAsterisk
              value={orgName}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              disabled={isReviewSaved}
              onChange={(e) => handleInputChange("orgname", e.target.value)}
              error={errors.orgName}
            />
            <TextInput
              // label="CIN/PAN/GST"
              label="GST/License number"
              withAsterisk
              value={gstNo}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              onChange={(e) => handleInputChange("gstno", e.target.value)}
              disabled={isReviewSaved}
              error={errors.gstNo}
            />
          </Group>
          <Group grow align="baseline" mih={80} gap="xl" mt={10}>
            <TextInput
              label="First Name"
              withAsterisk
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              error={errors.firstName}
              // maxLength={50}
            />
            <TextInput
              label="Last Name"
              // withAsterisk
              placeholder="Enter Last Name"
              value={lastName}
              onChange={(e) => handleInputChange("lastname", e.target.value)}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              error={errors.lastName}
              // maxLength={50}
            />
          </Group>
          <Group grow align="baseline" mih={80} gap="xl" mt={10}>
            <TextInput
              label="Email"
              withAsterisk
              value={email}
              disabled
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
            />
            {/* <TextInput
              label="Mobile"
              withAsterisk
              placeholder="Enter Mobile No."
              value={mobileNo}
              onChange={(e) => {
                handleInputChange("mobileno", e.target.value);
              }}
              onKeyDown={(e) => {
                // Allow: numbers, backspace, delete, tab, escape, enter, arrows, space, dash, parentheses, plus
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "Escape",
                  "Enter",
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                  "End",
                ];

                const allowedChars = /[0-9\s\-()-+]/;

                // Allow if it's a control key or allowed character
                if (allowedKeys.includes(e.key) || allowedChars.test(e.key)) {
                  return; // Allow the key
                }

                // Block all other keys
                e.preventDefault();
              }}
              leftSection={
                <div
                  style={{
                    display: "flex",
                    paddingLeft: "33px",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "0",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "1px",
                      display: "flex",
                      alignSelf: "center",
                    }}
                  >
                    <IndianFlagIcon height={18} width={18} />
                  </div>
                  <span
                    style={{
                      marginLeft: 0,
                      fontSize: 12,
                      color: "#444444",
                      marginTop: 3,
                    }}
                  >
                    +91
                  </span>
                </div>
              }
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                  paddingLeft: "60px", // Make room for the flag and +91
                },
                error: {
                  fontSize: 10,
                },
              }}
              error={errors.mobileNo}
            /> */}
            <PhoneNumberInput
              defaultCountry={defaultCountry}
              value={{ value: mobileNo, countryCode: mobileNoCountryCode }}
              onChangeHandler={(value, countryCode) => {
                handleInputChange("mobileno", [value, countryCode]);
              }}
              error={errors.mobileNo}
              required
            />
            {/* <Button
            variant="gradient"
              gradient={{ from: "#005C81", to: "#122F47", deg: 83 }}
              fw={600}
              fz={11}
              h={30}
              lts="0.15rem"
              p="0 0"
              radius="xl"
              onClick={handleSendOTPClick}> Send OTP</Button> */}
          </Group>
          {/* <Group grow gap="xl" mt={10}>
            <TextInput  />
            <TextInput 
              label="OTP" 
              placeholder="Enter OTP" 
              value={otp && otp.length > 0 ? otp : ""} 
              // onChange={handleOTPChange} 
            />
            <div id="recaptcha-otp"></div>
            <Button 
              variant="gradient"
              gradient={{ from: "#005C81", to: "#122F47", deg: 83 }}
              fw={600}
              fz={12}
              h={36}
              lts="0.15rem"
              p="0 20px"
              radius="xl"
              className={styles.noAnimationButton}
              onClick={handleVerifyOTPClick}> Verify OTP</Button>
          </Group> */}
          <Group grow align="baseline" mih={80} gap="xl" mt={10}>
            <Select
              allowDeselect={false}
              withAsterisk
              label="Registered Country"
              // data={countryList ? [countryList] : []}
              data={
                Array.isArray(countryList) && countryList.length > 0
                  ? countryList.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))
                  : []
              }
              onChange={(value) => handleInputChange("country", value || "")}
              value={country}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              disabled={isReviewSaved}
              error={errors.country}
            />
            <Select
              allowDeselect={false}
              withAsterisk
              label="State"
              data={
                Array.isArray(stateList) && stateList.length > 0
                  ? stateList
                      .map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))
                      .sort((a, b) => a.label.localeCompare(b.label))
                  : []
              }
              value={stateName}
              onChange={(value) => handleInputChange("state", value || "")}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              disabled={isReviewSaved}
              error={errors.stateName}
              searchable
            />
          </Group>
          <Group grow align="baseline" mih={80} gap="xl" mt={10}>
            <MultiSelect
              withAsterisk
              label="Industry Type"
              searchable
              onChange={(value) => handleInputChange("industrytype", value)}
              data={
                Array.isArray(industryTypeList) && industryTypeList.length > 0
                  ? industryTypeList.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))
                  : []
              }
              value={Array.isArray(industryType) ? industryType : []}
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              error={errors.industryType}
            />

            <TextInput
              label="Parent Company"
              value={
                parentCompany && parentCompany.length > 0 ? parentCompany : ""
              }
              onChange={(e) =>
                handleInputChange("parentcompany", e.target.value)
              }
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              disabled={isReviewSaved}
            />

            {/* <Select
              withAsterisk
              label="Parent Company"
              data={[orgName]}
              value={orgName}
              onChange={(value) =>
                handleInputChange("parentcompany", value || "")
              }
              // value={parentCompany}
              disabled
            /> */}
          </Group>

          <Group grow align="baseline" mih={80} gap="xl" mt={10}>
            <Select
              allowDeselect={false}
              withAsterisk
              label="Start year - Data Collection"
              data={getYearRange()}
              value={baselineYear}
              onChange={(value) =>
                handleInputChange("baselineYear", value || "")
              }
              styles={{
                label: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#888888",
                },
                input: {
                  fontWeight: 400,
                  fontSize: 12,
                  color: "#444444",
                },
                error: {
                  fontSize: 10,
                },
              }}
              disabled={isReviewSaved}
              error={errors.baselineYear}
              searchable
            />
            <div></div>
          </Group>
          <Group mt={25} grow align="baseline" mih={80} gap="xl">
            <div style={{ display: hasWaterActivity ? "block" : "none" }}>
              <Text size="12px" fw={500} mb={8} c="#444444">
                Do you have wastewater treatment at this location?
                <span style={{ color: "red" }}> *</span>
              </Text>
              <Radio.Group
                value={hasWasteWaterTreatmentPlant === true ? "yes" : "no"}
                onChange={(value) =>
                  handleInputChange("iswastewater", value || "")
                }
                name="wastewaterPlant"
              >
                <Group mt="xs">
                  <Radio
                    color="#005C81"
                    variant="outline"
                    value="yes"
                    label="Yes"
                    disabled={
                      hasWasteWaterTreatmentPlant != null && isReviewSaved
                    }
                    styles={{
                      label: {
                        fontWeight: 400,
                        fontSize: 12,
                        color: "#444444",
                      },
                    }}
                  />
                  <Radio
                    color="#005C81"
                    variant="outline"
                    value="no"
                    label="No"
                    disabled={
                      hasWasteWaterTreatmentPlant != null && isReviewSaved
                    }
                    styles={{
                      label: {
                        fontWeight: 400,
                        fontSize: 12,
                        color: "#444444",
                      },
                    }}
                  />
                </Group>
              </Radio.Group>
            </div>
            <SelectYearType
              yearType={yearType}
              isReviewSaved={isReviewSaved}
              handleInputChange={handleInputChange}
            />
          </Group>

          <Flex mt={25}>
            <Button
              variant="unstyled"
              fw={600}
              fz={12}
              h={36}
              lts="0.15rem"
              p="0 20px"
              radius="xl"
              className="noAnimationButton filledGradientButton"
              onClick={saveOrganizationDetails}
            >
              REVIEW & SAVE
            </Button>
          </Flex>
        </Card>
      </Container>
    )
  );
}

export default OrganizationDetails;
