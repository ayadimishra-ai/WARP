/**
 * Type definitions for Excel template generation
 * These types define the structure of data used to generate Excel templates
 */

/**
 * Section data structure
 */
export interface SectionData {
  id: string;
  key: string;
  content: string;
  tags?: string | string[];
  sectionId?: string;
  ParentSection?: {
    id: string;
    key: string;
    content: string;
  };
  Questions?: QuestionData[];
}

/**
 * Question data structure
 */
export interface QuestionData {
  id: string;
  key: string;
  content: string;
  tags?: string | string[];
  parentQuestionId?: string;
  sectionId?: string;
}

/**
 * Form field data structure
 */
export interface FormFieldData {
  id: string;
  field: string;
  type?: string;
  interface: string;
  interfaceOptions?: any;
  fieldOptions?: {
    required?: boolean;
    enable?: boolean;
    readonly?: boolean;
    label?: string;
    [key: string]: any;
  };
  displayOptions?: any;
  displayRules?: {
    rule?: string;
    [key: string]: any;
  };
  validationRules?: {
    rule?: string;
    message?: string;
    [key: string]: any;
  };
  autoCalculatedCalculation?: {
    isAutoCalculate?: boolean;
    rule?: string;
    [key: string]: any;
  };
  seqIndex: number;
  groupField?: string;
  tags?: string | string[];
  dataPoint?: string;
  sectionId?: string;
  questionId?: string;
  Section?: {
    id: string;
    key: string;
    content: string;
  };
  Question?: {
    id: string;
    key: string;
    content: string;
  };
}

/**
 * Complete form template data structure
 */
export interface FormTemplateData {
  id: string;
  title: string;
  description: string;
  name: string;
  formtype?: string;
  tags?: string[];
  Sections: SectionData[];
  FormFields: FormFieldData[];
}
