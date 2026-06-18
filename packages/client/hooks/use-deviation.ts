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
import { useGetassesseeuserbyinvitationIdQuery } from "@warp/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetvalidationWarningRulesbyInvitationIdQuery } from "@warp/graphql/queries/generated/get-validation-warning-rules-by-invitationId";
import { AppRoles } from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useUserSession } from "./use-user-session";
export type ColumnType = {
  Id: string;
  Questions: string;
  question: string;
  breadcrum: string;
  "Old Value": string;
  "New Value": string;
  "Threshold Deviation (%)": string;
  "Actual Deviation (%)": string;
  "Deviation Differential (%)": string;
  created_at: string;
  questionTitle: string;
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

export type PaginationType = {
  previous: () => void;
  next: () => void;
  page: number;
  onPageChange: (updater: Updater<number>) => void;
  getTotalCount: number;
  getPageSize: number;
  setPageSize: (updater: Updater<number>) => void;
};
export function useDeviation(userRole?: string) {
  const { query } = useRouter();
  const { invitationId } = query;
  const userSession = useUserSession();
  const { data: warningRulesList, loading } =
    useGetvalidationWarningRulesbyInvitationIdQuery({
      variables: {
        invitationId: invitationId,
        userId: userSession?.user?.id,
      },
    });
  const { data: AssesseeUserMappingQueryResult } =
    useGetassesseeuserbyinvitationIdQuery({
      variables: {
        invitationId,
      },
    });
  const warningRulesListing: ColumnType[] = useMemo<ColumnType[]>(() => {
    let listingpagedata: any = [];
    if (!warningRulesList) {
      return [];
    }
    let finaldata: any = warningRulesList?.ValidationWarningLogs;
    if (userRole === AppRoles.Responder) {
      let assignedQuestion: any =
        AssesseeUserMappingQueryResult?.AssesseeUserMapping.filter(
          (x: any) =>
            x.userId == userSession?.user?.id && x.InvitationId == invitationId
        );

      if (assignedQuestion?.length > 0) {
        finaldata = warningRulesList?.ValidationWarningLogs.filter(
          (x: any) =>
            assignedQuestion.filter((y: any) => y.questionId == x.QuestionId)
              .length > 0
        );
      } else {
        assignedQuestion = [];
      }
    }
    let hirarchydata: any = "";
    let hirarchylevel: any = "";
    let questionlabel: any = "";
    let questiontitle: any = "";
    let parentFormFieldData: any = "";
    !!finaldata?.map((warningrulesData: any) => {
      hirarchydata = warningrulesData?.Question?.FormFields.filter(
        (c: any) => c.interface === "group-wizard"
      );
      hirarchylevel =
        hirarchydata !== undefined && hirarchydata !== null
          ? hirarchydata[0]?.interfaceOptions?.hierarchyLevel
          : "";
      let formFieldData = warningrulesData?.Question?.FormFields?.filter(
        (rec: any) => rec.id == warningrulesData.formFieldId
      );
      if (!!formFieldData && formFieldData.length > 0) {
        if (
          formFieldData[0]?.fieldOptions?.label == undefined ||
          formFieldData[0]?.fieldOptions?.label == null ||
          formFieldData[0]?.fieldOptions?.label == ""
        ) {
          parentFormFieldData = warningrulesData?.Question?.FormFields?.filter(
            (rec: any) => rec.field == formFieldData[0].groupField
          );
          if (
            parentFormFieldData[0]?.fieldOptions?.parentHeading != undefined &&
            parentFormFieldData[0]?.fieldOptions?.parentHeading != null &&
            parentFormFieldData[0]?.fieldOptions?.parentHeading != ""
          ) {
            questionlabel = parentFormFieldData[0]?.fieldOptions?.parentHeading;
          } else {
            questionlabel = parentFormFieldData[0]?.fieldOptions?.label;
          }
        } else {
          questionlabel = formFieldData[0]?.fieldOptions?.label;
        }
        if (
          formFieldData[0]?.interfaceOptions?.title == undefined ||
          formFieldData[0]?.interfaceOptions?.title == null ||
          formFieldData[0]?.interfaceOptions?.title == ""
        ) {
          parentFormFieldData = warningrulesData?.Question?.FormFields?.filter(
            (rec: any) => rec.field == formFieldData[0].groupField
          );
          if (
            parentFormFieldData[0]?.interfaceOptions?.parenttitle !=
              undefined &&
            parentFormFieldData[0]?.interfaceOptions?.parenttitle != null &&
            parentFormFieldData[0]?.interfaceOptions?.parenttitle != ""
          ) {
            questiontitle =
              parentFormFieldData[0]?.interfaceOptions?.parenttitle;
          } else {
            questiontitle = parentFormFieldData[0]?.interfaceOptions?.title;
          }
        } else {
          questiontitle = formFieldData[0]?.interfaceOptions?.title;
        }
      }
      if (questiontitle == "") {
        let title: any = warningrulesData?.Question?.FormFields?.filter(
          (rec: any) =>
            rec.interfaceOptions?.title != null &&
            rec.interfaceOptions?.title != "" &&
            rec.interfaceOptions?.title != undefined
        );
        if (!!title && title.length > 0) {
          questiontitle = title[0]?.interfaceOptions?.title;
        }
      }
      listingpagedata.push({
        Id: warningrulesData.Id,
        Questions: warningrulesData?.Question?.key,
        question: questionlabel,
        questionTitle: questiontitle,
        breadcrum:
          hirarchylevel !== undefined &&
          hirarchylevel !== null &&
          hirarchylevel !== ""
            ? !!warningrulesData?.Question?.Section?.ParentSection
              ? warningrulesData?.Question?.Section?.ParentSection?.content
              : warningrulesData?.Question?.Section?.content
            : !!warningrulesData?.Question?.Section?.ParentSection
            ? warningrulesData?.Question?.Section?.ParentSection?.content +
              ` > ` +
              warningrulesData?.Question?.Section?.content
            : warningrulesData?.Question?.Section?.content,
        "Old Value":
          parseInt(warningrulesData.values.OldValue) > 0
            ? String(parseFloat(warningrulesData.values.OldValue).toFixed(2))
            : 0.0,
        "New Value":
          parseInt(warningrulesData.values.NewValue) > 0
            ? String(parseFloat(warningrulesData.values.NewValue).toFixed(2))
            : 0.0,
        "Threshold Deviation (%)":
          parseInt(warningrulesData.values.Threshold_Deviation) > 0
            ? String(
                parseFloat(warningrulesData.values.Threshold_Deviation).toFixed(
                  2
                )
              )
            : 0.0,
        "Actual Deviation (%)":
          parseInt(warningrulesData.values.ActualDeviation) > 0
            ? String(
                parseFloat(warningrulesData.values.ActualDeviation).toFixed(2)
              )
            : 0.0,
        "Deviation Differential (%)":
          parseInt(warningrulesData.values.Deviation_differential) > 0
            ? String(
                parseFloat(
                  warningrulesData.values.Deviation_differential
                ).toFixed(2)
              )
            : 0.0,
        created_at: formFieldData[0]?.created_at,
      });
    });
    return listingpagedata?.sort((a: any, b: any) =>
      a.created_at < b.created_at ? -1 : 1
    );
  }, [warningRulesList]);

  const [listingData, setlistingData] =
    useState<ColumnType[]>(warningRulesListing);
  const [listingData1, setlistingData1] =
    useState<ColumnType[]>(warningRulesListing);
  const [tableHeadings, settableHeadings] = useState<
    Header<ColumnType, unknown>[][]
  >([]);

  useEffect(() => {
    setlistingData(warningRulesListing);
    setlistingData1(warningRulesListing);
  }, [warningRulesListing]);

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
    initialState: {
      pagination: { pageSize: 3 }, 
    },
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
        asc: " 🔼",
        desc: " 🔽",
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
    getPageSize: 3,
    setPageSize: () => table.setPageSize(3),
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

  return {
    tableheader,
    datatable,
    filter,
    pagination,
    mainLoading,
    listingData,
  };
}
