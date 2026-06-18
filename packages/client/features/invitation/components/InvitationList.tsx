import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  CloseButton,
  Container,
  Divider,
  Flex,
  Group,
  HoverCard,
  Loader,
  Pagination,
  Paper,
  Progress,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
  createStyles,
} from "@mantine/core";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { IconClockPause, IconFilter, IconInfoCircle } from "@tabler/icons";
import InvitationButtons from "@warp/client/features/invitation/components/InvitationButtons";
import {
  DataTableType,
  PaginationType,
  StatesFilterType,
  TableHeader,
  useAssessment,
} from "@warp/client/hooks/use-assessment";
import Spinner from "@warp/client/layouts/Spinner";
import { GetAssessmentListingDetailsQuery } from "@warp/graphql/generated/types";
import { useGetassesseeuserbyinvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetGlobalMasterByInternalRequestCompanyQuery } from "@warp/graphql/queries/generated/get-global-master-by-InternalRequestCompany";
import { useGetGlobalMasterDataForInviterFormAutoAppoverQuery } from "@warp/graphql/queries/generated/get-global-master-data-for-inviter-form-auto-appover";
import { useGetInvitationStatusCountsLazyQuery } from "@warp/graphql/queries/generated/get-invitation-status-counts";
import {
  AIProcessingTypes,
  AppRoles,
  AtherCompanyid,
  FormInvitationStatus,
  FormInvitationUIStatus,
  FormTypes,
  InvitationAIStatus,
} from "@warp/shared/constants/app.constants";
import { setLocalStorageData } from "@warp/shared/utils/auth-session.util";
import {
  getUserAIDetails,
  hasFullAICuration,
} from "@warp/shared/utils/jwt-ai.util";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import SortIcons from "../../../components/SortIcons";
import AISparkleIcon from "../../../components/icons/AISparkleIcon";
import IconSparkles from "../../../components/icons/IconSparkles";
import SearchIcon from "../../../components/svgIcons/SearchIcon";
import { useUserSession } from "../../../hooks/use-user-session";
import {
  UserAIStatusUpdate,
  closeMainLoader,
  gotoUploadDocs,
  startInvitationMessage,
  viewInvitationMessage,
} from "../../../services/platform-window-message.service";
import { isUserAllowedAIFeature } from "../../form/common-functions";
import { useInvitationListStore } from "../invitationList.store";
import BlankAssessment from "./BlankAssessment";
useGetGlobalMasterDataForInviterFormAutoAppoverQuery;

const useStyles = createStyles((theme) => ({
  textRight: {
    textAlign: "right",
  },
  filterBox: {},
  textFieldFilter: {
    display: "flex",
    gap: "20px",
    width: "43%",
    "@media(max-width:1400px)": {
      width: "47%",
    },
  },
  searchInputWrapper: {
    flex: "0 0 235px",
    "&:hover": {
      borderColor: "#005c81 !important",
      color: "#424143 !important",
    },
    "&:focus": {
      borderColor: "#005c81 !important",
      background: "#ffffff !important",
      color: "#424143 !important",
      letterSpacing: "0.02em !important",
    },
  },
  innersrchbox: {
    position: "relative",
    width: "100%",
    paddingRight: "0px",
    display: "flex",
    justifyContent: "end",
  },
  innersrchbox2: {
    position: "relative",
    width: "100%",
    paddingRight: "0px",
    display: "flex",
    justifyContent: "end",
    "@media (max-width: 1200px)": {
      flexWrap: "wrap",
      rowGap: "8px",
    },
  },
  searchresetcont: {
    position: "absolute",
    top: "4px",
    right: "5px",
  },
  topTableFilters: {
    gap: "72px",
    flexWrap: "wrap",
    "@media (max-width: 768px)": {
      gap: "10px",
    },
    button: {
      padding: "0 10px",
      // borderRight: "2px solid #FF9E1B",
      "&:first-of-type": {
        paddingLeft: "0px",
      },
    },
  },
  table: {
    background: "#FFFFFF",
    boxShadow:
      "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
    borderRadius: "10px",
    //tableLayout: "fixed",
  },
  tableHeading: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 700,
    fontSize: "12px",
    color: "#fff",
    whiteSpace: "nowrap",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  tableHeadingBorder: {
    color: "#1A1A1A",
    background: "#003B52" + "!important",
    fontSize: "12px" + "!important",
    padding: "10px" + "!important",
    "&:first-of-type": {
      borderTopLeftRadius: "10px" + "!important",
      paddingLeft: "25px" + "!important",
      width: "270px",
    },
    "&:nth-child(2)": {
      width: "180px",
    },
    "&:last-of-type": {
      borderTopRightRadius: "10px" + "!important",
    },
  },
  active: {
    color: theme.colors.orange[5] + "!important",
  },
  activeBtn: {
    fontWeight: "normal",
    "&>div": {
      color: "#ffffff !important",
      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
      borderRadius: "5px",
      fontWeight: "normal",
    },
  },
  boxShadow: {
    boxShadow: "0 4px 6px rgb(0 0 0 / 10%)",
  },
  commonMargin: {
    margin: "10px 0",
  },
  tableParent: {
    overflowX: "auto",
  },
  statusTd: {
    display: "flex",
    gap: "10px",
  },
  actionTd: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    borderRight: "2px solif #cdcdcd",
    padding: "0 25px",
  },
  filterHoverBtn: {
    fontWeight: "normal",
    "&:hover": {
      color: "#ffffff !important",
      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
      fontWeight: "normal",
    },
  },
  filterHover: {
    width: "max-content",
    "&:hover": {
      color: theme.colors.orange[5] + "!important",
    },
  },
  paginationItem: {
    borderRadius: "50%",
    border: "0",
    width: "32px",
    backgroundColor: "#F7F9FB",
    "&[data-active]": {
      backgroundColor: "#003b52",
      color: "#fff",
    },
    marginTop: 10,
    "&:hover": {
      backgroundColor: "#005C81",
      color: "#fff",
    },
  },
  trStyle: {
    height: 43,
    "&:hover": {
      backgroundColor: "#F1F3F6",
    },
  },
  trStyleNew: {
    //backgroundColor: "#FFF0F0",
  },
  tdStyle: {
    border: "0" + "!important",
    fontSize: "12px" + "!important",
    padding: "0 10px" + "!important",
    color: "#444444 !important",
    "&: div": {
      //width: "220px" + "!important",
      whitespace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:first-of-type > div": {
      // width: "180px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "auto",
    },
    "&:nth-of-type(2) > div": {
      // width: "180px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(3) > div": {
      //width: "200px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(4) > div": {
      //width: "100px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(5) > div": {
      //width: "140px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(6) > div": {
      width: "max-content" + "!important",
      wordBreak: "break-word",
    },
    "&:nth-of-type(7) > div": {
      // minWidth: "140px" + "!important",
      // maxWidth: "260px" + "!important",
      width: "max-content" + "!important",
      wordBreak: "break-word",
    },
    // "&:last-of-type > div": {
    //   minWidth: "100%" + "!important",
    //   maxWidth: "100%" + "!important",
    //   width: "100%" + "!important",
    // },
  },
  tooltipDropdown: {
    backgroundColor: "#122F47 !important",
    color: "#FFFFFF !important",
    border: "none !important",
    padding: "8px 12px !important",
    borderRadius: "4px !important",
  },
  dropdown: {
    top: "40px" + "!important",
  },
  dropdownHoverCard: {
    top: "38px" + "!important",
    padding: "8px 10px !important",
    fontWeight: "normal",
  },
  InfoIconHover: {
    color: "#1C9689",
    // "&:hover": {
    //   color: "#1C9689",
    // },
  },
  iconHoverStyle: {
    color: "#fff",
    "&:hover": {
      backgroundColor: "transparent" + "!important",
    },
  },
}));

let isShowApproved = true;
let requestedHeading = "";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type THPropsType = {
  title: string;
  onSort?: (ascending: boolean) => void;
  isSortable: boolean;
  toggleSort?: (e: unknown) => void;
  statesfilter: StatesFilterType;
  tableData: any;
  showDeclinedAndResubmitted?: boolean;
  internalFormType?: string;
};

