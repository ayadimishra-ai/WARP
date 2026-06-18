import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { InvitationActionsType, InvitationStateType } from "../form/types";

export const useInvitationListStore = create(
  immer<InvitationStateType & InvitationActionsType>((set, get) => ({
    QuestionnareSearchValue: (Questionnare) => {
      set((store) => {
        // store.QuestionnareValue = Questionnare.trim();
        store.QuestionnareValue = Questionnare;
      });
    },
    OrganizationSearchValue: (Organization) => {
      set((store) => {
        store.OrganizationValue = Organization;
      });
    },
    GlobalSearchValue: (Global) => {
      set((store) => {
        store.GlobalValue = Global.trim();
      });
    },
    StatusValue: (active) => {
      set((store) => {
        store.TabActive = active;
      });
    },
    DeleteQuestionnareSearch: () => {
      set((store) => {
        store.QuestionnareValue = "";
      });
    },
    DeleteOrganizationSearch: () => {
      set((store) => {
        store.OrganizationValue = "";
      });
    },
    DeleteGlobalSearch: () => {
      set((store) => {
        store.GlobalValue = "";
      });
    },
    DeleteLocationSearch: () => {
      set((store) => {
        store.LocationValue = "";
      });
    },
    LocationSearchValue: (location) => {
      set((store) => {
        // store.LocationValue = location.trim();
        store.LocationValue = location;
      });
    },
    IsSort: (sortingTitle, sortingType) => {
      set((store) => {
        store.sortingTitle = sortingTitle;
        store.sortingType = sortingType;
      });
    },
    IsSortByComments: (sortingType) => {
      set((store) => {
        store.commentsSortingType = sortingType;
      });
    },
    OrganizationUserSearchValue: (OrganizationUser) => {
      set((store) => {
        store.OrganizationUserValue = OrganizationUser;
      });
    },
    DeleteOrganizationUserSearch: () => {
      set((store) => {
        store.OrganizationUserValue = "";
      });
    },
    isFilterSubmitSet: (value) => {
      set((store) => {
        store.isFilterSubmitGet = value;
      });
    },

    isStatusFilterOpened: (value) => {
      set((store) => {
        store.isStatusFilterClosed = value;
      });
    },
  }))
);