import React, { Component } from "react";
import { BreadCrumb, decodeOpAccessToken } from "../../utility";
import Spinner from "../../UI/Spinner/Spinner";
import { GetGHGEstimationUrl } from "../../config";

const GHGEstimate_Link = GetGHGEstimationUrl();

class GHGForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            iframeHeight: 800,
            organizationId: '',
            jwtToken: '',
            loader: true
        }
    }

    componentDidMount() {
        this.setState({ jwtToken: localStorage.opsToken }, () => {
            const decodedToken = decodeOpAccessToken(this.state.jwtToken);
            const organizationId = decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
            this.setState({ organizationId: organizationId });
        })

        window.addEventListener('message', (event) => {
            event.preventDefault();
            if (event.data === 'scrollToTop') {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }
        })
    }

    iframeUrl = () => {
        return GHGEstimate_Link + this.state.organizationId + "/embed/v1/" + this.state.jwtToken + "/ghg-forms?" + `data=${encodeURIComponent(this.props.history.location.state.id)}`;
    };
    render() {
        let breadCrumb = BreadCrumb([
            { pageName: "Home", url: "/home" },
            { pageName: "GHG Forms", url: "/ghg-forms" },
        ]);


        return (
            <React.Fragment>
                <div className="breadtitle_wrap">
                    {breadCrumb}
                    <div className="page_top_title">
                        <div
                            className="page_heading"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                width: "100%",
                            }}
                        >
                            <h4>GHG Forms {this.props.history.location.state && <>- {this.props.history.location.state.date}</>} {this.props.history.location.state && <>- {this.props.history.location.state.loc}</>}</h4>
                        </div>
                    </div>
                </div>
                <div className="">
                    {this.state.loader && <div style={{ position: 'absolute', width: '90%', height: '100%', background: '#fff' }}><Spinner /></div>}
                    <iframe
                        allow
                        title=" "
                        id="listIframe1"
                        src={this.iframeUrl()}
                        allowFullScreen
                        frameBorder="0"
                        style={{ width: '100%' }}
                        height={this.state.iframeHeight}
                        loading="eager"
                        onLoad={() => this.setState({ loader: false })}
                    />

                </div>
            </React.Fragment>
        )
    }
}

export default GHGForms