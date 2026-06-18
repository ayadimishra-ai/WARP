import React from 'react';
import CookieConsent from "react-cookie-consent";



const body = (props) => {
    return (
        // <div className={window.location.pathname.toLowerCase() === '/' || window.location.pathname.toLowerCase() === '/artificial-punchout' ? 'body withoutheader ' : 'body withheader'}>{props.children}</div>
        <div className={window.location.pathname.toLowerCase() === '/' || window.location.pathname.toLowerCase() === '/login' || window.location.pathname.toLowerCase() === '/artificialpunchout' || window.location.pathname.toLowerCase() === '/supplierlogin' || window.location.pathname.toLowerCase() === '/snowkapteamlogin' ||  window.location.pathname.toLowerCase() === "/setnewpassword" ? 'body loginModule ' : window.location.pathname.toLowerCase() === '/companyonboarding' ? 'body loginModule' : 'body withheader'}>
            {props.children}
            <CookieConsent
                location="bottom"
                buttonText="I Understand"
                cookieName="Snowkap cookie"
                style={{ background: "#2B373B",zIndex:'9999999' }}
                expires={150}
                >
                This website uses cookies to enhance the user experience.{" "}
            </CookieConsent>
        </div>
    );
};
export default body;