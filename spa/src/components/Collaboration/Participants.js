import React, { Component } from 'react'
import CheckCircle from "@material-ui/icons/CheckCircle";
import { getFirestoreUserDataCollectionName, getServiceUrl } from '../../config';
import firebase from '../../config/fbconfig';
import axios from 'axios';
import Spinner from '../../UI/Spinner/Spinner';
import { connect } from 'react-redux';
import { Tooltip } from "@material-ui/core";

class Participants extends Component {
    constructor(props) {
        super(props)
        this.state = {
            CollaborateChat: false,
            userData: [],
            userdetails: [],
            loading: false,
            loader: false,
        }
    }
    componentDidMount() {
        if (this.props.productGroupId !== undefined) {
            firebase.firestore().collection(getFirestoreUserDataCollectionName())
                .where('CollaborationGroupGuid', '==', this.props.productGroupId)
                .where('LeftGroup','==',false)
                .onSnapshot((snapshot) => {
                    let userData = [];
                    snapshot.forEach(record => userData.push(record.data()))
                    this.setState({ userData: userData })
                    this.setState({ loader: true })
                    let UserGroupData = [];
                    let UserGroup = [];
                    if (this.state.userData.length > 0) {
                        var UserGuid = this.state.userData.map(x => x.UserGuid);
                        this.setState({ userdetails: UserGuid })
                        this.getUsersData(UserGuid);
                    }
                })
        }

    }
    getUsersData(UserGuid) {
        let body = {
            'UserGuid': UserGuid
        }
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.tokenId,
            },
        };
        axios.post(getServiceUrl() + 'BuyingWindow/GetCollabratedBuyerDetails', UserGuid, config)
            .then((json) => {
                if (json.status === 200) {
                    this.setState({
                        userdetails: json.data.table1
                    })
                    this.setState({ loader: false })
                }
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }

    render() {
        let userData=[], commitmentQty=0;
        return (
            <React.Fragment>
                <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                    <div className="participant_inner_header">
                        {/* <span>Select All</span> */}
                        <span></span>
                        <span>Participants : {this.state.userData.length} </span>
                    </div>                     
                    {this.state.userdetails.length > 0 ?         
                     this.state.loader ? <div> <Spinner /> </div> :
                        <div className="participant_list">
                            {this.state.userdetails.map(data =>
                                <div className="userOffline_parent">
                                    <Tooltip id={'participat_tooltip'} title={<div className="tooltip_popper">
                                        <p>Company: {data.companyName}</p>
                                        <p>Country: {data.countryName}</p>
                                        <p>Region: {data.regionName}</p></div>}>
                                        <div className="userOffline">                                       
                                            <span className="users_listNameShort">
                                            {data.userName !== undefined? data.userName.split(" ").map((n)=>n[0]).join(""): ''}
                                            </span>
                                        </div>
                                    </Tooltip>
                                    <span className="users_listName">{data.userName}                                                                
                                     ({this.state.userData.filter(x => x.UserGuid === data.userGuid)[0]!== undefined ? this.state.userData.filter(x=> x.UserGuid === data.userGuid)[0].CommitmentQty : 0} Committed)                                    
                                    </span>
                                    <span className="Participant_selected">
                                        <span className="moq_meets"><CheckCircle /></span>
                                    </span>
                                </div>
                            )}
                        </div> : null}
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        languageId: state.login.languageId,
        companyGuid: state.login.companyGuid
    };
};
export default connect(mapStateToProps)(Participants);