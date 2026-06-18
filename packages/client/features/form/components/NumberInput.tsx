import { Divider, Flex, Stack, TextInput, Tooltip } from "@mantine/core";
import { IconPercentage } from "@tabler/icons";
import {
  checkIfNumZeroOrMoreThan10Quad,
  numberToWordsUSD,
} from "@warp/client/hooks/use-number-to-word";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useGetcompanyidbyinvitationidQuery } from "@warp/graphql/queries/generated/get-companyid-by-invitationid";
import { useGetWarninginterimdataByFormIdQuery } from "@warp/graphql/queries/generated/get-warningmessageinterimdataByFormId";
import {
  AICArouselData,
  AppRoles,
  FormMode,
  blankCheck
} from "@warp/shared/constants/app.constants";
import AISuggestionCarousel from "@warp/web/pages/embed/AIBasedSections/Common/AISuggestionCarousel";
import jsonata from "jsonata";
import { cloneDeep, debounce, sortBy } from "lodash";
import { useRouter } from "next/router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import MaskedInput, { PipeConfig } from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { getAISuggestionCarouselData } from "../common-functions";

import { useGetUserDetailsByInvitationIdQuery } from "@warp/graphql/queries/generated/get-user-details-by-invitation-id";
import { FormFieldRender } from "..";
import { encryptionDecryption } from "../../../hooks/encryption-decryption";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import {
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
  useInterimAnswerStore,
  useWarningMessageStore,
} from "../store";
import { FormFieldControl, warningmessageObjectType } from "../types";
import { validationErrorMessage } from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails = false;

