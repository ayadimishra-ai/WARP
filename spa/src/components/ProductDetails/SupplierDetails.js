import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Button from "../../UI/Button/MaterialButton";
import Tooltip from '@material-ui/core/Tooltip';
import { getWebsiteUrl } from '../../config';
import axios from 'axios';
const awsUrl = getWebsiteUrl();

let urlRes=[];
let filename = "";

class SupplierDetails extends Component {
    constructor() {
        super()
        
        this.state = {
          itemsToShow: 5,
          expanded: false
        }
    
        this.showMore = this.showMore.bind(this);
      }
    // checkFileExist = async(filename)=> {
    //     if (urlRes.findIndex(x => x.certificate === filename) === -1) {
    //         try {
    //             const response = await axios({
    //                 method: 'get',
    //                 url: awsUrl + 'CompanyOnboarding/' + this.props.SupplierCompanyGuid + '/DocumentsAndCertificates/' + filename,
    //                 responseType: 'blob',
    //                 headers: {
    //                     'Accept': 'application/pdf'
    //                 }
                    
    //             });
    //             const blob = new Blob([response.data], {
    //                 type: 'application/pdf',
    //             });
    //                 urlRes.push({"status":true, "certificate":filename});
    //             //}
    //         } catch (err) {
    //                 urlRes.push({"status":false, "certificate":filename});
    //         }
    //     }
    //     return urlRes[0];
    // }

