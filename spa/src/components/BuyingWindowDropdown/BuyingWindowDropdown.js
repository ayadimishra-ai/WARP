// import React, { Component } from 'react';
// class BuyingWindowDropdown extends Component {
//     constructor(props){
//         super(props)
//     }
// }
// export default BuyingWindowDropdown

import React, { Component } from 'react';
import Popover from '@material-ui/core/Popover';
import { Link } from "react-router-dom";
import ProductCard from "../../containers/ProductCard/ProductCard";



class BuyingWindowDropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        };
    }
    handleClick = event => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };
    render() {

        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        return (
            <React.Fragment>
                <div>
                    <Link to="#"
                        aria-owns={open ? 'simple-popper' : undefined}
                        aria-haspopup="true"
                        variant="contained"
                        onClick={(event) => { event.preventDefault(); this.handleClick(event) }}
                    >
                        BW
                    </Link>
                    <Popover

                        id="BuyingWindowDropdown-popper"
                        open={open}
                        anchorEl={anchorEl}
                        onClose={this.handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <div className="BuyingWindowDropdown_dropdown">
                            <h3>BuyingWindowDropdown <span>(3)</span></h3>
                            {/* <GridContainer>
                                <GridItem md={4}>
                                    <ProductImage ListProductVariant={[basketGuid: "85495411-bde2-4237-9756-1747fe57e545", skuGuid: "f67f944b-67a1-45a1-b3fb-25f8c39de6d3", quantity1: 30, price1: 1.99, quantity2: 60 ]}
                                        SupplierGuid={'dfsdf'} ImageURL={'ddfsdf'} />
                                </GridItem>
                                <GridItem md={8}></GridItem>
                            </GridContainer> */}
                            <ul>
                                <li onClick={this.handleClose}>
                                    <ProductCard
                                        ProductName={'.5 oz. Custom Label Hand Sanitizer '}
                                        ProductGuid={'dfsfds'}
                                        Key={'dfsdf'}
                                        ProductStatus={'dfsfds'}
                                        DecimalPrecision={100}
                                        IsActive={'source.isActive'}
                                        Image={'source.imageName'}
                                        ProductCode={'source.productCode'}
                                        MinPrice={'source.minPrice'}
                                        Ratings={2}
                                        CurrencySymbol={'$'}
                                        SupplierGuid={'source.supplierGuid'}
                                        Type="grid"
                                        //ListBucketDetails={''}
                                        CompanyName={'Powerweave Services Pvt Ltd.'}
                                    />
                                </li>
                                <li onClick={this.handleClose}>
                                    <ProductCard
                                        ProductName={'.5 oz. Custom Label Hand Sanitizer '}
                                        ProductGuid={'dfsfds'}
                                        Key={'dfsdf'}
                                        ProductStatus={'dfsfds'}
                                        DecimalPrecision={100}
                                        IsActive={'source.isActive'}
                                        Image={'source.imageName'}
                                        ProductCode={'source.productCode'}
                                        MinPrice={'source.minPrice'}
                                        Ratings={2}
                                        CurrencySymbol={'$'}
                                        SupplierGuid={'source.supplierGuid'}
                                        Type="grid"
                                        //ListBucketDetails={''}
                                        CompanyName={'Powerweave Services Pvt Ltd.'}
                                    />
                                </li>
                                <li onClick={this.handleClose}>
                                    <ProductCard
                                        ProductName={'.5 oz. Custom Label Hand Sanitizer '}
                                        ProductGuid={'dfsfds'}
                                        Key={'dfsdf'}
                                        ProductStatus={'dfsfds'}
                                        DecimalPrecision={100}
                                        IsActive={'source.isActive'}
                                        Image={'source.imageName'}
                                        ProductCode={'source.productCode'}
                                        MinPrice={'source.minPrice'}
                                        Ratings={2}
                                        CurrencySymbol={'$'}
                                        SupplierGuid={'source.supplierGuid'}
                                        Type="grid"
                                        //ListBucketDetails={''}
                                        CompanyName={'Powerweave Services Pvt Ltd.'}
                                    />
                                </li>
                                <li onClick={this.handleClose}>
                                    <ProductCard
                                        ProductName={'.5 oz. Custom Label Hand Sanitizer '}
                                        ProductGuid={'dfsfds'}
                                        Key={'dfsdf'}
                                        ProductStatus={'dfsfds'}
                                        DecimalPrecision={100}
                                        IsActive={'source.isActive'}
                                        Image={'source.imageName'}
                                        ProductCode={'source.productCode'}
                                        MinPrice={'source.minPrice'}
                                        Ratings={2}
                                        CurrencySymbol={'$'}
                                        SupplierGuid={'source.supplierGuid'}
                                        Type="grid"
                                        //ListBucketDetails={''}
                                        CompanyName={'Powerweave Services Pvt Ltd.'}
                                    />
                                </li>
                            </ul>                         
                        </div>
                    </Popover>
                </div>
            </React.Fragment>
        )
    }
}
export default (BuyingWindowDropdown)