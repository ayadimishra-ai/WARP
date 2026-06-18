import { gql, useQuery } from "@apollo/client";
import { Box, Pagination, Table, TextInput } from "@mantine/core";
import {
  Column,
  ColumnDef,
  Table as ReactTable,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { FC } from "react";

interface IInvitationProps {
  companyid: string;
}

const invitationStatus = ["All", "Submitted", "Approved"];

const Invitation: FC<IInvitationProps> = ({ companyid }) => {
  type IInvitation = {
    companyId: string;
    email: string;
    name: string;
    created_at: string;
    score: number;
    status: string;
  };

  const [globalFilter, setGlobalFilter] = React.useState<String>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const GET_COMPANYFORMINVITATIONS = gql`
    query GetCompanyFormInvitation($companyid: uuid) {
      CompanyForm(where: { companyId: { _eq: $companyid } }) {
        companyId
        Form {
          name
          FormInvitations {
            email
            FormSubmissions {
              id
              status
              created_at
              FormResults {
                id
                score
              }
            }
          }
        }
      }
    }
  `;

  type GET_COMPANY_QUERY_TYPE = {
    CompanyForm: IInvitation[];
  };

  const { loading, error, data } = useQuery<GET_COMPANY_QUERY_TYPE>(
    GET_COMPANYFORMINVITATIONS,
    { variables: { companyid } }
  );

  const columns = React.useMemo<ColumnDef<IInvitation>[]>(
    () => [
      {
        accessorKey: "Form.FormInvitations.email",
        cell: (info) => info.getValue() ?? "",
        header: () => <span>User</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "Form.name",
        cell: (info) => info.getValue() ?? "",
        header: () => <span>Form</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "Form.FormInvitations.email",
        cell: (info) => info.getValue() ?? "",
        header: () => <span>Submission Date</span>,
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const table = useReactTable({
    data: data?.CompanyForm ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  function Filter({
    column,
    table,
  }: {
    column: Column<any, any>;
    table: ReactTable<any>;
  }) {
    const firstValue = table
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return typeof firstValue === undefined ? (
      <Box>
        <TextInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(e: any) =>
            column.setFilterValue((old: [number, number]) => [
              e.target.value,
              old?.[1],
            ])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <TextInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(e: any) =>
            column.setFilterValue((old: [number, number]) => [
              old?.[0],
              e.target.value,
            ])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </Box>
    ) : (
      <TextInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(e: any) => column.setFilterValue(e.target.value)}
        placeholder={`Search...`}
        className="w-36 border shadow rounded"
      />
    );
  }

  return (
    <Box>
      <Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ backgroundColor: "blueviolet" }}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      <Box
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </Box>
                      {header.column.getCanFilter() ? (
                        <Box>
                          <Filter column={header.column} table={table} />
                        </Box>
                      ) : null}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Box style={{ float: "right" }}>
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          onChange={(p: any) => {
            const page = p ? Number(p) - 1 : 0;
            table.setPageIndex(page);
          }}
          total={table.getPageCount()}
        />
      </Box>
      <Box className="h-4" />
      <Box className="flex items-right gap-2">
        <span className="flex items-center gap-1">
          <Box>Page</Box>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <TextInput
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e: any) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e: any) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </Box>
    </Box>
  );
};

export default Invitation;
