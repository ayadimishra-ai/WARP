export const OPsNavigatorOneTime = {
    navigateToInvitationListingPage: (browserHistory) => {
        if (!browserHistory) return;
        browserHistory.push("/assessmentsonetime/#/assessment_listing");
    },
    navigateToAssessment: (browserHistory, State, invitationId, assessmentFormName, comapnyName, questionId) => {
        
        if (!browserHistory) return;
        let url = '';
        if (questionId !== '' && questionId !== undefined) {
            url = `/assessmentsonetime/scoring_test/${invitationId}/${State}?questionid=${questionId}&assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
       }
        else {
            url = `/assessmentsonetime/scoring_test/${invitationId}/${State}?assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
       }
        
        const params = { assessmentFormName: assessmentFormName, comapnyName: comapnyName, questionId: questionId };
        browserHistory.push(url, params);
    },
}

export const OPsNavigatorMonthly = {
    navigateToInvitationListingPage: (browserHistory) => {
        if (!browserHistory) return;
        browserHistory.push("/assessmentsmonthly/#/assessment_listing");
    },
    navigateToAssessment: (browserHistory, State, invitationId, assessmentFormName, comapnyName, questionId) => {
        
        if (!browserHistory) return;
        let url = '';
        if (questionId !== '' && questionId !== undefined) {
            url = `/assessmentsmonthly/scoring_test/${invitationId}/${State}?questionid=${questionId}&assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
       }
        else {
            url = `/assessmentsmonthly/scoring_test/${invitationId}/${State}?assessmentname=${assessmentFormName}&companyname=${comapnyName}`;
       }
        
        const params = { assessmentFormName: assessmentFormName, comapnyName: comapnyName, questionId: questionId };
        browserHistory.push(url, params);
    },
}

export const CheckIsDaimlerCompany = () => {
    const daimlerOrganizationIds = [
        "b5669570-32ef-41a8-8ac7-18f37231f137", //daimler AG
        "d4a95cdd-3a70-4be9-8b26-2142a2fc73ba" //test india
    ]; // changes to hide the sub menu for other org
    const Currentcompany = localStorage.getItem("companyGuid");
    return daimlerOrganizationIds.includes(Currentcompany);
}