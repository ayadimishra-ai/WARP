import React, { Component } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';



class PRList extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        
        //;
        if (this.props.listOrderProductVM != undefined && this.props.listOrderPOVM != undefined) {
            return (
                <Table>
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>PR</Th>
                            <Th>Order Details</Th>
                            <Th>Supplier Name</Th>
                            <Th>Raised On</Th>
                            <Th>Status</Th>
                            <Th>PO</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>{this.props.orderId}</Td>
                            <Td>{this.props.pRNumber}</Td>
                            <Td>
                                {this.props.listOrderProductVM.map(item => (
                                    <div>{item.productName}</div>
                                ))}
                            </Td>
                            <Td>
                                {this.props.listOrderCompanyVM.map(item => (
                                    <div>{item.companyName}</div>
                                ))}

                            </Td>
                            <Td>
                                {this.props.createdDate}
                            </Td>
                            <Td>
                                {this.props.statusName}
                            </Td>
                            <Td>
                                {this.props.listOrderPOVM.map(item => (
                                    <div>{item.pONumber}</div>
                                ))}
                            </Td>
                        </Tr>
                        {/* <NoHits
                            errorComponent={errorComponent}
                            translations={{
                                "NoHits.NoResultsFound": "No Records Found.",
                            }} suggestionsField="title" /> */}
                    </Tbody>
                </Table>


                // <div class="divTableRow">
                //     <div class="divTableCell">{this.props.orderId}</div>
                //     <div class="divTableCell">{this.props.pRNumber}</div>
                //     <div class="divTableCell">
                //         {this.props.listOrderProductVM.map(item => (
                //             <div>{item.productName}</div>
                //         ))}
                //     </div>
                //     <div class="divTableCell">
                //     {this.props.listOrderCompanyVM.map(item => (
                //                 <div>{item.companyName}</div>
                //             ))}

                //     </div>
                //     <div class="divTableCell">{this.props.createdDate}</div>
                //     <div class="divTableCell">{this.props.statusName}</div>
                //     <div class="divTableCell">
                //         {this.props.listOrderPOVM.map(item => (
                //             <div>{item.pONumber}</div>
                //         ))}
                //     </div>
                //     {/* <div class="divTableCell">Actions</div> */}
                // </div>
            )
        }
        else {
            return ("")
        }
    }
}

export default PRList;