//const autoCorrectedDatePipe = createAutoCorrectedDatePipe("mm/dd/yyyy HH:MM");
const mobileNumber = [
  /[0-9]/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

const year = [/[1-3]/, /\d/, /\d/, /\d/];
const USPostalCode = [/[A-Z]/i, /\d/, /[A-Z]/i, " ", /\d/, /[A-Z]/i, /\d/];
const INDPostalCode = [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
const Date = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
const Month_year = [/[0-1]/, /\d/, "/", /[1-3]/, /\d/, /\d/, /\d/];
const validTypes = [
  "currency-with-comma",
  "text-with-prefix",
  "currency-number",
];
const NumberInputField: FormFieldControl = ({ formField }) => {
  const removeWarning = useWarningMessageStore(
    (store) => store.removeWarningRuleFields,
  );
  const [isTooltipOn, setIsTooltipOn] = useState(false);
  const [inputFocussed, setInputFocussed] = useState(false);
  let Words: any = "";
  const AutoCalDBValueRef = useRef<any>("");
  /* Ref to track user interaction */
  const hasUserTyped = useRef(false);
  let [getTextValue, setTextValue] = useState("");
  let [getAutoCalValue, setAutoCalValue] = useState();
  let [getisWarningMessage, setisWarningMessage] = useState(false);
  const [isclicked, setIsClicked] = useState(false);
  let [getisAutofilledValue, setisAutofilledValue] = useState("");
  let [isValuechanged, setValuechanged] = useState(false);
  let [getEmail, setEmail] = useState("");
  let view_WarningMessage = "";
  const userSession = useUserSession();
  let warningList: warningmessageObjectType[] = [];
  const router = useRouter();
  const { query } = useRouter();
  const { choosemethod } = encryptionDecryption();
  let isWarningMessage: boolean = false;
  let invitationId: any = query?.invitationId || "";
  const { data: invitationinfo } = useGetcompanyidbyinvitationidQuery({
    variables: {
      invitationId: invitationId,
    },
  });
  const { data: UserDetails } = useGetUserDetailsByInvitationIdQuery({
    variables: {
      invitationId: invitationId,
    },
  });
  let answerdata: any = [];
  let dbanswer = "";
  if (formField?.interfaceOptions?.isAutoFilled) {
    answerdata = useFormFieldStore?.getState()?.answer;
    if (
      answerdata[formField.field] !== undefined &&
      answerdata[formField.field] !== null &&
      answerdata !== null &&
      answerdata !== undefined
    ) {
      dbanswer = answerdata[formField.field].value;
      //        answerdata[formField.field].value !== undefined &&
      //       answerdata[formField.field].value !== null &&
      //      answerdata[formField.field].value !== ""
      //       ? answerdata[formField.field].value
      //       : "";
    }
  }
  useEffect(() => {
    choosemethod(
      UserDetails?.FormInvitation[0]?.ParentCompanyMapping?.User?.email !==
        undefined
        ? UserDetails?.FormInvitation[0]?.ParentCompanyMapping?.User?.email
        : UserDetails?.FormInvitation[0]?.email,
      "decrypt",
    ).then((email) => {
      setEmail(email);
    });
  }, [getEmail, UserDetails]);
  const autofilledValue = formField?.interfaceOptions?.isAutoFilledEmail
    ? getEmail
    : formField?.interfaceOptions?.isAutoFilledCompanyName
      ? UserDetails?.FormInvitation[0]?.Company?.name
      : "";

  useEffect(() => {
    if (autofilledValue && formField?.interfaceOptions?.isAutoFilled) {
      if (autofilledValue === dbanswer && getTextValue !== "") {
        setisAutofilledValue(autofilledValue);
      } else if (autofilledValue != "" && dbanswer === "") {
        setisAutofilledValue(dbanswer);
      } else if (
        autofilledValue != "" &&
        (dbanswer === undefined || dbanswer === null)
      ) {
        setisAutofilledValue(autofilledValue);
      } else if (isValuechanged === true) {
        setisAutofilledValue(getTextValue);
        setValuechanged(false);
      } else {
        setisAutofilledValue(dbanswer);
      }
    }
  }, [autofilledValue, dbanswer]);

  let Companyid: any = "";
  if (
    userSession?.user?.role === AppRoles.Invitee ||
    userSession?.user?.role === AppRoles.Responder
  ) {
    Companyid = userSession?.company?.id;
  } else {
    let invitationdata: any = invitationinfo;
    Companyid = invitationdata?.FormInvitation[0]?.companyId;
  }

  const { data: warningmessagedata } = useGetWarninginterimdataByFormIdQuery({
    variables: {
      formId: formField?.formId,
      companyId: Companyid,
    },
  });

  const checkInputData = (str: any) => {
    let getolddata = warningmessagedata;
    //  let getolddata = getInterimRecomendation[formField.field];

    if (
      !!getolddata &&
      getolddata?.FormInvitation.length > 0 &&
      getolddata !== undefined &&
      !!str
    ) {
      try {
        let index1: any = 0;
        if (
          getolddata?.FormInvitation.filter(
            (item: any) => item.id == invitationId,
          ).length > 0
        ) {
          //index = getolddata?.FormInvitation?.findIndex(invitationId);

          getolddata?.FormInvitation.map((item: any, i: any) => {
            if (item.id == invitationId) {
              index1 = i;
              return;
            }
          });
          const isViewModecheck = query?.mode === FormMode.View;
          const isstartModecheck = query?.mode === FormMode.Start;
          if (isViewModecheck === true || isstartModecheck === true) {
            index1 = index1 - 1;
          } else {
            index1 = index1 - 1;
          }
        } else {
          index1 = getolddata?.FormInvitation.length - 1;
        }
        if (index1 < 0) {
          index1 = 0;
        }
        let Prev_ansdata: any = getolddata?.FormInvitation[
          index1
        ]?.FormSubmissions[0]?.Answers.filter(
          (rec: any) => rec.formFieldId === formField.id,
        );

        const checkWarningMessage = {
          currentInput: Number(parseInt(isNaN(str) ? 0 : str)),
          previousInput: Number(
            parseInt(
              isNaN(Prev_ansdata[0]?.data?.value)
                ? 0
                : Prev_ansdata[0]?.data?.value,
            ),
          ),
          ratio: Number(formField?.warningRules[0]?.ratio),
        };

        try {
          let Threshold_Deviation = jsonata(
            formField?.warningRules[0]?.Threshold_Deviation_Rule,
          ).evaluate(checkWarningMessage);

          let Deviation_differential: any =
            Threshold_Deviation > Number(formField?.warningRules[0]?.ratio)
              ? Threshold_Deviation - Number(formField?.warningRules[0]?.ratio)
              : Number(formField?.warningRules[0]?.ratio) - Threshold_Deviation;

          let actual_dev = jsonata(formField?.warningRules[0]?.rule).evaluate(
            checkWarningMessage,
          );

          if (Threshold_Deviation > Number(formField?.warningRules[0]?.ratio)) {
            // Boolean(
            //   jsonata(formField?.warningRules[0]?.rule).evaluate(
            //     checkWarningMessage
            //   )
            // ) )

            const isWarningRule = Boolean(
              jsonata(formField?.warningRules[0]?.rule).evaluate(
                checkWarningMessage,
              ),
            );
            setisWarningMessage(isWarningRule);

          // console.log(formField);

          let warningListdata = cloneDeep(
            useWarningMessageStore.getState().WarningRuleFields,
          );

          warningListdata = warningListdata.filter(
            (z) => z.formfieldid !== formField.id,
          );

            warningListdata.push({
              isWarningRule: isWarningRule,
              Deviation_differential: Deviation_differential,
              formfieldid: formField.id,
              newValue: str,
              oldvalue: Prev_ansdata[0]?.data?.value,
              ispopupmessageremoved: false,
              questionid: formField.Question?.id,
              ratio: Threshold_Deviation,
              Threshold_Deviation: formField?.warningRules[0]?.ratio,
              warningmessage: formField?.warningRules[0]?.popupmessage,
              isFileUpload: false,
            });
            useWarningMessageStore.setState({
              WarningRuleFields: warningListdata,
            });
          } else {
            setisWarningMessage(false);
            let warningListdata1 = cloneDeep(
              useWarningMessageStore.getState().WarningRuleFields,
            );
          warningListdata1 = warningListdata1.filter(
            (z) => z.formfieldid !== formField.id,
          );
          let isEmpty = warningListdata1.length == 0 ? true : false;
          if (isEmpty) {
            removeWarning();
          } else {
            useWarningMessageStore.setState({
              WarningRuleFields: warningListdata1,
            });
          }
        }
        } catch (error) {
          // Enhanced error logging for warning rule evaluation
          console.group("🟡 JSONata Warning Rule Error - NumberInput.tsx");
          console.error("Error details:", error);
          console.log(`  - FormField ID: ${formField.id}`);
          console.log(`  - Current Input: ${str}`);
          console.log("Check Data:", checkWarningMessage);
          console.groupEnd();
          
          // Don't crash - skip warning validation
          setisWarningMessage(false);
        }
      } catch (error) {}
    }

    if (view_WarningMessage !== "") {
      let warningListdata = cloneDeep(
        useWarningMessageStore.getState().WarningRuleFields,
      );
      let datalist = warningListdata.filter(
        (z) => z.formfieldid === formField.id,
      );
      if (datalist.length === 0) {
        warningListdata = warningListdata.filter(
          (z) => z.formfieldid !== formField.id,
        );

        warningListdata.push({
          isWarningRule: false,
          Deviation_differential: "",
          formfieldid: formField.id,
          newValue: str,
          oldvalue: "",
          ispopupmessageremoved: true,
          questionid: formField.Question?.id,
          ratio: "",
          Threshold_Deviation: "",
          warningmessage: formField?.warningRules[0]?.popupmessage,
          isFileUpload: false,
        });
        useWarningMessageStore.setState({
          WarningRuleFields: warningListdata,
        });
      }
    }

    if (str === "") {
      view_WarningMessage = "";
      setValue(formField.id, "");
      setisWarningMessage(false);
      warningList = useWarningMessageStore.getState().WarningRuleFields;
      warningList.filter((z) => z.formfieldid !== formField.id);
      let isEmpty = warningList.length == 0 ? true : false;
      if (isEmpty) {
        removeWarning();
      } else {
        useWarningMessageStore.setState({
          WarningRuleFields: warningList,
        });
      }
    }
  };

  const {
    fieldOptions,
    interfaceOptions,
    setValue,
    value,
    displayOptions,
    setErrorMessage,
  } = useFormFieldControl<"number-input">(formField);
  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  const answer = useFormFieldStore?.getState()?.answer;

  const debouncedSearch = useMemo(
    () =>
      debounce((inputValue) => {
        const query = !!inputValue ? inputValue : "";
        if (String(query).endsWith(".")) {
          setValue(formField.id, String(query).substring(0, -1));
        } else {
          setValue(formField.id, String(query));
        }
      }, 300),
    [], // Stable debounce
  );

  const debouncedSearch_new = useMemo(
    () =>
      debounce((query) => {
        if (String(query).endsWith(".") || String(query).startsWith(".")) {
          setValue(formField.id, String(query).substring(0, -1));
        } else {
          setValue(formField.id, String(query));
        }
      }, 300),
    [], // Stable debounce
  );

  /* Sync value from store if user hasn't typed */
  useEffect(() => {
    if (
      !hasUserTyped.current &&
      value !== undefined &&
      value !== getTextValue
    ) {
      setTextValue(value ?? "");
    }
  }, [value]);

  /* Cleanup debounces */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      debouncedSearch_new.cancel();
    };
  }, [debouncedSearch, debouncedSearch_new]);

  const commaSeparateConvert = (value: string | number): string => {
    if (typeof value === "number") {
      return value.toLocaleString("en-US");
    }
    const numericValue = parseFloat(String(value)?.replace(/,/g, ""));
    return !isNaN(numericValue) ? numericValue.toLocaleString("en-US") : "";
  };

  useEffect(() => {
    if (formField.type === "currency-with-comma") {
      setTextValue(commaSeparateConvert(getTextValue));
    }
  }, [getTextValue, formField.type]);

  useEffect(() => {
    if (!formField?.interfaceOptions?.isAutoCalculate) return;

    // Find and retrieve the value directly
    const filteredValue =
      Object.values(answer).find(
        (record) => record.formFieldId === formField.id,
      )?.value || null;

    AutoCalDBValueRef.current = filteredValue;
    // Perform auto-calculation if rules exist
    const rule = formField?.autoCalculatedCalculation?.[0]?.rule;
    if (rule) {
      const score = jsonata(rule).evaluate(answer) || 0;
      setAutoCalValue(score);
    }
  }, [
    answer,
    formField?.autoCalculatedCalculation,
    formField?.interfaceOptions?.isAutoCalculate,
  ]);

  let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );
  setErrorMessagedetails = setErrorMessage;
  const children = sortBy(formField.children ?? [], [
    (field: any) => Number(field.seqIndex),
  ]);
  const type = formField.type == "number" ? "number" : "text";

  const warningRuleCheck = async () => {
    let getolddata = warningmessagedata;
    //  let getolddata = getInterimRecomendation[formField.field];

    if (
      !!getolddata &&
      getolddata?.FormInvitation.length > 0 &&
      getolddata !== undefined &&
      !!value
    ) {
      try {
        let index: any = 0;
        if (
          getolddata?.FormInvitation.filter(
            (item: any) => item.id == invitationId,
          ).length > 0
        ) {
          //index = getolddata?.FormInvitation?.findIndex(invitationId);

          getolddata?.FormInvitation.map((item: any, i: any) => {
            if (item.id == invitationId) {
              index = i;
              return;
            }
          });

          const isViewModecheck = query?.mode === FormMode.View;
          const isstartModecheck = query?.mode === FormMode.Start;
          if (isViewModecheck === true || isstartModecheck === true) {
            index = index - 1;
          } else {
            index = index - 1;
          }
        } else {
          index = getolddata?.FormInvitation.length - 1;
        }
        // getolddata?.FormInvitation.map((item: any, i: any) => {

        //   if (item.id == invitationId) {
        //     index = i;

        //     return;
        //   }
        // });

        if (index < 0) {
          index = 0;
        }

        let Prev_ansdata: any = getolddata?.FormInvitation[
          index
        ]?.FormSubmissions[0]?.Answers.filter(
          (rec: any) => rec.formFieldId === formField.id,
        );

        const checkWarningMessage = {
          currentInput: Number(parseInt(isNaN(value) ? 0 : value)),
          previousInput: Number(
            parseInt(
              isNaN(Prev_ansdata[0]?.data?.value)
                ? 0
                : Prev_ansdata[0]?.data?.value,
            ),
          ),
          ratio: Number(formField?.warningRules[0]?.ratio),
        };

        try {
          if (
            Boolean(
              jsonata(formField?.warningRules[0]?.rule).evaluate(
                checkWarningMessage,
              ),
            ) === true
          ) {
            view_WarningMessage =
              !!value && isNaN(value) ? "" : formField?.warningRules[0]?.message;
          }
        } catch (error) {
          // Enhanced error logging for warning rule evaluation
          console.group("🟡 JSONata Warning Rule Error - NumberInput.tsx (view message)");
          console.error("Error details:", error);
          console.log(`  - FormField ID: ${formField.id}`);
          console.log(`  - Current Value: ${value}`);
          console.log("Check Data:", checkWarningMessage);
          console.groupEnd();
          
          // Don't crash - skip warning message
          view_WarningMessage = "";
        }
      } catch (error) {}
    }
  };
  useFormFieldRemoveAnswerOnEnableFalse(formField, fieldOptions.enable);

  warningRuleCheck();

  /* Manage AutoCalculate in useEffect instead of render */
  useEffect(() => {
    if (
      query?.mode !== FormMode.View &&
      formField?.interfaceOptions?.isAutoCalculate &&
      getAutoCalValue !== undefined &&
      getAutoCalValue !== null &&
      getAutoCalValue !== AutoCalDBValueRef.current
    ) {
      if (getAutoCalValue === 0) {
        setValue(formField.id, getAutoCalValue);
      } else {
        debouncedSearch_new(getAutoCalValue);
      }
    }
  }, [getAutoCalValue, formField.id]);

  /* Initialize value and handle Autofill in useEffect */
  useEffect(() => {
    if (!hasUserTyped.current) {
      if (
        query?.mode === FormMode.Start &&
        formField?.interfaceOptions?.isAutoFilled &&
        getisAutofilledValue
      ) {
        const val = getisAutofilledValue.endsWith(".")
          ? getisAutofilledValue.substring(0, -1)
          : getisAutofilledValue;
        setValue(formField.id, val);
        setTextValue(val);
      } else if (value) {
        setTextValue(value ?? "");
      }
    }
  }, [getisAutofilledValue]);

  if (getTextValue !== "") {
    let isIndianCurrency = formField?.interfaceOptions?.prefix;
    if (isIndianCurrency == "undefined" || isIndianCurrency == "INR") {
      isIndianCurrency = true;
    } else {
      isIndianCurrency = false;
    }

    if (
      formField.type === "text-with-prefix" &&
      String(getTextValue).includes(formField?.interfaceOptions?.prefix)
    ) {
      let amount = String(getTextValue).substring(
        !!formField?.interfaceOptions?.prefix &&
          formField?.interfaceOptions?.prefix.length,
      );
      if (validTypes.includes(formField.type)) {
        Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
          ? ""
          : numberToWordsUSD(
              parseFloat(amount?.replace(/,/g, "") || "0"),
              isIndianCurrency,
              formField.type,
            );
      }
    } else if (
      formField.type == "currency-with-comma" ||
      formField.type == "text-with-prefix" ||
      formField.type === "currency-number"
    ) {
      Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
        ? ""
        : numberToWordsUSD(
            parseFloat(String(getTextValue)?.replace(/,/g, "") || "0"),
            isIndianCurrency,
            formField.type,
          );
    }
  }

  const phoneNumberMask = (rawValue: any) => {
    if (rawValue === "(") {
      const baseMask = [
        "(",
        /\d/,
        /\d/,
        ")",
        " ",
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ];

      return baseMask;
    } else if (rawValue === "(+") {
      const baseMask = [
        "(",
        "+",
        /\d/,
        /\d/,
        ")",
        " ",
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ];

      return baseMask;
    } else if (rawValue === "+") {
      const baseMask = [
        "+",
        /\d/,
        /\d/,
        " ",
        "(",
        /\d/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ];

      return baseMask;
    } else {
      return rawValue
        .split("")
        .map((char: any, index: number) => {
          if (index === 0 && char === "+") return "+"; // Allow + only at the start
          if (/\d/.test(char)) return /\d/; // Allow digits
          if (/[(+)]/.test(char)) return char; // Allow (, and )
          if (/[-.\s]/.test(char)) return char; // Allow -, ., and spaces
          return false; // Disallow all other characters
        })
        .filter(Boolean); // Filter out disallowed characters
    }
  };

  let mask: any[] = [];
  switch (formField.type) {
    case "number":
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: "",
        allowDecimal: false,
        allowLeadingZeroes: true,
      });
      // mask = createNumberMask({
      //   prefix: "",
      //   suffix: "",
      //   thousandsSeparatorSymbol: "",
      //   allowDecimal: false,
      // });
      break;

    case "year":
      mask = year;
      break;

    case "mobile":
      mask = mobileNumber;
      break;

    case "date":
      mask = Date;
      break;

    case "postalCode":
      mask = INDPostalCode;
      break;

    case "month_year":
      mask = Month_year;
      break;

    case "":
      mask = Month_year;
      break;

    case "decimal-number":
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: "",
        allowDecimal: true,
        allowLeadingZeroes: true,
        decimalLimit: Number(formField.interfaceOptions?.decimalLimit ?? 20),
      });
      break;

    case "currency-number":
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: "",
        allowDecimal: true,
        allowLeadingZeroes: true,
        integerLimit: 16,
      });
      break;

    case "text-with-prefix":
      mask = createNumberMask({
        prefix: formField.interfaceOptions?.prefix,
        suffix: "",
        thousandsSeparatorSymbol: ",",
        allowDecimal: true,
        allowLeadingZeroes: true,
        integerLimit: 16,
      });
      break;

    case "percentage":
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: "",
        allowDecimal: true,
        allowLeadingZeroes: true,
      });
      break;

    case "currency-with-comma":
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: ",",
        allowDecimal: false,
        allowLeadingZeroes: true,
      });
      break;

    default:
      mask = createNumberMask({
        prefix: "",
        suffix: "",
        thousandsSeparatorSymbol: "",
        allowDecimal: false,
        allowLeadingZeroes: true,
      });
      break;
  }

  const pipe = (conformedValue: string, config: PipeConfig) => {
    if (formField.type === "month_year") {
      config.keepCharPositions = true;
      config.guide = true;
      const splitDate = conformedValue.split("/");
      //splitDate;
      let SplitData: String = splitDate[0];
      let SplitSingleUnit = SplitData.split("");
      if (SplitSingleUnit.length >= 2) {
        if (SplitData === "00") {
          return conformedValue.replace("00", "01");
        }
        if (
          SplitSingleUnit[1] !== "0" &&
          SplitSingleUnit[1] !== "1" &&
          SplitSingleUnit[1] !== "2"
        ) {
          return conformedValue.replace(SplitSingleUnit[0], "0");
        } else {
          return conformedValue;
        }
      } else {
        return conformedValue;
      }
    } else if (
      formField.type === "currency-number" ||
      formField.type == "currency-with-comma" ||
      formField.type === "text-with-prefix"
    ) {
      config.keepCharPositions = true;
      config.guide = true;
      if (conformedValue !== "") {
        let amount = "";
        if (
          formField.type === "text-with-prefix" &&
          String(conformedValue).includes(formField?.interfaceOptions?.prefix)
        ) {
          amount = String(conformedValue).substring(
            !!formField?.interfaceOptions?.prefix &&
              formField?.interfaceOptions?.prefix.length,
          );
          //Words = numberToWords(parseFloat(amount.replace(/,/g, "")),true,formField.type);
          if (validTypes.includes(formField.type)) {
            let isIndianCurrency = formField?.interfaceOptions?.prefix;
            if (isIndianCurrency == "undefined" || isIndianCurrency == "INR") {
              isIndianCurrency = true;
              Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
                ? ""
                : numberToWordsUSD(
                    parseFloat(amount?.replace(/,/g, "") || "0"),
                    isIndianCurrency,
                    formField.type,
                  );
            } else {
              isIndianCurrency = false;
              Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
                ? ""
                : numberToWordsUSD(
                    parseFloat(amount?.replace(/,/g, "") || "0"),
                    isIndianCurrency,
                    formField.type,
                  );
            }
          }
        }
      }

      return conformedValue;
    } else if (formField.type === "decimal-number") {
      let number = conformedValue;
      console.log("number", number);
      if (number.endsWith(".") || number.startsWith(".")) {
        // return number.slice(0, -1) + '.00'; // Remove last dot and add .00
        return number;
      }
      return number;
    } else {
      return conformedValue;
    }
  };
  const mask_new = (inputValue: string): RegExp[] => {
    return inputValue.split("").map((_) => /.*/);
  };
  let recommedationData: any = [];
  let isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
  const isViewMode = query?.mode === FormMode.View;
  const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
  if (
    isViewMode &&
    formField?.recommendationCalc?.recommendation !== undefined &&
    isFormSubmitted
  ) {
    const StoreAnswer: any = useFormFieldStore.getState().answer;
    recommedationData = jsonata(
      formField?.recommendationCalc?.recommendation,
    ).evaluate(StoreAnswer);
  }

  const icon = (
    <IconPercentage style={{ width: 16, height: 16, color: "#868E96" }} />
  );

  const changeHandler = (inputValue: any, isFromAI: boolean) => {
    hasUserTyped.current = true; /* Mark as user typed */
    setIsClicked(!isFromAI);
    let isNumberValidate = false;
    const maxValue = formField.interfaceOptions?.maxValue || null;
    let numericValue = String(inputValue).replace(/,/g, "");
    const prefix = formField.interfaceOptions?.prefix;
    if (prefix && numericValue.startsWith(prefix)) {
      numericValue = numericValue.substring(prefix.length);
    }
    const compareValue = numericValue === "" ? NaN : Number(numericValue);

    if (!!maxValue && !isNaN(compareValue)) {
      if (Number(maxValue) < compareValue) {
        isNumberValidate = true;
        // Check for maxValue and return if condition not satisfied
        return;
      }
    }
    const minValue = formField.interfaceOptions?.minValue || null;
    if (!!minValue && !isNaN(compareValue)) {
      if (Number(minValue) > compareValue) {
        isNumberValidate = true;
        // Check for minValue and return if condition not satisfied
        return;
      }
    }
    // Update input if conditions satisfied
    //e.preventDefault();
    if (isNumberValidate === false) {
      if (formField.type === "text-with-prefix") {
        let value = inputValue.substring(
          formField.interfaceOptions?.prefix?.length,
        );
        if (value.endsWith(".")) {
          // setValue(formField.id, value.substring(0, -1));
          setTextValue(value.substring(0, -1));
        } else {
          // setValue(formField.id, value);
          setTextValue(value);
        }
      } else {
        if (inputValue.endsWith(".")) {
          // setValue(formField.id, e.target.value.substring(0, -1));
          setTextValue(inputValue.substring(0, -1));
        } else {
          // setValue(formField.id, e.target.value);
          setTextValue(!!inputValue ? inputValue : "");
        }
      }
      setErrorMessagedetails = true;
      if (!!inputValue) {
        if (inputValue.endsWith(".")) {
          checkInputData(inputValue.substring(0, -1));
        } else {
          checkInputData(inputValue);
        }
      } else {
        view_WarningMessage = "";
        setisWarningMessage(false);
      }
      // (e.target.value === "0" && formField.type === "number") ||
      inputValue === "0" && formField.type === "year"
        ? setTextValue("")
        : setTextValue(inputValue);
      // setValue(formField.id, e.target.value);
      // console.log({ value });
    }
    // Cancel debounce if input is cleared
    if (!inputValue) {
      debouncedSearch.cancel();
      setValue(formField.id, ""); // Clear the value immediately
    } else {
      debouncedSearch(inputValue); // Call debounced function with the event
    }
  };

  //#region Carousel Data Binding
  // Skip AI suggestion logic if parent component (e.g., FixedQuestionTable) is handling it
  const shouldShowAISuggestions = !formField.interfaceOptions?.hideAISuggestions;
  const AISuggestionCarouseldata: AICArouselData[] = shouldShowAISuggestions
    ? getAISuggestionCarouselData(
        !!useFormFieldStore?.getState()?.Suggestions
          ? useFormFieldStore
              ?.getState()
              ?.Suggestions.filter((items) => items.formFieldId == formField?.id)
          : [],
      )
    : [];

  if (!shouldShowAISuggestions && useFormFieldStore?.getState()?.Suggestions?.some(s => s.formFieldId === formField?.id)) {
    console.log("[AI Optimization] Skipping AI suggestions fetch/render for NumberInput field:", formField.field, "(handled by parent)");
  }
  //#endregion

  if (
    query?.mode === FormMode.Start &&
    formField?.interfaceOptions?.isAutoFilled &&
    getisAutofilledValue
  ) {
    // setValue(formField.id, "");
    if (getisAutofilledValue.endsWith(".")) {
      setValue(formField.id, getisAutofilledValue.substring(0, -1));
    } else {
      setValue(formField.id, getisAutofilledValue);
    }

    // setValue(formField.id, getisAutofilledValue);
  } else {
    //commented for decimal changes autocalc
    // if (getTextValue?.endsWith(".")) {
    // setValue(formField.id, getTextValue.substring(0, -1));
    //} else {
    // setValue(formField.id, getTextValue);
    // }
    //        setValue(formField.id, getTextValue);
    //commented for decimal changes autocalc
  }

  const prefixValue = formField?.interfaceOptions?.prefix;
  const isIndianCurrencyForTooltip =
    prefixValue == "undefined" || prefixValue == "INR";

  const showassigner =
    formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
  const EnableQuestionField = useEnableQuestionField(formField);
  const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);
  const getInterimRecomendation: any = useInterimAnswerStore.getState().interim_answers;
  const getSpecificRecomm = getInterimRecomendation[formField.field];

  if (!fieldOptions.enable) return <></>;
      return (
    <Stack>
      <Stack
        spacing="xs"
        // style={pointerEventsStyle}
      >
        <DisplayLabel
          text={formField.fieldOptions.label}
          isHeading={!!formField.interfaceOptions.isHeading}
          headingSize={formField.interfaceOptions.headingSize}
          infoIconProps={formField?.interfaceOptions?.infoIconProps}
          subtitle={formField.interfaceOptions.subtitle}
          showassigner={showassigner}
          formField={formField}
        />
        {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )}
        <Flex
          justify="space-between"
          align="center"
          wrap="nowrap"
          gap="xs"
          className="Recommandation-icon-group"
        >
          <Stack w="100%">
            <MaskedInput
              mask={
                formField.type === "global-phone-number"
                  ? phoneNumberMask
                  : mask
              }
              placeholder={interfaceOptions?.placeholder}
              guide={false}
              //onBlur={() => {}}
              showMask={false}
              // pipe={autoCorrectedDatePipe}
              pipe={pipe}
              render={(ref, props) => (
                <>
                  {" "}
                  <Tooltip
                    position="top-start"
                    disabled={
                      !!formField.interfaceOptions?.isToolTip
                        ? getTextValue === "" || getTextValue === null
                          ? true
                          : false
                        : true
                    }
                    multiline
                    opened={isTooltipOn || inputFocussed}
                    label={
                      !!formField.interfaceOptions?.isToolTip
                        ? formField.type == "currency-number" ||
                          formField.type == "currency-with-comma"
                          ? checkIfNumZeroOrMoreThan10Quad(
                              String(getTextValue) || "",
                            )
                            ? ""
                            : numberToWordsUSD(
                                parseFloat(
                                  getTextValue?.replace(/,/g, "") || "0",
                                ),
                                isIndianCurrencyForTooltip,
                                formField.type,
                              )
                          : getTextValue
                        : ""
                    }
                  >
                    <TextInput
                      maxLength={interfaceOptions?.maxLength}
                      pl={formField.interfaceOptions.subtitle ? 28 : 0}
                      autoComplete="off"
                      value={
                        interfaceOptions?.isAutoCalculate
                          ? getAutoCalValue
                          : getTextValue
                      }
                      withAsterisk={fieldOptions?.required}
                      icon={interfaceOptions?.prefix ?? ""}
                      className="classNameforFixedTable"
                      classNames={{
                        label: "labelStyle",
                        error: "mantine-TextInput-error",
                        input: "mantine-TextInput-input",
                        icon: "mantine-Input-icon",
                        rightSection: "mantine-Input-suffix",
                      }}
                      rightSection={
                        formField.type === "percentage"
                          ? icon
                          : interfaceOptions?.suffix || ""
                      }
                      error={validationErrorMessage(
                        formField.fieldOptions?.required,
                        String(getTextValue),
                        "string",
                        setErrorMessagedetails,
                        formField.validationRules ?? "",
                      )}
                      ref={ref as any}
                      {...props}
                      data-formfieldid={formField?.id}
                    />
                  </Tooltip>
                  {getisWarningMessage === true ? (
                    <p
                      style={{
                        color: "#eeb806",
                        fontSize: "13px",
                        width: "100%",
                      }}
                    >
                      {formField?.warningRules[0]?.message}{" "}
                    </p>
                  ) : view_WarningMessage !== "" ? (
                    <p
                      style={{
                        color: "#eeb806",
                        fontSize: "13px",
                        width: "100%",
                      }}
                    >
                      {view_WarningMessage}{" "}
                    </p>
                  ) : (
                    <></>
                  )}
                  {formField.type == "currency-number" ||
                  formField.type == "currency-with-comma" ||
                  formField.type == "text-with-prefix" ||
                  formField.type == "percentage" ? (
                    <p
                      style={{
                        color: "#eeb806",
                        fontSize: "13px",
                        width: "100%",
                        lineHeight: "28px",
                        marginBottom: 0,
                      }}
                    >
                      {Words}
                    </p>
                  ) : (
                    ""
                  )}
                </>
              )}
              onBlur={(e) => {
                let val = e.target.value;
                if (formField.type === "percentage" && val) {
                  val = String(val).replace(/^0+(?=\d)/, "");
                  setTextValue(val);
                } else {
                  setTextValue(val);
                }
              }}
              //debounce code changes added for optimization
              // onChange={(e) => {
              //   let isNumberValidate = false;
              //   const maxValue = formField.interfaceOptions?.maxValue || null;
              //   e.preventDefault();
              //   if (!!maxValue) {
              //     if (Number(maxValue) < Number(e.target.value)) {
              //       isNumberValidate = true;
              //     }
              //   }
              //   if (isNumberValidate === false) {
              //     if (formField.type === "text-with-prefix") {
              //       let value = e.target.value.substring(
              //         formField.interfaceOptions?.prefix?.length
              //       );
              //       if (value.endsWith(".") || value.startsWith(".")) {
              //         setValue(formField.id, value.substring(0, -1));
              //       } else {
              //         setValue(formField.id, value);
              //       }
              //     } else {
              //       if (
              //         e.target.value.endsWith(".") ||
              //         e.target.value.startsWith(".")
              //       ) {
              //         // setValue(formField.id, e.target.value.substring(0, -1));
              //       } else {
              //         // setValue(formField.id, e.target.value);
              //       }
              //     }
              //     setErrorMessagedetails = true;
              //     if (!!e.target.value) {
              //       checkInputData(e.target.value);
              //     } else {
              //       view_WarningMessage = "";
              //       setisWarningMessage(false);
              //     }
              //     // (e.target.value === "0" && formField.type === "number") ||
              //     e.target.value === "0" && formField.type === "year"
              //       ? setTextValue("")
              //       : setTextValue(e.target.value);
              //     // setValue(formField.id, e.target.value);
              //     // console.log({ value });
              //   }
              // }}
              //debounce code changes added for optimization
              onChange={(e) => {
                changeHandler(e.target.value, false);
              }}
              disabled={fieldOptions?.readonly || isDisabled}
              data-formfieldid={formField?.id}
              // onBlur={(e) => setValue(formField.id, e.target.value)}
            />
            {AISuggestionCarouseldata?.length > 0 && !fieldOptions?.readonly ? (
              <div style={isDisabled ? { pointerEvents: "none" } : {}}>
                <AISuggestionCarousel
                  data={AISuggestionCarouseldata}
                  onSelectSingleValueCard={(value) =>
                    changeHandler(String(value), true)
                  }
                  formFieldId={formField?.id}
                  isclicked={
                    !!useFormFieldStore.getState().answer[formField?.field]
                      ? blankCheck.includes(
                          useFormFieldStore.getState().answer[formField?.field]
                            .value,
                        )
                        ? true
                        : isclicked
                      : isclicked
                  }
                  isFile={false}
                  isReplaceInfoContent={true}
                />
              </div>
            ) : (
              <></>
            )}
          </Stack>
          {FormHasRecommendation?.length === 0 &&
          recommedationData.length > 0 &&
          recommedationData.some((item: any) => item.value === value) ? (
            <CommonRecommendation
              recommText={
                recommedationData.filter((item: any) => item.value === value)[0]
                  .comment
              }
            />
          ) : (
            <AddRecommendationButton
              formField={formField}
              answerOptionData={
                getSpecificRecomm?.interim_recommendation[0]?.answeroption
              }
            />
          )}
        </Flex>
        {/* 
        <NumberInput
          type="number"
          placeholder={interfaceOptions?.placeholder}
          error={validationErrorMessage(
            formField.fieldOptions?.required,
            value,
            "string",
            setErrorMessagedetails,
            formField.validationRules ?? ""
          )}
          disabled={fieldOptions?.readonly}
          hideControls
          withAsterisk={fieldOptions?.required}
          classNames={{ label: "labelStyle" }}
          value={value ?? ""}
          onChange={(e) => {
            setErrorMessagedetails = true;
            setValue(formField.id, e);
          }}
        /> */}
      </Stack>
      {!!children?.length && (
        <Stack>
          {children.map((field) => (
            <FormFieldRender key={field.id} formField={field} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const SimpleNumberInputField: FormFieldControl<"number-input"> = memo(
  ({
    formField,
    name,
    onChange,
    rowIndex,
    ansId,
    tdheading,
    isStateValuefromAI,
    isShowSparkIcon,
  }) => {
    const { query } = useRouter();
    const {
      fieldOptions,
      interfaceOptions,
      setValue,
      value: storeValue,
      displayOptions,
      setErrorMessage,
    } = useFormFieldControl<"number-input">(formField);
    setErrorMessagedetails = setErrorMessage;
    const [isTooltipOn, setIsTooltipOn] = useState(false);
    const [inputFocussed, setInputFocussed] = useState(false);
    const userSession = useUserSession();
    const state = useChildFieldState(String(name), formField, rowIndex, ansId);
    const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
      (x: any) => x.type === "Recommendation_new",
    );
    let FormHasRecommendation: any = recommendationNewResponce[0]?.data.filter(
      (rec: any) => rec.FormId === formField?.formId,
    );
    ////this state is just for formality to rerender child component of table element of multipledropdown
    const [isStateSetFromSuggestion, setIsStateSetFromSuggestion] =
      useState(isStateValuefromAI);
    const showassigner =
      formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";
    
    /* Ref to track user interaction */
    const hasUserTyped = useRef(false);
    let [getTextValue, setTextValue] = useState("");
    
    const checkInputData = (str: any) => {
      if (str === "") state?.setValue("");
    };

    /* Sync value from store if user hasn't typed */
    useEffect(() => {
      if (
        !hasUserTyped.current &&
        state?.value !== undefined &&
        state?.value !== getTextValue
      ) {
        setTextValue(state?.value ?? "");
      }
    }, [state?.value]);

    const debouncedChange = useMemo(
      () =>
        debounce((value: any, isSparkIconClick?: boolean) => {
          state?.setValue(value);
          !!onChange && onChange(value, isSparkIconClick);
        }, 300),
      [],
    );

    /* Reactive answer store access */
    const answer = useFormFieldStore((store) => store.answer);
    let [getAutoCalValue, setAutoCalValue] = useState<any>();
    let [getisAutofilledValue, setisAutofilledValue] = useState("");

    useEffect(() => {
      if (
        !hasUserTyped.current &&
        query?.mode !== FormMode.View &&
        formField?.interfaceOptions?.isAutoCalculate
      ) {
        // Find and retrieve the value directly
        const filteredValue =
          Object.values(answer).find(
            (record) => record.formFieldId === formField.id,
          )?.value || null;

        if (filteredValue !== undefined && filteredValue !== null) {
          setTextValue(String(filteredValue));
          state?.setValue(String(filteredValue));
        }

        // Perform auto-calculation if rules exist
        const rule = formField?.autoCalculatedCalculation?.[0]?.rule;
        if (rule) {
          try {
            const score = jsonata(rule).evaluate(answer) || 0;
            setAutoCalValue(score);
          } catch (e) {
            console.error("Auto calculation error in SimpleNumberInput:", e);
          }
        }
      }
    }, [answer, formField?.interfaceOptions?.isAutoCalculate, formField?.autoCalculatedCalculation, query?.mode]);

    useEffect(() => {
      if (
        !hasUserTyped.current &&
        query?.mode === FormMode.Start &&
        formField?.interfaceOptions?.isAutoFilled &&
        getisAutofilledValue
      ) {
        const val = getisAutofilledValue.endsWith(".")
          ? getisAutofilledValue.substring(0, -1)
          : getisAutofilledValue;
        setTextValue(val);
        state?.setValue(val);
      }
    }, [getisAutofilledValue, query?.mode, formField?.interfaceOptions?.isAutoFilled]);

    /* Cleanup debounce */
    useEffect(() => {
      return () => {
        debouncedChange.cancel();
      };
    }, [debouncedChange]);

    const simpleNumberInputRef = useRef<HTMLInputElement>(null);
    const EnableQuestionField = useEnableQuestionField(formField);
    const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
    const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

    if (!state?.fieldOptions.enable) return <></>;


    const simpleChangeHandler = (value: any, isSparkIconClick?: boolean) => {
      hasUserTyped.current = true;
      setTextValue(value);
      checkInputData(value);
      debouncedChange(value, isSparkIconClick);
    };

    const onBlurHandler = (e: any) => {
      let val = e.target.value;
      if (formField.type === "percentage" && val) {
        val = String(val).replace(/^0+(?=\d)/, "");
        setTextValue(val);
      } else {
        setTextValue(val);
      }
    };

    const prefixValue = formField?.interfaceOptions?.prefix;
    const isIndianCurrencyForTooltip =
      prefixValue == "undefined" || prefixValue == "INR";

    let Words: any = "";
    if (getTextValue !== "") {
      let isIndianCurrency = isIndianCurrencyForTooltip;
      if (
        formField.type === "text-with-prefix" &&
        formField?.interfaceOptions?.prefix &&
        String(getTextValue).includes(formField?.interfaceOptions?.prefix)
      ) {
        let amount = String(getTextValue).substring(
          formField?.interfaceOptions?.prefix.length,
        );
        if (validTypes.includes(formField.type)) {
          Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
            ? ""
            : numberToWordsUSD(
                parseFloat(amount?.replace(/,/g, "") || "0"),
                isIndianCurrency,
                formField.type,
              );
        }
      } else if (
        formField.type == "currency-with-comma" ||
        formField.type == "text-with-prefix" ||
        formField.type === "currency-number"
      ) {
        Words = checkIfNumZeroOrMoreThan10Quad(String(getTextValue) || "")
          ? ""
          : numberToWordsUSD(
              parseFloat(String(getTextValue)?.replace(/,/g, "") || "0"),
              isIndianCurrency,
              formField.type,
            );
      }
    }

    const phoneNumberMask = (rawValue: any) => {
      return rawValue
        .split("")
        .map((char: any) => {
          if (/\d/.test(char)) return /\d/; // Allow digits
          if (/[()+]/.test(char)) return char; // Allow +, (, and )
          if (/[-.\s]/.test(char)) return char; // Allow -, ., and spaces
          return false; // Disallow all other characters
        })
        .filter(Boolean); // Filter out disallowed characters
    };

    if (!name) return <></>;
    
    let mask: any[] = [];
    switch (formField.type) {
      case "number":
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: "",
          allowDecimal: false,
          allowLeadingZeroes: true,
        });
        break;
      case "year":
        mask = year;
        break;
      case "mobile":
        mask = mobileNumber;
        break;
      case "date":
        mask = Date;
        break;
      case "postalCode":
        mask = INDPostalCode;
        break;
      case "month_year":
        mask = Month_year;
        break;
      case "decimal-number":
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: "",
          allowDecimal: true,
          allowLeadingZeroes: true,
          decimalLimit: Number(formField.interfaceOptions?.decimalLimit ?? 20),
        });
        break;
      case "currency-number":
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: "",
          allowDecimal: true,
          allowLeadingZeroes: true,
          integerLimit: 16,
        });
        break;
      case "text-with-prefix":
        mask = createNumberMask({
          prefix: formField.interfaceOptions?.prefix || "",
          suffix: "",
          thousandsSeparatorSymbol: ",",
          allowDecimal: true,
          allowLeadingZeroes: true,
          integerLimit: 16,
        });
        break;
      case "percentage":
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: "",
          allowDecimal: true,
          allowLeadingZeroes: true,
        });
        break;
      case "currency-with-comma":
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: ",",
          allowDecimal: false,
          allowLeadingZeroes: true,
        });
        break;
      default:
        mask = createNumberMask({
          prefix: "",
          suffix: "",
          thousandsSeparatorSymbol: "",
          allowDecimal: false,
          allowLeadingZeroes: true,
        });
        break;
    }

    let recommedationData: any = [];
    const isViewMode = query?.mode === FormMode.View;
    if (
      isViewMode &&
      formField?.recommendationCalc?.recommendation !== undefined
    ) {
      const StoreAnswer: any = useFormFieldStore.getState().answer;
      recommedationData = jsonata(
        formField?.recommendationCalc?.recommendation,
      ).evaluate(StoreAnswer);
    }
    return (
      <Stack
        spacing="sm"
        style={pointerEventsStyle}
      >
        {formField.interfaceOptions.showLabel && (
          <DisplayLabel
            isHeading={!!formField.interfaceOptions.isHeading}
            headingSize={formField.interfaceOptions.headingSize}
            subtitle={formField.interfaceOptions.subtitle}
            showassigner={showassigner}
          />
        )}
        {!!formField.interfaceOptions?.showTitleDivider && (
          <Divider size={"md"} color="orange" />
        )}
        <Flex
          justify="space-between"
          align="center"
          wrap="nowrap"
          gap="xs"
          className="Recommandation-icon-group"
        >
          <Stack sx={{ flex: 1 }} spacing={0}>
            <MaskedInput
              mask={
                formField.type === "global-phone-number"
                  ? phoneNumberMask
                  : mask
              }
              placeholder={formField.interfaceOptions?.placeholder}
              guide={false}
              showMask={false}
              render={(ref, props) => (
                <>
                  <Tooltip
                    position="top-start"
                    disabled={
                      !!formField.interfaceOptions?.isToolTip
                        ? getTextValue === "" || getTextValue === null
                          ? true
                          : false
                        : true
                    }
                    multiline
                    opened={isTooltipOn || inputFocussed}
                    label={
                      !!formField.interfaceOptions?.isToolTip
                        ? formField.type == "currency-number" ||
                          formField.type == "currency-with-comma"
                          ? checkIfNumZeroOrMoreThan10Quad(
                              String(getTextValue) || "",
                            )
                            ? ""
                            : numberToWordsUSD(
                                parseFloat(
                                  getTextValue?.replace(/,/g, "") || "0",
                                ),
                                isIndianCurrencyForTooltip,
                                formField.type,
                              )
                          : getTextValue
                        : ""
                    }
                  >
                    <TextInput
                      maxLength={formField.interfaceOptions.maxLength}
                      autoComplete="off"
                      placeholder={formField.interfaceOptions?.placeholder}
                      error={validationErrorMessage(
                        formField.fieldOptions?.required,
                        state?.value,
                        "string",
                        setErrorMessagedetails,
                        formField.validationRules ?? "",
                      )}
                      disabled={formField.fieldOptions?.readonly || isDisabled}
                      readOnly={query?.mode === FormMode.View}
                      withAsterisk={formField.fieldOptions?.required}
                      classNames={{
                        label: "labelStyle",
                        error: "mantine-TextInput-error",
                        input: "tableTextAreaStyles",
                      }}
                      value={getTextValue}
                      onFocus={() => setInputFocussed(true)}
                      onBlur={(e) => {
                        setInputFocussed(false);
                        onBlurHandler(e);
                      }}
                      onMouseEnter={() => setIsTooltipOn(true)}
                      onMouseLeave={() => setIsTooltipOn(false)}
                      onWheel={(event) => event.currentTarget.blur()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const compareValue = Number(
                          String(e.target.value).replace(/,/g, ""),
                        );
                        let isNumberValidate = false;

                        if (formField.type !== "global-phone-number") {
                          const regex = /^[0-9.,]*$/;
                          if (
                            regex.test(e.target.value) ||
                            e.target.value === ""
                          ) {
                            const maxValue =
                              formField.interfaceOptions?.maxValue || null;
                            if (!!maxValue && !isNaN(compareValue)) {
                              if (Number(maxValue) < compareValue)
                                isNumberValidate = true;
                            }
                            const minValue =
                              formField.interfaceOptions?.minValue || null;
                            if (!!minValue && !isNaN(compareValue)) {
                              if (Number(minValue) > compareValue)
                                isNumberValidate = true;
                            }
                            if (!isNumberValidate)
                              simpleChangeHandler(e.target.value);
                          }
                        } else {
                          const maxValue =
                            formField.interfaceOptions?.maxValue || null;
                          if (!!maxValue && !isNaN(compareValue)) {
                            if (Number(maxValue) < compareValue)
                              isNumberValidate = true;
                          }
                          const minValue =
                            formField.interfaceOptions?.minValue || null;
                          if (!!minValue && !isNaN(compareValue)) {
                            if (Number(minValue) > compareValue)
                              isNumberValidate = true;
                          }
                          if (!isNumberValidate)
                            simpleChangeHandler(e.target.value);
                        }
                      }}
                      ref={ref as any}
                      {...(() => {
                        const { onChange: _, onBlur: __, ...rest } = props;
                        return rest;
                      })()}
                    />
                  </Tooltip>
                  {(formField.type == "currency-number" ||
                    formField.type == "currency-with-comma" ||
                    formField.type == "text-with-prefix" ||
                    formField.type == "percentage") && (
                    <p
                      style={{
                        color: "#eeb806",
                        fontSize: "13px",
                        width: "100%",
                        lineHeight: "28px",
                        marginBottom: 0,
                      }}
                    >
                      {Words}
                    </p>
                  )}
                </>
              )}
            />
          </Stack>
          {FormHasRecommendation?.length === 0 &&
          recommedationData.length > 0 &&
          recommedationData.some((item: any) => item.value === state?.value) && (
            <CommonRecommendation
              recommText={
                recommedationData.filter(
                  (item: any) => item.value === state?.value,
                )[0].comment
              }
            />
          )}
        </Flex>
      </Stack>
    );
  },
  (prev: any, next: any) => prev.value === next.value,
);

const NumberInputFieldWrapper: FormFieldControl = (props) =>
  props.isSimple ? (
    <SimpleNumberInputField {...(props as any)} />
  ) : (
    <NumberInputField {...props} />
  );

export default memo(
  NumberInputFieldWrapper,
  (prev: any, next: any) =>
    !!prev.formField === !!next.formField && prev.value === next.value,
);