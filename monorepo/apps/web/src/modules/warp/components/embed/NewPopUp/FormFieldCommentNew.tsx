import { Box } from "@mantine/core";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
let session: any = "";
type Props = {
  invitationCommentsListData?: any;
};
const FormFieldComment = ({ invitationCommentsListData }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { query } = useRouter();
  const { accessToken } = query;

  const decodedToken: any = jwt.decode(String(accessToken));
  session = parseHasuraClaims(decodedToken, String(accessToken));

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
  let comments: any = [];
  if (invitationCommentsListData != undefined) {
    if (invitationCommentsListData.length > 0) {
      comments = invitationCommentsListData.slice();
    }
  }

  let firstDayOfCurrentWeek = new Date(curr.setDate(first)).toISOString();
  //  console.log("userids", session?.user?.id, comments.slice(0, 2));
  return (
    <Box>
      {comments.slice(0, 2).map((item: any) => {
        return session?.user?.id === item.User?.id ? (
          <Box className="latestCommentBoxBlue">
            <p>
              <span>
                {" "}
                {item?.User?.Company?.name}, {item?.User?.name} -{" "}
              </span>{" "}
              {item?.created_at > firstDayOfCurrentWeek
                ? days[new Date(item?.created_at).getDay()].substring(0, 3) +
                  ", " +
                  dayjs(item?.created_at).format("hh:mm A")
                : dayjs(item?.created_at).format("DD MMM, YYYY hh:mm A")}
            </p>
            <p>{item?.content}</p>
          </Box>
        ) : (
          <Box className="latestCommentBoxGrey" mt={10}>
            <p>
              <span>
                {" "}
                {item?.User?.Company?.name}, {item?.User?.name} -{" "}
              </span>{" "}
              {item?.created_at > firstDayOfCurrentWeek
                ? days[new Date(item?.created_at).getDay()].substring(0, 3) +
                  ", " +
                  dayjs(item?.created_at).format("hh:mm A")
                : dayjs(item?.created_at).format("DD MMM, YYYY hh:mm A")}
            </p>
            <p>{item?.content}</p>
          </Box>
        );
      })}
    </Box>
  );
};
export default FormFieldComment;
