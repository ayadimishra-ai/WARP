import React from 'react';
import { getWebsiteUrl } from '../../config';
import { splitPipeSeparatedString } from '../../utility';
import Accordion from "../Material/Accordion/Accordion.jsx";
import withStyles from "@material-ui/core/styles/withStyles";
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
import { getLabelText } from '../../config';
const awsUrl = getWebsiteUrl();

const certificateData = () => {
    if (this.props.CertificateName !== undefined && this.props.CertificateName !== "") {
        return splitPipeSeparatedString(this.props.CertificateName).map(
            (item, i) =>
                <div>
                    <a target="_blank" rel="noopener noreferrer" href={
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
const productCertificateTab = () => {
    const Resources = this.props.Resources;
    let certificates = certificateData(this.props)
    return (
        <React.Fragment>
            <Accordion
                active={0}
                collapses={[
                    {
                        title: getLabelText(Resources.filter((x) => { return x.resourceKey === 'certificate' })[0], "productdetail"),
                        content:
                            <div>  <b>{getLabelText(Resources.filter((x) => { return x.resourceKey === 'certificate' })[0], "productdetail")}</b>
                                {certificates}</div>
                    },
                ]}
            />
        </React.Fragment>
    )
}

export default withStyles(javascriptStyles)(productCertificateTab);