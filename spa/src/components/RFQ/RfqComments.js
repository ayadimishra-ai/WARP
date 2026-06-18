import moment from "moment";
import React, { Component } from "react";
import { getLabelText, getLanguageResourceElasticIndex, getWebsiteLanguageGuid } from '../../config';
import Input from "../../UI/Input/MaterialInput";
import { getPageResource } from "../../utility";
class RfqComments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: false,
            rfqLanguageResources: [],
        }
    }
    componentDidMount() {
        this.getRFQLanguageResource();
    }

    viewLogs = () => {
        this.setState(prevState => ({
            view: !prevState.view
        }));
    }

    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    render() {
        let currentUser = 'SUPPLIER';
        if (this.props.isBuyer) {
            currentUser = 'BUYER'
        }


        let comments = this.props.comments !== undefined && this.props.comments !== null ? this.props.comments.sort((a, b) => a.createdDate > b.createdDate ? -1 : 1).filter(y => y.comment !== "") : [];

        return (
            <React.Fragment>
                <div style={{ height: comments.length === 1 ? '120px' : comments.length === 0 ? '0' : this.state.view ? 'auto' : '120px', overflow: 'hidden' }} className="rfq_comment">
                    {
                        comments.map(item => {
                            if (item.roleName === currentUser) {
                                return <div className="rfq_buyerComment">
                                    <div className="newThemeInput newThemeInputTextArea">
                                        <label>You - {moment(item.createdDate.substring(0, 10)).format("DD MMM YYYY")}</label>
                                        <Input
                                            class="newInput disabled"
                                            elementType="textarea"
                                            value={item.comment}
                                        />
                                    </div>
                                </div>
                            }
                            else {
                                return <div className="rfq_supplierComment">
                                    <div className="newThemeInput newThemeInputTextArea">
                                        <label>{item.companyName} - {item.createdDate.substring(0, 10)}</label>
                                        <Input
                                            class="newInput disabled"
                                            elementType="textarea"
                                            value={item.comment}
                                        />
                                    </div>
                                </div>
                            }
                        })
                    }
                </div>
                {/* {comments.length <= 1 ? '' : <span style={{ cursor: 'pointer' }} onClick={this.viewLogs}>{this.state.view ? 'Close Logs' : 'View All Logs'}</span>} */}
                {comments.length <= 1 ? '' : <span style={{ cursor: 'pointer' }} onClick={this.viewLogs}>{this.state.view ? this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "closelogs"; })[0], "Close Logs") : "" : this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "viewalllogs"; })[0], "View All Logs") : ""}</span>}
            </React.Fragment>
        )
    }
}
export default RfqComments