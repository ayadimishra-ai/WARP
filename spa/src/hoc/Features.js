import React from 'react';
import Aux from './Auxx';

const features = (props) => {

    var feature = props.FeatureList.filter((x) => { return x.featureName === props.FeatureItem })[0]
    if (feature !== undefined) {
        if (feature.isActive) {
            return (
                <Aux>
                    {props.children}
                </Aux>
            );
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}
export default features;