import { setLastNavigation } from "../utility";
import { FormTypes } from "./warp.constant";

export const WarpNavigator = {
  navigateToInvitationListingPage: (browserHistory) => {
    if (!browserHistory) return;
    browserHistory.push("/assessments");
  },
  navigateToAssessment: (
    browserHistory,
    State,
    invitationId,
    assessmentFormName,
    comapnyName,
    isRecommendationIcon,
    period,
    requestedFrom,
    questionId,
    deviationCount,
    isCarryForward,
    submissionId,
    score
  ) => {
    if (!browserHistory) return;
    let url = "";
    if (State === "intro") {
      if (questionId !== "" && questionId !== undefined) {
        url = `/AssessmentIntroDetails/scoring_test/${invitationId}/${State}?questionid=${questionId}&assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
      } else {
        url = `/AssessmentIntroDetails/scoring_test/${invitationId}/${State}?assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
      }
    } else if (questionId !== "" && questionId !== undefined) {
      url = `/assessmentDetails/scoring_test/${invitationId}/${State}?questionid=${questionId}&assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
    } else {
      url = `/assessmentDetails/scoring_test/${invitationId}/${State}?assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
    }

    const params = {
      assessmentFormName: assessmentFormName,
      comapnyName: comapnyName,
      isRecommendationIcon: isRecommendationIcon,
      period: period,
      requestedFrom: requestedFrom,
      questionId: questionId,
      deviationCount: deviationCount,
      isCarryForward: isCarryForward,
      submissionId: submissionId,
      score: score,
    };
    browserHistory.push(url, params);
  },
  navigateToFileUpload: (
    browserHistory,
    invitationId,
    // action,
    assessmentFormName,
    comapnyName,
    // AIStatus
  ) => {
    if (!browserHistory) return;
    const params = {
      // action: action,
      assessmentFormName: assessmentFormName,
      comapnyName: comapnyName,
      // AIStatus: AIStatus,
    };
    const url = 
        "/ai-statistics/" +
          invitationId +
          "/" +
          assessmentFormName +
          "/" +
          comapnyName;

          console.log('Navigating to:', url)
        // params;
    // if (!!action) {
    //   browserHistory.push(
    //     "/ai-statistics/" +
    //       invitationId +
    //       "/" +
    //       assessmentFormName +
    //       "/" +
    //       comapnyName +
    //       "?action=" +
    //       action,
    //     params
    //   );
    // } else {
      browserHistory.push(url,params);
    // }
  },
    navigateToDocumentRepository: (
    browserHistory,
    formType,
    context
  ) => {
    if (!browserHistory) return;
    const currentPath = window.location.pathname;
    const resolvedSource = formType && formType.toLowerCase();
    // determine context based on singular/plural form
    const formContext = context === "single" ? "single" : "listing";
    setLastNavigation(
      resolvedSource,
      currentPath,
      formContext
    );
    browserHistory.push(
      "/document-repository"
    );
  },
   navigateToListingPage: (browserHistory,formType) => {
    if (!browserHistory) return;
    formType === FormTypes.Report ? browserHistory.push("/reports") : browserHistory.push("/assessments");
  },
};
