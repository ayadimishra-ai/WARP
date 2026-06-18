import {
  ActionIcon,
  Anchor,
  Box,
  Divider,
  FileInput,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { MIME_TYPES } from "@mantine/dropzone";
import { IconPencil, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import { useBulk_Update_Document_LogFilesMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-document-logFiles";
import { useGetCompanyDetailByIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetDocumentLogsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-document-logs";
import { useRaraCompanyAccessQuery } from "@/modules/warp/packages/graphql/queries/generated/get-rara-features-access-companyid";
import { useGetSourceDataByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-sourcedata-by-invitationId";
import {
  AICArouselData,
  DOCUMENT_VALIDATION_TYPES,
  DocumentLogsStatus,
  FormMode,
  blankCheck,
  multipleFileUploadClick
} from "@/modules/warp/packages/shared/constants/app.constants";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";
import axios from "axios";

import { cloneDeep } from "lodash";
import { useParams, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormFieldRender } from "..";
import { useFromFileUpload } from "../../../hooks/use-form-file-upload";
import UploadFileSvgIcon from "../../../icons/FileUploadIcon";
import SampleFileIcon from "../../../icons/SampleFileIcon";
import {
  raraGetTokenDetails,
  uploadFilesPopup,
} from "../../../services/platform-window-message.service";
import {
  getAISuggestionCarouselforFileData,
  isUserAllowedAIFeature,
  urlToFile,
} from "../common-functions";
import { convertInterfaceValueToString } from "../converter";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { usePointerEvents } from "../hooks/usePointerEvents";
import { useReviewerContext } from "../reviewer-context";
import {
  getChildFieldStateName,
  getChildFieldStateValue,
  getJsonataExpression,
  setChildFieldState,
  useChildFieldState,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
  useRatingValidationStore,
  useWarningMessageStore
} from "../store";
import { FormFieldControl } from "../types";
import {
  FilevalidationErrorMessage,
  validationErrorMessage,
} from "../validation.service";
import AddRecommendationButton from "./AddRecommendation";
import CommonRecommendation from "./CommonRecommendation";
import CommonTable from "./CommonTable";
import DisplayLabel from "./DisplayLabel";
let setErrorMessagedetails: any = false;
let errmsg: any = [];
// Tracks which FileField instance most recently opened the popup.
// Used to prevent sibling rows (sharing the same formField.id) from all
// responding to the same BroadcastChannel response message.
let lastOpenedInstanceId: string | null = null;

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const FileField: FormFieldControl = memo(
  ({ formField, isSimple, name: childFieldName, rowIndex, ansId, onChange }) => {
    let documentName = formField.interfaceOptions?.rara?.documentName;
    let isValidDate = formField.interfaceOptions?.rara?.isValidDate || false;
    const userSession = useUserSession();
    const query = useParams<{ invitationId: string; mode: string }>();
    const searchParams = useSearchParams();
    const accessToken = searchParams?.get("accessToken") ?? undefined;
    const state = useFormFieldControl<"file">(formField);

    // Per-row state isolation for child-field usage (e.g. inside MultiSelectRow).
    // Must be called unconditionally (hooks rule); only used when isChildField=true.
    const childState = useChildFieldState(
      childFieldName ?? `${formField.field}_self_0`,
      formField,
      rowIndex,
      ansId,
    );
    const isChildField = isSimple && !!childFieldName;

    // Unique ID for this component instance — used to identify which row opened the popup.
    const instanceIdRef = useRef(
      `file-${formField.id}-${Math.random().toString(36).substring(2, 9)}`,
    );

    // Routes value writes to per-row child state (child mode) or global answer (standalone mode).
    const setFieldValue = useCallback(
      (newValue: any) => {
        if (isChildField) {
          childState?.setValue(newValue);
          onChange?.(newValue);
        } else {
          state.setValue(formField.id, newValue);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isChildField, childState, onChange, state.setValue, formField.id],
    );

    const {
      isReviewer, 
      isMaker,
      reviewerStatusMap,
    } = useReviewerContext();
    const isViewRecommendation = query?.mode === FormMode.ViewRecommendation;
    const isCarryForward = !!useFormFieldStore.getState().isCarryForward;



    const statusEntry = useMemo(() => {
      const entry = reviewerStatusMap.get(formField?.questionId || "");
      if (entry?.remark === "Answered by Maker") return undefined;
      return entry;
    }, [reviewerStatusMap, formField.questionId]);
    setErrorMessagedetails = state.setErrorMessage;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File | File[] | null>(null);
    const [temporaryFiles, setTemporaryFiles] = useState<
      multipleFileUploadClick[]
    >([]);
    const Rating: any = useRatingValidationStore(
      (store) => store.RatingValidation,
    );
    const [clickedFileIds, setClickedFileIds] = useState<
      multipleFileUploadClick[]
    >([]);
    const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
      (x: any) => x.type === "Recommendation_new",
    );
    const raraCompanyId: any = userSession?.GlobalMaster?.filter(
      (x: any) => x.type === "RaraIntegrationAccess",
    );

    const { data: raraCompanies } = useRaraCompanyAccessQuery({
      variables: {
        companyIdList: raraCompanyId[0]?.data[0]?.companyId,
        companyId: userSession?.company?.id,
      },
    });
    let companyId: any = raraCompanies?.ParentCompanyMapping?.filter(
      (rec: any) => rec.CompanyId === userSession?.company?.id,
    )[0]?.CompanyId;

    const { data: companyDetails } = useGetCompanyDetailByIdQuery({
      variables: {
        id: userSession?.company?.id,
      },
    });
    const { data: pageLoadSourceFileData } =
      useGetSourceDataByInvitationIdQuery({
        variables: {
          invitationId: query?.invitationId,
        },
      });
    let raraCompanyName = companyDetails?.Company[0]?.name;
    // localStorage.setItem("companyId", companyId)
    const currentRating = Rating?.RaraValidationAndRating?.filter(
      (item: any) => item.formFieldId === formField.id,
    );
    let FormHasRecommendation: any =
      recommendationNewResponce?.GlobalMaster?.length > 0
        ? recommendationNewResponce?.GlobalMaster[0]?.data.filter(
            (rec: any) => rec.FormId === formField?.formId,
          )
        : [];

    type typeGetTokendetails = {
      token?: string;
      serviceURL?: string;
    };

    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const [editId, setEditId] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { uploadFile } = useFromFileUpload();
    const [fileerror, setfileerror] = useState("");
    const [getTokendetails, setTokendetails] = useState<typeGetTokendetails>(
      {},
    );
    const [popupTitle, setPopupTitle] = useState("");

    const childFields = formField.children?.map((m: any) => m.field) ?? [];
    const hasAdditinalData = !!childFields.length;
    const answerFiles = useMemo(() => {
      const val = isChildField ? childState?.value : state.value;
      return Array.isArray(val) ? val : [] as any[];
    }, [isChildField, childState?.value, state.value]);

    // console.log("AnswerFiles", answerFiles);
    const removeWarning = useWarningMessageStore(
      (store) => store.removeWarningRuleFields,
    );

    // Data queries
    const {
      data: documentLogsData,
      loading: documentLogsLoading,
      error,
      refetch: refetchDocumentLogs,
    } = useGetDocumentLogsQuery({
      variables: {
        where: {
          companyId: { _eq: companyId },
          status: {
            _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed],
          },
        },
      },
    });

    const [updateDocumentLogFiles] = useBulk_Update_Document_LogFilesMutation();

    useEffect(() => {
      const isAIUser = isUserAllowedAIFeature(accessToken as string);
      const allowMultiple = formField.interfaceOptions?.allowMultiple || false;
      let title;
      if (isAIUser) {
        if (allowMultiple) {
          title = "AI & Other Uploaded Documents";
        } else {
          title = "AI & Other Uploaded Document";
        }
      } else {
        if (allowMultiple) {
          title = "Upload Documents";
        } else {
          title = "Upload Document";
        }
      }
      setPopupTitle(title);
    }, [accessToken, formField.interfaceOptions?.allowMultiple]);

    const inputRef = useRef<HTMLButtonElement>(null);
    const clearFields = useCallback(() => {
      formField.children?.map((field: any) =>
        setChildFieldState(formField, field, undefined),
      );
      setEditId(null);
      setUploadedFiles([]);
      setFiles(null);
      setfileerror("");
      setClickedFileIds([]);
    }, [formField]);

    const buildAnswerFileObj = useCallback(
      (_id: number, files: any[]) => {
        let newFile: any = { value: files };
        newFile = formField.children?.reduce((acc: any, curr: any) => {
          acc["_id"] = _id;
          acc[curr.field] = {
            value: getChildFieldStateValue(formField, curr),
          };
          return acc;
        }, newFile);
        return newFile;
      },
      [formField],
    );

    const uploadFiles = useCallback(
      async (id: string, file: File) => {
        if (loading) return;

        setLoading(true);
        try {
          const fileResult = await uploadFile(file, false, "");
          if (fileResult) {
            setUploadedFiles([fileResult]);

            // Update clicked files state
            if (id) {
              setClickedFileIds((prev) =>
                prev
                  .filter((item) => item.sourceId !== id)
                  .concat([
                    {
                      sourceId: id,
                      filepath: fileResult.path,
                    },
                  ]),
              );
            }
          }
        } catch (error) {
          console.error("File upload error:", error);
          setfileerror("Failed to upload file. Please try again.");
        } finally {
          setLoading(false);
          setFiles(null);
        }
      },
      [loading, uploadFile],
    );

    const saveFiles = useCallback(async () => {
      if (!uploadedFiles.length) return;
      let newAnswer: any[] = [];


      if (editId) {
        newAnswer = answerFiles.map((file) => {
          if (file._id === editId) {
            return buildAnswerFileObj(editId, uploadedFiles);
          }
          return file;
        });
        // console.log({ newAnswer });
      } else {
        const newFile = buildAnswerFileObj(
          answerFiles.length + 1,
          uploadedFiles,
        );
        //Document validation and expiry date extraction API integration---- start --------------
        // Key change: Removed strict RARA configuration requirement to enable expiry date extraction
        // Now calls the API for PDF files if either RARA validation OR expiry extraction is needed
        if (companyId) {
          // Determine if we need to call RARA API for any reason
          const hasRaraConfig =
            formField.interfaceOptions.hasOwnProperty("rara");
          const isDocumentValidityCheckEnabled =
            companyDetails?.Company?.[0]?.metadata
              ?.isDocumentValidityCheckEnabled === true;

          // Only proceed if either RARA validation or expiry extraction is needed
          if (hasRaraConfig || isDocumentValidityCheckEnabled) {
            let validationApiResponse: any;
            setLoading(true);

            // Build dynamic validations array based on requirements
            const validationsToCheck: string[] = [];

            // Determine company-wide document validation flag. Prefer new flag `isDocumentValidationEnabled`,
            // fallback to older `isDocumentValidityCheckEnabled` for backwards compatibility.
            const isDocumentValidationEnabled =
              companyDetails?.Company?.[0]?.metadata
                ?.isDocumentValidationEnabled ?? false;

            // RARA validation: Only add soft validation checks (company name & document name)
            // if the form field has RARA configuration AND the company's document validation flag is enabled.
            if (isDocumentValidationEnabled) {
              // If document validation is enabled, always validate company name
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_COMPANY_NAME
              );
            }

            // If both document validation is enabled AND RARA config is present, validate document name
            if (isDocumentValidationEnabled && hasRaraConfig) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_DOCUMENT_NAME
              );
            }

            // Expiry date extraction: Always extract if company has document validity check enabled
            // This allows expiry date extraction even without RARA configuration
            if (isDocumentValidityCheckEnabled) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.EXTRACT_EXPIRY_DATE,
              );
            }

            // Date validation: Only validate dates if RARA is configured and date validation is enabled
            if (hasRaraConfig && isValidDate) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_GIVEN_DATE,
              );
            }

            // Build the API payload - flexible to handle both RARA validation and expiry extraction
            const data = JSON.stringify({
              document_url: uploadedFiles[0].path,
              validations_to_check: validationsToCheck,
              company_name: raraCompanyName,
              // Document name: Use RARA config if available, otherwise use original file name
              document_name: hasRaraConfig
                ? documentName
                : uploadedFiles[0].name,
              parent_companies: [],
            });
            const config = {

              headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json",
              },
            };

            // Only call the RARA API if there are validations to check
            if (validationsToCheck.length > 0) {
              // Call the RARA API - now serves dual purpose: validation + expiry extraction
              validationApiResponse = await axios
                .post(
                  "/warp/api/rara/document-validation-comprehensive",
                  data,
                  config,
                )
                .then((res) => {
                  return res;
                })
                .catch((err) => {
                  return err;
                });
            }
            console.log({
              "validationApiResponse Outer": validationApiResponse,
            });
            if (
              !!validationApiResponse?.error ||
              validationApiResponse?.data === ""
            ) {
              console.log({
                "validationApiResponse error": validationApiResponse,
              });
              // Handle error response - only show error if RARA validation was requested
              setLoading(false);
              if (hasRaraConfig) {
                setfileerror(
                  "Please upload a PDF file. Invalid file format detected.",
                );
                setTimeout(() => {
                  setfileerror("");
                  clearFields();
                }, 7000);
                newAnswer = [...answerFiles];
                setFieldValue(newAnswer);
              } else {
                // For expiry-only extraction, continue with file processing even if API fails
                newAnswer = [...answerFiles, newFile];
                setFieldValue(newAnswer);
                clearFields();
              }
            } else {
              console.log({
                "validationApiResponse success": validationApiResponse,
              });
              setLoading(false);

              // Only process validation errors if RARA validation was requested
              // Expiry-only extractions should not trigger validation error messages
              if (
                hasRaraConfig &&
                validationApiResponse?.data?.valid
                  ?.toString()
                  ?.toLowerCase() === "false"
              ) {
                // In case of RARA validation failure
                // Only show validation errors and explanations when RARA validation was requested
                try {
                  let currentDate = new Date();
                  newFile.value[0].explanation =
                    validationApiResponse?.data?.explanation;
                  newFile.value[0].fileId = currentDate.getTime();
                  newFile.value[0].validation = false;

                  // Always extract and store expiry date if present - even on RARA validation failure
                  // This ensures we get expiry dates regardless of document validation results
                  if (
                    validationApiResponse?.data?.expiry_date ||
                    validationApiResponse?.data?.data?.expiry_date
                  ) {
                    const extractedExpiryDate =
                      validationApiResponse.data.expiry_date ||
                      validationApiResponse.data.data.expiry_date;

                    // Update DocumentLogs if selectedDocumentLogId is present
                    if (newFile.value[0].selectedDocumentLogId) {
                      updateDocumentLogFiles({
                        variables: {
                          deletes: [] as any[],
                          updates: [
                            {
                              where: {
                                id: {
                                  _eq: newFile.value[0].selectedDocumentLogId,
                                },
                              },
                              _set: { expiryDate: extractedExpiryDate },
                            },
                          ],
                        },
                      }).catch((error) => {
                        console.error(
                          "Error updating DocumentLogs with expiry date:",
                          error,
                        );
                      });
                    }
                  }

                  newAnswer = [...answerFiles, newFile];
                  let warningListdata = cloneDeep(
                    useWarningMessageStore.getState().WarningRuleFields,
                  );
                  warningListdata.push({
                    isWarningRule: true,
                    formfieldid: formField.id,
                    ispopupmessageremoved: false,
                    questionid: formField.Question?.id,
                    warningmessage: validationApiResponse?.data?.explanation,
                    isFileUpload: true,
                    fileId: newFile.value[0].fileId.toString(),
                    invitationId: query?.invitationId as string, // Add invitation context
                  });
                  useWarningMessageStore.setState({
                    WarningRuleFields: warningListdata,
                  });
                  setFieldValue(newAnswer);
                  clearFields();
                } catch (error) {
                  console.log({ error: error });
                }
              } else {
                // In case of validation success OR expiry-only extraction
                let currentDate = new Date();
                newFile.value[0].fileId = currentDate.getTime();

                // Always extract and store expiry date if present - regardless of validation result
                // This ensures we get expiry dates even when RARA validation fails or isn't configured
                if (
                  validationApiResponse?.data?.expiry_date ||
                  validationApiResponse?.data?.data?.expiry_date
                ) {
                  const extractedExpiryDate =
                    validationApiResponse.data.expiry_date ||
                    validationApiResponse.data.data.expiry_date;
                  newFile.value[0].expiryDate = extractedExpiryDate;

                  // Update DocumentLogs if selectedDocumentLogId is present
                  if (newFile.value[0].selectedDocumentLogId) {
                    updateDocumentLogFiles({
                      variables: {
                        deletes: [] as any[],
                        updates: [

                          {
                            where: {
                              id: {
                                _eq: newFile.value[0].selectedDocumentLogId,
                              },
                            },
                            _set: { expiryDate: extractedExpiryDate },
                          },
                        ],
                      },
                    }).catch((error) => {
                      console.error(
                        "Error updating DocumentLogs with expiry date:",
                        error,
                      );
                    });
                  }
                }

                newAnswer = [...answerFiles, newFile];
                setFieldValue(newAnswer);
                clearFields();
              }
            }
          }
        } else {
          newAnswer = [...answerFiles, newFile];
          setFieldValue(newAnswer);
          clearFields();
        }
      }
    }, [
      uploadedFiles,
      editId,
      answerFiles,
      buildAnswerFileObj,
      companyId,
      formField,
      companyDetails,
      isValidDate,
      raraCompanyName,
      accessToken,
      documentName,
      setFieldValue,
      clearFields,
      updateDocumentLogFiles,
      query?.invitationId,
    ]);

    useEffect(() => {
      if (!getTokendetails.hasOwnProperty("token")) {
        postParentMessage(raraGetTokenDetails());
      }
      const handleMessage = async (event: any) => {
        event.preventDefault();
        let messageData: any;
        let dataType = typeof event.data;

        if (dataType === "string") {
          try {
            messageData = JSON.parse(event.data);
            const type = messageData.type;
            if (type === "snowkap-tokendetails") {
              setTokendetails({
                token: messageData.token,
                serviceURL: messageData.serviceurl,
              });
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      };

      globalThis.addEventListener("message", handleMessage);

      // Cleanup function to remove event listener
      return () => {
        globalThis.removeEventListener("message", handleMessage);
      };
    }, [getTokendetails, formField.id, state, clearFields]);

    // Single BroadcastChannel effect - REMOVE THE DUPLICATE
    useEffect(() => {
      let bc: BroadcastChannel | null = null;
      const handleBCMessage = (ev: MessageEvent) => {
        const messageData = ev.data;
        let payload = messageData;
        if (typeof messageData === "string") {
          try {
            payload = JSON.parse(messageData);
          } catch (e) {
            console.error("Invalid BC string payload", e);
            return;
          }
        }

        if (payload?.type === "add-files-directly-to-answer") {
          const currentInvitationId = query?.invitationId as string;
          const messageInvitationId = payload.data?.invitationId;

          if (
            messageInvitationId &&
            messageInvitationId !== currentInvitationId
          ) {
            return;
          }

          if (payload.data?.formFieldId === formField.id) {
            // Child fields (MultiSelectRow rows) share the same formFieldId.
            // Only the row that opened the popup should handle the response.
            const isOwner =
              !isChildField ||
              lastOpenedInstanceId === instanceIdRef.current;
            if (isOwner) {
              if (isChildField) lastOpenedInstanceId = null;

              const newAnswerFiles = payload.data.answerFiles;
              const updatedAnswerFiles =
                formField.interfaceOptions?.allowMultiple
                  ? [...answerFiles, ...newAnswerFiles]
                  : [...newAnswerFiles];

              setFieldValue(updatedAnswerFiles);
              clearFields();
            }
          }

          const warningData = payload.data.raraWarningMessages[0];
          if (warningData?.formfieldid === formField.id) {
            const currentInvitationId = query?.invitationId as string;
            let warningListdata = cloneDeep(
              useWarningMessageStore.getState().WarningRuleFields,
            );
            warningListdata = warningListdata.filter(
              (warning) =>
                !(
                  warning.formfieldid === warningData.formfieldid &&
                  warning.fileId === warningData.fileId &&
                  warning.invitationId === currentInvitationId
                ),
            );
            warningListdata.push({
              isWarningRule: warningData.isWarningRule,
              formfieldid: warningData.formfieldid,
              ispopupmessageremoved: warningData.ispopupmessageremoved,
              questionid: warningData.questionid,
              warningmessage: warningData.warningmessage,
              isFileUpload: warningData.isFileUpload,
              fileId: warningData.fileId,
              invitationId: currentInvitationId,
            });
            useWarningMessageStore.setState({
              WarningRuleFields: warningListdata,
            });
          }
        }
      };

      try {
        bc = new BroadcastChannel("warp-upload-files");
        bc.addEventListener("message", handleBCMessage);
      } catch (err) {
        console.warn("BroadcastChannel not supported");
      }

      return () => {
        if (bc) {
          bc.removeEventListener("message", handleBCMessage);
          bc.close();
        }
      };
    }, [
      formField.id,
      isChildField,
      answerFiles,
      setFieldValue,
      clearFields,
      formField.interfaceOptions?.allowMultiple,
      query?.invitationId,
    ]);

    const editHandler = (file: any) => () => {
      // console.log(file);

      if (!file) return;

      setEditId(file._id);
      const { value, _id, ...rest } = file;
      if (value) setUploadedFiles(value);
      if (rest) {
        formField.children?.forEach((childField: any) =>
          setChildFieldState(
            formField,
            childField,
            rest[childField.field].value,
          ),
        );
      }
    };

    const removeFileItemFromList = (file: any) => () => {
      if (!answerFiles.length) return;
      const newValue = answerFiles.filter((m) => m !== file);
      setFieldValue(newValue);
      let fileId = file.value[0]?.fileId ?? file?.fileId;
      if (!!file) {
        let removeSource = clickedFileIds;
        file?.value.forEach((fileItem: any) => {
          removeSource = clickedFileIds.filter(
            (items) => items?.filepath !== fileItem.path,
          );
        });
        setClickedFileIds(removeSource);
      }
      if (!!fileId) {
        const currentInvitationId = query?.invitationId as string;
        let warningList = useWarningMessageStore.getState().WarningRuleFields;
        // Filter warnings by formfieldid, fileId AND invitationId
        let warningArray = warningList.filter(
          (z) =>
            !(
              z.formfieldid === formField.id &&
              z.fileId === fileId &&
              z.invitationId === currentInvitationId
            ),
        );
        let isEmpty = warningArray.length == 0 ? true : false;
        if (isEmpty) {
          removeWarning();
        } else {
          useWarningMessageStore.setState({
            WarningRuleFields: warningArray,
          });
        }
      }
    };

    const accept = Array.isArray(state.interfaceOptions?.accept)
      ? state.interfaceOptions?.accept.join(",")
      : undefined;
    const displayFormats: string[] = [];
    if (Array.isArray(state.interfaceOptions?.accept)) {
      state.interfaceOptions?.accept.forEach((items) => {
        if (items.includes(",")) {
          items.split(",").forEach((commaItem) => {
            const extension = Object.entries(MIME_TYPES).filter(
              ([key, value]) => value == commaItem.trim(),
            );
            if (extension.length > 0) {
              displayFormats.push("." + extension[0][0]);
            }
          });
        } else {
          const extension = Object.entries(MIME_TYPES).filter(
            ([key, value]) => value == items.trim(),
          );
          if (extension.length > 0) {
            displayFormats.push("." + extension[0][0]);
          }
        }
      });
    }
    const acceptedFormats =
      displayFormats.length > 0 ? displayFormats.join(", ") : undefined;

    const EnableQuestionField = useEnableQuestionField(formField);
    const pointerEventsStyle = usePointerEvents(formField.questionId, EnableQuestionField);
    const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

    const [recommedationData, setRecommedationData] = useState<any[]>([]);
    const isFormSubmitted = useFormFieldStore.getState().isFormSubmitted;
    const isViewMode = query?.mode === FormMode.View;
    const isReview = query?.mode === FormMode.Review;

    useEffect(() => {
      if (
        isViewMode &&
        formField?.recommendationCalc?.recommendation !== undefined &&
        isFormSubmitted
      ) {
        const StoreAnswer: any = useFormFieldStore.getState().answer;
        const fetchRecommendation = async () => {
          try {
          const expression = getJsonataExpression(formField?.recommendationCalc?.recommendation);
          const data = expression ? await expression.evaluate(StoreAnswer) : null;
            setRecommedationData(Array.isArray(data) ? data : (data ? [data] : []));
          } catch (error) {
            console.error("Error evaluating recommendation JSONata in File:", error);
          }
        };
        fetchRecommendation();
      }
    }, [isViewMode, isFormSubmitted, formField?.recommendationCalc?.recommendation]);

    useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);
    if (!state.fieldOptions.enable) return <></>;

    // console.log("render", "File", formField.field);
    const showassigner =
      formField?.groupField?.indexOf("tabs") > -1 ? "Show" : "";

    const RatingTable = ({ value }: { value: any }) => {
      let data = convertKeysToLowerCase(value);
      // if (data?.error) {
      //   return <p>{data?.error}</p>
      // }
      let recommendationsLength = 0;
      if (data && data["recommendations"]) {
        recommendationsLength = data["recommendations"].length;
      }
      let rating =
        Object.keys(data)
          .filter((z) => typeof data[z] === "number")
          .flatMap((v) => {
            if (typeof data[v] === "number") {
              return data[v];
            }
          }).length > 0
          ? Object.keys(data)
              .filter((z) => typeof data[z] === "number")
              .flatMap((v) => {
                if (typeof data[v] === "number") {
                  return data[v];
                }
              })[0]
          : "";
      let reason =
        Object.keys(data)
          .filter((z) => typeof data[z] === "string" && z.includes("reason"))
          .flatMap((v) => data[v]).length > 0
          ? Object.keys(data)
              .filter(
                (z) => typeof data[z] === "string" && z.includes("reason"),
              )
              .flatMap((v) => data[v])[0]
          : "";
      if (rating != "" || reason != "") {
        return (
          <Box bg={"#F1F1F1"} p={15}>
            <Group gap={0}>
              <Text fz={12} fw={700} c={"#666"}>
                Overall Rating:&nbsp;&nbsp;
                <Text fw={400} component="span">
                  {rating + "/5"}
                </Text>
              </Text>
              {/* <Tooltip
              multiline
              w={450}
              arrowOffset={10}
              offset={-3}
              arrowSize={4}
              label={reason}
              position="bottom-start"
              withArrow
            >
              <ActionIcon
                p={0}
                style={{ pointerEvents: "auto" }}
                variant="transparent"
              >
                <InfoIcon />
              </ActionIcon>
            </Tooltip> */}
            </Group>
            <Text fz={12} fw={700} mt={15} c={"#666"}>
              Reason for Rating &nbsp;<i>(AI Generated)</i> :
            </Text>
            <Text fz={12} c="#666">
              {reason}
            </Text>
            {recommendationsLength !== 0 ? (
              <>
                <Text fz={12} fw={700} mt={15} c={"#666"}>
                  Recommendations / What&#39;s Missing &nbsp;
                  <i>(AI Generated)</i> :
                </Text>
                <ul
                  style={{
                    fontSize: 12,
                    paddingLeft: 20,
                    color: "#666",
                    margin: 0,
                  }}
                >
                  {data["recommendations"]?.map((row: any, i: number) => {
                    return <li key={i}>{row}</li>;
                  })}

                </ul>{" "}
              </>
            ) : (
              <></>
            )}
          </Box>
        );
      } else {
        return (
          <p>{"Invalid Document. Please delete and re-upload the file"}</p>
        );
      }
    };
    function convertKeysToLowerCase(obj: any): any {
      const newObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key.toLowerCase()] = obj[key];
        }
      }
      return newObj;
    }
    //#region Carousel Data Binding
    let AISuggestionCarouseldata: AICArouselData[] = [];
    if (
      !!pageLoadSourceFileData &&
      pageLoadSourceFileData?.Sources.length > 0
    ) {
      AISuggestionCarouseldata = getAISuggestionCarouselforFileData(
        pageLoadSourceFileData?.Sources,
        formField?.id,
      );
    }
    //#endregion
    const onFileChange = async (
      id: string,
      value: any,
      fileUrlDetails: Record<string, any>[],
      isFromAI: boolean,
      isFromPopUp: boolean,
      selectedData?: multipleFileUploadClick[],
    ) => {
      let fileDetails: any = value;
      if (isFromAI) {
        if (fileUrlDetails.length > 0) {
          fileDetails = await urlToFile(
            fileUrlDetails[0].fileurl,
            fileUrlDetails[0].fileName,
          );
          setTemporaryFiles([
            { sourceId: id, filepath: fileUrlDetails[0].fileurl },
          ]);
        } else {
          if (isFromPopUp) {
            const fileData = uploadedFiles.filter((items) =>
              selectedData?.some((item) => item.filepath == items.path),
            );
            const answerfileData = answerFiles.filter((items) =>
              selectedData?.some(
                (item) => item.filepath == items.value[0].path,
              ),
            );
            setFieldValue(answerfileData);
            setUploadedFiles(fileData);
            setClickedFileIds(selectedData as multipleFileUploadClick[]);
          } else {
            const sourceId = clickedFileIds.filter(
              (items) => items.sourceId == id,
            );
            if (sourceId.length > 0) {
              const removeStateData = answerFiles.filter(
                (items) => items.value[0].path != sourceId[0].filepath,
              );
              setFieldValue(removeStateData);
              setUploadedFiles(
                uploadedFiles.filter(
                  (items) => items.path != sourceId[0].filepath,
                ),
              );
              setClickedFileIds(
                clickedFileIds.filter((items) => items.sourceId != id),
              );
            }
          }
        }
      }
      const validateFile = accept?.includes(fileDetails?.type);
      if (!validateFile && !!fileDetails) {
        const fileerrors =
          !!accept && !!acceptedFormats
            ? "Invalid file type. Accepted formats are : " + acceptedFormats
            : "Invalid file type. Please upload a valid file type";
        setfileerror(fileerrors);
        return;
      } else if (!!fileDetails && fileDetails?.type === "") {
        const fileerrors =
          !!accept && !!acceptedFormats
            ? "Invalid file type. Accepted formats are : " + acceptedFormats
            : "Invalid file type. Please upload a valid file type";
        setfileerror(fileerrors);
        return;
      }
      // if (!!fileDetails) uploadFiles(fileDetails);
      const fileerrors = FilevalidationErrorMessage(fileDetails);
      setfileerror(fileerrors);

      if (fileerrors === "") {
        if (!!fileDetails) uploadFiles(id, fileDetails);
      } else {
        return fileerrors;
      }
    };

    return (
      <Stack pos={"relative"} style={pointerEventsStyle}>
        <LoadingOverlay
          overlayProps={{ color: "#F7F9FB" }}
          visible={loading}
          className="Loader-fileupload"
        />
        {!!formField.interfaceOptions?.showLabel && (
          <DisplayLabel
            text={state.fieldOptions?.label}
            infoIconProps={state.interfaceOptions?.infoIconProps}
            subtitle={state.interfaceOptions?.subtitle}
            showassigner={showassigner}
            formField={formField}
          />
        )}
        <Group justify="space-between">
          <Group align={fileerror.length <= 0 ? "end" : "flex-start"}>
            <Stack
              gap="sm"
              w={{ base: 270, sm: 300, lg: 370, xl: 400 }}
            >
              <>
                <FileInput
                  ref={inputRef}
                  classNames={{ input: "mantine-FileInput-input" }}
                  pl={formField.interfaceOptions?.subtitle ? 30 : 0}
                  withAsterisk={state.fieldOptions?.required}
                  disabled={state.fieldOptions?.readonly || isDisabled}
                  multiple={formField.interfaceOptions?.allowMultiple || false}
                  accept={accept}
                  rightSectionWidth={45}
                  error={validationErrorMessage(
                    state.fieldOptions?.required,
                    answerFiles,
                    "array",
                    setErrorMessagedetails,
                    formField.validationRules ?? "",
                  )}
                  onChange={(value: File | File[] | null) => {
                    if (!value) return;
                    setFiles(null);

                    setTimeout(() => {
                      const file = Array.isArray(value) ? value[0] : value;
                      const validateFile =
                        file.type.length === 0
                          ? false
                          : accept?.includes(file.type);
                      if (!validateFile) {
                        const filerror =
                          !!accept && !!acceptedFormats
                            ? "Invalid file type. Accepted formats are : " +
                              acceptedFormats
                            : "Invalid file type. Please upload a valid file type";
                        setfileerror(filerror);
                        setUploadedFiles([]);
                        return;
                      }
                      // if (!!file) uploadFiles(file);
                      const fileErrors = FilevalidationErrorMessage(file);
                      setfileerror(fileErrors);
                      setUploadedFiles([]);

                      if (!fileErrors) {
                        uploadFiles("", file);
                        setFiles(value);
                      }
                    }, 0);
                  }}
                  value={files}
                  rightSection={
                    !files && (
                      <UploadFileSvgIcon
                        width={30}
                        height={30}
                        onClick={() => inputRef.current?.click()}
                        style={{
                          cursor: "pointer",
                          pointerEvents: pointerEventsStyle,
                        }}
                      />
                    )
                  }
                  data-formfieldid={formField?.id}
                  onClick={() => {
                    lastOpenedInstanceId = instanceIdRef.current;
                    const filesForPopup = (answerFiles ?? []).flatMap(
                      (ans: any) =>
                        (ans.value ?? []).map((f: any) => ({
                          name: f.name,
                          selectedDocumentLogId: f.selectedDocumentLogId,
                        })),
                    );
                    // Check if there are system-generated files available in DocumentLogs OR already in answerFiles
                    const hasSystemGeneratedFilesInDocumentLogs =
                      documentLogsData &&
                      documentLogsData?.DocumentLogs?.some(
                        (log: any) => log.createdBy === null,
                      );

                    const hasSystemGeneratedFilesInAnswers = (
                      answerFiles ?? []
                    ).some((ans: any) =>
                      (ans.value ?? []).some(
                        (f: any) =>
                          !f.createdBy ||
                          f.createdBy === null ||
                          f.createdBy === "-",
                      ),
                    );
                    const hasSystemGeneratedFiles =
                      hasSystemGeneratedFilesInDocumentLogs ||
                      hasSystemGeneratedFilesInAnswers;

                    const isExpiredDocument = (answerFiles ?? []).some(
                      (ans: any) =>
                        (ans.value ?? []).some(
                          (f: any) =>
                            f.expiryDate &&
                            new Date(f.expiryDate) <= new Date(),
                        ),
                    );

                    // Check if document validity checking is enabled from company metadata
                    const isDocumentValidityCheckEnabled =
                      companyDetails?.Company?.[0]?.metadata
                        ?.isDocumentValidityCheckEnabled === true;

                    // Helper function to check for expired documents in DocumentLogs
                    const hasExpiredDocumentsInDocumentLogs = () => {
                      if (!documentLogsData?.DocumentLogs) return false;
                      return documentLogsData.DocumentLogs.some((log: any) => {
                        if (!log.expiryDate) return false;
                        // Parse date in YYYY-MM-DD format to avoid timezone issues
                        const expiryDate = new Date(
                          log.expiryDate + "T00:00:00.000Z",
                        );
                        const currentDate = new Date();
                        currentDate.setUTCHours(0, 0, 0, 0);
                        // Document is valid throughout the entire expiry date, becomes expired the next day
                        return expiryDate < currentDate;
                      });
                    };

                    // Only pass isExpiredDocumentfound if document validity check is enabled
                    const isExpiredDocumentfound =
                      isDocumentValidityCheckEnabled
                        ? hasExpiredDocumentsInDocumentLogs() ||
                          isExpiredDocument
                        : false;
                    window.parent.postMessage(
                      uploadFilesPopup(
                        popupTitle,
                        formField,
                        clickedFileIds.length > 0
                          ? clickedFileIds[0].sourceId
                          : "",
                        formField.interfaceOptions?.allowMultiple || false,
                        true,
                        formField?.Question?.id,
                        filesForPopup,
                        hasSystemGeneratedFiles,
                        isExpiredDocumentfound,
                      ),
                      "*",
                    );
                  }}
                  clearable
                />
                {fileerror.length <= 0 ? (
                  ""
                ) : (
                  <span
                    style={{
                      width: "150%",
                      fontSize: "12px",
                      color: "#FC4E4E",
                    }}
                  >
                    {fileerror}
                  </span>
                )}
                {uploadedFiles.map((file: any) => (
                  <>
                    {/* <Badge
                    w={{ xl: 350, lg: 275, sm: 275 }}
                    style={{
                      marginBottom: "8px",
                      textTransform: "none",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    key={file.path}
                    variant="outline"
                    rightSection={
                      <ActionIcon
                        size="xs"
                        color="orange"
                        radius="xl"
                        variant="transparent"
                        onClick={() => {
                          const newValue = uploadedFiles.filter(
                            (_file: any) => _file.path !== file.path
                          );
                          setUploadedFiles(newValue);
                          const removeSource = clickedFileIds.filter(
                            (items) => items?.filepath !== file.path
                          );
                          setClickedFileIds(removeSource);
                        }}
                      >
                        <IconX size={10} />
                      </ActionIcon>
                    }
                    fullWidth={false}
                  >
                    <Anchor
                      style={{ position: "relative", zIndex: 9 }}
                      href={file.path}
                      target="_blank"
                      title={file.name}
                    >
                      {file.name}
                    </Anchor>
                  </Badge> */}
                    <Group wrap="nowrap" gap={2} justify="space-between">
                      <Group gap={5} wrap="nowrap">
                        <SampleFileIcon />
                        <Anchor
                          style={{
                            position: "relative",
                            zIndex: 9,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "inline-block",
                            color: "#444444",
                            fontSize: 14,
                            fontWeight: 400,
                            width: 200,
                          }}
                          href={file.path}
                          target="_blank"
                          title={file.name}
                          c={"#444444"}
                          fz={14}
                          fw={400}
                        >
                          {file.name}
                        </Anchor>
                      </Group>
                      {/* <ActionIcon
                      onClick={() => {
                        const newValue = uploadedFiles.filter(
                          (_file: any) => _file.path !== file.path
                        );
                        setUploadedFiles(newValue);

                        //Remove previously clicked file
                        const updatedClickedFileIds = clickedFileIds.filter(
                          (item) => item.filepath !== file.path
                        );
                        setClickedFileIds(updatedClickedFileIds);
                      }}
                    >
                      <DeleteTrashIcon />
                    </ActionIcon> */}
                      <ActionIcon
                        styles={{
                          root: {
                            background: "#005c81",
                            color: "#fff",
                            "&:hover": {
                              background: "#122F47",
                              color: "#fff",
                            },
                          }
                        }}
                        size="lg"
                        onClick={saveFiles}
                        disabled={!uploadedFiles.length}
                        title="Save and Add"
                      >
                        <IconPlus />
                      </ActionIcon>
                      <ActionIcon
                        styles={{
                          root: {
                            background: "#005c81",
                            color: "#fff",
                            "&:hover": {
                              background: "#122F47",
                              color: "#fff",
                            },
                          }
                        }}
                        size="lg"
                        disabled={!uploadedFiles.length}
                        onClick={() => {
                          const newValue = uploadedFiles.filter(
                            (_file: any) => _file.path !== file.path,
                          );
                          setUploadedFiles(newValue);
                          //Remove previously clicked file
                          const updatedClickedFileIds = clickedFileIds.filter(
                            (item) => item.filepath !== file.path,
                          );
                          setClickedFileIds(updatedClickedFileIds);
                          clearFields();
                        }}
                        title="Clear"
                      >
                        <IconX />
                      </ActionIcon>
                    </Group>
                  </>
                ))}
              </>
              {FormHasRecommendation?.length === 0 &&
              recommedationData.length > 0 &&
              recommedationData.some((item: any) => item.value === files) ? (
                <CommonRecommendation
                  recommText={
                    recommedationData.filter(
                      (item: any) => item.value === files,
                    )[0].comment
                  }
                />
              ) : (
                ""
              )}
            </Stack>
            <Group
              styles={{
                root: {
                  alignItems: "end",
                  marginBottom:
                    validationErrorMessage(
                      state.fieldOptions?.required,
                      answerFiles,
                      "array",
                      setErrorMessagedetails,
                      formField.validationRules ?? "",
                    ) && !uploadedFiles.length
                      ? 17
                      : 0,
                },
              }}
            >
              {formField.children?.map((childFormField) => (
                <FormFieldRender
                  key={childFormField.id}
                  formField={childFormField}
                  name={getChildFieldStateName(formField, childFormField)}
                  isSimple
                />
              ))}

              {/* <ActionIcon
              styles={{
                root: {
                  background: "#005c81",
                  color: "#fff",
                  "&:hover": {
                    background: "#122F47",
                    color: "#fff",
                  },
                },
              }}
              size="lg"
              onClick={saveFiles}
              disabled={!uploadedFiles.length}
              title="Save and Add"
            >
              <IconPlus />
            </ActionIcon>
            <ActionIcon
              styles={{
                root: {
                  background: "#005c81",
                  color: "#fff",
                  "&:hover": {
                    background: "#122F47",
                    color: "#fff",
                  },
                },
              }}
              size="lg"
              disabled={!uploadedFiles.length}
              onClick={clearFields}
              title="Clear"
            >
              <IconX />
            </ActionIcon> */}
            </Group>
          </Group>
          <AddRecommendationButton
            formField={formField}
            answerOptionData={selectedFile}
          />
        </Group>

        {/* Carousel view to display the list for files */}
        {/* @Note: Don't display if formFiled is type file */}

        <Stack w="100%">
          {AISuggestionCarouseldata?.length > 0 &&
          !state.fieldOptions?.readonly &&
          formField.interface !== "file" ? (
            <div style={isDisabled ? { pointerEvents: "none" } : {}}>
              <AISuggestionCarousel
                data={AISuggestionCarouseldata}
                onFileCard={(id, value, isFromPopUp, selectedData) => {
                  onFileChange(
                  id,
                  null,
                  value as Record<string, any>[],
                  true,
                  isFromPopUp,
                  selectedData,
                );
              }}
              formFieldId={formField?.id}
              isclicked={false}
              isFile={true}
              clickedFileIds={
                !!useFormFieldStore.getState().answer[formField?.field]
                  ? blankCheck.includes(
                      useFormFieldStore.getState().answer[formField?.field]
                        .value,
                    )
                    ? []
                    : clickedFileIds
                  : clickedFileIds
              }
              isReplaceInfoContent={true}
            />
            </div>
          ) : (
            <></>
          )}
        </Stack>

        {/* File display table for selected/uploaded files for a FormField */}
        {!!answerFiles.length && (
          isSimple ? (
            <Stack gap={4} mt={6}>
              {answerFiles.flatMap((file: any) =>
                file.value.map((m: any) => (
                  <Group key={m.fileId || m.name} gap={4} align="center">
                    <Text fz={12} fw={400} c="#444444">
                      Uploaded document :
                    </Text>
                    <Anchor
                      href={m.path}
                      target="_blank"
                      fz={12}
                      fw={700}
                      p={0}
                      style={{ color: !!documentName ? "#FF9907" : "#72D0C6", textAlign: "left" }}
                    >
                      {m.name}
                    </Anchor>
                  </Group>
                ))
              )}
            </Stack>
          ) : (
          <Stack w="100%" gap="sm" mt={10}>
            <Text fw={500} fz={16}>
              Uploaded files will be listed below :-
            </Text>
            <Divider />
            <CommonTable
              headers={[
                "Document",
                ...(formField.children?.map((m: any) => m.fieldOptions.label) ??
                  []),
                query?.mode === "start" ? "Actions" : "",
              ]}
              sortedChildrenData={[]}
              questionId={formField?.questionId}
              isDisabled={query?.mode !== "start"}
            >
              {answerFiles.map((file: any, index: any) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor:
                      file?._id === editId ? "#FAF7F0" : "inherit",
                    wordBreak: "break-all",
                    pointerEvents: (isReview && isReviewer) ? "none" : "auto",
                  }}
                >
                  <td>
                    <Stack>
                      {file.value.map((m: any) => (
                        <Stack gap={2} key={m.fileId || m.name}>

                          <Group my={7} gap={2}>
                            {!!documentName && (
                              <Text fz={12} c="#666" fw={700}>
                                {" "}
                                Uploaded File:&nbsp;&nbsp;
                              </Text>
                            )}
                            <Anchor
                              style={{
                                pointerEvents: (isReview && isReviewer) ? "none" : "auto",
                                color: !!documentName ? "#FF9907" : "#72D0C6",
                              }}
                              key={m.name}
                              href={m.path}
                              target="_blank"
                              fz={12}
                              fw={700}
                            >
                              {m.name}
                            </Anchor>
                          </Group>
                          {m.expiryDate &&
                            new Date(m.expiryDate) < new Date() && (
                              <Text c="#FC4E4E" fz={12}>
                                This document has expired. We recommend
                                uploading the latest version.
                              </Text>
                            )}
                          {m?.explanation && (
                            <>
                              <Text mb={10} fz={12} c="#1C9689" fw={700}>
                                Observations &nbsp;<i>(AI Generated)</i>{" "}
                                :&nbsp;&nbsp;
                                <Text
                                  lang="en"
                                  component="span"
                                  c="#1C9689"
                                  fw={400}
                                  fz={12}
                                  style={{
                                    wordBreak: "keep-all",
                                    overflowWrap: "break-word",
                                    hyphens: "auto",
                                  }}
                                >
                                  {m?.explanation}
                                </Text>
                              </Text>
                            </>
                          )}
                          {isCarryForward
                            ? currentRating &&
                              currentRating?.map((item: any) => {
                                //return <RatingTable value={item.data} />;
                                return m.fileId == item.fileId ? (
                                  <RatingTable value={item.data} />
                                ) : (
                                  ""
                                );
                              })
                            : (isViewRecommendation || isViewMode) &&
                              currentRating &&
                              currentRating?.map((item: any) => {
                                //return <RatingTable value={item.data} />;
                                return m.fileId == item.fileId ? (
                                  <RatingTable value={item.data} />
                                ) : (
                                  ""
                                );
                              })}
                        </Stack>
                      ))}
                    </Stack>
                  </td>
                  {formField.children?.map((childField: any) => (
                    <td key={childField.field}>
                      <Text size="sm">
                        {convertInterfaceValueToString(
                          childField.interface,
                          file[childField.field].value,
                        )}
                      </Text>
                    </td>
                  ))}
                  {query?.mode === "start" && (
                    <td
                      style={{
                        verticalAlign: "top",
                      }}
                    >
                      <Group gap={5} mt={-3}>
                        {hasAdditinalData && (
                          <ActionIcon
                            disabled={!!uploadedFiles.length}
                            onClick={editHandler(file)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        )}

                        <ActionIcon
                          variant="transparent"
                          disabled={!!uploadedFiles.length}
                          onClick={() => {
                            removeFileItemFromList(file)();
                          }}
                          color="#868e96"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </td>
                  )}
                </tr>
              ))}
            </CommonTable>
          </Stack>
          )
        )}
      </Stack>
    );
  },
  (prev, next) =>
    prev.formField.id === next.formField.id && prev.value === next.value,
);

FileField.displayName = "FileField";

export default FileField;