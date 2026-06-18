import React from 'react';
import Aux from './Auxx';

export const Permission = (props) => {
    if (props.permissionType === 'W') {
        return (<Aux>
            {props.children}
        </Aux>
        );
    }
    else {
        return (null);
    }
}