import Button from '@material-ui/core/Button';
import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import basicsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/basicsStyle.jsx";
import { updateProductBasket } from '../../components/Basket/CommonBasket';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from '../../components/Material/Grid/GridItem';
import Input from '../../UI/Input/MaterialInput';
import { popupAlert } from '../../UI/Popups/popup';

class BasketQuantity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quantity: null,
            quantityChanged: false
        }
    }
    componentDidMount() {
        this.setState({
            quantity: this.props.Quantity
        })

    }
    quantityChangeHandler = (event) => {
        this.setState({ quantity: event.target.value, quantityChanged: true });
        this.props.oncheckAnyQtyUpdate(this.props.BasketGuid, true);
        this.props.onCheckLabel(event.target.value, this.props.BasketGuid);
    }
    updateQuantityHandler = (event, UnitPrice) => {
        if (this.props.UoM === 'Pieces') {
            if (this.state.quantity % 1 != 0) {
                // toaster.notify(toasterAlert('WARNING', 'Decimal is not allowed for UoM Pieces'), {
                //     duration: null
                // })
                popupAlert('error', 'Error', 'Decimal is not allowed for UoM Pieces')

                this.props.oncheckAnyQtyUpdate(this.props.BasketGuid, false);
                this.props.onCheckLabel(parseInt(this.state.quantity), this.props.BasketGuid);
                this.setState({ quantityChanged: false });
                return
            }
        }
        let SameProductList = this.props.ProductBasketData.filter(x => x.productGuid === this.props.ProductGuid);
        let SameProductSKUList = this.props.ProductBasketData.filter(x => x.productGuid === this.props.ProductGuid && x.skuGuid === this.props.SKUGuid);
        let totalProductListQuantity = SameProductList.map(item => parseFloat(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        let totalSKUListQuantity = SameProductSKUList.map(item => parseInt(item.quantity)).reduce((prev, curr) => prev + curr, 0)
        if (this.props.BuyingWindowGuid !== null) {
            if (parseInt(this.state.quantity) !== 0) {
                if (event !== null) {
                    var paramters = {
                        'BasketGuid': this.props.BasketGuid,
                        'Quantity': this.state.quantity,
                        'Price': UnitPrice
                    };
                    updateProductBasket(paramters)
                        .then((json) => {
                            if (json.status === 200) {
                                // toaster.notify(toasterAlert('SUCCESS', 'Quantity Updated'), {
                                //     duration: null
                                // })
                                popupAlert('success', 'Success', 'Quantity Updated')

                                //alert('Quantity Updated');
                                this.props.oncheckAnyQtyUpdate(this.props.BasketGuid, false);
                                this.props.onCheckLabel(this.state.quantity, this.props.BasketGuid);
                                this.setState({ quantityChanged: false });
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
                }
            }
        }
        else if ((this.props.MaximumOrderQuantity == null || this.props.MaximumOrderQuantity >= (SameProductList.length > 1 ? totalProductListQuantity : this.state.quantity) || (this.props.MinimumOrderQuantity <= (SameProductList.length > 1 ? totalProductListQuantity : this.state.quantity)))) {
            //let quantity1 = this.props.productPriceData.filter(x => x.basketGuid === this.props.BasketGuid)[0].quantity1;
            //if (SameProductSKUList.length > 1 ? totalSKUListQuantity : this.state.quantity >= quantity1) {

            if (this.props.MaximumOrderQuantity !== null && this.props.MaximumOrderQuantity < (SameProductList.length > 1 ? totalProductListQuantity : this.state.quantity)) {
                popupAlert('error', 'Error', 'Total quantity exceeding MXOQ for product - ' + "'" + this.props.ProductName + "'. MXOQ is " + this.props.MaximumOrderQuantity)
            }
            else if (this.props.MinimumOrderQuantity > (SameProductList.length > 1 ? totalProductListQuantity : this.state.quantity)) {
                popupAlert('error', 'Error', 'MOQ not meet for Product - ' + "'" + this.props.ProductName + "'. MOQ is " + this.props.MinimumOrderQuantity)
            }

            else if (parseFloat(this.state.quantity) !== 0) {
                if (event !== null) {
                    var paramters = {
                        'BasketGuid': this.props.BasketGuid,
                        'Quantity': this.state.quantity,
                        'Price': UnitPrice
                    };
                    updateProductBasket(paramters)
                        .then((json) => {
                            if (json.status === 200) {
                                // toaster.notify(toasterAlert('SUCCESS', 'Quantity Updated'), {
                                //     duration: null
                                // })
                                popupAlert('success', 'Success', 'Quantity Updated')
                                //alert('Quantity Updated');
                                this.props.oncheckAnyQtyUpdate(this.props.BasketGuid, false);
                                this.props.onCheckLabel(this.state.quantity, this.props.BasketGuid);
                                this.setState({ quantityChanged: false });
                            }
                        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

                }
            }
        }
    }


    render() {
        let Quantity = null;
        // if (this.state.quantity !== this.props.Quantity) {
        //     BtnupdateQuantity = <Button id={this.props.BasketGuid}
        //         onClick={(event) => this.updateQuantityHandler(event)}
        //         className="cart_save_btn" simple>Update</Button>
        // }
        if (this.state.quantityChanged === true) {
            Quantity = this.state.quantity;
        }
        else {
            Quantity = this.props.Quantity;
        }
        return (
            <React.Fragment>
                <GridContainer>
                    <GridItem className="newThemeInput">
                        <Input
                            elementType='input'
                            value={Quantity}
                            class="newInput"
                            changed={this.quantityChangeHandler}
                        />
                    </GridItem>
                    <GridItem md={6}>
                        {this.state.quantityChanged === true ? <Button id={this.props.BasketGuid}
                            onClick={(event) => this.updateQuantityHandler(event, this.props.UnitPriceDecimal)}
                            className="cart_save_btn" simple>Update</Button> : ""}

                        {/* {BtnupdateQuantity} */}
                    </GridItem>
                </GridContainer>
            </React.Fragment>
        )
    }
}

export default withStyles(basicsStyle)(BasketQuantity);