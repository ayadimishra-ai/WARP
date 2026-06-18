import React, { Component } from 'react';

class ProductName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openRateCard: '0'
        }
    }
    handleUserInputChange = event => {
        this.setState({
            imageUrl: event.currentTarget.currentSrc.replace("Thumbnail", "Medium")
        });
    };
    openRateCard = () => {
        this.setState({ openRateCard: '3' })
    }
    render() {
        return (
            <React.Fragment>
                <h5>{this.props.ProductName}</h5>
            </React.Fragment>
        )
    }
}
export default ProductName;