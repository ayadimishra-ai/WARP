import { FormFieldInterfaces } from "./constants";

const DateTimePickerData = {
  fieldOptions: {
    required: true,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Choose Date",
    isRange: false,
    fromDate: null,
    toDate: null,
    time: {
      enable: true,
      showSeconds: true,
    },
  },
  display: "datetime/raw",
  displayOptions: {
    format: "DD-MM-YYYY",
  },
  validation: [
    {
      name: "validation name",
      rule: {},
      message: "Validation message",
    },
  ],
  conditions: [
    {
      name: "Condition name",
      rule: {},
      fieldOptions: {},
      interfaceOptions: {},
    },
  ],
};
const SelectDropdownData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    allowNoSelection: false,
    choices: [
      { label: "abc", value: "abc" },
      { label: "xyz", value: "xyz" },
    ],
  },
  display: "raw",
  displayOptions: {},
  validation: [
    {
      name: "validation name",
      rule: {},
      message: "Validation message",
    },
  ],
  conditions: [
    {
      name: "Condition name",
      rule: {},
      fieldOptions: {},
      interfaceOptions: {},
    },
  ],
};
const inputTextData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
  },
  display: "formatted",
  displayOptions: {
    bold: true,
    italic: true,
  },
  validation: [
    {
      name: "validation name",
      rule: {},
      message: "Validation message",
    },
  ],
  conditions: [
    {
      name: "Condition name",
      rule: {},
      fieldOptions: {},
      interfaceOptions: {},
    },
  ],
};
const MultiLineData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Textarea",
    maxLength: 255,
    rows: 8,
    columns: 50,
  },
  display: "raw",
  displayOptions: {
    bold: true,
    italic: false,
  },
  validation: [
    {
      name: "validation name",
      rule: {},
      message: "Validation message",
    },
  ],
  conditions: [
    {
      name: "Condition name",
      rule: {},
      fieldOptions: {},
      interfaceOptions: {},
    },
  ],
};
const DividerData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    title: "Divider Texts",
  },
  display: "raw",
  displayOptions: {},
  validation: [
    {
      name: "validation name",
      rule: {},
      message: "Validation message",
    },
  ],
  conditions: [
    {
      name: "Condition name",
      rule: {},
      fieldOptions: {},
      interfaceOptions: {},
    },
  ],
};
const NoticeData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    title: "Primary Text",
    subTitle: "Subtitle Text",
    color: "#FFF",
    icon: "Info",
    closeButton: true,
  },
  display: "raw",
  displayOptions: {
    bold: true,
    italic: true,
    underline: true,
  },
};
const LinksData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    title: "Primary Text",
    openInNewTab: true,
    api: {
      url: "google.com",
      configureBody: "",
      titleField: "google",
      urlField: "",
    },
    presets: [{ title: "", url: "" }],
  },
  display: "raw",
  displayOptions: {},
};
const RadioData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    allowNoSelection: false,
    apiUrl: "",
    choices: [{ label: "", value: "" }],
  },
  display: "raw",
  displayOptions: {},
};
const CheckboxData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    allowNoSelection: false,
    apiUrl: "",
    choices: [{ label: "", value: "" }],
  },
  display: "raw",
  displayOptions: {},
};
const TagsData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    apiUrl: "",
    presets: ["Tag1", "Tag2", "Tag3"],
    allowOther: true,
  },
  display: "raw",
  displayOptions: {},
};
const SliderData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    marks: [
      { value: 20, label: "20%" },
      { value: 50, label: "50%" },
      { value: 80, label: "90%" },
    ],
    minValue: 0,
    maxValue: 100,
    defaultValue: [20, 80],
    step: 1,
  },
  display: "raw",
  displayOptions: {},
};
const ToggleData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    onLabel: "Yes",
    offLabel: "No",
    label: "",
    size: "sm",
  },
  display: "raw",
  displayOptions: {},
};
const InputAutoCompleteData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    autoComplete: true,
    autoCompleteData: ["Text 1", "Text 2"],
    isApi: false,
    api: { url: "string", configureBody: "string" },
  },
  display: "raw",
  displayOptions: {
    bold: true,
    italic: true,
  },
};
const InputAutoCompleteDataApi = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    autoComplete: true,
    apiUrl: "",
  },
  display: "formatted",
  displayOptions: {
    bold: true,
    italic: true,
  },
};
const InputRichTextData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    maxLength: 255,
    directortPath: "",
    allowMultiple: true,
    accept: ["jpg", "pdf"],
    maxSizeAllowed: "2  in mbs",
    maxFilesAllowed: "3",
    controls:
      "blockquote | code | h1 | h2 | h3 | h4 | h5 | h6 | link | sub | sup | video | image | bold | strike | underline | italic | clean | codeBlock | alignRight",
  },
  display: "raw",
  displayOptions: {},
};
const FileData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Choose",
    directoryPath: "",
    allowMultiple: true,
    accept: ["jpg", "pdf"],
    maxSizeInMb: 2,
    maxFilesCount: 3,
  },
  display: "file/image/raw",
  displayOptions: {},
};
const SelectMultipleDropdownData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    placeholder: "Placeholder Text",
    allowNoSelection: false,
    apiUrl: "",
    choices: [{ label: "", value: "" }],
  },
  display: "raw",
  displayOptions: {},
};
const AccordianData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    isOpen: true,
    title: "title1",
  },
  display: "raw",
  displayOptions: {},
};
const GroupDetailsData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    isOpen: true,
    title: "Title 1",
  },
  display: "raw",
  displayOptions: {},
};
const GroupGridRowData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    horizontal: true,
    spacing: 10,
    columns: {
      xs: 1,
      sm: 2,
      md: 2,
      lg: 4,
    },
  },
  display: "raw",
  displayOptions: {},
};
const GroupWizardData = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    template: "template1",
    showControls: false,
    tabs: [
      {
        tabKey: 1,
        tabName: "Overview",
        // template: "template1",
        icon: {
          icon: "https://cdn-icons-png.flaticon.com/512/126/126472.png",
          tooltip: "tooltip text",
          size: "md",
        },
      },
      {
        tabKey: 2,
        tabName: "Governance",
        // template: "template2",
        icon: {
          icon: "https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/Settings-icon.png",
          tooltip: "tooltip text",
          size: "md",
        },
      },
    ],
  },
  display: "raw",
  displayOptions: {},
};
const GroupWizardData2 = {
  fieldOptions: {
    required: false,
    enable: true,
    readonly: false,
  },
  interfaceOptions: {
    template: "template2",
    showControls: true,
    tabs: [
      {
        tabKey: 1,
        tabName: "Q1",
        // template: "template1",
        icon: {
          icon: null,
          tooltip: "tooltip text",
          size: "md",
        },
      },
      {
        tabKey: 2,
        tabName: "Q2",
        // template: "template2",
        icon: {
          icon: null,
          tooltip: "",
          size: "",
        },
      },
      {
        tabKey: 3,
        tabName: "Q3",
        // template: "template2",
        icon: {
          icon: null,
          tooltip: "tooltip text",
          size: "md",
        },
      },
    ],
  },
  display: "raw",
  displayOptions: {},
};

const FormFieldUIUtil = {
  [FormFieldInterfaces.datetime]: DateTimePickerData,
};

export default FormFieldUIUtil;
