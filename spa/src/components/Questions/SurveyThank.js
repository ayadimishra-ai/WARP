import React, { Component } from "react";
import FireSideLogo from "../../assets/img/firesideLogo.png";
import QnAStartupImg from "../../assets/img/questionStartup.png";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";

class SurveyThankPage extends Component {
  render() {
    return (
      <GridContainer>
        <GridItem md={6}>
          <div>
            <img src={QnAStartupImg} />
          </div>
        </GridItem>
        <GridItem md={6}>
          <div className="qNa_right_thankpg">
            <img src={FireSideLogo} />
            <h4>Thank you!!</h4>
            <p>
              With this, you have successfully taken your first step towards
              sustainable action.
            </p>
            <div>
              <h6>Here is a summary of your organisation's ESG performance:</h6>
              <div className="esg_summary">
                <div className="esg_summary_header">
                  <span>Sustainability Areas</span>
                  <span>Scores</span>
                </div>
                <div className="esg_summary_content">
                  {this.props.scoreData.map((score) => {
                    let extendedClass = '';
                    if (score.percentScore >= 0 && score.percentScore < 50) {
                      extendedClass = 'worst_card';
                    } else if (score.percentScore >= 50 && score.percentScore <= 80) {
                      extendedClass = 'avg_card';
                    } else if (score.percentScore > 80) {
                      extendedClass = 'best_card';
                    }
                    return <div>
                      <span><p className={"color_code " + extendedClass}></p>{this.props.esgDiagnostic.filter(x => x.sectionGuid == score.formSectionGuid)[0].section}</span>
                      <span>{score.score}/{score.maxScore}</span>
                    </div>
                  })}
                </div>
              </div>
            </div>
          </div>
        </GridItem>
      </GridContainer>
    );
  }
}
export default SurveyThankPage;
