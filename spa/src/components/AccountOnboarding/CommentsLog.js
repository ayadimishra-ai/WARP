import axios from 'axios';
import moment from "moment";
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { getServiceUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
class CommentsLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            CommentLogDetails: [],
            Comments: "",
            showHide: false,
            CommentLogDetailsShow: []
        }
    }
    componentDidMount() {
        if (this.props.CommentLogData !== undefined) {
            this.setState({ CommentLogDetails: this.props.CommentLogData, CommentLogDetailsShow: this.props.CommentLogData.slice(-2), showHide: false });
        }

    }
    handleChange = event => {
        this.setState({ selectedValue: event.target.value });
    };
    commentChangeHandler(e) {
        this.setState({ Comments: e.target.value });
    }
    submitCommentLog = (event) => {
        const { next = f => f } = this.props;
        var data = this.state.Comments;
        let updateCommentLogDetails = this.state.CommentLogDetails;
        if (data !== "") {
            let currDate = moment(new Date()).format("YYYY-MM-DD");
            let tempComment = {
                firstName: localStorage.firstName.charAt(0),
                comment: data,
                createdBy: localStorage.userId,
                createdDate: currDate,
                companyStatusLogGuid: null
            }
            updateCommentLogDetails.push(tempComment);
            let newCommentData = updateCommentLogDetails.filter(item => item.companyStatusLogGuid == null).map(filtereditem => (filtereditem))

            this.setState({ CommentLogDetails: updateCommentLogDetails, Comments: "", CommentLogDetailsShow: updateCommentLogDetails.slice(-2), showHide: false });

            let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";

            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                let params = queryString.parse(window.location.search);
                companyGuid = params.Companyguid;
                Rolename = params.Rolename;
                QueryUserGuid = params.UserGuid;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            var body = {
                'CompanyGuid': companyGuid,
                'RoleName': Rolename,
                'UserGuid': QueryUserGuid,
                'SrmGuid': localStorage.userId,
                'issubmit': false,
                'Comments': data
            };
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'Content-Type': 'application/json'
                },
            };
            axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                .then((response) => {
                    if (response.status === 200) {
                        this.setState({ loading: false });
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                        localStorage.setItem('SRMcomment', 'true')
                        next(newCommentData);

                    }
                }).catch((err) => {
                    confirmAlert({
                        message: "Something went wrong. Please try again.",
                        buttons: [
                            {
                                label: 'OK',
                                onClick: () => {
                                    this.setState({ loading: false });
                                }
                            }
                        ]
                    });
                });



            // setTimeout(() => {
            //     window.scrollTo(0, document.body.scrollHeight);
            // }, 100)
        }

    }

    viewAllClick = (e) => {
        if (this.props.CommentLogData !== undefined) {
            if (e === 'View all logs') {
                setTimeout(() => {
                    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
                }, 100)
                this.setState({ CommentLogDetailsShow: this.state.CommentLogDetails, showHide: true });
            }
            else {
                this.setState({ CommentLogDetailsShow: this.state.CommentLogDetails.slice(-2), showHide: false });
            }
        }
    }

    render() {
        const { classes } = this.props
        return (
            <div className="onBoarding_comments_log">
                <div className="comments_header">
                    <h5>Comments Log</h5>
                    {this.state.showHide ? <span onClick={(e) => this.viewAllClick('Close all logs')}>Close all logs</span> :
                        <span onClick={(e) => this.viewAllClick('View all logs')}>View all logs</span>}
                </div>
                <div className="comments_content">
                    <div>
                        {this.state.CommentLogDetailsShow.length > 0 ?
                            this.state.CommentLogDetailsShow.map(item => (
                                item.createdBy === localStorage.userId ?
                                    <div className="selfUser">
                                        <div>
                                            <div className="user_ini">{item.firstName.charAt(0)}</div>
                                            <div className="comments">
                                                <p>{item.comment}</p>
                                            </div>
                                            <span className="comments_time">{moment(item.createdDate).format("DD MMM YYYY")}</span>
                                        </div>
                                    </div> :
                                    <div className="otherUser">
                                        <div>
                                            <div className="comments">
                                                <p>{item.comment}</p>
                                            </div>
                                            <div className="user_ini">{item.firstName.charAt(0)}</div>
                                            <span className="comments_time">{moment(item.createdDate).format("DD MMM YYYY")}</span>
                                        </div>
                                    </div>
                            ))
                            : ""}
                        {/* <div className="selfUser">
                            <div>
                                <div className="user_ini">M</div>
                                <div className="comments">
                                    <p>Description of comments will be shown here which may run into two to three lines or sometimes even more than that...</p>
                                </div>
                                <span className="comments_time">04:23 PM</span>
                            </div>
                        </div>
                        <div className="otherUser">
                            <div>
                                <div className="comments">
                                    <p>Description of comments will be shown here which may run into two to three lines or sometimes even more than that...</p>
                                </div>
                                <div className="user_ini">M</div>
                                <span className="comments_time">04:23 PM</span>
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className="post_comment">
                    {/* <Input class="newInput" elementConfig={{ placeholder: 'Add comments...' }} elementType="textarea" /> */}
                    <Input
                        value={this.state.Comments}
                        changed={(e) => this.commentChangeHandler(e)}
                        elementConfig={{ placeholder: 'Add comments', maxLength: "250" }}
                        class="newInput"
                        elementType="textarea"
                        errorMessage={this.state.Comments.length === 250 ? 'Additional Instructions length is reached' : ''} />
                    <Button onClick={this.submitCommentLog} className="solid_btn_new">Submit</Button>
                    {this.props.getcommentError === null ? '' : <div className="newThemeError nextBtnError"><p>{this.props.getcommentError}</p></div>}
                </div>
            </div>
        )
    }
}
export default (CommentsLog);