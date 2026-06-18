

import React  from 'react';
  
  const OnClick = (props,event,x)=>{ 
    props.specficationData(x,1);
  }

  const clearAllClick = (props,event) =>{
    props.specficationData('',0);
  }

const specificationSelectedFilters = props => { 
return(
    <div>
      {props.specification.length > 0 ? 
      props.specification.map(x=> (
      <div className="sk-filter-group sk-filter-group-items__list">
      <div className="sk-filter-group-items__value" onClick={(event) => OnClick(props,event,x)}>{x.Groupkey}: {x.Value}</div>
      <div className="sk-filter-group__remove-action" onClick={(event) => OnClick(props,event,x)}>X</div>
      </div>
      ))
      :''}            
      {props.specification.length > 0 && props.clearAllHide === false ? <span class="sk-reset-filters__reset" onClick={(event) => clearAllClick(props,event)}>Clear All</span> : ''}
    </div>
    )
}

export default specificationSelectedFilters