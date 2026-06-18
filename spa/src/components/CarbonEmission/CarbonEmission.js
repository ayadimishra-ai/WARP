import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from "react";

class CarbonEmission extends Component {
    state = {
        open: false,
        isco2_cal: false
    };

    componentDidMount() {

    }

    handleTooltipClose = () => {
        this.setState({ open: false });
    };

    handleTooltipOpen = () => {
        this.setState({ open: true });
    };

    render() {
        let isco2_cal = false
        if (this.props.pageName === 'order-detail') {
            if (parseFloat(this.props.CarbonEmission).toFixed(2) != 0.00) {
                isco2_cal = true
            }
            else {
                isco2_cal = false
            }
        }
        else {
            if (this.props.ListProductVariant !== undefined && this.props.ListProductVariant !== "" && this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku).length > 0 && this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0) {
                if (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Gram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Kilogram" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pieces" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Pound" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Metric Tonnes" || this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] === "Tonnes") {
                    if (parseFloat(this.props.ListProductVariant.filter(a => a.skuGuid === this.props.Selectedsku)[0].carbonEmission).toFixed(2) != 0.00) {
                        isco2_cal = true
                    }
                    else {
                        isco2_cal = false
                    }
                }
            }
        }
        let tooltipcontent = "";
        if (this.props.virtualSampleData !== undefined && this.props.virtualSampleData.length > 0 && this.props.virtualSampleData.filter(x => x === this.props.supplierCompanyGuid).length > 0) {
            tooltipcontent = "The product carbon footprint doesn’t include the impact of the printing & embossing on the product";
        }
        let totalco2 = parseFloat(this.props.CarbonEmission.toFixed(2)) + parseFloat(this.props.TransportEmission.toFixed(2));
        //let plasticwt = 0;
        //if (this.props.ListProductSkuMaterials !== undefined && this.props.ListProductSkuMaterials.length > 0) {
         //     this.props.ListProductSkuMaterials.forEach((item) => {
          //      plasticwt += item.weight;
           // })
       // }
        return (
            <div className={this.props.pageName === 'cart' || this.props.pageName === 'rfq' || this.props.pageName === 'product-detail' || this.props.pageName === 'order-detail' || this.props.pageName === 'rfq_total' || this.props.pageName === 'cart_total' || isco2_cal !== true ? "co2e_capsules" : "co2e_capsules if_co2_cal"}>
                {this.props.isPlasticWeight && <div className={this.props.isCo2E === false ? "plastic_weight full_radius" : "plastic_weight"}>
                    {this.props.pageName === 'rfq' || this.props.pageName === 'product-detail' || this.props.pageName === 'rfq_total' || this.props.pageName === 'cart_total' ? <span className="name">Plastic Weight:</span>
                        : <span className="name">Total plastic weight for this item is</span>}
                    <span className="value">
                        {this.props.PlasticWeight !== undefined && this.props.PlasticWeight !== null ? parseFloat(this.props.PlasticWeight).toFixed(2) : ""} {this.props.PlasticWeightUnit === "Grams" || this.props.PlasticWeightUnit === "Kilogram" || this.props.PlasticWeightUnit === "Pound" || this.props.PlasticWeightUnit === "Metric Tonnes" ? "Kg" : " " + this.props.PlasticWeightUnit}
                        {/*  {this.props.PlasticWeight !== undefined && this.props.PlasticWeight !== null ? parseFloat(this.props.PlasticWeight).toFixed(2) : ""} {this.props.PlasticWeightUnit==="Grams" || this.props.PlasticWeightUnit==="Kilogram" || this.props.PlasticWeightUnit==="Pound" || this.props.PlasticWeightUnit==="Metric Tonnes" ? "Kg" : " " + this.props.PlasticWeightUnit}*/}
                        {/*{this.props.ListProductSkuMaterials !== undefined && this.props.ListProductSkuMaterials.length > 0 ? parseFloat(plasticwt).toFixed(2) : ""}*/}
                        {/*{this.props.PlasticWeightUnit === "Grams" || this.props.PlasticWeightUnit === "Kilogram" || this.props.PlasticWeightUnit === "Pound" || this.props.PlasticWeightUnit === "Metric Tonnes" ? "Kg" : " " + this.props.PlasticWeightUnit}*/}

                        {this.props.ListProductSkuMaterials !== undefined && this.props.ListProductSkuMaterials.length > 0 ? <ClickAwayListener onClickAway={this.handleTooltipClose}>
                            <Tooltip PopperProps={{
                                disablePortal: true,
                                className: 'co2e_capsules_tooltip'
                            }}
                                onClose={this.handleTooltipClose}
                                open={this.state.open}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                    
                                    {this.props.ListProductSkuMaterials.map(item=>{
                                    return (<p>{item.materialName} :{parseFloat(item.weight).toFixed(3)}{this.props.PlasticWeightUnit==="Grams" || this.props.PlasticWeightUnit==="Kilogram" || this.props.PlasticWeightUnit==="Pound" || this.props.PlasticWeightUnit==="Metric Tonnes" ? "Kg" : " " + this.props.PlasticWeightUnit}</p>)
                                     })}

                                </div>}>
                                <svg onClick={this.handleTooltipOpen} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Tooltip>
                        </ClickAwayListener> :"" }
                    </span>

                    
                </div>
                }
                {this.props.pageName === 'product-detail' || this.props.pageName === 'rfq' ?
                    this.props.CarbonEmission !== undefined && this.props.CarbonEmission !== null ? parseFloat(this.props.CarbonEmission.toFixed(2)) != 0.00 ?
                        <div className={this.props.isPlasticWeight === false ? "prod_co2e full_radius " : "prod_co2e"}>
                            <span className="name">Product CO<sub>2</sub>e : </span>
                            <span className="value">{this.props.CarbonEmission.toFixed(2)}&nbsp;<span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span>
                                {tooltipcontent != "" ?
                                    <ClickAwayListener onClickAway={this.handleTooltipClose}>
                                        <Tooltip PopperProps={{
                                            disablePortal: true,
                                            className: 'co2e_capsules_tooltip'
                                        }}
                                            placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                <p>{tooltipcontent}</p>
                                                {/* <p style={{ color: '#ffa93c', cursor: 'pointer' }} onClick={() => alert(3)}>Click here for details</p> */}
                                            </div>}>
                                            <svg onClick={this.handleTooltipOpen} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Tooltip>
                                    </ClickAwayListener> : ""}
                            </span>
                        </div>
                        : "" : ""
                    :
                    totalco2 > 0 ?
                        <div className={this.props.isPlasticWeight === false ? "prod_co2e full_radius " : "prod_co2e"}>
                            {this.props.pageName === 'rfq' || this.props.pageName === 'product-detail' || this.props.pageName === 'rfq_total' || this.props.pageName === 'cart_total' ?
                                this.props.pageName === 'cart_total' ? <span className="name">Carbon Footprint: </span> : 
                                parseFloat(this.props.TransportEmission) > 0 ? <span className="name">Total CO<sub>2</sub>e : </span>
                                :
                                <span className="name">Product CO<sub>2</sub>e : </span>
                            :
                            <span className="name">Total carbon footprint is </span>}
                            {(parseFloat(this.props.CarbonEmission) > 0 || parseFloat(this.props.TransportEmission) > 0) ?
                                <React.Fragment>
                                    <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                        <div className="amt_breakup_tooltip">
                                            {parseFloat(this.props.CarbonEmission) > 0 ?
                                                <React.Fragment>
                                                    <div>
                                                        <span>Product CO<sub>2</sub>e : </span>
                                                        <span>{this.props.CarbonEmission.toFixed(2)}&nbsp;<span dangerouslySetInnerHTML={{ __html: this.props.CarbonEmissionUnit }}></span></span>
                                                    </div>
                                                </React.Fragment>
                                                : ""}
                                            {parseFloat(this.props.TransportEmission) > 0 ?
                                                <div>
                                                    <span>Transport CO<sub>2</sub>e : </span>
                                                    <span>{this.props.TransportEmission.toFixed(2)}&nbsp;<span dangerouslySetInnerHTML={{ __html: this.props.TransportEmissionUnit }}></span></span>
                                                </div>
                                                : ""}
                                        </div>
                                    </div>}>
                                        <span className="value">
                                            {totalco2.toFixed(2)}&nbsp;<span dangerouslySetInnerHTML={{ __html:  this.props.CarbonEmissionUnit }}></span>
                                            {tooltipcontent != "" ?
                                                <ClickAwayListener onClickAway={this.handleTooltipClose}>
                                                    <Tooltip PopperProps={{
                                                        disablePortal: true,
                                                        className: 'co2e_capsules_tooltip'
                                                    }}
                                                        placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                            <p>{tooltipcontent}</p>
                                                            {/* <p style={{ color: '#ffa93c', cursor: 'pointer' }} onClick={() => alert(3)}>Click here for details</p> */}
                                                        </div>}>
                                                        <svg onClick={this.handleTooltipOpen} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                            <path d="M7.66667 9.66667H7V7H6.33333M7 4.33333H7.00667M13 7C13 7.78793 12.8448 8.56815 12.5433 9.2961C12.2417 10.0241 11.7998 10.6855 11.2426 11.2426C10.6855 11.7998 10.0241 12.2417 9.2961 12.5433C8.56815 12.8448 7.78793 13 7 13C6.21207 13 5.43185 12.8448 4.7039 12.5433C3.97595 12.2417 3.31451 11.7998 2.75736 11.2426C2.20021 10.6855 1.75825 10.0241 1.45672 9.2961C1.15519 8.56815 1 7.78793 1 7C1 5.4087 1.63214 3.88258 2.75736 2.75736C3.88258 1.63214 5.4087 1 7 1C8.5913 1 10.1174 1.63214 11.2426 2.75736C12.3679 3.88258 13 5.4087 13 7Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </Tooltip>
                                                </ClickAwayListener> : ""}
                                        </span>
                                    </Tooltip>
                                </React.Fragment>
                                : ""}
                        </div>
                        : ""
                }
            </div>
        )
    }

}
export default CarbonEmission