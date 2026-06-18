import React from "react";
import { Grid, Typography, Link, Paper } from "@material-ui/core";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import { getNextJSServiceUrl } from "../../config";
import axios from "axios";
import { connect } from "react-redux";
import { viewRecommendationsOpen } from "../../store/actions/viewRecommedations";
import { updateCount } from "../../store/actions/questionWithQueries";
import * as actionCreators from "../../store/actions/index";
import { withRouter } from "react-router-dom";
import history from "../../history";
import { navigateTo } from "../../utility";

const UnauthorizedPleaseLoginAgain = ({
  onAuthLogout,
  onClearCount,
  onViewRecommendation,
  history: routerHistory,
}) => {
  const logoutHandler = (event) => {
    // Prevent default link behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    onClearCount(0);
    onViewRecommendation(false);

    localStorage.setItem("isRecommendationIcon", false);

    const Options = {
      method: "POST",
      url: getNextJSServiceUrl() + "session/UpdateUserSession",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("tokenId"),
        BrowserToken: localStorage.getItem("BrowserToken"),
        userId: localStorage.getItem("userId"),
      },
      data: [],
    };

    axios
      .request(Options)
      .then((response) => {
        console.log("User session logged out successfully:", response);
      })
      .catch((error) => {
        console.error("Error creating user session:", error);
      })
      .finally(() => {
        console.log("onAuthLogout Called");
        onAuthLogout();

        // Use cross-browser navigation utility with delay for logout completion
        setTimeout(() => {
          navigateTo("/", routerHistory, history);
        }, 100);
      });
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      style={{ height: "95vh" }}
    >
      <Grid item>
        <Paper
          elevation={3}
          style={{
            marginTop: "-2em",
            backgroundColor: "#FFE1D3",
            borderRadius: 16,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <ErrorOutline style={{ fontSize: "4.5rem", color: "#AC0B0B" }} />
          <Typography
            variant="h6"
            style={{
              fontWeight: 600,
              color: "#AC0B0B",
            }}
          >
            Session Expired
          </Typography>
          <Typography variant="body1" style={{ marginBottom: 16 }}>
            Your session has expired. Please{" "}
            <Link
              href=""
              underline="none"
              style={{ color: "#0066CC" }}
              onClick={logoutHandler}
            >
              log in
            </Link>{" "}
            again to continue.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Inject dispatch functions for react-redux v6
const mapDispatchToProps = (dispatch) => ({
  onAuthLogout: () => dispatch(actionCreators.logout()),
  onClearCount: (count) => dispatch(updateCount(count)),
  onViewRecommendation: (open) => dispatch(viewRecommendationsOpen(open)),
});

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(UnauthorizedPleaseLoginAgain)
);
