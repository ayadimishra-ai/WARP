import React, { Component } from 'react';
import Tooltip from '@material-ui/core/Tooltip';

class ProductIncoTerms extends Component {
    render() {
        let toolTipContents = null;
        let toolTipValues = null;
        let Items = null;
        let IncoTerms = null;
        let values = null;
        let productIncoTerms = null;
        if (this.props.productIncoTerm !== undefined && this.props.productIncoTerm !== '') {
            if (this.props.productIncoTerm.includes("|")) {
                toolTipContents = this.props.productIncoTerm.split("|");
                toolTipValues = toolTipContents.slice(2, toolTipContents.length);
                Items = toolTipValues.join(", ");

                IncoTerms = this.props.productIncoTerm.split("|");
                values = IncoTerms.splice(0, 2);
                productIncoTerms = values.join(", ");
            }
            else {
                toolTipContents = this.props.productIncoTerm.split(",");
                toolTipValues = toolTipContents.slice(2, toolTipContents.length);
                Items = toolTipValues.join(", ");

                IncoTerms = this.props.productIncoTerm.split(",");
                values = IncoTerms.splice(0, 2);
                productIncoTerms = values.join(", ");
            }
        }
        return (
            <React.Fragment>
                <p>Inco Term</p>
                <div style={{ display: 'flex' }}>

                    <h6>
                        {productIncoTerms}
                    </h6>
                    &nbsp;
                    {toolTipContents !== '' && toolTipContents !== undefined && toolTipContents.length > 2 ?
                        <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>{Items}</div>}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '100%', background: '#FFA93C', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#fff', textAlign: 'center', lineHeight: '24px' }}> +{toolTipContents.length - 2}</span>
                        </Tooltip>
                        : ''}
                </div>
            </React.Fragment>
        )
    }
}
export default (ProductIncoTerms);