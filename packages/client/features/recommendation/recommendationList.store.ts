import create from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  RecommndationActionsType,
  RecommndationStateType,
} from "../form/types";

export const useRecommendationStore = create(
  immer<RecommndationActionsType & RecommndationStateType>((set, get) => ({
    RecommendationSearchValue: (Recommendation) => {
      set((store) => {
        store.RecommendationValue = Recommendation.replace(/  +/g, " ");
      });
    },
    FirstProposedOnSearchValue: (FirstProposedOn) => {
      set((store) => {
        store.FirstProposedOnValue = FirstProposedOn.replace(/  +/g, " ");
      });
    },
    DueDateSearchValue: (DueDate) => {
      set((store) => {
        store.DueDateValue = DueDate.replace(/  +/g, " ");
      });
    },
    ImplementedOnSearchValue: (ImplementedOn) => {
      set((store) => {
        store.ImplementedOnValue = ImplementedOn.replace(/  +/g, " ");
      });
    },
    GlobalSearchValue: (Global) => {
      set((store) => {
        store.GlobalValue = Global.replace(/  +/g, " ");
      });
    },
    StatusValue: (active) => {
      set((store) => {
        store.TabActive = active;
      });
    },
    DeleteRecommendationSearch: () => {
      set((store) => {
        store.RecommendationValue = "";
      });
    },
    DeleteFirstProposedOnSearch: () => {
      set((store) => {
        store.FirstProposedOnValue = "";
      });
    },
    DeleteImplementedOnSearch: () => {
      set((store) => {
        store.ImplementedOnValue = "";
      });
    },
    DeleteDueDateSearch: () => {
      set((store) => {
        store.DueDateValue = "";
      });
    },
    DeleteGlobalSearch: () => {
      set((store) => {
        store.GlobalValue = "";
      });
    },
  }))
);
