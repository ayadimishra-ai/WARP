"use client";
import {
  Accordion,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconChevronDown, IconCircle } from "@tabler/icons-react";
import React, { useState } from "react";
import CaptivePowerDetails from "~/components/forms/EnergyDetails/CaptivePowerDetails";
import FuelPurchased from "~/components/forms/EnergyDetails/FuelPurchased";
import GridPowerDetails from "~/components/forms/EnergyDetails/GridPowerDetails";
import GeneralDetails from "~/components/forms/GeneralDetails/GeneralDetails";
import ProductionThisMonth from "~/components/forms/Production/ProductionThisMonth";
import BusinessTravelDetails from "~/components/forms/Transport/BusinessTravelDetails";
import DownstreamTransportDetails from "~/components/forms/Transport/DownstreamTransportDetails";
import EmployeeTravelDetails from "~/components/forms/Transport/EmployeeTravelDetails";
import UpstreamTransportDetails from "~/components/forms/Transport/UpstreamTransportDetails";
import Waste from "~/components/forms/Waste/Waste";

const accordionList = [
  {
    value: "General",
    options: [],
  },
  {
    value: "Production",
    options: [],
  },
  {
    value: "Energy",
    options: ["Grid Power Details", "Captive Power Details", "Fuel Purchased"],
  },
  {
    value: "Transport",
    options: [
      "Upstream Transport Details",
      "Downstream Transport Details",
      "Employee Travel Details",
      "Business Travel Details",
    ],
  },
  {
    value: "Waste",
    options: [],
  },
];

