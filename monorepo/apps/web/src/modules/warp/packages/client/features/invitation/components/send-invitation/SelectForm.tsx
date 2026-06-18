import {
  Autocomplete,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconClock, IconSearch } from "@tabler/icons-react";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { GetFormWithDetailsQuery } from "@/modules/warp/packages/graphql/generated/types";
import { useGetCompanyDetailByIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetConsultantFormWithDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-consultant-form-with-details";
import { useGetFormWithDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-with-details";
import { useGetGlobalMasterFormIconsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-form-icons";
import { AppRoles } from "@/modules/warp/packages/shared/constants/app.constants";
import { concat } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { useUserSession } from "../../../../hooks/use-user-session";
import { cancelInvitationMessage } from "../../../../services/platform-window-message.service";
import { initialState, useSendInvitationStore } from "./store";

const useStyles = createStyles((theme) => ({
  commonMargin: {
    marginBottom: 10,
    marginTop: 10,
  },
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 50,
  },
  repeatFormIcon: {
    background: theme.colors.dark[8],
    color: theme.colors.gray[0],
    width: "20px",
    height: "20px",
    borderRadius: "100%",
    padding: "3px",
  },
  rightSection: {
    width: "50%",
  },
  monthDelete: {
    height: "0",
    overflow: "hidden",
  },
  active: {
    color: "#fff !important",
    backgroundColor: theme.colors.orange[5],
    "&:hover": {
      backgroundColor: theme.colors.orange[5],
    },
  },
  day: {
    color: "#000 !important",
  },
  dateInput: {
    cursor: "pointer",
  },
  cardText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  focusAreaIconsParent: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  focusAreaIcons: {
    width: "30px",
    height: "30px",
    borderRadius: "5px",
    backgroundColor: "#e2e2e2",
    padding: 5,
  },
  timeText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  card: {
    border: "1px solid #cdcdcd",
    flexGrow: 1,
    overflowY: "auto",
  },
  SideDrawerSearch: {
    border: "1px solid #ced4da " + "!important",
    "&:focus": {
      border: "1px solid #038FC7" + "!important",
    },
    "&:focus-within": {
      border: "1px solid #038FC7" + "!important",
    },
  },
}));

const FormsList: FC<{
  formCompanyList: any;
  formsList: GetFormWithDetailsQuery["Form"];
  getIcon: (focusArea: string) => string;
  focusAreaIconList: object;
}> = ({ formCompanyList, formsList, getIcon, focusAreaIconList }) => {
  const { classes } = useStyles();
  const selectForm = useSendInvitationStore((store) => store.selectForm);

  const userSession = useUserSession();

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: userSession?.company?.id,
    },
  });

  const InternalCompanyData: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "InternalRequestCompany"
  );

  const chkCompanyId = !!InternalCompanyData
    ? InternalCompanyData[0]?.data?.filter(
        (a: any) =>
          a.companyId === userSession?.company?.id && a.IsEnable === true
      )
    : false;
  //debugger;
  // formsList
  //   .filter((x) => x.GroupForms.length > 0)
  //   .map((form: any) => {
  //     form?.GroupForms.map((childForm: any) => {
  //       formsList = formsList.filter((item) => item.id !== childForm.formId);
  //     });
  //   });
  return (
    <Stack gap={"sm"}>
      {formsList.map((form, i) => (
        <Paper
          key={form.id}
          className={classes.card}
          shadow="sm"
          radius="xs"
          p="md"
        >
          <Stack>
            <Stack gap={0}>
              <Title order={5}>{form.name}</Title>
              <Text>
                {userSession?.user?.role === AppRoles.Consultant &&
                  formCompanyList[i]?.name}
              </Text>
            </Stack>
            <Group align="flex-start">
              {form.Details?.focusArea?.some((item: any) =>
                Object.keys(focusAreaIconList).includes(item)
              ) && (
                <Stack gap={5}>
                  {form.Details?.focusArea?.length > 0 ? (
                    <Text className={classes.cardText}>Focus Area</Text>
                  ) : (
                    ""
                  )}
                  <Box className={classes.focusAreaIconsParent}>
                    {form.Details?.focusArea?.map(
                      (_focusArea: string, i: any) =>
                        getIcon(_focusArea) !== undefined ? (
                          <Tooltip label={_focusArea}>
                            <Flex
                              align="center"
                              justify="center"
                              bg="lightgray"
                              styles={{
                                root: {
                                  borderRadius: 5,
                                }
                              }}
                              p={5}
                              key={_focusArea}
                              dangerouslySetInnerHTML={{
                                __html: getIcon(_focusArea),
                              }}
                            />
                          </Tooltip>
                        ) : null
                    )}
                  </Box>
                </Stack>
              )}
              {form.Details !== null ? (
                <Stack gap={5}>
                  <Text className={classes.cardText}>Time needed</Text>
                  <Box className={classes.focusAreaIconsParent}>
                    <IconClock color="orange" size={20} />
                    <Text className={classes.timeText}>
                      {form.Details?.timeInMinutes} min
                    </Text>
                  </Box>
                </Stack>
              ) : (
                ""
              )}
            </Group>
            <Box>
              <Button
                onClick={() => {
                  // selectForm(form.id, getGroupFormids(form.GroupForms))

                  let chkInternalAssessment = !!InternalCompanyData
                    ? InternalCompanyData[0]?.data?.filter(
                        (a: any) =>
                          a.companyId === userSession?.company?.id &&
                          a.IsEnable === true &&
                          a.formId === form.id
                      )
                    : false;

                  if (chkInternalAssessment?.length > 0)
                    selectForm(
                      form.id,
                      form.GroupForms,
                      true,
                      formCompanyList[i]?.id
                    );
                  else
                    selectForm(
                      form.id,
                      form.GroupForms,
                      false,
                      formCompanyList[i]?.id
                    );
                }}
                size="sm"
                color="solidBtn"
              >
                Select
              </Button>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
const getGroupFormids = (GroupForms: any[]) => {
  let industry: any[] = [];
  let groupFormIds: any[] = [];
  const GroupData = GroupForms.map((index: any) => {
    groupFormIds = concat(groupFormIds, index.formId);
    const industryData: any =
      index.Form.Details.industry.length > 0 &&
      index.Form.Details.industry.map((x: any) => x);
    industry = concat(industry, industryData);
  });
  return { formId: groupFormIds, industry: industry };
};

const SelectForm = () => {
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const { classes } = useStyles();

  const userSession: any = useUserSession();
  const userRole = !!userSession && userSession?.role;
  const userRole1 = !!userSession && userSession?.user?.role;
  const finalUserRole = userRole ?? userRole1;

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

  const cancel = useSendInvitationStore((store) => () => {
    store.init(initialState);
    postParentMessage(cancelInvitationMessage());
  });

  const [searchFormFilter, setSearchFormFilter] = useState("");

  useEffect(() => {
    if (!!finalUserRole && finalUserRole !== "") {
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
  ]);

  const autoompleteFormData = useMemo(
    () =>
      userSession?.user?.role === AppRoles.Consultant
        ? consultantFormsList?.AssessorConsultantMapping?.map(
            (m) => m?.Form?.name
          ) ?? []
        : formsList?.Form?.map((m) => m.name) ?? [],

    [formsList, consultantFormsList, userSession?.user?.role]
  );

  let formCompanyList: any = [];

  const filteredFormList = useMemo(() => {
    if (userSession?.user?.role === AppRoles.Consultant) {
      if (!consultantFormsList?.AssessorConsultantMapping?.length) return [];
      let filteredForm = consultantFormsList?.AssessorConsultantMapping?.filter(
        (m) =>
          m?.Form?.name
            .toLowerCase()
            .includes(searchFormFilter.trim().toLowerCase())
      );

      let newFilteredForm: any = [];
      filteredForm?.map((data) => {
        newFilteredForm.push(data.Form);
        formCompanyList.push(data.Company);
      });
      return newFilteredForm;
    } else {
      if (!formsList?.Form?.length) return [];

      // if (!searchFormFilter.trim()) return formsList.Form.slice(0, 1);

      return formsList?.Form?.filter((m) =>
        m.name.toLowerCase().includes(searchFormFilter.trim().toLowerCase())
      );
    }
  }, [
    formsList,
    consultantFormsList,
    searchFormFilter,
    userSession?.user?.role,
    formCompanyList,
  ]);

  const getIcon = (name: string) =>
    focusAreaIconsData?.GlobalMaster[0]?.data[name];

  const focusAreaIconList = focusAreaIconsData?.GlobalMaster[0]?.data;
  if (loadingFocusAreaIconsData || loadingFormsList)
    return <Spinner visible={true} />;

  return (
    <Stack p={10}>
      <Autocomplete
        classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
        className={classes.SideDrawerSearch}
        style={{
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "5px",
        }}
        radius={0}
        variant="unstyled"
        placeholder="Search"
        rightSection={
          <IconSearch size={18} style={{ display: "block", opacity: 1 }} />
        }
        value={searchFormFilter}
        onChange={setSearchFormFilter}
        data={autoompleteFormData}
      />
      <Text fz={15} fw={600}>
        Select questionnaire for assessment
      </Text>

      <FormsList
        formCompanyList={formCompanyList}
        formsList={filteredFormList}
        getIcon={getIcon}
        focusAreaIconList={focusAreaIconList}
      />
      <Group justify="flex-end" gap="sm">
        <Button color="outlineBtn" className="btn-cancel" onClick={cancel}>
          Cancel
        </Button>
      </Group>
    </Stack>
  );
};

export default SelectForm;
