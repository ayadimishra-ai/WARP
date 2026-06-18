import create from "zustand";

export const useAssessmentGlobalVariable = create((set, get) => ({
  formId: "",
  SetFormId: (FormGuid: string) => set((state: any) => ({ formId: FormGuid })),
}));
