import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useMemo, useState } from "react";

export type BulkImport = {
  sn: number;
  section: string;
  filename: string;
  date: string;
  uploadedby: string;
  status: string;
  action: string;
};

//nested data is ok, see accessorKeys in ColumnDef below
const data: BulkImport[] = [
  {
    sn: 1,
    section: "Fual Purchased",
    filename: "Fual_Purchased.xls",
    date: "24 Nov 2023",
    uploadedby: "Vinod Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 2,
    section: "Waste Data",
    filename: "waste_data.xls",
    date: "20 Nov 2023",
    uploadedby: "Rahul Mehra",
    status: "Success",
    action: "",
  },
  {
    sn: 3,
    section: "Employee Travel",
    filename: "emp_travel.xls",
    date: "24 dec 2023",
    uploadedby: "Hemanshu Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 4,
    section: "Business travel",
    filename: "business_travel.xls",
    date: "01 Nov 2021",
    uploadedby: "Jay Joshi",
    status: "Failure",
    action: "",
  },
  {
    sn: 5,
    section: "Energy",
    filename: "Energy.xls",
    date: "22 Nov 2023",
    uploadedby: "Puja sharma",
    status: "Success",
    action: "",
  },
  {
    sn: 6,
    section: "Fual Purchased",
    filename: "Fual_Purchased.xls",
    date: "24 Nov 2023",
    uploadedby: "Vinod Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 7,
    section: "Waste Data",
    filename: "waste_data.xls",
    date: "20 Nov 2023",
    uploadedby: "Rahul Mehra",
    status: "Success",
    action: "",
  },
  {
    sn: 8,
    section: "Employee Travel",
    filename: "emp_travel.xls",
    date: "24 dec 2023",
    uploadedby: "Hemanshu Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 9,
    section: "Business travel",
    filename: "business_travel.xls",
    date: "01 Nov 2021",
    uploadedby: "Jay Joshi",
    status: "Failure",
    action: "",
  },
  {
    sn: 10,
    section: "Energy",
    filename: "Energy.xls",
    date: "22 Nov 2023",
    uploadedby: "Puja sharma",
    status: "Success",
    action: "",
  },
  {
    sn: 11,
    section: "Fual Purchased",
    filename: "Fual_Purchased.xls",
    date: "24 Nov 2023",
    uploadedby: "Vinod Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 12,
    section: "Waste Data",
    filename: "waste_data.xls",
    date: "20 Nov 2023",
    uploadedby: "Rahul Mehra",
    status: "Success",
    action: "",
  },
  {
    sn: 13,
    section: "Employee Travel",
    filename: "emp_travel.xls",
    date: "24 dec 2023",
    uploadedby: "Hemanshu Patel",
    status: "Success",
    action: "",
  },
  {
    sn: 14,
    section: "Business travel",
    filename: "business_travel.xls",
    date: "01 Nov 2021",
    uploadedby: "Jay Joshi",
    status: "Failure",
    action: "",
  },
  {
    sn: 15,
    section: "Energy",
    filename: "Energy.xls",
    date: "22 Nov 2023",
    uploadedby: "Puja sharma",
    status: "Success",
    action: "",
  },
];
const Tables: React.FC = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, //customize the default page size
  });
  const columns = useMemo<MRT_ColumnDef<BulkImport>[]>(
    () => [
      {
        accessorKey: "sn",
        header: "SN",
      },
      {
        accessorKey: "section",
        header: "Section",
        //footer: (props) => props.column.id,
      },
      {
        accessorKey: "filename",
        header: "File Name",
        //footer: (props) => props.column.id,
      },
      {
        accessorKey: "date",
        header: "Date",
        //footer: (props) => props.column.id,
      },
      {
        accessorKey: "uploadedby",
        header: "Uploaded By",
        //footer: (props) => props.column.id,
      },
      {
        accessorKey: "status",
        header: "Status",
        //footer: (props) => props.column.id,
      },
      {
        accessorKey: "action",
        header: "Action",
        //footer: (props) => props.column.id,
      },
    ],
    []
  );
  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    onPaginationChange: setPagination, //hoist pagination state to your state when it changes internally
    state: { pagination }, //pass the pagination state to the table
  });

  return <MantineReactTable table={table} />;
};
export default Tables;
