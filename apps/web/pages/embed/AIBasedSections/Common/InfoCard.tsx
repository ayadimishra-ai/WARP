import { Card, SimpleGrid, Text } from "@mantine/core";
import InfoItem from "./InfoItem";

export type InfoData = {
  label: string;
  info?: string;
  value?: number;
  mandatory?: number | null | undefined;
  optional?: number | null | undefined;
};
const colors = ["#D2F4FF", "#D3FFE6", "#FFE1D3", "#FFD3D3"];
const InfoCard = ({
  data,
  uploadDocument = false,
}: {
  data: InfoData[];
  uploadDocument?: boolean;
}) => {
  const gridSpacing = uploadDocument ? 50 : 30;
  return (
    <SimpleGrid
      breakpoints={[
        { minWidth: "xs", cols: 1, spacing: "xl", verticalSpacing: "xl" },
        { minWidth: "sm", cols: 2, spacing: "xl", verticalSpacing: "xl" },
        {
          minWidth: "md",
          cols: 4,
          spacing: gridSpacing,
          verticalSpacing: gridSpacing,
        },
      ]}
    >
      {!!data && data.length > 0 ? (
        data.map((card, index) => (
          <Card
            bg={colors[index > colors.length ? index % colors.length : index]}
            py="xl"
            radius={5}
            h="140px"
            sx={{ overflow: "unset" }}
            key={index}
          >
            <InfoItem
              c="#444444"
              fz="14px"
              lh="19.75px"
              fw={500}
              tt="uppercase"
              lts="0.15em"
              label={card.label}
              info={card.info}
              infoIconTop="-2px"
              whiteSpace
            />
            <Text c="#444444" fz="36px" lh="45.65px" fw="500" align="center">
              {card.value}
            </Text>
            <Text c="#444444" fz="10px" lh="12.68px" fw="700" align="center">
              {!!card.mandatory && card.mandatory > 0 ? (
                <>
                  {card.mandatory}{" "}
                  <Text component="span" fw="400">
                    Mandatory
                  </Text>
                </>
              ) : (
                <></>
              )}
              {!!card.optional && card.optional > 0 ? (
                <>
                  {", "}
                  {card.optional}{" "}
                  <Text component="span" fw="400">
                    Optional
                  </Text>
                </>
              ) : (
                <></>
              )}
            </Text>
          </Card>
        ))
      ) : (
        <></>
      )}
    </SimpleGrid>
  );
};

export default InfoCard;
