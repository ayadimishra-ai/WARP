import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from 'react';
import { getWebsiteUrl } from "../../config";

const awsUrl = getWebsiteUrl();
let singleimagename = null
class ProductGreenProperties extends Component {
    render() {
        let MaterialList = null;
        let greenPropsName = null;
        let NameofGreenProperty = null;
        if (this.props.GreenPropertiesIcon !== null && this.props.GreenPropertiesIcon !== "" && this.props.GreenPropertiesIcon !== undefined) {
            if (this.props.GreenProperties.length > 1) {
                MaterialList = this.props.GreenPropertiesIcon.split("|").join(', ');
                MaterialList = MaterialList.replace(/^[^,]+, */, '');
                greenPropsName = this.props.GreenPropertiesIcon.split("|");
                NameofGreenProperty = greenPropsName[0];
                singleimagename = (this.props.greenpropertiesmaster != undefined && this.props.greenpropertiesmaster != null && this.props.greenpropertiesmaster != "") ? this.props.greenpropertiesmaster.length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == NameofGreenProperty).length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == NameofGreenProperty)[0].iconName : null : null : null;
            }
            else {
                NameofGreenProperty = this.props.GreenProperties[0];
                singleimagename = (this.props.greenpropertiesmaster != undefined && this.props.greenpropertiesmaster != null && this.props.greenpropertiesmaster != "") ? this.props.greenpropertiesmaster.length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == NameofGreenProperty).length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == NameofGreenProperty)[0].iconName : null : null : null;
            }
        }
        return (
            <React.Fragment>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                    
                {this.props.isCompare ?
                    this.props.GreenProperties != undefined && this.props.GreenPropertiesIcon !== undefined && this.props.GreenPropertiesIcon !== null && this.props.GreenPropertiesIcon !== "" ?
                    (<React.Fragment>
                        {/* {console.log(this.props.GreenProperties.length)}
                        {console.log(this.props.GreenProperties)} */}
                        <span className="cmprclaimsname"  style={{textTransform: 'capitalize'}}>{NameofGreenProperty}</span>
                        {this.props.GreenProperties.length > 1 ?
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end' style={{textTransform: 'capitalize'}}>
                                {MaterialList}</div>
                            }>
                                <span className="cmprclaimscount" style={{ width: '24px', height: '24px', borderRadius: '100%', background: '#FFA93C', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#fff', textAlign: 'center', lineHeight: '24px' }}> +{this.props.GreenProperties.length - 1}</span>
                            </Tooltip>
                            : ''}
                    </React.Fragment>) : "" : this.props.isTab ?
                        this.props.GreenProperties != undefined && this.props.GreenProperties.length > 0 ?
                            this.props.GreenProperties.map(item => {
                                let imagename = (this.props.greenpropertiesmaster != undefined && this.props.greenpropertiesmaster != null && this.props.greenpropertiesmaster != "") ? this.props.greenpropertiesmaster.length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == item).length > 0 ? this.props.greenpropertiesmaster.filter(x => x.greenPropertyName == item)[0].iconName
                                    : null : null : null;
                                let dataitem = (
                                    <div>
                                        {imagename != null ?
                                            <img src={awsUrl + "GreenPropertiesIcons/" + imagename} />
                                            :
                                            <img src={require('../../assets/img/greenPropertiesDefault.png')} />
                                        }
                                        <Tooltip title={
                                            <div><h6 style={{ fontSize: '9px', textTransform: 'capitalize' }}>{item}</h6></div>
                                        } className="sfdfsdf">
                                            <span style={{textTransform: 'capitalize'}}>{item}</span>
                                        </Tooltip>
                                    </div>
                                );

                                return dataitem;
                            }) : ""
                        :
                        this.props.GreenProperties != undefined && this.props.GreenPropertiesIcon !== undefined && this.props.GreenPropertiesIcon !== null && this.props.GreenPropertiesIcon !== "" ?
                            (<React.Fragment>
                                {singleimagename != null ?
                                    <img src={awsUrl + "GreenPropertiesIcons/" + singleimagename} />
                                    :
                                    <img src={require('../../assets/img/greenPropertiesDefault.png')} />
                                }
                                <span style={{textTransform: 'capitalize'}}>{NameofGreenProperty}</span>
                                {this.props.GreenProperties.length > 1 ?
                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end' style={{textTransform: 'capitalize'}}> 
                                        {MaterialList}</div>
                                    }>
                                        <span style={{ width: '24px', height: '24px', borderRadius: '100%', background: '#FFA93C', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: '#fff', textAlign: 'center', lineHeight: '24px' }}> +{this.props.GreenProperties.length - 1}</span>
                                    </Tooltip>
                                    : ''}
                            </React.Fragment>) : ""
                }
                </div>
            </React.Fragment>
        )
    }
}
export default (ProductGreenProperties);