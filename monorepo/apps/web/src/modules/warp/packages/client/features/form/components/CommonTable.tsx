import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  ScrollArea,
  Table,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useParams } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import ManimizeScreenIcon from "../../../icons/ManimizeScreenIcon";
import MaximizeScreenIcon from "../../../icons/MaximizeScreenIcon";
import { useReviewerContext } from "../reviewer-context";
import Info from "./Info";
const useStyles = createStyles((theme) => ({
  heading: {
    // whiteSpace: "nowrap",
    minWidth: "230px",
    "&:first-of-type": {
      minWidth: "65px",
      // width: 65,
    },
  },
  table: {
    backgroundColor: "#e9edf3",
    border: "none",
    borderCollapse: "collapse",
    "& tbody": {
      background: "#fff",
    },
    "& td": {
      color: "#444444",
      verticalAlign: "middle",
      textAlign: "center",
      padding: "10px 15px !important",
      minHeight: 56,
      borderBottom: "1px solid #E9EDF3",
      "&:first-of-type": {
        textAlign: "left",
      },
    },
    "& th": {
      border: "0px solid transparent !important",
      fontSize: 12,
      fontWeight: 600,
      color: "#101113 !important",
      lineHeight: "normal",
      padding: "15px !important",
      textAlign: "left",
    },
    "& .mantine-Stack-root": {
      gap: 0,
    },
  },
}));

type Props = {
  headers: Array<any>;
  sortedChildrenData: any;
  onAddRow?: () => void;
  showAddRow?: boolean;
  questionId?: string;
  isDisabled?: boolean;
};
const CommonTable: FC<PropsWithChildren<Props>> = ({
  headers,
  sortedChildrenData,
  children,
  onAddRow,
  showAddRow,
  questionId,
  isDisabled = false,
}) => {
  const { classes } = useStyles();
  const ref = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggle = async () => {
    if (!fullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      if (document.fullscreenElement) await document.exitFullscreen();
      setFullscreen(false);
    }
  };
  
  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow();
    }
  };

  const query = useParams<{ invitationId: string; mode: string }>();
  const {
    isReviewer,
    isMaker,
    reviewerStatusMap,
    onReviewerAccept,
    onReviewerDecline,
    onReviewerJustify,
    onReviewerBulkAccept,
  } = useReviewerContext();

  const statusEntry = useMemo(() => {
    const entry = reviewerStatusMap.get(questionId || "");
    if (entry?.remark === "Answered by Maker") return undefined;
    return entry;
  }, [reviewerStatusMap, questionId]);

  const tableheaders = headers
    .filter((m) => !!m)
    .map((element, index) => (
      <th className={classes.heading} key={index}>
        <Group
          grow
          wrap="nowrap"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          <Box style={{ maxWidth: "100%" }}>{element}</Box>
          {sortedChildrenData.filter(
            (x: any) => x.fieldOptions.label == element,
          ).length > 0 ? (
            sortedChildrenData.filter(
              (x: any) => x.fieldOptions.label == element,
            )[0].interfaceOptions.showLabel ? (
              <Info
                infoIconProps={
                  sortedChildrenData.filter(
                    (x: any) => x.fieldOptions.label == element,
                  )[0].interfaceOptions.infoIconProps
                }
              />
            ) : (
              ""
            )
          ) : (
            ""
          )}
        </Group>
      </th>
    ));

  return (
    <>
      <Box
        ref={ref}
        px={fullscreen ? 15 : 0}
        py={fullscreen ? 15 : 0}
        bg="#f6f8fa"
        className="commonQuestionTable"
        style={fullscreen ? {
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          overflowY: "auto",
          backgroundColor: "#f6f8fa",
        } : undefined}
      >
        <Flex align="center" justify="flex-end" wrap="wrap" pb={10} gap={20}>
          {showAddRow && (
            <Button color="solidBtn" onClick={handleAddRow} mt={10} mb={10} disabled={isDisabled}>
              Add Row
            </Button>
          )}
          <ActionIcon
            onClick={toggle}
            variant="transparent"
            mr={5}
            styles={{
              root: {
                pointerEvents: "auto",
                opacity:0.3,
              }
            }}
          >
            {fullscreen ? <ManimizeScreenIcon /> : <MaximizeScreenIcon />}
          </ActionIcon>
        </Flex>
        <ScrollArea classNames={{ scrollbar:"mantine-ScrollArea-Classes-scrollbar" }}
          type="auto"
          styles={{
            root: {
              borderRadius: "10px",
              boxShadow:
                "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
            },
            scrollbar: {
              "&, &:hover": {
                background: "transparent",
              },
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                backgroundColor: "#e4e4e4",
                transition: "opacity 0.2s ease",
              },
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover':
                {
                  backgroundColor: "#d1d1d1",
                },
            },
          }}
        >
          <Table className={classes.table}>
            <thead>
              <tr>{tableheaders}</tr>
            </thead>
            <tbody style={{ pointerEvents: isDisabled ? "none" : "auto" }}>{children}</tbody>
          </Table>
        </ScrollArea>
      </Box>
    </>
  );
};
export default CommonTable;