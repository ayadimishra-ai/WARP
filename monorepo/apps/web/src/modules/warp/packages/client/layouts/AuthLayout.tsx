import { FC, PropsWithChildren } from "react";

interface IAuthLayoutProps extends PropsWithChildren {}

const AuthLayout: FC<IAuthLayoutProps> = ({ children }) => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};

export default AuthLayout;
