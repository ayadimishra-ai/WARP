import { Box, Select, Stack, Text } from "@mantine/core";
import { useGetCompanyDetailByIdQuery } from "@warp/graphql/queries/generated/get-companydetail-by-id";
import { useGetConsultantFormWithDetailsLazyQuery } from "@warp/graphql/queries/generated/get-consultant-form-with-details";
import { useGetFormWithDetailsLazyQuery } from "@warp/graphql/queries/generated/get-form-with-details";
import { useGetGlobalMasterFormIconsQuery } from "@warp/graphql/queries/generated/get-global-master-form-icons";
import { AppRoles } from "@warp/shared/constants/app.constants";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import { MonthYearRangePicker } from "../../../../components/MonthYearRangePicker";
import { useUserSession } from "../../../../hooks/use-user-session";
import { useSendInvitationStore } from "./store";

interface SelectFormProps {
  onClose?: () => void;
}

const SelectForm: React.FC<SelectFormProps> = ({ onClose }) => {
  const {
    formId,
    groupFormIds,
    isInternal,
    parentCompanyId,
    startDate,
    endDate,
    selectForm,
    setAssessmentPeriod,
  } = useSendInvitationStore();

  // Debug current store values
  useEffect(() => {
    console.log("Current store values:", {
      formId,
      groupFormIds,
      isInternal,
      parentCompanyId,
      startDate,
      endDate,
    });
  }, [formId, groupFormIds, isInternal, parentCompanyId, startDate, endDate]);

  // Helper function to get current financial year dates
  const getCurrentFinancialYear = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Set start date to first day of previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const startYear = prevMonth === 11 ? currentYear - 1 : currentYear;
    const startDate = new Date(startYear, prevMonth, 1); // First day of previous month

    // Set end date to last day of previous month
    const endDate = new Date(currentYear, currentMonth, 0); // Last day of previous month

    return [startDate, endDate] as [Date, Date];
  };

  const [dateRangeError, setDateRangeError] = React.useState<string | null>(
    null
  );

  const userSession = useUserSession();
  const InternalCompanyData: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "InternalRequestCompany"
  );
  const finalUserRole = userSession?.user?.role;

  const { data: focusAreaIconsData, loading: loadingFocusAreaIconsData } =
    useGetGlobalMasterFormIconsQuery();

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: userSession?.company?.id,
    },
  });

  const [fetchFormsList, { data: formsList, loading: loadingFormsList }] =
    useGetFormWithDetailsLazyQuery({
      variables: { companyId: userSession?.company?.id },
    });

  const [
    fetchConsultantFormsList,
    { data: consultantFormsList, loading: loadingConsultantFormsList },
  ] = useGetConsultantFormWithDetailsLazyQuery({
    variables: {
      companyId: companyDetails?.Company[0]?.id,
    },
  });

  useEffect(() => {
    if (finalUserRole) {
      if (
        finalUserRole === AppRoles.Consultant &&
        !!companyDetails &&
        !!companyDetails?.Company
      ) {
        if (
          !!focusAreaIconsData &&
          !consultantFormsList &&
          companyDetails?.Company[0]?.id
        )
          fetchConsultantFormsList();
      } else {
        if (!!focusAreaIconsData && !formsList) fetchFormsList();
      }
    }
  }, [
    focusAreaIconsData,
    fetchFormsList,
    fetchConsultantFormsList,
    companyDetails?.Company,
    formsList,
    consultantFormsList,
    finalUserRole,
    companyDetails,
  ]);

  interface FormData {
    id: string;
    name: string;
    GroupForms: any[];
    ParentCompanyId?: string | null;
    formIdAndParentCompanyId?: string | null;
  }

  // Define internal form type
  interface InternalFormData {
    companyId: string;
    IsEnable: boolean;
    formId: string;
  }

  // Memoized form data processing
  const { forms, selectOptions } = useMemo(() => {
    const getForms = (): FormData[] => {
      // Get internal forms for the current company
      const internalForms =
        InternalCompanyData?.[0]?.data?.filter(
          (a: InternalFormData) =>
            a.companyId === userSession?.company?.id && a.IsEnable === true
        ) ?? [];
      if (finalUserRole === AppRoles.Consultant) {
        return (
          consultantFormsList?.AssessorConsultantMapping?.map((m) => ({
            id: m?.Form?.id ?? "",
            name: m?.Form?.name + " - " + m?.Company?.name,
            GroupForms: m?.Form?.GroupForms ?? [],
            type: m?.Form?.formtype ?? "",
            ParentCompanyId: m?.Company?.id ?? null,
            formIdAndParentCompanyId:
              m?.Form?.id && m?.Company?.id
                ? `${m?.Form?.id}_${m?.Company?.id}`
                : null,
          })).filter(
            (form) => form.id && form.name && form.type === "Report" // &&
            // internalForms.some(
            //   (internal: InternalFormData) => internal.formId === form.id
            // )
          ) ?? []
        );
      }
      return (
        formsList?.Form?.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.formtype,
          GroupForms: m.GroupForms ?? [],
        })).filter(
          (form) => form.id && form.name && form.type === "Report"
          // internalForms.some(
          //   (internal: InternalFormData) => internal.formId === form.id
          // )
        ) ?? []
      );
    };

    const forms = getForms();
    const selectOptions = forms
      .map(({ id, name, ParentCompanyId }) => ({
        value:
          userSession?.user?.role === AppRoles.Consultant
            ? `${id}_${ParentCompanyId}`
            : id,
        label: name,
        ParentCompanyId: ParentCompanyId,
        formId: id,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      );
    return { forms, selectOptions };
  }, [
    formsList,
    consultantFormsList,
    finalUserRole,
    InternalCompanyData,
    userSession?.company?.id,
    userSession?.user?.role,
  ]);

  // Set default financial year and form only on initial mount
  const [hasSetDefault, setHasSetDefault] = React.useState(false);
  const [hasSetDefaultForm, setHasSetDefaultForm] = React.useState(false);

  // Effect for setting default dates
  useEffect(() => {
    if (!hasSetDefault && !startDate && !endDate) {
      // const [defaultStart, defaultEnd] = getCurrentFinancialYear();
      // setAssessmentPeriod(defaultStart, defaultEnd);
      setHasSetDefault(true);
    }
  }, [hasSetDefault, startDate, endDate, setAssessmentPeriod]);

  // Separate effect for setting default form
  // useEffect(() => {
  //   // Only proceed if we have forms loaded and no form is selected yet
  //   const canSetDefaultForm =
  //     !loadingFormsList &&
  //     !loadingConsultantFormsList &&
  //     !formId &&
  //     forms.length === 1;

  //   if (canSetDefaultForm) {
  //     const onlyForm = forms[0];

  //     if (onlyForm) {
  //       const isInternalAssessment =
  //         InternalCompanyData?.[0]?.data?.some(
  //           (a: { companyId: string; IsEnable: boolean; formId: string }) =>
  //             a.companyId === userSession?.company?.id &&
  //             a.IsEnable === true &&
  //             a.formId === onlyForm.id
  //         ) ?? false;

  //       selectForm(
  //         onlyForm.id,
  //         onlyForm.GroupForms ?? [],
  //         isInternalAssessment,
  //         userSession?.company?.id ?? null
  //       );
  //     }
  //   }
  // }, [
  //   formId,
  //   forms,
  //   loadingFormsList,
  //   loadingConsultantFormsList,
  //   InternalCompanyData,
  //   userSession?.company?.id,
  //   selectForm,
  // ]);

  // Set default selected form to first option when options are available
  useEffect(() => {
    if (selectOptions.length > 0 && !formId && !hasSetDefaultForm) {
      const firstOption = selectOptions[0];
      const selectedForm = forms.find((f) =>
        userSession?.user?.role === AppRoles.Consultant
          ? f.formIdAndParentCompanyId === firstOption.value
          : f.id === firstOption.value
      );

      if (selectedForm) {
        const isInternalAssessment =
          InternalCompanyData?.[0]?.data?.some(
            (a: { companyId: string; IsEnable: boolean; formId: string }) =>
              a.companyId === userSession?.company?.id &&
              a.IsEnable === true &&
              a.formId === selectedForm.id
          ) ?? false;

        selectForm(
          selectedForm.id,
          selectedForm.GroupForms ?? [],
          isInternalAssessment,
          userSession?.user?.role === AppRoles.Consultant
            ? selectedForm.ParentCompanyId || null
            : userSession?.company?.id ?? null
        );
        setHasSetDefaultForm(true);
      }
    }
  }, [
    selectOptions,
    formId,
    forms,
    hasSetDefaultForm,
    InternalCompanyData,
    userSession?.company?.id,
    selectForm,
    userSession?.user?.role,
  ]);

  // Memoized handler for clearing the date range
  const handleClearDates = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAssessmentPeriod(null, null);
      setDateRangeError(null);
    },
    [setAssessmentPeriod]
  );

  return (
    <Stack px={25} spacing={12} py={0}>
      <Box mb={0} style={{ position: "relative" }}>
        <Text
          weight={500}
          mb={8}
          style={{
            fontSize: "12px",
            lineHeight: "17px",
            color: "#444",
          }}
        >
          Select Reporting Framework<span style={{ color: "#FF0000" }}>*</span>
        </Text>
        <Select
          placeholder="Select Questionnaire"
          value={
            userSession?.user?.role === AppRoles.Consultant
              ? `${formId}_${parentCompanyId}`
              : formId
          }
          onChange={useCallback(
            (value: string | null) => {
              if (!value) return;

              const selectedForm = forms.find((f) =>
                userSession?.user?.role === AppRoles.Consultant
                  ? f.formIdAndParentCompanyId === value
                  : f.id === value
              );
              if (!selectedForm) return;

              const isInternalAssessment =
                InternalCompanyData?.[0]?.data?.some(
                  (a: {
                    companyId: string;
                    IsEnable: boolean;
                    formId: string;
                  }) =>
                    a.companyId === userSession?.company?.id &&
                    a.IsEnable === true &&
                    a.formId === selectedForm.id
                ) ?? false;

              selectForm(
                selectedForm.id,
                selectedForm.GroupForms ?? [],
                isInternalAssessment,
                userSession?.user?.role === AppRoles.Consultant
                  ? selectedForm.ParentCompanyId || null
                  : userSession?.company?.id ?? null
              );
            },
            [
              forms,
              InternalCompanyData,
              userSession?.company?.id,
              selectForm,
              userSession?.user?.role,
            ]
          )}
          data={selectOptions}
          searchable
          styles={(theme) => ({
            input: {
              height: "40px",
              border: "1px solid #E6E6E6",
              borderRadius: "4px",
              "&:focus": {
                borderColor: theme.colors.blue[6],
              },
            },
            dropdown: {
              border: "1px solid #E6E6E6",
              borderRadius: "4px",
            },
            item: {
              color: "#666666",
              "&[data-selected]": {
                background:
                  "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                color: "white",
              },
              "&:hover": {
                background:
                  "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                color: "white",
              },
            },
          })}
        />
      </Box>
      <Box mb={15}>
        <Text
          weight={500}
          mb={8}
          style={{
            fontSize: "12px",
            lineHeight: "17px",
            color: "#444",
          }}
        >
          Choose Reporting Period<span style={{ color: "#FF0000" }}>*</span>
        </Text>
        <Box style={{ position: "relative" }}>
          <MonthYearRangePicker
            value={
              startDate && endDate
                ? { fromDate: startDate, toDate: endDate }
                : undefined
            }
            onChange={useCallback(
              (newDateRange: { fromDate: Date; toDate: Date }) => {
                setDateRangeError(null);

                if (!newDateRange?.fromDate && !newDateRange?.toDate) {
                  setAssessmentPeriod(null, null);
                  return;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { fromDate, toDate } = newDateRange;

                setAssessmentPeriod(fromDate, toDate);
              },
              [setAssessmentPeriod]
            )}
          />
          {dateRangeError && (
            <Text
              size="sm"
              style={{
                color: "#FF0000",
                marginTop: "8px",
                fontSize: "12px",
              }}
            >
              {dateRangeError}
            </Text>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default memo(SelectForm);
