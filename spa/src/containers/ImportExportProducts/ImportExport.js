import React, { Component } from 'react';
import ImportProducts from './ImportProducts';
import ExportProducts from './ExportProducts';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { BreadCrumb } from "../../utility";
import axios from "axios";
import * as RoleCodes from "../../rolecodes";
import { getServiceUrl } from '../../config';

class importexport extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            companyDetails: [],
        };
    }

    componentDidMount() {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER){
            this.getMappedBuyerCompanyDetailsBySupplier(localStorage.userId);
        }
    }

    getSupplierId = (supplierGuid) => {
        this.getMappedBuyerCompanyDetailsBySupplier(supplierGuid)
    }

    async getMappedBuyerCompanyDetailsBySupplier(userId) {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                'UserGuid': userId,
            }
        };
        await axios
            .get(getServiceUrl() + "Users/GetMappedBuyerCompanyDetailsBySupplier", config)
            .then((response) => { console.log(response)
                if(response.data.length > 0){
                    this.setState({
                        companyDetails: response.data
                    });
                }else{
                    this.setState({
                        companyDetails: []
                    });
                }
            }).catch(err => {
                console.log(err);
            });
    }

    render() {
        return (
            <React.Fragment>
                <div className='breadtitle_wrap'>  
                    {
                        BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                        { 'pageName': 'Product Listing', 'url': '/listing-page' },
                        { 'pageName': 'Import Export', 'url': '/#' },
                        ])
                    }
                 </div>
                <div className="">
                    <GridContainer className="import_export" >
                        <GridItem xs={12} sm={12} md={6}><ImportProducts onSelectSupplier={this.getSupplierId}/></GridItem>
                        <GridItem xs={12} sm={12} md={6}> <ExportProducts /></GridItem>
                    </GridContainer>
                    
                {this.state.companyDetails.length > 0 ?
                <GridContainer className="import_export import_export_tbl">
                    <GridItem xs={12} sm={12} md={6}>
                        <div class="border_top"><div class="cart_table_top_border"></div></div>
                        <div className="category_list_table">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Company Code</th>
                                        <th>Company Name</th>
                                    </tr>
                                    {this.state.companyDetails.map(item =>
                                    <tr>
                                        <td>{item.companyId}</td>
                                        <td>{item.companyName}</td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GridItem>
                </GridContainer>
                 : ""}
                </div>
            </React.Fragment>
        );


    }
}

export default importexport;