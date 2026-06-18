export const formattedNumber = (number: number | null, toFixed: number) => {
  if (number == null || isNaN(number)) {
    return "N/A";
  }

  let formatted = "";

  if (number >= 1000) {
    formatted = (number / 1000).toFixed(toFixed) + "K";
  } else {
    formatted = number.toFixed(toFixed);
  }
  return formatted;
};

export const getQuarterName = (month: number, year: number) => {
  const quarter = month < 4 ? 4 : Math.ceil(month / 3) - 1;
  const yrname = month < 4 ? year - 1 : year;
  const quarterName = `${yrname.toString().slice(2)}-${parseInt(yrname.toString().slice(2)) + 1} Q${quarter}`;
  return quarterName;
};
export const getYearCategoryNameNumber = (month: number, year: number) => {
  const yearName =
    month < 4
      ? `${String(year - 1)}-${String(year).slice(2)}`
      : `${String(year)}-${String(year + 1).slice(2)}`;
  return yearName;
};
