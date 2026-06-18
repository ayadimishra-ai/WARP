import React, { Component } from 'react';

class RFQProductTaxinomy extends Component {
    render() {
        return (
            <React.Fragment>
                <div className="common_listing_table">
                    <label class="rfq_second_label">Technical Specifications</label>
                    <table style={{ marginBottom: '15px' }}>
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.ListProductVariant[0].shape != undefined && this.props.ListProductVariant[0].shape != "" && this.props.ListProductVariant[0].shape != null ?
                                <tr>
                                    <td>Shape</td>
                                    <td>
                                        {this.props.ListProductVariant[0].shape}
                                    </td>
                                </tr>
                                : ""}
                            {(this.props.ListProductVariant[0].dimension != undefined && this.props.ListProductVariant[0].dimension != "" && this.props.ListProductVariant[0].dimension != null) && (this.props.ListProductVariant[0].dimensionUnit != undefined && this.props.ListProductVariant[0].dimensionUnit != "" && this.props.ListProductVariant[0].dimensionUnit != null) ?
                                <tr>
                                    <td>Dimension</td>
                                    <td>
                                        {this.props.ListProductVariant[0].dimension}
                                        <span>&nbsp;{this.props.ListProductVariant[0].dimensionUnit}</span>
                                    </td>
                                </tr>
                                : ""}
                            {(this.props.ListProductVariant[0].thickness != undefined && this.props.ListProductVariant[0].thickness != "" && this.props.ListProductVariant[0].thickness != null) && (this.props.ListProductVariant[0].thicknessUnit != undefined && this.props.ListProductVariant[0].thicknessUnit != "" && this.props.ListProductVariant[0].thicknessUnit != null) ?
                                <tr>
                                    <td>Thickness</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].thickness).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].thicknessUnit}</span>
                                    </td>
                                </tr>
                                : ""}
                            {(this.props.ListProductVariant[0].weight != undefined && this.props.ListProductVariant[0].weight != "" && this.props.ListProductVariant[0].weight != null) && (this.props.ListProductVariant[0].weightUnit != undefined && this.props.ListProductVariant[0].weightUnit != "" && this.props.ListProductVariant[0].weightUnit != null) ?
                                <tr>
                                    <td>Weight</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].weight).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].weightUnit}</span>
                                    </td>
                                </tr>
                                : ""}
                            {(this.props.ListProductVariant[0].weightCarryingCapacity != undefined && this.props.ListProductVariant[0].weightCarryingCapacity != "" && this.props.ListProductVariant[0].weightCarryingCapacity != null) && (this.props.ListProductVariant[0].weightCarryingCapacityUnit != undefined && this.props.ListProductVariant[0].weightCarryingCapacityUnit != "" && this.props.ListProductVariant[0].weightCarryingCapacityUnit != null) ?
                                <tr>
                                    <td>Weight Carrying Capacity</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].weightCarryingCapacity).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].weightCarryingCapacityUnit}</span>
                                    </td>
                                </tr>
                                : ""}
                            {(this.props.ListProductVariant[0].skuVolume != undefined && this.props.ListProductVariant[0].skuVolume != "" && this.props.ListProductVariant[0].skuVolume != null) && (this.props.VolumeUnit != undefined && this.props.VolumeUnit != "" && this.props.VolumeUnit != null) ?
                                <tr>
                                    <td>Volume</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].skuVolume).toFixed(2)}
                                        <span>&nbsp;{this.props.VolumeUnit}</span>
                                    </td>
                                </tr>
                                : ""}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        )
    }
}
export default RFQProductTaxinomy;