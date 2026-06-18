import { ComponentType } from "react";

export default function withHOCExample<T>(Component: ComponentType<T>) {
  return (props: T) => {
    return <Component {...props} />;
  };
}
