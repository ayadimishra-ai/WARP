import { Box, Button, Flex, Group, Loader, Stack, Text } from "@mantine/core";
import { useRecommendation } from "@warp/client/hooks/use-recommendation";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import { RecommendationListionPageMessage } from "@warp/client/services/platform-window-message.service";
import { useGetProgressReportbySubmissionIdQuery } from "@warp/graphql/queries/generated/get-progress-report-by-submissionId";
import { RecommendationStatus } from "@warp/shared/constants/app.constants";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type ChartData = {
  value: number;
  date: number;
};

// const Chart = dynamic(
//   () =>
//     import(
//       "../../../../../packages/client/components/Charts/ProgressReportChart"
//     ),
//   {
//     ssr: false, // Optional: Disable server-side rendering
//     loading: () => (
//       <Flex h="250px" justify="center" align="center">
//         <Loader size={45} />
//       </Flex>
//     ), // Optional: Loading component
//   }
// );

const Chart = dynamic(
  () => import("@warp/client/components/charts/ProgressReportChart"),
  {
    ssr: false, // Optional: Disable server-side rendering
    // loading: () => (
    //   <Flex h="250px" justify="center" align="center">
    //     <Loader size={45} />
    //   </Flex>
    // ), // Optional: Loading component
  }
);

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const ProgressReport = () => {
  const { query } = useRouter();
  const userSession = useUserSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);

  const { listingData } = useRecommendation(
    userSession?.company?.id,
    userSession?.user?.role,
    query?.invitationId
  );

  const { data: reportData } = useGetProgressReportbySubmissionIdQuery({
    variables: { submissionId: query?.submissionId },
    onCompleted: () => {
      setIsChartLoading(false);
    },
  });

  const collectAllData: any[] = [];
  if (!!reportData?.InterimFormLogs) {
    collectAllData.push(...reportData?.InterimFormLogs);
  }

  if (!!reportData?.CarryForwardInterimLogs) {
    collectAllData.push(...reportData?.CarryForwardInterimLogs);
  }

  if (!!reportData?.DefaultInterimLogs) {
    collectAllData.push(...reportData?.DefaultInterimLogs);
  }

  // const groupedByDate: any = !!reportData?.InterimFormLogs.length
  //   ? reportData?.InterimFormLogs?.reduce((acc: any, item: any) => {
  //       const timeDate = new Date(item.created_at).getDate();
  //       const timeMonth = new Date(item.created_at).getMonth();
  //       const timeYear = new Date(item.created_at).getFullYear();
  //       const timeA = timeYear + "-" + timeMonth + "-" + timeDate;
  //       if (!acc[timeA]) {
  //         acc[timeA] = [];
  //       }
  //       acc[timeA].push(item);
  //       return acc;
  //     }, {})
  //   : reportData?.DefaultInterimLogs?.reduce((acc: any, item: any) => {
  //       const timeA = new Date(item.created_at).getDate();
  //       if (!acc[timeA]) {
  //         acc[timeA] = [];
  //       }
  //       acc[timeA].push(item);
  //       return acc;
  //     }, {});

  const groupedByDate: any = collectAllData?.reduce((acc: any, item: any) => {
    const timeDate = new Date(item.created_at).getDate();
    const timeMonth = new Date(item.created_at).getMonth() + 1;
    const timeYear = new Date(item.created_at).getFullYear();
    const timeA = timeYear + "-" + timeMonth + "-" + timeDate;
    if (!acc[timeA]) {
      acc[timeA] = [];
    }
    acc[timeA].push(item);
    return acc;
  }, {});

  const distinctLatestByDate1 = !!!groupedByDate
    ? []
    : (Object.values(groupedByDate).map((group: any) => {
        group.sort((a: any, b: any) => {
          const bData: any = new Date(b.created_at);
          const aData: any = new Date(a.created_at);
          return bData - aData;
        });
        return group[0];
      }) ?? []);

  const distinctLatestByDate = distinctLatestByDate1.sort(function (a, b) {
    const aData: any = new Date(a.created_at);
    const bData: any = new Date(b.created_at);
    return aData - bData;
  });
  const chartData: ChartData[] =
    distinctLatestByDate?.map((log) => ({
      date: new Date(log.created_at).getTime(),
      value: log.score,
    })) ?? [];

  // const chartData_default: ChartData[] =
  //   reportData?.DefaultInterimLogs?.map((log) => ({
  //     date: new Date(log.created_at).getTime(),
  //     value: log.score,
  //   })) ?? [];

  // chartData.push(...chartData_default);

  useEffect(() => {
    if (!!listingData && listingData.length > 0) {
      setIsLoading(false);
    }
  }, [listingData]);

  const viewAllRecommendations = (
    invitationId: String,
    Questionnare: String,
    Period: String,
    ComapnyName: string,
    DeviationCount: number,
    IsCarryForward: any,
    SubmissionId: string,
    Score: string
  ) => {
    postParentMessage(
      RecommendationListionPageMessage(
        invitationId,
        Questionnare,
        Period,
        ComapnyName,
        DeviationCount,
        IsCarryForward,
        SubmissionId,
        Score
      )
    );
  };

  return isLoading === true ? (
    // <LoadingOverlay visible={isLoading} />
    <Spinner visible={isLoading} />
  ) : (
    <Stack>
      <Flex gap="sm" align="center">
        <Text size={14} c="#444444" fw={400} lh="17.75px">
          Requested{" "}
          {userSession?.user?.role === "Invitee" ||
          userSession?.user?.role === "Responder"
            ? "by"
            : "to"}{" "}
          :
          <Text
            size={14}
            c="#444444"
            fw={400}
            lh="17.75px"
            component="span"
            ml="2px"
          >
            {query.comapnyName}
          </Text>
        </Text>
        |
        {/* <Divider
          size="sm"
          orientation="vertical"
          style={{ borderLeftColor: "#444444" }}
        /> */}
        {reportData?.DefaultInterimLogs.length === 0 ? (
          ""
        ) : (
          <Text size={14} c="#444444" fw={400} lh="17.75px">
            Last response submitted on :
            <Text
              size={14}
              c="#444444"
              fw={400}
              lh="17.75px"
              component="span"
              ml="2px"
            >
              {format(
                new Date(reportData?.Interim_Recommendation[0]?.updated_at),
                "dd MMM, yyyy"
              )}
            </Text>
          </Text>
        )}
      </Flex>
      {isChartLoading ? (
        <Flex h="250px" justify="center" align="center">
          <Loader size={45} />
        </Flex>
      ) : chartData.length > 0 ? (
        <Chart
          data={chartData}
          updated={reportData?.Interim_Answer[0]?.isViewOnly!}
        />
      ) : (
        <Flex h="250px" justify="center" align="center">
          <Text size={14} fw={700} color="#323232">
            Data not found
          </Text>
        </Flex>
      )}
      <Group
        bg={"#d6f3ff"}
        py={10}
        px={15}
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "5px",
          paddingRight: "45px",
          maxWidth: "730px",
        }}
      >
        <Flex align="center" gap={4}>
          <Text size={16} fw={400} color="#122f47" lh={"20.29px"}>
            Recommendations -
          </Text>
          <Text size={16} fw={600} color="#122f47" lh={"20.29px"}>
            {
              listingData?.filter(
                (rec: any) => rec?.Status !== RecommendationStatus.NA
              )?.length
            }
          </Text>
        </Flex>
        <Flex align="center" gap={4}>
          <Text size={16} fw={400} color="#122f47" lh={"20.29px"}>
            Implemented -
          </Text>
          <Text size={16} fw={600} color="#122f47" lh={"20.29px"}>
            {
              listingData?.filter(
                (rec: any) => rec?.Status === RecommendationStatus.Closed
              )?.length
            }
          </Text>
        </Flex>
        <Flex align="center" gap={4}>
          <Text size={16} fw={400} color="#122f47" lh={"20.29px"}>
            Open -
          </Text>
          <Text size={16} fw={600} color="#122f47" lh={"20.29px"}>
            {
              listingData?.filter(
                (rec: any) =>
                  rec?.Status === RecommendationStatus.Open ||
                  rec?.Status === RecommendationStatus.PendingForApproval ||
                  rec?.Status === RecommendationStatus.Reopened
              )?.length
            }
          </Text>
        </Flex>
      </Group>
      {!query.flag && (
        <Box>
          <Button
            color="solidBtn"
            radius={100}
            loading={false}
            sx={{ marginBottom: "4px" }}
            onClick={() => {
              viewAllRecommendations(
                String(query?.invitationId),
                String(query?.questionnareName),
                String(query?.period),
                String(query?.comapnyName),
                Number(query?.deviationCount),
                query?.isCarryForward,
                String(query?.submissionId),
                String(query?.score)
              );
            }}
          >
            View All Recommendations
          </Button>
        </Box>
      )}
    </Stack>
  );
};
export default ProgressReport;
