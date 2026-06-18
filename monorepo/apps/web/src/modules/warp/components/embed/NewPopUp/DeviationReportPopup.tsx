import {
  Box,
  Container,
  Group,
  Pagination,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useMediaQuery } from "@mantine/hooks";
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react";
import SortIcons from "@/modules/warp/packages/client/components/SortIcons";
import {
  DataTableType,
  PaginationType,
  TableHeader,
  useDeviation,
} from "@/modules/warp/packages/client/hooks/use-deviation";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useRouter } from "next/router";
import { FC, useState } from "react";
export const useStyles = createStyles((theme) => ({
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
    fontWeight: 600,
    fontSize: "12px",
    color: "#fff",
    whiteSpace: "nowrap",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  tableHeadingBorder: {
    color: "#ffffff",
    background: "#003b52" + "!important",
    fontSize: "12px" + "!important",
    padding: "4px" + "!important",
    "&:first-of-type": {
      borderTopLeftRadius: "10px" + "!important",
      paddingLeft: "10px" + "!important",
    },
    "&:last-of-type": {
      borderTopRightRadius: "10px" + "!important",
      paddingRight: "10px !important",
      width: "162px",
    },
  },

  paginationItem: {
    borderRadius: "50%",
    border: "0",
    backgroundColor: "#fff",
    "&[data-active]": {
      backgroundColor: "#003b52",
      color: "#fff",
    },
    "&[aria-disabled=]": {
      backgroundColor: "#fff",
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
  deviationReportTable: {
    td: {
      borderBottom: "none !important",
    },
  },
}));
type THPropsType = {
  title: string;
  onSort?: (ascending: boolean) => void;
  isSortable: boolean;
  toggleSort?: (e: unknown) => void;
  tableData: any;
};

const TH: FC<THPropsType> = ({
  title,
  isSortable = false,
  onSort = null,
  toggleSort,
  tableData,
}) => {
  const { classes } = useStyles();
  const [ascending, setAscending] = useState(false);

  const sortIcon = ascending ? (
    <IconCaretDown size={18} />
  ) : (
    <IconCaretUp size={18} />
  );

  const sortHandler = (e: any) => {
    if (!isSortable) return;
    setAscending((prev) => !prev);
  };
  return (
    <th className={classes.tableHeadingBorder}>
      <Group
        style={
          title === "Questions"
            ? {
                position: "relative",
                width: "max-content",
                gap: "0",
                float: "left",
              }
            : {
                position: "relative",
                //width: "max-content",
                gap: "0",
                // float: "right",
                justifyContent: "center",
              }
        }
      >
        <UnstyledButton
          className={classes.tableHeading}
          onClick={(e: any) => {
            sortHandler(e);
            toggleSort?.(e);
          }}
          // pl={title === "Questions" ? 20 : 0}
        >
          <Text>{title}</Text>
          {isSortable && (
            <SortIcons
              sortState={tableData.getIsSorted() as string | false}
              color="#ffffff"
              size={16}
            />
          )}
        </UnstyledButton>
      </Group>
    </th>
  );
};
const DeviationTable = ({
  tableheader,
  datatable,
  mainLoading,
}: {
  tableheader: TableHeader;
  datatable: DataTableType;
  mainLoading: boolean;
}) => {
  const { classes } = useStyles();
  const [sortTable, setSortTable] = useState(false);

  const sortingTable = () => {
    setSortTable(!sortTable);
  };

  const router = useRouter();
  const { tperiod } = router.query;
  //let tperiod1: string = tperiod!;
  //let questionnaire_Time_Period: string = tperiod ?? "";

  return (
    <>
      <table className="deviationReportTable">
        <thead>
          <tr>
            {tableheader.tableHeadings[0]
              ?.filter(
                (m) =>
                  ![
                    "Id",
                    "question",
                    "breadcrum",
                    "created_at",
                    "questionTitle",
                  ].includes(m.id)
              )
              .map((element) => (
                <TH
                  key={element.id}
                  title={element.id}
                  onSort={sortingTable}
                  isSortable={element.id !== "Action"}
                  toggleSort={element.column.getToggleSortingHandler()}
                  tableData={element.column}
                />
              ))}
          </tr>
        </thead>
        <tbody>
          {datatable.rows.length > 0 ? (
            datatable.rows.map((row, index) => (
              <tr>
                <td>
                  <Tooltip
                    label={`${row.original?.questionTitle}${
                      row.original?.questionTitle ? ". " : ""
                    }${row.original?.question}`}
                    position="bottom-start"
                    multiline
                    w={300}
                    color="#ffffff"
                    fw={400}
                    offset={0}
                  >
                    <Text
                      c="#444444"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "300px",
                      }}
                    >
                      <b>
                        {row.original?.questionTitle}
                        {row.original?.questionTitle ? ". " : ""}
                        {row.original?.question}
                      </b>
                    </Text>
                  </Tooltip>
                  <Tooltip
                    label={`${row.original?.breadcrum}`}
                    position="bottom-start"
                    offset={0}
                    multiline
                    w={300}
                    color="#ffffff"
                    fw={400}
                  >
                    <Text
                      c="#444444"
                      fw={300}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "300px",
                      }}
                    >
                      {row.original?.breadcrum}
                    </Text>
                  </Tooltip>
                </td>
                <td>
                  <Text
                    style={{ backgroundColor: "#DFDFDF" }}
                    className="deviationValue"
                    fw={400}
                    c="#000000"
                  >
                    {row.original["Old Value"]}
                  </Text>
                </td>
                <td>
                  <Text
                    style={{ backgroundColor: "#DFDFDF" }}
                    className="deviationValue"
                    fw={400}
                    c="#000000"
                  >
                    {row.original["New Value"]}
                  </Text>
                </td>
                <td>
                  <Text
                    style={{ backgroundColor: "#DFDFDF" }}
                    className="deviationValue"
                    fw={400}
                    c="#000000"
                  >
                    {row.original["Threshold Deviation (%)"]}
                  </Text>
                </td>
                <td>
                  <Text
                    style={{ backgroundColor: "#FFA93C" }}
                    className="deviationValue"
                    fw={400}
                    c="#000000"
                  >
                    {row.original["Actual Deviation (%)"]}
                  </Text>
                </td>
                <td>
                  <Text
                    style={{ backgroundColor: "#4AD2CA" }}
                    className="deviationValue"
                    fw={400}
                    c="#000000"
                  >
                    {row.original["Deviation Differential (%)"]}
                  </Text>
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
      </table>
    </>
  );
};
const Footer = ({ pagination }: { pagination: PaginationType }) => {
  const { classes } = useStyles();
  return (
    <Pagination
      pt={10}
      total={pagination.getTotalCount ?? 0}
      value={pagination?.page}
      onChange={(e: any) => pagination?.onPageChange(e)}
    />
  );
};
const DeviationList: FC = () => {
  const smallScreen = useMediaQuery("(max-width: 800px)");
  const userSession = useUserSession();
  const { tableheader, datatable, mainLoading, pagination, listingData } =
    useDeviation(userSession?.user?.role);

  return (
    <Container fluid px={0}>
      {/* <LoadingOverlay style={{ top: "-20px" }} visible={mainLoading} /> */}
      <Spinner visible={mainLoading} />
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></Box>
      <DeviationTable
        mainLoading={mainLoading}
        tableheader={tableheader}
        datatable={datatable}
      />
      <Footer pagination={pagination} />
    </Container>
  );
};

export default DeviationList;
