"use client";
import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import {
  postParentMessage,
  saveActivityData,
  saveActivityPopup,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import Spinner from "@/modules/ghg/shared/UI/spinner/spinner";
import { clientEnv } from "@/modules/ghg/utils/env/env.client";
import { userActivityMappingRow } from "../common-table/userAndActivityMapping";
import "./saveMappingPopup.css";
const SaveMappingPopup = () => {
  const params = useParams();
  const session = useUserSession();
  const [isLoading, setIsLoading] = useState(false);
  const opActivities = useLocalStorage<{ code: string; name: string }[]>({
    key: "activities",
    defaultValue: [],
  })[0];
  const mappingData: userActivityMappingRow[] =
    !!window && !!window.localStorage
      ? JSON.parse(window.localStorage.getItem("userPermissionChanges") || "[]")
      : [];
  const saveData = async () => {
    setIsLoading(true);
    const apiBody =
      !!window && !!window.localStorage
        ? window.localStorage.getItem("userPermissionChanges")
        : "";
    if (!!apiBody) {
      try {
        const userPermissionData = await fetch(
          clientEnv.NEXT_PUBLIC_API_BASE_URL +
            "/api/v1/master-data/users/user-activity-permission",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-sk-op-authorization": String(params?.accessToken as string),
              organization_id: String(params?.organizationId),
              sessionUserId: String(session?.userId),
            },
            body: apiBody,
          }
        ).then((response) => {
          if (response?.statusText == "OK" && response?.status == 200) {
            window.localStorage.removeItem("userPermissionChanges");
            postParentMessage(saveActivityData(false));
            return response.json();
          } else {
            window.localStorage.removeItem("userPermissionChanges");
            postParentMessage(saveActivityData(true));
          }
        });
      } catch (error) {
        console.error("Error adding user:", error);
        // Handle error - you might want to show a notification here
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to capitalize first letter of each activity
  const capitalizeActivity = (activity: string) => {
    return activity.charAt(0).toUpperCase() + activity.slice(1).toLowerCase();
  };

  // Function to render activities with expandable display
  const renderActivities = (activities: string[]) => {
    const _activities = activities.map(
      (a) => opActivities.find((o) => o.code === a)?.name || a
    );

    return (
      <Group gap={4} wrap="nowrap">
        {_activities[0] === "All" ? (
          <Text style={{ fontSize: 12 }} c="#666666">
            All
          </Text>
        ) : _activities.length <= 2 ? (
          <Text style={{ fontSize: 12 }} c="#666666">
            {_activities.join(", ")}
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 12 }} c="#666666">
              {_activities.slice(0, 2).join(", ")}
            </Text>
            <Tooltip
              label={_activities.slice(2).join(", ")}
              position="top"
              multiline
              withArrow
              w={300}
              styles={{
                tooltip: {
                  backgroundColor: "#003B52",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                  wordWrap: "break-word",
                },
              }}
            >
              <Badge
                size="sm"
                variant="light"
                color="green"
                style={{
                  cursor: "pointer",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                +{_activities.length - 2}
              </Badge>
            </Tooltip>
          </>
        )}
      </Group>
    );
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <Card p={0}>
      <Paper
        shadow="none"
        radius="md"
        style={{
          border: "1px solid #E9ECEF",
          // overflow: "hidden",
          // height: "60vh", // Fixed height for header + 5 rows
        }}
      >
        <Table.ScrollContainer
          minWidth={475}
          style={{
            height: "300px",
            maxHeight: "60vh",
          }}
        >
          <Table
            striped={false}
            highlightOnHover={false}
            withTableBorder={false}
            withColumnBorders={false}
            style={{
              fontSize: "12px",
            }}
          >
            <Table.Thead
              style={{
                backgroundColor: "#005C81",
              }}
            >
              <Table.Tr>
                <Table.Th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "0px 20px",
                    width: "60px",
                    height: "43px",
                  }}
                >
                  SN
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "0px 20px",
                    width: "130px",
                    height: "43px",
                  }}
                >
                  Username
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "0px 20px",
                    width: "200px",
                    height: "43px",
                  }}
                >
                  Location
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px !important",
                    padding: "0px 20px",
                    width: "200px",
                    height: "43px",
                  }}
                >
                  Activity
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "0px 20px",
                    width: "100px",
                    height: "43px",
                  }}
                >
                  Action
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mappingData.map((row, index) => (
                <Table.Tr
                  key={row.id}
                  style={{
                    backgroundColor: "#fff",
                    border: 0,
                    height: "43px", // Fixed row height
                  }}
                >
                  <Table.Td
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      color: "#666666",
                      height: "43px",
                      verticalAlign: "middle",
                    }}
                  >
                    {index + 1}
                  </Table.Td>
                  <Table.Td
                    style={{
                      padding: "12px 20px",
                      fontSize: "12px",
                      color: "#333333",
                      fontWeight: 500,
                      height: "43px",
                      verticalAlign: "middle",
                    }}
                  >
                    {row.userName}
                  </Table.Td>
                  <Table.Td
                    style={{
                      padding: "12px 20px",
                      height: "43px",
                      verticalAlign: "middle",
                      fontSize: "12px",
                    }}
                  >
                    {row.location_name}
                  </Table.Td>
                  <Table.Td
                    style={{
                      padding: "12px 20px",
                      height: "43px",
                      verticalAlign: "middle",
                      fontSize: "12px",
                    }}
                  >
                    {renderActivities(row.activities)}
                  </Table.Td>
                  <Table.Td
                    style={{
                      padding: "12px 20px",
                      height: "43px",
                      verticalAlign: "middle",
                      fontSize: "12px",
                    }}
                  >
                    {row?.isAdd ? "Add" : "Remove"}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Footer Message */}
      <Text
        size="12px"
        c="#666666"
        mt={15}
        mb={15}
        style={{
          lineHeight: 1.5,
        }}
      >
        Once saved, notification emails will be sent to the users.
      </Text>

      {/* Action Buttons */}
      <Flex gap="md" justify="flex-start">
        <Button
          variant="outline"
          fw={600}
          fz={12}
          h={36}
          px={32}
          radius="xl"
          onClick={() => {
            window.localStorage.removeItem("userPermissionChanges");
            postParentMessage(saveActivityPopup(false));
          }}
          className="noAnimationButton"
          disabled={isLoading}
          styles={{
            root: {
              borderColor: "#005C81",
              color: "#005C81",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          variant="unstyled"
          fw={600}
          fz={12}
          h={36}
          px={32}
          radius="xl"
          loading={isLoading}
          onClick={() => {
            saveData();
          }}
          className="noAnimationButton filledGradientButton"
        >
          SAVE
        </Button>
      </Flex>
    </Card>
  );
};

export default SaveMappingPopup;
