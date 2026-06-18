import React from 'react';
import * as RoleCodes from '../../rolecodes';
import Button from '../../UI/Button/Button';
import { getLabelText } from '../../config';

const compareProductsHandler = () => {
    //alert('compare products')
}
const compareProducts = (props) => {
    switch (props.userType) {
        case RoleCodes.BUYER:
            return <Button
                clicked={compareProductsHandler}
                btnType="btnDefault">
                {
                    getLabelText(
                        props.Resources.filter((x) => { return x.resourceKey === 'compareproducts' })[0],
                        "Compare Similar Products"
                    )
                }
            </Button>
        default:
            return null;
    }
}
export default compareProducts;