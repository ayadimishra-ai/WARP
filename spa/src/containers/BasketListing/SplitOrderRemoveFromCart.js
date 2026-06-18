import React, { Component } from 'react';
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import { connect } from 'react-redux';
import * as actionCreators from '../../store/actions/index';
import { getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import { getPageResource, toasterAlert } from '../../utility';
import Delete from "@material-ui/icons/Delete";
import { confirmAlert } from 'react-confirm-alert';
import { splitOrderRemoveFromCart } from '../../components/Basket/CommonBasket'
import Tooltip from '@material-ui/core/Tooltip';
import toaster from 'toasted-notes';

class SplitOrderRemoveFromCart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageresources: '',
        }
    }
    componentDidMount() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'cartdetail') + '&size=10000')
            .then(json => {
                this.setState({ languageresources: json, showResources: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    checkRemoveFromCart = (event, productGuid) => {
        let SkuGuid = this.props.BasketData.filter(x => x.basketGuid === this.props.BasketGuid)[0].skuGuid;
        let VariantName = this.props.BasketData.filter(x => x.basketGuid === this.props.BasketGuid)[0].variantName;
        let data = this.props.BasketData.filter(x => x.skuGuid === SkuGuid);
        if (data.length > 1) {
            this.splitOrderRemove(event, productGuid)
        }
        else {
            toaster.notify(toasterAlert('FAIL', 'Atleast one commitment for ' + VariantName + ' is required'), {
                duration: null
            })
        }
    }

    splitOrderRemove = (event, productGuid) => {
        confirmAlert({
            //title: 'Confirm to submit',
            //message: getLabelText(this.state.languageresources.filter((x) => { return x.resourceKey === 'deleteconfirmmessage' })[0], "cartdetail"),
            message: "Are you sure to remove item from the cart?",
            buttons: [
                {
                    label: 'YES',
                    onClick: () => {
                        splitOrderRemoveFromCart(productGuid,
                            this.props.userId,
                            localStorage.companyGuid,
                            localStorage.languageId,
                            this.props.BasketGuid,
                            this.props.SkuGuid,
                            this.props.BuyingWindowGuid)
                            .then((json) => {
                                if (json.status === 200) {
                                    localStorage.removeItem('prodIncart');
                                    this.props.onRemoveToCart(false, this.props.BasketGuid, json.data.table1);
                                }
                            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                    }
                },
                {
                    label: 'NO',
                    // onClick: () => alert('Click No')
                }
            ]
        });
    }

    render() {
        let cartIcon = <ShoppingCart />
        if (this.props.className === "remove-all-variant") {
            cartIcon = <Delete />
        }
        return (
            <React.Fragment>
                <Tooltip title="Remove from cart">
                    <span className="remove_cart" onClick={(event) => this.checkRemoveFromCart(event, this.props.ProductGuid)}>
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
        onGetCartCounter: (userId, languageId) => dispatch(actionCreators.cartCounter(userId, languageId))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(SplitOrderRemoveFromCart);