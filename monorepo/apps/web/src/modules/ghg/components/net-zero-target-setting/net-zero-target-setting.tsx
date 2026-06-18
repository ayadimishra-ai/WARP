"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Radio,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { IOrganization } from "@/modules/ghg/lib/net-zero-target-year/net-zero-target-year.interface";
import {
  netZeroTargetYearDeleteConfirmation,
  netZeroTargetYearFormSubmitted,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import Spinner from "@/modules/ghg/shared/UI/spinner/spinner";
import { getNextYearsFromBaseline, getPastYears } from "@/modules/ghg/utils/date.util";
import {
  FormSchemaNetZeroTargetSchema,
  netZeroTargetSchema,
} from "./validation";

export default function NetZeroTargetSetting() {
  const session: any = useUserSession();
  const [targetYearsOptions, setTargetYearsOptions] = useState<string[]>([]);
  const [orgNetZeroData, setOrgNetZeroData] = useState<IOrganization | null>(
    null
  );
  const [refetchFlag, setRefetchFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization net zero target year details
  async function getOrgNetZeroTargetData() {
    if (session) {
      const url = "/api/v1/net-zero-target-year";
      try {
        const payload = {
          organizationId: session.organizationId,
        };
        const response = await apiClientWithAuth.post(url, payload);
        return response?.data;
      } catch (error) {
        console.error(
          "Error fetching organization net zero target year details:",
          error
        );
      }
    }
  }

  // Initialize form
  const form = useForm<FormSchemaNetZeroTargetSchema>({
    resolver: zodResolver(netZeroTargetSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      mechanism_type: "SBTi",
      baseline_year: new Date()?.getFullYear().toString(),
      targets: [
        {
          uuid: crypto.randomUUID(),
          target_year: "",
          reduction_percentage: "",
        },
      ],
    },
  });

  // Fetch and populate form with existing data
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (session) {
          const { data }: { data: IOrganization } =
            await getOrgNetZeroTargetData();

          if (data) {
            setOrgNetZeroData(data);
            form.setValue(
              "baseline_year",
              data?.net_zero_metadata?.baseline_year ||
                new Date().getFullYear().toString()
            );
            const mechanismType =
              data?.net_zero_metadata?.mechanism_type === "Custom"
                ? "Custom"
                : "SBTi";
            form.setValue("mechanism_type", mechanismType);
            if (data?.net_zero_metadata?.targets?.length) {
              form.setValue("targets", data?.net_zero_metadata?.targets);
            }
          }
        }
      } catch (error) {
      } finally {
        console.log("finally called");
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [session, refetchFlag]);

  const watchBaseLineYear = form.watch("baseline_year");

  // Update target years options based on baseline year change
  useEffect(() => {
    const targetYears: string[] = getNextYearsFromBaseline(
      parseInt(watchBaseLineYear || new Date().getFullYear().toString()),
      50
    );
    setTargetYearsOptions(targetYears);
  }, [watchBaseLineYear]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targets",
  });

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let messageData: { type: string; data: any } = {
        type: "",
        data: "",
      };
      if (event.data) {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          const data = messageData.data;
          if (type === "confirm-delete-net-zero-target-year" && data) {
            remove(data.index);
          }
          if (type === "net-zero-target-year-success-message") {
            form.reset();
            setRefetchFlag((prev) => !prev);
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const onSubmitForm: SubmitHandler<FormSchemaNetZeroTargetSchema> = async (
    data: any
  ) => {
    // Build occurrences map for target_year values
    const occurrences: Record<string, number[]> = {};
    data?.targets?.forEach((t: any, idx: number) => {
      const year = t?.target_year;
      if (year === undefined || year === null || year === "") return;
      const key = String(year);
      if (!occurrences[key]) occurrences[key] = [];
      occurrences[key].push(idx);
    });

    // For duplicates, set error on all except the first occurrence
    // For duplicates, set error on all except the first occurrence
    let hasDuplicate = false;
    Object.entries(occurrences).forEach(([year, idxs]) => {
      if (idxs.length > 1) {
        hasDuplicate = true;
        // skip the first occurrence (idxs[0]), mark the rest
        idxs.slice(1).forEach((duplicateIdx) =>
          form.setError(`targets.${duplicateIdx}.target_year` as any, {
            type: "duplicate",
            message: `A target for ${year} already exists. Please select a different year or edit the existing target.`,
          })
        );
      }
    });

    if (hasDuplicate) {
      // Prevent submission when duplicates exist
      return;
    }

    // Target year must be greater than baseline year validation
    let isValid = true;
    data?.targets?.forEach((t: any, idx: number) => {
      const year = t?.target_year;

      // Skip if year is missing or empty
      if (year === undefined || year === null || year === "") {
        return;
      }

      // Check if target year is greater than baseline year
      if (year < data?.baseline_year) {
        isValid = false;
        form.setError(`targets.${idx}.target_year` as any, {
          type: "invalid",
          message: "Target year must be greater than baseline year.",
        });
      }
    });

    if (!isValid) {
      return;
    }

    postParentMessage(netZeroTargetYearFormSubmitted(data, true));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {orgNetZeroData && (
        <div>
          <form onSubmit={form.handleSubmit(onSubmitForm)}>
            <Container px={0} size={"48vw"}>
              <Card
                shadow="sm"
                radius="md"
                style={{
                  padding: "61px",
                  margin: "39px 0",
                  backgroundImage: "url('/org_circle.png')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right top",
                  backgroundSize: "250px",
                  position: "relative",
                }}
              >
                <Flex
                  mih={50}
                  gap="xs"
                  justify="flex-start"
                  align="flex-start"
                  direction="column"
                  wrap="wrap"
                >
                  <Text size="32px" c="#444444">
                    Net Zero Target Settings
                  </Text>
                  <Text size="14px" fw={300} mt={25} c="#444444">
                    Please provide details of your organization&apos;s Net Zero
                    commitment, including target year, scope, baseline year, and
                    validation status. This information will help track progress
                    towards emission reduction goals.
                  </Text>
                </Flex>
                <Group grow align="baseline" mih={80} gap="0px" mt={25}>
                  <Controller
                    name="mechanism_type"
                    control={form.control}
                    render={({ field }) => (
                      <div>
                        <Text size="12px" fw={500} mb={8} c="#444444">
                          Choose Mechanism Type
                          {/* <span style={{ color: "red" }}> *</span> */}
                        </Text>
                        <Radio.Group
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          name={field.name}
                          error={
                            form?.formState?.errors?.mechanism_type?.message
                          }
                        >
                          <Group mt="xs">
                            <Radio
                              color="#005C81"
                              variant="outline"
                              value="SBTi"
                              label="SBTi"
                              styles={{
                                label: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#444444",
                                },
                              }}
                            />
                            <Radio
                              color="#005C81"
                              variant="outline"
                              value="Custom"
                              label="Custom"
                              styles={{
                                label: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#444444",
                                },
                              }}
                            />
                          </Group>
                        </Radio.Group>
                      </div>
                    )}
                  />

                  <Controller
                    name="baseline_year"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        allowDeselect={false}
                        label="Select Baseline Year"
                        placeholder="Select Baseline Year"
                        data={
                          Array.isArray(getPastYears()) &&
                          getPastYears().length > 0
                            ? getPastYears().map((year) => ({
                                label: year,
                                value: year,
                              }))
                            : []
                        }
                        onChange={(value) => field.onChange(value || "")}
                        value={field.value}
                        styles={{
                          label: {
                            fontWeight: 400,
                            fontSize: 12,
                            color: "#888888",
                          },
                          input: {
                            fontWeight: 400,
                            fontSize: 12,
                            color: "#444444",
                          },
                          error: {
                            fontSize: 10,
                          },
                        }}
                        error={form?.formState?.errors?.baseline_year?.message}
                      />
                    )}
                  />
                </Group>

                <>
                  {fields.map((field, index) => (
                    <Flex
                      key={field.id}
                      mih={50}
                      gap="md"
                      justify="flex-start"
                      align="center"
                      direction="row"
                      wrap="nowrap"
                    >
                      <Group
                        grow
                        align="baseline"
                        mih={80}
                        gap="xl"
                        mt={10}
                        style={{ flex: "1 auto" }}
                      >
                        <Controller
                          name={`targets.${index}.target_year`}
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              allowDeselect={false}
                              label="Select Target Year"
                              placeholder="Select Target Year"
                              data={
                                Array.isArray(targetYearsOptions) &&
                                targetYearsOptions.length > 0
                                  ? targetYearsOptions.map((year) => ({
                                      label: year,
                                      value: year,
                                    }))
                                  : []
                              }
                              onChange={(value) => field.onChange(value || "")}
                              value={field.value}
                              styles={{
                                label: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#888888",
                                },
                                input: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#444444",
                                },
                                error: {
                                  fontSize: 10,
                                },
                              }}
                              error={
                                form?.formState?.errors?.targets?.[index]
                                  ?.target_year?.message
                              }
                            />
                          )}
                        />

                        <Controller
                          name={`targets.${index}.reduction_percentage`}
                          control={form.control}
                          render={({ field }) => (
                            <TextInput
                              label="Target Emission Reduction (%)"
                              type="number"
                              styles={{
                                label: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#888888",
                                },
                                input: {
                                  fontWeight: 400,
                                  fontSize: 12,
                                  color: "#444444",
                                },
                                error: {
                                  fontSize: 10,
                                },
                              }}
                              error={
                                form?.formState?.errors?.targets?.[index]
                                  ?.reduction_percentage?.message
                              }
                              {...field}
                            />
                          )}
                        />
                      </Group>
                      {index === 0 ? (
                        <ActionIcon
                          size="xs"
                          mt={15}
                          variant="transparent"
                          color="transparent"
                          style={{ visibility: "hidden" }}
                          disabled
                        >
                          <IconTrash />
                        </ActionIcon>
                      ) : (
                        <ActionIcon
                          size="xs"
                          mt={15}
                          variant="transparent"
                          color="#AC0B0B"
                          onClick={() => {
                            const isExist =
                              orgNetZeroData?.net_zero_metadata?.targets?.filter(
                                (t) => t.uuid === field.uuid
                              );
                            if (isExist && isExist.length > 0) {
                              postParentMessage(
                                netZeroTargetYearDeleteConfirmation(
                                  {
                                    index,
                                    year: field?.target_year,
                                    percentage: field?.reduction_percentage,
                                  },
                                  true
                                )
                              );
                            } else {
                              remove(index);
                            }
                          }}
                        >
                          <IconTrash />
                        </ActionIcon>
                      )}
                    </Flex>
                  ))}
                </>

                <Flex mt={25}>
                  <Button
                    id="add-another-target"
                    variant="unstyled"
                    fw={600}
                    fz={12}
                    h={36}
                    lts="0.15rem"
                    p="0 20px"
                    radius="xl"
                    className="noAnimationButton filledGradientButton"
                    onClick={() => {
                      append({
                        uuid: crypto.randomUUID(),
                        target_year: new Date().getFullYear().toString(),
                        reduction_percentage: "",
                      });
                    }}
                  >
                    ADD ANOTHER TARGET
                  </Button>

                  <Button
                    id="publish-updates"
                    variant="outline"
                    fw={600}
                    fz={12}
                    h={36}
                    lts="0.15rem"
                    p="0 20px"
                    radius="xl"
                    ms={25}
                    className="noAnimationButton"
                    type="submit"
                    color="#003B52"
                  >
                    PUBLISH UPDATES
                  </Button>
                </Flex>
              </Card>
            </Container>
          </form>
        </div>
      )}
    </>
  );
}
