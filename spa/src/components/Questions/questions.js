import RadioGroup from "@material-ui/core/RadioGroup";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Redirect } from "react-router-dom";
import Spinner from '../../../src/UI/Spinner/Spinner';
import { getServiceUrl, getWebsiteGUID } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInputQuestionnaire";
import { getElasticData } from '../../utility';
import QnAStartup from './QuestionStart';
import SurveyThankPg from './SurveyThank';


const styles = theme => ({
  root: {
    width: "90%"
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  step: {
    "& $completed": {
      zIndex: '99',
      color: "#008522",
      fontSize: '27px'
    },
    "& $active": {
      zIndex: '99',
      color: "#008522",
    },
    "& $disabled": {
      zIndex: '99',
      color: "#008522",
      fontSize: '27px'
    }
  },
  connectorActive: {
    left:'calc(-50% + -10px)',
    right: 'calc(50% + 28px)',
    "& $connectorLine": {
      borderColor: theme.palette.grey[500],
    }
  },
  connectorCompleted: {
    left:'calc(-50% + -10px)',
    right: 'calc(50% + 28px)',
    "& $connectorLine": {
      borderColor: theme.palette.grey[500],
    }
  },
  connectorDisabled: {
    zIndex: '9',
    left:'calc(-50% + -10px)',
    right: 'calc(50% + 28px)',
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



class Quetionair extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stepsArray: [],
      esgDiagnostic: [],
      checkBoxValue: 0,
      radio: "",
      activeStep: 0,
      completed: {},
      dataArray: [],
      statusName: '',
      loader: false,
      showForm: false,
      showThankPg: false,
      scoreData: [],
      stick:false
    };
  }

  listenScrollEvent = e => {
    if (window.scrollY > 85) {
      this.setState({stick: true})
    } else {
      this.setState({stick: false})
    }
  }

  totalSteps = () => this.state.esgDiagnostic.length;

  async handleSubmit(action) {
    this.setState({ loader: true })
    let lstCompanyESGDiagnosticQuestionAnswer = [];
    this.state.esgDiagnostic.map((sections, sectionIndex) => {
      sections.lstSubsectionDeatils.map((subSection, subSectionIndex) => {
        subSection.lstQuestions.map((question, questionIndex) => {
          question.lstAnswers.filter(
            x => x.isSelected == true || (x.value !== '' && x.value !== null && x.value !== undefined) || (x.relatedText !== '' && x.relatedText !== null && x.relatedText !== undefined)).map((answer) => {
              if (answer.type === 'Check' || answer.type === 'Radio') {
                if (answer.isSelected) {
                  lstCompanyESGDiagnosticQuestionAnswer.push({
                    QuestionGuid: question.questionGuid,
                    AnswerGuid: answer.answerGuid,
                    AnswerText: answer.value,
                    RelatedText: answer.relatedText === undefined ? null : answer.relatedText,
                    CreatedBy: localStorage.userId,
                    CreatedDate: new Date(),
                    ModifiedBy: "",
                    ModifiedDate: ""
                  })
                }
              }
              else {
                lstCompanyESGDiagnosticQuestionAnswer.push({
                  QuestionGuid: question.questionGuid,
                  AnswerGuid: answer.answerGuid,
                  AnswerText: answer.value,
                  RelatedText: answer.relatedText === undefined ? null : answer.relatedText,
                  CreatedBy: localStorage.userId,
                  CreatedDate: new Date(),
                  ModifiedBy: "",
                  ModifiedDate: ""
                })
              }
            })
        })
      })
    })
    const formData = {
      "CompanyGuid": localStorage.companyGuid,
      "Status": action,
      "lstCompanyESGDiagnosticQuestionAnswer": lstCompanyESGDiagnosticQuestionAnswer
    }
    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
      },
    };
    axios.post(getServiceUrl() + 'MasterData/SaveESGDiagnosticFormDetails', formData, config)
      .then((response) => {
        this.setState({ loader: false })
        if (response.data.table1.length > 0) {
          this.setState({
            showThankPg: true,
            scoreData: response.data.table1,
          });
        }
        else {

          confirmAlert({
            message: 'Data has been saved successfully.',
            buttons: [
              {
                label: 'OK',
              }
            ]
          });
        }
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  handleNext = (e) => {
    e.preventDefault();

    let activeStep;
    if (e.target.innerText.toUpperCase() === 'SUBMIT') {
      confirmAlert({
        message: "Once submitted, the information can't be changed. Are you sure to submit?",
        buttons: [
          {
            label: 'Yes',
            onClick: () => this.handleSubmit('Submit')
          },
          {
            label: 'No',
          }
        ]
      })

    }
    else if (e.target.innerText.toUpperCase() === 'SAVE AS DRAFT') {
      this.handleSubmit('Save As Draft')
    }
    else {
      document.documentElement.scrollTop = 0;
      if (this.isLastStep() && !this.allStepsCompleted()) {
        // It's the last step, but not all steps have been completed,
        // find the first step that has been completed
        const steps = this.state.esgDiagnostic.map((sections) => {
          return sections.section
        });
        activeStep = steps.findIndex((step, i) => !(i in this.state.completed));
      } else {
        activeStep = this.state.activeStep + 1;
      }
      this.setState({
        activeStep
      });
    };
  }

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

  showFormClick = () => {
    this.setState({ showForm: true })
  }

  completedSteps() {
    return Object.keys(this.state.completed).length;
  }

  isLastStep() {
    return this.state.activeStep === this.totalSteps() - 1;
  }
  allStepsCompleted() {
    return this.completedSteps() === this.totalSteps();
  }
  checkBox = (ev) => {
    ev.stopPropagation();
  }
  inputChangedHandler = (event, elementType, sectionIndex, subSectionIndex, questionIndex, dataArray, answerIndex) => {
    const updatedForm = {
      ...this.state.esgDiagnostic
    };
    const updatedFormElement = {
      ...this.state.esgDiagnostic[sectionIndex].lstSubsectionDeatils[subSectionIndex].lstQuestions[questionIndex]
    };
    if (elementType === 'Text') {
      updatedFormElement.lstAnswers[answerIndex].value = event.target.value;
    }
    if (elementType === 'RelatedText') {
      updatedFormElement.lstAnswers[answerIndex].relatedText = event.target.value;
    }
    else if (elementType === 'Radio') {
      updatedFormElement.lstAnswers.map((answer, index) => {
        updatedFormElement.lstAnswers[index].isSelected = false;
      })
      updatedFormElement.lstAnswers[answerIndex].isSelected = true;
    }
    else if (elementType === 'Select') {
      let answerArray = updatedFormElement.lstAnswers[answerIndex].value;
      if (answerArray !== null && answerArray !== undefined) {
        answerArray = updatedFormElement.lstAnswers[answerIndex].value.split('~');
      }
      else {
        answerArray = [];
      }

      if (event.currentTarget.checked) {
        if (dataArray.filter(x => x.regionGuid == event.target.value).length) {
          dataArray.filter(x => x.regionGuid == event.target.value)[0].listCountry.map((item) => {
            answerArray.push(item.countryGuid)
          })
          answerArray.push(event.target.value)
        }
        else {
          let region = '';
          dataArray.map((data, index) => {
            if (dataArray[index].listCountry.filter(x => x.countryGuid == event.target.value).length) {
              region = dataArray[index].regionGuid;
            }
          })
          let filteredArray = dataArray.filter(x => x.regionGuid == region)[0]
          answerArray.push(event.target.value)
          let isExists = true;
          filteredArray.listCountry.map((item) => {
            if (answerArray.indexOf(item.countryGuid) > -1) {
              if (isExists) {
                isExists = true;
              }
            }
            else {
              isExists = false;
            }

            if (isExists) {
              answerArray.push(region)
            }
            else {
              answerArray = answerArray.filter(e => e !== region);
            }
          })

        }
      }
      else {
        if (dataArray.filter(x => x.regionGuid == event.target.value).length) {
          dataArray.filter(x => x.regionGuid == event.target.value)[0].listCountry.map((item) => {
            answerArray = answerArray.filter(e => e !== item.countryGuid);
          })
          answerArray = answerArray.filter(e => e !== event.target.value);
        }
        else {
          answerArray = answerArray.filter(e => e !== event.target.value);
          let region = '';
          dataArray.map((data, index) => {
            if (dataArray[index].listCountry.filter(x => x.countryGuid == event.target.value).length) {
              region = dataArray[index].regionGuid;
            }
          })
          answerArray = answerArray.filter(e => e !== region);
        }

      }
      updatedFormElement.lstAnswers[answerIndex].value = answerArray.join('~');
      updatedFormElement.answerText = event.currentTarget.checked
      if (updatedFormElement.lstAnswers[answerIndex].value === '') {
        updatedFormElement.lstAnswers[answerIndex].value = null;
      }
    }
    else if (elementType === 'Check') {
      {
        if (event.currentTarget.checked) {
          updatedFormElement.lstAnswers[answerIndex].isSelected = true;
        }
        else {
          updatedFormElement.lstAnswers[answerIndex].isSelected = false;
        }
      }
    }

    let esgDiagnostic = JSON.parse(JSON.stringify(this.state.esgDiagnostic))
    esgDiagnostic[sectionIndex].lstSubsectionDeatils[subSectionIndex].lstQuestions[questionIndex] = updatedFormElement
    this.setState({ esgDiagnostic: esgDiagnostic });

  }
  sortJson(element, prop, propType, asc) {
    switch (propType) {
      case "int":
        element = element.sort(function (a, b) {
          if (asc) {
            return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
          } else {
            return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
          }
        });
        break;
      default:
        element = element.sort(function (a, b) {
          if (asc) {
            return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
          } else {
            return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
          }
        });
    }
  }
  async getQuestionnaire(companyGuid) {
    var config = {
      headers: {
        "Authorization": "Bearer " + localStorage.tokenId,
        'Content-Type': 'application/json',
        'companyGuid': companyGuid,

      },
    };
    await axios.get(getServiceUrl() + 'MasterData/GetESGDiagnosticFormDetails?', config)
      .then((response) => {
        this.sortJson(response.data.lstSectionDetails, "sequence", "int", true);
        this.setState({
          esgDiagnostic: response.data.lstSectionDetails
        });
        this.setState({ statusName: response.data.statusName })
        if (response.data.statusName == 'Submit') {
          this.setState({ showForm: true })
        }
        else {
          this.setState({ showForm: false })
        }
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }
  getCountryRegion() {
    getElasticData(
      getWebsiteGUID() + "_regioncountry",
      "",
      0,
      0,
      ""
    ).then(json => {
      if (json !== null) {
        if (json.hits.hits[0] !== undefined) {
          let dataArray = [];
          json.hits.hits.filter(x => x._source.listCountry !== undefined).map((item) => {
            dataArray.push(
              {
                regionName: item._source.regionName,
                regionGuid: item._source.regionGuid,
                listCountry: item._source.listCountry,
              }
            )
          })
          this.setState({ dataArray: dataArray });
        }
      }
    });
  }
  async componentDidMount() {
    window.addEventListener('scroll', this.listenScrollEvent)
    this.getCountryRegion();
    let companyGuid = localStorage.companyGuid;
    let url = new URL(window.location.href);

    if (url.searchParams.get('company')) {
      companyGuid = url.searchParams.get('company');
    }
    await this.getQuestionnaire(companyGuid);
    this.setState({
      stepsArray: this.state.esgDiagnostic.map((sections) => {
        return sections.section
      })
    });
  }

  getFocusAreaName=(companyGuid,focusArea)=>{
    let newFocusArea=focusArea;
    if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Environment'){
      newFocusArea = 'Environmental Risk & Impact Management';
    }else if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Workplace'){
      newFocusArea = 'Labor and Working Conditions';
    }else if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Marketplace'){
      newFocusArea = 'Data Disclosure';
    }else if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Community'){
      newFocusArea = 'Minority Shareholders';
    }else if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Purpose'){
      newFocusArea = 'Leadership & Culture';
    }else if(companyGuid === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' && focusArea === 'Governance'){
      newFocusArea = 'Structure and Functioning of Board of Directors';
    }
    return newFocusArea
  }

  render() {
    if (this.state.loader) {
      return <Spinner />
    }
    if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
      if (
        localStorage.getItem("IsAuthentic") === "true" ||
        localStorage.getItem("IsAuthentic") === true
      ) {

      } else {
        return <Redirect to="/" />;
      }
    } else {
      return <Redirect to="/home" />;
    }

    if (this.state.stepsArray.length > 0) {
      const { classes } = this.props;
      const { activeStep } = this.state;
      const steps = this.state.esgDiagnostic.map((sections) => {
        return sections.section
      });
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
      let questionsSection = null;
      return (
        <div className="">
          <div className="quetionAnsers">
            {this.state.showForm === true && this.state.showThankPg === false ? <React.Fragment>
              <div className={this.state.stick ? "sticky quetionAnsers_header":"quetionAnsers_header"}>
                <div className="form_title">
                {localStorage.getItem('companyGuid') === 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                  <h5>ESG Diagnostic - Questionnaire for Somerset Portfolio Companies</h5>}
                  {localStorage.getItem('companyGuid') === 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' &&
                  <h5>ESG Diagnostic - Questionnaire for Fireside Portfolio Companies</h5>}
                  {localStorage.getItem('companyGuid') !== 'bb3fabe7-e7db-49bf-8900-18a65e05bf0d' && localStorage.getItem('companyGuid') !== 'a10f5266-03e9-4142-9e7a-8c5f690efdc8' &&
                  <h5>ESG Diagnostic - Questionnaire</h5>}
                </div>
                <Stepper alternativeLabel connector={connector} activeStep={activeStep}>
                  {steps.map((label, index) => (
                    <Step
                      key={label}
                      classes={{
                        root: classes.step,
                        completed: classes.completed,
                        active: classes.active
                      }}
                    >
                      <StepButton  disabled={false} completed={false} onClick={this.handleStep(index)}>
                        <StepLabel
                          classes={{
                            alternativeLabel: classes.alternativeLabel,
                            labelContainer: classes.labelContainer
                          }}
                          StepIconProps={{
                            classes: {
                              root: classes.step,
                              completed: classes.completed,
                              active: classes.active,
                              disabled: classes.disabled
                            }
                          }}
                        >
                          {label}
                        </StepLabel>
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </div>
              <div className="quetionAnsers_pannel">
                {activeStep === steps.length ? (
                  <div>
                    <p>All steps completed - you&apos;re finished</p>
                    <Button onClick={this.handleReset}>Reset</Button>
                  </div>
                ) : (
                    <div>
                      <div>
                        {this.state.esgDiagnostic.map((sections, sectionIndex) => {
                          {
                            return activeStep === sectionIndex && (
                              sections.lstSubsectionDeatils.map((subSection, subSectionIndex) => {
                                this.sortJson(subSection.lstQuestions, "sequence", "int", true);

                                return subSection.lstQuestions.map((question, questionIndex) => {
                                  this.sortJson(question.lstAnswers, "sequence", "int", true);
                                  return <div key={questionIndex}>
                                    <div className="quetions_main">
                                      {/* {console.log(111,question)} */}
                                      <div className="question_Div">
                                        <h6>{question.sequence}. {question.question}</h6>
                                      </div>
                                      <div className="question_Description_Div">
                                        <p>
                                          {question.description}
                                        </p>
                                      </div>
                                      <div className="newThemeInput answer_Div">
                                        {
                                          question.lstAnswers.map((option, optionIndex) => {

                                            if (option.type === 'Radio') {
                                              let returnRadioGroup = [];
                                              returnRadioGroup.push(
                                                <React.Fragment>
                                                  <Input
                                                    disabled={this.state.statusName === 'Submit' ? true : false}
                                                    value={option.answerGuid}
                                                    isSelected={option.isSelected}
                                                    key={optionIndex}
                                                    answerGuid={question.answerGuid}
                                                    elementType={option.type}
                                                    class={option.class}
                                                    label={option.label}
                                                    changed={(event) => this.inputChangedHandler(
                                                      event,
                                                      option.type,
                                                      sectionIndex,
                                                      subSectionIndex,
                                                      questionIndex,
                                                      this.state.dataArray,
                                                      optionIndex
                                                    )} />
                                                  {option.enableRelatedInput == true ? <input
                                                    disabled={this.state.statusName === 'Submit' ? true : false}
                                                    value={option.relatedText}
                                                    type={option.isSelected == true ? 'input' : 'hidden'}
                                                    onChange={(event) => this.inputChangedHandler(
                                                      event,
                                                      'RelatedText',
                                                      sectionIndex,
                                                      subSectionIndex,
                                                      questionIndex,
                                                      this.state.dataArray,
                                                      optionIndex
                                                    )} /> : null}

                                                </React.Fragment>
                                              )
                                              return <React.Fragment>
                                                <RadioGroup
                                                  className="radioInput"
                                                  aria-label="position"
                                                  valueGuid={option.answerGuid}
                                                  row>
                                                  {returnRadioGroup}
                                                </RadioGroup>

                                              </React.Fragment>
                                            }
                                            else if (option.type === 'Text') {
                                              return <React.Fragment>
                                                <Input
                                                  disabled={this.state.statusName === 'Submit' ? true : false}
                                                  valueGuid={option.answerGuid}
                                                  //valueText={answerArray == null ? option.answerText : answerArray[optionIndex]}
                                                  valueText={option.answerText}
                                                  valueTextBox={option.value}
                                                  key={optionIndex}
                                                  answerGuid={question.answerGuid}
                                                  answerText={question.answerText}
                                                  label={option.label}
                                                  elementType={option.type}
                                                  class={option.class}
                                                  options={this.state.dataArray}
                                                  changed={(event) => this.inputChangedHandler(
                                                    event,
                                                    option.type,
                                                    sectionIndex,
                                                    subSectionIndex,
                                                    questionIndex,
                                                    this.state.dataArray,
                                                    optionIndex
                                                  )}

                                                />
                                              </React.Fragment>
                                            }
                                            else if (option.type === 'Select') {
                                              return <React.Fragment>
                                                <Input
                                                  disabled={this.state.statusName === 'Submit' ? true : false}
                                                  valueGuid={option.answerGuid}
                                                  valueText={option.answerText}
                                                  checked={option.isSelected}
                                                  valueTextBox={question.answerText}
                                                  key={optionIndex}
                                                  answerGuid={option.value}
                                                  answerText={question.answerText}
                                                  label={option.label}
                                                  elementType={option.type}
                                                  class={option.class}
                                                  options={this.state.dataArray}
                                                  changed={(event) => this.inputChangedHandler(
                                                    event,
                                                    option.type,
                                                    sectionIndex,
                                                    subSectionIndex,
                                                    questionIndex,
                                                    this.state.dataArray,
                                                    optionIndex
                                                  )}

                                                />
                                              </React.Fragment>
                                            }
                                            else if (option.type === 'Check') {
                                              return <div className="checkbox_radio_input">
                                                <Input
                                                  disabled={this.state.statusName === 'Submit' ? true : false}
                                                  valueGuid={option.answerGuid}
                                                  valueText={option.answerText}
                                                  checked={option.isSelected}
                                                  valueTextBox={question.answerText}
                                                  key={optionIndex}
                                                  answerGuid={option.value}
                                                  answerText={question.answerText}
                                                  label={option.label}
                                                  elementType={option.type}
                                                  class={option.class}
                                                  options={this.state.dataArray}
                                                  changed={(event) => this.inputChangedHandler(
                                                    event,
                                                    option.type,
                                                    sectionIndex,
                                                    subSectionIndex,
                                                    questionIndex,
                                                    this.state.dataArray,
                                                    optionIndex
                                                  )} />
                                                {option.enableRelatedInput == true ? <input
                                                  disabled={this.state.statusName === 'Submit' ? true : false}
                                                  value={option.relatedText}
                                                  type={option.isSelected == true ? 'input' : 'hidden'}
                                                  onChange={(event) => this.inputChangedHandler(
                                                    event,
                                                    'RelatedText',
                                                    sectionIndex,
                                                    subSectionIndex,
                                                    questionIndex,
                                                    this.state.dataArray,
                                                    optionIndex
                                                  )} /> : null}
                                              </div>
                                            }
                                            else {
                                              return <React.Fragment>
                                                <Input
                                                  disabled={this.state.statusName === 'Submit' ? true : false}
                                                  valueGuid={option.answerGuid}
                                                  valueText={option.answerText}
                                                  checked={option.isSelected}
                                                  valueTextBox={question.answerText}
                                                  key={optionIndex}
                                                  answerGuid={option.value}
                                                  answerText={question.answerText}
                                                  label={option.label}
                                                  elementType={option.type}
                                                  class={option.class}
                                                  options={this.state.dataArray}
                                                  changed={(event) => this.inputChangedHandler(
                                                    event,
                                                    option.type,
                                                    sectionIndex,
                                                    subSectionIndex,
                                                    questionIndex,
                                                    this.state.dataArray,
                                                    optionIndex
                                                  )}

                                                />
                                              </React.Fragment>
                                            }
                                          })
                                        }

                                      </div>
                                      <div className="question_Description_Div">
                                        <p>
                                          {question.note}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                })
                              }))
                          }
                        })}

                      </div>
                      <div className="quetionair_action">
                        <div>
                          <Button
                            // disabled={activeStep === 0}
                            onClick={this.handleBack}
                            //   className={classes.button}
                            blackBtnSimple
                          >
                            Back
                      </Button>
                          {this.state.statusName === 'Submit' ? <React.Fragment>
                            {activeStep === steps.length - 1 ? null : <Button
                              variant="contained"
                              color="primary"
                              onClick={(e) => this.handleNext(e)}
                              orangeSubmit>Next</Button>}
                          </React.Fragment> : <React.Fragment><Button orangeSubmit onClick={(e) => this.handleNext(e)}>
                            Save as draft
                      </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={(e) => this.handleNext(e)}
                                orangeSubmit
                              //   className={classes.button}
                              >
                                {activeStep === steps.length - 1 ? "Submit" : "Next"}
                              </Button></React.Fragment>}
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
            </React.Fragment>
              : this.state.showThankPg == false ? <QnAStartup showQuestionForm={(e) => this.showFormClick(e)} /> : null}
            {this.state.showThankPg && <SurveyThankPg scoreData={this.state.scoreData} esgDiagnostic={this.state.esgDiagnostic} />}
          </div>
        </div>
      );
    }
    else {
      return null
    }
  }
}
export default withStyles(styles)(Quetionair);
