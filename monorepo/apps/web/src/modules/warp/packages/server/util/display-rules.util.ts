import FormData, {
  InterfaceType,
} from "../../../apps/web/components/form/form-data";

export function checkCondition(condition, matchValue) {
  const conditionKey = Object.keys(condition)[0];
  if (condition[conditionKey].hasOwnProperty("_eq")) {
    return condition[conditionKey]._eq === matchValue;
  } else if (condition[conditionKey].hasOwnProperty("_neq")) {
    return condition[conditionKey]._neq !== matchValue;
  } else if (condition[conditionKey].hasOwnProperty("_lt")) {
    return condition[conditionKey]._lt < matchValue;
  } else if (condition[conditionKey].hasOwnProperty("_lte")) {
    return condition[conditionKey]._lte <= matchValue;
  } else if (condition[conditionKey].hasOwnProperty("_gt")) {
    return condition[conditionKey]._gt > matchValue;
  } else if (condition[conditionKey].hasOwnProperty("_gte")) {
    return condition[conditionKey]._gte >= matchValue;
  } else {
    return null;
  }
}

export function getDefaultInterfaceValue(formFieldId) {
  const getFormFieldInterfaceType: InterfaceType = FormData.formField.filter(
    (x) => x.id == formFieldId
  )[0].interface;

  if (getFormFieldInterfaceType == ("select-toggle" as InterfaceType))
    return false;
  else if (getFormFieldInterfaceType == ("select-dropdown" as InterfaceType))
    return "";
  else if (getFormFieldInterfaceType == ("file" as InterfaceType)) return "";
}
