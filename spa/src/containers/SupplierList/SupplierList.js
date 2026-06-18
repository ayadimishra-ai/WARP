import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getServiceUrl, getLabelText, getLanguageResourceElasticIndex } from '../../config';
import * as PageKeys from '../../pagekeys';
import { getPageResource } from '../../utility';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
class SupplierList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: []
        }
    }
    async componentDidMount() {

        getPageResource(getLanguageResourceElasticIndex(this.props.languageId, PageKeys.suppliermanagement))
            .then(json => {
                this.setState({ resources: json, show_resources: true });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    onUserStatusClick = (userStatus) => {
        const user = {
            UserGuid: this.props.userGuid,
            FirstName: this.props.firstName,
            UserStatus: userStatus,
            EmailId: this.props.emailId
        }
        axios({
            url: getServiceUrl() + 'Users/UpdateUserStatus?',
            method: 'post',
            data: user,
            headers: { 'Authorization': 'Bearer ' + localStorage.tokenId, 'Content-Type': 'application/json' },
        }).then((response) => {
            alert(response.data.saveresult);
            window.location.href = "./supplier-listing";
        })
    }
    render() {
        const { resources } = this.state;
        return (
            <Table>
            <Thead>
                <Tr>
                    <Th>Email</Th>
                    <Th>Name</Th>
                    <Th>Company Name</Th>
                    <Th>Country</Th>
                    <Th>Approval status</Th>
                    <Th>Status</Th>
                    <Th>Activate/Deactivate</Th>
                    <Th>Action</Th>
                    <Th>View</Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>          
                    <Td>{this.props.emailId}</Td>
                    <Td>{this.props.firstName} {this.props.lastName}</Td>
                    <Td>{this.props.companyName}</Td>
                    <Td>{this.props.userCountryName}</Td>
                    <Td>{this.props.userRegistrationStatus}</Td>
                    <Td>{this.props.userStatus}</Td>
                    <Td>
                        {this.props.userStatus === "Active" ?
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmdeactive' })[0], "Are you sure You want to deactivate supplier?"))) { this.onUserStatusClick('Deactive') };
                            }}>
                                Deactivate
                        </Link> :
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmactive' })[0], "Are you sure You want to activate supplier?"))) { this.onUserStatusClick('Active') };
                            }}>
                                Activate
                        </Link>
                        }
                    </Td>
                    {this.props.userRegistrationStatus === "Pending" ?
                        <Td>
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmapprove' })[0], "Are you sure you want to approve?"))) { this.onUserStatusClick('Account Approved') };
                            }}>
                                <i class="fas fa-thumbs-up"></i>
                            </Link>
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmreject' })[0], "Are you sure you want to reject?"))) { this.onUserStatusClick('Rejected') };
                            }}>
                                <i class="fas fa-thumbs-down"></i>
                            </Link>
                        </Td>
                        : null}
                    {this.props.userRegistrationStatus === "Account Approved" ?
                        <Td>
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmreject' })[0], "Are you sure you want to reject?"))) { this.onUserStatusClick('Rejected') };
                            }}>
                                <i class="fas fa-thumbs-down"></i>
                            </Link>
                        </Td>
                        : null}
                    {this.props.userRegistrationStatus === "Rejected" ?
                        <Td>
                            <Link to='#' onClick={() => {
                                if (window.confirm(
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'confirmapprove' })[0], "Are you sure you want to approve?"))) { this.onUserStatusClick('Account Approved') };
                            }}>
                                <i class="fas fa-thumbs-up"></i>
                            </Link>
                        </Td>
                        : null}
                    <Td>
                        <Link to='#' onClick={() => '#'}>
                            View Detail
                    </Link>
                    </Td>
                    <Td></Td>
      
                </Tr>
            </Tbody>
            </Table>
            
        )
    }
}

export default SupplierList;