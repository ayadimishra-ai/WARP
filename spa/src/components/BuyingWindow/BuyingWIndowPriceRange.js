import React, { Component } from "react";
import { config } from "react-spring";
import Slider from "react-slick";
import moment from "moment";
import firebase from '../../config/fbconfig'
import { getFirestoreCollectionName } from '../../config';

class BuyingWIndowPriceRange extends Component {

    constructor(props) {
        super(props)
        this.state = {
            goToSlide: 0,
            offsetRadius: 6,
            showNavigation: false,
            config: config.wobbly,
            slideIndex: 0,
            updateCount: 0,
            priceSliderArr : [],
            daysRemain: 0,
            totalCommitment: 0,
        };
    }

    change = () => {
        this.setState({ goToSlide: 5 })
    }

    priceCard = ()=>{
        const priceList = this.props.ListRateCard.filter(x => x.skuGuid === this.props.DefaultSkuGuid);
        let qtyRange='';
        let price='';
        let leadTime='';
        let qtyHeader=null;
        let priceDetails=null;
        let currencySymbol=null;
        let minqty = null;
        let maxqty = null;
        let i = 0,quantityRangeArray=[];
        {priceList.map((item) => {
            if(item.quantity1 > 0)
            {
                qtyRange = item.quantity1 +'-'+ (item.quantity2-1);    
                price = item.price1;   
                leadTime = item.leadTime1InDays;
                qtyHeader = 'MOQ';
                currencySymbol = item.currencySymbol;
                minqty = item.quantity1;
                maxqty = item.quantity2-1;
                if(item.quantity1 > 0 && item.quantity2 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity1 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity1;
                        maxqty = 0;
                    }
                }

                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }
                quantityRangeArray.push(priceDetails);                
            }
            if(item.quantity2 > 0)
            {
                qtyRange = item.quantity2 +'-'+ (item.quantity3-1);    
                price = item.price2;     
                leadTime = item.leadTime2InDays;
                qtyHeader = 'QTY';
                currencySymbol = item.currencySymbol;
                minqty = item.quantity2;
                maxqty = item.quantity3-1;
                if(item.quantity2 > 0 && item.quantity3 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity2 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity2;
                        maxqty = 0;
                    }
                } 
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }               
                quantityRangeArray.push(priceDetails);
            }
            
