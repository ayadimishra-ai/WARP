import React from 'react';
import * as RoleCodes from '../../rolecodes';
import Aux from '../../hoc/Auxx';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getLabelText } from '../../config';
const sidebarButtons = (props) => {
    switch (props.userType) {
        case RoleCodes.SUPPLIER:
            return <Aux>
                <Link
                    to={{ pathname: "/import-products" }}
                    className="">
                    <FormattedMessage
                        id="ListingPage.importexportbuttontext"
                        defaultMessage=
                        {
                            getLabelText(
                                props.Resources.filter((x) => { return x.resourceKey === 'importexportbuttontext' })[0],
                                "Import/Export Products"
                            )
                        }
                    />
                </Link>
                <Link
                    to={"#"}
                    className="">
                    <FormattedMessage
                        id="ListingPage.addnewproduct"
                        defaultMessage={
                            getLabelText(
                                props.Resources.filter((x) => { return x.resourceKey === 'addnewproduct' })[0],
                                "Add Product"
                            )
                        }
                    />
                </Link>

            </Aux>
        default:
            return null;
    }
}
export default sidebarButtons;