const options = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const Page = () => {
  const [value, setValue] = useState<string | null>(accordionList[2].value);
  const [subSection, setSubSection] = useState<string | null>(
    "Grid-Power-Details"
  );
  const [isSubSectionOpen, setIsSubSectionOpen] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState("");
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const [newArray, setNewArray] = useState<any | null>(null);

  const [subCurrentIndex, setSubCurrentIndex] = useState(0);
  const [newCurrentIndex, setNewCurrentIndex] = useState(0);

  const items = accordionList.map((item, i) => (
    <React.Fragment key={item.value}>
      <Accordion.Item style={{ border: "none" }} value={item.value}>
        <Accordion.Control
          chevron={item.options?.length === 0 ? <></> : <IconChevronDown />}
          h={26}
          mb={10}
          bg={value === item.value ? "#DAF2EF" : "secondary.0"}
          pos={"relative"}
        >
          <Box
            h={"100%"}
            w={3}
            pos={"absolute"}
            left={0}
            top={0}
            className="progress_bar"
            bg={"secondary"}
            style={{ borderRadius: 5 }}
          ></Box>
          <Text size="11px" fw={600} c={"#454545"}>
            {item.value}
          </Text>
        </Accordion.Control>
        <Accordion.Panel
          style={{
            pointerEvents: item.options?.length === 0 ? "none" : "all",
          }}
          display={item.options?.length === 0 ? "none" : "inherit"}
          styles={{
            content: {
              padding: 0,
            },
          }}
        >
          <Accordion
            defaultValue={subSection}
            value={subSection}
            onChange={(e) => subAccordianHandler(e!)}
          >
            {item.options.map((subS, i) => (
              <Accordion.Item
                style={{ border: "none" }}
                key={subS}
                value={subS}
                mt={-5}
                mb={5}
              >
                <Accordion.Control
                  p={0}
                  chevron={<></>}
                  icon={<IconCircle size={8} color="red" fill="red" />}
                  h={26}
                  bg={"#fff"}
                  styles={{
                    icon: {
                      marginRight: 8.5,
                    },
                  }}
                >
                  <Text
                    size="11px"
                    fw={600}
                    c={
                      subSection === subS.replace(/ /g, "-")
                        ? "#FF9E1B"
                        : "#B6B6B6"
                    }
                  >
                    {subS}
                  </Text>
                </Accordion.Control>
              </Accordion.Item>
            ))}
          </Accordion>
        </Accordion.Panel>
      </Accordion.Item>
      {/* {item.options.map((subS) => (
        <Accordion.Item
          style={{ border: "none" }}
          key={item.value}
          value={item.value}
        >
          <Accordion.Control
            chevron={<></>}
            icon={<IconCircle}
            h={26}
            mb={10}
            bg={"secondary.0"}
            pos={"relative"}
          >
            <Box
              h={"100%"}
              w={3}
              pos={"absolute"}
              left={0}
              top={0}
              className="progress_bar"
              bg={"secondary"}
              style={{ borderRadius: 5 }}
            ></Box>
            <Text size="11px" fw={600} c={"#454545"}>
              {subS}
            </Text>
          </Accordion.Control>
          <Accordion.Panel
            style={{
              pointerEvents: item.options?.length === 0 ? "none" : "all",
            }}
            display={item.options?.length === 0 ? "none" : "inherit"}
          >
            <Stack ml={-16} mr={-16}>
              {item.options?.map((val) => (
                <Group gap={8} key={val}>
                  <IconCircle size={8} color="red" fill="red" />
                  <Button
                    c={"#b6b6b6"}
                    fw={600}
                    size="11px"
                    variant="transparent"
                    p={0}
                    onClick={() => setSubSection(val.replace(/ /g, "-"))}
                  >
                    {val}
                  </Button>
                </Group>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))} */}
    </React.Fragment>
  ));

  const accordianHandler = (val: string) => {
    if (val === null) return false;
    setValue(val);
    const subS = accordionList.filter((item) => item.value === val);
    if (subS[0].options.length > 0) {
      setIsSubSectionOpen(true);
      setNewArray(subS[0].options);
      setSubCurrentIndex(
        (prevIndex) => (prevIndex + 1) % subS[0].options.length
      );
      setSubSection(subS[0].options[0].replace(/ /g, "-"));
    } else {
      setIsSubSectionOpen(false);
    }
  };
  const subAccordianHandler = (val: string) => {
    const isLastElement =
      newArray.length > 0 && newArray[newArray.length - 1] === val;
    if (isLastElement) {
      setIsSubSectionOpen(false);
    } else {
      setIsSubSectionOpen(true);
    }
    setSubSection(val.replace(/ /g, "-"));
  };

  const nextHandler = () => {
    window.parent.postMessage("scrollToTop", "*");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    let nextIndex = -1;

    const currentIndex = accordionList.findIndex(
      (item) => item.value === value
    );
    if (currentIndex < accordionList.length - 1) {
      nextIndex = currentIndex + 1;
    } else {
      nextIndex = 0;
    }

    const nextValue = accordionList[nextIndex].value;
    setValue(nextValue);

    const nextSubSection = accordionList[nextIndex].options[0];
    if (nextSubSection) {
      setIsSubSectionOpen(true);
      setNewArray(accordionList[nextIndex].options);
      setSubCurrentIndex(1);
      setSubSection(nextSubSection.replace(/ /g, "-"));
    } else {
      setIsSubSectionOpen(false);
    }
  };

  const subSectionNextHandler = () => {
    window.parent.postMessage("scrollToTop", "*");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (newArray && newArray.length > 0) {
      setSubCurrentIndex((prevIndex) => (prevIndex + 1) % newArray.length);
      setSubSection(newArray[subCurrentIndex].replace(/ /g, "-"));
      if (newArray.length === subCurrentIndex + 1) {
        setIsSubSectionOpen(false);
      }
    }
  };

  return (
    <>
      <Grid ml={-5}>
        <Grid.Col span={9}>
          {value === "General" && <GeneralDetails />}
          {value === "Production" && <ProductionThisMonth />}
          {value === "Energy" && (
            <>
              {subSection === "Grid-Power-Details" && <GridPowerDetails />}
              {subSection === "Captive-Power-Details" && (
                <CaptivePowerDetails />
              )}
              {subSection === "Fuel-Purchased" && <FuelPurchased />}
            </>
          )}
          {value === "Transport" && (
            <>
              {subSection === "Business-Travel-Details" && (
                <BusinessTravelDetails />
              )}
              {subSection === "Downstream-Transport-Details" && (
                <DownstreamTransportDetails />
              )}
              {subSection === "Employee-Travel-Details" && (
                <EmployeeTravelDetails />
              )}
              {subSection === "Upstream-Transport-Details" && (
                <UpstreamTransportDetails />
              )}
            </>
          )}
          {value === "Waste" && <Waste />}

          <Flex ml={10} mt={20} gap={20} mb="xl">
            <Button variant="tertiaryButton">Reset</Button>
            {isSubSectionOpen ? (
              <Button
                variant="primaryButton"
                onClick={() => subSectionNextHandler()}
              >
                Next
              </Button>
            ) : (
              <Button variant="primaryButton" onClick={() => nextHandler()}>
                Next
              </Button>
            )}
          </Flex>
        </Grid.Col>
        <Grid.Col w={"100%"} h={"auto"} bg={"#E9F5F4"} span={3} p={20}>
          <Box style={{ borderRadius: 10 }} p={10} bg={"#fff"}>
            <Stack mb={20} mt={10} gap={10}>
              <Text
                ta={"center"}
                className="sore-font"
                size="12px"
                fw={400}
                c={"#1A1A1A"}
              >
                3% Completed
              </Text>
              <Progress color={"primary.5"} value={50} />
              <Group gap={8}>
                <Group gap={5}>
                  <IconCircle size={8} color="#66DF79" fill="#66DF79" />
                  <Text fz={"10px"} c={"#000"} fw={400}>
                    Completed
                  </Text>
                </Group>
                <Group gap={5}>
                  <IconCircle size={8} color="#72D0C6" fill="#72D0C6" />
                  <Text fz={"10px"} c={"#000"} fw={400}>
                    Optional Data Missing
                  </Text>
                </Group>
                <Group gap={5}>
                  <IconCircle size={8} color="#F00000" fill="#F00000" />
                  <Text fz={"10px"} c={"#000"} fw={400}>
                    Incomplete
                  </Text>
                </Group>
                <Group gap={5}>
                  <IconCircle size={8} color="#BBBABA" fill="#BBBABA" />
                  <Text fz={"10px"} c={"#000"} fw={400}>
                    Not Initiated
                  </Text>
                </Group>
              </Group>
            </Stack>
            <Accordion
              value={value}
              defaultValue={accordionList[0].value}
              onChange={(e) => accordianHandler(e!)}
            >
              {items}
            </Accordion>
          </Box>
        </Grid.Col>
      </Grid>
    </>
  );
};
export default Page;
