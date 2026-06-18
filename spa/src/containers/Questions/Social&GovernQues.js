import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import StepConnector from "@material-ui/core/StepConnector";
import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";

const styles = theme => ({
  root: {
    width: "90%"
  },
  button: {
    marginRight: theme.spacing.unit
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  step: {
    "& $completed": {
      color: "#008522"
    },
    "& $active": {
      color: "#008522"
    },
    "& $disabled": {
      color: "#008522"
    }
  },
  connectorActive: {
    "& $connectorLine": {
      borderColor: "#008522"
    }
  },
  connectorCompleted: {
    "& $connectorLine": {
      borderColor: "#008522"
    }
  },
  connectorDisabled: {
    zIndex:'9',
    "& $connectorLine": {
      borderColor: theme.palette.grey[500],
    //   borderStyle:'dashed',
    }
  },
  connectorLine: {
    transition: theme.transitions.create("border-color")
  },
  alternativeLabel: {},
  active: {}, //needed so that the &$active tag works
  completed: {},
  disabled: {},
  labelContainer: {
    "&$alternativeLabel": {
      marginTop: 0
    }
  }
});



class SocialGovernQues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkBoxValue: 0,
      radio: "",
      activeStep: 0,
      completed: {},
    };
  }

  handleChangeCheckbox = (event, value) => {
    this.setState({ checkBoxValue: value });
  };
  handleChangeRadio = (event, radio) => {
    this.setState({ radio });
  };
  totalSteps = () => ["Social", "Environment", "Governance"].length;

  handleNext = () => {
    let activeStep;

    if (this.isLastStep() && !this.allStepsCompleted()) {
      // It's the last step, but not all steps have been completed,
      // find the first step that has been completed
      const steps = ["Social", "Environment", "Governance"];
      activeStep = steps.findIndex((step, i) => !(i in this.state.completed));
    } else {
      activeStep = this.state.activeStep + 1;
    }
    this.setState({
      activeStep
    });
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }));
  };

  handleStep = step => () => {
    this.setState({
      activeStep: step
    });
  };

  handleComplete = () => {
    const { completed } = this.state;
    completed[this.state.activeStep] = true;
    this.setState({
      completed
    });
    this.handleNext();
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
      completed: {}
    });
  };

  completedSteps() {
    return Object.keys(this.state.completed).length;
  }

  isLastStep() {
    return this.state.activeStep === this.totalSteps() - 1;
  }

  allStepsCompleted() {
    return this.completedSteps() === this.totalSteps();
  }
  render() {
    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.ISO) === null)
        {
            return <Redirect to="/not-found" />;
        }
    const { classes } = this.props;
    const { activeStep } = this.state;
    const steps = ["Company information", "Workplace", "Community","Company information", "Workplace", "Community"];
    const connector = (
      <StepConnector
        classes={{
          active: classes.connectorActive,
          completed: classes.connectorCompleted,
          disabled: classes.connectorDisabled,
          line: classes.connectorLine
        }}
      />
    );
    return (
      <div className="">
        <div className="quetionAnsers sa800">
          <div className="quetionAnsers_pannel">
              <div>
                <div>
                    <div>
                        <h3>ESG Framework - SA 8000</h3>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Child Labour</h4>
                          <h6>
                            Does the Organization engage persons for work below 18years?
                          </h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>
                          Do the organization have any policy against child labour and procedure for remediation in case of any one found?
                          </h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>
                          Are there were any young workers working in the facility?
                          </h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>
                          In case of young workers employed do they expose to any hazardous working condition?
                          </h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h4>
                          Forced/ Compulsory labour 
                          </h4>
                          <h6>Whether the organization engages or support the use of forced or compulsory labour?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do the Workers surrendered any Personal deposits like passports, certificates or money?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do the management withhold any certificates or identity proofs for conditional employment?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company do any deduction from the wages as an employment fees?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the employees have the right to leave the workplace after the completion of workday?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the employees are free to terminate the employment with prior reasonable notice?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do the organization supports any kind of bonded labour? Is there any policy against bonded labour?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>If the bonded labour system is followed by the participation of all members of a family under forced conditions?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h4>
                            Health & Safety 
                          </h4>
                          <h6>Whether the organization providing safe and health work environment to the personnel?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization framed effective steps to present health and safety incidents occur in the work place?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company has overseen the risk assessment for the new, expectant and nursing mothers?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are personnel provided with proper PPE’s where required?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization trained personnel for how to use PPE safely and effectively?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are all the personnel properly utilizing PPE’S?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization displayed signage in risk places?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are personnel instructed on how to use PPE’s safely and effectively in work place?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization provided with sufficient first aid and sufficient applicable medical stuff to the employees?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company appointed health and safety representative to implement the requirement of safety and health in the work place?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company systematized health and safety committee?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the health and safety committee has required members from the management and workers according to law?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the committee is maintained properly?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is there health and safety committee conducting periodic occupational health and safety in the workplace?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is the committee recording and communicating the minutes of meeting to workers?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company has convey the training to health and safety?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is the company performs training in regular bases for effective health and safety of employees?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the training related to emergency and risks involved in the health and safety personnel?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization Provide documented procedure to deal with the risk arise to the health and safety of personnel?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company is properly filing the incidents and near miss of all health and safety that occur in the work place and its residences?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the organization provided clean and sanitary facilities to the personnel?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether the company is provided ample no of toilets according to their gender?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the personnel are provided safe and clean dormitory facilities?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the personnel are allowed to use the right to remove themselves from immediate threat without waiting for the permission of organization?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Freedom of Association and collective bargaining</h4>
                          <h6>Are employees free to join the union?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are employees free to join the union?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether workers are allowed for collective bargaining?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the elections for the worker representatives held without management interference?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Whether workers representatives or union members face any discrimination or harassment from the management?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Discrimination </h4>
                          <h6>Does your Organization have a policy against discrimination during hiring based on race, gender, nationality, religion etc.?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are all the employees treated equally, and if so how do you ensure so?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does your Organization have any committee or person to receive and act on grievances from the employees?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does your Organization conduct pregnancy or virginity tests during hiring?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Disciplinary Practices</h4>
                          <h6>Is our company treating all personnel with dignity and respect?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is our company engaged in any kind of use of corporal punishment, mental or physical coercion and verbal abuse of personnel?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is our company evaluating the cause of misconduct or negligence for every incident?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Working hours </h4>
                          <h6>Do the organisation comply with applicable laws, collective bargaining agreements and industry standards on working hours, breaks and public holidays?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do the normal work week, not including overtime, according to law will it exceed 48 hours?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do Personnel provided with at least one day off for every six consecutive days of working?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are all overtime work was voluntary?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do over time exceed 12 hours per week?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Remuneration </h4>
                          <h6>Do Organization follow and respect the basic need wage as per the legal requirement?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do the organization deducts any amount from the wages for disciplinary purposes?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are workers are allowed for the collective bargaining?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are workers issued pay slips in understandable language with providing all information about the wages and deductions?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are workers paid overtime over time in premium rate as per the local law?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is there any short term contract agreements with employees?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Policies, Procedures and records</h4>
                          <h6>Is there a Social Accountability policy written and signed by Senior management?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does it contains compliance with Local and International laws?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does all workers have knowledge of company’s social policy?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Do you have separate policy and procedure for all clauses of SA 8000?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are the policy documents available to view for all stakeholders?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How often do you conduct Management review meeting?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Social Performance team </h4>
                          <h6>Is Social Performance Team established?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is there a worker representative elected by workers themselves?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How often Worker representative will meet management?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How often training is conducted for Social performance team, do you have training records?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Identification and Assessment of risks</h4>
                          <h6>Do you have procedure for how to assess risks?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does management and worker representative involve in this procedure?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>What are actions taken based on the assessment and how it is tracked?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Monitoring </h4>
                          <h6>Does SPT have records for monitoring the compliance?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How often internal audit is done, does SPT have the records?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does SPT have records of Monitoring in interested parties?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are root cause analysis done for all risks?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Summary/ reports on action taken by SPT and action in progress?</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Internal involvement and communication </h4>
                          <h6>Is Organization communicating the requirements of SA8000 through routine communications to the employees on regular bases?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>What are the channels used to communicate with Workers?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Compliant Management and resolution </h4>
                          <h6>What is the grievance procedure? 
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are compliant record available?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Is confidentiality of person complained maintained?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are actions taken against complaint available to view for all workers?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4> External Verification And Stakeholder Engagement</h4>
                          <h6>Does the company cooperates with External auditor and stakeholders in case of audit and compliance?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are all relevant stakeholders included in both internal and external audit?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are internal audit reports available for external auditor?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Corrective and prevention action plans </h4>
                          <h6>Does policy include timeline for implementation of corrective and preventive actions?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are required resource available for the actions?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are failures/ NCs repeating after implementing preventive measures? Is there a record?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Training and capacity building </h4>
                          <h6>Is there a training schedule available?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How effectiveness of the training is measured?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are external trainers used?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                            <h4>Management of suppliers and contractors </h4>
                          <h6>How suppliers and contractors are evaluated?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How often?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Records?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Are suppliers informed of their results/ evaluation?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>Does all Home workers have knowledge on SA

</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="quetions_main">
                        <div className="question_Div">
                          <h6>How are home workers monitored and evaluated?
</h6>
                        </div>
                        <div className="newThemeInput  answer_Div">
                          <RadioGroup
                            className="radioInput"
                            aria-label="position"
                            name="position"
                            value={this.state.radio}
                            onChange={this.handleChangeRadio}
                            row
                          >
                            <FormControlLabel
                              value="Yes"
                              label="Yes" disabled={true}
                              control={<Radio color="primary" />}
                            />
                            <FormControlLabel
                              value="No"
                              label="No" disabled={true}
                              control={<Radio color="primary" />}
                            />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(SocialGovernQues);
