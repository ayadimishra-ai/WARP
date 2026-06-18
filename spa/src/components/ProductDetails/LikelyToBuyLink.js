import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getLabelText } from '../../config';
import * as BWStatusCode from '../../BWStatusCodes';

class LikelyToBuyLink extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.LikelyToBuyUsers.length > 0 && this.props.showLikelyToBuyDiv && this.props.showCollaborate ?
                    <React.Fragment>
                        <span id="likely_buy"></span>
                        <p>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'likelytobuy' })[0], "Likely To Buy")}</p>
                        <h6><Link to="#"
                            onClick={(event) => { event.preventDefault(); this.props.LikelyToBuyScroll() }}>
                            {this.props.LikelyToBuyUsers.length} {this.props.LikelyToBuyUsers.length > 1 ? " " : " "}</Link></h6>
                    </React.Fragment> :
                    this.props.showLikelyToBuyDiv && this.props.showParticipate ?
                        <React.Fragment>

                            <h6 className="participate_coll">
                            <Link to="#"
                                onClick={(event) => { event.preventDefault(); this.props.LikelyToBuyScroll() }}>
                                {getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'participate' })[0], "Participate")}</Link></h6>
                        </React.Fragment> : ''
                }
                {this.props.BWStatus !== BWStatusCode.COMPLETED && this.props.showParticipants ?
                    <React.Fragment>
                        <p>{getLabelText(this.props.LanguageResources.filter((x) => { return x.resourceKey === 'participants' })[0], "Participants")}</p>
                        <h6><Link to="#"
                            onClick={(event) => { event.preventDefault(); this.props.openCollaborationTabCallback() }}>
                            {this.props.participantCount}</Link></h6>
                    </React.Fragment> : ''}
            </React.Fragment>
        )
    }
}
export default (LikelyToBuyLink);