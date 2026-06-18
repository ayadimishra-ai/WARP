import React, { Component } from 'react';

class ProductTaxinomy extends Component {
    render() {
        return (
            <React.Fragment>
              
                {this.props.ListProductVariant[0].shape != undefined && this.props.ListProductVariant[0].shape != "" && this.props.ListProductVariant[0].shape != null ?
                    <div className="moq">
                        <p>Shape</p>
                        <h6>
                            {this.props.ListProductVariant[0].shape}
                        </h6>
                    </div>
                    : ""}
                {(this.props.ListProductVariant[0].dimension != undefined && this.props.ListProductVariant[0].dimension != "" && this.props.ListProductVariant[0].dimension != null) && (this.props.ListProductVariant[0].dimensionUnit != undefined && this.props.ListProductVariant[0].dimensionUnit != "" && this.props.ListProductVariant[0].dimensionUnit != null) ?
                    <div className="moq">
                        <p>Dimension</p>
                        <h6>
                            {this.props.ListProductVariant[0].dimension}
                            <span>{this.props.ListProductVariant[0].dimensionUnit}</span>
                        </h6>
                    </div>
                    : ""}
                
                {(this.props.ListProductVariant[0].thickness != undefined && this.props.ListProductVariant[0].thickness != "" && this.props.ListProductVariant[0].thickness != null) && (this.props.ListProductVariant[0].thicknessUnit != undefined && this.props.ListProductVariant[0].thicknessUnit != "" && this.props.ListProductVariant[0].thicknessUnit != null) ?
                    <div className="moq">
                        <p>Thickness</p>
                        <h6>
                            {parseFloat(this.props.ListProductVariant[0].thickness).toFixed(2)}
                            <span>{this.props.ListProductVariant[0].thicknessUnit}</span>
                        </h6>
                    </div>
                    : ""}
                {(this.props.ListProductVariant[0].weight != undefined && this.props.ListProductVariant[0].weight != "" && this.props.ListProductVariant[0].weight != null) && (this.props.ListProductVariant[0].weightUnit != undefined && this.props.ListProductVariant[0].weightUnit != "" && this.props.ListProductVariant[0].weightUnit != null) ?
                    <div className="moq">
                        <p>Weight</p>
                        <h6>
                            {parseFloat(this.props.ListProductVariant[0].weight).toFixed(2)}
                            <span>{this.props.ListProductVariant[0].weightUnit}</span>
                        </h6>
                    </div>
                    : ""}
                
                {(this.props.ListProductVariant[0].weightCarryingCapacity != undefined && this.props.ListProductVariant[0].weightCarryingCapacity != "" && this.props.ListProductVariant[0].weightCarryingCapacity != null) && (this.props.ListProductVariant[0].weightCarryingCapacityUnit != undefined && this.props.ListProductVariant[0].weightCarryingCapacityUnit != "" && this.props.ListProductVariant[0].weightCarryingCapacityUnit != null) ?
                    <div className="moq">
                        <p>Weight Carrying Capacity</p>
                        <h6>
                            {parseFloat(this.props.ListProductVariant[0].weightCarryingCapacity).toFixed(2)}
                            <span>{this.props.ListProductVariant[0].weightCarryingCapacityUnit}</span>
                        </h6>
                    </div>
                    : ""}
                {(this.props.ListProductVariant[0].skuVolume != undefined && this.props.ListProductVariant[0].skuVolume != "" && this.props.ListProductVariant[0].skuVolume != null) && (this.props.VolumeUnit != undefined && this.props.VolumeUnit != "" && this.props.VolumeUnit != null) ?
                    <div className="moq">
                        <p>Volume</p>
                        <h6>
                            {parseFloat(this.props.ListProductVariant[0].skuVolume).toFixed(2)}
                            <span>{this.props.VolumeUnit}</span>
                        </h6>
                    </div>
                    : ""}
                
            </React.Fragment>
        )
    }
}
export default ProductTaxinomy;