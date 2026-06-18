import { Box, MantineTheme, Select, Stack, Text } from "@mantine/core";
import { useGetCompanyDetailByIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetConsultantFormWithDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-consultant-form-with-details";
import { useGetFormWithDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-with-details";
import { useGetGlobalMasterFormIconsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-form-icons";
import { AppRoles } from "@/modules/warp/packages/shared/constants/app.constants";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import { MonthYearRangePicker } from "../../../../components/MonthYearRangePicker";
import { useUserSession } from "../../../../hooks/use-user-session";
import { useSendInvitationStore } from "./store";

interface SelectFormProps {
  onClose?: () => void;
}

// Memoized styles for better performance
const useFormStyles = () =>
  useMemo(
    () => ({
      selectStyles: (theme: MantineTheme) => ({
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
          "&[data-selected]": {
            backgroundColor: theme.colors.blue[6],
            color: "white",
          },
        },
      }),
      datePickerStyles: (theme: MantineTheme) => ({
        input: {
          height: "40px",
          border: "1px solid #E6E6E6",
          borderRadius: "4px",
          "&:focus": {
            borderColor: theme.colors.blue[6],
          },
        },
        calendar: {
          border: "1px solid #E6E6E6",
          borderRadius: "4px",
        },
      }),
      labelText: {
        fontSize: "14px",
        lineHeight: "17px",
        color: "#122F47",
      },
    }),
    []
  );

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

  // Memoized form data processing
  const { forms, selectOptions } = useMemo(() => {
    const getForms = (): FormData[] => {
      if (finalUserRole === AppRoles.Consultant) {
        return (
          consultantFormsList?.AssessorConsultantMapping?.map((m) => ({
            id: m?.Form?.id ?? "",
            name: m?.Form?.name + " - " + m?.Company?.name,
            type: m?.Form?.formtype ?? "",
            GroupForms: m?.Form?.GroupForms ?? [],
            ParentCompanyId: m?.Company?.id ?? null,
            formIdAndParentCompanyId:
              m?.Form?.id && m?.Company?.id
                ? `${m?.Form?.id}_${m?.Company?.id}`
                : null,
          })).filter(
            (form) => form.id && form.name && form.type !== "Report"
          ) ?? []
        );
      }
      return (
        formsList?.Form?.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.formtype,
          GroupForms: m.GroupForms ?? [],
        })).filter((form) => form.id && form.name && form.type !== "Report") ??
        []
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
  }, [formsList, consultantFormsList, finalUserRole, userSession?.user?.role]);

  // Set default financial year only on initial mount
  const [hasSetDefault, setHasSetDefault] = React.useState(false);
  const [hasSetDefaultForm, setHasSetDefaultForm] = React.useState(false);

  useEffect(() => {
    if (!hasSetDefault && !startDate && !endDate) {
      //const [defaultStart, defaultEnd] = getCurrentFinancialYear();
      //setAssessmentPeriod(defaultStart, defaultEnd);
      setHasSetDefault(true);
    }
  }, [hasSetDefault, startDate, endDate, setAssessmentPeriod]);

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
    <Stack px={25} gap={0} py={0}>
      <Box mb={12} style={{ position: "relative" }}>
        <Text
          fw={400}
          mb={8}
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#444444",
          }}
        >
          Select Assessment<span style={{ color: "#FF0000" }}>*</span>
        </Text>
        <Select
          classNames={{ option: "darkDropdown"}}
          withCheckIcon={false}
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
                    a.companyId ===
                      //userSession?.company?.id &&
                      (userSession?.user?.role === AppRoles.Consultant
                        ? selectedForm.ParentCompanyId
                        : userSession?.company?.id) &&
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
        />
      </Box>
      <Box mb={12}>
        <Text
          fw={400}
          mb={8}
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#444444",
          }}
        >
          Choose Assessment Period<span style={{ color: "#FF0000" }}>*</span>
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
                // if (
                //   (fromDate && fromDate > today) ||
                //   (toDate && toDate > today)
                // ) {
                //   setDateRangeError("Cannot select future dates");
                //   return;
                // }

                setAssessmentPeriod(fromDate, toDate);
              },
              [setAssessmentPeriod]
            )}
          />
          {/* <CloseButton
            size="sm"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666666",
              zIndex: 2,
              opacity: startDate || endDate ? 1 : 0,
              pointerEvents: startDate || endDate ? "auto" : "none",
              transition: "opacity 0.2s ease",
              cursor: "pointer",
            }}
            onClick={handleClearDates}
            title="Clear dates"
          /> */}
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
