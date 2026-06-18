import React  from 'react';
  
  const OnClick = (props,event,x)=>{ 
    props.expiryDataClick(x,1);
  }

  const clearAllClick = (props,event) =>{
    props.expiryDataClick('',0);
  }

const expirySelectedFilters = props => {
return(
    <div>
      {props.expiryData.length > 0 ? 
      props.expiryData.map(x=> (
      <div className="sk-filter-group sk-filter-group-items__list">
      <div className="sk-filter-group-items__value expiry_filter_selected" onClick={(event) => OnClick(props,event,x)}>{x}</div>
      <div className="sk-filter-group__remove-action" onClick={(event) => OnClick(props,event,x)}>X</div>
      </div>
      ))
      :''}            
      {props.expiryData.length > 0 && props.clearAllHide === false ? <span class="sk-reset-filters__reset" onClick={(event) => clearAllClick(props,event)}>Clear All</span> : ''}
    </div>
    )
}

export default expirySelectedFilters