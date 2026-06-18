import React, { Component } from "react";

class OrderProductAttr extends Component {
    constructor(props) {
        super(props)
    }

    render() {        
        return (
            <React.Fragment>
                {this.props.AttributeData.map((data) => (
                    // <GridContainer className="cart_prod_size order_prod_size">
                    //     <GridItem><h6>{data.attributeKey}</h6></GridItem>
                    //     <GridItem>
                    //         <Button simple>{data.attributeValue}</Button>
                    //     </GridItem>
                    // </GridContainer>
                    <div className="cart_prod_size order_prod_size">
                        <h6>{data.attributeKey}: </h6>
                        <div className="cart_prod_size_cate">
                            <span>{data.attributeValue}</span>
                        </div>
                    </div>
                ))}
            </React.Fragment>
        )
    }
}

export default (OrderProductAttr)