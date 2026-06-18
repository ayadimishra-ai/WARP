import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import QnAStartupImg from "../../assets/img/questionStartup.png";
import FireSideLogo from "../../assets/img/firesideLogo.png";
import Timer from "@material-ui/icons/Timer";
import Description from "@material-ui/icons/Description";
import Button from "../../UI/Button/MaterialButton";

class QuestionStart extends Component {
  render() {
    return (
      <GridContainer>
        <GridItem md={6}>
          <div>
            <img src={QnAStartupImg} />
          </div>
        </GridItem>
        <GridItem md={6}>
          <div className="qNa_right">
            <img src={FireSideLogo} />
            <h4>Welcome to ESG Assessment Survey by Fireside Ventures!</h4>
            <p>
              This survey is designed to capture the information on the ESG
              related initiatives taken by your company. The questions are
              categorized under various key areas of ESG because strong
              effective and transparent governance in each of these areas and in
              broader business activity is fundamental in building trust.
            </p>
            <div>
              <div>
                <Timer />
                <p>
                  <span>40 - 60 minutes</span>approximately estimated time for
                  survey. Further time may be required to gather the necessary
                  data.
                </p>
              </div>
              <div>
                <Description />
                <p>
                  You may require this information to make the process smooth
                  and fast.
                </p>
              </div>
            </div>
            <Button onClick={this.props.showQuestionForm} orangeSubmit>
              Lets Begin
            </Button>
          </div>
        </GridItem>
      </GridContainer>
    );
  }
}
export default QuestionStart;
