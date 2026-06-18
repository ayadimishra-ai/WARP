import { Box, Stack } from "@mantine/core";
import DataImportHistoryTable from "../tables/DataImportHistoryTable";

interface DataImportHistoryProps {
  initialActivityCode?: string | null;
  showSearch?: boolean;
  disableUploadDownload?: boolean;
}

const DataImportHistory: React.FC<DataImportHistoryProps> = ({
  initialActivityCode = null,
  showSearch = true,
  disableUploadDownload = false,
}) => {
  return (
    <Stack gap={15}>
      <Box>
        <DataImportHistoryTable
          initialActivityCode={initialActivityCode}
          showGlobalFilter={showSearch}
          disableUploadDownload={disableUploadDownload}
        />
      </Box>
    </Stack>
  );
};
export default DataImportHistory;
