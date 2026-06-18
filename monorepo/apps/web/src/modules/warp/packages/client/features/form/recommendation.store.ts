import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  RecommendationListActionsType,
  RecommendationListStateType,
} from "./types";

export const useRecommendationListStore = create(
  immer<RecommendationListStateType & RecommendationListActionsType>(
    (set, get) => ({
      questions: [],
      current: {
        question: "",
      },
      init: (questions: any) => {
        let _questionIds: any = questions.sort(function (a: any, b: any) {
          const aNums = a.questionKey.match(/\d+/g).map(Number);
          const bNums = b.questionKey.match(/\d+/g).map(Number);
          const maxLength = Math.max(aNums.length, bNums.length);
          for (let i = 0; i < maxLength; i++) {
            if (aNums[i] !== bNums[i]) {
              return aNums[i] - bNums[i]; // sort by number value
            }
          }
          return a.questionKey.localeCompare(b.questionKey); // if numbers are equal, sort alphabetically
        });
        let _uniqueQuestionIds: any = [];
        _questionIds.map((x: any) => {
          if (
            _uniqueQuestionIds.filter((y: any) => y.QuestionId === x.QuestionId)
              .length == 0
          ) {
            _uniqueQuestionIds.push({
              QuestionId: x.QuestionId,
              questionKey: x.questionKey,
            });
          }
        });
        set((store) => {
          if (store.questions.length < 1) store.questions = _uniqueQuestionIds;
          if (_questionIds?.length > 0)
            store.current.question = _uniqueQuestionIds[0]?.QuestionId;
        });
      },
      nextRecommHandler: (currentQuestionData: any) => {
        if (get().questions.length > 0) {
          let datass: any = get().questions?.filter(
            (d: any) => d.questionKey > currentQuestionData?.Question?.key
          );

          let [currentSection, currentSubSection, currentQuestionNumber] =
            currentQuestionData?.Question?.key
              .split(/[s_q]/)
              .filter(Boolean)
              .map(Number);

          datass = datass.filter((d: any) => {
            let [section, subSection, questionNumber] = d.questionKey
              .split(/[s_q]/)
              .filter(Boolean)
              .map(Number);
            if (section > currentSection) return true;
            if (section === currentSection && subSection > currentSubSection)
              return true;
            if (
              section === currentSection &&
              subSection === currentSubSection &&
              questionNumber > currentQuestionNumber
            )
              return true;
            return false;
          });

          let splitData: any = currentQuestionData?.Question?.key.split("_q");
          let matchingdata = splitData[0] + "_q";
          if (
            get().questions?.filter(
              (f: any) =>
                String(f.questionKey).includes(matchingdata) &&
                parseInt(String(f.questionKey).split(matchingdata)[1]) >
                  parseInt(
                    String(currentQuestionData?.Question?.key).split(
                      matchingdata
                    )[1]
                  )
            ).length > 0
          ) {
            datass = get().questions;
            datass = datass
              .filter(
                (f: any) =>
                  String(f.questionKey).includes(matchingdata) &&
                  parseInt(String(f.questionKey).split(matchingdata)[1]) >
                    parseInt(
                      String(currentQuestionData?.Question?.key).split(
                        matchingdata
                      )[1]
                    )
              )
              .sort((a: any, b: any) => {
                // (a?.FirstDate < b?.FirstDate ? 1 : -1)
                return parseInt(String(a.questionKey).split(matchingdata)[1]) <
                parseInt(String(b.questionKey).split(matchingdata)[1])
                  ? -1
                  : 1;
              });
          } else {
            if (
              datass.filter(
                (f: any) => !String(f.questionKey).includes(matchingdata)
              ).length > 0
            ) {
              datass = datass.sort(function (a: any, b: any) {
                const aNums = a.questionKey.match(/\d+/g).map(Number);
                const bNums = b.questionKey.match(/\d+/g).map(Number);
                const maxLength = Math.max(aNums.length, bNums.length);
                for (let i = 0; i < maxLength; i++) {
                  if (aNums[i] !== bNums[i]) {
                    return aNums[i] - bNums[i]; // sort by number value
                  }
                }
                return a.questionKey.localeCompare(b.questionKey); // if numbers are equal, sort alphabetically
              });
            } else {
              datass = [];
            }
          }
          if (get().current?.question && datass.length > 0) {
            let activeTabIndex: any = get().questions?.findIndex(
              (q: any) => q.QuestionId === datass[0]?.QuestionId
            );
            let nextQuestion: any = get().questions[activeTabIndex]?.QuestionId;
            // if (activeTabIndex === get().questions?.length - 1) {
            //   nextQuestion = get().questions[activeTabIndex]?.QuestionId;
            // } else {
            //   nextQuestion = get().questions[activeTabIndex + 1]?.QuestionId;
            // }

            set((store) => {
              let data: any = {
                question: nextQuestion,
              };
              store.current = data;
            });
            return nextQuestion;
          }
        }
      },
      prevRecommHandler: (currentQuestionData: any) => {
        if (get().questions.length > 0) {
          let datass: any = get().questions?.filter(
            (d: any) => d.questionKey < currentQuestionData?.Question?.key
          );

          let [currentSection, currentSubSection, currentQuestionNumber] =
            currentQuestionData?.Question?.key
              .split(/[s_q]/)
              .filter(Boolean)
              .map(Number);

          datass = datass.filter((d: any) => {
            let [section, subSection, questionNumber] = d.questionKey
              .split(/[s_q]/)
              .filter(Boolean)
              .map(Number);
            if (section < currentSection) return true;
            if (section === currentSection && subSection < currentSubSection)
              return true;
            if (
              section === currentSection &&
              subSection === currentSubSection &&
              questionNumber < currentQuestionNumber
            )
              return true;
            return false;
          });

          let splitData: any = currentQuestionData?.Question?.key.split("_q");
          let matchingdata = !!splitData ? splitData[0] + "_q" : "";
          if (
            get().questions?.filter(
              (f: any) =>
                String(f.questionKey).includes(matchingdata) &&
                parseInt(String(f.questionKey).split(matchingdata)[1]) <
                  parseInt(
                    String(currentQuestionData?.Question?.key).split(
                      matchingdata
                    )[1]
                  )
            ).length > 0
          ) {
            datass = get().questions;
            datass = datass
              .filter(
                (f: any) =>
                  String(f.questionKey).includes(matchingdata) &&
                  parseInt(String(f.questionKey).split(matchingdata)[1]) <
                    parseInt(
                      String(currentQuestionData?.Question?.key).split(
                        matchingdata
                      )[1]
                    )
              )
              .sort((a: any, b: any) => {
                // (a?.FirstDate < b?.FirstDate ? 1 : -1)
                return parseInt(String(a.questionKey).split(matchingdata)[1]) <
                parseInt(String(b.questionKey).split(matchingdata)[1])
                  ? 1
                  : -1;
              });
          } else {
            if (
              datass.filter(
                (f: any) => !String(f.questionKey).includes(matchingdata)
              ).length > 0
            ) {
              datass = datass.sort(function (a: any, b: any) {
                const aNums = a.questionKey.match(/\d+/g).map(Number);
                const bNums = b.questionKey.match(/\d+/g).map(Number);
                const maxLength = Math.max(aNums.length, bNums.length);
                for (let i = 0; i < maxLength; i++) {
                  if (aNums[i] !== bNums[i]) {
                    return aNums[i] - bNums[i]; // sort by number value
                  }
                }
                return a.questionKey.localeCompare(b.questionKey); // if numbers are equal, sort alphabetically
              });
            } else {
              datass = [];
            }
          }
          if (get().current?.question && datass.length > 0) {
            let activeTabIndex: any = get().questions?.findIndex(
              (q: any) => q.QuestionId === datass[datass.length - 1]?.QuestionId
            );
            let prevQuestion: any = get().questions[activeTabIndex]?.QuestionId;
            set((store) => {
              let data: any = {
                question: prevQuestion,
              };
              store.current = data;
            });
            return prevQuestion;
          }
        }
      },
      hasdata: (currentQuestionData: any, isNext: boolean) => {
        if (get().questions.length > 0) {
          if (isNext) {
            let datass: any = get().questions?.filter(
              (d: any) => d.questionKey > currentQuestionData?.Question?.key
            );
            let splitData: any = currentQuestionData?.Question?.key.split("_q");
            let matchingdata = !!splitData ? splitData[0] + "_q" : "";
            if (
              get().questions?.filter(
                (f: any) =>
                  String(f.questionKey).includes(matchingdata) &&
                  parseInt(String(f.questionKey).split(matchingdata)[1]) >
                    parseInt(
                      String(currentQuestionData?.Question?.key).split(
                        matchingdata
                      )[1]
                    )
              ).length > 0
            ) {
              datass = get().questions;
              datass = datass
                .filter(
                  (f: any) =>
                    String(f.questionKey).includes(matchingdata) &&
                    parseInt(String(f.questionKey).split(matchingdata)[1]) >
                      parseInt(
                        String(currentQuestionData?.Question?.key).split(
                          matchingdata
                        )[1]
                      )
                )
                .sort((a: any, b: any) => {
                  // (a?.FirstDate < b?.FirstDate ? 1 : -1)
                  return parseInt(String(a.questionKey).split(matchingdata)[1]) <
                  parseInt(String(b.questionKey).split(matchingdata)[1])
                    ? -1
                    : 1;
                });
            } else {
              if (
                datass.filter(
                  (f: any) => !String(f.questionKey).includes(matchingdata)
                ).length > 0
              ) {
                datass = datass.sort(function (a: any, b: any) {
                  const aNums = a.questionKey.match(/\d+/g).map(Number);
                  const bNums = b.questionKey.match(/\d+/g).map(Number);
                  const maxLength = Math.max(aNums.length, bNums.length);
                  for (let i = 0; i < maxLength; i++) {
                    if (aNums[i] !== bNums[i]) {
                      return aNums[i] - bNums[i]; // sort by number value
                    }
                  }
                  return a.questionKey.localeCompare(b.questionKey); // if numbers are equal, sort alphabetically
                });
              } else {
                datass = [];
              }
            }
            return datass;
          } else {
            let datass: any = get().questions?.filter(
              (d: any) => d.questionKey < currentQuestionData?.Question?.key
            );
            let splitData: any = currentQuestionData?.Question?.key.split("_q");
            let matchingdata = splitData[0] + "_q";
            if (
              get().questions?.filter(
                (f: any) =>
                  String(f.questionKey).includes(matchingdata) &&
                  parseInt(String(f.questionKey).split(matchingdata)[1]) <
                    parseInt(
                      String(currentQuestionData?.Question?.key).split(
                        matchingdata
                      )[1]
                    )
              ).length > 0
            ) {
              datass = get().questions;
              datass = datass
                .filter(
                  (f: any) =>
                    String(f.questionKey).includes(matchingdata) &&
                    parseInt(String(f.questionKey).split(matchingdata)[1]) <
                      parseInt(
                        String(currentQuestionData?.Question?.key).split(
                          matchingdata
                        )[1]
                      )
                )
                .filter((f: any) =>
                  String(f.questionKey).includes(matchingdata)
                )
                .sort((a: any, b: any) => {
                  // (a?.FirstDate < b?.FirstDate ? 1 : -1)
                  return parseInt(String(a.questionKey).split(matchingdata)[1]) <
                  parseInt(String(b.questionKey).split(matchingdata)[1])
                    ? 1
                    : -1;
                });
            } else {
              if (
                datass.filter(
                  (f: any) => !String(f.questionKey).includes(matchingdata)
                ).length > 0
              ) {
                datass = datass.sort(function (a: any, b: any) {
                  const aNums = a.questionKey.match(/\d+/g).map(Number);
                  const bNums = b.questionKey.match(/\d+/g).map(Number);
                  const maxLength = Math.max(aNums.length, bNums.length);
                  for (let i = 0; i < maxLength; i++) {
                    if (aNums[i] !== bNums[i]) {
                      return aNums[i] - bNums[i]; // sort by number value
                    }
                  }
                  return a.questionKey.localeCompare(b.questionKey); // if numbers are equal, sort alphabetically
                });
              } else {
                datass = [];
              }
            }
            return datass;
          }
        }
      },
    })
  )
);
