import React from "react";
import { Redirect, Route } from "react-router-dom";
import UnauthorizedPleaseLoginAgain from "../../containers/OpsContainer/UnauthorizedPleaseLoginAgain";
import { decodeOpAccessToken, decodeWarpAccessToken } from "../../utility";

export const PrivateRoute = ({
  component: Component,
  isCheckedToken = true,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem("IsAuthentic") === true ||
      localStorage.getItem("IsAuthentic") === "true" ? (
        isCheckedToken ? (
          <ProtectAuthComponent>
            <Component {...props} />
          </ProtectAuthComponent>
        ) : (
          <Component {...props} />
        )
      ) : (
        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
      )
    }
  />
);

export const OPPrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem("IsAuthentic") === true ||
      localStorage.getItem("IsAuthentic") === "true" ? (
        <OPProtectAuthComponent>
          <Component {...props} />
        </OPProtectAuthComponent>
      ) : (
        <Redirect to={{ pathname: "/", state: { from: props.location } }} />
      )
    }
  />
);

const ProtectAuthComponent = ({ children }) => {
  const iqToken = localStorage.getItem("warpToken");
  if (!iqToken || iqToken === "null") {
    return <UnauthorizedPleaseLoginAgain />;
  }

  const decodedToken = decodeWarpAccessToken(iqToken);
  if (!decodedToken || decodedToken === "null") {
    return <UnauthorizedPleaseLoginAgain />;
  }

  return children;
};

const OPProtectAuthComponent = ({ children }) => {
  const opsToken = localStorage.getItem("opsToken");
  if (!opsToken || opsToken === "null") {
    return <UnauthorizedPleaseLoginAgain />;
  }

  const decodedToken = decodeOpAccessToken(opsToken);
  if (!decodedToken || decodedToken === "null") {
    return <UnauthorizedPleaseLoginAgain />;
  }

  return children;
};
