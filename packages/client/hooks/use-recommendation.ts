import {
  Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  Row,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
// import assessmentListData from "./assessment.data";
import { useGetassesseeuserbyinvitationIdQuery } from "@warp/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import { useGetRecommendationListQuery } from "@warp/graphql/queries/generated/get-recommendation-list";
import {
  AppRoles,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import dayjs from "dayjs";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useUserSession } from "./use-user-session";
//import { useGetRecommendationListQuery } from "@warp/graphql/queries/generated/get-recommendationList-by-questionId";
export type ColumnType = {
  Id: string;
  QuestionId: string;
  FormFieldId: string;
  SubmissionId: string;
  Recommendation: string;
  "Raised On": string;
  "Due Date": string;
  Status: string;
  "Implemented On": string;
  Actions: string;
  Comments: any[];
  isViewOnly: string;
  invitationId: string;
  FormName: string;
  companyName: string;
  questionKey: string;
  formFieldKey: string;
  internalAssessmentCompanyName: string;
};

export type DataTableType = {
  tableHeadings: Header<ColumnType, unknown>[][];
  rows: Row<ColumnType>[];
  renderRow: (cell: any) => ReactNode | JSX.Element;
  renderHeader: (header: any, context: any) => ReactNode | JSX.Element;
  renderSort: (header: any) => string | null;
};
export type TableHeader = {
  tableHeadings: Header<ColumnType, unknown>[][];
  renderHeader: (header: any, context: any) => ReactNode | JSX.Element;
};

export type FilterType = (column: Column<ColumnType, unknown>) => {
  firstValue: unknown;
  columnFilterValue: {
    getMinNumber: number;
    getMaxNumber: number;
    getTextValue: string;
    setFilterValueNumber: (e: any, range: string) => void;
    setFilterValueText: (e: any) => void;
  };
};

export type PaginationType = {
  previous: () => void;
  next: () => void;
  page: number;
  onPageChange: (updater: Updater<number>) => void;
  getTotalCount: number;
  getPageSize: number;
  setPageSize: (updater: Updater<number>) => void;
};

export type StatesFilterType = {
  getRowsByStatus: (updater: string) => void;
  getRowsCountByStatus: (
    updater: string,
    searchFilter: {
      questionariesSearchValue?: String;
      organisationSearchValue?: String;
      globalSearchValue?: String;
    }
  ) => number;
  getSearchFilter: (
    updater: string,
    searchFilter: {
      RecommendationFilterValue?: String;
      FirstProposedOnFilterValue?: String;
      DueDateFilterValue?: String;
      ImplementedOnFilterValue?: String;
      globalSearchValue?: String;
    }
  ) => void;
  getRecommendationFilterData: (
    FirstProposedOnValue?: String,
    DueDateValue?: String,
    ImplementedOnValue?: String,
    activeTab?: String
  ) => any[];
  getFirstProposedOnFilterData: (
    RecommendationValue?: String,
    DueDateValue?: String,
    ImplementedOnValue?: String,
    activeTab?: String
  ) => any[];

  getDueDateFilterData: (
    RecommendationValue?: String,
    FirstProposedOnValue?: String,
    ImplementedOnValue?: String,
    activeTab?: String
  ) => any[];
  getImplementedOnFilterData: (
    RecommendationValue?: String,
    FirstProposedOnValue?: String,
    DueDateValue?: String,
    activeTab?: String
  ) => any[];
  getGlobalFilterData: (globalSearchValue?: String) => any[];
};
export function useRecommendation(
  companyId?: string,
  userRole?: string,
  invitationId?: any
) {
  const userSession = useUserSession();
  const [GetfinalAssessmentList, SetfinalAssessmentList] = useState();

  const chkCompanyId = userSession?.company?.id;
  const { data: recommendationList, loading } = useGetRecommendationListQuery({
    variables: {
      invitationId: invitationId,
    },
  }) as any;
  // console.log("recommendationList", recommendationList);

  const isReviewer =
    !!recommendationList?.FormInvitation[0]?.reviewerDetails?.id &&
    recommendationList?.FormInvitation[0]?.reviewerDetails?.id ===
    userSession?.user?.id;

  const { data: AssesseeUserMappingQueryResult } =
    useGetassesseeuserbyinvitationIdQuery({
      variables: {
        invitationId,
      },
    });
  // const GlobalMasterData: any = userSession?.GlobalMaster?.filter(
  //   (x: any) => x.type === "Recommendation_new"
  // );
  const { data: GlobalMasterData } = useGetGlobalMasterByTypeQuery({
    variables: {
      type: "Recommendation_new",
    },
  });
  const IsManualApproverer = GlobalMasterData?.GlobalMaster[0]?.data.filter(
    (item: any) =>
      item.FormId === recommendationList?.FormInvitation[0]?.Form.id
  );
  const recommendationListing: ColumnType[] = useMemo<ColumnType[]>(() => {
    let listingpagedata: any = [];
    if (!recommendationList) {
      return [];
    }
    let invitationCreatedDate: any =
      recommendationList?.FormInvitation[0]?.created_at;
    let InterimAnswerdata =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.Interim_Answers;
    let carryForWardData =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.carryForWardData;
    if (userRole === AppRoles.Responder) {
      let assignedQuestion: any =
        AssesseeUserMappingQueryResult?.AssesseeUserMapping.filter(
          (x: any) =>
            x.userId == userSession?.user?.id && x.InvitationId == invitationId
        );

      if (assignedQuestion?.length > 0) {
        InterimAnswerdata =
          recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.Interim_Answers.filter(
            (x: any) =>
              assignedQuestion.filter((y: any) => y.questionId == x.questionId)
                .length > 0
          );
        carryForWardData =
          recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.carryForWardData.filter(
            (x: any) =>
              assignedQuestion.filter((y: any) => y.questionId == x.questionId)
                .length > 0
          );
      } else {
        assignedQuestion = [];
      }
    }
    InterimAnswerdata?.map((interimAnswerdata: any) => {
      interimAnswerdata?.Interim_Recommendations.map((item: any) => {
        if (listingpagedata.filter((c: any) => c.Id == item.id)?.length == 0) {
          listingpagedata.push({
            Id: item.id,
            QuestionId: item.questionId,
            questionKey: item?.Question?.key,
            FormFieldId: interimAnswerdata.formFieldId,
            Recommendation: item.recommendations,
            FirstDate: item.created_at,
            DueDate: item.expectedDate,
            ImplementedOn:
              item.Interim_Comments.length > 0
                ? item.Interim_Comments[item.Interim_Comments.length - 1]
                  .created_at
                : "",
            Status: item.status,
            Actions: "",
            Comments: item.Interim_Comments,
            isViewOnly: interimAnswerdata.isViewOnly,
            invitationId: recommendationList?.FormInvitation[0].id,
            FormName: recommendationList?.FormInvitation[0]?.Form?.name,
            companyName: recommendationList?.FormInvitation[0]?.Company?.name,
            formFieldKey: item.Interim_Answer?.FormField?.field,
            internalAssessmentCompanyName:
              recommendationList?.FormInvitation[0]?.ParentCompanyMapping?.User
                ?.name,
          });
        }
      });
    });
    carryForWardData?.forEach((carryForwarditem: any) => {
      let isAdd: boolean = false;
      if (!!carryForwarditem.Interim_Answer) {
        carryForwarditem.Interim_Answer?.Interim_Recommendations?.map(
          (item: any) => {
            if (
              listingpagedata.filter((c: any) => c.Id == item.id)?.length == 0
            ) {
              if (
                item.status == RecommendationStatus.NA ||
                item.status == RecommendationStatus.Closed
              ) {
                if (item.updated_at > invitationCreatedDate) {
                  isAdd = true;
                } else {
                  isAdd = false;
                }
              } else {
                isAdd = true;
              }
              if (item.status == RecommendationStatus.NA && isAdd == true) {
                isAdd = false;
              }
              if (isAdd) {
                listingpagedata.push({
                  Id: item.id,
                  QuestionId: item.questionId,
                  questionKey: item?.Question?.key,
                  FormFieldId: carryForwarditem.formFieldId,
                  Recommendation: item.recommendations,
                  FirstDate: item.created_at,
                  DueDate: item.expectedDate,
                  ImplementedOn:
                    item.Interim_Comments.length > 0
                      ? item.Interim_Comments[item.Interim_Comments.length - 1]
                        .created_at
                      : "",
                  Status: item.status,
                  Actions: "",
                  Comments: item.Interim_Comments,
                  isViewOnly: carryForwarditem.isViewOnly,
                  invitationId: recommendationList?.FormInvitation[0].id,
                  FormName: recommendationList?.FormInvitation[0]?.Form?.name,
                  companyName:
                    recommendationList?.FormInvitation[0]?.Company?.name,
                  formFieldKey: item.Interim_Answer?.FormField?.field,
                  internalAssessmentCompanyName:
                    recommendationList?.FormInvitation[0]?.ParentCompanyMapping
                      ?.User?.name,
                });
              }
            }
          }
        );
      }
    });
    // return listingpagedata
    //   ?.sort((a: any, b: any) => (a?.FirstDate < b?.FirstDate ? 1 : -1))
    return listingpagedata
      .sort(function (a: any, b: any) {
        const aNums = a.formFieldKey.match(/\d+/g).map(Number);
        const bNums = b.formFieldKey.match(/\d+/g).map(Number);
        const maxLength = Math.max(aNums.length, bNums.length);
        for (let i = 0; i < maxLength; i++) {
          if (aNums[i] !== bNums[i]) {
            return aNums[i] - bNums[i]; // sort by number value
          }
        }
        return a.formFieldKey.localeCompare(b.formFieldKey); // if numbers are equal, sort alphabetically
      })
      .map((item: any) => {
        return {
          Id: item.Id,
          QuestionId: item.QuestionId,
          questionKey: item?.questionKey,
          FormFieldId: item.FormFieldId,
          Recommendation: item.Recommendation,
          "Raised On": dayjs(item.FirstDate).format("DD MMM YYYY"),
          "Due Date":
            item.DueDate === null
              ? "NA"
              : dayjs(item.DueDate).format("DD MMM YYYY"),
          "Implemented On":
            item.ImplementedOn != ""
              ? dayjs(item.ImplementedOn).format("DD MMM YYYY")
              : "NA",
          Status: item.Status,
          Actions: "",
          Comments: item.Comments,
          isViewOnly: item.isViewOnly,
          invitationId: item.invitationId,
          FormName: item.FormName,
          companyName: item.companyName,
          internalAssessmentCompanyName: item.internalAssessmentCompanyName,
        } as ColumnType;
      });
  }, [recommendationList]);

  const [listingData, setlistingData] = useState<ColumnType[]>(
    recommendationListing
  );
  const [listingData1, setlistingData1] = useState<ColumnType[]>(
    recommendationListing
  );
  const [tableHeadings, settableHeadings] = useState<
    Header<ColumnType, unknown>[][]
  >([]);

  useEffect(() => {
    setlistingData(recommendationListing);
    setlistingData1(recommendationListing);
  }, [recommendationListing]);

  const columnHelper = createColumnHelper<ColumnType>();

  const columnData = listingData1[0]
    ? Object.keys(listingData1[0]).map((c: any) =>
      columnHelper.accessor(c, {
        header: c,
        footer: (props) => props.column.id,
      })
    )
    : [];
  const table = useReactTable({
    data: listingData ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columns: columnData,
  });
  const rows = table.getRowModel().rows;
  const renderRow = (cell: any) => {
    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  const renderHeader = (header: any, context: any) => {
    return flexRender(header, context);
  };

  const renderSort = (header: any) => {
    return (
      {
        asc: " ðŸ”¼",
        desc: " ðŸ”½",
      }[header.column.getIsSorted() as string] ?? null
    );
  };

  const filter = (column: Column<ColumnType, unknown>) => {
    const firstValue = table
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id);

    const columnFilterValue = {
      getMinNumber: (column.getFilterValue() as [number, number])?.[0] ?? "",
      getMaxNumber: (column.getFilterValue() as [number, number])?.[1] ?? "",
      getTextValue: (column.getFilterValue() ?? "") as string,
      setFilterValueNumber: (e: any, range: string) => {
        return column.setFilterValue((old: [number, number]) => [
          e.target.value,
          range == "max" ? old?.[0] : old?.[1],
        ]);
      },
      setFilterValueText: (e: any) => {
        return column.setFilterValue(e.target.value);
      },
    };

    return { firstValue, columnFilterValue };
  };

  const pagination: PaginationType = {
    previous: () => table.previousPage(),
    next: () => table.nextPage(),
    page: table.getState().pagination.pageIndex + 1,
    onPageChange: (p: any) => {
      const page = p ? Number(p) - 1 : 0;
      table.setPageIndex(page);
    },
    getTotalCount: table.getPageCount(),
    getPageSize: table.getState().pagination.pageSize,
    setPageSize: (e: any) => table.setPageSize(Number(e.target.value)),
  };

  const datatable = {
    tableHeadings,
    rows,
    renderRow,
    renderHeader,
    renderSort,
  };
  const tableheader = { tableHeadings, renderHeader };
  let mainLoading: boolean = true;
  const statesFilter: StatesFilterType = React.useMemo(
    () => ({
      getRowsByStatus: (state: string) => {
        setlistingData(
          recommendationListing.filter((r) =>
            state != RecommendationStatus.TotalRecommendation ? r.Status == state : r
          )
        );
      },
      getRowsCountByStatus: (
        state: string,
        searchFilter: {
          RecommendationFilterValue?: String;
          FirstProposedOnFilterValue?: String;
          DueDateFilterValue?: String;
          ImplementedOnFilterValue?: String;
          globalSearchValue?: String;
        }
      ) => {
        return recommendationListing
          .filter((m) => {
            if (!searchFilter.RecommendationFilterValue?.replace("'", "`"))
              return true;

            return m.Recommendation?.toLowerCase().includes(
              searchFilter.RecommendationFilterValue?.replace(
                "'",
                "`"
              )?.toLowerCase() ?? ""
            );
          })
          .filter((o) => {
            if (!searchFilter.FirstProposedOnFilterValue) return true;
            return o["Raised On"]
              ?.toLowerCase()
              .includes(
                searchFilter.FirstProposedOnFilterValue?.toLowerCase() ?? ""
              );
          })
          .filter((o) => {
            if (!searchFilter.DueDateFilterValue) return true;
            return o["Due Date"]
              ?.toLowerCase()
              .includes(searchFilter.DueDateFilterValue?.toLowerCase() ?? "");
          })
          .filter((o) => {
            if (!searchFilter.ImplementedOnFilterValue) return true;
            return o["Implemented On"]
              ?.toLowerCase()
              .includes(
                searchFilter.ImplementedOnFilterValue?.toLowerCase() ?? ""
              );
          })
          .filter((g) => {
            if (!searchFilter.globalSearchValue?.replace("'", "`")) return true;

            if (
              g.Recommendation?.toLowerCase().includes(
                searchFilter.globalSearchValue
                  ?.replace("'", "`")
                  ?.toLowerCase() ?? ""
              )
            ) {
              return g.Recommendation?.toLowerCase().includes(
                searchFilter.globalSearchValue
                  ?.replace("'", "`")
                  ?.toLowerCase() ?? ""
              );
            } else if (
              g["Raised On"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return g["Raised On"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              g["Due Date"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return g["Due Date"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              g["Implemented On"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return g["Implemented On"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              g.Status?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              )
            ) {
              return g.Status?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              );
            }
          })
          .filter((r) =>
            state != RecommendationStatus.TotalRecommendation ? r.Status == state : r
          )?.length;
      },
      getSearchFilter: (
        state: String,
        searchFilter: {
          RecommendationFilterValue?: String;
          FirstProposedOnFilterValue?: String;
          DueDateFilterValue?: String;
          ImplementedOnFilterValue?: String;
          globalSearchValue?: String;
        }
      ) => {
        setlistingData(
          recommendationListing
            .filter((r) => {
              if (!searchFilter.RecommendationFilterValue?.replace("'", "`"))
                return true;
              if (
                r.Recommendation?.toLowerCase().includes(
                  searchFilter
                    .RecommendationFilterValue!.replace("'", "`")
                    ?.toLowerCase() ?? ""
                )
              ) {
                return r.Recommendation?.toLowerCase().includes(
                  searchFilter
                    .RecommendationFilterValue!.replace("'", "`")
                    ?.toLowerCase() ?? ""
                );
              }
            })
            .filter((f) => {
              if (!searchFilter.FirstProposedOnFilterValue) return true;
              if (
                f["Raised On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.FirstProposedOnFilterValue?.toLowerCase() ?? ""
                  )
              ) {
                return f["Raised On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.FirstProposedOnFilterValue?.toLowerCase() ?? ""
                  );
              }
            })
            .filter((d) => {
              if (!searchFilter.DueDateFilterValue) return true;
              if (
                d["Due Date"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.DueDateFilterValue?.toLowerCase() ?? ""
                  )
              ) {
                return d["Due Date"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.DueDateFilterValue?.toLowerCase() ?? ""
                  );
              }
            })
            .filter((i) => {
              if (!searchFilter.ImplementedOnFilterValue) return true;
              if (
                i["Implemented On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.ImplementedOnFilterValue?.toLowerCase() ?? ""
                  )
              ) {
                return i["Implemented On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.ImplementedOnFilterValue?.toLowerCase() ?? ""
                  );
              }
            })
            .filter((g) => {
              if (!searchFilter.globalSearchValue?.replace("'", "`"))
                return true;

              if (
                g.Recommendation?.toLowerCase().includes(
                  searchFilter.globalSearchValue
                    ?.replace("'", "`")
                    ?.toLowerCase() ?? ""
                )
              ) {
                return g.Recommendation?.toLowerCase().includes(
                  searchFilter.globalSearchValue
                    ?.replace("'", "`")
                    ?.toLowerCase() ?? ""
                );
              } else if (
                g["Raised On"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return g["Raised On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                g["Due Date"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return g["Due Date"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                g["Implemented On"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return g["Implemented On"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                g.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return g.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              }
            })
            .filter((r) =>
              state != RecommendationStatus.TotalRecommendation ? r.Status == state : r
            )
        );
      },
      getRecommendationFilterData: (
        FirstProposedOnValue,
        DueDateValue,
        ImplementedOnValue,
        activeTab
      ) => {
        let FilterNames: any[] = [];
        const recommendationdata = recommendationListing
          .filter((x) => {
            if (!FirstProposedOnValue) return true;
            return x["Raised On"] === FirstProposedOnValue;
          })
          .filter((x) => {
            if (!DueDateValue) return true;
            return x["Due Date"] === DueDateValue;
          })
          .filter((x) => {
            if (!ImplementedOnValue) return true;
            return x["Implemented On"] === ImplementedOnValue;
          })
          .filter((r) =>
            activeTab != RecommendationStatus.TotalRecommendation ? r.Status == activeTab : r
          )
          .map((m: any) => {
            if ((m.Recommendation ?? "") === "") return;
            var findItem = FilterNames.find((x) => x === m.Recommendation);
            if (!findItem) {
              FilterNames.push(m.Recommendation.replace("`", "'"));
              return m.Recommendation;
            }
          });
        return FilterNames;
      },
      getFirstProposedOnFilterData: (
        RecommendationValueNew,
        DueDateValue,
        ImplementedOnValue,
        activeTab
      ) => {
        let RecommendationValue = RecommendationValueNew!.replace("'", "`");
        let FilterNames: any[] = [];
        const DataValue =
          recommendationListing
            .filter((x) => {
              if (!RecommendationValue) return true;
              return x.Recommendation === RecommendationValue;
            })
            .filter((x) => {
              if (!DueDateValue) return true;
              return x["Due Date"] === DueDateValue;
            })
            .filter((x) => {
              if (!ImplementedOnValue) return true;
              return x["Implemented On"] === ImplementedOnValue;
            })
            .filter((r) =>
              activeTab != RecommendationStatus.TotalRecommendation ? r.Status == activeTab : r
            )
            .map((m: any) => {
              if ((m["Raised On"] ?? "") === "") return;
              var findItem = FilterNames.find((x) => x === m["Raised On"]);
              if (!findItem) {
                FilterNames.push(m["Raised On"]);
                return m["Raised On"];
              }
            }) ?? [];
        return FilterNames;
      },
      getDueDateFilterData: (
        RecommendationValueNew,
        FirstProposedOnValue,
        ImplementedOnValue,
        activeTab
      ) => {
        let RecommendationValue = RecommendationValueNew!.replace("'", "`");
        let FilterNames: any[] = [];
        const DataValue =
          recommendationListing
            .filter((x) => {
              if (!RecommendationValue) return true;
              return x.Recommendation === RecommendationValue;
            })
            .filter((x) => {
              if (!FirstProposedOnValue) return true;
              return x["Raised On"] === FirstProposedOnValue;
            })
            .filter((x) => {
              if (!ImplementedOnValue) return true;
              return x["Implemented On"] === ImplementedOnValue;
            })
            .filter((r) =>
              activeTab != RecommendationStatus.TotalRecommendation ? r.Status == activeTab : r
            )
            .map((m: any) => {
              if ((m["Due Date"] ?? "") === "") return;
              var findItem = FilterNames.find((x) => x === m["Due Date"]);
              if (!findItem) {
                FilterNames.push(m["Due Date"]);
                return m["Due Date"];
              }
            }) ?? [];
        return FilterNames;
      },
      getImplementedOnFilterData: (
        RecommendationValueNew,
        FirstProposedOnValue,
        DueDateValue,
        activeTab
      ) => {
        let RecommendationValue = RecommendationValueNew!.replace("'", "`");
        let FilterNames: any[] = [];
        const DataValue =
          recommendationListing
            .filter((x) => {
              if (!RecommendationValue) return true;
              return x.Recommendation === RecommendationValue;
            })
            .filter((x) => {
              if (!FirstProposedOnValue) return true;
              return x["Raised On"] === FirstProposedOnValue;
            })
            .filter((x) => {
              if (!DueDateValue) return true;
              return x["Due Date"] === DueDateValue;
            })
            .filter((r) =>
              activeTab != RecommendationStatus.TotalRecommendation ? r.Status == activeTab : r
            )
            .map((m: any) => {
              if ((m["Implemented On"] ?? "") === "") return;
              var findItem = FilterNames.find((x) => x === m["Implemented On"]);
              if (!findItem) {
                FilterNames.push(m["Implemented On"]);
                return m["Implemented On"];
              }
            }) ?? [];
        return FilterNames;
      },
      getGlobalFilterData: (globalSearchValueNew) => {
        let FilterNames: any[] = [];
        let globalSearchValue = globalSearchValueNew!.replace("'", "`");
        const DataValue =
          recommendationListing
            .filter((x) => {
              if (!globalSearchValue) return true;

              if (
                x.Recommendation?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return x.Recommendation?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                x["Raised On"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "")
              ) {
                return x["Raised On"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "");
              } else if (
                x.Status?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return x.Status?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                );
              }
            })
            .map((m: any) => {
              if ((m.Questionnaire ?? "") === "") return;
              if (FilterNames.find((x) => x === m.Questionnaire)) {
                FilterNames.push(m.Questionnaire);
                return m.Questionnaire;
              } else if (FilterNames.find((x) => x === m["Requested From"])) {
                FilterNames.push(m["Requested From"]);
                return m["Requested From"];
              } else if (FilterNames.find((x) => x === m.Status)) {
                FilterNames.push(m.Status);
                return m.Status;
              } else if (FilterNames.find((x) => x === m.Location)) {
                FilterNames.push(m.Location);
                return m.Location;
              } else if (FilterNames.find((x) => x === m["Requested By"])) {
                FilterNames.push(m["Requested By"]);
                return m["Requested By"];
              }
            }) ?? [];

        return FilterNames;
      },
    }),
    [recommendationListing, setlistingData]
  );

  useEffect(() => {
    settableHeadings(
      table.getHeaderGroups().map((headerGroup) => {
        return headerGroup.headers.map((header) => {
          return header;
        });
      })
    );
  }, [listingData1, table]);

  mainLoading = loading;
  // console.log("datatable", datatable);

  return {
    tableheader,
    datatable,
    filter,
    statesFilter,
    pagination,
    mainLoading,
    IsManualApproverer,
    listingData,
    isReviewer,
  };
}
