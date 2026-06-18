import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { GroupWizardActionsType, GroupWizardStateType } from "./types";

export const useGroupWizardStore = create(
  immer<GroupWizardStateType & GroupWizardActionsType>((set, get) => ({
    sections: [],
    questions: [],
    current: {
      section: "",
      question: "",
    },
    assignedUser: null,
    invitationDetails: null,
    assesseeMappings: [],
    reopenDetails: null,
    setGlobalData: (data: Partial<GroupWizardStateType>) => {
      set((store) => {
        (Object.keys(data) as Array<keyof GroupWizardStateType>).forEach(
          (key) => {
            store[key] = data[key] as any;
          }
        );
      });
    },
    setAssignedUser: (user) => {
      set((store) => {
        store.assignedUser = user;
      });
    },
    init: (sections, questions, questionId, sectionId) => {
      console.log("questions", questions);
      console.log("questionId", questionId);
      console.log("sectionId", sectionId);
      console.log("sections", sections);
      let _questionId =
        questions.filter((d) => d.questionId === questionId)[0]?.questionId ||
        "";
      set((store) => {
        if (store.sections.length < 1) store.sections = sections;

        if (store.questions.length < 1) store.questions = questions;

        if (!store.current.section)
          store.current.section = sectionId || sections[0].key;

        console.log("___store.current.question", store.current.question);
        console.log("___questionId", _questionId);

        if (store.current.question !== _questionId && _questionId !== "")
          store.current.question = _questionId || questions[0].questionId;
        else if (!store.current.question)
          store.current.question = _questionId || questions[0].questionId;
        else if (!store.current.question)
          store.current.question = _questionId || questions[0].questionId;
      });
    },
    changeColorHandler(color, questionId, partialStatus = false, isRequired = false) {
      set((store) => {
        store.questions.forEach((q) => {
          if (q.questionId === questionId) {
            q.color = color;
            q.partialStatus = partialStatus;
            q.isRequired = isRequired;
          }
        });
      });
    },
    updateQuestionStatuses(statusMap: Record<string, { color: boolean, partial: boolean, isRequired: boolean }>) {
      set((store) => {
        store.questions.forEach((q) => {
          const status = statusMap[q.questionId];
          if (status) {
            q.color = status.color;
            q.partialStatus = status.partial;
            q.isRequired = status.isRequired;
          }
        });
      });
    },
    nextHandler() {
      if (get().current?.section && get().current?.question) {
        let _section: any = get().sections?.find(
          (s: any) => s.key === get().current?.section
        );

        let totalQuestion: any = get().questions?.filter(
          (q: any) => q.section === _section?.key
        );

        let activeTabIndex =
          totalQuestion?.findIndex(
            (q: any) => q.questionId === get().current?.question
          ) + 1;

        if (totalQuestion?.length === activeTabIndex) {
          let firstTabIndex =
            get().questions?.findIndex(
              (q: any) => q.questionId === get().current?.question
            ) ?? 0;

          let nextQuestion = get().questions[firstTabIndex + 1].questionId;

          set((store) => {
            let data: any = {
              section: get().sections[_section?.index + 1].key,
              question: nextQuestion,
            };

            store.current = data;
          });
        } else {
          let nextQuestion = totalQuestion[activeTabIndex].questionId;

          set((store) => {
            let data: any = {
              section: get().sections[_section?.index].key,
              question: nextQuestion,
            };
            store.current = data;
          });
        }
      } else {
        set((store) => {
          let data: any = {
            section: get().sections[0].key,
            question: get().questions[0].questionId,
          };
          store.current = data;
        });
      }
    },
    prevHandler: () => {
      let _section: any = get().sections?.find(
        (s: any) => s.key === get().current?.section
      );

      let totalQuestion: any = get().questions?.filter(
        (q: any) => q.section === _section?.key
      );

      let activeTabIndex = totalQuestion?.findIndex(
        (q: any) => q.questionId === get().current?.question
      );

      let prevTabIndex =
        get().questions?.findIndex(
          (q: any) => q.questionId === get().current?.question
        ) ?? 0;

      let prevQuestion = get().questions[prevTabIndex - 1]?.questionId;

      set((store) => {
        let data: any = {
          section:
            activeTabIndex === 0
              ? get().sections[_section?.index - 1]?.key
              : get().sections[_section?.index]?.key,
          question: prevQuestion,
        };
        store.current = data;
      });
    },
    sectionHandler: (section) => {
      let _section: any = get().sections?.find((s: any) => s.key === section);

      let totalQuestion: any = get().questions?.filter(
        (q: any) => q.section === _section?.key
      );
      if (totalQuestion.length === 0) return;
      set((store) => {
        let data: any = {
          section: section,
          question: totalQuestion[0].questionId,
        };
        store.current = data;
      });
    },
    questionHandler: (question) => {
      set((store) => {
        let data: any = {
          section: get().current?.section,
          question: question,
        };
        store.current = data;
      });
    },
    questionRecommHandler: (question) => {
      let totalQuestion: any = get().questions?.filter(
        (q: any) => q.questionId === question
      );
      set((store) => {
        let data: any = {
          section: totalQuestion[0].section,
          question: question,
        };
        store.current = data;
      });
    },
  }))
);
