import React, { Component } from 'react';
import { getWebsiteUrl } from '../../config';
// import Sliberty from "../../assets/img/partners/sliberty.png";
const awsUrl = getWebsiteUrl();

let Updatecount = 0;

class PartnersC extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            CategoryImages: [],
            Image: []

        }
    }

    componentDidMount() {

        this.setState({ loading: true });

    }



    render() {
        return (
            <React.Fragment>
                {
                    this.props.PartnerLogo !== undefined && this.props.PartnerLogo.length > 0 ?
                        <div className="partners_cont">
                            <div className="section_heading">{this.props.PartnersHeading}</div>
                            <p>{this.props.PartnersDescription}</p>
                            <ul className="partners_list">
                                {
                                    this.props.PartnerLogo.map(item => {
                                        return <li>
                                            <img alt={item.companyName} src={item.ImgURL} title={item.companyName} />
                                            <span className="partners_percent">{this.props.PartnersPercent}</span>
                                        </li>
                                    })
                                }
                            </ul>
                            <div className="loadmorebtn_cont">
                                <a className="loadmore_btn">{this.props.PartnersBtn}</a>
                            </div>
                        </div> : ''
                }
            </React.Fragment>

        )
    }
}
export default PartnersC
