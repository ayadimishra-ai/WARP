// CSS module type declarations
declare module "*.css" {
  const content: any;
  export default content;
}

// FontAwesome CSS specific declaration
declare module "@fortawesome/fontawesome-svg-core/styles.css";

// SCSS module declarations
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}