            if(item.quantity3 > 0)
            {
                qtyRange = item.quantity3 +'-'+ (item.quantity4-1);    
                price = item.price3; 
                leadTime = item.leadTime3InDays;
                qtyHeader = 'QTY';
                currencySymbol = item.currencySymbol;
                minqty = item.quantity3;
                maxqty = item.quantity4-1;
                if(item.quantity3 > 0 && item.quantity4 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity3 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity3;
                        maxqty = 0;
                    }
                } 
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }                
                quantityRangeArray.push(priceDetails);
            }
            
            if(item.quantity4 > 0)
            {
                qtyRange = item.quantity4 +'-'+ (item.quantity5-1);    
                price = item.price4; 
                leadTime = item.leadTime4InDays;   
                qtyHeader = 'QTY';
                currencySymbol = item.currencySymbol;
                minqty = item.quantity4;
                maxqty = item.quantity5-1;
                if(item.quantity4 > 0 && item.quantity5 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity4 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity4;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }                
                quantityRangeArray.push(priceDetails);
            }
            
            if(item.quantity5 > 0)
            {
                qtyRange = item.quantity5 +'-'+ (item.quantity6-1);    
                price = item.price5;  
                leadTime = item.leadTime5InDays;   
                qtyHeader = 'QTY';
                currencySymbol = item.currencySymbol;
                minqty = item.quantity5;
                maxqty = item.quantity6-1;
                if(item.quantity5 > 0 && item.quantity6 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity5 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity5;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }            
                quantityRangeArray.push(priceDetails);
            }

            if(item.quantity6 > 0)
            {
                qtyRange = item.quantity6 +'-'+ (item.quantity7-1);    
                price = item.price6;   
                leadTime = item.leadTime6InDays;      
                qtyHeader = 'QTY';   
                currencySymbol = item.currencySymbol;      
                minqty = item.quantity6;
                maxqty = item.quantity7-1;          
                if(item.quantity6 > 0 && item.quantity7 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity6 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity6;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }               
                quantityRangeArray.push(priceDetails);
            }

            if(item.quantity7 > 0)
            {
                qtyRange = item.quantity7 +'-'+ (item.quantity8-1);    
                price = item.price7;   
                leadTime = item.leadTime7InDays;      
                qtyHeader = 'QTY';     
                currencySymbol = item.currencySymbol;   
                minqty = item.quantity7;
                maxqty = item.quantity8-1;           
                if(item.quantity7 > 0 && item.quantity8 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity7 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity7;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }                
                quantityRangeArray.push(priceDetails);
            }

            if(item.quantity8 > 0)
            {
                qtyRange = item.quantity8 +'-'+ (item.quantity9-1);    
                price = item.price8;   
                leadTime = item.leadTime8InDays;      
                qtyHeader = 'QTY'; 
                currencySymbol = item.currencySymbol;     
                minqty = item.quantity8;
                maxqty = item.quantity9-1;             
                if(item.quantity8 > 0 && item.quantity9 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity8 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity8;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }            
                quantityRangeArray.push(priceDetails);
            }

            if(item.quantity9 > 0)
            {
                qtyRange = item.quantity9 +'-'+ (item.quantity10-1);    
                price = item.price9;   
                leadTime = item.leadTime9InDays;      
                qtyHeader = 'QTY';   
                currencySymbol = item.currencySymbol;    
                minqty = item.quantity9;
                maxqty = item.quantity10-1;            
                if(item.quantity9 > 0 && item.quantity10 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity9 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity9;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                            key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                        key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }               
                quantityRangeArray.push(priceDetails);
            }

            if(item.quantity10 > 0)
            {   
                price = item.price9;   
                leadTime = item.leadTime9InDays;      
                qtyHeader = 'QTY'; 
                currencySymbol = item.currencySymbol;   
                minqty = item.quantity10;
                maxqty = item.quantity10;               
                if(item.quantity10 === 0)
                {
                    if(item.maximumOrderQuantity > 0)
                    {
                        qtyRange = item.quantity10 +'-'+ item.maximumOrderQuantity;
                        maxqty = item.maximumOrderQuantity;
                    }
                    else
                    {
                        qtyRange = '> = '+item.quantity10;
                        maxqty = 0;
                    }
                }
                if(minqty > 0 && maxqty > 0){
                    if(this.props.BWCommitmentQtyCount >= minqty && this.props.BWCommitmentQtyCount <= maxqty)
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                    else
                    { 
                        priceDetails = {
                           key : i++, 
                           qty : qtyRange,
                           rate : price,
                           lTime : leadTime,
                           qHeader : qtyHeader,
                           currencySymbol : currencySymbol,
                           minQty : minqty,
                           maxQty : maxqty,
                       };
                    }
                }
                else if(minqty > 0 && maxqty === 0)
                {
                    if(this.props.BWCommitmentQtyCount >= minqty)
                    {
                        priceDetails = {
                            key : i++,
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                    else
                    {       
                        priceDetails = {
                            key : i++, 
                            qty : qtyRange,
                            rate : price,
                            lTime : leadTime,
                            qHeader : qtyHeader,
                            currencySymbol : currencySymbol,
                            minQty : minqty,
                            maxQty : maxqty,
                        };
                    }
                }
                else
                { 
                    priceDetails = {
                       key : i++, 
                       qty : qtyRange,
                       rate : price,
                       lTime : leadTime,
                       qHeader : qtyHeader,
                       currencySymbol : currencySymbol,
                       minQty : minqty,
                       maxQty : maxqty,
                   };
                }
                quantityRangeArray.push(priceDetails);
            }
        }        
        )}
        this.props.GetQuantityRange(quantityRangeArray,"")
        this.setState({priceSliderArr:quantityRangeArray});
    }

    setRateCardClass(minQ, maxQ, qtyHeader, keyValue){
        let className='',indexvalue=keyValue;
        let priceSliderLength= this.state.priceSliderArr.length;
        if(priceSliderLength-keyValue<4)
        {
            //indexvalue = keyValue + 4-(priceSliderLength-keyValue);
            indexvalue = keyValue - (4-(priceSliderLength-keyValue));
        }  
         
        let MOQData ='';
        if(keyValue === 0)
            {
                if(qtyHeader === 'MOQ')
                {
                    MOQData = minQ;
                }
            }
        if(minQ > 0 && maxQ > 0){
            //if(parseInt(this.props.BWCommitmentQtyCount) < parseInt(MOQData))
            if(parseInt(this.state.totalCommitment) < parseInt(MOQData))
            {
                className = "BW_price_range_slider_div BW_Current";
                this.slider.slickGoTo(indexvalue);
            }
            else if(parseInt(this.state.totalCommitment) >= parseInt(minQ) && parseInt(this.state.totalCommitment) <= parseInt(maxQ))
            {
                className = "BW_price_range_slider_div BW_Current";
                this.slider.slickGoTo(indexvalue);
            }
            /*else
            {                            
                if(parseInt(this.state.totalCommitment) === 0 && parseInt(keyValue) === 0)
                {
                    className = "BW_price_range_slider_div BW_Current";
                    this.slider.slickGoTo(indexvalue);
                }
                else{                    
                    className = "BW_price_range_slider_div";
                }
            }*/
        }
        else if(minQ > 0 && maxQ === 0)
        {
            if(parseInt(this.state.totalCommitment) < parseInt(MOQData))
            {
                className = "BW_price_range_slider_div BW_Current";
                this.slider.slickGoTo(indexvalue);
            }
            else if(parseInt(this.state.totalCommitment) >= parseInt(minQ))
            {
                className = "BW_price_range_slider_div BW_Current";
                this.slider.slickGoTo(indexvalue);
            }
            /*else
            {   
                if(parseInt(this.state.totalCommitment) === 0 && parseInt(keyValue) === 0)
                {
                    className = "BW_price_range_slider_div BW_Current";
                    this.slider.slickGoTo(indexvalue);
                }
                else{                    
                    className = "BW_price_range_slider_div";
                }
            }*/
        }
        else  if(parseInt(this.state.totalCommitment) === 0 && parseInt(keyValue) === 0)
        {
            className = "BW_price_range_slider_div BW_Current";
            this.slider.slickGoTo(indexvalue);
        }
        else
        {            
            className = "BW_price_range_slider_div";
        }                
        return className;
    }

    getRemaindays()
    {
        const date1 = new Date();
        const date2 = new Date(this.props.BWEndDate);
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let days = 0;
        if(isNaN(diffDays))
        {
            days = 0;
        }
        else
        {
            days = diffDays;
        }
        return days;
    }

    setEndDate(){
        let endDate=null;
        if(this.props.BWEndDate === null)
        {
            endDate = '';
        } 
        else{ 
            endDate=moment(this.props.BWEndDate).format("DD-MMM-YYYY")
        }
        return endDate;
    }

    componentDidMount(){
        this.priceCard();
        this.getRemaindays();

        firebase.firestore().collection(getFirestoreCollectionName())
        .where('BuyingWindowGuid','==',this.props.BuyingWindowGuid.toLowerCase())
        .onSnapshot((snapshot) => {  
            if(snapshot.docs.length > 0)    
            { 
                snapshot.docs.map(doc => {
                    this.setState({
                        totalCommitment:doc.data().Quantity
                        });
                })
            }
            else
            {
                this.setState({totalCommitment:this.props.BWCommitmentQtyCount})
            }
        })
    }

    render() {
        var settings = {
            dots: false,
            infinite: false,
            speed: 700,
            slidesToShow: 4,
            slidesToScroll: 1,
        }
        //this.getRemaindays();
        return (
            <React.Fragment>                
                <div className="bw_timing">
                    {/* <span className="tt_commit">Total commitments: {this.props.BWCommitmentQtyCount} </span> */}
                    <span className="tt_commit">Total commitments: {this.state.totalCommitment === 0 ? this.props.BWCommitmentQtyCount : this.state.totalCommitment} </span>
                    <div className="tt_right">
                        <span>End date: </span>                        
                        <span>{this.setEndDate()}</span>
                        {/* <QueryBuilder /> */}
                        {/* <span>{this.getRemaindays()} days more </span> */}
                    </div>
                </div>

                <div className="bw_slider">
                    <Slider ref={slider => (this.slider = slider)} {...settings}>
                         {this.state.priceSliderArr.map((item)=>(
                            <div className={this.setRateCardClass(item.minQty,item.maxQty, item.qHeader,item.key)}>
                            <h1 className="bw_price"><span className="currencySymbolFont">{item.currencySymbol}</span>{item.rate}</h1>
                            <h5>{item.qHeader}</h5>
                            <h5>{item.qty}</h5>
                            <h6>Lead Time: {item.lTime} days</h6>
                        </div>
                    ))}
                    </Slider>
                </div>
            </React.Fragment>
        );
    }
}
export default BuyingWIndowPriceRange