const TH: FC<THPropsType> = ({
  title,
  isSortable = false,
  onSort = null,
  toggleSort,
  statesfilter,
  tableData,
  showDeclinedAndResubmitted,
  internalFormType,
}) => {
  const _userSession = useUserSession();
  const { classes } = useStyles();
  const [ascending, setAscending] = useState(false);

  const userSession = useUserSession();
  const SelfAssessmentCompanies = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "SelfAssessmentFiltersEnable"
  )?.some((y: any) =>
    y.data?.some((d: any) => d.companyId?.includes(userSession?.company?.id))
  );
  const userAIDetails = getUserAIDetails(userSession?.accessToken);
  const isUserAI =
    userAIDetails?.isUserAI === "true" || userAIDetails?.isUserAI === true;
  const { data: InternalCompanyData } =
    useGetGlobalMasterByInternalRequestCompanyQuery();

  const chkCompanyId: any = InternalCompanyData?.GlobalMaster[0].data.filter(
    (a: any) => a.companyId === userSession?.company?.id,
  );

  const capitalizedFormType = internalFormType
    ? String(internalFormType).charAt(0).toUpperCase() + String(internalFormType).slice(1)
    : FormTypes.Assessment;

  const statuses = [
    "All",
    FormInvitationUIStatus.Requested,
    FormInvitationUIStatus.Started,
    ...(_userSession?.user?.role !== AppRoles.Inviter && _userSession?.user?.role !== AppRoles.Responder ? [FormInvitationUIStatus.PendingReview] : []),
    FormInvitationUIStatus.Responded,
    FormInvitationUIStatus.Declined,
    FormInvitationUIStatus.Resubmitted,
    FormInvitationUIStatus.UnderReview,
    FormInvitationUIStatus.Approved,
    ...(isUserAI ? [FormInvitationUIStatus.Processing] : []),
  ];

  if (
    _userSession?.user?.role === AppRoles.Inviter &&
    capitalizedFormType === FormTypes.Report &&
    SelfAssessmentCompanies
  ) {
    statuses.splice(1, 0, FormInvitationUIStatus.ReadyForReporting);
  } else if (
    _userSession?.user?.role === AppRoles.Inviter &&
    capitalizedFormType === FormTypes.Assessment &&
    SelfAssessmentCompanies
  ) {
    statuses.splice(1, 0, FormInvitationUIStatus.ReadyForAssessment);
  }

  const [activeTab, setActiveTab] = useState(statuses[0]);
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));
  const QuestionnareSearchValue = useInvitationListStore(
    (store) => store.QuestionnareSearchValue,
  );
  const OrganizationSearchValue = useInvitationListStore(
    (store) => store.OrganizationSearchValue,
  );
  const isfilterSubmitSet = useInvitationListStore(
    (store) => store.isFilterSubmitSet,
  );
  const isFilterSubmitGet = useInvitationListStore(
    (store) => store.isFilterSubmitGet,
  );
  const OrganizationUserSearchValue = useInvitationListStore(
    (store) => store.OrganizationUserSearchValue,
  );

  const TabActive = useInvitationListStore((store) => store.StatusValue);
  const OrganizationValue = useInvitationListStore(
    (store) => store.OrganizationValue,
  );
  const OrganizationUserValue = useInvitationListStore(
    (store) => store.OrganizationUserValue,
  );
  const QuestionnareValue = useInvitationListStore(
    (store) => store.QuestionnareValue,
  );
  const GlobalValue = useInvitationListStore((store) => store.GlobalValue);

  const StatusValue = useInvitationListStore((store) => store.TabActive);
  const DeleteQuestionnareValue = useInvitationListStore(
    (store) => store.DeleteQuestionnareSearch,
  );
  const DeleteOrganizationValue = useInvitationListStore(
    (store) => store.DeleteOrganizationSearch,
  );
  const DeleteOrganizationUserSearch = useInvitationListStore(
    (store) => store.DeleteOrganizationUserSearch,
  );
  const locationValue = useInvitationListStore((store) => store.LocationValue);
  const DeletelocationValue = useInvitationListStore(
    (store) => store.DeleteLocationSearch,
  );
  const LocationSearchValue = useInvitationListStore(
    (store) => store.LocationSearchValue,
  );

  const sortHandler = (e: any) => {
    if (!isSortable) return;
    setAscending((prev) => !prev);
  };
  const changeTab = (element: any) => {
    setActiveTab(element);
    TabActive(element);
    let data = {
      questionariesSearchValue: QuestionnareValue ?? "",
      organisationSearchValue: OrganizationValue ?? "",
      globalSearchValue: GlobalValue ?? "",
      locationSearchValue: locationValue ?? "",
      organisationUserSearchValue: OrganizationUserValue ?? "",
    };
    statesfilter.getSearchFilter(element, data);
  };
  let globalData = {
    questionariesSearchValue: QuestionnareValue ?? "",
    organisationSearchValue: OrganizationValue ?? "",
    globalSearchValue: GlobalValue ?? "",
    locationSearchValue: locationValue ?? "",
    organisationUserSearchValue: OrganizationUserValue ?? "",
    isfiltersubmitValue: isFilterSubmitGet ?? false,
  };
  useEffect(() => {
    StatusValue === undefined ? TabActive("All") : StatusValue;
    let data = {
      questionariesSearchValue: QuestionnareValue ?? "",
      organisationSearchValue: OrganizationValue ?? "",
      globalSearchValue: GlobalValue ?? "",
      locationSearchValue: locationValue ?? "",
      organisationUserSearchValue: OrganizationUserValue ?? "",
    };
    if (isFilterSubmitGet === true) {
      statesfilter.getOnSubmitSearchFilter(StatusValue ?? "All", data);
    } else {
      statesfilter.getSearchFilter(StatusValue ?? "All", data);
    }
  }, [
    statesfilter,
    QuestionnareValue,
    OrganizationValue,
    StatusValue,
    TabActive,
    GlobalValue,
    locationValue,
    OrganizationUserValue,
    isFilterSubmitGet,
  ]);

  // Check if user has any form with both DocumentCuration and WebCuration (equivalent to docWithAI)
  const hasAnyFullAICuration =
    userAIDetails?.aiPlanDetails?.some((plan: any) => {
      const formId = plan.formId;
      return hasFullAICuration(userSession?.accessToken, formId);
    }) || false;

  if (
    hasAnyFullAICuration &&
    [AppRoles.Inviter, AppRoles.Consultant].includes(
      userSession?.user?.role ?? "",
    )
  ) {
    if (!statuses.includes(FormInvitationUIStatus.Processing)) {
      statuses.push(FormInvitationUIStatus.Processing);
    }
    if (!statuses.includes(FormInvitationUIStatus.Failed)) {
      statuses.push(FormInvitationUIStatus.Failed);
    }
  }


  return (
    <th
      className={classes.tableHeadingBorder}
      style={{ width: title === "Actions" ? "80px" : "" }}
    >
      <Group style={{ position: "relative", width: "max-content" }} spacing={0}>
        <UnstyledButton
          className={classes.tableHeading}
          onClick={(e: any) => {
            sortHandler(e);
            toggleSort?.(e);
          }}
        >
          {title}
          {isSortable && (
            <SortIcons
              sortState={tableData.getIsSorted() as string | false}
              color="#ffffff"
              size={16}
            />
          )}
        </UnstyledButton>
        {title === "Questionnaire" && (
          <Box>
            <ActionIcon
              variant="transparent"
              onClick={() => setOpened(true)}
              //
            >
              <IconFilter
                className={classes.iconHoverStyle}
                style={{ width: "18px" }}
                color={
                  QuestionnareValue !== "" && QuestionnareValue !== undefined
                    ? "orange"
                    : "#fff"
                }
              />
            </ActionIcon>
            {opened && (
              <Paper
                style={{
                  position: "absolute",
                  bottom: "-55px",
                  width: "300px",
                  padding: "8px",
                  left: "0",
                }}
                ref={ref}
                shadow="sm"
              >
                <Box className={`${classes.innersrchbox} searchBoxInner`}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0px",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0px 10px",
                    }}
                    styles={(theme) => ({
                      input: {
                        backgroundColor: "#F1F3F6",
                        borderRadius: "30px",
                        padding: "0px 10px",
                        "&:focus": {
                          border: "none",
                          outline: "none",
                        },
                      },
                      item: {
                        fontSize: "12px",
                        fontWeight: 400,
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
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Questionnaire Name"
                    value={QuestionnareValue ?? ""}
                    onChange={(ev: any) => {
                      QuestionnareSearchValue(ev);
                      if (ev === "") {
                        let data = {
                          questionariesSearchValue: ev ?? "",
                          organisationSearchValue: OrganizationValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                          locationSearchValue: locationValue ?? "",
                          organisationUserSearchValue:
                            OrganizationUserValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e: any) => {
                      QuestionnareSearchValue(e.value);
                      let data = {
                        questionariesSearchValue: e.value ?? "",
                        organisationSearchValue: OrganizationValue ?? "",
                        globalSearchValue: GlobalValue ?? "",
                        locationSearchValue: locationValue ?? "",
                        organisationUserSearchValue:
                          OrganizationUserValue ?? "",
                      };
                      statesfilter.getSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getQuestionariesFilterData(
                        OrganizationValue ?? "",
                        StatusValue ?? "",
                        locationValue ?? "",
                      ) ?? []
                    }
                    limit={50}
                  />
                  {QuestionnareValue !== "" &&
                  QuestionnareValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteQuestionnareValue();
                        setOpened(false);
                      }}
                    >
                      <CloseButton
                        aria-label="Close modal"
                        variant="transparent"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {title === "Requested To User" &&
        userSession?.user?.role === AppRoles.Responder ? (
          <Box>
            <ActionIcon variant="transparent" onClick={() => setOpened(true)}>
              <IconFilter
                className={classes.iconHoverStyle}
                style={{ width: "18px" }}
                color={
                  OrganizationValue &&
                  OrganizationValue !== "" &&
                  OrganizationValue !== undefined
                    ? "orange"
                    : "#fff"
                }
              />
            </ActionIcon>
            {opened && (
              <Paper
                style={{
                  position: "absolute",
                  bottom: "-55px",
                  width: "300px",
                  padding: "8px",
                  left: "0",
                }}
                ref={ref}
                shadow="sm"
              >
                <Box className={`${classes.innersrchbox} searchBoxInner`}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    styles={(theme) => ({
                      item: {
                        fontSize: "12px",
                        fontWeight: 400,
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
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by User Name"
                    value={OrganizationUserValue ?? ""}
                    onChange={(ev: any) => {
                      OrganizationUserSearchValue(ev);
                      isfilterSubmitSet(false);
                      if (ev === "") {
                        let data = {
                          questionariesSearchValue: QuestionnareValue ?? "",
                          organisationSearchValue: ev ?? "",
                          globalSearchValue: GlobalValue ?? "",
                          locationSearchValue: locationValue ?? "",
                          organisationUserSearchValue:
                            OrganizationUserValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e: any) => {
                      OrganizationUserSearchValue(e.value);
                      isfilterSubmitSet(true);
                      let data = {
                        questionariesSearchValue: QuestionnareValue ?? "",
                        organisationSearchValue: e.value ?? "",
                        globalSearchValue: GlobalValue ?? "",
                        locationSearchValue: locationValue ?? "",
                        organisationUserSearchValue:
                          OrganizationUserValue ?? "",
                      };

                      statesfilter.getOnSubmitSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getUserFilterData(
                        OrganizationUserValue ?? "",
                        StatusValue ?? "",
                        locationValue ?? "",
                      ) ?? []
                    }
                    limit={50}
                  />
                  {OrganizationUserValue !== "" &&
                  OrganizationUserValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteOrganizationUserSearch();
                        setOpened(false);
                      }}
                    >
                      <CloseButton
                        aria-label="Close modal"
                        variant="transparent"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        ) : (
          ((title === "Requested To" && chkCompanyId.length === 0) ||
            title === "Requested To User" ||
            title === "Sent To User" ||
            title === "Requested From User") && (
            <Box>
              <ActionIcon variant="transparent" onClick={() => setOpened(true)}>
                <IconFilter
                  className={classes.iconHoverStyle}
                  style={{ width: "18px" }}
                  color={
                    OrganizationValue !== "" && OrganizationValue !== undefined
                      ? "orange"
                      : "#fff"
                  }
                />
              </ActionIcon>
              {opened && (
                <Paper
                  style={{
                    position: "absolute",
                    bottom: "-55px",
                    width: "300px",
                    padding: "8px",
                    left: "0",
                  }}
                  ref={ref}
                  shadow="sm"
                >
                  <Box className={`${classes.innersrchbox} searchBoxInner`}>
                    <Autocomplete
                      classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                      style={{
                        borderBottom: "0",
                        width: "100%",
                        backgroundColor: "#F1F3F6",
                        borderRadius: "30px",
                        padding: "0 10px",
                      }}
                      styles={(theme) => ({
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
                      radius={0}
                      variant="unstyled"
                      placeholder="Search by Organisation Name"
                      value={OrganizationValue ?? ""}
                      onChange={(ev: any) => {
                        OrganizationSearchValue(ev);
                        isfilterSubmitSet(false);
                        if (ev === "") {
                          let data = {
                            questionariesSearchValue: QuestionnareValue ?? "",
                            organisationSearchValue: ev ?? "",
                            globalSearchValue: GlobalValue ?? "",
                            locationSearchValue: locationValue ?? "",
                            organisationUserSearchValue:
                              OrganizationUserValue ?? "",
                          };
                          statesfilter.getSearchFilter(activeTab, data);
                        }
                      }}
                      onItemSubmit={(e: any) => {
                        OrganizationSearchValue(e.value);
                        isfilterSubmitSet(true);
                        let data = {
                          questionariesSearchValue: QuestionnareValue ?? "",
                          organisationSearchValue: e.value ?? "",
                          globalSearchValue: GlobalValue ?? "",
                          locationSearchValue: locationValue ?? "",
                          organisationUserSearchValue:
                            OrganizationUserValue ?? "",
                        };

                        statesfilter.getOnSubmitSearchFilter(activeTab, data);
                      }}
                      data={
                        statesfilter.getOrganisationFilterData(
                          QuestionnareValue ?? "",
                          StatusValue ?? "",
                          locationValue ?? "",
                        ) ?? []
                      }
                      limit={50}
                    />
                    {OrganizationValue !== "" &&
                    OrganizationValue !== undefined ? (
                      <div
                        className={classes.searchresetcont}
                        onClick={() => {
                          DeleteOrganizationValue();
                          setOpened(false);
                        }}
                      >
                        <CloseButton
                          aria-label="Close modal"
                          variant="transparent"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          )
        )}

        {title === "Requested To" &&
          chkCompanyId[0]?.IsShowExternalAssessmentColumn === true && (
            <Box>
              <ActionIcon variant="transparent" onClick={() => setOpened(true)}>
                <IconFilter
                  className={classes.iconHoverStyle}
                  style={{ width: "18px" }}
                  color={
                    OrganizationUserValue &&
                    OrganizationUserValue !== "" &&
                    OrganizationUserValue !== undefined
                      ? "orange"
                      : "#fff"
                  }
                />
              </ActionIcon>
              {opened && (
                <Paper
                  style={{
                    position: "absolute",
                    bottom: "-55px",
                    width: "300px",
                    padding: "8px",
                    left: "0",
                  }}
                  ref={ref}
                  shadow="sm"
                >
                  <Box className={`${classes.innersrchbox} searchBoxInner`}>
                    <Autocomplete
                      classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                      style={{
                        borderBottom: "0",
                        width: "100%",
                        backgroundColor: "#F1F3F6",
                        borderRadius: "30px",
                        padding: "0 10px",
                      }}
                      styles={(theme) => ({
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
                      radius={0}
                      variant="unstyled"
                      placeholder="Search by Company Name"
                      value={OrganizationUserValue ?? ""}
                      onChange={(ev: any) => {
                        OrganizationUserSearchValue(ev);
                        isfilterSubmitSet(false);
                        if (ev === "") {
                          let data = {
                            questionariesSearchValue: QuestionnareValue ?? "",
                            organisationSearchValue: OrganizationValue ?? "",
                            globalSearchValue: GlobalValue ?? "",
                            locationSearchValue: locationValue ?? "",
                            organisationUserSearchValue: ev ?? "",
                          };
                          statesfilter.getSearchFilter(activeTab, data);
                        }
                      }}
                      onItemSubmit={(e) => {
                        OrganizationUserSearchValue(e.value);
                        isfilterSubmitSet(true);
                        let data = {
                          questionariesSearchValue: QuestionnareValue ?? "",
                          organisationSearchValue: OrganizationValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                          locationSearchValue: locationValue ?? "",
                          organisationUserSearchValue: e.value ?? "",
                        };
                        statesfilter.getOnSubmitSearchFilter(activeTab, data);
                      }}
                      data={
                        statesfilter.getUserFilterData(
                          QuestionnareValue ?? "",
                          StatusValue ?? "",
                          locationValue ?? "",
                          OrganizationValue ?? "",
                          OrganizationUserValue ?? "",
                        ) ?? []
                      }
                      limit={50}
                    />
                    {OrganizationUserValue !== "" &&
                    OrganizationUserValue !== undefined ? (
                      <div
                        className={classes.searchresetcont}
                        onClick={() => {
                          DeleteOrganizationUserSearch();
                          setOpened(false);
                        }}
                      >
                        <CloseButton
                          aria-label="Close modal"
                          variant="transparent"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        {title === "Location" && (
          <Box>
            <ActionIcon variant="transparent" onClick={() => setOpened(true)}>
              <IconFilter
                className={classes.iconHoverStyle}
                style={{ width: "18px" }}
                color={
                  locationValue &&
                  locationValue !== "" &&
                  locationValue !== undefined
                    ? "orange"
                    : "#fff"
                }
              />
            </ActionIcon>
            {opened && (
              <Paper
                style={{
                  position: "absolute",
                  bottom: "-55px",
                  width: "300px",
                  padding: "8px",
                  left: "0",
                }}
                ref={ref}
                shadow="sm"
              >
                <Box className={`${classes.innersrchbox} searchBoxInner`}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    styles={(theme) => ({
                      item: {
                        fontSize: "12px",
                        fontWeight: 400,
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
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Location Name"
                    value={locationValue ?? ""}
                    onChange={(ev: any) => {
                      LocationSearchValue(ev);
                      // setLocationSearchFilter(ev);
                      if (ev === "") {
                        let data = {
                          questionnareSearchValue: QuestionnareValue ?? "",
                          organisationSearchValue: OrganizationValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                          locationSearchValue: ev ?? "",
                          organisationUserSearchValue:
                            OrganizationUserValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e: any) => {
                      LocationSearchValue(e.value);
                      // setLocationSearchFilter(e.value);
                      let data = {
                        questionnareSearchValue: QuestionnareValue ?? "",
                        organisationSearchValue: OrganizationValue ?? "",
                        globalSearchValue: GlobalValue ?? "",
                        locationSearchValue: e.value ?? "",
                        organisationUserSearchValue:
                          OrganizationUserValue ?? "",
                      };
                      statesfilter.getOnSubmitSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getlocationFilterData(
                        QuestionnareValue ?? "",
                        OrganizationValue ?? "",
                        StatusValue ?? "",
                      ) ?? []
                    }
                    limit={50}
                  />
                  {!!locationValue ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeletelocationValue();
                        // setLocationSearchFilter("");
                        setOpened(false);
                      }}
                    >
                      <CloseButton
                        aria-label="Close modal"
                        variant="transparent"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        )}
        {title === "Status" && (
          <HoverCard
            width={200}
            // closeOnClickOutside={true}
            position="bottom"
            shadow="md"
          >
            <HoverCard.Target>
              <ActionIcon
                variant="transparent"
                //
              >
                <IconFilter
                  className={classes.iconHoverStyle}
                  style={{ width: "18px" }}
                  color={
                    QuestionnareValue !== "" && QuestionnareValue !== undefined
                      ? "orange"
                      : "#fff"
                  }
                />
              </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown className={classes.dropdownHoverCard}>
              <Group
                style={{
                  flexDirection: "column",
                  alignItems: "self-start",
                  gap: "6px",
                }}
              >
                {statuses.map((element, index: number) => (
                  <>
                    {element === FormInvitationUIStatus.Approved &&
                    isShowApproved ? (
                      <UnstyledButton
                        key={index}
                        onClick={() => changeTab(element)}
                        fw={400}
                        className={
                          StatusValue === element
                            ? classes.activeBtn
                            : classes.filterHoverBtn
                        }
                        sx={{
                          background: "transparent",
                          color: "#666666",
                          width: "100%",
                          borderRadius: "5px",
                          "&:hover": {
                            background:
                              "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                            color: "#ffffff !important",
                          },
                        }}
                      >
                        <Text
                          size={12}
                          color={"#666666"}
                          sx={{
                            padding: "8px 10px",
                            fontWeight: "normal",
                            "&:hover": {
                              color: "#ffffff !important",
                            },
                          }}
                        >
                          {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                            element,
                            globalData,
                          )})`}
                        </Text>
                      </UnstyledButton>
                    ) : (
                      <>
                        {element !== FormInvitationUIStatus.Approved && (
                          <UnstyledButton
                            key={element}
                            onClick={() => changeTab(element)}
                            className={
                              StatusValue === element
                                ? classes.activeBtn
                                : classes.filterHoverBtn
                            }
                            sx={{
                              background: "transparent",
                              color: "#666666",
                              width: "100%",
                              borderRadius: "5px",
                              "&:hover": {
                                background:
                                  "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                                color: "#ffffff !important",
                              },
                            }}
                          >
                            <Text
                              size={12}
                              color={"#666666"}
                              sx={{
                                padding: "8px 10px",
                                fontWeight: "normal",
                                "&:hover": {
                                  color: "#ffffff !important",
                                },
                              }}
                            >
                              {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                                element,
                                globalData,
                              )})`}
                            </Text>
                          </UnstyledButton>
                        )}
                      </>
                    )}
                  </>
                ))}
              </Group>
            </HoverCard.Dropdown>
          </HoverCard>
        )}
      </Group>
    </th>
  );
};

const InvitationTable = ({
  tableheader,
  datatable,
  globalMasterData,
  statesfilter,
  mainLoading,
  locationCount,
  getExcelDownload,
  companyDetails,
  GlobalMaster_InviterFormAutoAppover,
  showDeclinedAndResubmitted,
  internalFormType,
}: {
  tableheader: TableHeader;
  datatable: DataTableType;
  globalMasterData: any;
  statesfilter: StatesFilterType;
  mainLoading: boolean;
  locationCount: any;
  getExcelDownload: any;
  companyDetails?: GetAssessmentListingDetailsQuery["Company"][number];
  GlobalMaster_InviterFormAutoAppover?: GetAssessmentListingDetailsQuery["GlobalMaster_InviterFormAutoAppover"];
  showDeclinedAndResubmitted?: boolean;
  internalFormType?: string;
}) => {
  const { classes } = useStyles();
  const [sortTable, setSortTable] = useState(false);
  const [fetchInvitationStatusCounts, { data: invitationStatusData, loading: detailsLoading }] =
    useGetInvitationStatusCountsLazyQuery({
      fetchPolicy: "cache-first",
    });

  const [fetchAssesseeUserMapping, { data: assesseeUserMappingData, loading: assesseeUserMappingLoading }] = useGetassesseeuserbyinvitationIdLazyQuery({
    fetchPolicy: "cache-first",
  });

  const handleInfoIconClick = (invitationId: string) => {
    fetchInvitationStatusCounts({ variables: { invitationId } });
    if (userSession?.user?.role === AppRoles.Responder) {
      fetchAssesseeUserMapping({ variables: { invitationId } });
    }
  };
  const is1366Resolution = useMediaQuery("(max-width: 1366px)");
  const is1440Resolution = useMediaQuery("(max-width: 1440px)");

  const capitalizedFormType = internalFormType
    ? String(internalFormType).charAt(0).toUpperCase() + String(internalFormType).slice(1)
    : FormTypes.Assessment;

  const sortingTable = () => {
    setSortTable(!sortTable);
  };
  const userSession = useUserSession();
  const userAIDetails = getUserAIDetails(userSession?.accessToken);
  const isAIUser =
    userAIDetails?.aiPlanDetails?.some((plan: any) => hasFullAICuration(userSession?.accessToken, plan.formId)) || false;

  const onClickView = (
    invitationId: String,
    AssessmentFormName: string,
    ComapnyName: string,
    QuestionnareId: String,
    Status: String,
    isCarryForward: boolean,
    isRecommendationIcon: boolean,
    period: string,
    requestedFrom: string,
    Submission_Status: string,
    questionid: string,
    DeviationCount: number,
    IsCarryForward: Boolean,
    SubmissionId: string,
    Score: string,
  ) => {
    // if (Status.toLowerCase() === "started") {
    //   setLocalStorageData(window.localStorage, "IsPageRefreshed", questionid);
    // } else {
    //   setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    // }
    setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");

    const isRecommendationIcon_new =
      Status.toLowerCase() ===
        FormInvitationUIStatus.Started.toLocaleLowerCase() &&
      isRecommendationIcon === true
        ? false
        : isRecommendationIcon;
    postParentMessage(
      viewInvitationMessage(
        invitationId,
        AssessmentFormName,
        ComapnyName,
        isRecommendationIcon_new,
        period,
        requestedFrom,
        questionid,
        DeviationCount,
        IsCarryForward,
        SubmissionId,
        Score,
      ),
    );
  };
  const respondClickHandler = (
    invitationId: String,
    AssessmentFormName: string,
    ComapnyName: string,
    AIStatus: InvitationAIStatus,
    invitationStatus: String,
    AIBulkDocumentProcessings: Record<string, any>[],
    Sources: Record<string, any>[],
  ) => {
    postParentMessage(
      startInvitationMessage(
        invitationId,
        AssessmentFormName,
        ComapnyName,
        AIStatus,
        invitationStatus,
        AIBulkDocumentProcessings,
        Sources,
      ),
    );
  };

  const AIProcessingHandler = (
    invitationId: string,
    AssessmentFormName: string,
    CompanyName: string,
  ) => {
    postParentMessage(
      gotoUploadDocs(
        invitationId,
        AssessmentFormName,
        CompanyName,
        // use AI-capability flag
        true,
      ),
    );
  };
  const { data: InternalCompanyData } =
    useGetGlobalMasterByInternalRequestCompanyQuery();

  const chkCompanyId: any = InternalCompanyData?.GlobalMaster[0].data.filter(
    (a: any) => a.companyId === userSession?.company?.id,
  );

  const isLocationHide =
    chkCompanyId?.length > 0 &&
    chkCompanyId?.filter((a: any) => a.IsListingLocationHide === false).length >
      0
      ? false
      : true;

  const chkCompanyIdather: any = chkCompanyId?.filter(
    (x: any) => x.companyId == AtherCompanyid?.id,
  );

  const requested =
    chkCompanyId?.length > 0
      ? userSession?.user?.role === AppRoles.Inviter ||
        userSession?.user?.role === AppRoles.Consultant
        ? "Requested To User"
        : userSession?.user?.role === AppRoles.Responder
        ? "Requested From"
        : "Requested From User"
      : userSession?.user?.role === AppRoles.Inviter ||
        userSession?.user?.role === AppRoles.Consultant
      ? "Requested To"
      : "Requested From";

  requestedHeading = requested;

  let RequestedTo =
    chkCompanyId?.length > 0
      ? chkCompanyId[0]?.IsShowExternalAssessmentColumn === true &&
        userSession?.user?.role === AppRoles.Inviter
        ? "Requested To"
        : userSession?.user?.role === AppRoles.Responder
        ? "Requested From"
        : userSession?.user?.role === AppRoles.Inviter
        ? "Requested By User"
        : "Requested To"
      : "Requested To";

  const companyId = userSession?.company?.id;

  let IsKhaitan =
    userSession?.company?.id === "decf470d-e27d-41b1-8395-8e941834c3f4"
      ? true
      : false;

  const InviterFormAutoAppoverData = GlobalMaster_InviterFormAutoAppover
    ? {
        GlobalMaster: GlobalMaster_InviterFormAutoAppover,
      }
    : undefined;

  // const { data: InviterFormAutoAppoverData } =
  //   globalMasterDataStorage?.GlobalMaster?.filter(
  //     (x: any) => x.type === "InviterFormAutoAppover"
  //   );
  let formListManualApproval: any = [];
  switch (userSession?.user?.role) {
    case "Inviter":
      {
        InviterFormAutoAppoverData?.GlobalMaster[0]?.data
          ?.filter(
            (item: any) =>
              item.companyId == userSession?.company?.id &&
              item.IsEnable == true &&
              item.IsAutoApprove == false &&
              item.UserId.indexOf(userSession?.user?.id) >= 0,
          )
          .map((z: any) =>
            formListManualApproval.push({
              formId: z.formId,
              companyId: z.companyId,
            }),
          );
      }
      break;
    case "Consultant":
      {
        InviterFormAutoAppoverData?.GlobalMaster[0]?.data
          ?.filter(
            (item: any) =>
              item.companyId == userSession?.company?.id &&
              item.IsEnable == true &&
              item.IsAutoApprove == false &&
              item.UserId.indexOf(userSession?.user?.id) >= 0,
          )
          .map((z: any) =>
            formListManualApproval.push({
              formId: z.formId,
              companyId: z.companyId,
            }),
          );
      }
      break;
    case "Invitee":
      {
        if (Array.isArray(companyDetails)) {
          companyDetails.map((item1: any) => {
            InviterFormAutoAppoverData?.GlobalMaster[0]?.data
              ?.filter(
                (item: any) =>
                  item.companyId == item1.ParentCompany?.id &&
                  item.IsEnable === true &&
                  item.IsAutoApprove === false,
              )
              .map((z: any) => {
                formListManualApproval.push({
                  formId: z.formId,
                  companyId: z.companyId,
                });
              });
          });
        }
      }
      break;
    case "Responder":
      {
        if (Array.isArray(companyDetails)) {
          companyDetails.map((item1: any) => {
            InviterFormAutoAppoverData?.GlobalMaster[0]?.data
              ?.filter(
                (item: any) =>
                  item.companyId == item1.ParentCompany?.id &&
                  item.IsEnable === true &&
                  item.IsAutoApprove === false,
              )
              .map((z: any) => {
                formListManualApproval.push({
                  formId: z.formId,
                  companyId: item1.companyId,
                });
              });
          });
        }
      }
      break;

    default:
      break;
  }
  const GlobalSearchData = useInvitationListStore((store) => store.GlobalValue);

  useEffect(() => {
    if (mainLoading === false && datatable.rows.length === 0) {
      postParentMessage(closeMainLoader());
    }
  }, [mainLoading, datatable.rows.length]);

  // Determine if we should show search results or no data message
  const shouldShowSearchNotFound = useMemo(
    () =>
      !!GlobalSearchData &&
      GlobalSearchData !== "" &&
      datatable.rows.length === 0,
    [GlobalSearchData, datatable.rows.length],
  );

  const shouldShowNoData = useMemo(
    () => !GlobalSearchData && datatable.rows.length === 0 && !mainLoading,
    [GlobalSearchData, datatable.rows.length, mainLoading],
  );

  let isDisable = false;
  let isDisableforMakerChecker = false;
  const isDisableData: Record<string, any>[] = [];
  let statusColor = "#7FAAFF";
  return (
    <>
      <Table className={`${classes.table} defaultTabale`} verticalSpacing="md">
        <thead>
          <tr>
            {tableheader.tableHeadings[0]
              ?.filter((m) =>
                userSession?.user?.role === AppRoles?.Responder
                  ? ![
                      "Id",
                      "SubmissionId",
                      "InviteeCompanyId",
                      "InviteeCompanyName",
                      "QuestionnareId",
                      "isgroupform",
                      "isindustryselected",
                      "groupform",
                      "ParentUserName",
                      "commentCreated_at",
                      "isQuestionReassigned",
                      "Score",
                      "completionPercentage",
                      "isRecommendationIcon",
                      "isCarryForward",
                      "isDeviation",
                      "deviationCount",
                      "Submission_Status",
                      "lastAttemptedQuestionId",
                      "vcCompany",
                      "pcCompany",
                      "ParentUserId",
                      "UserId",
                      "AIStatus",
                      "pcCompanyId",
                      "formId",
                      "failedMessage",
                      "isFileCurating",
                      "Sources",
                      "AIBulkDocumentProcessings",
                      "metadata",
                      "OriginalStatus",
                      "isReviewer",
                      "isSelf",
                    ].includes(m.id)
                  : ![
                      "Id",
                      "SubmissionId",
                      "InviteeCompanyId",
                      "InviteeCompanyName",
                      "QuestionnareId",
                      "isgroupform",
                      "isindustryselected",
                      "groupform",
                      "ParentUserName",
                      "commentCreated_at",
                      "isQuestionReassigned",
                      "isRecommendationIcon",
                      "isCarryForward",
                      "isDeviation",
                      "deviationCount",
                      "Submission_Status",
                      "lastAttemptedQuestionId",
                      "vcCompany",
                      "pcCompany",
                      "ParentUserId",
                      "UserId",
                      "AIStatus",
                      "pcCompanyId",
                      "formId",
                      "failedMessage",
                      "isFileCurating",
                      "Sources",
                      "AIBulkDocumentProcessings",
                      "metadata",
                      "OriginalStatus",
                      "isReviewer",
                      "isSelf",
                    ].includes(m.id),
              )
              .map((element, index) => (
                <TH
                  key={index}
                  title={
                    element.id == "Requested From"
                      ? requested
                      : element.id === "Requested To"
                      ? RequestedTo
                      : element.id
                  }
                  onSort={sortingTable}
                  isSortable={element.id !== "Actions"}
                  toggleSort={element.column.getToggleSortingHandler()}
                  statesfilter={statesfilter}
                  tableData={element.column}
                  showDeclinedAndResubmitted={showDeclinedAndResubmitted}
                  internalFormType={internalFormType}
                />
              ))}
          </tr>
        </thead>
        <tbody>
          {mainLoading ? (
            <></>
          ) : datatable.rows.length > 0 ? (
            datatable.rows.map(
              (row, index) => (
                (statusColor =
                  row.original.Status.toLowerCase() ===
                  FormInvitationUIStatus.Started.toLocaleLowerCase()
                    ? "#FFA93C"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Approved.toLocaleLowerCase()
                    ? "#89F106"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Responded.toLocaleLowerCase()
                    ? "#03F4AC"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Processing.toLocaleLowerCase()
                    ? "#C89FFF"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Requested.toLocaleLowerCase()
                    ? "#7FAAFF"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Failed.toLocaleLowerCase()
                    ? "#FC6D6D"
                    : row.original.Status.toLowerCase() ===
                        FormInvitationUIStatus.ReadyForReporting.toLocaleLowerCase() ||
                      row.original.Status.toLowerCase() ===
                        FormInvitationUIStatus.ReadyForAssessment.toLocaleLowerCase()
                    ? "#FDA5DA"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.PendingReview.toLocaleLowerCase()
                    ? "#FFA93C"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Declined.toLocaleLowerCase()
                    ? "#FC6D6D"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Accepted.toLocaleLowerCase()
                    ? "#89F106"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.Resubmitted.toLocaleLowerCase()
                    ? "#FDA5DA"
                    : row.original.Status.toLowerCase() ===
                      FormInvitationUIStatus.UnderReview.toLocaleLowerCase()
                    ? "#C89FFF"
                    : statusColor),
                (isDisable =
                  row.original.Status.toLowerCase() ==
                  String(FormInvitationStatus.Processing).toLowerCase()),
                isDisableData.push({
                  invitationId: row.original.Id,
                  isDisable: isDisable,
                }),
                (isDisableforMakerChecker =
                  (!row.original.isReviewer &&
                    (row.original.OriginalStatus.toLowerCase() ==
                      FormInvitationUIStatus.PendingReview.toLocaleLowerCase() ||
                      row.original.OriginalStatus.toLowerCase() ==
                        FormInvitationUIStatus.UnderReview.toLocaleLowerCase()) &&
                    (row?.original?.Submission_Status.toLocaleLowerCase() ===
                      FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                      row?.original?.Submission_Status.toLocaleLowerCase() ===
                        FormInvitationUIStatus.Resubmitted.toLocaleLowerCase())) ||
                  (userSession?.user?.role === AppRoles.Responder &&
                    (row.original.OriginalStatus.toLowerCase() ==
                      FormInvitationUIStatus.PendingReview.toLocaleLowerCase() ||
                      row.original.OriginalStatus.toLowerCase() ==
                        FormInvitationUIStatus.UnderReview.toLocaleLowerCase()) &&
                    (row?.original?.Submission_Status.toLocaleLowerCase() ===
                      FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                      row?.original?.Submission_Status.toLocaleLowerCase() ===
                        FormInvitationUIStatus.Resubmitted.toLocaleLowerCase()))),
                (
                  <tr
                    style={{
                      cursor: isDisable
                        ? "not-allowed"
                        : userSession?.user?.role === "Inviter" ||
                          userSession?.user?.role === AppRoles.Consultant
                        ? row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Started.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Responded.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                             FormInvitationUIStatus.Resubmitted.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Approved.toLocaleLowerCase()
                          ? "pointer"
                          : "not-allowed"
                        : "pointer",
                    }}
                    key={index}
                    onClick={(e: any) => {
                      const isInvitationDisable = isDisableData.filter(
                        (item) => item.invitationId == row.original.Id,
                      );
                      if (isInvitationDisable[0].isDisable) {
                        e.preventDefault();
                      } else {
                        row.original.Status.toLowerCase() ==
                        String(FormInvitationStatus.Approved).toLowerCase() ? (
                          <></>
                        ) : userSession?.user?.role === "Inviter" ||
                          userSession?.user?.role === AppRoles.Consultant ? (
                          (row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Started.toLocaleLowerCase() ||
                            row.original.Status.toLowerCase() ===
                              FormInvitationUIStatus.Responded.toLocaleLowerCase() ||
                            row.original.Status.toLowerCase() ===
                              FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                            row.original.Status.toLowerCase() ===
                               FormInvitationUIStatus.Resubmitted.toLocaleLowerCase() ||
                            row.original.Status.toLowerCase() ===
                              FormInvitationUIStatus.Approved.toLocaleLowerCase()) &&
                          onClickView(
                            row.original.Id,
                            row.original.Questionnaire,
                            // row.original.ParentUserName ??
                            //   row.original.InviteeCompanyName,
                            row.original["Requested From"] !== null &&
                              row.original["Requested From"] !== undefined &&
                              row.original["Requested From"] !== "NA"
                              ? row.original["Requested From"]
                              : row.original["Requested To"],
                            row.original.QuestionnareId,
                            row.original.Status,
                            row.original.isCarryForward,
                            row?.original?.isRecommendationIcon,
                            row?.original.Period,
                            row?.original["Requested From"],
                            row.original.Submission_Status,
                            row.original?.lastAttemptedQuestionId,
                            row.original.deviationCount,
                            row.original.isCarryForward,
                            row.original.SubmissionId,
                            row.original.Score,
                          )
                        ) : row.original.Status.toLowerCase() ===
                          FormInvitationUIStatus.Responded.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                          row.original.Status.toLowerCase() ===
                             FormInvitationUIStatus.Resubmitted.toLocaleLowerCase() ? (
                          onClickView(
                            row.original.Id,
                            row.original.Questionnaire,
                            // row.original.ParentUserName ??
                            //   row.original.InviteeCompanyName,
                            row.original["Requested From"] !== null &&
                              row.original["Requested From"] !== undefined &&
                              row.original["Requested From"] !== "NA"
                              ? row.original["Requested From"]
                              : row.original["Requested To"],
                            row.original.QuestionnareId,
                            row.original.Status,
                            row.original.isCarryForward,
                            row?.original?.isRecommendationIcon,
                            row?.original.Period,
                            row?.original["Requested From"],
                            row.original.Submission_Status,
                            row.original?.lastAttemptedQuestionId,
                            row.original.deviationCount,
                            row.original.isCarryForward,
                            row.original.SubmissionId,
                            row.original.Score,
                          )
                        ) : (
                          ""
                        );
                        // Industry selection popup close changes
                        //   respondClickHandler(
                        //     row.original.Id,
                        //     row.original.Questionnaire,
                        //     row.original.ParentUserName ??
                        //       row.original.InviteeCompanyName,
                        //     row?.original?.AIStatus,
                        //     row.original.Status,
                        //     row?.original?.AIBulkDocumentProcessings,
                        //     row?.original?.Sources
                        // );
                      }
                    }}
                    className={`${
                      row.original.Status.toLowerCase() ===
                        FormInvitationUIStatus.Requested.toLocaleLowerCase() &&
                      classes.trStyleNew
                    } ${classes.trStyle}`}
                  >
                    <td className={classes.tdStyle}>
                      <Text size={12} pl={15}>
                        <Tooltip
                          multiline
                          position="bottom-start"
                          offset={0}
                          label={
                            <>
                              <Text size="sm">
                                Questionnaire Name :{" "}
                                {row.original.Questionnaire}
                              </Text>
                              {/* <Text
                                fw={500}
                                style={{
                                  display: "block",
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                }}
                              >
                                {row.original.Questionnaire}
                              </Text> */}
                              {row.original.commentCreated_at && (
                                <>
                                  <Divider my={12} />
                                  <Text size="sm">
                                    Comment last updated on :{" "}
                                    {dayjs(
                                      row.original.commentCreated_at,
                                    ).format("YYYY-MM-DD HH:mm:ss")}
                                  </Text>
                                </>
                              )}
                            </>
                          }
                        >
                          <Box
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                              width: is1366Resolution
                                ? "150px"
                                : is1440Resolution
                                ? "180px"
                                : "250px",
                            }}
                          >
                            {row.original.Questionnaire}
                          </Box>
                        </Tooltip>
                      </Text>
                      {/* <HoverCard width={300} zIndex={9999} shadow="md">
                        <HoverCard.Target>
                          <Text
                            size={12}
                            pl={15}
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                              width: 250,
                            }}
                          >
                            {row.original.Questionnaire}
                          </Text>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <Text size="sm" mb={5}>
                            Questionnaire Name :
                          </Text>
                          <Text
                            fw={500}
                            style={{
                              display: "block",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {row.original.Questionnaire}
                          </Text>
                          {row.original.commentCreated_at && (
                            <>
                              <Divider my="sm" />
                              <Text size="sm" mb={5}>
                                Comment last updated on :
                              </Text>
                              <Text size="sm" fw={500}>
                                {dayjs(row.original.commentCreated_at).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )}
                              </Text>
                            </>
                          )}
                        </HoverCard.Dropdown>
                      </HoverCard> */}
                      {/* <Text size={12} pl={15} title={row.original.Questionnaire}>
                    {row.original.Questionnaire}
                  </Text> */}
                    </td>
                    {/* {
                      // chkCompanyId === undefined &&
                      chkCompanyId?.length === 0 &&
                        userSession?.user?.role === AppRoles.Consultant && (
                          <td className={classes.tdStyle}>
                            <Text
                              size={12}
                              transform="capitalize"
                              title={row.original["Requested By"]}
                            >
                              {row.original["Requested By"]}
                            </Text>
                          </td>
                        )
                    } */}
                    {chkCompanyId?.length > 0 &&
                      userSession?.user?.role === AppRoles.Consultant && (
                        <td className={classes.tdStyle}>
                          <Text size={12} transform="capitalize">
                            {row.original["Requested By"]}
                          </Text>
                        </td>
                      )}
                    {locationCount.Count > 1 &&
                      userSession?.user?.role !== AppRoles.Inviter &&
                      userSession?.user?.role !== AppRoles.Consultant &&
                      chkCompanyId !== undefined &&
                      chkCompanyId?.length > 0 && (
                        <td className={classes.tdStyle}>
                          <Text
                            size={12}
                            transform="capitalize"
                            title={row.original["Requested To"]}
                          >
                            {row.original["Requested To"]}
                          </Text>
                        </td>
                      )}
                    {(userSession?.user?.role === AppRoles.Inviter ||
                      userSession?.user?.role === AppRoles.Consultant) &&
                      chkCompanyId !== undefined &&
                      capitalizedFormType !== FormTypes.Report &&
                      chkCompanyId[0]?.IsShowExternalAssessmentColumn ===
                        true && (
                        <td className={classes.tdStyle}>
                          {/* {row.original["InviteeCompanyId"] !==
                      userSession?.company?.id ? ( */}
                          <Text
                            size={12}
                            transform="capitalize"
                            title={row.original["Requested To"]}
                          >
                            {row.original["Requested To"]}
                          </Text>
                          {/* ) : (
                        <></>
                      )} */}
                        </td>
                      )}

                    {userSession?.user?.role === AppRoles.Responder && (
                      <td className={classes.tdStyle}>
                        <Text
                          size={12}
                          transform="capitalize"
                          title={row.original["Requested From User"]}
                        >
                          {row.original["Requested From User"]}
                        </Text>
                      </td>
                    )}
                    {(userSession?.user?.role === AppRoles.Inviter ||
                      userSession?.user?.role === AppRoles.Consultant) &&
                    chkCompanyId !== undefined &&
                    chkCompanyId[0]?.IsShowExternalAssessmentColumn === true ? (
                      <td className={classes.tdStyle}>
                        {/* {row.original["InviteeCompanyId"] ===
                    userSession?.company?.id ? ( */}
                        <Text
                          size={12}
                          transform="capitalize"
                          title={row.original["Requested From"]}
                        >
                          {row.original["Requested From"]}
                        </Text>
                        {/* ) : (
                       "NA"
                     ) */}
                      </td>
                    ) : (
                      <td className={`${classes.tdStyle}`}>
                        <Text
                          size={12}
                          transform="capitalize"
                          title={row.original["Requested From"]}
                        >
                          {row.original["Requested From"]}
                        </Text>
                      </td>
                    )}
                    {/* <td className={classes.tdStyle}>
                  <Text
                    size={12}
                    transform="capitalize"
                    title={row.original["Requested From"]}
                  >
                    {row.original["Requested From"]}
                  </Text>
                </td> */}
                    {chkCompanyId === undefined &&
                      chkCompanyId?.length === 0 &&
                      userSession?.user?.role === AppRoles.Inviter && (
                        <td className={classes.tdStyle}>
                          <Text size={12} transform="capitalize">
                            {row.original["Requested By"]}
                          </Text>
                        </td>
                      )}
                    {chkCompanyId !== undefined &&
                      chkCompanyId?.length > 0 &&
                      locationCount.Count > 1 && (
                        //userSession?.user?.role !== AppRoles.Consultant && //commented  to hide for consultant
                        <td className={classes.tdStyle}>
                          <Text size={12} title={row.original["Location"]}>
                            {row.original["Location"]}
                          </Text>
                        </td>
                      )}
                    {chkCompanyId !== undefined &&
                      chkCompanyId?.length > 0 &&
                      isLocationHide === false &&
                      locationCount.Count === 0 &&
                      userSession?.user?.role === AppRoles.Inviter && (
                        <td className={`${classes.tdStyle}`}>
                          {/* {row.original["InviteeCompanyId"] ===
                      userSession?.company?.id ? ( */}
                          <Text size={12} title={row.original["Location"]}>
                            {row.original["Location"]}
                          </Text>
                          {/* ) : (
                        "NA"
                      ) */}
                        </td>
                      )}
                    {chkCompanyId !== undefined &&
                      chkCompanyId?.length > 0 &&
                      isLocationHide === false &&
                      locationCount.Count === 1 &&
                      userSession?.user?.role === AppRoles.Inviter && (
                        <td className={classes.tdStyle}>
                          {/* {row.original["InviteeCompanyId"] ===
                      userSession?.company?.id ? ( */}
                          <Text size={12} title={row.original["Location"]}>
                            {row.original["Location"]}
                          </Text>
                          {/* ) : (
                        "NA"
                      ) */}
                        </td>
                      )}
                    <td className={classes.tdStyle}>
                      <Text size={12} title={row.original.Period}>
                        {row.original.Period}
                      </Text>
                    </td>
                    <td className={classes.tdStyle}>
                      <Text size={12} title={row.original["Requested On"]}>
                        {row.original["Requested On"]}
                      </Text>
                    </td>
                    <td className={classes.tdStyle}>
                      <Box className={classes.statusTd}>
                        {row.original.Status.toLowerCase() ===
                            FormInvitationUIStatus.Processing.toLocaleLowerCase() && isAIUser ? 
                            <Button
                              color="aiGradientBtn"
                              leftIcon={<AISparkleIcon width={14} height={14} />}
                              sx={{pointerEvents: 'none'}}
                              h={23}
                              p="4px 8px"
                              fw={400}
                              fz={12}
                              tt="capitalize"
                              lts="normal"
                              styles={{
                                leftIcon:{
                                  marginRight: 5,
                                }
                              }}
                            >
                              {row.original.Status}
                            </Button>
                          :
                          <Text
                            size={12}
                            fw={400}
                            tt="capitalize"
                            c="#444444"
                            style={{
                              borderRadius: "20px",
                              backgroundColor: statusColor,
                            }}
                            h={23}
                            p="4px 8px"
                            className="status-div"
                          >
                            {row.original.Status}
                            {row.original.Status.toLowerCase() ===
                              FormInvitationUIStatus.Failed.toLocaleLowerCase() && (
                              <HoverCard
                                withArrow
                                shadow="md"
                                openDelay={200}
                                closeDelay={400}
                              >
                                <HoverCard.Target>
                                  <ActionIcon
                                    variant="transparent"
                                    radius="xs"
                                    p={0}
                                    size={15}
                                  >
                                    <IconInfoCircle color="#000000" />
                                  </ActionIcon>
                                </HoverCard.Target>
                                <HoverCard.Dropdown p="xs">
                                  <Text fz="sm" c="#000000" tt="none">
                                    {row.original.failedMessage}
                                  </Text>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            )}

                            {/* Information icon for Submitted status for Responder */}
                            {row.original.OriginalStatus.toLowerCase() ===
                              FormInvitationStatus.Submitted.toLocaleLowerCase() &&
                              userSession?.user?.role === AppRoles.Responder && (
                                <HoverCard
                                  withArrow
                                  shadow="md"
                                  openDelay={200}
                                  closeDelay={400}
                                >
                                  <HoverCard.Target>
                                    <ActionIcon
                                      variant="transparent"
                                      radius="xs"
                                      p={0}
                                      size={15}
                                    >
                                      <IconInfoCircle color="#000000" />
                                    </ActionIcon>
                                  </HoverCard.Target>
                                  <HoverCard.Dropdown p="xs">
                                    <Text fz="sm" c="#000000" tt="none">
                                      {`The final ${
                                        capitalizedFormType === FormTypes.Report
                                          ? "report"
                                          : "assessment"
                                      } has been submitted. No further changes can be made. `}
                                    </Text>
                                  </HoverCard.Dropdown>
                                </HoverCard>
                              )}

                            {/* Information icon for Declined or Re-Submitted status */}
                            {(row.original.Status.toLocaleLowerCase() ===
                              FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                              row.original.Submission_Status?.toLocaleLowerCase() ===
                              FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                              row.original.Status.toLocaleLowerCase() ===
                              FormInvitationUIStatus.Resubmitted.toLocaleLowerCase() ||
                              row.original.Submission_Status?.toLocaleLowerCase() ===
                              FormInvitationUIStatus.Resubmitted.toLocaleLowerCase() ||
                              row.original.Submission_Status?.toLocaleLowerCase() === "resubmitted") && (
                                <HoverCard
                                  withArrow
                                  shadow="md"
                                  openDelay={200}
                                  closeDelay={400}
                                  onOpen={() => handleInfoIconClick(row.original.Id)}
                                >
                                  <HoverCard.Target>
                                    <ActionIcon
                                      variant="transparent"
                                      radius="xs"
                                      p={0}
                                      size={15}
                                    >
                                      <IconInfoCircle color="#000000" />
                                    </ActionIcon>
                                  </HoverCard.Target>
                                    <HoverCard.Dropdown className={classes.tooltipDropdown}>
                                      {detailsLoading ? (
                                        <Loader size="xs" color="white" />
                                      ) : (
                                        <Box>
                                           {(() => {
                                             const currentInvitationData =
                                               invitationStatusData?.FormInvitation?.[0]?.id ===
                                               row.original.Id
                                                 ? invitationStatusData.FormInvitation[0]
                                                 : null;

                                             const assignedQuestionIds = userSession?.user?.role === AppRoles.Responder && assesseeUserMappingData?.AssesseeUserMapping
                                               ? assesseeUserMappingData.AssesseeUserMapping
                                                   .filter((m: any) => m.userId === userSession?.user?.id)
                                                   .map((m: any) => m.questionId)
                                               : [];

                                             let decCount =
                                               currentInvitationData?.Declined_Questions_aggregate
                                                 ?.aggregate?.count || 0;
                                             let resubCount =
                                               currentInvitationData?.Resubmitted_Questions_aggregate
                                                 ?.aggregate?.count || 0;
                                             let totalQ =
                                               currentInvitationData?.Form?.FormFields_aggregate
                                                 ?.aggregate?.count || 0;

                                             if (userSession?.user?.role === AppRoles.Responder && assignedQuestionIds.length > 0) {
                                               const reviewerMappings = currentInvitationData?.ReviewerDetailsMappings || [];
                                               decCount = reviewerMappings.filter((m: any) => 
                                                 assignedQuestionIds.includes(m.questionId) && m.currentStatus === "Declined"
                                               ).length;
                                               resubCount = reviewerMappings.filter((m: any) => 
                                                 assignedQuestionIds.includes(m.questionId) && m.currentStatus === "Re-Submitted"
                                               ).length;
                                               totalQ = assignedQuestionIds.length;
                                             }

                                            if (decCount > 0 || resubCount > 0) {
                                              return (
                                                <>
                                                  {decCount > 0 && (
                                                    <Text fz="sm" c="white" tt="none">
                                                      {`Total ${decCount}/${totalQ} Questions Declined`}
                                                    </Text>
                                                  )}
                                                  {resubCount > 0 && (
                                                    <Text fz="sm" c="white" tt="none">
                                                      {`Total ${resubCount}/${totalQ} Questions Re-Submitted`}
                                                    </Text>
                                                  )}
                                                </>
                                              );
                                            } else {
                                              return (
                                                <Text fz="sm" c="white" tt="none">
                                                  {row.original.Status.toLocaleLowerCase() ===
                                                  FormInvitationUIStatus.Declined.toLocaleLowerCase() ||
                                                  row.original.Submission_Status?.toLocaleLowerCase() ===
                                                  FormInvitationUIStatus.Declined.toLocaleLowerCase()
                                                    ? `Total ${decCount}/${totalQ} Questions Declined`
                                                    : `Total ${resubCount}/${totalQ} Questions Re-Submitted`}
                                                </Text>
                                              );
                                            }
                                          })()}
                                        </Box>
                                      )}
                                    </HoverCard.Dropdown>
                                </HoverCard>
                              )}
                          </Text>
                          }
                      </Box>
                    </td>
                    {userSession?.user?.role !== AppRoles?.Responder && (
                      <td className={classes.tdStyle}>
                        {row.original.Submission_Status === "Submitted" ||
                        row.original.Submission_Status === "InProgress" ? (
                          <Tooltip position="bottom" label="Processing...">
                            <Text size={12} color="orange">
                              <IconClockPause />
                            </Text>
                          </Tooltip>
                        ) : row.original.Submission_Status === "Failed" ? (
                          <Tooltip position="bottom" label="Failed">
                            <Text size={12} color="red">
                              <IconClockPause />
                            </Text>
                          </Tooltip>
                        ) : isNaN(parseFloat(row.original.Score)) ? (
                          <Text size={12}>{row.original.Score}</Text>
                        ) : (
                          <Text size={12}>
                            {Math.round(parseFloat(row.original.Score))}
                          </Text>
                        )}
                      </td>
                    )}
                    {userSession?.user?.role !== AppRoles?.Responder && (
                      <td className={classes.tdStyle}>
                        <Flex align={"center"} gap={5} wrap="nowrap">
                          <Text
                            w={"25%"}
                            size={10}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {row.original.Status === "Approved" ||
                            row.original.Status === "Responded"
                              ? 100
                              : !!row.original["Completion (%)"]
                              ? row.original["Completion (%)"]
                              : 0}
                            %
                          </Text>
                          <Progress
                            color={"#1C9689"}
                            w={"80px"}
                            value={
                              row.original.Status === "Approved" ||
                              row.original.Status === "Responded"
                                ? 100
                                : !!row.original["Completion (%)"]
                                ? row.original["Completion (%)"]
                                : 0
                            }
                          />
                        </Flex>
                      </td>
                    )}
                    <td className={classes.tdStyle}>
                      <Box
                        className={`${classes.actionTd} dropdown-assesmment-box test`}
                      >
                        <InvitationButtons
                          row={row}
                          userSession={userSession}
                          globalMasterData={globalMasterData}
                          formListManualApproval={formListManualApproval}
                          chkCompanyId={chkCompanyId}
                          GlobalMaster_InviterFormAutoAppover={
                            GlobalMaster_InviterFormAutoAppover
                          }
                          companyDetails={companyDetails}
                          isDisable={isDisable}
                          isDisableforMakerChecker={isDisableforMakerChecker}
                          AIStatus={row?.original?.AIStatus}
                        />
                      </Box>
                    </td>
                  </tr>
                )
              ),
            )
          ) : !!GlobalSearchData && GlobalSearchData !== "" ? (
            <tr className={classes.trStyle}>
              <td colSpan={12} style={{ textAlign: "center" }}>
                Your search <b>{GlobalSearchData}</b> is not found in our
                records. Try something else.
              </td>
            </tr>
          ) : !mainLoading && datatable.rows.length === 0 ? (
            <tr className={classes.trStyle}>
              <td colSpan={12} style={{ textAlign: "center" }}>
                No data found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </>
  );
};

const StatesHeader = ({
  statesfilter,
  locationCount,
  getExcelDownload,
  showDeclinedAndResubmitted,
  internalFormType,
}: {
  statesfilter: StatesFilterType;
  locationCount: any;
  getExcelDownload: any;
  showDeclinedAndResubmitted?: boolean;
  internalFormType?: string;
}) => {
  const userSession = useUserSession();
  const { classes } = useStyles();
  const userAIDetails = getUserAIDetails(userSession?.accessToken);
  const isUserAI =
    userAIDetails?.isUserAI === "true" || userAIDetails?.isUserAI === true;

  const capitalizedFormType = internalFormType
    ? String(internalFormType).charAt(0).toUpperCase() + String(internalFormType).slice(1)
    : FormTypes.Assessment;

  const SelfAssessmentCompanies = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "SelfAssessmentFiltersEnable"
  )?.some((y: any) =>
    y.data?.some((d: any) => d.companyId?.includes(userSession?.company?.id))
  );
  const statuses = [
    "All",
    FormInvitationUIStatus.Requested,
    FormInvitationUIStatus.Started,
    FormInvitationUIStatus.Responded,
    ...(userSession?.user?.role !== AppRoles.Inviter && userSession?.user?.role !== AppRoles.Responder ? [FormInvitationUIStatus.PendingReview] : []),
    FormInvitationUIStatus.Approved,
    // ...(showDeclinedAndResubmitted
    //   ? [FormInvitationUIStatus.Declined, FormInvitationUIStatus.Resubmitted]
    //   : []),
    FormInvitationUIStatus.Declined, 
    FormInvitationUIStatus.Resubmitted,
    FormInvitationUIStatus.UnderReview,
    
    ...(isUserAI ? [FormInvitationUIStatus.Processing] : []),
  ];

  const hasAnyFullAICuration =
    userAIDetails?.aiPlanDetails?.some((plan: any) => {
      const formId = plan.formId;
      return hasFullAICuration(userSession?.accessToken, formId);
    }) || false;

  if (
    hasAnyFullAICuration &&
    [AppRoles.Inviter, AppRoles.Consultant].includes(
      userSession?.user?.role ?? "",
    )
  ) {
    if (!statuses.includes(FormInvitationUIStatus.Processing)) {
      statuses.push(FormInvitationUIStatus.Processing);
    }
    if (!statuses.includes(FormInvitationUIStatus.Failed)) {
      statuses.push(FormInvitationUIStatus.Failed);
    }
  }

  if (
    userSession?.user?.role === AppRoles.Inviter &&
    capitalizedFormType === FormTypes.Report &&
    SelfAssessmentCompanies
  ) {
    statuses.splice(1, 0, FormInvitationUIStatus.ReadyForReporting);
  } else if (
    userSession?.user?.role === AppRoles.Inviter &&
    capitalizedFormType === FormTypes.Assessment &&
    SelfAssessmentCompanies
  ) {
    statuses.splice(1, 0, FormInvitationUIStatus.ReadyForAssessment);
  }

  const [activeTab, setActiveTab] = useState(statuses[0]);
  const [globalSearchFilter, setGlobalSearchFilter] = useState("");
  const [sortByComment, setSortByComment] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isShowClearAll, setShowClearAll] = useState(false);
  const OrganizationValue = useInvitationListStore(
    (store) => store.OrganizationValue,
  );

  const OrganizationUserValue = useInvitationListStore(
    (store) => store.OrganizationUserValue,
  );
  const QuestionnareValue = useInvitationListStore(
    (store) => store.QuestionnareValue,
  );
  const GlobalSearchValue = useInvitationListStore(
    (store) => store.GlobalSearchValue,
  );
  const GlobalValue = useInvitationListStore((store) => store.GlobalValue);
  const StatusValue = useInvitationListStore((store) => store.TabActive);
  const TabActive = useInvitationListStore((store) => store.StatusValue);
  const DeleteOrganizationValue = useInvitationListStore(
    (store) => store.DeleteOrganizationSearch,
  );
  const DeleteQuestionnareValue = useInvitationListStore(
    (store) => store.DeleteQuestionnareSearch,
  );
  const DeleteGlobalValue = useInvitationListStore(
    (store) => store.DeleteGlobalSearch,
  );
  const locationValue = useInvitationListStore((store) => store.LocationValue);
  const DeletelocationValue = useInvitationListStore(
    (store) => store.DeleteLocationSearch,
  );

  const DeleteOrganizationUserSearch = useInvitationListStore(
    (store) => store.DeleteOrganizationUserSearch,
  );

  const isFilterSubmitGet = useInvitationListStore(
    (store) => store.isFilterSubmitGet,
  );

  const changeTab = (element: any) => {
    setActiveTab(element);
    TabActive(element);
    let data = {
      questionariesSearchValue: QuestionnareValue ?? "",
      organisationSearchValue: OrganizationValue ?? "",
      globalSearchValue: GlobalValue ?? "",
      locationSearchValue: locationValue ?? "",
      organisationUserSearchValue: OrganizationUserValue ?? "",
    };
    statesfilter.getSearchFilter(element, data);
  };
  let globalData = {
    questionariesSearchValue: QuestionnareValue ?? "",
    organisationSearchValue: OrganizationValue ?? "",
    globalSearchValue: GlobalValue ?? "",
    locationSearchValue: locationValue ?? "",
    organisationUserSearchValue: OrganizationUserValue ?? "",
    isfiltersubmitValue: isFilterSubmitGet ?? false,
  };
  useEffect(() => {
    let data = {
      questionariesSearchValue: QuestionnareValue ?? "",
      organisationSearchValue: OrganizationValue ?? "",
      globalSearchValue: GlobalValue ?? "",
      locationSearchValue: locationValue ?? "",
      organisationUserSearchValue: OrganizationUserValue ?? "",
    };
    statesfilter.getSearchFilter(StatusValue ?? "", data);
    if (
      !!QuestionnareValue ||
      !!OrganizationValue ||
      !!GlobalValue ||
      !!locationValue ||
      StatusValue !== "All" ||
      !!OrganizationUserValue
    ) {
      setShowClearAll(true);
    } else if (!!!GlobalValue) {
      setShowClearAll(false);
    }
  }, [
    StatusValue,
    globalSearchFilter,
    statesfilter,
    QuestionnareValue,
    OrganizationValue,
    GlobalValue,
    locationValue,
    OrganizationUserValue,
  ]);
  const clearAllData = () => {
    TabActive("All");
    DeleteOrganizationValue();
    DeleteQuestionnareValue();
    DeleteGlobalValue();
    DeletelocationValue();
    setGlobalSearchFilter("");
    setShowClearAll(false);
    DeleteOrganizationUserSearch();
  };

  const SortByComment = () => {
    statesfilter.getSortByComment(!sortByComment);
    setSortByComment(!sortByComment);
  };
  const listingPageDataInExcel = () => {
    getExcelDownload();
  };
  useEffect(() => {
    if (userSession?.user?.role !== undefined)
      setUserRole(userSession?.user?.role);
  }, [userSession]);

  const [isfocused, setisfocused] = useState(false);
  return (
    // Status Filters Start Here
    //
    <>
      <Box
        className={[classes.topTableFilters, classes.commonMargin].join(" ")}
        style={{
          marginBottom: "15px",
          marginTop: "0",
          display: "flex",
          flex: "0 0 40%",
          maxWidth: "40%",
          rowGap: "0px",
          columnGap: "15px",
        }}
      >
        {statuses.map((element, index: number) => (
          <>
            {element === FormInvitationUIStatus.Approved && isShowApproved ? (
              <UnstyledButton
                key={index}
                onClick={() => changeTab(element)}
                style={{ paddingLeft: "0px", paddingRight: "12px" }}
              >
                <Text
                  size={16}
                  className={
                    StatusValue === element
                      ? classes.active
                      : classes.filterHover
                  }
                  color={"#444"}
                  weight={500}
                >
                  {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                    element,
                    globalData,
                  )})`}
                </Text>
              </UnstyledButton>
            ) : (
              <>
                {element !== FormInvitationUIStatus.Approved && (
                  <UnstyledButton
                    key={element}
                    onClick={() => changeTab(element)}
                    style={{ paddingLeft: "0px", paddingRight: "0px" }}
                  >
                    <Text
                      size={16}
                      className={
                        StatusValue === element
                          ? classes.active
                          : classes.filterHover
                      }
                      color={"#444"}
                      weight={500}
                    >
                      {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                        element,
                        globalData,
                      )})`}
                    </Text>
                  </UnstyledButton>
                )}
              </>
            )}
          </>
        ))}
      </Box>
      <Box className={classes.textFieldFilter}>
        {/* <Box className={classes.innersrchbox}>
          <Autocomplete
            style={{
              borderBottom: "0px",
              width: "100%",
              backgroundColor: "#F1F3F6",
              borderRadius: "30px",
              padding: "0 10px",
            }}
            radius={0}
            variant="unstyled"
            placeholder="Search by Questionnaire  Name"
            value={questionnareSearchFilter}
            onChange={(ev: any) => {
              setQuestionnareSearchFilter(ev);
              if (ev === "") {
                let data = {
                  questionariesSearchValue: ev ?? "",
                  organisationSearchValue: organizationSearchFilter,
                };
                statesfilter.getSearchFilter(activeTab, data);
              }
            }}
            onItemSubmit={(e) => {
              setQuestionnareSearchFilter(e.value);
              let data = {
                questionariesSearchValue: e.value ?? "",
                organisationSearchValue: organizationSearchFilter,
              };
              statesfilter.getSearchFilter(activeTab, data);
            }}
            data={
              statesfilter.getQuestionariesFilterData(
                organizationSearchFilter
              ) ?? []
            }
          />
          {questionnareSearchFilter !== "" ? (
            <div
              className={classes.searchresetcont}
              onClick={() => {
                setQuestionnareSearchFilter("");
              }}
            >
              <CloseButton aria-label="Close modal" variant="transparent" />
            </div>
          ) : (
            ""
          )}
        </Box>
        <Box className={classes.innersrchbox}>
          <Autocomplete
            style={{
              borderBottom: "0",
              width: "100%",
              backgroundColor: "#F1F3F6",
              borderRadius: "30px",
              padding: "0 10px",
            }}
            radius={0}
            variant="unstyled"
            placeholder="Search by Organisation Name"
            value={organizationSearchFilter}
            onChange={(ev: any) => {
              setOrganizationSearchFilter(ev);
              if (ev === "") {
                let data = {
                  questionariesSearchValue: questionnareSearchFilter,
                  organisationSearchValue: ev ?? "",
                };
                statesfilter.getSearchFilter(activeTab, data);
              }
            }}
            onItemSubmit={(e) => {
              setOrganizationSearchFilter(e.value);
              let data = {
                questionariesSearchValue: questionnareSearchFilter,
                organisationSearchValue: e.value ?? "",
              };

              statesfilter.getSearchFilter(activeTab, data);
            }}
            data={
              statesfilter.getOrganisationFilterData(
                questionnareSearchFilter
              ) ?? []
            }
          />
          {organizationSearchFilter !== "" ? (
            <div
              className={classes.searchresetcont}
              onClick={() => {
                setOrganizationSearchFilter("");
              }}
            >
              <CloseButton aria-label="Close modal" variant="transparent" />
            </div>
          ) : (
            ""
          )}
        </Box> */}
        <Box
          className={classes.innersrchbox2}
          style={{ display: "flex", alignItems: "center" }}
        >
          {locationCount.IsSortButtonShow > 0 ? (
            <>
              <UnstyledButton
                style={{
                  color: "#666666",
                  padding: "3px 0px",
                  marginBottom: "15px",
                }}
                ml={10}
                onClick={SortByComment}
              >
                <Text
                  size={16}
                  className={classes.filterHover}
                  color={"#444"}
                  weight={500}
                >
                  Sort by Latest Comment
                </Text>
              </UnstyledButton>
              <Tooltip
                multiline
                width={300}
                label="When you click on this button, the assessments will be sorted and displayed based on the time of the most recent comment added to each of them."
                color="dark"
                position="bottom-start"
                offset={0}
              >
                <UnstyledButton
                  style={{
                    color: "#2c9e92",
                    padding: "3px 0px 3px 0px",
                    margin: "2px 5px 15px 5px",
                  }}
                  mr={10}
                  ml={0}
                >
                  <IconInfoCircle
                    size=".8rem"
                    className={classes.InfoIconHover}
                  />
                </UnstyledButton>
              </Tooltip>
            </>
          ) : (
            ""
          )}
          {userRole === "Inviter" && (
            <>
              <UnstyledButton
                style={{
                  color: "#666666",
                  padding: "3px 0px 4px 10px",
                  marginBottom: "15px",
                  marginRight: "0px",
                }}
                mr={10}
                onClick={listingPageDataInExcel}
              >
                <Text
                  size={16}
                  className={classes.filterHover}
                  color={"#444"}
                  weight={500}
                >
                  Download
                </Text>
              </UnstyledButton>
              <Tooltip
                multiline
                width={300}
                label="Clicking this button will download a summarized status of assessments for all invitations in an Excel file."
                color="dark"
                position="bottom-start"
                offset={0}
              >
                <UnstyledButton
                  style={{
                    color: "#0c9e92",
                    padding: "3px 0px 3px 0px",
                  }}
                  mt={2}
                  mb={15}
                  mr={isShowClearAll === true ? 5 : 22}
                  ml={5}
                >
                  <IconInfoCircle
                    size=".8rem"
                    className={classes.InfoIconHover}
                  />
                </UnstyledButton>
              </Tooltip>
            </>
          )}

          {isShowClearAll === true ? (
            <UnstyledButton
              style={{
                // borderColor: "#666666",
                // borderRadius: "20px",
                color: "#666666",
                // height: "28px",
                padding: "3px 10px",
                marginBottom: "15px",
                marginRight: "0px",
                // background: "transparent" + "!important",
              }}
              mr={10}
              onClick={clearAllData}
            >
              <Text
                size={16}
                className={classes.filterHover}
                color={"#444"}
                weight={500}
              >
                Clear All
              </Text>
            </UnstyledButton>
          ) : (
            <></>
          )}

          <Autocomplete
            style={{
              width: "70%",
              backgroundColor: "#F1F3F6",
              borderRadius: "30px",
              border: "1px solid #F1F3F6",
              padding: "0px",
              marginBottom: "18px",
              paddingRight: 22,
              paddingLeft: 10,
              color: "#424143",
            }}
            icon={<SearchIcon color={isfocused ? "#005C81" : "#666666"} />}
            radius={0}
            variant="unstyled"
            placeholder={
              // "Search by Questionnaire / " + requestedHeading + " / Status"
              "Search..."
            }
            value={globalSearchFilter}
            onChange={(ev: any) => {
              setGlobalSearchFilter(ev);
              GlobalSearchValue(ev);
              if (ev === "") {
                let data = {
                  globalSearchValue: ev ?? "",
                };
                statesfilter.getSearchFilter(activeTab, data);
              }
            }}
            classNames={{
              input: "searchInput",
              root: `${
                isfocused
                  ? "SearchInputBoxFocus"
                  : "mantine-Autocomplete-root SearchInputBox"
              } `,
            }}
            className={`${classes.searchInputWrapper} 
             `}
            onItemSubmit={(e: any) => {
              setGlobalSearchFilter(e.value);
              GlobalSearchValue(e.value);
              let data = {
                globalSearchValue: e.value ?? "",
              };
              statesfilter.getSearchFilter(activeTab, data);
            }}
            onFocus={() => setisfocused(true)}
            onBlur={() => setisfocused(false)}
            data={statesfilter.getGlobalFilterData(globalSearchFilter) ?? []}
          />
          {globalSearchFilter !== "" && globalSearchFilter !== undefined ? (
            <div
              className={classes.searchresetcont}
              onClick={() => {
                setGlobalSearchFilter("");
                DeleteGlobalValue();
              }}
            >
              <CloseButton
                aria-label="Close modal"
                variant="transparent"
                //className="SearchInputClose"
                className={
                  isfocused ? "SearchInputCloseFocus" : "SearchInputClose"
                }
                color="#005C81"
              />
            </div>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </>
    // Status Filters Ends Here
  );
};

const Footer = ({ pagination }: { pagination: PaginationType }) => {
  const [activePage, setActivePage] = useState<number | null>(null);
  const { classes } = useStyles();

  useEffect(() => {
    // Set initial page
    if (!!activePage && !!pagination?.page && !!pagination) {
      if (activePage !== pagination?.page) {
        if (activePage === null) {
          setActivePage(pagination?.page || 1);
        }

        // Ensure activePage does not exceed total pages
        // Use the last activePage if e is 1
        const pageToUse =
          activePage === null || activePage === 1
            ? activePage || 1
            : activePage;

        // Ensure activePage does not exceed total pages
        const totalPages = pagination?.getTotalCount ?? 0;
        if (pageToUse > totalPages) {
          setActivePage(1);
          pagination?.onPageChange(1);
        } else {
          // Handle page change and fetch data
          pagination?.onPageChange(pageToUse);
        }
      }
    }
  }, [activePage, pagination?.page, pagination]);
  // Handle page change
  const handlePageChange = (e: any) => {
    setActivePage(e);
  };
  return (
    <Pagination
      pt={10}
      classNames={{ item: classes.paginationItem }}
      total={pagination?.getTotalCount ?? 0}
      page={activePage ?? 1}
      onChange={handlePageChange}
    />
  );
};

const ProcessingAlert = ({
  datatable,
}: {
  datatable: DataTableType;
}) => {
  const userSession = useUserSession();

  // Collect all processing invitations that are relevant for the current user's role.
  // Uses allData (full unpaginated dataset) so the alert isn't missed on other pages.
  const relevantProcessingInvitations = datatable.allData.filter((invitation) => {
    const isProcessing =
      invitation.Status.toLowerCase() ===
      FormInvitationUIStatus.Processing.toLowerCase();

    if (!isProcessing) return false;
    // Don't show alert for reviewers/checkers
    if (invitation.isReviewer) return false;

    // For Invitee users, include any processing invitation
    if (userSession?.user?.role === AppRoles.Invitee) {
      return true;
    }

    // For Inviter users, only include self-sent assessments
    if (userSession?.user?.role === AppRoles.Inviter) {
      const ParentUserId = invitation.ParentUserId;
      const UserId = invitation.UserId;
      const hasValidUserIds = !!ParentUserId && !!UserId;
      return hasValidUserIds && ParentUserId === UserId;
    }

    return false;
  });

  if (relevantProcessingInvitations.length === 0) return null;

  // If any processing invitation has AI curations (WebCuration / DocumentCuration),
  // show the AI note. If all invitations only have OPSToIQCuration, show the OPS note.
  const hasAICuration = relevantProcessingInvitations.some((invitation) => {
    const allowedAICuration: string[] =
      invitation.metadata?.AIData?.allowedAICuration ?? [];
    return allowedAICuration.some(
      (curation) => curation !== AIProcessingTypes.OPSToIQCuration
    );
  });

  const alertText = hasAICuration
    ? "AI processing underway. You'll receive an email notification once it's complete."
    : "Processing Activity data. You'll receive an email notification once it's complete.";

  return (
    <Paper
      p="xs"
      sx={{
        borderRadius: "5px",
        border: hasAICuration ? "1px solid transparent" : "1px solid rgba(252, 143, 0, 0.5)",
        background: hasAICuration ? 
          "linear-gradient(129.57deg, #DAF1FF 6.66%, #F9DAFF 96.23%) padding-box, \
                linear-gradient(270.44deg, #00A7E3 0.03%, #DCB2FF 52.88%, #AE41F6 99.96%) border-box" : "#fff9ef",
      }}
      mb={15}
    >
      <Flex gap="sm" align="center">
        {hasAICuration && <IconSparkles width={24} height={24} color="#AE41F6" />}
        <Text
          fz={14}
          fw={500}
          sx={{
            ...(hasAICuration
              ? {
                  background:
                    "linear-gradient(270.44deg, #00A7E3 0.03%, #AE41F6 99.96%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text", // for Firefox
                }
              : {
                  color: "#fc8f00",
                }),
          }}
        >
          {alertText}
        </Text>
      </Flex>
    </Paper>
  );
};

const InvitationList: FC = () => {
  const userSession = useUserSession();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    tableheader,
    datatable,
    filter,
    pagination,
    statesFilter,
    mainLoader,
    globalMasterData,
    locationCount,
    getExcelDownload,
    userCompanyDetails,
    GlobalMaster_InviterFormAutoAppover,
    hasData,
  } = useAssessment(userSession?.company?.id, userSession?.user?.role);

  // Reset initial loading when mainLoader changes (filter applied)
  useEffect(() => {
    if (mainLoader) {
      setIsInitialLoading(true);
    }
  }, [mainLoader]);

  // Effect to handle data loading states
  useEffect(() => {
    if (!mainLoader) {
      setIsInitialLoading(false);
    } else {
      setIsInitialLoading(true);
    }

    // Close main loader when data is loaded
    if (!mainLoader && datatable.rows) {
      postParentMessage(closeMainLoader());
    }
  }, [mainLoader, datatable.rows]);

  useEffect(() => {
    // For AI User there should be recommended popup to upload document on start new report/assessment
    const isAIUser = isUserAllowedAIFeature(userSession?.accessToken ?? "");
    postParentMessage(UserAIStatusUpdate(isAIUser));
  }, [userSession]);

  const { data: InternalCompanyData } =
    useGetGlobalMasterByInternalRequestCompanyQuery();

  const chkCompanyId: any = InternalCompanyData?.GlobalMaster[0].data.filter(
    (a: any) => a.companyId === userSession?.company?.id,
  );

  const { query } = useRouter();
  const { formtype } = query;
  const internalFormType = datatable.rows?.[0]?.original?.formType || (formtype ? (String(formtype).endsWith('s') ? String(formtype).slice(0, -1) : String(formtype)) : FormTypes.Assessment);

  const showDeclinedAndResubmitted = datatable.rows?.some((row: any) => {
    const fType = row.original.formType;
    return (
      fType === FormTypes.Report ||
      (fType === FormTypes.Assessment && chkCompanyId?.length > 0) ||
      userSession?.user?.role === AppRoles.Invitee ||
      row.original.isReviewer
    );
  });

  return (
    <Container fluid px={0} className="PLPContainer">
      {mainLoader || isInitialLoading ? (
        <Spinner visible={true} />
      ) : !hasData && userSession?.user?.role === AppRoles.Inviter ? (
        <BlankAssessment />
      ) : (
        <>
          <ProcessingAlert datatable={datatable} />

          <Flex justify="space-between" align="center" className="PLPStatusBox">
            <StatesHeader
              statesfilter={statesFilter}
              locationCount={locationCount}
              getExcelDownload={getExcelDownload}
              showDeclinedAndResubmitted={showDeclinedAndResubmitted}
              internalFormType={internalFormType}
            />
          </Flex>

          <InvitationTable
            tableheader={tableheader}
            datatable={datatable}
            globalMasterData={globalMasterData}
            statesfilter={statesFilter}
            mainLoading={mainLoader}
            locationCount={locationCount}
            getExcelDownload={getExcelDownload}
            companyDetails={userCompanyDetails}
            GlobalMaster_InviterFormAutoAppover={
              GlobalMaster_InviterFormAutoAppover
            }
            showDeclinedAndResubmitted={showDeclinedAndResubmitted}
            internalFormType={internalFormType}
          />
          <Footer pagination={pagination} />
        </>
      )}
    </Container>
  );
};

export default InvitationList;
