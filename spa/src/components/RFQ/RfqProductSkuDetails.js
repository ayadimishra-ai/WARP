import React, { Component } from 'react';

class RfqProductSkuDetails extends Component {
    render() {
        let allvariatns = this.props.ListProductVariant !== undefined && this.props.ListProductVariant !== null ? this.props.ListProductVariant[0].skuVariants !== null ? this.props.ListProductVariant[0].skuVariants.split('|') : null : null;

        return (
            <React.Fragment>
                <ul className="proddetlistcont proddetlistskucont">
                    {
                        allvariatns !== null && allvariatns !== undefined ? allvariatns.map((item, index) => (
                            <>
                                <li>
                                    <span className="proddetlbls">{item.split(":")[0]}</span>
                                    <span class="proddetlistval">{item.split(":")[1]}</span>
                                </li>
                            </>
                        ))
                            : ""
                    }
                    {/* {this.props.ListProductVariant !== null ? this.props.ListProductVariant[0].shapeName != undefined && this.props.ListProductVariant[0].shapeName != "" && this.props.ListProductVariant[0].shapeName != null ?
                        <li>
                            <span className="proddetlbls">Shape</span>
                            <span class="proddetlistval">{this.props.ListProductVariant[0].shapeName}</span>
                        </li>
                        : "" : ""}
                    {this.props.ListProductVariant !== null ? (this.props.ListProductVariant[0].dimensions != undefined && this.props.ListProductVariant[0].dimensions != "" && this.props.ListProductVariant[0].dimensions != null) && (this.props.ListProductVariant[0].dimentionUnit != undefined && this.props.ListProductVariant[0].dimentionUnit != "" && this.props.ListProductVariant[0].dimentionUnit != null) ?
                        <li>
                            <span className="proddetlbls">Dimension</span>
                            <span class="proddetlistval">{this.props.ListProductVariant[0].dimensions}
                                <span>{this.props.ListProductVariant[0].dimentionUnit}</span></span>
                        </li>
                        : "": ""}
                    {this.props.ListProductVariant !== null ?(this.props.ListProductVariant[0].thickness != undefined && this.props.ListProductVariant[0].thickness != "" && this.props.ListProductVariant[0].thickness != null) && (this.props.ListProductVariant[0].thicknessUnit != undefined && this.props.ListProductVariant[0].thicknessUnit != "" && this.props.ListProductVariant[0].thicknessUnit != null) ?
                        <li>
                            <span className="proddetlbls">Thickness</span>
                            <span class="proddetlistval">{parseFloat(this.props.ListProductVariant[0].thickness).toFixed(2)}
                                <span>{this.props.ListProductVariant[0].thicknessUnit}</span></span>
                        </li>
                        : "": ""}
                    {this.props.ListProductVariant !== null ? (this.props.ListProductVariant[0].weight != undefined && this.props.ListProductVariant[0].weight != "" && this.props.ListProductVariant[0].weight != null) && (this.props.ListProductVariant[0].weightUnit != undefined && this.props.ListProductVariant[0].weightUnit != "" && this.props.ListProductVariant[0].weightUnit != null) ?
                        <li>
                            <span className="proddetlbls">Weight</span>
                            <span class="proddetlistval">{parseFloat(this.props.ListProductVariant[0].weight).toFixed(2)}
                                <span>{this.props.ListProductVariant[0].weightUnit}</span></span>
                        </li>
                        : "": ""}
                    {this.props.ListProductVariant !== null ? (this.props.ListProductVariant[0].wcc != undefined && this.props.ListProductVariant[0].wcc != "" && this.props.ListProductVariant[0].wcc != null) && (this.props.ListProductVariant[0].wccUnit != undefined && this.props.ListProductVariant[0].wccUnit != "" && this.props.ListProductVariant[0].wccUnit != null) ?
                        <li>
                            <span className="proddetlbls">Weight Carrying Capacity</span>
                            <span class="proddetlistval">{parseFloat(this.props.ListProductVariant[0].wcc).toFixed(2)}
                                <span>{this.props.ListProductVariant[0].wccUnit}</span></span>
                        </li>
                        : "": ""}
                    {this.props.ListProductVariant !== null ? (this.props.ListProductVariant[0].volume != undefined && this.props.ListProductVariant[0].volume != "" && this.props.ListProductVariant[0].volume != null) && (this.props.ListProductVariant[0].VolumeUnit != undefined && this.props.ListProductVariant[0].VolumeUnit != "" && this.props.ListProductVariant[0].VolumeUnit != null) ?
                        <li>
                            <span className="proddetlbls">Volume</span>
                            <span class="proddetlistval">{parseFloat(this.props.ListProductVariant[0].volume).toFixed(2)}
                                <span>{this.props.ListProductVariant[0].VolumeUnit}</span></span>
                        </li>
                        : "": ""} */}
                </ul>
                <div className="common_listing_table" style={{ width: '100%' }}>
                    <label class="rfq_second_label">Technical Specifications</label>
                    <table style={{ marginBottom: '15px' }}>
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? this.props.ListProductVariant[0].shapeName != undefined && this.props.ListProductVariant[0].shapeName != "" && this.props.ListProductVariant[0].shapeName != null ?
                                <tr>
                                    <td>Shape</td>
                                    <td>
                                        {this.props.ListProductVariant[0].shapeName}
                                    </td>
                                </tr>
                                : "" : ""}
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? (this.props.ListProductVariant[0].dimensions != undefined && this.props.ListProductVariant[0].dimensions != "" && this.props.ListProductVariant[0].dimensions != null) && (this.props.ListProductVariant[0].dimentionUnit != undefined && this.props.ListProductVariant[0].dimentionUnit != "" && this.props.ListProductVariant[0].dimentionUnit != null) ?
                                <tr>
                                    <td>Dimension</td>
                                    <td>
                                        {this.props.ListProductVariant[0].dimensions}
                                        <span>&nbsp;{this.props.ListProductVariant[0].dimentionUnit}</span>
                                    </td>
                                </tr>
                                : "" : ""}
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? (this.props.ListProductVariant[0].thickness != undefined && this.props.ListProductVariant[0].thickness != "" && this.props.ListProductVariant[0].thickness != null) && (this.props.ListProductVariant[0].thicknessUnit != undefined && this.props.ListProductVariant[0].thicknessUnit != "" && this.props.ListProductVariant[0].thicknessUnit != null) ?
                                <tr>
                                    <td>Thickness</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].thickness).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].thicknessUnit}</span>
                                    </td>
                                </tr>
                                : "" : ""}
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? (this.props.ListProductVariant[0].weight != undefined && this.props.ListProductVariant[0].weight != "" && this.props.ListProductVariant[0].weight != null) && (this.props.ListProductVariant[0].weightUnit != undefined && this.props.ListProductVariant[0].weightUnit != "" && this.props.ListProductVariant[0].weightUnit != null) ?
                                <tr>
                                    <td>Weight</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].weight).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].weightUnit}</span>
                                    </td>
                                </tr>
                                : "" : ""}
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? (this.props.ListProductVariant[0].wcc != undefined && this.props.ListProductVariant[0].wcc != "" && this.props.ListProductVariant[0].wcc != null) && (this.props.ListProductVariant[0].wccUnit != undefined && this.props.ListProductVariant[0].wccUnit != "" && this.props.ListProductVariant[0].wccUnit != null) ?
                                <tr>
                                    <td>Weight Carrying Capacity</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].wcc).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].wccUnit}</span>
                                    </td>
                                </tr>
                                : "" : ""}
                            {this.props.ListProductVariant !== null && this.props.ListProductVariant !== undefined ? (this.props.ListProductVariant[0].volume != undefined && this.props.ListProductVariant[0].volume != "" && this.props.ListProductVariant[0].volume != null) && (this.props.ListProductVariant[0].volumeUnit != undefined && this.props.ListProductVariant[0].volumeUnit != "" && this.props.ListProductVariant[0].volumeUnit != null) ?
                                <tr>
                                    <td>Volume</td>
                                    <td>
                                        {parseFloat(this.props.ListProductVariant[0].volume).toFixed(2)}
                                        <span>&nbsp;{this.props.ListProductVariant[0].volumeUnit}</span>
                                    </td>
                                </tr>
                                : "" : ""}
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        )
    }
}
export default RfqProductSkuDetails;