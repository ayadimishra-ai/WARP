import React, { Component } from "react";
import Accordion from "../../components/Material/Accordion/Accordion";

class ThirdPartyCookieEnabled extends Component {
    render() {
        return (
            <div className="cookieError">
                <h5>Oops! It look's like your third party cookies are blocked. Please allow. </h5>
                <Accordion
                    active={0}
                    collapses={[
                        {
                            title: 'Enable third party cookies in Google Chrome',
                            content:
                                <div>
                                    <img style={{ width: '50%' }} src="https://i.postimg.cc/8c85D1sV/chromecookie.png" alt="Chrome" />
                                </div>
                        },
                        {
                            title: 'Enable third party cookies in Mozilla Firefox',
                            content:
                                <div>
                                    <img style={{ width: '70%' }} src="https://i.postimg.cc/jSzPWFyT/mozilacookie.png" alt="Chrome" />
                                </div>
                        },
                        {
                            title: 'Enable third party cookies in Safari',
                            content:
                                <div>
                                    <img style={{ width: '50%' }} src="https://i.postimg.cc/gj8wqhfQ/safaricookie.png" alt="Chrome" />
                                </div>
                        },
                    ]}
                />
            </div>
        )
    }
}
export default ThirdPartyCookieEnabled