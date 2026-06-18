import React, { Component } from 'react';
import Favorite from '@material-ui/icons/Favorite';
import { addToWishList } from '../Basket/CommonBasket'
import Add from "@material-ui/icons/Add";
import { connect } from 'react-redux';
import * as actionCreators from '../../store/actions/index';
import Tooltip from '@material-ui/core/Tooltip';

class AddtoWishlist extends Component {
    // constructor(props) {
    //     super(props);
    // }
    addToWishList = (productGuid) => {
        addToWishList(productGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId).then((json) => {
            if (json.status === 200) {
                //alert('Added to WishList');     
                this.props.onGetWishlistCounter(this.props.userId, localStorage.languageId);
                this.props.onAddToWishList(true, productGuid);
            }            
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    render() {
        let wishListIcon = <Favorite />
        if (this.props.className === "add-variant") {
            wishListIcon = <Add />
        }
        return (
            <React.Fragment>
                <Tooltip title="Add To Wishlist">
                    <span onClick={() => this.addToWishList(this.props.ProductGuid)} ref className={this.props.isProductExpired === 'Yes' ? "disabled" : ''}>
                        {wishListIcon}
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
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId)),
        onGetWishlistCounter: (userId, languageId) => dispatch(actionCreators.wishlistCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(AddtoWishlist);