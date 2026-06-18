import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Input,
  Paper,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconChevronLeft, IconClock, IconSearch } from "@tabler/icons-react";
import { useAssessmentGlobalVariable } from "@/modules/warp/packages/client/hooks/use-assessment-global-variable";
import { useRequestAssessment } from "@/modules/warp/packages/client/hooks/use-request-assessment";
import { useGetFormWithDetailsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-with-details";
import { useGetGlobalMasterFormIconsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-form-icons";
import { useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import ExistingCompanyForm from "./ExistingCompanyForm";
import NewCompanyForm from "./NewCompanyForm";

const useStyles = createStyles((theme) => ({
  drawerHeading: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 15,
  },
  cardText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  focusAreaIconsParent: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  focusAreaIcons: {
    width: "30px",
    height: "30px",
    borderRadius: "5px",
    backgroundColor: "#e2e2e2",
    padding: 5,
    "&:empty": {
      display: "none",
    },
  },
  timeText: {
    fontWeight: 400,
    fontSize: "12px",
    color: "#666",
  },
  card: {
    border: "1px solid #cdcdcd",
  },
  drawerContainer: {
    overflowY: "auto",
    height: "100vh",
  },
}));

type SidebarHeaderProps = {
  closeSidebarHandler: () => void;
  showAssesmetsCardsList: () => void;
};

const SidebarHeader = ({
  closeSidebarHandler,
  showAssesmetsCardsList,
}: SidebarHeaderProps) => {
  const { classes } = useStyles();
  return (
    <Box className={classes.drawerHeading}>
      <ActionIcon
        onClick={() => {
          closeSidebarHandler();
          showAssesmetsCardsList();
        }}
      >
        <IconChevronLeft />
      </ActionIcon>
      <Title order={3} c="#122f47">
        Request Assessment
      </Title>
    </Box>
  );
};

type SelectCompanyForAssesmentsProps = {
  selectedQuestionnaire: string;
};
const SelectCompanyForAssesments = ({
  selectedQuestionnaire,
}: SelectCompanyForAssesmentsProps) => {
  const [companyType, setCompnayType] = useState("Existing");
  return (
    <Box>
      <Box>
        <Radio.Group
          value={companyType}
          onChange={setCompnayType}
          label="Select Partners for Assessment"
          styles={{
            label: {
              fontSize: "14px",
              fontWeight: 500,
              color: "#444444",
            },
          }}
        >
          <Radio color="#122f47" value="Existing" label="Existing Partner" />
          <Radio color="#122f47" value="New" label="New Partner" />
        </Radio.Group>
      </Box>
      {companyType === "Existing" && <ExistingCompanyForm />}
      {companyType === "New" && <NewCompanyForm />}
    </Box>
  );
};

type FormType = {
  Id: any;
  Name: string;
  FocusArea?: any;
  TimeInMinutes?: number | null | undefined;
};

type AssesmentCardsListProps = {
  selectQuestionnaireHandler: (e: string) => void;
  formList?: FormType[];
};
const AssesmentCardsList = ({
  selectQuestionnaireHandler,
  formList,
}: AssesmentCardsListProps) => {
  const { classes } = useStyles();
  const [list, setList] = useState(formList);
  const [value, setValue] = useState("");

  const assessmentCards = list
    ?.filter((a) => a.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1)
    .map((data) => (
      <Paper
        key={data.Id}
        className={classes.card}
        shadow="sm"
        radius="xs"
        p="md"
      >
        <Stack align="flex-start" gap={12}>
          <Title size={14} order={5}>
            {data.Name}
          </Title>
          <Text className={classes.cardText}>Focus Area</Text>
          <Box className={classes.focusAreaIconsParent}>
            {data.FocusArea?.length > 0 &&
              data.FocusArea.map((rec: any, i: any) => {
                return (
                  <span
                    className={classes.focusAreaIcons}
                    key={i}
                    dangerouslySetInnerHTML={{
                      __html: rec.Icon as string,
                    }}
                  ></span>
                );
              })}
          </Box>
          <Text className={classes.cardText}>Time needed</Text>
          <Box className={classes.focusAreaIconsParent}>
            <IconClock color="orange" size={25} />
            <Text className={classes.timeText}>{data.TimeInMinutes} min</Text>
          </Box>
          <Button
            onClick={() => selectQuestionnaireHandler(data.Id)}
            color="solidBtn"
          >
            Select
          </Button>
        </Stack>
      </Paper>
    ));

  return (
    <Stack>
      <Input
        placeholder="Search"
        rightSection={
          <IconSearch size={18} style={{ display: "block", opacity: 1 }} />
        }
        value={value}
        onChange={(event: any) => {
          setValue(event.currentTarget.value);
        }}
      />
      <Text className={classes.cardText}>
        Select questionnaire for assessment
      </Text>
      <Stack gap={"sm"}>{assessmentCards}</Stack>
      <Group justify="flex-end" gap="sm">
        <Button color="outlineBtn">Cancel</Button>
      </Group>
    </Stack>
  );
};

type InvitationSideBarProps = {
  sideBarOpenedState: boolean;
  closeSidebarHandler: () => void;
};
const InvitationSideBar = ({
  sideBarOpenedState,
  closeSidebarHandler,
}: InvitationSideBarProps) => {
  const { classes } = useStyles();
  // console.log("warp-test");

  const [selectQuestionnaire, setSelectQuestionnaire] = useState(false);
  const [selectedQuestionnaire, setselectedQuestionnaire] = useState("");
  const { data: focusAreaIconsData } = useGetGlobalMasterFormIconsQuery();
  const userSession = useUserSession();

  // set formId as a global variable.
  const setformIds = useAssessmentGlobalVariable(
    (state: any) => state.SetFormId
  );
  setformIds(selectedQuestionnaire);

  const { data, error, loading } = useGetFormWithDetailsQuery({
    variables: { companyId: userSession?.company?.id },
  });

  const formListData = data?.Form.map((rec) => {
    let ArrayIcons = [];
    ArrayIcons = rec.Details?.focusArea.map((dataItem: any) => {
      let IconsData = {
        ForcusArea: dataItem,
        Icon: focusAreaIconsData?.GlobalMaster[0].data[dataItem],
      };
      return IconsData;
    });

    let data = {
      Id: rec.id,
      Name: rec.name,
      FocusArea: ArrayIcons,
      TimeInMinutes: rec.Details?.timeInMinutes,
    };
    return data;
  });

  const selectQuestionnaireHandler = (formId: string) => {
    setSelectQuestionnaire(true);
    setselectedQuestionnaire(formId);
  };
  const showAssesmetsCardsList = () => {
    setSelectQuestionnaire(false);
  };

  const { formList } = useRequestAssessment();

  return (
    <>
      <Drawer
        opened={sideBarOpenedState}
        onClose={() => {
          closeSidebarHandler();
          showAssesmetsCardsList();
        }}
        padding="lg"
        size="lg"
        position="right"
        withCloseButton={false}
        className={classes.drawerContainer}
      >
        <Box>
          <SidebarHeader
            closeSidebarHandler={closeSidebarHandler}
            showAssesmetsCardsList={showAssesmetsCardsList}
          />
          {selectQuestionnaire ? (
            <SelectCompanyForAssesments
              selectedQuestionnaire={selectedQuestionnaire}
            />
          ) : formListData ? (
            <AssesmentCardsList
              selectQuestionnaireHandler={(e) => selectQuestionnaireHandler(e)}
              formList={formListData}
            />
          ) : loading ? (
            <Box>Loading...</Box>
          ) : (
            <Box> Failed to load data</Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
export default InvitationSideBar;
