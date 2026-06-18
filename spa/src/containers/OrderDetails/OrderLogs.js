import React, { Component } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';

class OrderLogs extends Component {    
    render() {
        return (
            <div className="order_logTable">
                <div className="orderLogs_header">Logs</div>
                <div className="orderLogs_body">
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>PR ID</Th>
                                <Th>Raised ON</Th>
                                <Th>Approver</Th>
                                <Th>Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>On Hold</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>Rejetcd</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>On Hold</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>Rejetcd</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>On Hold</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>Rejetcd</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>On Hold</Td>
                            </Tr>
                            <Tr>
                                <Td>401-123-555</Td>
                                <Td>24/04/2019</Td>
                                <Td>Approver name</Td>
                                <Td>Rejetcd</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </div>
            </div>
        )
    }
}
export default (OrderLogs)