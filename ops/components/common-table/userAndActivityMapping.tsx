import "@fortawesome/fontawesome-svg-core/styles.css";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  Checkbox,
  Flex,
  Group,
  MantineProvider,
  Select,
  TextInput,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCirclePlus, IconTrash } from "@tabler/icons-react";
import {
  type MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useGetUserActivityLocationMappingExistLazyQuery } from "~/graphql/queries/get-user-activity-location-mapping-exist.generated";
import {
  GetActivitiesQuery,
  GetAddressesQuery,
  GetUserActivityMappingsPaginatedQuery,
  UserOrganizationAddressMapping_Bool_Exp,
} from "~/graphql/shared/types";
import { Tdropdown } from "~/lib/excel/excel.service";
import { apiClientWithAuth } from "~/lib/fetcher";
import { addressTypeAllowedActivity } from "~/shared/constants/input.constant";
import {
  blankUpdateData,
  postParentMessage,
  saveActivityPopup,
} from "~/shared/services/platform-window-message-service";
import classes from "./CSS.module.css";

// Type alias for the user activity mapping item from GraphQL query
type UserActivityMappingItem =
  GetUserActivityMappingsPaginatedQuery["view_user_activity_mappings"][number];

// User row type
interface UserActivityRow {
  uniqueId: string;
  id: string;
  user_id: string;
  userName: string;
  searchUserName: string;
  organization_address_id: string;
  location_name: string;
  [key: string]: string | boolean; // Add index signature for dynamic key access
}
export type userActivityMappingRow = {
  id: string;
  user_id: string;
  userName: string;
  organization_address_id: string;
  location_name: string;
  activities: string[];
  isAdd: boolean;
};
export type organisationAddressDetails = {
  id: string;
  Address: {
    id: string;
    name: string;
    code: string;
    pincode: string;
    type: string;
    ownership_type: string;
  };
};

