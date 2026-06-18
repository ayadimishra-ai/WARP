import Tooltip from '@material-ui/core/Tooltip';
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { splitOrderAddToCart } from '../../components/Basket/CommonBasket';

class SplitOrderAddToCart extends Component {
    constructor(props) {
        super(props);
    }
    addToSplitOrderBasket = (productGuid) => {
        splitOrderAddToCart(productGuid,
            this.props.userId,
            localStorage.companyGuid,
            localStorage.languageId,
            this.props.BuyingWindowGuid,
            this.props.SkuGuid).then((json) => {
                if (json.status === 200) {
                    this.props.onAddToCart(true, productGuid, json.data.table1);
                }
                else {
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    render() {

        let cartIcon = <ShoppingCart />
        if (this.props.className === "add-variant") {
            cartIcon = <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 23 24" fill="none">
                <path d="M13.7314 7V9.57143H10.8984V10.4286H13.7314V13H14.6757V10.4286H17.5086V9.57143H14.6757V7H13.7314Z" fill="#666666" stroke="#666666" stroke-linejoin="round" />
                <path d="M6.7831 5.88889V15.6667C6.7831 16.315 7.04042 16.9367 7.49845 17.3951C7.95647 17.8536 8.57769 18.1111 9.22544 18.1111H16.5524M6.7831 5.88889V3.44444C6.7831 2.79614 7.04042 2.17438 7.49845 1.71596C7.95647 1.25754 8.57769 1 9.22544 1H14.8257C15.1496 1.00007 15.4601 1.12888 15.6891 1.35811L21.0793 6.753C21.3083 6.98216 21.437 7.29298 21.4371 7.61711V15.6667C21.4371 16.315 21.1798 16.9367 20.7218 17.3951C20.2637 17.8536 19.6425 18.1111 18.9948 18.1111H16.5524M6.7831 5.88889H4.34077C3.69302 5.88889 3.07181 6.14643 2.61378 6.60485C2.15575 7.06327 1.89844 7.68503 1.89844 8.33333V20.5556C1.89844 21.2039 2.15575 21.8256 2.61378 22.284C3.07181 22.7425 3.69302 23 4.34077 23H14.1101C14.7579 23 15.3791 22.7425 15.8371 22.284C16.2951 21.8256 16.5524 21.2039 16.5524 20.5556V18.1111" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        }
        return (
            <React.Fragment>
                <Tooltip title="Add to cart">
                    <span className={this.props.className} onClick={() => this.addToSplitOrderBasket(this.props.ProductGuid)} ref>
                        {cartIcon}
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
        //onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(SplitOrderAddToCart);