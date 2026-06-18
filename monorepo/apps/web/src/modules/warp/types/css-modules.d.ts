declare module "react-datepicker/dist/react-datepicker.css" {
  const content: any;
  export default content;
}

declare module "react-text-mask" {
  import { Component, Ref } from "react";
  interface MaskedInputProps {
    mask: Array<string | RegExp> | ((value: string) => Array<string | RegExp>) | boolean;
    guide?: boolean;
    value?: string;
    pipe?: (value: string, config: any) => false | string | { value: string; indexesOfPipedChars: number[] };
    placeholder?: string;
    placeholderChar?: string;
    keepCharPositions?: boolean;
    showMask?: boolean;
    render?: (ref: Ref<any>, props: any) => React.ReactElement;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    [key: string]: any;
  }
  class MaskedInput extends Component<MaskedInputProps> {}
  export default MaskedInput;
}

declare module "text-mask-addons/dist/createNumberMask" {
  function createNumberMask(options?: {
    prefix?: string;
    suffix?: string;
    includeThousandsSeparator?: boolean;
    thousandsSeparatorSymbol?: string;
    allowDecimal?: boolean;
    decimalSymbol?: string;
    decimalLimit?: number;
    requireDecimal?: boolean;
    allowNegative?: boolean;
    allowLeadingZeroes?: boolean;
    integerLimit?: number | null;
  }): Array<string | RegExp> | ((value: string) => Array<string | RegExp>);
  export default createNumberMask;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
