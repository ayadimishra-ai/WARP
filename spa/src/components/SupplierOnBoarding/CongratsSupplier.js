import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import { getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText } from '../../config';
import { getPageResource } from '../../utility';
import Spinner from "../../UI/Spinner/Spinner";
import ToManyRequestMessage from "../Common/ToManyRequestMessage";


class CongratsSupplier extends Component {
    constructor(props) {
        super(props);
        this.state = {
            YourName: this.props.YourName,
            BusinessTypeName: this.props.BusinessTypeName,
            isBuyer: this.props.isBuyer,
            resources: [],
            loading: false
        }
    }

    componentDidMount() {
        this.getLanguageResource();
        localStorage.setItem('isFirstRegistered', true)
        localStorage.setItem('isFirstLogin', true)
    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    SessionLoginHandler = () => {
        const { onCompleteProfilePage = f => f } = this.props;
        onCompleteProfilePage();
    }

    SubmitDocumentHandler = () => {
        const { onSubmitDocument = f => f } = this.props;
        onSubmitDocument();
        this.setState({ loading: true }, () => {
            setTimeout(() => {
                this.setState({ loading: false })
            }, 7000);
        })
    }

    explorerHandler = () => {
        const { onHomePage = f => f } = this.props;
        onHomePage();
    }

    render() {
        const { resources } = this.state;
        return (
            <form>
                <div className="signuprForms">
                    <div className="Verify_Email_supplierSignup">
                        {/* <div id="container1">
                            <div className="firework-grp">
                                <div className="firework pos1 ">
                                    <div className="drops-grp">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                    <div className="drops-grp drops-grp2">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                </div>
                                <div className="firework pos2 delay1">
                                    <div className="drops-grp">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                    <div className="drops-grp drops-grp2">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                </div>
                                <div className="firework pos3 delay2">
                                    <div className="drops-grp">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                    <div className="drops-grp drops-grp2">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                </div>
                                <div className="firework pos4 ">
                                    <div className="drops-grp">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                    <div className="drops-grp drops-grp2">
                                        <span className="drop drop-1"></span>
                                        <span className="drop drop-2"></span>
                                        <span className="drop drop-3"></span>
                                        <span className="drop drop-4"></span>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>*/}
                        <div className="congrats_text">
                            {/* <p>You are now registered on our sustainable supply chain collaborative network. Please complete your onboarding as a {this.props.BusinessTypeText.toLowerCase()} to start business on the marketplace.</p> */}
                            <p>You are now registered on our ESG Assessment Platform. Please complete your onboarding as a portfolio to start the assessment and view the analysis on the dashboard.</p>
                            {/* <h3>Sustainable Supply Chain Collaborative
                                Network Marketplace!</h3>
                            <p>You can now:</p>
                            <ul>
                                <li>Complete your enterprise profile</li>
                                <li>Define Baseline</li>
                                <li>Create/Respond to RFQ</li>
                            </ul> */}
                        </div>
                    </div>

                    {localStorage.getItem("toManyRequestMessage") && (
                        <ToManyRequestMessage
                            message={localStorage.getItem("toManyRequestMessage")}
                            onClear={() => localStorage.removeItem("toManyRequestMessage")}
                        />
                    )}

                    <div className="form_actions" >
                        {/* <Button className="prev" simple onClick={this.SessionLoginHandler}>
                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'CompleteProile' })[0], "COMPLETE YOUR PROFILE")}
                        </Button> */}
                        {this.state.isBuyer === false ?
                            this.state.loading ? <Spinner /> :
                                <Button className="solid_btn_new" simple onClick={this.SubmitDocumentHandler}>
                                    {getLabelText(resources.filter((x) => { return x.resourceKey === 'SubmitDocument' })[0], "Get Started")}
                                </Button> : ""}

                        {/* <Button className="next" simple onClick={this.explorerHandler}>
                            {getLabelText(resources.filter((x) => { return x.resourceKey === 'registrationhomebutton' })[0], "HOME")}
                        </Button> */}
                    </div>
                </div>
            </form>
        )
    }

}
export default CongratsSupplier