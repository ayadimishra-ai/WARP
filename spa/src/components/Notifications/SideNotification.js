import React, { Component } from 'react';
//import BuyingWindowSideNotification from './BuyingWIndowSideNotification'
import RfqSideNotification from './RfqSideNotification';
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import axios from 'axios';
class SideNotification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showNoti: false,
        }
    }

    componentDidMount() {
        this.GetMappedPagesDetail();
        setTimeout(() => {
            this.setState({ showNoti: true })
        }, 5000)

        setTimeout(() => {
            this.setState({ showNoti: false })
        }, 4000)
    }

    closeNotification = () => {
        this.setState({ showNoti: false })
    }

    GetMappedPagesDetail() {
         var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                UserGuid: localStorage.userId,
            },
        };
        axios.get(getNextJSServiceUrl() + "home-page/GetMappedPagesDetail", config)
            .then((json) => {
                this.setState({ pagePermissions: json.data })
            }).catch((err) => {

            });
    }

    render() {
        return (
            <>
            {/* { <BuyingWindowSideNotification closeNoti={this.closeNotification} userId={this.props.userId} /> } */}
            {this.state.pagePermissions !== undefined && this.state.pagePermissions.length > 0 ? this.state.pagePermissions.filter(x => x.pageName === "notification" || x.pageName === "notifications").length > 0 ?
                <RfqSideNotification  closeNoti={this.closeNotification} userId={this.props.userId} />:"" : ""}
            </>
        )
    }
}
export default SideNotification