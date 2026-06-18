import { ActionIcon, Box, Pagination, Text, Tooltip } from "@mantine/core";
import { IconCaretDown, IconCaretUp } from "@tabler/icons";
import IconSortUpDown from "@warp/client/components/svgIcons/IconSortUpDown";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import { useGetAssignedQuestionDetailsByInvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-assigned-question-details-by-invitation-id";
import { useGetFomfieldHirarchyNameByInvitationidQuery } from "@warp/graphql/queries/generated/get-fomfield-hirarchyname-by-invitation-id";
import { AppRoles } from "@warp/shared/constants/app.constants";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStyles } from "./DeviationReportPopup";

const QuestionnaireReportPopUp = () => {
  const { query } = useRouter();
  const { classes } = useStyles();
  const [questionsDetail, setQuestionsDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionSort, setquestionSort] = useState("");
  const [assignedOnSort, setassignedOnSort] = useState("");
  const [respondedOnSort, setRespondedOnSort] = useState("");
  const [userSort, setuserSort] = useState("");
  const [statusSort, setstatusSort] = useState("");
  const [reportdata, setreportdata] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const userSession = useUserSession();
  const invitationId = (query?.invitationId || query?.invitationid) as string;

  const getAssignedQuestionDetail =
    useGetAssignedQuestionDetailsByInvitationIdLazyQuery()[0];
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (invitationId) {
        const questionsdata: any = await getAssignedQuestionDetail({
          variables: { invitationId: invitationId },
        })
          .then((res) => res?.data?.AssesseeUserMapping || [])
          .catch((err) => {
            console.log({ err });
          });

        let data: any = [...questionsdata];
        data?.sort((a: any, b: any) =>
          a?.FormField?.field > b?.FormField?.field ? 1 : -1
        );

        // filter data for responder role, responder should see only their data.
        if (userSession?.user?.role === AppRoles.Responder) {
          data = data.filter(
            (item: any) => item.userByUserid?.id === userSession?.user?.id
          );
        }
        setreportdata(data.slice());
        setQuestionsDetail(data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [
    invitationId,
    getAssignedQuestionDetail,
    userSession?.user?.role,
    userSession?.user?.id,
  ]);

  let hirarchydata: any = "";
  let hirarchylevel: any = "";
  const formDetails = useGetFomfieldHirarchyNameByInvitationidQuery({
    variables: { invitationId: invitationId },
    skip: !invitationId,
  });
  hirarchydata = formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
    (c: any) => c.interface === "group-wizard"
    //c.field === "formWizard2"
  );

  hirarchylevel =
    hirarchydata !== undefined && hirarchydata !== null
      ? hirarchydata[0]?.interfaceOptions?.hierarchyLevel
      : "";

  const sorttabledata = (columnname: string) => {
    let data = reportdata.slice();
    switch (columnname) {
      case "username":
        setquestionSort("");
        setassignedOnSort("");
        setRespondedOnSort("");
        setstatusSort("");
        if (userSort == "") {
          setuserSort("asc");
          questionsDetail.sort((a: any, b: any) =>
            String(
              a?.updated_by === a?.User?.id
                ? a?.User?.name
                : a?.userByUserid?.name
            ).toLowerCase() <
            String(
              b?.updated_by === b?.User?.id
                ? b?.User?.name
                : b?.userByUserid?.name
            ).toLowerCase()
              ? -1
              : 1
          );
        } else {
          if (userSort == "asc") {
            questionsDetail.sort((a: any, b: any) =>
              String(
                a?.updated_by === a?.User?.id
                  ? a?.User?.name
                  : a?.userByUserid?.name
              ).toLowerCase() >
              String(
                b?.updated_by === b?.User?.id
                  ? b?.User?.name
                  : b?.userByUserid?.name
              ).toLowerCase()
                ? -1
                : 1
            );
            setuserSort("desc");
          } else {
            setuserSort("");
            setQuestionsDetail(data);
          }
        }
        break;
      case "question":
        setassignedOnSort("");
        setRespondedOnSort("");
        setuserSort("");
        setstatusSort("");
        if (questionSort == "") {
          setquestionSort("asc");
          questionsDetail.sort(function (a: any, b: any) {
            const aNums = a?.Question?.key.match(/\d+/g).map(Number);
            const bNums = b?.Question?.key.match(/\d+/g).map(Number);
            const maxLength = Math.max(aNums.length, bNums.length);
            for (let i = 0; i < maxLength; i++) {
              if (aNums[i] !== bNums[i]) {
                return aNums[i] - bNums[i]; // sort by number value
              }
            }
            return a?.Question?.key.localeCompare(b?.Question?.key); // if numbers are equal, sort alphabetically
          })[0];
        } else {
          if (questionSort == "asc") {
            questionsDetail.sort(function (a: any, b: any) {
              const aNums = a?.Question?.key.match(/\d+/g).map(Number);
              const bNums = b?.Question?.key.match(/\d+/g).map(Number);
              const maxLength = Math.max(aNums.length, bNums.length);
              for (let i = 0; i < maxLength; i++) {
                if (aNums[i] !== bNums[i]) {
                  return bNums[i] - aNums[i]; // sort by number value
                }
              }
              return a?.Question?.key.localeCompare(b?.Question?.key); // if numbers are equal, sort alphabetically
            })[0];
            setquestionSort("desc");
          } else {
            setquestionSort("");
            setQuestionsDetail(data);
          }
        }
        break;
      case "assignedon":
        setquestionSort("");
        setuserSort("");
        setstatusSort("");
        setRespondedOnSort("");
        if (assignedOnSort == "") {
          setassignedOnSort("asc");
          questionsDetail.sort((a: any, b: any) =>
            a?.created_at < b?.created_at ? -1 : 1
          );
        } else {
          if (assignedOnSort == "asc") {
            questionsDetail.sort((a: any, b: any) =>
              a?.created_at > b?.created_at ? -1 : 1
            );
            setassignedOnSort("desc");
          } else {
            setassignedOnSort("");
            setQuestionsDetail(data);
          }
        }
        break;
      case "respondedon":
        setquestionSort("");
        setuserSort("");
        setstatusSort("");
        setassignedOnSort("");
        if (respondedOnSort == "") {
          setRespondedOnSort("asc");
          questionsDetail.sort((a: any, b: any) =>
            a?.created_at < b?.created_at ? -1 : 1
          );
        } else {
          if (respondedOnSort == "asc") {
            questionsDetail.sort((a: any, b: any) =>
              a?.created_at > b?.created_at ? -1 : 1
            );
            setRespondedOnSort("desc");
          } else {
            setRespondedOnSort("");
            setQuestionsDetail(data);
          }
        }
        break;
      case "staus":
        setquestionSort("");
        setassignedOnSort("");
        setRespondedOnSort("");
        setuserSort("");
        if (statusSort == "") {
          setstatusSort("asc");
          questionsDetail.sort((a: any, b: any) =>
            String(a?.Status).toLowerCase() < String(b?.Status).toLowerCase()
              ? -1
              : 1
          );
        } else {
          if (statusSort == "asc") {
            questionsDetail.sort((a: any, b: any) =>
              String(a?.Status).toLowerCase() > String(b?.Status).toLowerCase()
                ? -1
                : 1
            );
            setstatusSort("desc");
          } else {
            setstatusSort("");
            setQuestionsDetail(data);
          }
        }
        break;
    }
  };

  const paginatedData = questionsDetail.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  interface Form {
    name?: string;
  }

  interface Section {
    content?: string;
    ParentSection?: {
      content?: string;
    };
  }

  interface Question {
    Section?: Section;
    FormFields?: { interfaceOptions?: { title?: string } }[];
  }

  interface RecordType {
    Form?: Form;
    Question?: Question;
  }

  const getTooltipLabel = (
    rec: RecordType,
    hirarchylevel: boolean | string | number,
    title: { interfaceOptions?: { title?: string } }[] | undefined
  ): string => {
    const formName = rec?.Form?.name || "";
    const parentSection = rec?.Question?.Section?.ParentSection?.content || "";
    const sectionContent = rec?.Question?.Section?.content || "";
    const interfaceTitle = title?.[0]?.interfaceOptions?.title || "";

    let sectionText = hirarchylevel
      ? parentSection || sectionContent
      : parentSection
      ? `${parentSection} - ${sectionContent}`
      : sectionContent;

    return `${formName} - ${sectionText} - ${interfaceTitle}`;
  };

  return (
    <Box>
      {isLoading ? (
        <Spinner visible={isLoading} />
      ) : paginatedData.length > 0 ? (
        <>
          <table className="questionnaireReportTable">
            <thead className="th-cusotimze">
              <tr>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    Question No.
                    <ActionIcon onClick={() => sorttabledata("question")}>
                      {questionSort == "" ? (
                        <IconSortUpDown
                          style={{ width: "18px" }}
                          color="#fff"
                        />
                      ) : questionSort == "asc" ? (
                        <IconCaretUp size={18} />
                      ) : (
                        <IconCaretDown size={18} />
                      )}
                    </ActionIcon>
                  </div>
                </td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    Last Updated By
                    <ActionIcon onClick={() => sorttabledata("username")}>
                      {userSort == "" ? (
                        <IconSortUpDown
                          style={{ width: "18px" }}
                          color="#fff"
                        />
                      ) : userSort == "asc" ? (
                        <IconCaretUp size={18} />
                      ) : (
                        <IconCaretDown size={18} />
                      )}
                    </ActionIcon>
                  </div>
                </td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    Assigned On
                    <ActionIcon onClick={() => sorttabledata("assignedon")}>
                      {assignedOnSort == "" ? (
                        <IconSortUpDown
                          style={{ width: "18px" }}
                          color="#fff"
                        />
                      ) : assignedOnSort == "asc" ? (
                        <IconCaretUp size={18} />
                      ) : (
                        <IconCaretDown size={18} />
                      )}
                    </ActionIcon>
                  </div>
                </td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    Responded On
                    <ActionIcon onClick={() => sorttabledata("respondedon")}>
                      {respondedOnSort == "" ? (
                        <IconSortUpDown
                          style={{ width: "18px" }}
                          color="#fff"
                        />
                      ) : respondedOnSort == "asc" ? (
                        <IconCaretUp size={18} />
                      ) : (
                        <IconCaretDown size={18} />
                      )}
                    </ActionIcon>
                  </div>
                </td>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    Status
                    <ActionIcon onClick={() => sorttabledata("staus")}>
                      {statusSort == "" ? (
                        <IconSortUpDown
                          style={{ width: "18px" }}
                          color="#fff"
                        />
                      ) : statusSort == "asc" ? (
                        <IconCaretUp size={18} />
                      ) : (
                        <IconCaretDown size={18} />
                      )}
                    </ActionIcon>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              {!!paginatedData.length ? (
                paginatedData.map((rec: any, index: number) => {
                  let questiondatarow: any = "";
                  let subthemeConditional: String = "";
                  questiondatarow = rec?.Question?.FormFields.filter(
                    (c: any) =>
                      c.interface === "group-detail" &&
                      c.subtheme !== null &&
                      c.subtheme !== undefined
                  );

                  if (
                    questiondatarow[0]?.subtheme != null &&
                    questiondatarow[0]?.subtheme != undefined &&
                    questiondatarow[0]?.subtheme != ""
                  ) {
                    subthemeConditional = " - " + questiondatarow[0]?.subtheme;
                  }
                  let title = rec?.Question?.FormFields?.filter((rec: any) => {
                    if (!!rec?.interfaceOptions?.title) return rec;
                  })?.map((data: any) => {
                    return data;
                  });

                  return (
                    <tr key={index}>
                      <td>
                        <Tooltip
                          label={getTooltipLabel(rec, hirarchylevel, title)}
                          position="bottom-start"
                          multiline
                          width={270}
                          fw={400}
                          offset={0}
                        >
                          <Text
                            c="#444444"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              width: "270px",
                            }}
                          >
                            {getTooltipLabel(rec, hirarchylevel, title)}
                          </Text>
                          {/* {rec?.Form?.name} -{" "}
                      {hirarchylevel !== undefined &&
                      hirarchylevel !== null &&
                      hirarchylevel !== ""
                        ? !!rec?.Question?.Section?.ParentSection
                          ? rec?.Question?.Section?.ParentSection?.content //+
                          : //` - ` +
                            //   rec?.Question?.Section?.content +
                            ///  subthemeConditional
                            rec?.Question?.Section?.content
                        : !!rec?.Question?.Section?.ParentSection
                        ? rec?.Question?.Section?.ParentSection?.content +
                          ` - ` +
                          rec?.Question?.Section?.content
                        : rec?.Question?.Section?.content}{" "}
                      - {!!title && title[0]?.interfaceOptions?.title} */}
                        </Tooltip>
                      </td>
                      <td>
                        {rec.updated_by === rec.User?.id
                          ? rec?.User?.name
                          : rec?.userByUserid?.name}
                      </td>
                      <td>
                        {dayjs(rec?.created_at).format("DD MMM, YYYY hh:mm A")}
                      </td>
                      <td>
                        {dayjs(rec?.updated_at).format("DD MMM, YYYY hh:mm A")}
                      </td>
                      <td>
                        {rec?.Status === "Responded" ? (
                          <span className="statusResponded">Responded</span>
                        ) : (
                          <span className="statusPending">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No Data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            pt={10}
            classNames={{ item: classes.paginationItem }}
            total={Math.ceil(questionsDetail.length / itemsPerPage)}
            page={page}
            onChange={setPage}
          />
        </>
      ) : (
        <Box style={{ textAlign: "center", padding: "20px" }}>
          <Text>Data not found</Text>
        </Box>
      )}
    </Box>
  );
};
export default QuestionnaireReportPopUp;
