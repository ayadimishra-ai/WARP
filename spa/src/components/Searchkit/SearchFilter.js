import React from 'react';
import { getLabelText } from '../../config';

import {
    InputFilter

} from "searchkit";

  const getURL=(props,event)=>{
     props.filterURLData(window.location.href);
  }

  
  function onChange() {
    let {query_name, search, loader} = onChange;
}

const searchFilter = (props) => {

//   let inputs = document.querySelectorAll('.sk-input-filter__remove')[0]
//   if(inputs !== undefined){
//     inputs.addEventListener('click', function() {
//         props.filterURLData(window.location.origin+'/listing-page');
//     });
//   }

     const title = getLabelText(
        props.Resources.filter((x) => { return x.resourceKey === 'searchinputfilter' })[0], "Search")

    return (
    // <div onBlur={(event) => getURL(props,event)}>
    <div onKeyDown={(event) => getURL(props,event)}>
    <InputFilter
        id="products"
        searchThrottleTime={500}
       // title={title}
        placeholder={title}
        searchOnChange={true}
        prefixQueryFields={["productCode", "tagAttributes"]} 
        />
    </div>)

}
export default searchFilter;