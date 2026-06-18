import React, { Component } from 'react';

class ResetFiltersDisplay extends Component {
    constructor(props){
        super(props);
        this.state = {
            startDate:null,
            endDate:null
        }
    }

    clearDate = () => {        
        document.querySelectorAll('.date-filter button')[0].click();
    }

 
    
    render(){
        const { bemBlock, hasFilters, translate, resetFilters  } = this.props
        return (
            <div onClick={()=>{resetFilters();this.clearDate()}} className={bemBlock().state({ disabled: !hasFilters })}>
                <div className={bemBlock("reset")}>{translate("reset.clear_all")}</div>
            </div>
        )
    }

    
}

export default ResetFiltersDisplay;


