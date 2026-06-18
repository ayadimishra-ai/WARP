import React, { Component } from 'react';
import Favorite from '@material-ui/icons/Favorite';
import Delete from "@material-ui/icons/Delete";
import { confirmAlert } from 'react-confirm-alert';
import { removefromWishList } from '../Basket/CommonBasket'
import * as actionCreators from '../../store/actions/index';
import { connect } from 'react-redux';
import { getLabelText } from '../../config';
import Tooltip from '@material-ui/core/Tooltip';
import { createBrowserHistory } from 'history';

const createBrowserHistorypush = createBrowserHistory({ forceRefresh: true });

class RemoveFromWishList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageresources: '',
        }
    }

    componentDidUpdate() {
        if (localStorage.isRemoved !== undefined && localStorage.isRemoved === 'true') {
            var path = window.location.href;
            var page = path.split("/").pop();
            localStorage.setItem('isRemoved', false);
            createBrowserHistorypush.push("/" + page);
        } else {

        }
    }

    removeFromWishList = (productGuid) => {
        confirmAlert({
            message: this.props.languageresources !== undefined ? getLabelText(this.props.languageresources.filter((x) => { return x.resourceKey === 'deletewishlistconfirmmessage' })[0], "Remove From Wishlist?") : "Remove From Wishlist",
            buttons: [
                {
                    label: 'YES',
                    onClick: async () => {
                       await removefromWishList(productGuid, this.props.userId, localStorage.companyGuid, localStorage.languageId, this.props.WishListGuid)
                            .then((json) => {
                                if (json.status === 200) {
                                    //alert('Item Deleted');
                                    localStorage.removeItem('prodInwishlist');
                                    this.props.onGetWishlistCounter(this.props.userId, localStorage.languageId);
                                    this.props.onRemoveToWishList(false, productGuid);
                                    localStorage.setItem('isRemoved', true);
                                }
                            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                    }
                },
                {
                    label: 'NO',
                }
            ]
        });
    }

    componentDidUpdate() {
        if (localStorage.isRemoved !== undefined && localStorage.isRemoved === 'true') {
            var path = window.location.href;
            var page = path.split("/").pop();
            localStorage.setItem('isRemoved', false);
            createBrowserHistorypush.push("/" + page);
        } else {
        }
    }

    render() {
        let wishListIcon = <Favorite />
        if (this.props.className === "remove-all-variant") {
            wishListIcon = <Delete />
        }
        return (
            <React.Fragment>
                <Tooltip title="Remove from Wishlist">
                    <span className="remove_cart" onClick={() => this.removeFromWishList(this.props.ProductGuid)}>
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
export default connect(mapStateToProps, mapDispatchToProps)(RemoveFromWishList);