const UserAndActivityMapping: React.FC = () => {
  const setActivities = useLocalStorage<{ code: string; name: string }[]>({
    key: "activities",
    defaultValue: [],
  })[1];

  const [data, setData] = useState<UserActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [defaultData, setDefaultData] = useState<UserActivityRow[]>([]);
  const [headerData, setHeaderData] = useState<Record<string, any>[]>([]);
  const [locationDropdown, setlocationDropdown] = useState<Tdropdown[]>([]);
  const [locationallowedActivities, setLocationallowedActivities] = useState<
    Record<string, any>[]
  >([]);
  const [alteredData, setAlteredData] = useState<userActivityMappingRow[]>([]);
  const [duplicateData, setDuplicateData] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [userWithIcon, setUserWithIcon] = useState<
    { user_id: string; isHideIcon: boolean }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [allActivitiesData, setAllActivitiesData] = useState<
    GetActivitiesQuery["Activity"]
  >([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [orgAddressData, setOrgAddressData] = useState<
    GetAddressesQuery["OrganizationAddress"]
  >([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const isInitialLoad = useRef(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [locationMappingExists, setLocationMappingExists] = useState<
    Record<string, boolean>
  >({});

  // Initialize the lazy query for checking existing location mappings
  const [checkLocationMapping, { loading: isCheckingMapping }] =
    useGetUserActivityLocationMappingExistLazyQuery({
      fetchPolicy: "no-cache",
    });

  // Listen for refetch-user-activity-mappings message to reload data
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "refetch-user-activity-mappings") {
          // Reload the data by incrementing trigger
          setReloadTrigger((prev) => prev + 1);
        }
      } catch (error) {
        // Ignore parsing errors for non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch all activities from the new API
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await apiClientWithAuth.get("/api/v1/activity");

        if (response?.status === 200 && response?.data?.success) {
          setAllActivitiesData(response?.data?.data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []); // Empty dependency array - runs once on mount

  // Fetch all organization addresses from the new API
  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoadingAddress(true);
      try {
        const response = await apiClientWithAuth.get(
          "/api/v1/organization-address"
        );

        if (response?.status === 200 && response?.data?.success) {
          setOrgAddressData(response?.data?.data);
          // Transform addresses into dropdown format
          const allLocations = response?.data?.data?.map(
            (items: GetAddressesQuery["OrganizationAddress"][number]) => {
              return {
                label: items?.Address?.name,
                value: items?.id,
              };
            }
          ) as Tdropdown[];
          setlocationDropdown(allLocations);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, []); // Empty dependency array - runs once on mount

  // Reset pagination when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [debouncedSearchTerm, searchTerm]);

  // Function to process activities data
  const processActivitiesData = (
    activities: GetActivitiesQuery["Activity"]
  ) => {
    const dynamicHeaderdata = activities
      ?.filter((items) => items?.parent_code == null)
      .map((activity) => {
        const name =
          activity?.metadata?.ui?.listing?.column_name || activity?.name;
        const code = activity?.code;
        const sort =
          activity?.metadata?.ui?.listing?.column_index || activity?.name;

        return { name, code, sort };
      });

    setActivities(dynamicHeaderdata);

    let headercontent: Record<string, any>[] = [];
    headercontent.push({ name: "All", code: "All" });
    headercontent = [...headercontent, ...dynamicHeaderdata];

    return { dynamicHeaderdata, headercontent };
  };

  // Function to process location details with allowed activities
  const processLocationDetails = (
    addresses: GetAddressesQuery["OrganizationAddress"]
  ) => {
    return addresses?.map(
      (items: GetAddressesQuery["OrganizationAddress"][number]) => {
        const allowedActivities = addressTypeAllowedActivity
          .find(
            (item) =>
              String(item?.name).toLowerCase() ===
              String(items?.Address?.type).toLowerCase()
          )
          ?.data.filter(
            (dataItems) =>
              String(dataItems?.name).toLowerCase() ===
              String(items?.Address?.ownership_type).toLowerCase()
          )[0]?.data;
        return {
          orgAddressId: items?.id,
          allowedActivities,
        };
      }
    );
  };

  useEffect(() => {
    const getUserData = async () => {
      // Wait for activities and address data to be loaded
      if (
        !allActivitiesData ||
        allActivitiesData?.length === 0 ||
        !orgAddressData ||
        orgAddressData?.length === 0
      ) {
        return;
      }

      // Check if it's initial load or subsequent fetch
      if (isInitialLoad.current) {
        setIsLoading(true);
        isInitialLoad.current = false;
      } else {
        setIsRefetching(true);
      }

      const params = new URLSearchParams({
        pageIndex: pagination.pageIndex.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const userData = await apiClientWithAuth
        .get(
          `/api/v1/master-data/users/user-activity-permission?${params.toString()}`
        )
        .then((response) => {
          if (response?.statusText == "OK" && response?.status == 200) {
            return response.data;
          }
          return [];
        });

      // Process activities from the new API
      const { dynamicHeaderdata, headercontent } =
        processActivitiesData(allActivitiesData);

      // Process userActivityMappings (combined user and permission data)
      const rowData = processUserActivityMappings(
        userData,
        dynamicHeaderdata,
        headercontent
      );

      const locationDetail = processLocationDetails(orgAddressData);

      setData(rowData);

      setDefaultData(JSON.parse(JSON.stringify(rowData)));
      setHeaderData(headercontent.sort((a, b) => a.sort - b.sort));
      setLocationallowedActivities(locationDetail);

      // Set total count from API response
      if (userData?.data?.totalCount !== undefined) {
        setTotalCount(userData.data.totalCount);
      } else {
        setTotalCount(rowData.length);
      }

      setIsLoading(false);
      setIsRefetching(false);
    };
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    allActivitiesData,
    orgAddressData,
    reloadTrigger,
  ]);

  useEffect(() => {
    const uniqueUserId = data
      ?.map((items) => items.user_id)
      .filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );
    const isUserHideIcon = uniqueUserId.map((items) => {
      return {
        user_id: items,
        isHideIcon:
          data.filter((datas) => datas.user_id == items).length ==
          locationDropdown.filter(
            (filterItem: Tdropdown) => !!filterItem?.value
          ).length,
      };
    });
    setUserWithIcon(isUserHideIcon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Function to process user activity mappings
  const processUserActivityMappings = (
    userData: any,
    dynamicHeaderdata: Record<string, any>[],
    headercontent: Record<string, any>[]
  ) => {
    let rowData: UserActivityRow[] = [];

    userData?.data?.userActivityMappings?.forEach(
      (mapping: UserActivityMappingItem) => {
        // Find the organization address details for allowed activities
        const orgAddress = orgAddressData?.find(
          (addr) => addr.id === mapping.organization_address_id
        );

        const allowedActivities = orgAddress
          ? addressTypeAllowedActivity
              .find(
                (item) =>
                  String(item?.name).toLowerCase() ===
                  String(orgAddress?.Address?.type).toLowerCase()
              )
              ?.data.filter(
                (dataItems) =>
                  String(dataItems?.name).toLowerCase() ===
                  String(orgAddress?.Address?.ownership_type).toLowerCase()
              )[0]?.data
          : [];

        let activityData: any = {};
        activityData["uniqueId"] = crypto.randomUUID();
        activityData["user_id"] = mapping?.user_id;
        activityData["searchUserName"] = mapping?.user_name;
        activityData["userName"] = mapping?.user_name;
        activityData["organization_address_id"] =
          mapping?.organization_address_id || "";
        activityData["location_name"] =
          mapping?.organization_address_name || "";

        // Check if user has permission (permission_created_at will be null if no permission)
        if (mapping?.permission_created_at) {
          // User has permission for this location
          activityData["id"] = mapping?.id;

          const userActivities = (mapping?.activities as string[]) || [];
          const pendingPermission = dynamicHeaderdata?.filter(
            (items: Record<string, any>) =>
              !userActivities.some((item: string) => item == items?.code)
          );
          const areAllowedActivities = allowedActivities?.filter(
            (item: string) =>
              pendingPermission?.find(
                (items: Record<string, any>) => items?.code == item
              )
          );
          activityData["All"] = areAllowedActivities?.length == 0;
          dynamicHeaderdata?.forEach((items: Record<string, any>) => {
            activityData[items?.code] =
              userActivities.filter((item: string) => item == items?.code)
                .length > 0;
          });
        } else {
          // User exists but has no permission for this location
          activityData["uniqueId"] = crypto.randomUUID();
          (activityData["user_id"] = mapping?.user_id),
            (activityData["id"] = ""),
            (activityData["userName"] = mapping?.user_name),
            (activityData["searchUserName"] = mapping?.user_name),
            (activityData["organization_address_id"] =
              mapping?.organization_address_id || ""),
            (activityData["location_name"] =
              mapping?.organization_address_name || "");
          headercontent?.forEach((items) => {
            activityData[items?.code] = false;
          });
          // activityData["All"] = false;
        }

        rowData.push(activityData);
      }
    );

    return rowData;
  };

  const getAlteredData = () => {
    const newrow = data.filter((items) => items?.id == "");
    const dataToUpdateWithId = getUpdatedItems(
      defaultData,
      data.filter((items) => items?.id != "")
    );
    const uniqueUserId = data
      ?.map((items) => items.user_id)
      .filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );
    const duplicateuserLocationData: string[] = [];
    uniqueUserId.forEach((userItems) => {
      const userData = data.filter(
        (items) =>
          items?.user_id == userItems && !!items?.organization_address_id
      );
      userData.map((items) => {
        if (
          userData.filter(
            (userDataItems) =>
              userDataItems.organization_address_id ==
              items?.organization_address_id
          ).length > 1
        ) {
          duplicateuserLocationData.push(items?.uniqueId);
        }
      });
    });
    setDuplicateData(duplicateuserLocationData);
    const dataToUpdate = [...newrow, ...dataToUpdateWithId];
    const removedRow = defaultData
      ?.filter((items) => items?.id != "")
      ?.filter(
        (d) =>
          !data
            ?.filter((items) => items?.id != "")
            ?.find((item) => item.uniqueId === d.uniqueId)
      );
    const rowsToAdd = dataToUpdate
      .filter((item) => !!item?.user_id && !!item?.organization_address_id)
      .map((items) => {
        const returnData = Object.keys(items).filter(
          (rowItem: string) =>
            rowItem != "uniqueId" &&
            rowItem != "id" &&
            rowItem != "userName" &&
            rowItem != "searchUserName" &&
            rowItem != "user_id" &&
            rowItem != "organization_address_id" &&
            rowItem != "location_name" &&
            items[rowItem] == true
        );
        const duplicateEntry = data.filter(
          (updateItems) =>
            updateItems?.user_id == items?.user_id &&
            updateItems?.organization_address_id ==
              items?.organization_address_id
        )?.length;
        if (returnData.length > 0 && duplicateEntry <= 1) {
          return {
            id: items?.id,
            user_id: items?.user_id,
            userName: items?.searchUserName,
            organization_address_id: items?.organization_address_id,
            location_name: items?.location_name,
            activities: returnData,
            isAdd: true,
          };
        }
      }) as userActivityMappingRow[];
    const rowsToRemove = removedRow.map((items) => {
      const returnData = Object.keys(items).filter(
        (rowItem: string) =>
          rowItem != "uniqueId" &&
          rowItem != "id" &&
          rowItem != "userName" &&
          rowItem != "searchUserName" &&
          rowItem != "user_id" &&
          rowItem != "organization_address_id" &&
          rowItem != "location_name" &&
          items[rowItem] == true
      );
      if (returnData.length > 0) {
        return {
          id: items?.id,
          user_id: items?.user_id,
          userName: items?.searchUserName,
          organization_address_id: items?.organization_address_id,
          location_name: items?.location_name,
          activities: returnData,
          isAdd: false,
        };
      }
    });
    return [...rowsToAdd, ...rowsToRemove];
  };

  useEffect(() => {
    const dataChanges = getAlteredData();
    setAlteredData(dataChanges.filter((items) => !!items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultData, data]);

  const columns: MRT_ColumnDef<UserActivityRow>[] = [
    {
      accessorKey: "sn",
      header: "SN",
      size: 20,
      Cell: ({ row }) =>
        pagination.pageIndex * pagination.pageSize + row.index + 1,
      enableSorting: false,
      enableColumnFilter: false,
      mantineTableHeadCellProps: {
        style: {
          paddingTop: 14,
          paddingLeft: 12,
          fontSize: 12,
          backgroundColor: "#003b52",
          color: "#ffffff",
          justifyContent: "flex-start !important",
        },
      },
    },
    {
      accessorKey: "userName",
      header: "Username",
      size: 180,
      enableSorting: false,
      mantineTableHeadCellProps: {
        style: {
          paddingTop: 14,
          paddingLeft: 12,
          fontSize: 12,
          backgroundColor: "#003b52",
          color: "#ffffff",
          justifyContent: "flex-start !important",
        },
      },
    },
    {
      accessorKey: "organization_address_id",
      header: "Organization Location",
      size: 200,
      enableSorting: false,
      mantineTableHeadCellProps: {
        style: {
          paddingTop: 14,
          paddingLeft: 12,
          fontSize: 12,
          backgroundColor: "#003b52",
          color: "#ffffff",
        },
      },
      Cell: ({ cell, row }: { cell: any; row: any }) => {
        const cellValue = cell.getValue();
        const organizationAddressId = cellValue || null;

        return (
          <Select
            key={row?.original?.uniqueId}
            color="#42AF8E"
            data={locationDropdown}
            value={organizationAddressId}
            onChange={async (val) => {
              setLocationMappingExists((prev) => ({
                ...prev,
                [row?.original?.uniqueId]: false,
              }));

              // Build the where clause dynamically
              const whereClause: UserOrganizationAddressMapping_Bool_Exp = {
                user_id: { _eq: row?.original?.user_id },
                organization_address_id: { _eq: val },
              };

              const result = await checkLocationMapping({
                variables: {
                  where: whereClause,
                },
              });

              let isDuplicateMapping = false;

              // Case 1 :
              // Pre-condition :
              // 1. the location address and user id must not be exist in the default data
              // in that case only we need to check in the backend for existing mapping
              // If we got the data, that means it's duplicate mapping
              const existsInDefaultData = defaultData.some(
                (item) =>
                  item.user_id === row?.original?.user_id &&
                  item.organization_address_id === val
              );

              if (
                !existsInDefaultData &&
                result?.data?.UserOrganizationAddressMapping &&
                result.data.UserOrganizationAddressMapping.length > 0
              ) {
                isDuplicateMapping = true;
              }

              // Case 2 : Vice versa locations
              // e.g., Row 1 => Location 1 -> Location 2
              // Row 2 => Location 2 -> Location 1
              // This should not validate as duplicate as well

              const newData = data.filter(
                (items) => items?.uniqueId == row?.original?.uniqueId
              );
              const locationActivities = locationallowedActivities?.filter(
                (items) => items?.orgAddressId == val
              );
              newData[0].organization_address_id = val || "";
              newData[0].location_name =
                locationDropdown.find((item) => item.value === val)?.label ||
                "";
              const allkeys = Object.keys(newData[0]).filter(
                (rowItem) =>
                  rowItem != "uniqueId" &&
                  rowItem != "id" &&
                  rowItem != "user_id" &&
                  rowItem != "userName" &&
                  rowItem != "searchUserName" &&
                  rowItem != "organization_address_id" &&
                  rowItem != "location_name" &&
                  rowItem != "All"
              );
              const notallowed = allkeys?.filter(
                (items: string) =>
                  !locationActivities[0]?.allowedActivities?.some(
                    (item: string) => item == items
                  )
              );
              const allowed = allkeys?.filter((items: string) =>
                locationActivities[0]?.allowedActivities?.some(
                  (item: string) => item == items
                )
              );
              const allowedValues = allowed?.map((items) => {
                return newData[0][items];
              });
              if (allowedValues.filter((items) => !items).length == 0) {
                newData[0]["All"] = true;
              }
              if (val === null) {
                newData[0]["All"] = false;
              }
              if (notallowed.length > 0) {
                notallowed.forEach((items: any) => {
                  newData[0][items] = false;
                });
              }
              const freshData = data?.map((items) => {
                if (items?.uniqueId != row?.original?.uniqueId) {
                  return items;
                } else {
                  return newData[0];
                }
              }) as UserActivityRow[];
              setData(freshData);
              if (isDuplicateMapping) {
                setLocationMappingExists((prev) => ({
                  ...prev,
                  [row?.original?.uniqueId]: true,
                }));
              }
            }}
            error={
              duplicateData.includes(row.original.uniqueId) ||
              locationMappingExists[row.original.uniqueId]
            }
            placeholder="Select Location"
            searchable
          />
        );
      },
    },
    ...headerData.map((key) => ({
      accessorKey: key?.code,
      header: key?.name,
      Cell: ({ cell, row }: { cell: any; row: any }) => {
        const locationActivities = locationallowedActivities?.filter(
          (items) =>
            items?.orgAddressId == row?.original?.organization_address_id
        );
        return (
          <Flex align="center" justify="center">
            <Checkbox
              key={row?.original?.uniqueId + "-" + key?.code}
              disabled={
                !!row?.original?.organization_address_id
                  ? key?.code == "All"
                    ? false
                    : !!locationActivities && locationActivities.length > 0
                      ? locationActivities[0]?.allowedActivities?.filter(
                          (items: string) => items == key?.code
                        ).length == 0
                      : true
                  : true
              }
              color="#42AF8E"
              checked={cell.getValue() as boolean}
              onChange={(e) => {
                const newData = data.filter(
                  (items) => items?.uniqueId == row?.original?.uniqueId
                );
                // Type-safe update for boolean fields
                const allkeys = Object.keys(newData[0]).filter(
                  (rowItem) =>
                    rowItem != "uniqueId" &&
                    rowItem != "id" &&
                    rowItem != "user_id" &&
                    rowItem != "userName" &&
                    rowItem != "searchUserName" &&
                    rowItem != "organization_address_id" &&
                    rowItem != "location_name" &&
                    rowItem != "All"
                );
                if (typeof newData[0][key?.code] === "boolean") {
                  if (key?.code == "All") {
                    const locationActivities =
                      locationallowedActivities?.filter(
                        (items) =>
                          items?.orgAddressId ==
                          newData[0]?.organization_address_id
                      );
                    const notallowed = allkeys?.filter(
                      (items: string) =>
                        !locationActivities[0]?.allowedActivities?.some(
                          (item: string) => item == items
                        )
                    );
                    Object.keys(newData[0])
                      .map((rowItem) => {
                        return {
                          userName: rowItem,
                          value: typeof newData[0][rowItem] == "boolean",
                        };
                      })
                      .filter((dataItems) => dataItems?.value == true)
                      .map((details) => details?.userName)
                      .map((dataItems) => {
                        if (notallowed.length > 0) {
                          notallowed.forEach((items: any) => {
                            newData[0][items] = false;
                          });
                        }
                        if (
                          notallowed.filter(
                            (activityCode) => activityCode == dataItems
                          ).length == 0
                        ) {
                          newData[0][dataItems] = e.target.checked;
                        }
                      });
                  } else {
                    newData[0][key?.code] = e.target.checked;
                    const allowed = allkeys?.filter((items: string) =>
                      locationActivities[0]?.allowedActivities?.some(
                        (item: string) => item == items
                      )
                    );
                    const allowedValues = allowed?.map((items) => {
                      return newData[0][items];
                    });
                    newData[0]["All"] =
                      allowedValues.filter((items) => !items).length == 0;
                  }
                  const freshData = data?.map((items) => {
                    if (items?.uniqueId != row?.original?.uniqueId) {
                      return items;
                    } else {
                      return newData[0];
                    }
                  }) as UserActivityRow[];
                  setData(freshData);
                }
              }}
            />
          </Flex>
        );
      },
      mantineTableHeadCellProps: {
        style: {
          paddingTop: 14,
          paddingLeft: 12,
          fontSize: 12,
          backgroundColor: "#003b52 ",
          color: "#ffffff",
        },
      },
      enableSorting: false,
      enableColumnFilter: false,
    })),
  ];
  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group
        justify="space-between"
        style={{ width: "100%" }}
        pt={0}
        pb={18}
        gap={24}
        mt={0}
      >
        <Flex>
          <Link
            href="#"
            style={{
              fontWeight: 600,
              color: "#FFA93C",
              margin: "10px 10px 10px 0",
              textDecoration: "none",
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            All ({totalCount})
          </Link>
        </Flex>
        <Flex gap={10} align="center">
          <TextInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={
              <FontAwesomeIcon
                icon={faSearch}
                style={{ fontSize: 14, color: "#666" }}
              />
            }
            rightSection={
              searchTerm && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setSearchTerm("")}
                  style={{
                    cursor: "pointer",
                    color: "rgb(102, 102, 102) !important",
                    fontWeight: "bold !important",
                    fontSize: "12px !important",
                  }}
                >
                  ✕
                </ActionIcon>
              )
            }
            style={{ width: 300 }}
            styles={{
              input: {
                borderRadius: 20,
                border: "1px solid #F1F3F6",
                paddingLeft: 40,
                backgroundColor: "#F1F3F6",
              },
            }}
          />

          <Button
            disabled={
              alteredData.length == 0 ||
              Object.values(locationMappingExists).some((exists) => exists)
            }
            variant="unstyled"
            fw={600}
            fz={12}
            h={36}
            lts="0.15rem"
            p="0 20px"
            radius="xl"
            className="noAnimationButton filledGradientButton"
            onClick={() => saveData()}
          >
            SAVE
          </Button>
        </Flex>
      </Group>
    ),
    mantineTableContainerProps: {
      style: {
        maxHeight: 500,
        overflowY: "auto",
      },
    },
    columns,
    data: data,
    enableStickyHeader: true,
    state: {
      isLoading: isLoading || isLoadingActivities || isLoadingAddress, // Show loading only during initial data fetch
      showProgressBars: isRefetching || isCheckingMapping, // Show progress bars during refetching
      pagination,
    },
    onPaginationChange: setPagination,
    renderToolbarInternalActions: () => <></>,
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => {
      // Find the original row index in the unfiltered data
      const originalRowIndex = data.findIndex(
        (dataRow) => dataRow.uniqueId === data[row.index].uniqueId
      );
      return (
        <Flex gap={5} justify="flex-start">
          {!userWithIcon?.filter(
            (items) => items?.user_id == data[originalRowIndex].user_id
          )[0]?.isHideIcon ? (
            <ActionIcon
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              variant="light"
              color="#42AF8E"
              onClick={() => {
                let rowObject: any = {};
                Object.keys(data[originalRowIndex]).map((items) => {
                  if (items == "uniqueId") {
                    rowObject[items] = crypto.randomUUID();
                  } else if (items == "id") {
                    rowObject[items] = "";
                  } else if (items == "user_id") {
                    rowObject[items] = data[originalRowIndex].user_id;
                  } else if (items == "searchUserName") {
                    rowObject[items] = data[originalRowIndex].searchUserName;
                  } else if (
                    items == "userName" ||
                    items == "organization_address_id" ||
                    items == "location_name"
                  ) {
                    rowObject[items] = null;
                  } else {
                    rowObject[items] = false;
                  }
                });
                const newRow: UserActivityRow = rowObject;
                const newData = [...data];
                newData.splice(originalRowIndex + 1, 0, newRow);
                setData(newData);
              }}
            >
              <IconCirclePlus size={24} />
            </ActionIcon>
          ) : (
            <></>
          )}
          {data.filter(
            (filterItems) => filterItems?.user_id == row?.original?.user_id
          ).length > 1 && (
            <ActionIcon
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              variant="light"
              color="#42AF8E"
              onClick={() => {
                setLocationMappingExists((prev) => ({
                  ...prev,
                  [row?.original?.uniqueId]: false,
                }));
                const newData = [...data];
                const userData = newData.filter(
                  (items) => items?.user_id == row?.original?.user_id
                );
                userData[1]["userName"] = userData[0]?.userName;
                newData.splice(originalRowIndex, 1);
                const freshData = newData?.map((items) => {
                  if (items?.uniqueId != userData[1]?.uniqueId) {
                    return items;
                  } else {
                    return userData[1];
                  }
                }) as UserActivityRow[];
                setData(freshData);
              }}
            >
              <IconTrash size={24} />
            </ActionIcon>
          )}
        </Flex>
      );
    },
    enableRowNumbers: false,
    enablePagination: true,
    manualPagination: true,
    rowCount: totalCount,
    paginationDisplayMode: "pages",
    mantinePaginationProps: {
      style: {
        border: 0,
      },
    },
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableMultiRowSelection: false,
    enableRowSelection: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableFilterMatchHighlighting: false,
    positionToolbarAlertBanner: "none",
    mantinePaperProps: {
      style: { paddingBottom: "190px" },
      className: classes.UserActivityMappingTable,
    },
    mantineTableBodyRowProps: {
      style: {
        height: 60, // Increase row height for better spacing
      },
    },
    mantineTableProps: {
      style: {
        borderSpacing: "0 8px", // Add spacing between rows
      },
    },
    mantineProgressProps: ({ isTopToolbar }: any) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["sn", "userName", "organization_address_id"] },
      showColumnFilters: false,
      showGlobalFilter: false,
      pagination: pagination,
    },
  });

  function getUpdatedItems(
    defaultData: UserActivityRow[],
    updatedData: UserActivityRow[]
  ): UserActivityRow[] {
    return updatedData.filter((updatedRow) => {
      const originalRow = defaultData.find((d) => d.id === updatedRow.id);
      if (!originalRow) return true; // new row

      // Check if any property value is different
      return Object.keys(updatedRow).some(
        (key) => updatedRow[key] !== originalRow[key]
      );
    });
  }
  const saveData = () => {
    window.localStorage.removeItem("userPermissionChanges");
    if (alteredData.filter((items) => !!items).length > 0) {
      window.localStorage.setItem(
        "userPermissionChanges",
        JSON.stringify(alteredData.filter((items) => !!items))
      );
      postParentMessage(saveActivityPopup(true));
    } else {
      postParentMessage(blankUpdateData());
    }
  };

  return (
    <Flex direction="column" wrap="nowrap" gap={0}>
      <h2
        style={{
          marginBottom: "0px",
          color: "#444444",
          marginTop: "27px",
          fontSize: "22px",
          fontWeight: "400",
        }}
      >
        User & Activity Mapping
      </h2>
      <MantineProvider>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Flex>
  );
};

export default UserAndActivityMapping;
