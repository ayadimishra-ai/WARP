// Column Schema Types
export type ColumnType = "text" | "number" | "select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ColumnSchema {
  key: string;
  label: string;
  type: ColumnType;
  required: boolean;
  options?: SelectOption[];
}

export interface TableSchema {
  columns: ColumnSchema[];
}

// Row Data Types
export interface RowData {
  [key: string]: string | number | null | undefined;
}

export interface EditableRow {
  id: string;
  data: RowData;
  isEditing: boolean;
  errors: Record<string, boolean>;
}
