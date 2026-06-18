declare module "react-datepicker/dist/react-datepicker.css" {
  const content: any;
  export default content;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
