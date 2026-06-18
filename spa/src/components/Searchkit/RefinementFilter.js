import React from "react";
import {
  DynamicRangeFilter, HierarchicalMenuFilter, Panel,
  RangeInput, RefinementListFilter
} from "searchkit";
import { getLabelText } from "../../config";
import Aux from "../../hoc/Auxx";
import * as RoleCode from "../../rolecodes";

let priceURL='';
let gradeLevel = [] 

const filterLabelTranslation = props => {
  if (props.label === "true") {
    return "Active";
  } else if (props.label === "false") {
    return "Inactive";
  } else {
    return props.label;
  }
};
const OnClick = (props,event)=>{ 
    if(priceURL !== '')
    {
        props.filterURLData(priceURL);
    }
    else
    {
        props.filterURLData(window.location.href);
    }
}
const RefinementOption = props => ( 
  props.label.includes('Level')?
    gradeLevel.includes(props.label) ? 
    <div
      className={props.bemBlocks
        .option()
        .state({ selected: props.selected })
        .mix(props.bemBlocks.container("item"))}
      onClick={props.onClick}
    >
      <div className={props.bemBlocks.option("text")}>
        {filterLabelTranslation(props)}
      </div>
      <div className={props.bemBlocks.option("count")}>{props.count}</div>
    </div> 
    : ''
  :
    <div
    className={props.bemBlocks
      .option()
      .state({ selected: props.selected })
      .mix(props.bemBlocks.container("item"))}
    onClick={props.onClick}
    > 
    <div className={props.bemBlocks.option("text")}>
      {filterLabelTranslation(props)}
    </div>
    <div className={props.bemBlocks.option("count")}>{props.count}</div>
    </div>
);

// const RefinementOption = props => (
//   <div
//     className={props.bemBlocks
//       .option()
//       .state({ selected: props.selected })
//       .mix(props.bemBlocks.container("item"))}
//     onClick={props.onClick}
//   >
//     <div className={props.bemBlocks.option("text")}>
//       {filterLabelTranslation(props)}
//     </div>
//     <div className={props.bemBlocks.option("count")}>{props.count}</div>
//   </div>
// );

const HierarchicalOptions = props => (
  <div
    className={props.bemBlocks
      .option()
      .state({ selected: props.selected })
      .mix(props.bemBlocks.container("item"))}
    onClick={props.onClick}
  >
    <div className={props.bemBlocks.option("text")}>{props.label}
    </div>
    <div className={props.bemBlocks.option("count")}>{props.count}</div>
  </div>
);

const decimalPrecision = (props, count) => {
  return (
    props.CurrencySymbol +
    Number(Math.round(count + "e2") + "e-2").toFixed(props.DecimalPrecision)
  );
};
// const checkLabel=(props, count)=>{

//     return '';
// }
const refinementFilter = props => {

  if (props.GradeLevel !== null && props.GradeLevel !== "undefined") {
    props.GradeLevel.map(item => {
      gradeLevel.push(item);
    })
  }

  setTimeout(function () {
    var rangeInputmax = document.querySelectorAll('.sk-range-input__input[placeholder="max"]');
    var rangeInputmin = document.querySelectorAll('.sk-range-input__input[placeholder="min"]');
 
    for (let i = 0, j = 0; i < rangeInputmax.length, j < rangeInputmin.length; i++ , j++) {
      rangeInputmax[i].setAttribute('step','any')
      rangeInputmin[j].setAttribute('step','any')
      const maxinput = rangeInputmax[i];
      const mininput = rangeInputmin[j];
      maxinput.addEventListener("keyup", function () {
        if (maxinput.value === '') {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'none';
          }
        } else if (mininput.value === '') {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'none';
          }
        } else {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'inline-block';
          }
        }
      })
      mininput.addEventListener("keyup", function () {
        if (mininput.value === '') {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'none';
          }
        } else if (maxinput.value === '') {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'none';
          }
        } else {
          var goBtn = document.querySelectorAll('.sk-range-input__submit')[0];
          if (goBtn) {
            goBtn.style.display = 'inline-block';
          }
        }
      })
    }
  }, 2000)

  let inputs = document.querySelectorAll('.sk-range-input__submit')[0]
  if(inputs !== undefined){
    inputs.addEventListener('click', function() {

    let rangeInputmax = document.querySelectorAll('.sk-range-input__input[placeholder="max"]');
    let rangeInputmin = document.querySelectorAll('.sk-range-input__input[placeholder="min"]');
    
    let minPrice = rangeInputmin[0].defaultValue;
    let maxPrice = rangeInputmax[0].defaultValue;

    let siteURL=[];
    if((window.location.href).includes('?'))
    {
      siteURL.push(window.location.href.split('?'))
    }
    else
    {
      siteURL.push(window.location.href);
    }
    priceURL = siteURL[0]+'?minprice[min]='+minPrice+'&minprice[max]='+maxPrice
    });
  }

  return (
    <Aux>
      <div className="" onClick={(event) => OnClick(props,event)}>
        {props.Filters.filterType === 'DynamicRangeFilter' ?
          (props.userType === RoleCode.SUPPLIER || props.userType === RoleCode.ADMIN || props.userType === RoleCode.STRATEGICUSER) ? "" :
            <DynamicRangeFilter
              title={getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === "price";
                })[0],
                "Price"  + " (" + props.CurrencySymbol + ")"
              )} 
              field="minPrice"
              id="minprice"
              rangeComponent={RangeInput}
              rangeFormatter={count => decimalPrecision(props, count)}
              showHistogram={true}
            />
        : ""}
        {props.Filters.filterType === 'HierarchicalMenuFilter' ?
            <HierarchicalMenuFilter
            fields={[
              "listProductSubCategory.categoryname.raw",
              "listProductSubCategory.subcategoryname.raw"
            ]}
            title={getLabelText(
              props.Resources.filter(x => {
                return x.resourceKey === "categories";
              })[0],
              "Category"
            )}
            id="categories"
            orderDirection="asc"
            itemComponent={HierarchicalOptions}
            containerComponent={
              <Panel collapsable={true} defaultCollapsed={false} />
            }
          />
        : ""}
        {props.Filters.filterType === 'RefinementListFilter' ?
            <RefinementListFilter
              id={props.Filters.filterId}
              key={props.Filters.filterId}
              title={getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === props.Filters.title;
                })[0],
                props.Filters.title
              )}
              field={props.Filters.field}
              size={props.Filters.size}
              operator={props.Filters.operator}
              orderKey={props.Filters.orderKey}
              itemComponent={RefinementOption}
              //rangeFormatter={(count) => checkLabel(props, count)}
              containerComponent={
                <Panel
                  collapsable={props.Filters.collapsible}
                  defaultCollapsed={false}
                />
              }
            />
          : ""}

        {/* <HierarchicalRefinementFilter field="listProductSubCategory" title="Colors" id="colors"/> */}
        {/* <HierarchicalMenuFilter
          fields={[
            "listProductSubCategory.categoryname.raw",
            "listProductSubCategory.subcategoryname.raw"
          ]}
          title={getLabelText(
            props.Resources.filter(x => {
              return x.resourceKey === "categories";
            })[0],
            "Category"
          )}
          id="categories"
          orderDirection="asc"
          itemComponent={HierarchicalOptions}
          containerComponent={
            <Panel collapsable={true} defaultCollapsed={false} />
          }
        /> */}
      </div>
    </Aux>
  );
};
export default refinementFilter;
