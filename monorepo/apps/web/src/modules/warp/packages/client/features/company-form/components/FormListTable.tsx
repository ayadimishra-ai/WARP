import { Box } from "@mantine/core";

//import data from "../components/FormListTable.data";

interface ICompanyFormProps {
  CompanyId?: String;
}

// type GetCompanyFormListResultType =
//   GetCompanyFormListQuery["CompanyForm"][number];

// const FormListTable: FC<ICompanyFormProps> = ({ CompanyId }) => {
//   const [getData, { data }] = useGetCompanyFormListLazyQuery({
//     variables: { CompanyId },
//   });

//   //console.log("props CompanyId " + CompanyId);
//   //console.log("GET_COMPANY_QUERY_TYPE", { data, CompanyId, error });

//   const [activePage, setPage] = useState(1);
//   const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: 5,
//   });

//   useEffect(() => {
//     !!CompanyId && getData();
//   }, [CompanyId, getData]);

//   const columns = useMemo<ColumnDef<GetCompanyFormListResultType>[]>(
//     () => [
//       {
//         accessorKey: "Form.name",
//         header: () => "Form",
//         cell: (info: { getValue: () => any }) => info.getValue(),
//         footer: (props: { column: { id: any } }) => props.column.id,
//       },
//       {
//         accessorKey: "created_at",
//         header: () => "Date Time",
//         cell: (info) => info.getValue(),
//         footer: (props) => props.column.id,
//       },
//       {
//         accessorKey: "Form.title",
//         header: () => "Title",
//         cell: (info) => info.getValue(),
//         footer: (props) => props.column.id,
//       },
//       {
//         accessorKey: "Form.tags",
//         header: () => "Tags",
//         cell: ({ row }) =>
//           row.original.Form.tags.map((e: string, i: any) =>
//             row.original.Form.tags.length - 1 != i
//               ? row.original.Form.tags[i] + ","
//               : row.original.Form.tags[i]
//           ),
//         footer: (props) => props.column.id,
//         enableColumnFilter: false,
//       },
//       {
//         accessorKey: "view",
//         header: () => "View",
//         footer: (props) => props.column.id,
//         enableColumnFilter: false,
//         cell: (props: any) => (
//           <Menu shadow="md" width={200}>
//             <Menu.Target>
//               <Button>View</Button>
//             </Menu.Target>
//             <Menu.Dropdown>
//               <Menu.Item
//                 onClick={() =>
//                   handleRedirect(
//                     props.row.original.companyId,
//                     props.row.original.formId
//                   )
//                 }
//               >
//                 Template
//               </Menu.Item>
//               <Menu.Item>Report</Menu.Item>
//             </Menu.Dropdown>
//           </Menu>
//         ),
//       },
//       {
//         accessorKey: "actions",
//         header: "Actions",
//         footer: (props) => props.column.id,
//         enableColumnFilter: false,
//         cell: (props: any) => <Button>Send Invite</Button>,
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: data?.CompanyForm || [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     debugTable: true,
//   });

//   function Filter({
//     column,
//     table,
//   }: {
//     column: Column<any, any>;
//     table: ReactTable<any>;
//   }) {
//     const firstValue = table
//       .getPreFilteredRowModel()
//       .flatRows[0]?.getValue(column.id);

//     const columnFilterValue = column.getFilterValue();

//     return typeof firstValue === "number" ? (
//       <>
//         <NumberInput
//           value={(columnFilterValue as [number, number])?.[0] ?? ""}
//           onChange={(e: any) =>
//             column.setFilterValue((old: [number, number]) => [
//               e.target.value,
//               old?.[1],
//             ])
//           }
//           placeholder={`Min`}
//         />
//         <NumberInput
//           value={(columnFilterValue as [number, number])?.[1] ?? ""}
//           onChange={(e: any) =>
//             column.setFilterValue((old: [number, number]) => [
//               old?.[0],
//               e.target.value ?? 0,
//             ])
//           }
//           placeholder={`Max`}
//         />
//       </>
//     ) : (
//       <TextInput
//         value={(columnFilterValue ?? "") as string}
//         onChange={(e: any) => column.setFilterValue(e.target.value)}
//         placeholder={`Search...`}
//       />
//     );
//   }

//   const handleRedirect = (CompanyId: string, FormId: string) => {
//     Router.push("http://localhost:3000//" + CompanyId + "/form/" + FormId);
//   };

//   return (
//     <Box px="md">
//       <ScrollArea>
//         <Table>
//           <thead>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <th key={header.id} colSpan={header.colSpan}>
//                       {!header.isPlaceholder && (
//                         <Box>
//                           {flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}

//                           {header.column.getCanFilter() && (
//                             <Filter column={header.column} table={table} />
//                           )}
//                         </Box>
//                       )}
//                     </th>
//                   );
//                 })}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map((row) => {
//               return (
//                 <tr key={row.id}>
//                   {row.getVisibleCells().map((cell) => {
//                     return (
//                       <td key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>
//       </ScrollArea>
//       <Space h="md" />
//       <Group position="apart" px="md">
//         <Group spacing="sm">
//           <Text>Page</Text>
//           <Text weight="bold">
//             {table.getState().pagination.pageIndex +
//               1 +
//               " of " +
//               table.getPageCount()}
//           </Text>
//           <Text>Go to page :</Text>
//           <NumberInput
//             defaultValue={table.getState().pagination.pageIndex + 1}
//             onChange={(e: any) => {
//               const page = e ? Number(e) - 1 : 0;
//               setPage(Number(e));
//               table.setPageIndex(page);
//             }}
//           />
//           <Select
//             data={[
//               {
//                 id: "10",
//                 value: "10",
//                 label: "Show 10",
//               },
//               {
//                 id: "20",
//                 value: "20",
//                 label: "Show 20",
//               },
//               {
//                 id: "30",
//                 value: "30",
//                 label: "Show 30",
//               },
//             ]}
//             defaultValue="10"
//             onChange={(value) => {
//               table.setPageSize(Number(value));
//             }}
//           />
//         </Group>
//         <Box>
//           <Pagination
//             total={table.getPageCount()}
//             boundaries={pageIndex}
//             initialPage={1}
//             page={activePage}
//             onChange={(p: any) => {
//               const page = p ? Number(p) - 1 : 0;
//               setPage(Number(p));
//               table.setPageIndex(page);
//             }}
//           />
//         </Box>
//       </Group>
//     </Box>
//   );
// };

const FormListTable = () => {
  return <Box></Box>;
};

export default FormListTable;
