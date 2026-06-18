import React, { Component } from "react";
import { connect } from 'react-redux';
import PRDetails from "../PRDetails/PRDetails";
import queryString from "query-string";
import { getPageResource } from '../../utility';
import { getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config'
import Spinner from "../../UI/Spinner/Spinner";
import * as RoleCodes from "../../rolecodes";
import * as actionCreators from '../../store/actions/index';

class ThankyouPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            OrderId: null,
            languageresources: null
        }
    }
    componentDidMount() {
        if (this.props.userType.includes(RoleCodes.BUYER)) {
            this.props.onGetCartCounter(this.props.userId, this.props.languageId);
            this.props.onGetWishlistCounter(this.props.userId, this.props.languageId);
            this.props.onGetBuyingWindowCounter(this.props.userId, this.props.languageId);
        }
        this.setState({ loading: true });
        let params = queryString.parse(this.props.location.search);
        this.setState({
            OrderId: params.orderId
        })
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'thankyoupage') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json });
                this.setState({ loading: false });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    render() {

        return (
            <React.Fragment>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    {/* <h4>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.
                        filter(x => { return x.resourceKey === "thankyou"; })[0],
                        "Thank You") : ""}</h4>

                    <p>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.
                        filter(x => { return x.resourceKey === "orderplacedsuccessfully"; })[0],
                        "Your order is successfully registered in the system. Your ORDER ID is") : ""} {this.state.OrderId}</p> */}
                    {/* system will notify you as and when the status us ipdated, you can also track it yourself by visting ‘Requests’  section.
                </p>
                <p>We hope you enjoyed shopping through this platform.</p>
                <p>You Feedback is valuable to us, please rate us on your overall experience.</p> */}
                    {/* <div className="order_review">
                    <ul>
                        <li>
                            <img alt=" " src={worst} />
                            <p>Worst</p>
                        </li>
                        <li>
                            <img alt=" " src={poor} />
                            <p>Poor</p>
                        </li>
                        <li>
                            <img alt=" " src={average} />
                            <p>Average</p>
                        </li>
                        <li>
                            <img alt=" " src={satisfied} />
                            <p>Satisfied</p>
                        </li>
                        <li>
                            <img alt=" " src={great} />
                            <p>Great</p>
                        </li>
                    </ul>
                </div>
                <p>Thank you for your feedback.</p> */}
                    {/* <h6>{this.state.languageresources !== null ? getLabelText(this.state.languageresources.
                    filter(x => { return x.resourceKey === "orderdetails"; })[0],
                    "Order Details") : ""}</h6> */}
                    {this.state.OrderId !== null ? <PRDetails
                     OrderId={this.state.OrderId} 
                     /> : ""}
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        languageId: state.login.languageId,
        userId: state.login.userId,
        userType: state.login.userType
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId)),
        onGetBuyingWindowCounter: (userId, languageId) => dispatch(actionCreators.buyingWindowCounter(userId, languageId))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ThankyouPage);