import Tooltip from '@material-ui/core/Tooltip';
import Add from "@material-ui/icons/Add";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../store/actions/index';
import { addToCart } from '../Basket/CommonBasket';

class AddToCart extends Component {
    addToBasket = (productGuid, SkuVariants, SkuGuid, FromCart) => {
        if (localStorage.CSQtychangederror === "true" || localStorage.CFQtychangederror === "true") { }
        else {
            addToCart(productGuid, SkuVariants, SkuGuid, FromCart, this.props.userId, localStorage.companyGuid, localStorage.languageId).then((json) => {
                ;
                if (json.status === 200) {
                    localStorage.setItem('productaddedtocart', 'true')
                    this.props.onAddToCart(true, productGuid, json.data.table1[0], json.data.table2, json.data.table3, json.data.table4);
                    this.props.onGetCartCounter(this.props.userId, localStorage.languageId);
                }
                else {
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
        }
    }

    render() {
        let cartIcon = this.props.className === "details_page" ? '' : <img src={require("../../assets/img/add_to_cart_icon.svg")} />;
        let cartDetailPageIcon = <div className='addtoCartIconPDP'>
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="25" viewBox="0 0 23 25" fill="none">
                <path d="M4.31262 9.49193L4.00505 7.64578H2.90105C2.73637 7.0107 2.16332 6.53809 1.47692 6.53809C0.6624 6.53809 0 7.20049 0 8.01501C0 8.82953 0.6624 9.49193 1.47692 9.49193C2.16332 9.49193 2.73637 9.01932 2.90142 8.38424H3.3792L3.56382 9.49193H3.54978L5.45908 19.0978C4.54892 19.1673 3.79089 19.8681 3.70154 20.7498C3.64911 21.2685 3.81969 21.7881 4.16972 22.1743C4.52012 22.5616 5.01932 22.7842 5.53846 22.7842H6.27692C6.27692 24.006 7.27052 24.9996 8.49231 24.9996C9.71409 24.9996 10.7077 24.006 10.7077 22.7842H14.7692C14.7692 24.006 15.7628 24.9996 16.9846 24.9996C18.2064 24.9996 19.2 24.006 19.2 22.7842H20.6769C20.8811 22.7842 21.0462 22.6192 21.0462 22.415C21.0462 22.2108 20.8811 22.0458 20.6769 22.0458H19.0708C18.7658 21.1866 17.9472 20.5689 16.9846 20.5689C16.022 20.5689 15.2034 21.1866 14.8985 22.0458H10.5785C10.2735 21.1866 9.45489 20.5689 8.49231 20.5689C7.52972 20.5689 6.71114 21.1866 6.40615 22.0458H5.53846C5.22757 22.0458 4.92849 21.9121 4.71729 21.6791C4.50425 21.4432 4.40418 21.1397 4.43631 20.824C4.49243 20.2668 5.00714 19.8308 5.60788 19.8308H5.89994C5.90511 19.8308 5.90917 19.8308 5.91434 19.8308H20.3121C21.3279 19.8304 22.1538 19.0044 22.1538 17.989V9.49193H4.31262ZM1.47692 8.75347C1.06966 8.75347 0.738462 8.42227 0.738462 8.01501C0.738462 7.60775 1.06966 7.27655 1.47692 7.27655C1.88418 7.27655 2.21538 7.60775 2.21538 8.01501C2.21538 8.42227 1.88418 8.75347 1.47692 8.75347ZM16.9846 21.3073C17.7991 21.3073 18.4615 21.9697 18.4615 22.7842C18.4615 23.5988 17.7991 24.2612 16.9846 24.2612C16.1701 24.2612 15.5077 23.5988 15.5077 22.7842C15.5077 21.9697 16.1701 21.3073 16.9846 21.3073ZM8.49231 21.3073C9.30683 21.3073 9.96923 21.9697 9.96923 22.7842C9.96923 23.5988 9.30683 24.2612 8.49231 24.2612C7.67778 24.2612 7.01538 23.5988 7.01538 22.7842C7.01538 21.9697 7.67778 21.3073 8.49231 21.3073ZM21.4154 17.989C21.4154 18.5972 20.9206 19.0919 20.3125 19.0919H6.21083L4.4496 10.2304H21.4154V17.989Z" fill="white" />
                <path d="M13.4229 1C13.4229 0.723858 13.199 0.5 12.9229 0.5C12.6467 0.5 12.4229 0.723858 12.4229 1H13.4229ZM12.5693 7.81509C12.7646 8.01035 13.0811 8.01035 13.2764 7.81509L16.4584 4.63311C16.6536 4.43785 16.6536 4.12127 16.4584 3.926C16.2631 3.73074 15.9465 3.73074 15.7513 3.926L12.9229 6.75443L10.0944 3.926C9.89916 3.73074 9.58258 3.73074 9.38732 3.926C9.19206 4.12127 9.19206 4.43785 9.38732 4.63311L12.5693 7.81509ZM12.4229 1V7.46154H13.4229V1H12.4229Z" fill="white" />
            </svg>
        </div>
        let basketaddtocartIcon;
        if (this.props.className === "add-variant") {
            cartIcon = <Add />
            basketaddtocartIcon = <span className="basketaddtocarticon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13.5799 7.90918V10.0131H11.2621V10.7144H13.5799V12.8183H14.3526V10.7144H16.6704V10.0131H14.3526V7.90918H13.5799Z" fill="#666666" stroke="#454545" stroke-linejoin="round" />
                    <path d="M7.89498 7V15C7.89498 15.5304 8.10552 16.0391 8.48026 16.4142C8.85501 16.7893 9.36328 17 9.89326 17H15.8881M7.89498 7V5C7.89498 4.46957 8.10552 3.96086 8.48026 3.58579C8.85501 3.21071 9.36328 3 9.89326 3H14.4753C14.7403 3.00006 14.9944 3.10545 15.1817 3.293L19.5919 7.707C19.7793 7.89449 19.8846 8.1488 19.8846 8.414V15C19.8846 15.5304 19.6741 16.0391 19.2993 16.4142C18.9246 16.7893 18.4163 17 17.8863 17H15.8881M7.89498 7H5.89671C5.36674 7 4.85847 7.21071 4.48372 7.58579C4.10897 7.96086 3.89844 8.46957 3.89844 9V19C3.89844 19.5304 4.10897 20.0391 4.48372 20.4142C4.85847 20.7893 5.36674 21 5.89671 21H13.8898C14.4198 21 14.928 20.7893 15.3028 20.4142C15.6775 20.0391 15.8881 19.5304 15.8881 19V17" stroke="#454545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </span>
        }
        return (
            <React.Fragment>
                <Tooltip title={this.props.className === "add-variant" ? "Copy" : "Add to cart"}>
                    <span onClick={() => this.addToBasket(this.props.ProductGuid, this.props.SkuVariants, this.props.SkuGuid, this.props.FromCart)} ref className={this.props.isProductExpired === 'Yes' || this.props.ProductPrice === 0 ? "disabled" : ''}>
                        {this.props.basketIcon ? basketaddtocartIcon : cartIcon}
                        {cartDetailPageIcon}
                        {this.props.className === "add-variant" ? '' : <span>Add to cart</span>}
                    </span>
                </Tooltip>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.login.languageId,
        companyGuid: state.login.companyGuid
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(AddToCart);