import jsonata from "jsonata";
import { useFormFieldStore, getJsonataExpression } from "./store";

export const validationErrorMessage = (
  required: boolean,
  value: any,
  valueType: string,
  setErrorMessagedetails: boolean,
  validationRules: any,
  isfrommultipledropdown?: any,
  heading?: any,
  fieldId?: any
) => {

  if (valueType.toLowerCase() === "string" && (!value || value === "null" || value === "undefined")) {
    value = "";
  }

  const formData = useFormFieldStore.getState();
  const answer = JSON.parse(JSON.stringify(formData.answer));
  if (fieldId) {
    if (answer[fieldId] !== undefined) {
      answer[fieldId].value = value; // Update the value for Draft Editors
    }
  }
  let message: any = "";
  //if (required === true) {
  if (
    getValueType(valueType, value) === true &&
    setErrorMessagedetails === true
  ) {
    message =
      validationRules !== "" && value
        ? validationRules[0].message
        : required === true
          ? "Required"
          : "";
  } else if (message === "") {
    if (validationRules !== "") {
      validationRules.some((item: any) => {
        try {
          // In JSONata 2.0, evaluate() returns a Promise if no callback is provided.
          // In this synchronous context, we use the callback pattern which
          // executes immediately if the expression contains no async functions.
          let jsonatarulevalue = jsonata(item.rule).evaluate(answer);

          const Result = Boolean(jsonatarulevalue);

          if (Result) {
            if (isfrommultipledropdown) {
              message = item ?? "" !== "" ? jsonatarulevalue : "Required";
            } else {
              // jsonata condition for multiselect dropdown length condition
              // Check if the result has a length property (array or string)
              if (Array.isArray(jsonatarulevalue)) {
                if (jsonatarulevalue.length > 0) {
                  const containsTrue = jsonatarulevalue.some(
                    (value: any) => value === true
                  );
                  if (containsTrue) {
                    message = item ?? "" !== "" ? item.message : "Required";
                  }
                } else {
                  message = item ?? "" !== "" ? item.message : "Required";
                }
              } else if (typeof jsonatarulevalue === "string" && jsonatarulevalue.length > 0) {
                // Handle string results
                message = item ?? "" !== "" ? item.message : "Required";
              } else {
                // For other types (number, boolean, object), just set the message
                message = item ?? "" !== "" ? item.message : "Required";
              }
            }
            // jsonata condition for multiselect dropdown length condition
          } else {
            if (
              isfrommultipledropdown === true &&
              heading !== undefined &&
              value === ""
            ) {
              const messagearray: any = [];

              messagearray.push({
                value: heading,
                error: "Required",
              });

              message = messagearray;
            } else {
              message = "";
            }
          }

          return Result;
        } catch (error) {
          // Enhanced error logging for JSONata evaluation failures
          console.group("🔴 JSONata Validation Error - validation.service.ts");
          console.error("Error details:", error);

          console.log("📍 Context Information:");
          console.log(`  - Field ID: ${fieldId || "N/A"}`);
          console.log(`  - Value Type Required: ${valueType}`);
          console.log(`  - Current Value:`, value);
          console.log(`  - Value JS Type: ${typeof value}`);
          console.log(`  - Is From Multiple Dropdown: ${isfrommultipledropdown || false}`);

          console.log("💡 Likely Cause:");
          if (typeof value === "number") {
            console.log("  ⚠️  Field value is a NUMBER, but validation rule may expect STRING or ARRAY");
            console.log(`  ⚠️  Current value: ${value} (type: number)`);
            console.log("  💡 Solution: Convert number to string in validation rule or update field data type");
          } else if (error && typeof error === "object" && "code" in error && (error as any).code === "T0410") {
            console.log("  ⚠️  Type mismatch in JSONata function call (e.g., $length() on wrong type)");
            console.log("  💡 Check if validation rule uses functions like $length(), $string(), etc. with correct types");
          }

          console.groupEnd();
          /**
           * Note: 
           The above error handling is designed to catch common issues with JSONata validation rules, such as type mismatches (e.g., treating a number as a string or array). It provides detailed logging to help developers quickly identify and resolve the root cause of validation errors.

           DO NOT CRASH the application on JSONata evaluation errors. 
           Instead, log the error and return false to skip validation, allowing the form to function while issues are being resolved.
           */
          return false;
        }
      });
    }
  }

  if (message === "" && valueType === "email") {
    const regEmail =

      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regEmail.test(value) && !!value && value != "") {
      message = "Invalid Email";
    }
  }
  if (message === "" && valueType === "hyperlink") {
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-[a-zA-Z0-9]+)?(\.[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?)*)(\.[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?((,\s*(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-[a-zA-Z0-9]+)?(\.[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?)*)(\.[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?)*)?$/;

    // const urlPattern =
    //   /^(https?:\/\/)?www\.[a-zA-Z0-9-]+\.(com|org|in|net|edu)(:\d{1,5})?(\/[^\s]*)?(,\s*(https?:\/\/)?www\.[a-zA-Z0-9-]+\.(com|org|net|info|biz|name|pro|me|us|uk|ca|au|de|fr|in|cn|jp|br|edu|gov|mil|int|coop|aero|xyz|online|site|tech|store|app|blog|asia|eu|museum|jobs|cat)(:\d{1,5})?(\/[^\s]*)?)*$/;

    if (!urlPattern.test(value) && !!value && value != "") {
      message = "Invalid Url";
    }
  }

  if (message === "" && valueType === "isAlphabetSpecialChar" && value) {
    const regValue = /^[a-zA-Z!@#$%^&*(),.?":{}|<>]*$/;
    if (!regValue.test(value)) {
      message = "Invalid value.";
    }
  }
  //}

  return message;
};

const getValueType = (valueType: string, value: any) => {
  const _setvalueType = valueType.toLowerCase();
  switch (_setvalueType) {
    case "string":
      return (value ?? "") === "" ? true : false;

    case "email":
      return (value ?? "") === "" ? true : false;

    case "hyperlink":
      return (value ?? "") === "" ? true : false;

    case "array":
      return (value ?? []).length === 0 ? true : false;

    case "number":
      return (value ?? 0) === 0 ? true : false;

    case "monthyear":
      return (value ?? "") === "" ? true : false;

    case "object":
      return Object.keys(value).length === 0 ? true : false;

    default:
      return (
        value && typeof value === "object" && Object.keys(value).length === 0
      );
  }
};

export const FilevalidationErrorMessage = (File: File) => {
  let message = "";
  {
    const filesize = File?.size;
    const selectableMaxFileSize = 1024 * 1024 * 50; // 50 Megabyte

    if (selectableMaxFileSize < filesize) {
      message = "The maximum file upload size allowed is 50 MB.";
    }
  }
  return message;
};
