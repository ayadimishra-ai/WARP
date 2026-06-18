import { Box, Grid } from "@mantine/core";
import BlockHeading from "../common/BlockHeading";
import TotalEmissionCat from "./TotalEmissionCat";
import TotalEmissionLocationBlock from "./TotalEmissionLocationBlock";
import WorkStreamBlock from "./WorkStreamBlock";

function EmissionContributorsBlock(props: any) {
  return (
    <Box>
      <BlockHeading title="Emission Contributors" />
      <Grid
        gutter="md"
        pt="md"
        id="byWorkStreamsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <WorkStreamBlock selectedShowData={props.selectedShowData} />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="byCategoriesScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <TotalEmissionCat selectedShowData={props.selectedShowData} />
        </Grid.Col>
      </Grid>
      <Grid gutter="md" pt="md" id="byRegionsScrollId" className="subScrollIds">
        <Grid.Col span={12}>
          <TotalEmissionLocationBlock
            selectedShowData={props.selectedShowData}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default EmissionContributorsBlock;
