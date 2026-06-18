import { Anchor, Box, Button, MantineProvider } from "@mantine/core";
import SortIcons from "@/modules/warp/packages/client/components/SortIcons";
import {
  getAISuggestionCarouselData,
  getAISuggestionCarouselforFileData,
  LongTextTrim,
} from "@/modules/warp/packages/client/features/form/common-functions";
import { FormFieldInterfaces } from "@/modules/warp/packages/client/features/form/constants";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { setSuggestionStoreValueFromPopup } from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useGetSourceDataByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-sourcedata-by-invitationId";
import { useGetSuggestionByInvitationAndFormFieldDetailsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-suggestion-by-invitationId-andformfieldid";
import {
  AICArouselData,
  multipleFileUploadClick,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { setLocalStorageData } from "@/modules/warp/packages/shared/utils/auth-session.util";
import {
  MantineReactTable,
  MRT_Icons,
  // MRT_SortingState,
  MRT_VisibilityState,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SourceBlock from "../AIBasedSections/Common/SourceBlock";

export type TableData = {
  id: string;
  source: tableOtherData;
};
export type tableOtherData = {
  data: AICArouselData;
  index: number;
  totalConflict: number;
};
const tableIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <SortIcons
      sortState={false}
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
  IconSortAscending: (props: any) => (
    <SortIcons
      sortState="asc"
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
  IconSortDescending: (props: any) => (
    <SortIcons
      sortState="desc"
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
};

const AISuggestionTablePopup = () => {
  const { query } = useRouter();
  const { invitationId, SuggestionId, formFieldId, isFile } = query;
  const isFileParsed = isFile
    ? isFile.toString().toLowerCase() === "true"
    : false;
  const suggestionData = useGetSuggestionByInvitationAndFormFieldDetailsQuery({
    variables: {
      formFieldId: formFieldId,
      invitationId: invitationId,
    },
  });
  const [selectedRowId, setSelectedRowId] = useState<string[]>(
    SuggestionId ? [String(SuggestionId)] : []
  );

  //#region Carousel Data Binding
  const AISuggestionTAbledata: AICArouselData[] = getAISuggestionCarouselData(
    !!suggestionData?.data?.Suggestions
      ? suggestionData?.data?.Suggestions
      : [],
    !!suggestionData?.data?.Suggestions &&
      suggestionData?.data?.Suggestions.length > 0
      ? suggestionData?.data?.Suggestions[0]?.FormField?.interface
      : ""
  );

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    { id: true }
  );
  useEffect(() => {
    const isFileType = !isFileParsed;

    setColumnVisibility((prev) => ({
      ...prev,
      id: isFileType,
    }));
  }, [isFile, isFileParsed]);

  const { data: pageLoadSourceFileData } = useGetSourceDataByInvitationIdQuery({
    variables: {
      invitationId: query?.invitationId,
    },
  });

  let AISuggestionCarouseldata: AICArouselData[] = [];
  if (
    !!pageLoadSourceFileData &&
    pageLoadSourceFileData?.Sources.length > 0 &&
    typeof formFieldId === "string"
  ) {
    AISuggestionCarouseldata = getAISuggestionCarouselforFileData(
      pageLoadSourceFileData?.Sources,
      formFieldId
    );
  }

  const sortTableData = (data: AICArouselData[]) =>
    data
      .sort((a, b) => (b.conflict < a.conflict ? -1 : 1))
      .sort((a, b) => (b.sourceCount < a.sourceCount ? -1 : 1))
      .sort((a, b) => (b.cardType > a.cardType ? -1 : 1));

  const Tabledata: AICArouselData[] = isFileParsed
    ? AISuggestionCarouseldata
    : sortTableData(AISuggestionTAbledata);
  const data = Tabledata.map((items, index) => {
    return {
      id: items?.title,
      source: {
        data: items,
        index: index,
        totalConflict: Tabledata.filter(
          (tableItems) => tableItems.conflict == true
        ).length,
      },
    };
  });
  //#endregion
  useEffect(() => {
    if (!SuggestionId) return;
    if (!!SuggestionId) {
      setSelectedRowId([String(SuggestionId)]);
    } else {
      if (
        !!suggestionData.data?.Suggestions &&
        suggestionData.data?.Suggestions.length > 0
      ) {
        setSelectedRowId(
          suggestionData.data?.Suggestions?.filter(
            (items) => items?.isSelected == true
          ).map((ditems) => ditems?.id)
        );
      }
    }
  }, [SuggestionId, suggestionData.data]);
  const handleRowSelection = (
    id: string,
    value: string | string[] | Record<string, any>[]
  ) => {
    const valueData = value as Record<string, any>[];
    let selectedRow =
      selectedRowId.filter((items) => items == id).length > 0 ? [] : [id];
    let selectedData = [
      {
        sourceId: id,
        filepath: isFile
          ? Array.isArray(valueData)
            ? valueData[0].fileurl
            : value
          : value,
      },
    ] as multipleFileUploadClick[];
    if (isFile) {
      if (Tabledata.length > 0) {
        selectedData = Tabledata.filter((items) =>
          selectedRow.some((dataItems) => dataItems == items?.id)
        ).map((items) => {
          return { sourceId: items?.id, filepath: items?.sourceUrl };
        }) as multipleFileUploadClick[];
      }
    }
    setSelectedRowId(selectedRow);
    setLocalStorageData(
      window.localStorage,
      "isSelectSuggestionFromPopup",
      selectedRow.filter((items: string) => items == id).length > 0
    );
    window.parent.postMessage(
      setSuggestionStoreValueFromPopup(
        id,
        value,
        selectedRow.filter((items) => items == id).length > 0,
        selectedData
      ),
      "*"
    );
  };
  // const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const columns = useMemo<MRT_ColumnDef<TableData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Suggestions",
        size: 120,
        Cell: ({ row }) => {
          const suggestionData = row.original.source.data;
          const isHTMLSuggestion =
            !!suggestionData?.HTMLSuggestion?.shortSummary;

          const text =
            suggestionData?.HTMLSuggestion?.shortSummary ||
            suggestionData?.HTMLSuggestion?.value ||
            "";

          const truncated = LongTextTrim(text, 92);
          const isTruncated = text.length > 92;

          // Generate a card title label based on whether the suggestion is a conflict, already selected, or a new unselected suggestion.
          const cardTitle = suggestionData?.conflict
            ? "Selected Answer #" + String(row.original.source.index + 1)
            : row.original.source.index -
                row.original.source.totalConflict +
                1 >
              0
            ? "Suggestion #" +
              String(
                row.original.source.index -
                  row.original.source.totalConflict +
                  1
              )
            : "Suggestion #" + String(row.original.source.index + 1);

          return (
            <div
              style={{ fontSize: "13px", lineHeight: "18px", color: "#444" }}
            >
              {truncated}
              {(isTruncated || isHTMLSuggestion) && (
                <Anchor
                  component="span"
                  onClick={() =>
                    window.parent.postMessage(
                      JSON.stringify({
                        type: "suggestionCardText_Popup",
                        data: {
                          aiSuggestionTitle: cardTitle,
                          aiSuggestionMessage: suggestionData?.sourceTitle,
                          value: suggestionData?.HTMLSuggestion?.value || "NA",
                          suggestionId: suggestionData?.id,
                          formFieldId: String(formFieldId),
                          isSelected: selectedRowId.includes(
                            suggestionData?.id
                          ),
                          isHTMLSuggestion: isHTMLSuggestion,
                        },
                      }),
                      "*"
                    )
                  }
                  fw={600}
                  fz="9px"
                  lh="11.41px"
                  c="#038FC7"
                  tt="uppercase"
                  ml="5px"
                >
                  View More
                </Anchor>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        accessorFn: (row) => row.source?.data?.sourceTitle || "", // ✅ Used for filtering
        Cell: ({ row }) => {
          const cardTitle = row.original.source?.data?.conflict
            ? "Selected Answer #" + String(row.original.source?.index + 1)
            : selectedRowId.length > 0
            ? "Suggestion #" + String(row.original.source?.index + 1)
            : "Suggestion #" +
              String(
                row.original.source?.index -
                  row.original.source?.totalConflict +
                  1
              );
          return (
            <SourceBlock
              id={row.original.source?.data?.id}
              suggestionContent={row?.original?.id}
              sourceTitle={row.original.source?.data?.sourceTitle}
              sourceUrl={row.original.source?.data?.sourceUrl}
              sourceCount={row.original.source?.data?.sourceCount}
              suggestionlist={row.original.source?.data?.suggestionlist}
              cardTitle={cardTitle}
              suggestion={row.original.source?.data?.allSuggestions}
              formFieldId={String(formFieldId)}
              isSelected={
                selectedRowId.filter(
                  (items) => items == row?.original?.source?.data?.id
                ).length > 0
              }
              cardType={row.original.source?.data?.cardType}
              defaultData={row.original.source?.data?.defaultData}
              isReplaceInfoContent={
                suggestionData?.data?.Suggestions[0]?.FormField?.interface ==
                  FormFieldInterfaces["input"] ||
                suggestionData?.data?.Suggestions[0]?.FormField?.interface ==
                  FormFieldInterfaces["number-input"]
              }
              isFile
              isTableView
            />
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        size: 120,
        Cell: ({ row }) => {
          const isSelected =
            selectedRowId.filter(
              (items) => items == row?.original?.source?.data?.id
            ).length > 0;
          const isconflict =
            selectedRowId.length > 0
              ? false
              : row?.original?.source?.data?.conflict;
          return (
            <Button
              variant="transparent"
              c={isSelected ? "#15AE49" : "#122F47"}
              onClick={() =>
                handleRowSelection(
                  row.original?.source?.data?.id,
                  row?.original?.source?.data?.allSuggestions
                )
              }
              className="btn"
              lts="0.15em"
              px="10px"
              fz="13px"
              styles={{
                root: {
                  textAlign: "left",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
                inner: {
                  justifyContent: "flex-start",
                },
              }}
            >
              {isSelected ? "SELECTED" : "USE THIS"}
            </Button>
          );
        },
      },
    ],
    [selectedRowId]
  );

  const table = useMantineReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      // sorting,
    },
    // onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    icons: tableIcons,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    columnFilterDisplayMode: "popover",
    enableColumnActions: false,
    enableStickyHeader: false,
    enablePagination: false,
    mantineTableContainerProps: {
      style: {
        overflowX: "hidden", // Prevent horizontal scroll if not needed
        boxShadow: "0px 2px 2px 0px rgba(159, 162, 191, 0.32)",
        borderRadius: "10px",
        border: "1px solid #dee2e6"
      }
    },
    mantineTableBodyRowProps: ({ row }) => {
      const isSelected =
        selectedRowId.filter(
          (items) => items == row?.original?.source?.data?.id
        ).length > 0;
      const isconflict =
        selectedRowId.length > 0
          ? false
          : row?.original?.source?.data?.conflict;
      return {
        style: {
          backgroundColor: isSelected
            ? "#D7FFE5"
            : isconflict
            ? "#ffeed8"
            : undefined, // Apply green color for the selected row
          transition: "background-color 0.3s ease", // Add smooth transition
        },
      };
    },
    mantineTableBodyCellProps: {
      style: {
        height: 32,
        fontSize: "13px",
        fontWeight: 400,
        padding: "0px 16px",
        color: "#444444",
        border: "none",
        background: "transparent"
      }
    }
  });

  return (
    <Box className="UploadFileTable">
      {data.length > 0 ? (
        <MantineProvider
          theme={{
            components: {
              Table: {
                styles: {
                  table:{width:"100%"},
                  tbody: {
                    display: "block",
                    maxHeight: "324px",
                    height: "324px",
                    overflowY: "auto",
                    margin: Tabledata.length > 10 ? "6px 3px 6px 0px" : "0",
                  }
                }
              },
              Popover: {
                styles: {
                  dropdown: {
                    zIndex: 9999,
                    padding: "8px"
                  }
                },
                defaultProps: {
                  withinPortal: true,
                  position: "bottom",
                  offset: 12
                }
              },
              TextInput: {
                styles: {
                  root: {
                    width: "100%",
                    borderBottom: "0px !important"
                  },
                  input: {
                    padding: "0px 32px 2px 15px",
                    borderRadius: 30,
                    backgroundColor: "#f1f3f6"
                  }
                }
              },
              Tooltip: {
                defaultProps: {
                  offset: 10,
                  position: "bottom"
                }
              },
              ActionIcon: {
                defaultProps: {
                  variant: "transparent",
                  color: "#fff"
                }
              }
            },
          }}
        >
          <MantineReactTable table={table} />
        </MantineProvider>
      ) : (
        <Box h="100px">
          <Spinner visible={true} />
        </Box>
      )}
    </Box>
  );
};

export default AISuggestionTablePopup;
