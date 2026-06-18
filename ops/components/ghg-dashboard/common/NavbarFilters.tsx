import {
  Checkbox,
  Combobox,
  Flex,
  Group,
  Input,
  Pill,
  PillsInput,
  Select,
  Text,
  useCombobox,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCaretDownFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { useGlobalFilters } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/global.store";
import { useGetLocationsAndAddressesLazyQuery } from "~/graphql/queries/get-addresses-by-userid-and-orgid.generated";
import { useUserSession } from "~/hooks/use-user-session";

interface NavbarFiltersProps {}

interface RegionType {
  value?: string;
  label?: string;
}

interface GetRegionDataMethodType {
  code: string;
  id: string;
  name: string;
  __typename: string;
}
interface GetAllLocationsType {
  id: string;
  Address: {
    code: string;
    id: string;
    name: string;
    pincode: string;
    __typename: string;
  };
  __typename: string;
}

function NavbarFilters(props: NavbarFiltersProps) {
  const [fetchedRegion, setFetchedRegion] = useState<RegionType[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [locationList, setLocationList] = useState<RegionType[]>([]);
  const smallDevice = useMediaQuery("(min-width: 1365px)");

  const getAllLocations = useGetLocationsAndAddressesLazyQuery()[0];
  // const getAllRegion = useGetRegionDataLazyQuery()[0];

  const session = useUserSession();

  const { userId = "", organizationId = "" } = session || {};

  const {
    current,
    regionData,
    locationData,
    setDurationGlobalFilter,
    setRegionsGlobalFilter,
    setLocationsGlobalFilter,
  } = useDashboardStore((state) => ({
    current: state.current,
    regionData: state.regionData,
    locationData: state.locationData,
    setDurationGlobalFilter: state.setDurationGlobalFilter,
    setRegionsGlobalFilter: state.setRegionsGlobalFilter,
    setLocationsGlobalFilter: state.setLocationsGlobalFilter,
  }));

  const { selectedDuration, selectedLocations, selectedRegions } =
    useGlobalFilters();

  //fetched regions and locations from dahboard store for loading time optimization purpose - satej
  useEffect(() => {
    const regionsRes = regionData?.regions?.map(
      (obj: GetRegionDataMethodType) => {
        return { value: obj.id, label: obj.name };
      }
    );
    setFetchedRegion([
      { value: "All Regions", label: "All Regions" },
      ...regionsRes,
    ]);
  }, [regionData]);

  useEffect(() => {
    const sortedLocationList = [...(locationData?.locations || [])].sort(
      (a: any, b: any) => a.label.localeCompare(b.label)
    );
    setLocationList(sortedLocationList);
  }, [locationData]);

  const getYearString = () => {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    if (currentMonth <= 3) {
      return `${(currentDate.getFullYear() - 1).toString()}-${currentDate.getFullYear().toString().slice(2)}`;
    } else {
      return `${currentDate.getFullYear().toString()}-${(currentDate.getFullYear() + 1).toString().slice(2)}`;
    }
  };

  const getLastYearString = () => {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    if (currentMonth < 3) {
      return `${(currentDate.getFullYear() - 2).toString()}-${(currentDate.getFullYear() - 1).toString().slice(2)}`;
    } else {
      return `${(currentDate.getFullYear() - 1).toString()}-${currentDate.getFullYear().toString().slice(2)}`;
    }
  };

  const duration = [
    { value: "threemonths", label: "Last 3 months" },
    { value: "sixmonths", label: "Last 6 months" },
    { value: "thisquarter", label: `This Quarter (FY ${getYearString()})` },
    {
      value: "thisyear",
      label: `This Year (FY ${getYearString()})`,
    },
    {
      value: "lastyear",
      label: `Last Year (FY ${getLastYearString()})`,
    },
    {
      value: "baseline",
      label: `From Baseline (FY ${current.baseLineYear || 2021}-${new Date().getFullYear().toString().slice(2)})`,
    },
  ];

  const getAllLocationsData = async () => {
    if (!userId && !organizationId) return;

    await getAllLocations({
      variables: {
        organizationId: organizationId,
        userId: userId,
      },
    }).then((response: any) => {
      console.log("locations=", response?.data);

      let locationsArr = response?.data?.UserOrganizationAddressMapping?.map(
        (loc: any) => {
          return {
            value: loc?.organization_address_id,
            label: loc?.OrganizationAddress?.Address?.name,
          };
        }
      );
      const sortedLocationList = [locationsArr || []].sort((a: any, b: any) =>
        a.label.localeCompare(b.label)
      );
      setLocationList(sortedLocationList);
      setLocationsGlobalFilter(locationsArr?.map((obj: any) => obj.value));
    });
  };

  // const getRegionDataMethod = async () => {
  //   await getAllRegion().then((response: any) => {
  //     let regionsRes = response?.data?.Region?.map(
  //       (obj: GetRegionDataMethodType) => {
  //         return { value: obj.id, label: obj.name };
  //       }
  //     );
  //     setFetchedRegion([
  //       { value: "All Regions", label: "All Regions" },
  //       ...regionsRes,
  //     ]);

  //     if (regionsRes && regionsRes.length > 0) {
  //       const allRegions = regionsRes?.map((obj: any) => obj.value);
  //       if (allRegions && allRegions.length > 0) {
  //         setRegionsGlobalFilter(allRegions);
  //       }
  //     }
  //   });
  // };

  // >>>>>> Important : Dont remove this section
  // in need of this useeffect for url params
  // useEffect(() => {
  //   // eslint-disable-next-line no-undef
  //   globalThis.addEventListener("message", async (event: any) => {
  //     event.preventDefault();
  //     let messageData: any;
  //     let dataType = typeof event.data;
  //     if (dataType === "string") {
  //       try {
  //         messageData = JSON.parse(event.data);
  //         const type = messageData.type;
  //         if (type === "iframeDasboard") {
  //           if (messageData.params) {
  //             console.log("params", messageData.params);
  //             return;
  //           }
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   });
  //   handleDurationChange(getYearString());
  // }, [alllocations, region, value]);

  let my = 0;
  // useEffect(() => {
  //   getRegionDataMethod();
  // }, []);

  // useEffect(() => {
  //   getAllLocationsData();
  // }, [userId, organizationId]);

  const handleDurationChange = (durationvalues: any) => {
    if (durationvalues === selectedDuration) {
      return;
    }

    window.parent.postMessage("loading", "*");
    setTimeout(() => {
      setDurationGlobalFilter(durationvalues);
    }, 100);
  };

  const handleRegionChange = (val: any) => {
    window.parent.postMessage("loading", "*");
    setSelectedRegion(val); // This state is to manage dropdown value for selected region // Default "All Regions"
    setTimeout(() => {
      let allRegion =
        val === "All Regions"
          ? fetchedRegion
              ?.filter((obj) => obj.label !== "All Regions")
              ?.map((obj) => obj.value)
          : [val];
      setRegionsGlobalFilter(allRegion); // This is array of regions, For all regions array of combined ids are stored to dashboard store
    }, 100);
  };

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleLocationChange = (locationId: string) => {
    window.parent.postMessage("loading", "*");
    setTimeout(() => {
      if (locationId === "all") {
        if (selectedLocations?.length === locationList?.length) {
          setLocationsGlobalFilter([]);
        } else {
          const newLocationIds = locationList.map((v) => v.value);
          setLocationsGlobalFilter(newLocationIds as string[]);
        }
      } else {
        const newLocationIds = selectedLocations?.includes(locationId)
          ? selectedLocations?.filter((v) => v !== locationId)
          : [...(selectedLocations ? selectedLocations : []), locationId];
        setLocationsGlobalFilter(newLocationIds);
      }
    }, 100);
  };

  const handleValueRemove = (val: string) => {
    window.parent.postMessage("loading", "*");
    setTimeout(() => {
      const newLocations = selectedLocations?.filter((v) => v !== val);
      setLocationsGlobalFilter(newLocations as string[]);
      window.parent.postMessage("noLoading", "*");
    }, 100);
  };

  const values = selectedLocations?.map((item) => (
    <Pill
      key={item as string}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}
    >
      {item}
    </Pill>
  ));

  const options = [
    <Combobox.Option
      value="all"
      key="all"
      active={selectedLocations?.length === locationList?.length}
      bg={
        selectedLocations?.length === locationList?.length ? "#c0f5f0" : "#fff"
      }
    >
      <Group gap="xs">
        <Checkbox
          checked={selectedLocations?.length === locationList?.length}
          onChange={() => handleLocationChange("all")}
          size="12px"
        />
        <Text size="12px">All Locations</Text>
      </Group>
    </Combobox.Option>,
    ...locationList.map((item: RegionType) => (
      <Combobox.Option
        value={item.value as string}
        key={item.value as string}
        active={selectedLocations?.includes(item.value as string)}
        bg={
          selectedLocations?.includes(item.value as string) ? "#c0f5f0" : "#fff"
        }
      >
        <Group gap="xs">
          <Checkbox
            checked={selectedLocations?.includes(item.value as string)}
            onChange={() => handleLocationChange(item.value as string)}
            size="12px"
          />
          <Text size="12px">{item.label}</Text>
        </Group>
      </Combobox.Option>
    )),
  ];

  return (
    <Flex
      align={{ base: "flex-start", lg: "center" }}
      gap={{ base: "sm", lg: "xs" }}
      pb={2}
      direction={{ base: "column", lg: "row" }}
      wrap="wrap"
      pt="md"
      className="globalFilterContainer"
    >
      <Text size="12px" fw={600} c="#999999">
        Show Data:
      </Text>
      <Select
        withCheckIcon={false}
        data={duration}
        value={selectedDuration}
        onChange={handleDurationChange}
        size="xs"
        comboboxProps={{ shadow: "md" }}
        rightSection={<IconCaretDownFilled size="18px" color="#666666" />}
        variant="unstyled"
        allowDeselect={false}
        w={{
          base: "89vw",
          sm: "94vw",
          lg: "200px",
        }}
        styles={{
          options: {
            height: "100%",
          },
        }}
        classNames={{
          option: "ghg_dashboard_filters_option",
        }}
      />
      <Select
        withCheckIcon={false}
        data={fetchedRegion as []}
        value={selectedRegion}
        onChange={handleRegionChange}
        size="xs"
        comboboxProps={{ shadow: "md" }}
        rightSection={<IconCaretDownFilled size="18px" color="#666666" />}
        variant="unstyled"
        allowDeselect={false}
        w={{
          base: "89vw",
          sm: "94vw",
          lg: "120px",
        }}
        styles={{
          options: {
            height: "100%",
          },
        }}
        classNames={{
          option: "ghg_dashboard_filters_option",
        }}
      />
      <Combobox
        store={combobox}
        onOptionSubmit={(event) => handleLocationChange(event)}
        withinPortal={false}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            pointer
            onClick={() => combobox.toggleDropdown()}
            size="xs"
            w={{
              base: "89vw",
              sm: "94vw",
              lg: "130px",
            }}
            variant="unstyled"
            rightSection={
              <IconCaretDownFilled
                size="18px"
                color="#666"
                onClick={() => combobox.toggleDropdown()}
                style={{ cursor: "pointer" }}
              />
            }
          >
            <Pill.Group>
              {values &&
              values?.length > 0 &&
              (selectedLocations?.length === locationList?.length ||
                selectedLocations?.length === 0) ? (
                <Input.Placeholder c="#323232">All Locations</Input.Placeholder>
              ) : (
                <Input.Placeholder c="#323232">
                  Location ({values?.length})
                </Input.Placeholder>
              )}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  type="hidden"
                  onBlur={() => combobox.closeDropdown()}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace") {
                      event.preventDefault();
                      if (selectedLocations && selectedLocations.length > 0) {
                        const lastIndex = selectedLocations.length - 1;
                        handleValueRemove(selectedLocations[lastIndex]);
                      }
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>
        <Combobox.Dropdown
          className="combox-coustum"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Flex>
  );
}

export default NavbarFilters;
