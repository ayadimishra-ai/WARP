import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { BreadCrumbActionsType, BreadcrumbType } from "./types";
export const useBreadCrumbStore = create(
  immer<BreadcrumbType & BreadCrumbActionsType>((set, get) => ({
    current: {
      breadCrumbDetail: "",
      isQuestionBox: "",
    },
    init: (breadCrumbDetail, isQuestionBox) => {
      set((store) => {
        store.current.breadCrumbDetail = breadCrumbDetail;
        store.current.isQuestionBox = isQuestionBox;
      });
    },
    changeBreadCrumbHandler(breadCrumbDetail, isQuestionBox) {
      set((store) => {
        store.current.breadCrumbDetail = breadCrumbDetail;
        store.current.isQuestionBox = isQuestionBox;
      });
    },
  }))
);
