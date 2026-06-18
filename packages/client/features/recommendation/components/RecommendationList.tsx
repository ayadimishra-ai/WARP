import {
  Accordion,
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  CloseButton,
  Container,
  createStyles,
  Group,
  HoverCard,
  Menu,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import {
  IconCaretDown,
  IconCaretUp,
  IconDotsVertical,
  IconFilter,
} from "@tabler/icons";
import {
  DataTableType,
  PaginationType,
  StatesFilterType,
  TableHeader,
  useRecommendation,
} from "@warp/client/hooks/use-recommendation";
import Spinner from "@warp/client/layouts/Spinner";
import {
  AppRoles,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import { setLocalStorageData } from "@warp/shared/utils/auth-session.util";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import SortIcons from "../../../components/SortIcons";
import SearchIcon from "../../../components/svgIcons/SearchIcon";
import { useUserSession } from "../../../hooks/use-user-session";
import {
  ProgressReportMessageRecommendation,
  viewRecommendationInvitationMessage,
} from "../../../services/platform-window-message.service";
import { useRecommendationStore } from "../recommendationList.store";
import NoSSR from "./NoSSR";
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
      width: "40%",
    },
  },
  searchInputWrapper: {
    flex: "0 0 320px",
    height: "38px",
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
  searchresetcont: {
    position: "absolute",
    top: "5px",
    right: "0",
  },
  topTableFilters: {
    flexWrap: "wrap",
    width: "67%",
    display: "flex",
    "@media (max-width: 768px)": {
      gap: "10px",
    },
    button: {
      padding: "0 10px",
    },
  },
  table: {
    background: "#FFFFFF",
    boxShadow:
      "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
    borderRadius: "10px",
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
  filtericond: {
    marginLeft: "0px",
  },
  tableHeadingBorder: {
    color: "#1A1A1A",
    background: "#003B52" + "!important",
    fontSize: "12px" + "!important",
    padding: "10px" + "!important",
    "&:first-of-type": {
      borderTopLeftRadius: "10px" + "!important",
      paddingLeft: "25px" + "!important",
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
    "&:hover": {
      backgroundColor: "#F1F3F6",
    },
  },
  tdStyle: {
    border: "0" + "!important",
    fontSize: "12px" + "!important",
    padding: "10px" + "!important",
    verticalAlign: "middle",
    "&: div": {
      maxWidth: "220px" + "!important",
      whitespace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:first-of-type div": {
      maxWidth: "500px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(2) div": {
      maxWidth: "220px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(3) div": {
      maxWidth: "200px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:nth-of-type(5) div": {
      // maxWidth: "140px" + "!important",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  dropdown: {
    top: "40px" + "!important",
  },
  dropdownHoverCard: {
    top: "40px" + "!important",
    padding: "8px 10px !important",
  },
  InfoIconHover: {
    "&:hover": {
      color: "#003B52",
    },
  },
  TitleText: {
    color: "#122F47",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "24px",
    marginBottom: 0,
  },
  SubTitle: {
    color: "#1C9689",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "24px",
    marginBottom: 0,
  },
  threeDotsDropdown: {
    boxShadow: "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
    borderRadius: "5px",
    background: "white",
    padding: "8px 11px 8px 10px",
  },
}));

let isShowApproved = false;

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type THPropsType = {
  title: string;
  onSort?: (ascending: boolean) => void;
  isSortable: boolean;
  toggleSort?: (e: unknown) => void;
  statesfilter: StatesFilterType;
  tableData: any;
  IsManualApproverer: boolean;
};

const TH: FC<THPropsType> = ({
  title,
  isSortable = false,
  toggleSort,
  statesfilter,
  tableData,
  IsManualApproverer,
}) => {
  const { classes } = useStyles();
  const [ascending, setAscending] = useState(false);
  const statuses = [
    RecommendationStatus.TotalRecommendation,
    RecommendationStatus.Open,
    RecommendationStatus.PendingForApproval,
    RecommendationStatus.Closed,
    RecommendationStatus.Reopened,
    RecommendationStatus.NA,
  ];

  const [activeTab, setActiveTab] = useState(statuses[0]);
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));
  const GlobalValue = useRecommendationStore((store) => store.GlobalValue);
  const StatusValue = useRecommendationStore((store) => store.TabActive);
  const TabActive = useRecommendationStore((store) => store.StatusValue);
  const RecommendationValue = useRecommendationStore(
    (store) => store.RecommendationValue
  );
  const RecommendationSearchValue = useRecommendationStore(
    (store) => store.RecommendationSearchValue
  );
  const DeleteRecommendationValue = useRecommendationStore(
    (store) => store.DeleteRecommendationSearch
  );
  const DeleteGlobalValue = useRecommendationStore(
    (store) => store.DeleteGlobalSearch
  );
  const FirstProposedOnValue = useRecommendationStore(
    (store) => store.FirstProposedOnValue
  );
  const FirstProposedOnSearchValue = useRecommendationStore(
    (store) => store.FirstProposedOnSearchValue
  );
  const DeleteFirstProposedOnValue = useRecommendationStore(
    (store) => store.DeleteFirstProposedOnSearch
  );

  const DueDateValue = useRecommendationStore((store) => store.DueDateValue);
  const DueDateSearchValue = useRecommendationStore(
    (store) => store.DueDateSearchValue
  );
  const DeleteDueDateValue = useRecommendationStore(
    (store) => store.DeleteDueDateSearch
  );

  const ImplementedOnValue = useRecommendationStore(
    (store) => store.ImplementedOnValue
  );
  const ImplementedOnSearchValue = useRecommendationStore(
    (store) => store.ImplementedOnSearchValue
  );
  const DeleteImplementedOnValue = useRecommendationStore(
    (store) => store.DeleteImplementedOnSearch
  );

  const sortIcon = ascending ? (
    <IconCaretDown size={18} />
  ) : (
    <IconCaretUp size={18} />
  );

  const sortHandler = (e: any) => {
    if (!isSortable) return;
    setAscending((prev) => !prev);
  };
  const changeTab = (element: any) => {
    setActiveTab(element);
    TabActive(element);
    let data = {
      RecommendationFilterValue: RecommendationValue ?? "",
      FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
      DueDateFilterValue: DueDateValue ?? "",
      ImplementedOnFilterValue: ImplementedOnValue ?? "",
      globalSearchValue: GlobalValue ?? "",
    };
    statesfilter.getSearchFilter(element, data);
  };
  let globalData = {
    RecommendationFilterValue: RecommendationValue ?? "",
    FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
    DueDateFilterValue: DueDateValue ?? "",
    ImplementedOnFilterValue: ImplementedOnValue ?? "",
    globalSearchValue: GlobalValue ?? "",
  };
  useEffect(() => {
    StatusValue === undefined
      ? TabActive(RecommendationStatus.TotalRecommendation)
      : StatusValue;
    let data = {
      RecommendationFilterValue: RecommendationValue ?? "",
      FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
      DueDateFilterValue: DueDateValue ?? "",
      ImplementedOnFilterValue: ImplementedOnValue ?? "",
      globalSearchValue: GlobalValue ?? "",
    };
    statesfilter.getSearchFilter(StatusValue ?? "", data);
  }, [
    statesfilter,
    RecommendationValue,
    FirstProposedOnValue,
    StatusValue,
    TabActive,
    GlobalValue,
    DueDateValue,
    ImplementedOnValue,
  ]);
  // console.log(
  //   "statesfilter",
  //   statesfilter?.getRowsCountByStatus(StatusValue ?? "", globalData),
  //   StatusValue
  // );
  return (
    <th className={`${classes.tableHeadingBorder} Rec-issue`}>
      <Group
        style={{
          position: "relative",
          width: "max-content",
          gap: "0",
        }}
      >
        <UnstyledButton
          className={classes.tableHeading}
          onClick={(e: any) => {
            sortHandler(e);
            toggleSort?.(e);
          }}
          pl={title === "Recommendations" ? 20 : 0}
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
        {title === "Recommendations" && (
          <Box>
            <ActionIcon
              onClick={() => setOpened(true)}
              className={`${classes.filtericond} filter-icon-d`}
            >
              <IconFilter
                style={{ width: "18px" }}
                color={RecommendationValue ? "#fff" : "#fff"}
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
                  zIndex: "1",
                }}
                ref={ref}
                shadow="sm"
                className="searchBoxInner"
              >
                <Box className={classes.innersrchbox}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0px",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Recommendations Name"
                    value={RecommendationValue ?? ""}
                    onChange={(ev: any) => {
                      RecommendationSearchValue(ev);
                      if (ev === "") {
                        let data = {
                          RecommendationFilterValue: ev ?? "",
                          FirstProposedOnFilterValue:
                            FirstProposedOnValue ?? "",
                          DueDateFilterValue: DueDateValue ?? "",
                          ImplementedOnFilterValue: ImplementedOnValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e) => {
                      RecommendationSearchValue(e.value);
                      let data = {
                        RecommendationFilterValue: e.value ?? "",
                        FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
                        DueDateFilterValue: DueDateValue ?? "",
                        ImplementedOnFilterValue: ImplementedOnValue ?? "",
                        globalSearchValue: GlobalValue ?? "",
                      };
                      statesfilter.getSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getRecommendationFilterData(
                        FirstProposedOnValue ?? "",
                        DueDateValue ?? "",
                        ImplementedOnValue ?? "",
                        StatusValue ?? ""
                      ) ?? []
                    }
                    limit={50}
                  />
                  {RecommendationValue !== "" &&
                  RecommendationValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteRecommendationValue();
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
        {title === "Raised On" && (
          <Box>
            <ActionIcon
              onClick={() => setOpened(true)}
              className={`${classes.filtericond} filter-icon-d`}
            >
              <IconFilter
                style={{ width: "18px" }}
                color={FirstProposedOnValue ? "#fff" : "#fff"}
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
                className="searchBoxInner"
              >
                <Box className={classes.innersrchbox}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Raised On"
                    value={FirstProposedOnValue ?? ""}
                    onChange={(ev: any) => {
                      FirstProposedOnSearchValue(ev);
                      if (ev === "") {
                        let data = {
                          RecommendationFilterValue: RecommendationValue ?? "",
                          FirstProposedOnFilterValue: ev ?? "",
                          DueDateFilterValue: DueDateValue ?? "",
                          ImplementedOnFilterValue: ImplementedOnValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e) => {
                      FirstProposedOnSearchValue(e.value);
                      let data = {
                        RecommendationFilterValue: RecommendationValue ?? "",
                        FirstProposedOnFilterValue: e.value ?? "",
                        DueDateFilterValue: DueDateValue ?? "",
                        ImplementedOnFilterValue: ImplementedOnValue ?? "",
                        globalSearchValue: GlobalValue ?? "",
                      };
                      statesfilter.getSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getFirstProposedOnFilterData(
                        RecommendationValue ?? "",
                        DueDateValue ?? "",
                        ImplementedOnValue ?? "",
                        StatusValue ?? ""
                      ) ?? []
                    }
                    limit={50}
                  />
                  {FirstProposedOnValue !== "" &&
                  FirstProposedOnValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteFirstProposedOnValue();
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
        {title === "Due Date" && (
          <Box>
            <ActionIcon
              onClick={() => setOpened(true)}
              className={`${classes.filtericond} filter-icon-d`}
            >
              <IconFilter
                style={{ width: "18px" }}
                color={DueDateValue ? "#fff" : "#fff"}
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
                className="searchBoxInner"
              >
                <Box className={classes.innersrchbox}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Due Date"
                    value={DueDateValue ?? ""}
                    onChange={(ev: any) => {
                      DueDateSearchValue(ev);
                      if (ev === "") {
                        let data = {
                          RecommendationFilterValue: RecommendationValue ?? "",
                          FirstProposedOnFilterValue:
                            FirstProposedOnValue ?? "",
                          DueDateFilterValue: ev ?? "",
                          ImplementedOnFilterValue: ImplementedOnValue ?? "",
                          globalSearchValue: GlobalValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e) => {
                      DueDateSearchValue(e.value);
                      let data = {
                        RecommendationFilterValue: RecommendationValue ?? "",
                        FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
                        DueDateFilterValue: e.value ?? "",
                        ImplementedOnFilterValue: ImplementedOnValue ?? "",
                        globalSearchValue: GlobalValue ?? "",
                      };
                      statesfilter.getSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getDueDateFilterData(
                        RecommendationValue ?? "",
                        FirstProposedOnValue ?? "",
                        ImplementedOnValue ?? "",
                        StatusValue ?? ""
                      ) ?? []
                    }
                    limit={50}
                  />
                  {DueDateValue !== "" && DueDateValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteDueDateValue();
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
        {title === "Implemented On" && (
          <Box>
            <ActionIcon
              onClick={() => setOpened(true)}
              className={`${classes.filtericond} filter-icon-d`}
            >
              <IconFilter
                style={{ width: "18px" }}
                color={ImplementedOnValue ? "#fff" : "#fff"}
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
                className="searchBoxInner"
              >
                <Box className={classes.innersrchbox}>
                  <Autocomplete
                    classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                    style={{
                      borderBottom: "0",
                      width: "100%",
                      backgroundColor: "#F1F3F6",
                      borderRadius: "30px",
                      padding: "0 10px",
                    }}
                    radius={0}
                    variant="unstyled"
                    placeholder="Search by Implemented On"
                    value={ImplementedOnValue ?? ""}
                    onChange={(ev: any) => {
                      ImplementedOnSearchValue(ev);
                      if (ev === "") {
                        let data = {
                          RecommendationFilterValue: RecommendationValue ?? "",
                          FirstProposedOnFilterValue:
                            FirstProposedOnValue ?? "",
                          DueDateFilterValue: DueDateValue ?? "",
                          ImplementedOnFilterValue: ev ?? "",
                          globalSearchValue: GlobalValue ?? "",
                        };
                        statesfilter.getSearchFilter(activeTab, data);
                      }
                    }}
                    onItemSubmit={(e) => {
                      ImplementedOnSearchValue(e.value);
                      let data = {
                        RecommendationFilterValue: RecommendationValue ?? "",
                        FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
                        DueDateFilterValue: DueDateValue ?? "",
                        ImplementedOnFilterValue: e.value ?? "",
                        globalSearchValue: GlobalValue ?? "",
                      };
                      statesfilter.getSearchFilter(activeTab, data);
                    }}
                    data={
                      statesfilter.getImplementedOnFilterData(
                        RecommendationValue ?? "",
                        FirstProposedOnValue ?? "",
                        DueDateValue ?? "",
                        StatusValue ?? ""
                      ) ?? []
                    }
                    limit={50}
                  />
                  {ImplementedOnValue !== "" &&
                  ImplementedOnValue !== undefined ? (
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        DeleteImplementedOnValue();
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
          <HoverCard width={200} position="bottom" shadow="md">
            <HoverCard.Target>
              <ActionIcon className={`${classes.filtericond} filter-icon-d`}>
                <IconFilter
                  style={{ width: "18px", marginLeft: "-2px" }}
                  color={statesfilter ? "#fff" : "#fff"}
                />
              </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown
              className={classes.dropdownHoverCard}
              style={{ padding: "8px 10px" }}
            >
              <Group
                style={{
                  flexDirection: "column",
                  alignItems: "self-start",
                  gap: "6px",
                }}
              >
                {statuses
                  .filter((item) =>
                    IsManualApproverer ? item : item !== "Pending for approval"
                  )
                  .map((element) => (
                    <>
                      <UnstyledButton
                        key={element}
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
                          fontWeight: "normal",
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
                          fw={400}
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
                            globalData
                          )})`}
                        </Text>
                      </UnstyledButton>
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
  statesfilter,
  mainLoading,
  IsManualApproverer,
  isReviewer,
}: {
  tableheader: TableHeader;
  datatable: DataTableType;
  statesfilter: any;
  mainLoading: boolean;
  IsManualApproverer: boolean;
  isReviewer: boolean;
}) => {
  const { classes } = useStyles();
  const [sortTable, setSortTable] = useState(false);
  const sortingTable = () => {
    setSortTable(!sortTable);
  };
  const viewUpdateRecommend = (
    invitationId: string,
    AssessmentFormName: string,
    ComapnyName: string,
    internalAssessmentCompanyName: string,
    QuestionId: string,
    DeviationCount: number,
    IsCarryForward: Boolean,
    SubmissionId: string,
    Score: string
  ) => {
    postParentMessage(
      viewRecommendationInvitationMessage(
        invitationId,
        AssessmentFormName,
        ComapnyName,
        internalAssessmentCompanyName,
        true,
        "",
        "",
        DeviationCount,
        IsCarryForward,
        SubmissionId,
        Score
      )
    );
    setLocalStorageData(window.localStorage, "IsPageRefreshed", QuestionId);
  };
  const userSession = useUserSession();
  const router = useRouter();
  const { deviationCount, isCarryForward, sID, score } = router.query;

  return (
    <>
      <Table
        className={`${classes.table} tableRecommendationList`}
        verticalSpacing="md"
      >
        <thead>
          <tr>
            {tableheader.tableHeadings[0]
              ?.filter(
                (m) =>
                  ![
                    "Id",
                    "QuestionId",
                    "FormFieldId",
                    "Comments",
                    "isViewOnly",
                    "invitationId",
                    "FormName",
                    "companyName",
                    "questionKey",
                    "internalAssessmentCompanyName",
                  ].includes(m.id)
              )
              .map((element) => (
                <TH
                  key={element.id}
                  title={
                    element.id === "Recommendation"
                      ? "Recommendations"
                      : element.id
                  }
                  onSort={sortingTable}
                  isSortable={element.id !== "Actions"}
                  toggleSort={element.column.getToggleSortingHandler()}
                  statesfilter={statesfilter}
                  tableData={element.column}
                  IsManualApproverer={IsManualApproverer}
                />
              ))}
          </tr>
        </thead>
        <tbody>
          {datatable.rows.length > 0 ? (
            datatable.rows.map((row, index) => (
              <tr
                style={{ verticalAlign: "baseline" }}
                key={index}
                className={classes.trStyle}
              >
                <td className={classes.tdStyle}>
                  {row.original.Comments.length > 0 ? (
                    <Accordion
                      styles={{
                        item: { border: "none" },
                        control: {
                          backgroundColor: "inherit !important",
                          position: "relative",
                          padding: 0,
                        },
                        chevron: {
                          marginTop: -2,
                          color: "#99A7AD",
                          "&[data-rotate]": {
                            color: "#444",
                          },
                        },
                      }}
                      chevronPosition="left"
                    >
                      <Accordion.Item key={"a"} value={"a"}>
                        <Accordion.Control pl={0}>
                          <Text
                            color="#666"
                            title={String(row.original.Recommendation).replace(
                              "`",
                              "'"
                            )}
                            size="sm"
                          >
                            {String(row.original.Recommendation).replace(
                              "`",
                              "'"
                            )}
                          </Text>
                        </Accordion.Control>
                        <Accordion.Panel pt={15} pl={20}>
                          {row.original.Comments.map((item: any) => {
                            return (
                              <Box mb={15}>
                                <Text
                                  style={{ whiteSpace: "normal" }}
                                  size="sm"
                                  color="#666"
                                >
                                  <Text span color="#122F47" weight={600}>
                                    {dayjs(item.created_at).format(
                                      "DD MMM, YYYY"
                                    )}
                                  </Text>
                                  {" - "}
                                  {item.comments}
                                </Text>
                                {item.upload_document ? (
                                  <Box className="uploadedAttachment">
                                    <span>Uploaded File :</span>
                                    <a
                                      target="_blank"
                                      rel="noreferrer"
                                      href={item.upload_document}
                                      title={item.filename}
                                    >
                                      {item.filename}
                                    </a>
                                  </Box>
                                ) : (
                                  ""
                                )}
                              </Box>
                            );
                          })}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  ) : (
                    <Text
                      size={12}
                      pl={35}
                      color="#666"
                      title={String(row.original.Recommendation).replace(
                        "`",
                        "'"
                      )}
                    >
                      {String(row.original.Recommendation).replace("`", "'")}
                    </Text>
                  )}
                </td>

                <td className={classes.tdStyle}>
                  <Text size={12} title={row.original["Raised On"]}>
                    {row.original["Raised On"]}
                  </Text>
                </td>

                <td className={classes.tdStyle}>
                  <Text
                    size={12}
                    title={
                      row.original["Due Date"] === "Invalid Date"
                        ? "NA"
                        : row.original["Due Date"]
                    }
                  >
                    {row.original["Due Date"] === "Invalid Date"
                      ? "NA"
                      : row.original["Due Date"]}
                  </Text>
                </td>
                <td className={classes.tdStyle}>
                  <Text size={12} title={row.original["Implemented On"]}>
                    {row.original["Implemented On"]}
                  </Text>
                </td>

                <td className={classes.tdStyle}>
                  <Box className={classes.statusTd}>
                    <Text
                      size={12}
                      transform="capitalize"
                      style={{
                        borderRadius: "20px",
                        backgroundColor:
                          row.original.Status ==
                          RecommendationStatus.PendingForApproval
                            ? "#7FAAFF"
                            : row.original.Status == RecommendationStatus.Closed
                            ? "#03F4AC"
                            : row.original.Status ==
                              RecommendationStatus.Reopened
                            ? "#FFA93C"
                            : row.original.Status == RecommendationStatus.Open
                            ? "#FFA93C"
                            : "#BEBEBE",
                      }}
                      p="3px 13px"
                    >
                      {row.original.Status}
                    </Text>
                  </Box>
                </td>
                <td className={classes.tdStyle}>
                  <Box className={classes.actionTd}>
                    {(userSession?.user?.role === AppRoles.Inviter ||
                      userSession?.user?.role === AppRoles.Consultant) &&
                      (isReviewer ? (
                        <Button
                          onClick={() => {
                            viewUpdateRecommend(
                              row.original?.invitationId,
                              row?.original?.FormName,
                              row?.original?.companyName,
                              row?.original?.internalAssessmentCompanyName,
                              row?.original?.QuestionId,
                              Number(deviationCount),
                              Boolean(isCarryForward),
                              String(sID),
                              String(score)
                            );
                          }}
                          h={28}
                          radius={20}
                          color="solidBtn"
                        >
                          View
                        </Button>
                      ) : row.original.Status ==
                      RecommendationStatus.PendingForApproval ? (
                        row.original.isViewOnly ? (
                          <Button
                            onClick={() => {
                              viewUpdateRecommend(
                                row.original?.invitationId,
                                row?.original?.FormName,
                                row?.original?.companyName,
                                row?.original?.internalAssessmentCompanyName,
                                row?.original?.QuestionId,
                                Number(deviationCount),
                                Boolean(isCarryForward),
                                String(sID),
                                String(score)
                              );
                            }}
                            h={28}
                            radius={20}
                            color="solidBtn"
                          >
                            View
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              viewUpdateRecommend(
                                row.original?.invitationId,
                                row?.original?.FormName,
                                row?.original?.companyName,
                                row?.original?.internalAssessmentCompanyName,
                                row?.original?.QuestionId,
                                Number(deviationCount),
                                Boolean(isCarryForward),
                                String(sID),
                                String(score)
                              );
                            }}
                            h={28}
                            radius={20}
                            color="solidBtn"
                          >
                            Update
                          </Button>
                        )
                      ) : (
                        <Button
                          onClick={() => {
                            viewUpdateRecommend(
                              row.original?.invitationId,
                              row?.original?.FormName,
                              row?.original?.companyName,
                              row?.original?.internalAssessmentCompanyName,
                              row?.original?.QuestionId,
                              Number(deviationCount),
                              Boolean(isCarryForward),
                              String(sID),
                              String(score)
                            );
                          }}
                          h={28}
                          radius={20}
                          color="solidBtn"
                        >
                          View
                        </Button>
                      ))}

                    {(userSession?.user?.role === AppRoles.Invitee ||
                      userSession?.user?.role === AppRoles.Responder) &&
                      (isReviewer ? (
                        <Button
                          onClick={() => {
                            viewUpdateRecommend(
                              row.original?.invitationId,
                              row?.original?.FormName,
                              row?.original?.companyName,
                              row?.original?.internalAssessmentCompanyName,
                              row?.original?.QuestionId,
                              Number(deviationCount),
                              Boolean(isCarryForward),
                              String(sID),
                              String(score)
                            );
                          }}
                          h={28}
                          radius={20}
                          color="solidBtn"
                        >
                          View
                        </Button>
                      ) : row.original.Status ==
                        RecommendationStatus.PendingForApproval ||
                      row.original.Status == RecommendationStatus.Closed ? (
                        <Button
                          onClick={() => {
                            viewUpdateRecommend(
                              row.original?.invitationId,
                              row?.original?.FormName,
                              row?.original?.companyName,
                              row?.original?.internalAssessmentCompanyName,
                              row?.original?.QuestionId,
                              Number(deviationCount),
                              Boolean(isCarryForward),
                              String(sID),
                              String(score)
                            );
                          }}
                          h={28}
                          radius={20}
                          color="solidBtn"
                        >
                          View
                        </Button>
                      ) : row.original.Status ==
                          RecommendationStatus.Reopened ||
                        row.original.Status == RecommendationStatus.Open ? (
                        row.original.isViewOnly ? (
                          <Button
                            onClick={() => {
                              viewUpdateRecommend(
                                row.original?.invitationId,
                                row?.original?.FormName,
                                row?.original?.companyName,
                                row?.original?.internalAssessmentCompanyName,
                                row?.original?.QuestionId,
                                Number(deviationCount),
                                Boolean(isCarryForward),
                                String(sID),
                                String(score)
                              );
                            }}
                            h={28}
                            radius={20}
                            color="solidBtn"
                          >
                            View
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              viewUpdateRecommend(
                                row.original?.invitationId,
                                row?.original?.FormName,
                                row?.original?.companyName,
                                row?.original?.internalAssessmentCompanyName,
                                row?.original?.QuestionId,
                                Number(deviationCount),
                                Boolean(isCarryForward),
                                String(sID),
                                String(score)
                              );
                            }}
                            h={28}
                            radius={20}
                            color="solidBtn"
                          >
                            Update
                          </Button>
                        )
                      ) : (
                        ""
                      ))}
                  </Box>
                </td>
              </tr>
            ))
          ) : datatable.rows.length === 0 && mainLoading === true ? (
            <></>
          ) : (
            <tr className={classes.trStyle}>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Data not found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};
const StatesHeader = ({
  statesfilter,
  IsManualApproverer,
  IsViewOnly,
}: {
  statesfilter: StatesFilterType;
  IsManualApproverer: boolean;
  IsViewOnly: string;
}) => {
  const { classes } = useStyles();
  const statuses = [
    RecommendationStatus.TotalRecommendation,
    RecommendationStatus.Open,
    RecommendationStatus.PendingForApproval,
    RecommendationStatus.Closed,
    RecommendationStatus.Reopened,
    RecommendationStatus.NA,
  ];

  const [activeTab, setActiveTab] = useState(statuses[0]);
  //const [globalSearchFilter, setGlobalSearchFilter] = useState("");
  const [isShowClearAll, setShowClearAll] = useState(false);
  const FirstProposedOnValue = useRecommendationStore(
    (store) => store.FirstProposedOnValue
  );
  const RecommendationValue = useRecommendationStore(
    (store) => store.RecommendationValue
  );
  const GlobalSearchValue = useRecommendationStore(
    (store) => store.GlobalSearchValue
  );
  const GlobalValue = useRecommendationStore((store) => store.GlobalValue);
  const StatusValue = useRecommendationStore((store) => store.TabActive);
  const TabActive = useRecommendationStore((store) => store.StatusValue);
  const DeleteFirstProposedOnSearch = useRecommendationStore(
    (store) => store.DeleteFirstProposedOnSearch
  );
  const DeleteRecommendationValue = useRecommendationStore(
    (store) => store.DeleteRecommendationSearch
  );
  const DeleteGlobalValue = useRecommendationStore(
    (store) => store.DeleteGlobalSearch
  );
  const DueDateValue = useRecommendationStore((store) => store.DueDateValue);

  const DeleteDueDateValue = useRecommendationStore(
    (store) => store.DeleteDueDateSearch
  );

  const ImplementedOnValue = useRecommendationStore(
    (store) => store.ImplementedOnValue
  );

  const DeleteImplementedOnValue = useRecommendationStore(
    (store) => store.DeleteImplementedOnSearch
  );

  const changeTab = (element: any) => {
    setActiveTab(element);
    TabActive(element);
    let data = {
      RecommendationFilterValue: RecommendationValue ?? "",
      FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
      DueDateFilterValue: DueDateValue ?? "",
      ImplementedOnFilterValue: ImplementedOnValue ?? "",
      globalSearchValue: GlobalValue ?? "",
    };
    statesfilter.getSearchFilter(element, data);
  };
  let globalData = {
    RecommendationFilterValue: RecommendationValue ?? "",
    FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
    DueDateFilterValue: DueDateValue ?? "",
    ImplementedOnFilterValue: ImplementedOnValue ?? "",
    globalSearchValue: GlobalValue ?? "",
  };
  useEffect(() => {
    let data = {
      RecommendationFilterValue: RecommendationValue ?? "",
      FirstProposedOnFilterValue: FirstProposedOnValue ?? "",
      DueDateFilterValue: DueDateValue ?? "",
      ImplementedOnFilterValue: ImplementedOnValue ?? "",
      globalSearchValue: GlobalValue ?? "",
    };
    statesfilter.getSearchFilter(StatusValue ?? "", data);
    if (
      !!RecommendationValue ||
      !!FirstProposedOnValue ||
      !!DueDateValue ||
      !!ImplementedOnValue ||
      !!GlobalValue ||
      StatusValue !== RecommendationStatus.TotalRecommendation
    ) {
      setShowClearAll(true);
    } else if (!!!GlobalValue) {
      setShowClearAll(false);
    }
  }, [
    StatusValue,
    //globalSearchFilter,
    statesfilter,
    RecommendationValue,
    FirstProposedOnValue,
    GlobalValue,
    DueDateValue,
    ImplementedOnValue,
  ]);
  const [isfocused, setisfocused] = useState(false);
  const clearAllData = () => {
    TabActive(RecommendationStatus.TotalRecommendation);
    DeleteRecommendationValue();
    DeleteDueDateValue();
    DeleteImplementedOnValue();
    DeleteGlobalValue();
    DeleteFirstProposedOnSearch();
    //setGlobalSearchFilter("");
    setShowClearAll(false);
  };

  const onProgressReport = (
    invitationId: String,
    Questionnare: String,
    Period: String,
    ComapnyName: string,
    SubmissionId: string,
    DeviationCount: number,
    IsCarryForward: Boolean
  ) => {
    postParentMessage(
      ProgressReportMessageRecommendation(
        invitationId,
        Questionnare,
        Period,
        ComapnyName,
        SubmissionId,
        DeviationCount,
        IsCarryForward
      )
    );
  };
  const router = useRouter();
  const { invitationId, qname, tperiod, cname, sID, score, firstName } =
    router.query;
  // {
  //   console.log("Search for requested by", router.query);
  // }
  const userSession = useUserSession();
  // console.log(
  //   "statesfilter11",
  //   statesfilter?.getRowsCountByStatus(StatusValue ?? "", globalData),
  //   StatusValue
  // );
  return (
    <Stack style={{ width: "100%", gap: 0 }}>
      <Box
        style={{
          borderRadius: 5,
          // boxShadow:
          //   "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
          backgroundColor: "#E4F8FF",
          margin: "0px 0 9px 0",
          height: "80px",
          padding: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <h4 className={classes.TitleText}>{qname}</h4>
          <p className={classes.SubTitle}>Due Date : {tperiod}</p>
        </Box>
        <Box>
          <h4
            className={classes.TitleText}
            style={{ textAlign: "right", textTransform: "capitalize" }}
          >
            {firstName}
          </h4>
          <NoSSR>
            <p className={classes.SubTitle} style={{ textAlign: "right" }}>
              {userSession?.user?.role === AppRoles.Inviter ||
              userSession?.user?.role == AppRoles.Consultant
                ? "Requested To "
                : "Requested By "}
              : {cname}
            </p>
          </NoSSR>
        </Box>
      </Box>
      {Boolean(IsViewOnly) === true ? (
        <Box>
          {
            <p className="noteInfoStripListing">
              <b>Note :</b> Action on these recommendations are no more allowed
              because a further assessment was initiated.
            </p>
          }
        </Box>
      ) : (
        <></>
      )}

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          className={[classes.topTableFilters, classes.commonMargin].join(" ")}
          style={{ marginBottom: "15px", marginTop: "0" }}
        >
          {statuses
            .slice(0, 3)
            .filter((item) =>
              IsManualApproverer ? item : item !== "Pending for approval"
            )
            .map((element) => (
              <>
                {element === "Approved" && isShowApproved ? (
                  <UnstyledButton
                    key={element}
                    onClick={() => changeTab(element)}
                  >
                    <Text
                      size={16}
                      className={
                        StatusValue === element
                          ? classes.active
                          : classes.filterHover
                      }
                      color={"dark.3"}
                      weight={500}
                      style={{ textTransform: "capitalize" }}
                    >
                      {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                        element,
                        globalData
                      )})`}
                    </Text>
                  </UnstyledButton>
                ) : (
                  <>
                    {element !== "Approved" && (
                      <UnstyledButton
                        key={element}
                        onClick={() => changeTab(element)}
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
                          style={{ textTransform: "capitalize" }}
                        >
                          {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                            element,
                            globalData
                          )})`}
                        </Text>
                      </UnstyledButton>
                    )}
                  </>
                )}
              </>
            ))}
          {
            <Menu
              min-width="185px"
              position="bottom-start"
              withArrow
              arrowOffset={5}
              shadow="md"
              styles={{
                arrow: {
                  borderLeft: "solid 8px transparent !important",
                  borderRight: "solid 8px transparent !important",
                  borderBottom: "solid 8px #003B52 !important",
                  height: "0 !important",
                  width: "0 !important",
                  transform: "rotate(0deg) !important",
                  top: "-9px !important",
                  background: "transparent",
                  color: "#666",
                },
                item: {
                  "&:hover": {
                    color: "#fff !important",
                    background:
                      "var(--Button_gradient, linear-gradient(95deg, #005C81 0.57%, #122F47 95%))",
                  },
                  boxShadow: "box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
                  padding: "5px",
                },
              }}
              classNames={{
                dropdown: classes.threeDotsDropdown,
              }}
            >
              <Menu.Target>
                <ActionIcon
                  style={{ padding: "0px" }}
                  className="btn-vertical-icon"
                >
                  <IconDotsVertical />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {statuses
                  .filter((item) =>
                    IsManualApproverer ? item : item !== "Pending for approval"
                  )
                  .map((element) => (
                    <>
                      <Menu.Item
                        key={element}
                        onClick={() => changeTab(element)}
                        color="#666666"
                        style={{ padding: "8px 12px" }}
                      >
                        <Text
                          size={12}
                          className={"drop-down-items"}
                          //color={"#444"}
                          weight={500}
                          lh={1.5}
                          style={{ textTransform: "capitalize" }}
                        >
                          {`${element}${" "}(${statesfilter?.getRowsCountByStatus(
                            element,
                            globalData
                          )})`}
                        </Text>
                      </Menu.Item>
                    </>
                  ))}
              </Menu.Dropdown>
            </Menu>
          }
        </Box>
        <Box className={classes.textFieldFilter}>
          <Box
            className={classes.innersrchbox}
            style={{ display: "flex", alignItems: "center" }}
          >
            {!!score && score !== "NA" ? (
              <UnstyledButton
                style={{
                  // borderColor: "#666666",
                  // borderRadius: "20px",
                  color: "#666666",
                  // height: "28px",
                  padding: "3px 15px",
                  marginBottom: "15px",
                  // background: "transparent" + "!important",
                }}
                mr={10}
                onClick={() =>
                  onProgressReport(
                    String(invitationId),
                    String(qname),
                    String(tperiod),
                    String(cname),
                    String(sID),
                    0,
                    false
                  )
                }
              >
                <Text
                  size={16}
                  className={classes.filterHover}
                  color={"#444"}
                  weight={500}
                >
                  Progress Report
                </Text>
              </UnstyledButton>
            ) : (
              ""
            )}

            {isShowClearAll === true ? (
              <UnstyledButton
                style={{
                  color: "#666666",
                  padding: "3px 0px",
                  marginBottom: "15px",
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
                borderBottom: "0",
                flex: "0 0 320px",
                height: "38px",
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
              placeholder={"Search..."}
              classNames={{
                input: "searchInput",
                icon: "searchIconDiv",
                root: `${
                  isfocused
                    ? "SearchInputBoxFocus"
                    : "mantine-Autocomplete-root SearchInputBox"
                } `,
              }}
              className={`${classes.searchInputWrapper} `}
              value={GlobalValue ?? ""}
              onChange={(ev: any) => {
                // setGlobalSearchFilter(ev);
                GlobalSearchValue(ev);
                if (ev === "") {
                  let data = {
                    globalSearchValue: ev ?? "",
                  };
                  statesfilter.getSearchFilter(activeTab, data);
                }
              }}
              onFocus={() => setisfocused(true)}
              onBlur={() => setisfocused(false)}
              onItemSubmit={(e) => {
                //setGlobalSearchFilter(e.value);
                GlobalSearchValue(e.value);
                let data = {
                  globalSearchValue: e.value ?? "",
                };
                statesfilter.getSearchFilter(activeTab, data);
              }}
              data={statesfilter.getGlobalFilterData(GlobalValue ?? "") ?? []}
            />
            {GlobalValue !== "" && GlobalValue !== undefined ? (
              <div
                className={classes.searchresetcont}
                onClick={() => {
                  //setGlobalSearchFilter("");
                  DeleteGlobalValue();
                }}
              >
                <CloseButton
                  aria-label="Close modal"
                  variant="transparent"
                  //color={isfocused ? "#005C81" : "#8a929a"}
                  sx={{ justifyContent: "flex-start !important" }}
                  className={
                    isfocused ? "SearchInputCloseFocus" : "SearchInputClose"
                  }
                />
              </div>
            ) : (
              ""
            )}
          </Box>
        </Box>
      </Box>
    </Stack>
    // Status Filters Ends Here
  );
};

const Footer = ({ pagination }: { pagination: PaginationType }) => {
  const { classes } = useStyles();
  return (
    <Pagination
      pt={10}
      classNames={{ item: classes.paginationItem }}
      total={pagination.getTotalCount ?? 0}
      page={pagination?.page}
      onChange={(e: any) => pagination?.onPageChange(e)}
    />
  );
};

const RecommendationList: FC = () => {
  const { query } = useRouter();
  const { invitationId } = query;
  const smallScreen = useMediaQuery("(max-width: 800px)");
  const userSession = useUserSession();
  const {
    tableheader,
    datatable,
    filter,
    pagination,
    statesFilter,
    mainLoading,
    IsManualApproverer,
    isReviewer,
  } = useRecommendation(
    userSession?.company?.id,
    userSession?.user?.role,
    invitationId
  );
  return (
    <Container fluid px={0}>
      {/* <LoadingOverlay style={{ top: "0px" }} visible={mainLoading} /> */}
      <Spinner visible={mainLoading} />
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="Rec-Header"
      >
        <StatesHeader
          statesfilter={statesFilter}
          IsManualApproverer={IsManualApproverer}
          IsViewOnly={
            datatable?.rows.length > 0
              ? datatable?.rows[0]?.original?.isViewOnly
              : ""
          }
        />
      </Box>
      <InvitationTable
        tableheader={tableheader}
        datatable={datatable}
        statesfilter={statesFilter}
        mainLoading={mainLoading}
        IsManualApproverer={IsManualApproverer}
        isReviewer={isReviewer}
      />
      <Footer pagination={pagination} />
    </Container>
  );
};
export default RecommendationList;
