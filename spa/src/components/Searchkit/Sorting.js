import React from "react";
import * as RoleCodes from "../../rolecodes";
import { getLabelText } from "../../config";
import { SortingSelector } from "searchkit";

const sorting = props => {
  let arrRole = props.userType.split("~");
  if (arrRole.length > 1) {
    if (
      //arrRole.filter(x => x.userType === "APPROVER" && x.userType === "BUYER")
      arrRole.includes("BUYER") || arrRole.includes("STRATEGICUSER")
    ) {
      return (
        <SortingSelector
          options={[
            {
              label: getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === "productnameasc";
                })[0],
                "Product name A-Z"
              ),

              field: "productname_raw.raw",
              order: "asc"
            },
            {
              label: getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === "productnamedesc";
                })[0],
                "Product name Z-A"
              ),
              field: "productname_raw.raw",
              order: "desc"
            },
            {
              label: getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === "priceasc";
                })[0],
                "Price Ascending"
              ),
              field: "minPrice",
              order: "asc"
            },
            {
              label: getLabelText(
                props.Resources.filter(x => {
                  return x.resourceKey === "pricedesc";
                })[0],
                "Price Descending"
              ),
              field: "minPrice",
              order: "desc"
            }
          ]}
        />
      );
    }
  } else {
    switch (props.userType) {
      case RoleCodes.SUPPLIER:
        return (
          <SortingSelector
            options={[
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnameasc";
                  })[0],
                  "Product name A-Z"
                ),

                field: "productname_raw.raw",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnamedesc";
                  })[0],
                  "Product name Z-A"
                ),
                field: "productname_raw.raw",
                order: "desc"
              }
            ]}
          />
        );
      case RoleCodes.BUYER:
        return (
          <SortingSelector
            options={[
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnameasc";
                  })[0],
                  "Product name A-Z"
                ),

                field: "productname_raw.raw",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnamedesc";
                  })[0],
                  "Product name Z-A"
                ),
                field: "productname_raw.raw",
                order: "desc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "priceasc";
                  })[0],
                  "Price Ascending"
                ),
                field: "minPrice",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "pricedesc";
                  })[0],
                  "Price Descending"
                ),
                field: "minPrice",
                order: "desc"
              }
            ]}
          />
        );
      case RoleCodes.APPROVER:
        return (
          <SortingSelector
            options={[
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnameasc";
                  })[0],
                  "Product name A-Z"
                ),

                field: "productname_raw.raw",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnamedesc";
                  })[0],
                  "Product name Z-A"
                ),
                field: "productname_raw.raw",
                order: "desc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "priceasc";
                  })[0],
                  "Price Ascending"
                ),
                field: "minPrice",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "pricedesc";
                  })[0],
                  "Price Descending"
                ),
                field: "minPrice",
                order: "desc"
              }
            ]}
          />
        );
      case RoleCodes.ADMIN:
        return (
          <SortingSelector
            options={[
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnameasc";
                  })[0],
                  "Product name A-Z"
                ),

                field: "productname_raw.raw",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnamedesc";
                  })[0],
                  "Product name Z-A"
                ),
                field: "productname_raw.raw",
                order: "desc"
              }
            ]}
          />
        );
        case RoleCodes.STRATEGICUSER:
        return (
          <SortingSelector
            options={[
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnameasc";
                  })[0],
                  "Product name A-Z"
                ),

                field: "productname_raw.raw",
                order: "asc"
              },
              {
                label: getLabelText(
                  props.Resources.filter(x => {
                    return x.resourceKey === "productnamedesc";
                  })[0],
                  "Product name Z-A"
                ),
                field: "productname_raw.raw",
                order: "desc"
              }
            ]}
          />
        );
      default:
        return null;
    }
  }
};
export default sorting;
