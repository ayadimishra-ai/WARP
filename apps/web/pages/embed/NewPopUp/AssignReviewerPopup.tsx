import {
  Box,
  Button,
  Flex,
  Global,
  Grid,
  MultiSelect,
  Text,
  TextInput,
} from "@mantine/core";
import { encryptionDecryption } from "@warp/client/hooks/encryption-decryption";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { useWarpContentSize } from "@warp/client/hooks/use-warp-content-size";
import Spinner from "@warp/client/layouts/Spinner";
import { startInvitationMessage, warpAssignReviewer } from "@warp/client/services/platform-window-message.service";
import {
  ParentCompanyMapping_Insert_Input,
  User_Insert_Input,
} from "@warp/graphql/generated/types";
import { useCreateParentCompanyMappingMutation } from "@warp/graphql/mutations/generated/create-ParentCompanyMapping";
import { useCreateUserMutation } from "@warp/graphql/mutations/generated/create-user";
import { useUpdateFormInvitationMutation } from "@warp/graphql/mutations/generated/update-form-invitation";
import { useGetParentCompanyMappingDetailsByCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-parent-company-mapping-details-by-company-id";
import { useGetUserDetailByEmailLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-email";
import { useGetUserDetailByParentCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-parentcompany-id";
import { AppRoles } from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type ReviewerDetails = {
  id: string;
  name: string;
  email: string;
  isNewReviewer: boolean;
} | null;

export type InvitationAIStatus = {
  docWithAI: boolean;
  onlyDoc: boolean;
};

const AssignReviewerPopup = () => {
  useWarpContentSize();
  const { query } = useRouter();
  const userSession = useUserSession();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterReviewerNameList, setFilterReviewerNameList] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [tempNewReviewer, setTempNewReviewer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isNewReviewerAdded, setIsNewReviewerAdded] = useState(false);

  const { choosemethodForMultiple } = encryptionDecryption();
  const insertUser = useCreateUserMutation()[0];
  const updateFormInvitation = useUpdateFormInvitationMutation()[0];
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const getExistingEmails = useGetUserDetailByEmailLazyQuery()[0];
  const getParentCompanyMappingDetails =
    useGetParentCompanyMappingDetailsByCompanyIdLazyQuery()[0];
  const getUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];

  const invitationId = String(query?.invitationId || "");
  const formId = String(query?.formId || "");
  const formType = String(query?.formType || "");
  const page = String(query?.page || "");
  const AssessmentFormName = String(query?.AssessmentFormName || "");
  const CompanyName = String(query?.CompanyName || "");
  const AIStatus: InvitationAIStatus =  !!query?.AIStatus ? JSON.parse(query?.AIStatus as string) : {};
  const invitationStatus = String(query?.invitationStatus || "");
  const AIBulkDocumentProcessings = !!query?.AIBulkDocumentProcessings ? JSON.parse(query?.AIBulkDocumentProcessings as string) : [];
  const Sources = !!query?.Sources ? JSON.parse(query?.Sources as string) : [];
  
  
  // Load user list

  useEffect(() => {
    const fetchData = async () => {
      const newuserList: any = await getUserList({
        variables: {
          companyId: userSession?.company?.id,
          userId: userSession?.user?.id,
        },
        fetchPolicy: "no-cache",
      });
      let newData: any[] = [];

      // ✅ Add ParentCompanyMapping users
      if (newuserList?.data?.ParentCompanyMapping) {
        newData = [
          ...newData,
          ...newuserList.data.ParentCompanyMapping.flatMap((item: any) => {
            const result: any[] = [];
            if (item?.User) {
              // Filter out users with 'Responder' role
              const hasResponderRole = item.User.UserRoles?.some(
                (userRole: any) => userRole.roleName === AppRoles.Responder
              );
              
              if (!hasResponderRole) {
                result.push({
                  id: item.User.id,
                  email: choosemethodForMultiple(
                    item.User.email,
                    "decryptForMultiple",
                  ),
                  name: item.User.name,
                  addressId: item.AddressId,
                });
              }
            }
            return result;
          }),
        ];
      }

      // ✅ Add direct Users filtered by company ID
      if (newuserList?.data?.User) {
        newData = [
          ...newData,
          ...newuserList.data.User.filter(
            (item: any) => item.companyId === userSession?.company?.id,
          ).flatMap((item: any) => {
            const result: any[] = [];
            if (item) {
              // Filter out users with 'Responder' role
              const hasResponderRole = item.UserRoles?.some(
                (userRole: any) => userRole.roleName === AppRoles.Responder
              );
              
              if (!hasResponderRole) {
                result.push({
                  id: item.id,
                  email: choosemethodForMultiple(
                    item.email,
                    "decryptForMultiple",
                  ),
                  name: item.name,
                  addressId: item.AddressId,
                  companyId: item.companyId,
                });
              }
            }
            return result;
          }),
        ];
      }

      // Filter and store users with both name and email, excluding current user
      const filteredNames = newData
        .filter(
          (item: any) =>
            item.name && item.email && item.id !== userSession?.user?.id,
        )
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
        }))
        .filter(
          (value: any, index: any, self: any) =>
            index ===
            self.findIndex(
              (t: any) => t.email === value.email && t.name === value.name,
            ),
        );
      setFilterReviewerNameList(filteredNames);
    };
    fetchData();
  }, [userSession?.company?.id, userSession?.user?.id]);

  const handleAssign = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Validation
      if (!userName.trim() || !email.trim()) {
        setErrorMessage("Please fill in both name and email fields.");
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      const encryptedEmail = choosemethodForMultiple(
        email.trim().toLowerCase(),
        "encryptformultiple",
      ) as string;

      // Check if reviewer already exists
      let existingReviewers: any[] = [];
      let allReviewerUsers: any[] = [];

      const existingReviewerResult = await getExistingEmails({
        variables: {
          newEmail: [encryptedEmail],
        },
      });

      const existingUser= existingReviewerResult?.data?.User?.filter(
        (user: any) => user.email === encryptedEmail,
      );

      // If creating a new reviewer and user already exists, show validation
      if (existingUser && existingUser?.length > 0 && isNewReviewerAdded) {
        setErrorMessage("User email id already exist.");
        setIsLoading(false);
        return;
      }

      if (
        existingReviewerResult.data &&
        existingReviewerResult.data.User.length > 0
      ) {
        // Filter reviewers that belong to the same company
        existingReviewers = existingReviewerResult.data.User.filter(
          (user: any) => user.companyId === userSession?.company?.id,
        );

        allReviewerUsers = [...existingReviewers];
      }

      // Check if this reviewer already exists
      const reviewerExists = existingReviewers.some(
        (existingUser: any) => existingUser.email === encryptedEmail,
      );

      let reviewerUser: any = null;
      let reviewerParentCompanyId: string | null = null;

      if (!reviewerExists) {
        // Insert new reviewer
        const newReviewersToInsert: User_Insert_Input[] = [];

        newReviewersToInsert.push({
          name: userName.trim(),
          email: encryptedEmail,
          phone: "",
          companyId: userSession?.company?.id,
          created_by: userSession?.user?.id,
          updated_by: userSession?.user?.id,
          UserRoles: {
            data: {
              roleName: AppRoles.Invitee,
            },
          },
        } as unknown as User_Insert_Input);

        const resultReviewer = await insertUser({
          variables: {
            input: newReviewersToInsert,
          },
        });

        if (
          resultReviewer?.data?.insert_User?.returning &&
          resultReviewer.data.insert_User.returning.length > 0
        ) {
          reviewerUser = resultReviewer.data.insert_User.returning[0];
          allReviewerUsers.push(reviewerUser);

          // Create ParentCompanyMapping for new reviewer
          const reviewerMapping: ParentCompanyMapping_Insert_Input = {
            CompanyId: userSession?.company?.id,
            ParentCompanyId: userSession?.company?.id,
            UserId: reviewerUser.id,
            ParentUserId: userSession?.user?.id,
            AddressId: null,
          };

          const resultParentCompany = await insertParentCompanyMapping({
            variables: {
              input: [reviewerMapping],
            },
          });

          // Get the ParentCompanyMapping Id from the insert result
          if (
            resultParentCompany?.data?.insert_ParentCompanyMapping?.returning &&
            resultParentCompany.data.insert_ParentCompanyMapping.returning
              .length > 0
          ) {
            reviewerParentCompanyId =
              resultParentCompany.data.insert_ParentCompanyMapping.returning[0]
                .Id;
          }
        }
      } else {
        // Use existing reviewer
        reviewerUser = existingReviewers[0];

        // Create ParentCompanyMapping for new reviewer
        const reviewerMapping: ParentCompanyMapping_Insert_Input = {
          CompanyId: userSession?.company?.id,
          ParentCompanyId: userSession?.company?.id,
          UserId: reviewerUser.id,
          ParentUserId: userSession?.user?.id,
          AddressId: null,
        };

        const resultParentCompany = await insertParentCompanyMapping({
          variables: {
            input: [reviewerMapping],
          },
        });

        // Get the ParentCompanyMapping Id from the insert result
        if (
          resultParentCompany?.data?.insert_ParentCompanyMapping?.returning &&
          resultParentCompany.data.insert_ParentCompanyMapping.returning
            .length > 0
        ) {
          reviewerParentCompanyId =
            resultParentCompany.data.insert_ParentCompanyMapping.returning[0]
              .Id;
        }
      }

      if (!reviewerUser) {
        setErrorMessage("Failed to create or find reviewer user.");
        setIsLoading(false);
        return;
      }

      // Build ReviewerDetails
      const isNewReviewer = !reviewerExists;
      const reviewerDetails: ReviewerDetails = {
        id: reviewerUser.id,
        name: userName.trim(),
        email: encryptedEmail,
        isNewReviewer: isNewReviewer,
      };

      // Update FormInvitation with reviewer details
      await updateFormInvitation({
        variables: {
          invitationId: invitationId,
          set: {
            reviewerDetails: reviewerDetails as any,
            reviewerParentCompanyId: reviewerParentCompanyId,
          },
        },
      });

      console.log("Assign reviewer successful:", {
        userName,
        email,
        reviewerDetails,
      });

      // Send email to reviewer if needed
      if (reviewerDetails && reviewerDetails.email) {
        try {
          const emailType = reviewerDetails.isNewReviewer
            ? "ReviewerReportingFormInvitation"
            : "ExistingReviewerReportingFormInvitation";

          await fetch("/api/Reviewer-email-invitation", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              id: invitationId,
              type: emailType,
              companyId: userSession?.company?.id,
              formId: formId,
              NewUser: reviewerDetails.isNewReviewer,
              platformId: userSession?.platform?.id,
            }),
          });
        } catch (error) {
          console.error("Failed to send reviewer email:", error);
          // Continue without throwing - email is optional
        }
      }

      setIsLoading(false);
      postParentMessage(warpAssignReviewer(false));
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      setErrorMessage("An error occurred while assigning the reviewer.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    postParentMessage(warpAssignReviewer(false));
  };

  return (
    <>
    <Global styles={{ html: { overflow: 'hidden' } }} />
    <Box h={"100%"} className="assign-reviewer-popup" py={10} px={0}>
      <Spinner visible={isLoading} />
      <>
        {/* <Title size={18} mb={10} weight={600} color="#162F4B">
          Assign Reviewer
        </Title> */}

        <Text size={14} color="#444444" mb={8}>
          Choose a reviewer responsible for reviewing and approving the
          questions.
        </Text>

        <Grid m={0} p={0}>
          <Grid.Col span={6} px={0}>
            <MultiSelect
              data={filterReviewerNameList.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              maxDropdownHeight={60}
              withinPortal
              styles={(theme) => ({                
                item: {
                  color: "#666666",
                  "&[data-selected]": {
                    background:
                      "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                    color: "white",
                  },
                  "&:hover": {
                    background:
                      "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                    color: "white",
                  },
                },
              })}
              placeholder="Enter Name*"
              searchable
              creatable
              value={
                isNewReviewerAdded === true
                  ? tempNewReviewer
                    ? [tempNewReviewer?.id]
                    : []
                  : filterReviewerNameList.find((u) => u.name === userName)
                  ? [
                      filterReviewerNameList.find((u) => u.name === userName)!
                        .id,
                    ]
                  : []
              }
              getCreateLabel={(query) => `+ Create "${query}"`}
              onSearchChange={(searchValue) => {
                // Clear error message when user starts typing
                if (searchValue) {
                  setErrorMessage("");
                }
              }}
              onCreate={(query) => {
                const nameRegex = /^[A-Za-z\s]+$/;
                if (!nameRegex.test(query)) {
                  setErrorMessage("Full Name must contain only alphabets");
                  return null;
                }

                const newItem = {
                  id: `new-reviewer-${Date.now()}`,
                  name: query,
                  email: "",
                };
                setFilterReviewerNameList((prev) => [...prev, newItem]);

                setTimeout(() => {
                  setUserName(newItem.name);
                  setEmail("");
                  setErrorMessage("");
                  setIsNewReviewerAdded(true);
                  setTempNewReviewer(newItem);
                }, 0);

                return { value: newItem.id, label: query };
              }}
              onChange={(value) => {
                setErrorMessage("");

                if (!value || value.length === 0) {
                  setIsNewReviewerAdded(false);
                  setTempNewReviewer(null);
                  setUserName("");
                  setEmail("");
                  return;
                }

                const selectedReviewer = filterReviewerNameList.find(
                  (u) => u.id === value[0],
                );

                if (selectedReviewer) {
                  const nameRegex = /^[A-Za-z\s]+$/;
                  if (!nameRegex.test(selectedReviewer.name)) {
                    setUserName(selectedReviewer.name);
                    setErrorMessage("Full Name must contain only alphabets");
                  } else {
                    setIsNewReviewerAdded(false);
                    setTempNewReviewer(null);
                    setUserName(selectedReviewer.name);
                    setEmail(selectedReviewer.email);
                    setErrorMessage("");
                  }
                } else {
                  setUserName("");
                  setEmail("");
                }
              }}
              maxSelectedValues={1}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={6} pr={0}>
            <TextInput
              placeholder="Enter Email ID*"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={isLoading}
            />
          </Grid.Col>
        </Grid>

        {errorMessage && (
          <Text size={12} color="red" mb={10}>
            {errorMessage}
          </Text>
        )}

        <Flex mt={20} gap={10}>
          <Button
            onClick={handleAssign}
            color={"solidBtn"}
            disabled={isLoading}
          >
            {page === "listingpage" ? "ASSIGN & START" : "ASSIGN"}
          </Button>
          <Button
            color="outlineBtn"
            onClick={() => {
              if   (page === "listingpage") {postParentMessage(
        startInvitationMessage(
          invitationId,
          AssessmentFormName,
          CompanyName,
          AIStatus,
          invitationStatus,
          AIBulkDocumentProcessings,
          Sources,
        ),
      );
              } else {
                postParentMessage(warpAssignReviewer(false, { isSkip: true }));
              }
            }}
            disabled={isLoading}
          >
            {page === "listingpage" ? "SKIP & START ASSESSMENT" : "SKIP"}
          </Button>
          {/* {page === "listingpage" ? null : (
            <Button
              color="outlineBtn"
              onClick={handleCancel}
              disabled={isLoading}
            >
              CANCEL
            </Button>
          )} */}
        </Flex>
      </>
    </Box>
    </>
  );
};

export default AssignReviewerPopup;
