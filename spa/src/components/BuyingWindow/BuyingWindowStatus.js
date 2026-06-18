import React, { Component } from "react";
import { connect } from 'react-redux';
import { addToCart } from '../Basket/CommonBasket'
import PropTypes from 'prop-types';
import { getLabelText } from '../../config';
import recomStar from "../../assets/img/recom_star.png";


class BuyingWindowStatus extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props, context) {
        super(props, context);
    }
    addBuyingWindowToCart = (event, productGuid) => {
        addToCart(productGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId, this.props.BuyingWindowGuid).then((json) => {
            if (json.status === 200) {

                this.context.router.history.push('/product-basket?BWGuid=' + this.props.BuyingWindowGuid);
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');;
    }
    render() {
        let BWStatusMessage = null;
        if (this.props.BuyingWindowStatus === 'Completed') {
            BWStatusMessage = (
                <div>
                    <span onClick={(event) =>
                        this.addBuyingWindowToCart(event, this.props.ProductGuid)}>
                        <h5 className="BW_success_msg" >
                            {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'successbuyingwindow' })[0], "Congratulations ! BuyingWindow is successful")}</h5></span>
                </div>)
        }
        else if (this.props.BuyingWindowStatus === 'Failed') {
            if (this.props.Reason === "productexpiry") {
                BWStatusMessage = (<div>
                    <h5 className="BW_failed_msg">{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'failedbuyingwindow_3' })[0], "Buying Window Failed due to Product/SKU Expiry")}
                    </h5>
                </div>)
            }
            else if (this.props.Reason === "productupdation") {
                BWStatusMessage = (<div>
                    <h5 className="BW_failed_msg">{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'failedbuyingwindow_4' })[0], "Buying Window Failed due to Product/SKU Updation")}
                    </h5>
                </div>)
            } else {
                BWStatusMessage = (<div>
                    <h5 className="BW_failed_msg">{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'failedbuyingwindow_1' })[0], "MOQ Failed due to shortfall of ")} {this.props.MinimumOrderQuantity - this.props.BuyingWindowTotalQuantity} {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'failedbuyingwindow_2' })[0], "units")}</h5>
                    {this.props.SimilarProductCount > 0 ?
                        <div style={{ cursor: 'pointer' }} className="Bw_currentScenario_actions_tab" onClick={(event) => { event.preventDefault(); this.props.SimilarProductScrollCallback() }}>
                            <img alt=" " src={recomStar} />
                            <p>You may like these {parseInt(this.props.SimilarProductCount)} products which are similar</p>
                        </div> : ''}
                </div>)
            }

        }

        return (
            <React.Fragment>

                {BWStatusMessage}

            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.master.languageId
    };
}
export default connect(mapStateToProps)(BuyingWindowStatus);