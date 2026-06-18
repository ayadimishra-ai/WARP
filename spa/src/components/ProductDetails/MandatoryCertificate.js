import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import React, { Component } from "react";
import { getWebsiteUrl } from '../../config';

let urlRes=[];
const awsUrl = getWebsiteUrl();
class MandatoryCertificate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            manadatoryCertificatesList: [],
        }
    }
    viewAllClose = () => {
        this.setState(prevState => ({
            open: !prevState.open
        }))
    }

    checkFileExist = async(productCertificateName)=> {
        if (urlRes.findIndex(x => x.certificate === productCertificateName) === -1) {
            try {
                const response = await axios({
                    method: 'get',
                    url: awsUrl +"ProductCertificates/"+this.props.SupplierGuid +"/" +this.props.ProductCode + "/"+productCertificateName,
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                });
                const blob = new Blob([response.data], {
                    type: 'application/pdf',
                });
                //if (urlRes.findIndex(x => x.certificate === productCertificateName) === -1) {
                    urlRes.push({"status":true, "certificate":productCertificateName});
                //}
            } catch (err) {
                //if (urlRes.findIndex(x => x.certificate === productCertificateName) === -1) {
                    urlRes.push({"status":false, "certificate":productCertificateName});
                //}
            }
        }
        return urlRes[0];
    }

    onDownloadClick = async (evt,productCertificateName) => {
        const anchor = evt.target.parentNode;
        try {
            const response = await axios({
                method: 'get',
                url: awsUrl +"ProductCertificates/"+this.props.SupplierGuid +"/" +this.props.ProductCode + "/"+productCertificateName,
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            anchor.href = window.URL.createObjectURL(blob);
            anchor.download = productCertificateName;
            anchor.click();
        } catch (err) {
            anchor.className = "disabled"
        }
    }

    render() {
        //let certificateType = ['doc', 'docx'];
        //let manadatoryCertificates = [];
        //let manadatoryCertificatesTop5 = [];
        //let expiredCount = 0;
        //let expiringSoonCount = 0;
        //let countriesGuid = [];
        //if (localStorage.userCountries !== "undefined") {
        //    JSON.parse(localStorage.userCountries).map(item => {
        //        countriesGuid.push(item.countryGuid);
        //    })
        //}
        //if (JSON.parse(localStorage.userType) === RoleCodes.ADMIN) {
        //    this.props.ProductCertificate.filter(t => t.isMandatory === true && t.certificateStatus !== 'Not Uploaded').map(item => {
        //        manadatoryCertificates.push({
        //            "CertificateName": item.certificateName,
        //            "CountryName": item.countryName,
        //            "CertificateStatus": item.certificateStatus,
        //            "CertificateFileName": item.certificateFileName,
        //            "ExpiryDate": item.expiryDate === undefined ? '' : item.expiryDate
        //        })
        //        if (item.certificateStatus === 'Expired') {
        //            expiredCount = expiredCount + 1;
        //        }
        //        if (item.certificateStatus === 'Expiring Soon') {
        //            expiringSoonCount = expiringSoonCount + 1;
        //        }
        //    })
        //}
        //else {
        //    countriesGuid.map(data => {
        //        this.props.ProductCertificate.filter(t => t.isMandatory === true && t.certificateStatus !== 'Not Uploaded' && (t.countryGuid === data || t.countryGuid === '00000000-0000-0000-0000-000000000000')).map(item => {
        //            manadatoryCertificates.push({
        //                "CertificateName": item.certificateName,
        //                "CountryName": item.countryName,
        //                "CertificateStatus": item.certificateStatus,
        //                "CertificateFileName": item.certificateFileName,
        //                "ExpiryDate": item.expiryDate === undefined ? '' : item.expiryDate
        //            })
        //            if (item.certificateStatus === 'Expired') {
        //                expiredCount = expiredCount + 1;
        //            }
        //            if (item.certificateStatus === 'Expiring Soon') {
        //                expiringSoonCount = expiringSoonCount + 1;
        //            }
        //        })
        //    })
        //}
        return (
            <React.Fragment>
                <div className="prod_detail_prod_icons_container">
                    <div className="prod_detail_prod_icons">
                        {this.props.SupplierAccreditations !== undefined && this.props.showDataAccreditations === true ?
                            this.props.SupplierAccreditations.map(data =>
                                <div>
                                    <img alt=" "
                                        src={data.iconName === null ? awsUrl + "\ProductCertificationIcons/defaultCertificate.png" : awsUrl + "\SupplierAccreditationsIcons/" + data.iconName}
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                        }}
                                    />
                                    <span>{data.supplierAccreditationName}</span>
                                </div>

                            ) : ''}
                        {this.props.ProductCertificationsIcon !== undefined && this.props.ProductCertificationsIcon !== '' && this.props.showDataProductCertifications === true ?
                            this.props.ProductCertificationsIcon.map((data) => {
                                //let filepath = awsUrl + "\ProductCertificates/" + this.props.SupplierGuid +"/" + this.props.ProductCode +"/" + data.productCertificateName + ".pdf"; //if any sub folder-> path/of/the/folder.ext              
                                let res = this.checkFileExist(data.productCertificateName + ".pdf")
                                let urlStatus = urlRes === undefined ? false : urlRes.length > 0 ? urlRes.filter(t=> t.certificate == data.productCertificateName + ".pdf").length > 0 ? urlRes.filter(t=> t.certificate == data.productCertificateName + ".pdf")[0].status : false : false
                                let dataitem="";
                                    dataitem = (
                                        urlStatus === true ?
                                        <Tooltip title={data.productCertificateName}>
                                            <div>
                                                <a
                                                    className="certificateslink"
                                                    target="_blank"
                                                    // href={
                                                    // filepath
                                                    // }
                                                    onClick={(event)=> this.onDownloadClick(event,data.productCertificateName + ".pdf")}
                                                >
                                                <img alt=""
                                                    src={awsUrl + "\ProductCertificationIcons/" + data.iconName}
                                                        onError={e => {
                                                            e.target.onerror = null;
                                                            e.target.src =
                                                                awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                                        }}
                                                    />
                                                    {/* <span>{data.productCertificateName}</span> */}
                                                </a>
                                            </div> 
                                        </Tooltip>:
                                        <Tooltip title={data.productCertificateName}>
                                            <div>
                                                <img alt=""
                                                    src={awsUrl + "\ProductCertificationIcons/" + data.iconName}
                                                    onError={e => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            awsUrl + "\ProductCertificationIcons/defaultCertificate.png";
                                                    }}
                                                />
                                            {/* <span>{data.productCertificateName}</span> */}
                                        </div>
                                    </Tooltip>
                                
                                )
                                return dataitem;
                            })
                            : ''}
                    </div>
                </div>
                {/*<div className="mandatory_certificate">*/}
                {/*    */}{/*<div>{JSON.parse(localStorage.userType) === RoleCodes.BUYER ? '' : <><span className="expired_count">Expired: {expiredCount}</span> | <span className="expiring_count">Expiring: {expiringSoonCount}</span></>}</div>*/}
                {/*    <div className="certificate_table_div">*/}
                {/*        <table className="certificate_table">*/}
                {/*            */}{/*<thead>*/}
                {/*            */}{/*    <tr>*/}
                {/*            */}{/*        <th>Certificate Type</th>*/}
                {/*            */}{/*        <th>Applicability</th>*/}
                {/*            */}{/*        <th>Status</th>*/}
                {/*            */}{/*        <th>Valid Till</th>*/}
                {/*            */}{/*        <th></th>*/}
                {/*            */}{/*    </tr>*/}
                {/*            */}{/*</thead>*/}
                {/*            */}{/*<tbody>*/}
                {/*            */}{/*    {manadatoryCertificates.map((item) => (*/}
                {/*            */}{/*        <tr className={item.CertificateStatus === 'Expired' ? 'expired' : item.CertificateStatus === 'Expiring Soon' ? 'expiring_soon' : 'uploaded'}>*/}
                {/*            */}{/*            <td>{item.CertificateName}</td>*/}
                {/*            */}{/*            <td>{item.CountryName === undefined ? "Generic" : item.CountryName}</td>*/}
                {/*            */}{/*            <td>{item.CertificateStatus === 'Active' ? 'Uploaded' : item.CertificateStatus}</td>*/}
                {/*            */}{/*            <td>{item.ExpiryDate}</td>*/}
                {/*            */}{/*            <td><a className="certficate_link" target="_blank" href={awsUrl + "ProductCertificates/" + this.props.ProductGuid.toUpperCase() + "/"*/}
                {/*            */}{/*                + item.CertificateFileName}><Visibility /></a></td>*/}
                {/*            */}{/*        </tr>*/}
                {/*            */}{/*    ))}*/}
                {/*            */}{/*</tbody>*/}
                {/*        </table>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </React.Fragment>
        )
    }
}
export default MandatoryCertificate