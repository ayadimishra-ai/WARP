export type FieldOptionsType<T = {}> = T & {
  required: boolean;
  enable: boolean;
  readonly: boolean;
};

export type DisplayOptionType<T = {}> = T & {};

export type InterfaceOptionType<T = {}> = T & {};

export type FormFieldOptionsType<
  TFieldOptions,
  TInterfaceOptions,
  TDisplayOptions
> = {
  fieldOptions: FieldOptionsType<TFieldOptions>;
  interfaceOptions: InterfaceOptionType<TInterfaceOptions>;
  displayOptions: DisplayOptionType<TDisplayOptions>;
};

export type RuleType<TOptions = {}> = {
  name: string;
  rule: string;
} & TOptions;

export type ValidationRuleType<T = {}> = RuleType<
  T & {
    message: string;
  }
>[];

export type DisplayRuleType<
  TFieldOptions = {},
  TDisplayOptions = {}
> = RuleType<
  Omit<
    FormFieldOptionsType<TFieldOptions, {}, TDisplayOptions>,
    "interfaceOptions"
  >
>[];