    onDownloadClick = async (evt,filename) => {
        const anchor = evt.target.parentNode;
        try {
            const response = await axios({
                method: 'get',
                // url: awsUrl + 'CompanyOnboarding/' + this.props.SupplierCompanyGuid + '/DocumentsAndCertificates/' + docitemfilter.docName,
                url: awsUrl + 'CompanyOnboarding/' + this.props.SupplierCompanyGuid + '/DocumentsAndCertificates/' + filename,
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            anchor.href = window.URL.createObjectURL(blob);
            anchor.download = filename;
            anchor.click();
        } catch (err) {
            anchor.className = "disabled"
        }
    }
    showMore() {
        this.state.itemsToShow === 5 ? (
          this.setState({ itemsToShow: this.props.supplierCategories.length, expanded: true })
        ) : (
          this.setState({ itemsToShow: 5, expanded: false })
        )
      }
    render() {

        let countOfCertificates = this.props.SupplierCertificates.length

        let factoryAddress = [];
        factoryAddress = this.props.SupplierAddress.filter(item => item.addresstypename == "Factory");
        let citynames = [];
        citynames = factoryAddress.filter((ele, ind) => ind === factoryAddress.findIndex(elem => elem.city === ele.city)).map((item) => { return item.city });
        let warehouseAddress = [];
        warehouseAddress = this.props.SupplierAddress.filter(item => item.addresstypename == "Warehouse");

        let wareHouses = [];
        wareHouses = warehouseAddress.filter((ele, ind) => ind === warehouseAddress.findIndex(elem => elem.city === ele.city)).map((item) => { return item.city });

        let hoAddress = [];
       // hoAddress = this.props.SupplierAddress.filter(item => item.addresstypename.includes("Registered Office") ? item.addresstypename == "Registered Office" : item.addresstypename == "Billing Address")
        hoAddress = this.props.SupplierAddress.filter(item => item.addresstypename=="Registered Office").length>0 ?  this.props.SupplierAddress.filter(i=>i.addresstypename=="Registered Office") : this.props.SupplierAddress.filter(item => item.addresstypename == "Billing Address")
        return (
            <React.Fragment>
                <div class="supplierinfopop_cont">
                    <div class="suppinfopop_wrap">
                        <div class="suppinfopop_left">
                            <div class="suppinfopopleft_content">
                                {console.log("this is GST NUmber",this.props.supplierGSTNumber  )}
                                <h3 class="suppinfosub_heading">{this.props.SupplierName}</h3>
                                {this.props.supplierGSTNumber !== undefined && this.props.supplierGSTNumber !== "" && this.props.supplierGSTNumber !== null  && this.props.supplierGSTNumber.length > 0 && this.props.supplierGSTNumber[0].gstNumber !== undefined  && this.props.supplierGSTNumber[0].gstNumber !== "" ? 
                                <p>{"GST Number : "+this.props.supplierGSTNumber[0].gstNumber}</p>:""}
                                <p>
                                    {hoAddress !== undefined && hoAddress.length > 0 ?
                                        "HO: " +
                                        (hoAddress[0].addressline1 !== null ? hoAddress[0].addressline1 : "") +
                                        (hoAddress[0].addressLine2 !== null ? "," + hoAddress[0].addressLine2 : "") +
                                        (hoAddress[0].addressline3 !== null ? "," + hoAddress[0].addressline3 : "") +
                                        (hoAddress[0].city !== null ? "," + hoAddress[0].city : "") +
                                        // (hoAddress[0].poboxnumber !== null? "," + hoAddress[0].poboxnumber : "")+

                                        (hoAddress[0].statename !== null ? "," + hoAddress[0].statename : "") +
                                        (hoAddress[0].zipcode !== null ? " - " + hoAddress[0].zipcode : "")
                                        // (hoAddress[0].countryname !== null? "," + hoAddress[0].countryname : "")
                                        : ''
                                    }
                                </p>
                            </div>
                            {factoryAddress !== undefined && factoryAddress !== '' && factoryAddress.length > 0 ?
                                <div class="suppinfopopleft_content">
                                    <h3 class="suppinfosub_heading">Factory</h3>
                                    <div class="greenroundshape">

                                        {citynames.map((member) => {
                                            let TotalCount = factoryAddress.filter(x => x.city === member).length;

                                            let tolltipdata = "";
                                            factoryAddress.filter(x => x.city === member).map((memberitem, index) => {
                                                tolltipdata += "" + (index + 1) + ". " +
                                                    (memberitem.addressline1 !== null ? memberitem.addressline1 : '') +
                                                    (memberitem.addressLine2 !== null ? "," + memberitem.addressLine2 : '') +
                                                    (memberitem.addressline3 !== null ? "," + memberitem.addressline3 : '') +
                                                    (memberitem.city !== null ? "," + memberitem.city : '') +
                                                    // (memberitem.poboxnumber !==null ?","+memberitem.poboxnumber:'')+
                                                    (memberitem.statename !== null ? "," + memberitem.statename : '') +
                                                    (memberitem.zipcode !== null ? " - " + memberitem.zipcode : '')
                                                    //(memberitem.countryname !==null?","+memberitem.countryname:'')
                                                    + '\n';
                                            })
                                            return <div>{member}<Tooltip placement="bottom-start"
                                                title={<div className='tooltip_div_bottom_start'>{tolltipdata.split('\n').map((item, i) => <div>{item}</div>)}</div>}><span>
                                                    {TotalCount}
                                                </span></Tooltip></div>
                                        })}
                                    </div>
                                </div>
                                : ''}

                            {warehouseAddress !== undefined && warehouseAddress !== '' && warehouseAddress.length > 0 ?
                                <div class="suppinfopopleft_content">
                                    <h3 class="suppinfosub_heading">Warehouse</h3>
                                    <div class="greenroundshape">

                                        {wareHouses.map((member) => {
                                            let TotalCount = warehouseAddress.filter(x => x.city === member).length;
                                            let tolltipdata = "";
                                            warehouseAddress.filter(x => x.city === member).map((memberitem, index) => {
                                                tolltipdata += "" + (index + 1) + ". " +
                                                    (memberitem.addressline1 !== null ? memberitem.addressline1 : '') +
                                                    (memberitem.addressLine2 !== null ? "," + memberitem.addressLine2 : '') +
                                                    (memberitem.addressline3 !== null ? "," + memberitem.addressline3 : '') +
                                                    (memberitem.city !== null ? "," + memberitem.city : '') +
                                                    // (memberitem.poboxnumber !==null ?","+memberitem.poboxnumber:'')+
                                                    (memberitem.statename !== null ? "," + memberitem.statename : '') +
                                                    (memberitem.zipcode !== null ? " - " + memberitem.zipcode : '')
                                                    // (memberitem.countryname !==null?","+memberitem.countryname:'')
                                                    + '\n';
                                            })
                                            return <div>{member} <Tooltip placement="bottom-start"
                                                title={<div className='tooltip_div_bottom_start'>{tolltipdata.split('\n').map((item, i) => <div>{item}</div>)}</div>}><span>
                                                    {TotalCount}
                                                </span></Tooltip></div>
                                        })}
                                    </div>
                                </div>      
                                : ''}

                                {this.props.supplierCategories !== undefined && this.props.supplierCategories !== "" && this.props.supplierCategories !== null ?
                                <div class="suppinfopopleft_content">
                                    <h3 class="suppinfosub_heading">Category Name</h3>
                                    <div className="orangeroundshape">
                                        {this.props.supplierCategories.slice(0, this.state.itemsToShow).map((item, index) => 
                                            <div key={index}>
                                                <p>{item.childCategory}</p>
                                                <Tooltip
                                                placement="bottom-start"
                                                title={<div className='tooltip_div_bottom_start'>{item.categoryNames}</div>}
                                                >
                                                <span></span>
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>
                                    <p>
                                        <a onClick={this.showMore}>
                                        {this.state.expanded ? (
                                            <span style={{fontSize:'12px'}}>Show less</span>
                                        ) : (
                                            <span style={{fontSize:'12px'}}>Show more</span>
                                        )
                                        }
                                        </a>
                                    </p>
                                </div>
                                : ''}

                                {this.props.supplierCategories !== undefined && this.props.supplierCategories !== "" && this.props.supplierCategories !== null && this.props.supplierCategories.length > 0 ?
                                <div class="suppinfopopleft_content">
                                    <h3 class="suppinfosub_heading">Category Name</h3>
                                    <div className="orangeroundshape">
                                        {this.props.supplierCategories.slice(0, this.state.itemsToShow).map((item, index) => 
                                            <div key={index}>
                                                <p>{item.childCategory}</p>
                                                <Tooltip
                                                placement="bottom-start"
                                                title={<div className='tooltip_div_bottom_start'>{item.categoryNames}</div>}
                                                >
                                                <span></span>
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>
                                    {this.props.supplierCategories.length > 4 ?
                                    <p>
                                        <a onClick={this.showMore}>
                                        {this.state.expanded ? (
                                            <span className="showMoreLess" style={{fontSize:'12px'}}>Show less</span>
                                        ) : (
                                            <span className="showMoreLess" style={{fontSize:'12px'}}>Show more</span>
                                        )
                                        }
                                        </a>
                                    </p>: ""}
                                </div>
                                : ''}

                                {this.props.eSGScore!==undefined && this.props.eSGScore!=="" && this.props.eSGScore!==null && this.props.eSGScore!==0?
                                    <div class="suppinfopopleft_content">
                                        <h3 class="suppinfosub_heading">
                                        ESG Score Summary  {this.props.AssessmentDate !== undefined && this.props.AssessmentDate !== "" && this.props.AssessmentDate !== null ? <span>(Assessment done on <b>{this.props.AssessmentDate}</b>)</span> : ""}
                                        </h3>
                                        <div className='common_listing_table'>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Focus Areas</th>
                                                        <th>Score (%)</th>
                                                        {/* <th>Ranking</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.props.eScore!==undefined && this.props.eScore!==null && this.props.eScore!==""?
                                                        <tr>
                                                            <td>Environment</td>
                                                            <td>{this.props.eScore}%</td>
                                                        </tr>
                                                    :""}

                                                    {this.props.sScore!==undefined && this.props.sScore!==null && this.props.sScore!==""?
                                                        <tr>
                                                            <td>Social</td>
                                                            <td>{this.props.sScore}%</td>
                                                        </tr>
                                                    :""}

                                                    {this.props.gScore!==undefined && this.props.gScore!==null && this.props.gScore!==""?
                                                        <tr>
                                                            <td>Governance</td>
                                                            <td>{this.props.gScore}%</td>
                                                        </tr>
                                                    :""}

                                                    {this.props.eSGScore!==undefined && this.props.eSGScore!==null && this.props.eSGScore!==""?
                                                        <tr>
                                                            <td>Total ESG Score</td>
                                                            <td>{this.props.eSGScore}%</td>
                                                        </tr>
                                                    :""}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                :""}
                                

                            < Link to={"/listing-page?supplier[0]=" + this.props.SupplierName} >
                                <Button className="viewcatlog_btn">View Catalogue</Button>
                            </Link >
                            {/* <button class="viewcatlog_btn">View Catalogue</button> */}
                        </div>
                        {this.props.SupplierCertificates.length > 0 && this.props.SupplierCertificates !== undefined ?
                            <div class="suppinfopop_right">
                                <h3 class="suppinfosub_heading">Supplier Certificates ({countOfCertificates})</h3>
                                <div class="suppcertificates_cont">
                                {this.props.SupplierCertificates.map(data => {
                            filename = data.docName;
                            // let res = this.checkFileExist(data.docName)
                            // let urlStatus = urlRes === undefined ? false : urlRes.length > 0 ? urlRes.filter(t=> t.certificate == data.docName).length > 0 ? urlRes.filter(t=> t.certificate == data.docName)[0].status : false : false
                            let dataitem="";
                                dataitem = (
                                // urlStatus === true ?
                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>{data.companydocumentname}</div>}>
                                    <div>
                                        <a
                                            className="certificateslink"
                                            target="_blank"
                                            // href={awsUrl + 'CompanyOnboarding/' + this.props.SupplierCompanyGuid + '/DocumentsAndCertificates/' + data.docName}
                                            onClick={(event)=> this.onDownloadClick(event,data.docName)}
                                        >
                                        <img
                                            src={awsUrl + "SupplierLevelCertificatesIcon/" + data.iconName}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    awsUrl + "SupplierLevelCertificatesIcon/default.jpg";
                                            }}
                                        />
                                        </a>
                                    </div>
                                </Tooltip> 
                                // :
                                // <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>{data.companydocumentname}</div>}>
                                //     <div>
                                //         <img
                                //             src={awsUrl + "SupplierLevelCertificatesIcon/" + data.iconName}
                                //             onError={(e) => {
                                //                 e.target.onerror = null;
                                //                 e.target.src =
                                //                     awsUrl + "SupplierLevelCertificatesIcon/default.jpg";
                                //             }}
                                //         />
                                //     </div>
                                // </Tooltip> 
                            )
                            return dataitem;
                    }
                        )}
                                </div>
                            </div>
                            : ''}
                    </div>
                </div>
            </React.Fragment >
        )
    }
}
export default (SupplierDetails);