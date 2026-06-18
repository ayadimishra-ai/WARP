import { Box, Group, Stack, Text, createStyles } from "@mantine/core";
import { GetinvitationcommentQuery } from "@warp/graphql/generated/types";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
const useStyles = createStyles((theme) => ({
  oppUserComment: {
    padding: "10px 29px 10px 10px",
    backgroundColor: "#EEFCFA",
    borderRadius: "5px 5px 5px 0px",
    margin: "1px 0",
    width: "auto",
    maxWidth: "80%",
    wordBreak: "break-word",
  },
  mainUserComment: {
    padding: "10px 29px 10px 10px",
    backgroundColor: "#F1F1F1",
    borderRadius: "5px 5px 0px 5px",
    margin: "1px 0",
    width: "auto",
    maxWidth: "80%",
    wordBreak: "break-word",
  },
}));

const InvitationLog: FC<{
  allComments: GetinvitationcommentQuery;
  InvitationId: any;
  session: any;
}> = ({ allComments, InvitationId, session }) => {
  const [allInvitationComment, setAllInvitationComment] =
    useState<GetinvitationcommentQuery>();

  useEffect(() => {
    setAllInvitationComment(allComments);
    setTimeout(() => {
      const chatBox = document.getElementById("log");
      if (chatBox) {
        chatBox.scrollTo({
          top: chatBox.scrollHeight,
          // behavior: "smooth",
        });
      }
    }, 100);
  }, [allComments?.InvitationComment, allComments]);

  const { classes } = useStyles();

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const curr = new Date();
  let first = curr.getDate() - curr.getDay();

  let firstDayOfCurrentWeek = new Date(curr.setDate(first)).toISOString();

  return allInvitationComment &&
    allInvitationComment?.InvitationComment &&
    allInvitationComment?.InvitationComment.length > 0 ? (
    <Box
      mb={0}
      style={{ maxHeight: "35vw", paddingRight: 5, overflowY: "auto" }}
      id="log"
    >
      {allInvitationComment?.InvitationComment?.slice()
        ?.sort((a: any, b: any) => (a.created_at < b.created_at ? -1 : 1))
        .map((item: any) => {
          return session?.user?.id === item.User?.id ? (
            <Stack spacing={5} align="flex-end">
              <div style={{ display: "flex", gap: 5 }}>
                <Text weight={"bold"} size={9} color="orange.5">
                  {item?.User?.Company?.name + ", " + item?.User?.name}
                </Text>
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "5px 5px 0px 5px",
                    background: "#FFA93C",
                  }}
                ></div>
              </div>
              <Box className={classes.mainUserComment}>
                <Text size={12} color="#666666">
                  {item?.content}
                </Text>
              </Box>
              <Box mb={10}>
                <Text size={9} color="#666">
                  {item?.created_at > firstDayOfCurrentWeek
                    ? days[new Date(item?.created_at).getDay()] +
                      ", " +
                      dayjs(item?.created_at).format("hh:mm A")
                    : dayjs(item?.created_at).format("DD MMM, YYYY hh:mm A")}
                </Text>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={5}>
              <Group spacing={5}>
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "5px 5px 5px 0px",
                    background: " #2C9E92",
                  }}
                ></div>
                <Text weight={"bold"} size={9} color="#2C9E92">
                  {item?.User?.Company?.name + ", " + item?.User?.name}
                </Text>
              </Group>
              <Box className={classes.oppUserComment}>
                <Text size={12} color="#666666">
                  {item?.content}
                </Text>
              </Box>
              <Box mb={10}>
                <Text size={9} color="#666">
                  {item?.created_at > firstDayOfCurrentWeek
                    ? days[new Date(item?.created_at).getDay()] +
                      ", " +
                      dayjs(item?.created_at).format("hh:mm A")
                    : dayjs(item?.created_at).format("DD MMM, YYYY hh:mm A")}
                </Text>
              </Box>
            </Stack>
          );
        })}
    </Box>
  ) : (
    <></>
  );
};
export default InvitationLog;
