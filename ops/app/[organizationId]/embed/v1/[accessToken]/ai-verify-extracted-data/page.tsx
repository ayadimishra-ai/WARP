"use client";
import {
  Anchor,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DocumentViewer from "~/components/ai-modules/DocumentViewer";
import ExtractedDataTable from "~/components/ai-modules/ExtractedDataTable";
import CheckedStarIcon from "~/components/icons/CheckedStarIcon";
import { useGetFileForVerificationOrEditQuery } from "~/graphql/queries/get-files-for-verify-or-edit.generated";
import { AiFileData } from "~/graphql/shared/types";
import { AIFileUploadStatus } from "~/shared/constants/ai-constant";
import { type AIFileDataRecord } from "~/shared/types/ai-types";
import { handleDownload } from "~/utils/common-functions";
import {
  getOrganizationIdFromToken,
  getUserIdFromToken,
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";

const VerifyExtractedData = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [allAIFileDataRecords, setAllAIFileDataRecords] =
    useState<AIFileDataRecord[]>();
  const [totalPendingVerificationCount, setTotalPendingVerificationCount] =
    useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    "prev" | "next" | null
  >(null);

  const fileIdParam = searchParams.get("fileId");
  const isEdit = searchParams.get("isEdit");
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const userId = getUserIdFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const organizationId = getOrganizationIdFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  const getFilesForVerifyOrEdit = useGetFileForVerificationOrEditQuery({
    skip: true,
  });

  const fetchData = useCallback(
    async (verifiedFileId?: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!userRole) return;
        // If fileIdParam is present, fetch only that file (edit mode)
        if (isEdit === "true" && fileIdParam) {
          const singleFileResult = await getFilesForVerifyOrEdit.refetch({
            where: {
              id: { _eq: fileIdParam },
              is_deleted: { _eq: false },
            },
          });
          const records =
            singleFileResult?.data?.AIFileUploads?.flatMap((file: any) =>
              file.AIFileData.map((d: AiFileData) => ({
                ...d,
                status: file.status,
                fileUploadId: file.id,
                file_name: file.file_name,
                file_url: file.file_url,
              }))
            ) || [];
          setAllAIFileDataRecords(records);
          setCurrentBillIndex(0);
          setLoading(false);
          return;
        }

        // 1. Fetch all PendingVerification files (for Executive)
        //    If Admin, fetch all Verified files
        const result = await getFilesForVerifyOrEdit.refetch({
          where: {
            status: {
              _in: isAdmin
                ? [AIFileUploadStatus.Verified]
                : [AIFileUploadStatus.VerificationPending],
            },
            is_deleted: { _eq: false },
            ...(isAdmin && {
              AppUser: {
                organization_id: { _eq: organizationId }, // Restrict admin to their organization
              },
            }),
            ...(!isAdmin && {
              created_by: { _eq: userId }, // Restrict non-admins to their own files
            }),
          },
        });

        // Flatten AIFileUploads -> AIFileData
        let records =
          result?.data?.AIFileUploads?.flatMap((file: any) => {
            const dataItems = file.AIFileData?.length ? file.AIFileData : [{}]; // Ensures at least one item is returned

            return dataItems.map((d: AiFileData) => ({
              ...d,
              status: file.status,
              fileUploadId: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
            }));
          }) || [];

        setTotalPendingVerificationCount(records.length);
        // 2. If a file was just verified, fetch it by ID (now status is Verified)
        let verifiedFile = null;
        const justVerifiedFileId = verifiedFileId || fileIdParam;
        if (justVerifiedFileId) {
          const verifiedResult = await getFilesForVerifyOrEdit.refetch({
            where: {
              id: { _eq: justVerifiedFileId },
              is_deleted: { _eq: false },
            },
          });
          verifiedFile =
            verifiedResult?.data?.AIFileUploads?.flatMap((file: any) =>
              file.AIFileData.map((d: AiFileData) => ({
                ...d,
                status: file.status,
                fileUploadId: file.id,
                file_name: file.file_name,
                file_url: file.file_url,
              }))
            )[0] || null;
        }

        // 3. Merge verified file into the list if not present
        if (verifiedFile && !records.some((r) => r.id === verifiedFile.id)) {
          records = [verifiedFile, ...records];
        }

        // --- Sorting and grouping logic ---
        let centerBill: AIFileDataRecord | undefined = undefined;
        let pastBills: AIFileDataRecord[] = [];
        let nextBills: AIFileDataRecord[] = [];

        if (fileIdParam) {
          // Center bill is clicked bill from Upload History page.
          centerBill = records.find((r) => r.file_id === fileIdParam);

          const centerCreated =
            centerBill && centerBill.created_at
              ? new Date(centerBill.created_at)
              : null;

          records.forEach((bill) => {
            if (centerBill && bill.id === centerBill.id) return; // skip center bill
            const billCreated = bill.created_at
              ? new Date(bill.created_at)
              : null;
            if (centerCreated && billCreated && billCreated < centerCreated) {
              pastBills.push(bill);
            } else if (
              centerCreated &&
              billCreated &&
              billCreated > centerCreated
            ) {
              nextBills.push(bill);
            }
          });
        } else {
          // If no fileIdParam, treat all as past
          pastBills = records;
        }

        // Sort by status: VerificationPending close to center bill
        const statusSort = (a: any, b: any) => {
          if (a.status === b.status) return 0;
          if (a.status === AIFileUploadStatus.Verified) return -1;
          if (b.status === AIFileUploadStatus.Verified) return 1;
          return 0;
        };
        pastBills.sort(statusSort);
        nextBills.sort(statusSort);

        // Final list: pastBills, centerBill, nextBills
        const finalList = [
          ...pastBills,
          ...(centerBill ? [centerBill] : []),
          ...nextBills,
        ];
        setAllAIFileDataRecords(finalList);

        // Set currentBillIndex to the index of the center bill or verified file
        if (verifiedFile) {
          const idx = finalList.findIndex(
            (bill) => bill.id === verifiedFile.id
          );
          if (idx !== -1) setCurrentBillIndex(idx);
        } else if (centerBill) {
          const idx = finalList.findIndex((bill) => bill.id === centerBill.id);
          if (idx !== -1) setCurrentBillIndex(idx);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [userRole, isEdit, fileIdParam, isAdmin, getFilesForVerifyOrEdit]
  );
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.accessToken]);

  // Update URL when currentBillIndex changes
  useEffect(() => {
    if (allAIFileDataRecords && allAIFileDataRecords[currentBillIndex]) {
      const currentFileId = allAIFileDataRecords[currentBillIndex].file_id;
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("fileId", currentFileId);

      // Notify parent window about URL change: SPA root URL navigation
      window.parent.postMessage(
        JSON.stringify({
          type: "ai-verify-url-change",
          fileId: currentFileId,
          url: `${pathname}?${newSearchParams.toString()}`,
        }),
        "*"
      );
    }
  }, [currentBillIndex, allAIFileDataRecords, pathname, router, searchParams]);

  // Compute hasPrevBill and hasNextBill based on currentBillIndex
  const hasPrevBill = currentBillIndex > 0;
  const hasNextBill =
    currentBillIndex < (allAIFileDataRecords?.length ?? 0) - 1;

  // Handle unsaved changes callback from ExtractedDataTable
  const handleUnsavedChangesChange = (unsavedChanges: boolean) => {
    setHasUnsavedChanges(unsavedChanges);
  };

  // Listen for responses from parent's unsaved changes popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "unsavedChangesPopupResponse") {
          // Handle response from parent's unsaved changes popup
          if (message.action === "discard" && pendingNavigation) {
            if (pendingNavigation === "prev" && hasPrevBill) {
              setCurrentBillIndex((prev) => prev - 1);
            } else if (pendingNavigation === "next" && hasNextBill) {
              setCurrentBillIndex((prev) => prev + 1);
            }
          }
          setPendingNavigation(null);
        }
        // Listen for parent message when user clicks 'Discard Changes and Continue' in parent popup
        if (message.type === "ai-verify-discard-clicked" && pendingNavigation) {
          if (pendingNavigation === "prev" && hasPrevBill) {
            setCurrentBillIndex((prev) => prev - 1);
          } else if (pendingNavigation === "next" && hasNextBill) {
            setCurrentBillIndex((prev) => prev + 1);
          }
          setPendingNavigation(null);
        }
        // Listen for parent message when user clicks 'Discard Changes and Continue' in parent popup
        if (message.type === "ai-verify-extracted-data-close") {
          //refetch date newly verified file
          fetchData(message.fileId);
        }
      } catch (error) {
        // Ignore invalid messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pendingNavigation, hasPrevBill, hasNextBill, fetchData]);

  const handleNavigation = (direction: "prev" | "next") => {
    if (hasUnsavedChanges) {
      // Show unsaved changes popup via postMessage to parent
      setPendingNavigation(direction);
      const popupMessage = {
        type: "AIExtractedDataValidationPopup",
        title: "Unsaved Changes",
        message:
          "You have unsaved edits. Please click 'Verify and Confirm' to save before navigating.",
        buttons: [
          { text: "Stay on Page", action: "stay" },
          { text: "Discard Changes and Continue", action: "discard" },
        ],
      };
      window.parent.postMessage(JSON.stringify(popupMessage), "*");
    } else {
      // No unsaved changes, proceed with navigation
      let newIndex = currentBillIndex;

      if (direction === "prev" && hasPrevBill) {
        newIndex = currentBillIndex - 1;
      } else if (direction === "next" && hasNextBill) {
        newIndex = currentBillIndex + 1;
      }

      setCurrentBillIndex(newIndex);
    }
  };

  const handlePrevBill = () => {
    if (hasPrevBill) {
      handleNavigation("prev");
    }
  };

  const handleNextBill = () => {
    if (hasNextBill) {
      handleNavigation("next");
    }
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" h="60vh">
        <Loader size="lg" color="blue" />
      </Flex>
    );
  }

  return (
    <Container p={0} fluid styles={{ root: { overflow: "hidden" } }}>
      {/* <DummyScrollTable /> */}
      <Grid
        gutter={{ base: "md", lg: "lg", xl: "xl" }}
        className="verifyExtractedDataModule"
      >
        <Grid.Col span={6}>
          <Flex align="center" gap="25px" mb="lg">
            <Text fz={24} c="#454545">
              Energy Grid
            </Text>
            {allAIFileDataRecords &&
              allAIFileDataRecords[currentBillIndex]?.file_name && (
                <Stack gap={0}>
                  <Anchor
                    onClick={() =>
                      handleDownload(
                        allAIFileDataRecords[currentBillIndex]?.file_url,
                        allAIFileDataRecords[currentBillIndex]?.file_name
                      )
                    }
                    fz={12}
                    c="#003B52"
                    td="none"
                  >
                    {allAIFileDataRecords[currentBillIndex].file_name}
                  </Anchor>
                  <Divider color="#003B52" m={0} />
                </Stack>
              )}
          </Flex>
          {allAIFileDataRecords && allAIFileDataRecords[currentBillIndex] && (
            <DocumentViewer
              key={allAIFileDataRecords[currentBillIndex].file_url}
              fileURL={allAIFileDataRecords[currentBillIndex].file_url}
            />
          )}
        </Grid.Col>
        <Grid.Col span={6} className="themeTable">
          <Flex align="center" justify="space-between" gap="sm" mb="lg">
            {/* Display All Bills Verified; 
              1. If User is Admin, 
              2. If user is Executive, but only have single file with 'Pending Verification' 
          */}
            {isEdit === "true" ? (
              <Flex />
            ) : totalPendingVerificationCount <= 0 || isAdmin ? (
              <Flex gap="5px" align="center">
                <Text fz="14px" c="#42AF8E">
                  All bills Verified
                </Text>
                <CheckedStarIcon size={20} color="#42AF8E" />
              </Flex>
            ) : (
              <Text fz="14px">
                Pending Verification:{" "}
                <Text fz="14px" fw={700} component="span">
                  {totalPendingVerificationCount}
                </Text>{" "}
                {totalPendingVerificationCount > 1 ? "bills" : "bill"}
              </Text>
            )}
            <Group>
              <Button
                onClick={handlePrevBill}
                disabled={!hasPrevBill}
                variant="outline"
                color="#122F47"
                fw={600}
                fz={12}
                h={36}
                lts="0.15rem"
                p="0 20px"
                radius="xl"
                className="outlineButtonHover"
              >
                PREV
              </Button>
              <Button
                onClick={handleNextBill}
                disabled={!hasNextBill}
                variant="outline"
                color="#122F47"
                fw={600}
                fz={12}
                h={36}
                lts="0.15rem"
                p="0 20px"
                radius="xl"
                className="outlineButtonHover"
              >
                NEXT
              </Button>
            </Group>
          </Flex>
          <ExtractedDataTable
            fileId={
              allAIFileDataRecords
                ? allAIFileDataRecords[currentBillIndex]?.file_id
                : undefined
            }
            onUnsavedChangesChange={handleUnsavedChangesChange}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};
export default function Page() {
  return <VerifyExtractedData />;
}
