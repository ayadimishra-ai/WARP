import React, { Component } from 'react';
import { getWebsiteUrl } from '../../config';
import 'react-tabs/style/react-tabs.css';
import { getLabelText } from '../../config';
import { splitPipeSeparatedString } from '../../utility';
import withStyles from "@material-ui/core/styles/withStyles";
import Accordion from "../Material/Accordion/Accordion.jsx";
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';


const awsUrl = getWebsiteUrl();




class ProductSpecificationDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openRateCard: 0
        }
    }

    certificateData = () => {
        if (this.props.CertificateName !== undefined && this.props.CertificateName !== "") {
            return splitPipeSeparatedString(this.props.CertificateName).map(
                (item, i) =>
                    <div>
                        <a target="_blank" href={
                            awsUrl + "ProductCertificates/" + this.props.SupplierGuid.toUpperCase() + "/"
                            + item} download>{
                                getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'downloadcertificate' })[0], "productdetail")
                            }</a>
                    </div>
            )
        }
        else {
            return null;
        }
    }

    render() {

        let certificates = this.certificateData(this.props)

        const Resources = this.props.Resources;

        var resArr = [];
        const b = [];
        for (var key in this.props.ListProductSpecification) {
            b.push({ value: this.props.ListProductSpecification[key].groupName });
        }
        b.forEach(function (item) {
            var i = resArr.findIndex(x => x.value === item.value);
            if (i <= -1) {
                resArr.push({ value: item.value });
            }
        });
        var groupNames = resArr;
        // if (certificates === null) {
        //     Accordion.collapses.splice(2, 1);
        // }
        // if (this.props.ListProductSpecification === undefined) {
        //     Accordion.collapses.splice(1, 1);
        // }

        return (
            <div className="prod_details_accordian">
                <Accordion
                    active={[0, 1, 2, 3]}
                    collapses={[
                        {

                            title: getLabelText(Resources.filter((x) => { return x.resourceKey === 'details' })[0], "productdetail"),
                            content: <div>
                                <b>{
                                    getLabelText(Resources.filter((x) => { return x.resourceKey === 'description' })[0], "productdetail")
                                } :</b>

                                <div dangerouslySetInnerHTML={{ __html: this.props.Description }} />

                                <div>
                                    <span><b>{
                                        getLabelText(Resources.filter((x) => { return x.resourceKey === 'furtherdescription' })[0], "productdetail")
                                    }
                                    </b></span> : <span>{this.props.FurtherDescription}</span>
                                </div>
                                <div>
                                    <span><b>{
                                        getLabelText(Resources.filter((x) => { return x.resourceKey === 'category' })[0], "productdetail")
                                    }</b></span> : <span>{this.props.ProductCategories}</span>
                                </div>
                                <div>
                                    <span> <b>{
                                        getLabelText(Resources.filter((x) => { return x.resourceKey === 'brand' })[0], "productdetail")
                                    }</b></span> : <span>{this.props.ProductBrand}</span>
                                </div>
                                {/* <div>
                                    <span> <b>{
                                        getLabelText(Resources.filter((x) => { return x.resourceKey === 'moq' })[0], "productdetail")
                                    }</b></span> : <span>{this.props.MinimumOrderQuantity}</span>
                                </div> */}
                            </div>
                        },
                        {
                            title: getLabelText(Resources.filter((x) => { return x.resourceKey === 'specification' })[0], "productdetail"),
                            content: <div>
                                {groupNames.map(gName => (
                                    <div>
                                        <b>{gName.value}</b>
                                        {this.props.ListProductSpecification.filter(x => x.groupName === gName.value).map(data => (
                                            <p>{data.groupKey} : {data.value}</p>

                                        ))}
                                    </div>
                                ))}
                            </div>
                        },
                        {
                            title: getLabelText(Resources.filter((x) => { return x.resourceKey === 'certificate' })[0], "productdetail"),
                            content:
                                <div>  <b>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'certificate' })[0], "productdetail")}</b>
                                    {certificates}</div>
                        },
                        {
                            title: <React.Fragment><span id="rate_card"></span> <span>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'Rate Card' })[0], "Rate Card")}</span></React.Fragment>,
                            content:
                                <React.Fragment>
                                    <Table className="rate_card_table">
                                        <Thead>
                                            <Tr>
                                                <Th>Quantity</Th>
                                                <Th>Rate</Th>
                                                <Th>Lead Time (days)</Th>
                                                <Th>Savings/unit</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>0-1000</Td>
                                                <Td>20</Td>
                                                <Td>10</Td>
                                                <Td>0</Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </React.Fragment>
                        }
                    ]}
                />
            </div>

        )
    }


}





export default withStyles(javascriptStyles)(ProductSpecificationDetails);