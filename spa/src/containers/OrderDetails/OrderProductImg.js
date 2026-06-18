import React, { Component } from "react";
import { getAWSUrl } from '../../config'
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import NotInterested from "@material-ui/icons/NotInterested";
import * as RoleCodes from "../../rolecodes";

const awsUrl = getAWSUrl("");

class OrderProductImg extends Component {
    render() {
        let PONumber = this.props.PONumber;
        if (this.props.PONumber === undefined) {
            PONumber = ""
        }
        let imgUrl = awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Medium/" + this.props.ImageName;
        if (localStorage.userType.includes("BUYER")) {
            if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0) {
                if (this.props.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0) {
                    imgUrl = awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Medium/" + localStorage.companyGuid.toUpperCase() + "/" + this.props.ImageName;
                }
            }
        }
        else {
            imgUrl = awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Medium/" + this.props.ImageName;
        }
        return (
            <React.Fragment>
                {PONumber === "" ? <div className="prod_type_deac_expi">
                    {this.props.ProductDeactivate === 1 ? <div className="deacti_prod">
                        <NotInterested /><span>DEACTIVATED</span>
                    </div> : ''}
                    {/* {this.props.ProductExpired === 1 ? <div className="expired_prod">
                        <RemoveCircle /><span>EXPIRED</span>
                    </div> : ''} */}
                    {this.props.ProductExpired === 1 && this.props.isSupplierActive === false ?
                        <div className="deacti_prod">
                            <NotInterested /><span>InActive Supplier</span>
                        </div>
                        :
                        this.props.ProductExpired === 1 ?
                            <div className="expired_prod">
                                <RemoveCircle /><span>EXPIRED</span>
                            </div> :
                            this.props.isSupplierActive === false ?
                                <div className="deacti_prod">
                                    <NotInterested /><span>InActive Supplier</span>
                                </div> : ''}
                </div> : ''}
                {JSON.parse(localStorage.userType).includes(RoleCodes.BUYER) ? this.props.ProductStatus !== "Approved" ? <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                    <RemoveCircle /><span>Not Available</span>
                </div> : this.props.isNotAvailable === 1 ? <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                    <RemoveCircle /><span>Not Available</span>
                    {/* </div> : this.props.BusinessReady === false ? <div style={{ 'background': '#cdcdcd', 'color': '#3b3b3b', 'fontSize': '10px' }} className="NA_prod">
                    <RemoveCircle /><span>Not Available</span> */}
                </div> : '' : ''}
                <img alt="description of image" src={imgUrl}
                    onError={(e) => {
                        e.target.onerror = null; e.target.src = awsUrl +
                            "ProductImages/Thumbnail/default.jpg"
                    }} />

            </React.Fragment>
        )
    }
}

export default (OrderProductImg)