import React, { Component } from "react";
// import Expiring from "../../assets/img/expiring.svg"
// import Expired from "../../assets/img/expired.svg"
// import Tooltip from '@material-ui/core/Tooltip';
// import Description from "@material-ui/icons/Description"
// import PictureAsPdf from "@material-ui/icons/PictureAsPdf"
import Visibility from "@material-ui/icons/Visibility";
import { getWebsiteUrl } from '../../config';
import * as RoleCodes from '../../rolecodes';

const awsUrl = getWebsiteUrl();
class AdditionalCertificates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            additionalCertificatesList: [],
        }
    }
    viewAllClose = () => {
        this.setState(prevState => ({
            open: !prevState.open
        }))
    }

    render() {
        // let certificateType=['doc','docx'];
        let additionalCertificates = [];
        // let additionalCertificatesTop5=[];
        let expiredCount = 0;
        let expiringSoonCount = 0;
        let countriesGuid = [];
        if (localStorage.userCountries !== "undefined") {
            JSON.parse(localStorage.userCountries).map(item => {
                countriesGuid.push(item.countryGuid);
            })
        }
        if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
            this.props.ProductCertificate.filter(t => t.isMandatory === false && t.certificateStatus !== 'Not Uploaded').map(item => {
                additionalCertificates.push({
                    "CertificateName": item.certificateName,
                    "CountryName": item.countryName,
                    "CertificateStatus": item.certificateStatus,
                    "CertificateFileName": item.certificateFileName,
                    "ExpiryDate": item.expiryDate === undefined ? '' : item.expiryDate
                })
                if (item.certificateStatus === 'Expired') {
                    expiredCount = expiredCount + 1;
                }
                if (item.certificateStatus === 'Expiring soon') {
                    expiringSoonCount = expiringSoonCount + 1;
                }
            })
        }
        else {
            countriesGuid.map(data => {
                this.props.ProductCertificate.filter(t => t.isMandatory === false && t.certificateStatus !== 'Not Uploaded' && (t.countryGuid === data || t.countryGuid === '00000000-0000-0000-0000-000000000000')).map(item => {
                    additionalCertificates.push({
                        "CertificateName": item.certificateName,
                        "CountryName": item.countryName,
                        "CertificateStatus": item.certificateStatus,
                        "CertificateFileName": item.certificateFileName,
                        "ExpiryDate": item.expiryDate === undefined ? '' : item.expiryDate
                    })
                    if (item.certificateStatus === 'Expired') {
                        expiredCount = expiredCount + 1;
                    }
                    if (item.certificateStatus === 'Expiring soon') {
                        expiringSoonCount = expiringSoonCount + 1;
                    }
                })
            })
        }
        return (
            <React.Fragment>
                <div className="additional mandatory_certificate">
                    <div>{JSON.parse(localStorage.userType) === RoleCodes.BUYER ? '' : <><span className="expired_count">Expired: {expiredCount}</span> | <span className="expiring_count">Expiring: {expiringSoonCount}</span></>}</div>
                    <div className="certificate_table_div">
                        <table className="certificate_table">
                            <thead>
                                <tr>
                                    <th>Certificate Type</th>
                                    <th>Applicability</th>
                                    <th>Status</th>
                                    <th>Valid Till</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {additionalCertificates.map((item) => (
                                    <tr className={item.CertificateStatus === 'Expired' ? 'expired' : item.CertificateStatus === 'Expiring soon' ? 'expiring_soon' : 'uploaded'}>
                                        <td>{item.CertificateName}</td>
                                        <td>{item.CountryName === undefined ? "Generic" : item.CountryName}</td>
                                        <td>{item.CertificateStatus === 'Active' ? 'Uploaded' : item.CertificateStatus}</td>
                                        <td>{item.ExpiryDate}</td>
                                        <td><a className="certficate_link" target="_blank" href={awsUrl + "ProductCertificates/" + this.props.ProductGuid.toUpperCase() + "/"
                                            + item.CertificateFileName}><Visibility /></a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default AdditionalCertificates