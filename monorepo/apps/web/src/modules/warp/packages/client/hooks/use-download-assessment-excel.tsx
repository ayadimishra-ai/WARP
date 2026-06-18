import { useGetsubmittedformtodownloadexcelLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-submitted-form-to-download-excel";
import dayjs from "dayjs";
import { useState } from "react";
import * as XLSX from "xlsx";
let calculatedvalue: any = -1;
let dataArray: any = [];
let removeFormFields: any = [];
let dynamiccolumns: any = [];
let hyperlinkarray: any = [];
// const setMultipleDropDownValues = async (
//debugger
//   indexing: number,
//   questionArray: any,
//   formFieldId: any,
//   field: any
// ) => {
//   if (
//     questionArray?.Answers?.filter((z: any) => z.formFieldId == formFieldId)[0]
//       ?.data?.value[0]?._id == undefined
//   ) {
//     dataArray[indexing].Response = questionArray?.Answers?.filter(
//       (z: any) => z.formFieldId == formFieldId
//     )[0]?.data?.value.join(",");
//   } else {
//     let optionvalue = questionArray?.Answers?.filter(
//       (z: any) => z.formFieldId == formFieldId
//     )[0]?.data?.value;

//     let formFieldsData = questionArray?.FormFields?.filter(
//       (z: any) => z.id == formFieldId
//     )[0];

//     let tablefields = questionArray?.FormFields.filter(
//       (q: any) => q.groupField == field
//     );
//     // let fileddata = formFieldsData?.autoCalculatedCalculation;
//     optionvalue?.map((valueitem: any, valueindexing: number) => {
//       if (valueindexing == 0) {
//         dataArray[indexing].Response = valueitem.value;
//       } else {
//         dataArray[indexing][dynamiccolumns[valueindexing - 1]] =
//           valueitem.value;
//         if (valueindexing == parseInt(optionvalue.length) - 1) {
//           if (formFieldsData?.autoCalculatedCalculation != null) {
//             dataArray[indexing][dynamiccolumns[valueindexing]] =
//               formFieldsData?.autoCalculatedCalculation?.filter(
//                 (s: any) => s.rule == tablefields[0]?.field
//               )[0]?.fieldName;
//           }
//         }
//       }
//     });
//     let dataarraydata = dataArray[dataArray.length - 1];

//     tablefields.map((tableitem: any) => {
//       removeFormFields.push(tableitem.field);
//       dataArray.push({
//         Section: dataarraydata.Section,
//         Theme: dataarraydata.Theme,
//         SubTheme: dataarraydata.SubTheme,
//         Question: tableitem.fieldOptions?.label,
//         Response: null,
//       });
//       let lastdata = dataArray.length - 1;
//       optionvalue?.map((valueitem: any, valueindexing: number) => {
//         if (valueindexing == 0) {
//           dataArray[lastdata].Response = valueitem[tableitem.field]?.value;
//         } else {
//           dataArray[lastdata][dynamiccolumns[valueindexing - 1]] =
//             valueitem[tableitem.field]?.value;
//           if (formFieldsData?.autoCalculatedCalculation != null) {
//             dataArray[lastdata][dynamiccolumns[valueindexing]] =
//               optionvalue?.reduce(
//                 (a: any, b: any) =>
//                   (a = a + parseFloat(b[tableitem?.field]?.value)),
//                 0
//               );
//           }
//         }
//       });
//     });
//   }
// };
// const getautocalculatedfield = async (
//   calculationrule: any,
//   formFields: any,
//   Answers: any
// ) => {
//   let splitarray: any = calculationrule.toString().split(" ");
//   let rawrules: any = calculationrule;
//   splitarray.map((items: any) => {
//     if (items.includes(".value")) {
//       let formfieldid = formFields?.filter(
//         (x: any) => x.field == items.toString().split(".value")[0]
//       )[0]?.id;
//       let formfieldvalue =
//         Answers?.filter((z: any) => z.formFieldId == formfieldid)[0]?.data
//           ?.value != undefined
//           ? Answers?.filter((z: any) => z.formFieldId == formfieldid)[0]?.data
//               ?.value
//           : 0;
//       rawrules = rawrules.toString().replace(items, String(formfieldvalue));
//     }
//   });
//   calculatedvalue = eval(rawrules);
// };
export const useDownloadAssessmentExcel = () => {
  const refetch = useGetsubmittedformtodownloadexcelLazyQuery()[0];
  const [load, setLoading] = useState(false);

  const generateAndDownloadExcel = async (
    invitationId: string,
    submissionId: string,
    questionaryName: string
  ) => {
    try {
      if (load) return;
      setLoading(true);
      const { data, error } = await refetch({
        variables: { invitationId, submissionId },
      });
      if (!!error) {
        console.error({ error });
      } else if (!!data?.FormSubmission.length) {
        // await generateExcelDocument(data?.FormSubmission, questionaryName);
        let documentData = data?.FormSubmission;
        let maxcolumns: number = 0;
        dataArray = [];
        removeFormFields = [];
        dynamiccolumns = [];
        hyperlinkarray = [];
        await documentData[0]?.FormInvitation?.Form?.Sections.filter(
          (x: any) => x.Questions.length > 0
        ).map((item: any) => {
          item.Questions.map((x: any) => {
            x?.FormFields?.map((items: any) => {
              if (
                items.interface == "select-multiple-dropdown" &&
                x?.Answers?.filter((z: any) => z.formFieldId == items.id)[0]
                  ?.data?.value[0]?._id != undefined
              ) {
                if (
                  x?.Answers?.filter((z: any) => z.formFieldId == items.id)[0]
                    ?.data?.value.length > maxcolumns
                ) {
                  maxcolumns = x?.Answers?.filter(
                    (z: any) => z.formFieldId == items.id
                  )[0]?.data?.value.length;
                }
                let fileddata = x?.FormFields?.filter(
                  (z: any) => z.id == items.id
                )[0]?.autoCalculatedCalculation;
                if (fileddata != null) {
                  maxcolumns = maxcolumns + 1;
                }
              }
            });
          });
        });
        for (let index = 0; index < maxcolumns - 1; index++) {
          dynamiccolumns.push("Response " + (index + 1).toString());
        }
        documentData[0]?.FormInvitation?.Form?.Sections.filter(
          (x: any) => x.Questions.length > 0
        ).map((item: any) => {
          let questionSortedarrays = [...item.Questions].sort(function (
            a: any,
            b: any
          ) {
            const aNums = a.key.match(/\d+/g).map(Number);
            const bNums = b.key.match(/\d+/g).map(Number);
            const maxLength = Math.max(aNums.length, bNums.length);
            for (let i = 0; i < maxLength; i++) {
              if (aNums[i] !== bNums[i]) {
                return aNums[i] - bNums[i]; // sort by number value
              }
            }
            return a.key.localeCompare(b.key); // if numbers are equal, sort alphabetically
          });
          questionSortedarrays.map((x: any) => {
            // if (x?.Answers.length > 0) {
            if (x?.FormFields?.length > 0) {
              dataArray.push({
                Section:
                  item.ParentSection?.ParentSection?.content != undefined
                    ? item.ParentSection?.ParentSection?.content
                    : item.ParentSection?.content != undefined
                    ? item.ParentSection?.content
                    : item.content,
                Theme:
                  item.ParentSection?.ParentSection?.content != undefined
                    ? item.ParentSection?.content
                    : item.ParentSection?.content != undefined
                    ? item.content
                    : "",
                SubTheme:
                  item.ParentSection?.ParentSection?.content != undefined
                    ? item.content
                    : x?.subtheme,
                Question: x?.content,
                Response: null,
              });
              let fields = x?.FormFields.filter(
                (q: any) =>
                  String(q.fieldOptions?.label).trim() ==
                    String(x?.content).trim() && q.interface === "group-detail"
              )[0]?.field;
              let groupfields = x?.FormFields.filter(
                (q: any) =>
                  String(q.fieldOptions?.label).trim() ==
                    String(x?.content).trim() && q.interface === "group-detail"
              )[0]?.groupField;
              if (groupfields == undefined) {
                groupfields = x?.FormFields.filter(
                  (q: any) =>
                    q.interface === "group-detail" &&
                    q.groupField.includes("_tabs")
                )[0]?.groupField;
              } else {
                if (!String(groupfields).includes("_tabs")) {
                  groupfields = x?.FormFields.filter(
                    (q: any) =>
                      q.interface === "group-detail" &&
                      q.groupField.includes("_tabs")
                  )[0]?.groupField;
                }
              }
              let sortedarrays = [...x?.FormFields].sort(function (
                a: any,
                b: any
              ) {
                const aNums = a.field.match(/\d+/g).map(Number);
                const bNums = b.field.match(/\d+/g).map(Number);
                const maxLength = Math.max(aNums.length, bNums.length);
                for (let i = 0; i < maxLength; i++) {
                  if (aNums[i] !== bNums[i]) {
                    return aNums[i] - bNums[i]; // sort by number value
                  }
                }
                return a.field.localeCompare(b.field); // if numbers are equal, sort alphabetically
              });
              sortedarrays?.map(async (items: any) => {
                if (
                  items?.interface == "group-detail" &&
                  (items?.fieldOptions?.label == undefined ||
                    items?.fieldOptions?.label == "" ||
                    items?.fieldOptions?.label == null)
                ) {
                } else {
                  if (
                    removeFormFields.filter(
                      (rfields: any) => rfields == items.field
                    ).length == 0
                  ) {
                    let sectionname = "";
                    if (
                      String(
                        documentData[0]?.FormInvitation?.Form?.name
                      ).toLowerCase() == "brsr questionnaire"
                    ) {
                      let firstladder =
                        documentData[0]?.FormInvitation?.Form?.FormFields?.filter(
                          (c: any) => c.field == String(groupfields).trim()
                        );
                      sectionname = String(
                        documentData[0]?.FormInvitation?.Form?.FormFields?.filter(
                          (c: any) =>
                            c.field == String(firstladder[0]?.groupField).trim()
                        )[0]?.interfaceOptions?.title
                      ).trim();
                    } else {
                      sectionname =
                        item.ParentSection?.ParentSection?.content != undefined
                          ? item.ParentSection?.ParentSection?.content
                          : item.ParentSection?.content != undefined
                          ? item.ParentSection?.content
                          : item.content;
                    }
                    let lastdataindex = dataArray?.length - 1;
                    dataArray[lastdataindex].Section = sectionname;
                    if (
                      String(x?.content).trim() !==
                      String(items.fieldOptions?.label).trim()
                    ) {
                      if (
                        (items.fieldOptions?.label == "" ||
                          items.fieldOptions?.label == undefined ||
                          items.fieldOptions?.label == null) &&
                        items.groupField == String(fields).trim()
                      ) {
                        let indexing = dataArray.findIndex(
                          (a: any) => a.Question === x?.content
                        );
                        dataArray[indexing].Section = sectionname;
                        if (items.interface == "select-multiple-dropdown") {
                          // await setMultipleDropDownValues(
                          //   indexing,
                          //   x,
                          //   items.id,
                          //   items.field
                          // );
                          //micromethod setMultipleDropDownValues code writing here coz not executing online but (R&D for future) starts
                          let questionArray: any = x;
                          let formFieldId: any = items.id;
                          let field: any = items.field;
                          if (
                            questionArray?.Answers?.filter(
                              (z: any) => z.formFieldId == formFieldId
                            )[0]?.data?.value[0]?._id == undefined
                          ) {
                            dataArray[indexing].Section = sectionname;
                            dataArray[indexing].Response =
                              questionArray?.Answers?.filter(
                                (z: any) => z.formFieldId == formFieldId
                              )[0]?.data?.value.join(", ");
                          } else {
                            let optionvalue = questionArray?.Answers?.filter(
                              (z: any) => z.formFieldId == formFieldId
                            )[0]?.data?.value;

                            let formFieldsData =
                              questionArray?.FormFields?.filter(
                                (z: any) => z.id == formFieldId
                              )[0];

                            let tablefields = questionArray?.FormFields.filter(
                              (q: any) => q.groupField == field
                            );
                            // let fileddata = formFieldsData?.autoCalculatedCalculation;
                            optionvalue?.map(
                              (valueitem: any, valueindexing: number) => {
                                if (valueindexing == 0) {
                                  dataArray[indexing].Section = sectionname;
                                  dataArray[indexing].Response =
                                    valueitem.value;
                                } else {
                                  dataArray[indexing][
                                    dynamiccolumns[valueindexing - 1]
                                  ] = valueitem.value;
                                  if (
                                    valueindexing ==
                                    parseInt(optionvalue.length) - 1
                                  ) {
                                    if (
                                      formFieldsData?.autoCalculatedCalculation !=
                                      null
                                    ) {
                                      dataArray[indexing][
                                        dynamiccolumns[valueindexing]
                                      ] = formFieldsData?.autoCalculatedCalculation?.filter(
                                        (s: any) =>
                                          s.rule == tablefields[0]?.field
                                      )[0]?.fieldName;
                                    }
                                  }
                                }
                              }
                            );
                            let dataarraydata = dataArray[dataArray.length - 1];

                            tablefields.map((tableitem: any) => {
                              removeFormFields.push(tableitem.field);
                              dataArray.push({
                                Section: sectionname,
                                Theme: dataarraydata.Theme,
                                SubTheme: dataarraydata.SubTheme,
                                Question: tableitem.fieldOptions?.label,
                                Response: null,
                              });
                              let lastdata = dataArray.length - 1;
                              optionvalue?.map(
                                (valueitem: any, valueindexing: number) => {
                                  if (valueindexing == 0) {
                                    dataArray[lastdata].Section = sectionname;
                                    if (
                                      tableitem.interface ==
                                      "select-multiple-dropdown"
                                    ) {
                                      dataArray[lastdata].Response =
                                        valueitem[tableitem.field]?.value.join(
                                          ", "
                                        );
                                    } else if (
                                      tableitem.interface == "datetime"
                                    ) {
                                      dataArray[lastdata].Response = dayjs(
                                        valueitem[tableitem.field]?.value
                                      ).format("DD MMM, YYYY");
                                    } else if (
                                      tableitem.interface == "select-radio"
                                    ) {
                                      let answerResponse =
                                        valueitem[tableitem.field]?.value;
                                      if (
                                        String(answerResponse).toLowerCase() ==
                                        "na"
                                      ) {
                                        dataArray[lastdata].Response =
                                          String(answerResponse).toUpperCase();
                                      } else {
                                        dataArray[lastdata].Response =
                                          answerResponse != undefined
                                            ? String(answerResponse)
                                                .substring(0, 1)
                                                .toUpperCase() +
                                              String(answerResponse).substring(
                                                1,
                                                String(answerResponse).length
                                              )
                                            : "";
                                      }
                                    } else if (tableitem.interface == "file") {
                                      let finalvalue: string = "";
                                      valueitem[tableitem.field]?.value?.map(
                                        (finalvaluemapping: any) => {
                                          finalvalue =
                                            finalvalue +
                                            finalvaluemapping?.path +
                                            ", ";
                                        }
                                      );
                                      finalvalue = finalvalue.substring(
                                        0,
                                        finalvalue.length - 2
                                      );
                                      dataArray[lastdata].Response = finalvalue;
                                    } else {
                                      dataArray[lastdata].Response =
                                        valueitem[tableitem.field]?.value;
                                    }
                                  } else {
                                    if (
                                      tableitem.interface ==
                                      "select-multiple-dropdown"
                                    ) {
                                      dataArray[lastdata][
                                        dynamiccolumns[valueindexing - 1]
                                      ] =
                                        valueitem[tableitem.field]?.value.join(
                                          ", "
                                        );
                                    } else if (
                                      tableitem.interface == "datetime"
                                    ) {
                                      dataArray[lastdata][
                                        dynamiccolumns[valueindexing - 1]
                                      ] = dayjs(
                                        valueitem[tableitem.field]?.value
                                      ).format("DD MMM, YYYY");
                                    } else if (
                                      tableitem.interface == "select-radio"
                                    ) {
                                      let answerResponse =
                                        valueitem[tableitem.field]?.value;
                                      if (
                                        String(answerResponse).toLowerCase() ==
                                        "na"
                                      ) {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] =
                                          String(answerResponse).toUpperCase();
                                      } else {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] =
                                          answerResponse != undefined
                                            ? String(answerResponse)
                                                .substring(0, 1)
                                                .toUpperCase() +
                                              String(answerResponse).substring(
                                                1,
                                                String(answerResponse).length
                                              )
                                            : "";
                                      }
                                    } else if (tableitem.interface == "file") {
                                      let finalvalue: string = "";
                                      valueitem[tableitem.field]?.value?.map(
                                        (finalvaluemapping: any) => {
                                          finalvalue =
                                            finalvalue +
                                            finalvaluemapping?.path +
                                            ", ";
                                        }
                                      );
                                      finalvalue = finalvalue.substring(
                                        0,
                                        finalvalue.length - 2
                                      );
                                      dataArray[lastdata][
                                        dynamiccolumns[valueindexing - 1]
                                      ] = finalvalue;
                                    } else {
                                      dataArray[lastdata][
                                        dynamiccolumns[valueindexing - 1]
                                      ] = valueitem[tableitem.field]?.value;
                                    }
                                    if (
                                      formFieldsData?.autoCalculatedCalculation !=
                                      null
                                    ) {
                                      dataArray[lastdata][
                                        dynamiccolumns[valueindexing]
                                      ] = optionvalue?.reduce(
                                        (a: any, b: any) =>
                                          (a =
                                            a +
                                            parseFloat(
                                              b[tableitem?.field]?.value
                                            )),
                                        0
                                      );
                                    }
                                  }
                                }
                              );
                            });
                          }
                          //micromethod setMultipleDropDownValues code writing here coz not executing online but (R&D for future) end
                        } else if (items.interface == "file") {
                          let finalvalue: string = "";
                          x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value.map((finalvaluemapping: any) => {
                            finalvalue =
                              finalvalue +
                              finalvaluemapping.value[0]?.path +
                              ", ";
                          });
                          finalvalue = finalvalue.substring(
                            0,
                            finalvalue.length - 2
                          );
                          dataArray[indexing].Response = finalvalue;
                          dataArray[indexing].Section = sectionname;
                          hyperlinkarray.push(indexing);
                        } else if (items.interface == "datetime") {
                          let timeans: any = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                          dataArray[indexing].Response =
                            dayjs(timeans).format("DD MMM, YYYY");
                          dataArray[indexing].Section = sectionname;
                        } else if (items.interface == "select-radio") {
                          let answerResponse: any = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                          if (String(answerResponse).toLowerCase() == "na") {
                            dataArray[indexing].Response =
                              String(answerResponse).toUpperCase();
                          } else {
                            dataArray[indexing].Response =
                              answerResponse != undefined
                                ? String(answerResponse)
                                    .substring(0, 1)
                                    .toUpperCase() +
                                  String(answerResponse).substring(
                                    1,
                                    String(answerResponse).length
                                  )
                                : "";
                          }
                          dataArray[indexing].Section = sectionname;
                        } else if (
                          items.interface == "select-multiple-checkbox"
                        ) {
                          dataArray[indexing].Response = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value.join(", ");
                          dataArray[indexing].Section = sectionname;
                        } else {
                          dataArray[indexing].Response = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                          dataArray[indexing].Section = sectionname;
                        }
                      } else {
                        if (
                          items.interface === "group-detail" &&
                          String(items.groupField).includes("_tabs")
                        ) {
                        } else {
                          dataArray.push({
                            Section: sectionname,
                            Theme:
                              item.ParentSection?.ParentSection?.content !=
                              undefined
                                ? item.ParentSection?.content
                                : item.ParentSection?.content != undefined
                                ? item.content
                                : "",
                            SubTheme:
                              item.ParentSection?.ParentSection?.content !=
                              undefined
                                ? item.content
                                : items.subtheme != null &&
                                  items.subtheme != "" &&
                                  items.subtheme != undefined
                                ? items.subtheme
                                : x?.subtheme,
                            Question: items.fieldOptions?.label,
                            Response: x?.Answers?.filter(
                              (z: any) => z.formFieldId == items.id
                            )[0]?.data?.value,
                          });
                          let indexing = dataArray.length - 1;
                          if (items.interface == "select-multiple-dropdown") {
                            // await setMultipleDropDownValues(
                            //   dataArray.length - 1,
                            //   x,
                            //   items.id,
                            //   items.field
                            // );
                            //micromethod setMultipleDropDownValues code writing here coz not executing online but (R&D for future) starts
                            let questionArray: any = x;
                            let formFieldId: any = items.id;
                            let field: any = items.field;
                            if (
                              questionArray?.Answers?.filter(
                                (z: any) => z.formFieldId == formFieldId
                              )[0]?.data?.value[0]?._id == undefined
                            ) {
                              dataArray[indexing].Response =
                                questionArray?.Answers?.filter(
                                  (z: any) => z.formFieldId == formFieldId
                                )[0]?.data?.value.join(", ");
                              dataArray[indexing].Section = sectionname;
                            } else {
                              let optionvalue = questionArray?.Answers?.filter(
                                (z: any) => z.formFieldId == formFieldId
                              )[0]?.data?.value;

                              let formFieldsData =
                                questionArray?.FormFields?.filter(
                                  (z: any) => z.id == formFieldId
                                )[0];

                              let tablefields =
                                questionArray?.FormFields.filter(
                                  (q: any) => q.groupField == field
                                );
                              // let fileddata = formFieldsData?.autoCalculatedCalculation;
                              optionvalue?.map(
                                (valueitem: any, valueindexing: number) => {
                                  if (valueindexing == 0) {
                                    dataArray[indexing].Response =
                                      valueitem.value;
                                    dataArray[indexing].Section = sectionname;
                                  } else {
                                    dataArray[indexing][
                                      dynamiccolumns[valueindexing - 1]
                                    ] = valueitem.value;
                                    if (
                                      valueindexing ==
                                      parseInt(optionvalue.length) - 1
                                    ) {
                                      if (
                                        formFieldsData?.autoCalculatedCalculation !=
                                        null
                                      ) {
                                        dataArray[indexing][
                                          dynamiccolumns[valueindexing]
                                        ] = formFieldsData?.autoCalculatedCalculation?.filter(
                                          (s: any) =>
                                            s.rule == tablefields[0]?.field
                                        )[0]?.fieldName;
                                      }
                                    }
                                  }
                                }
                              );
                              let dataarraydata =
                                dataArray[dataArray.length - 1];

                              tablefields.map((tableitem: any) => {
                                removeFormFields.push(tableitem.field);
                                dataArray.push({
                                  Section: dataarraydata.Section,
                                  Theme: dataarraydata.Theme,
                                  SubTheme: dataarraydata.SubTheme,
                                  Question: tableitem.fieldOptions?.label,
                                  Response: null,
                                });
                                let lastdata = dataArray.length - 1;
                                optionvalue?.map(
                                  (valueitem: any, valueindexing: number) => {
                                    if (valueindexing == 0) {
                                      if (
                                        tableitem.interface ==
                                        "select-multiple-dropdown"
                                      ) {
                                        dataArray[lastdata].Response =
                                          valueitem[
                                            tableitem.field
                                          ]?.value.join(", ");
                                      } else if (
                                        tableitem.interface == "datetime"
                                      ) {
                                        dataArray[lastdata].Response = dayjs(
                                          valueitem[tableitem.field]?.value
                                        ).format("DD MMM, YYYY");
                                      } else if (
                                        tableitem.interface == "select-radio"
                                      ) {
                                        let answerResponse =
                                          valueitem[tableitem.field]?.value;
                                        if (
                                          String(
                                            answerResponse
                                          ).toLowerCase() == "na"
                                        ) {
                                          dataArray[lastdata].Response =
                                            String(
                                              answerResponse
                                            ).toUpperCase();
                                        } else {
                                          dataArray[lastdata].Response =
                                            answerResponse != undefined
                                              ? String(answerResponse)
                                                  .substring(0, 1)
                                                  .toUpperCase() +
                                                String(
                                                  answerResponse
                                                ).substring(
                                                  1,
                                                  String(answerResponse).length
                                                )
                                              : "";
                                        }
                                      } else if (
                                        tableitem.interface == "file"
                                      ) {
                                        let finalvalue: string = "";
                                        valueitem[tableitem.field]?.value?.map(
                                          (finalvaluemapping: any) => {
                                            finalvalue =
                                              finalvalue +
                                              finalvaluemapping?.path +
                                              ", ";
                                          }
                                        );
                                        finalvalue = finalvalue.substring(
                                          0,
                                          finalvalue.length - 2
                                        );
                                        dataArray[lastdata].Response =
                                          finalvalue;
                                      } else {
                                        dataArray[lastdata].Response =
                                          valueitem[tableitem.field]?.value;
                                      }
                                      dataArray[lastdata].Section = sectionname;
                                    } else {
                                      if (
                                        tableitem.interface ==
                                        "select-multiple-dropdown"
                                      ) {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] =
                                          valueitem[
                                            tableitem.field
                                          ]?.value.join(", ");
                                      } else if (
                                        tableitem.interface == "datetime"
                                      ) {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] = dayjs(
                                          valueitem[tableitem.field]?.value
                                        ).format("DD MMM, YYYY");
                                      } else if (
                                        tableitem.interface == "select-radio"
                                      ) {
                                        let answerResponse =
                                          valueitem[tableitem.field]?.value;
                                        if (
                                          String(
                                            answerResponse
                                          ).toLowerCase() == "na"
                                        ) {
                                          dataArray[lastdata][
                                            dynamiccolumns[valueindexing - 1]
                                          ] =
                                            String(
                                              answerResponse
                                            ).toUpperCase();
                                        } else {
                                          dataArray[lastdata][
                                            dynamiccolumns[valueindexing - 1]
                                          ] =
                                            answerResponse != undefined
                                              ? String(answerResponse)
                                                  .substring(0, 1)
                                                  .toUpperCase() +
                                                String(
                                                  answerResponse
                                                ).substring(
                                                  1,
                                                  String(answerResponse).length
                                                )
                                              : "";
                                        }
                                      } else if (
                                        tableitem.interface == "file"
                                      ) {
                                        let finalvalue: string = "";
                                        valueitem[tableitem.field]?.value?.map(
                                          (finalvaluemapping: any) => {
                                            finalvalue =
                                              finalvalue +
                                              finalvaluemapping?.path +
                                              ", ";
                                          }
                                        );
                                        finalvalue = finalvalue.substring(
                                          0,
                                          finalvalue.length - 2
                                        );
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] = finalvalue;
                                      } else {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing - 1]
                                        ] = valueitem[tableitem.field]?.value;
                                      }
                                      if (
                                        formFieldsData?.autoCalculatedCalculation !=
                                        null
                                      ) {
                                        dataArray[lastdata][
                                          dynamiccolumns[valueindexing]
                                        ] = optionvalue?.reduce(
                                          (a: any, b: any) =>
                                            (a =
                                              a +
                                              parseFloat(
                                                b[tableitem?.field]?.value
                                              )),
                                          0
                                        );
                                      }
                                    }
                                  }
                                );
                              });
                            }
                            //micromethod setMultipleDropDownValues code writing here coz not executing online but (R&D for future) end
                          } else if (items.interface == "file") {
                            let finalvalue = "";
                            x?.Answers?.filter(
                              (z: any) => z.formFieldId == items.id
                            )[0]?.data?.value.map((finalvaluemapping: any) => {
                              finalvalue =
                                finalvalue +
                                finalvaluemapping.value[0]?.path +
                                ", ";
                            });
                            finalvalue = finalvalue.substring(
                              0,
                              finalvalue.length - 2
                            );
                            dataArray[indexing].Response = finalvalue;
                            dataArray[indexing].Section = sectionname;
                            hyperlinkarray.push(indexing);
                          } else if (items.interface == "datetime") {
                            let timeans: any = x?.Answers?.filter(
                              (z: any) => z.formFieldId == items.id
                            )[0]?.data?.value;
                            dataArray[indexing].Response =
                              dayjs(timeans).format("DD MMM, YYYY");
                            dataArray[indexing].Section = sectionname;
                          } else if (items.interface == "select-radio") {
                            let answerResponse: any = x?.Answers?.filter(
                              (z: any) => z.formFieldId == items.id
                            )[0]?.data?.value;
                            if (String(answerResponse).toLowerCase() == "na") {
                              dataArray[indexing].Response =
                                String(answerResponse).toUpperCase();
                            } else {
                              dataArray[indexing].Response =
                                answerResponse != undefined
                                  ? String(answerResponse)
                                      .substring(0, 1)
                                      .toUpperCase() +
                                    String(answerResponse).substring(
                                      1,
                                      String(answerResponse).length
                                    )
                                  : "";
                            }
                            dataArray[indexing].Section = sectionname;
                          } else if (
                            items.interface == "select-multiple-checkbox"
                          ) {
                            dataArray[indexing].Response = x?.Answers?.filter(
                              (z: any) => z.formFieldId == items.id
                            )[0]?.data?.value.join(", ");
                          }
                          if (
                            items.autoCalculatedCalculation != null &&
                            items.interface != "select-multiple-dropdown"
                          ) {
                            try {
                              items.autoCalculatedCalculation.map(
                                async (calculationitem: any) => {
                                  if (
                                    calculationitem?.rule != undefined &&
                                    calculationitem?.rule != ""
                                  ) {
                                    // await getautocalculatedfield(
                                    //   calculationitem?.rule,
                                    //   x?.FormFields,
                                    //   x?.Answers
                                    // );
                                    //micromethod getautocalculatedfield code writing here coz not executing online but (R&D for future) start
                                    let splitarray: any = calculationitem?.rule
                                      .toString()
                                      .split(" ");
                                    let rawrules: any = calculationitem?.rule;
                                    splitarray.map((items: any) => {
                                      if (items.includes(".value")) {
                                        let formfieldid = x?.FormFields?.filter(
                                          (x: any) =>
                                            x.field ==
                                            items.toString().split(".value")[0]
                                        )[0]?.id;
                                        let formfieldvalue =
                                          x?.Answers?.filter(
                                            (z: any) =>
                                              z.formFieldId == formfieldid
                                          )[0]?.data?.value != undefined
                                            ? x?.Answers?.filter(
                                                (z: any) =>
                                                  z.formFieldId == formfieldid
                                              )[0]?.data?.value
                                            : 0;
                                        rawrules = rawrules
                                          .toString()
                                          .replace(
                                            items,
                                            String(formfieldvalue)
                                          );
                                      }
                                    });
                                    calculatedvalue = eval(rawrules).toFixed(2);
                                    //micromethod getautocalculatedfield code writing here coz not executing online but (R&D for future) end
                                  }
                                  dataArray.push({
                                    Section: sectionname,
                                    Theme:
                                      item.ParentSection?.ParentSection
                                        ?.content != undefined
                                        ? item.ParentSection?.content
                                        : item.ParentSection?.content !=
                                          undefined
                                        ? item.content
                                        : "",
                                    SubTheme:
                                      item.ParentSection?.ParentSection
                                        ?.content != undefined
                                        ? item.content
                                        : items.subtheme != null &&
                                          items.subtheme != "" &&
                                          items.subtheme != undefined
                                        ? items.subtheme
                                        : x?.subtheme,
                                    Question: calculationitem?.fieldName,
                                    Response:
                                      calculationitem?.rule != undefined &&
                                      calculationitem?.rule != ""
                                        ? calculatedvalue
                                        : "",
                                  });
                                }
                              );
                            } catch (error) {
                              console.log(error);
                            }
                          }
                        }
                      }
                    } else {
                      let indexing = dataArray.findIndex(
                        (a: any) => a.Question === x?.content
                      );
                      let fieldAnswer = x?.Answers?.filter(
                        (z: any) => z.formFieldId == items.id
                      )[0]?.data?.value;
                      if (
                        fieldAnswer != undefined &&
                        fieldAnswer != null &&
                        fieldAnswer != ""
                      ) {
                        if (items.interface == "select-radio") {
                          let answerResponse = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                          if (String(answerResponse).toLowerCase() == "na") {
                            dataArray[indexing].Response =
                              String(answerResponse).toUpperCase();
                          } else {
                            dataArray[indexing].Response =
                              answerResponse != undefined
                                ? String(answerResponse)
                                    .substring(0, 1)
                                    .toUpperCase() +
                                  String(answerResponse).substring(
                                    1,
                                    String(answerResponse).length
                                  )
                                : "";
                          }
                        } else if (
                          items.interface == "select-multiple-checkbox"
                        ) {
                          dataArray[indexing].Response = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value.join(", ");
                          dataArray[indexing].Section = sectionname;
                        } else if (items.interface == "file") {
                          let finalvalue = "";
                          x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value.map((finalvaluemapping: any) => {
                            finalvalue =
                              finalvalue +
                              finalvaluemapping.value[0]?.path +
                              ", ";
                          });
                          finalvalue = finalvalue.substring(
                            0,
                            finalvalue.length - 2
                          );
                          dataArray[indexing].Response = finalvalue;
                          hyperlinkarray.push(indexing);
                        } else if (items.interface == "datetime") {
                          let timeans: any = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                          dataArray[indexing].Response =
                            dayjs(timeans).format("DD MMM, YYYY");
                        } else {
                          dataArray[indexing].Response = x?.Answers?.filter(
                            (z: any) => z.formFieldId == items.id
                          )[0]?.data?.value;
                        }
                      }
                    }
                  }
                }
              });
            }
            // }
          });
        });
        const sheetName = "Sheet1";
        const worksheet = XLSX.utils.json_to_sheet(dataArray);
        if (worksheet["!ref"] && typeof worksheet["!ref"] === "string") {
          const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
          for (let i = headerRange.s.c; i <= headerRange.e.c; i++) {
            const headerCell = XLSX.utils.encode_cell({
              r: headerRange.s.r,
              c: i,
            });
            worksheet[headerCell].s = { font: { bold: true } };
          }
        }
        worksheet["!cols"] = [
          { width: 20 },
          { width: 20 },
          { width: 20 },
          { width: 100 },
          { width: 50 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, questionaryName + ".xlsx");
      }
    } catch (error) {
      console.log("downloadexcel error", error);
    }

    setLoading(false);
  };

  return { generateAndDownloadExcel, load };
};
