export const checkIfNumZeroOrMoreThan10Quad = (value: string): boolean => {
  const cleanValue = value?.replace(/,/g, "").trim();
  const numValue = parseFloat(cleanValue || "0");

  // Only return true for values >= 10 quadrillion, not for zero
  return numValue >= 10 ** 16;
};
export function numbertoword(
  _amount: any,
  isCurrency: any,
  formfieldtype: string
) {
  let amount = _amount.replaceAll(",", "");

  let val = null;
  if (
    formfieldtype == "currency-number" ||
    formfieldtype == "text-with-prefix" ||
    formfieldtype == "currency-with-comma"
  ) {
    let wholeNo = amount;
    let points = "";
    let andStr = "";
    let pointStr = "";
    let endStr = isCurrency ? "Only" : "";
    try {
      let decimalPlace = amount.indexOf(".");
      if (decimalPlace > 0) {
        wholeNo = amount.substring(0, decimalPlace);
        points = amount.substring(decimalPlace + 1);
        if (parseInt(points) > 0) {
          andStr = isCurrency ? "" : "rupees"; // just to separate whole numbers from points/cents
          endStr = isCurrency ? "paise " + endStr : "";
          if (points.length > 2) {
            points = points.substring(0, 2);
          }
          pointStr = translateCents(points);
        }
      }
      let wholenumbers = "";
      let numlength = wholeNo.length;
      if (numlength > 9) {
        let lastseven = wholeNo.slice(-7);
        let startingnumber = wholeNo.substring(0, wholeNo.length - 7);
        let startnumber = translateWholeNumber(startingnumber);
        let restnumber = translateWholeNumber(lastseven);
        wholenumbers = startnumber + " Crore " + restnumber;
      } else {
        wholenumbers = translateWholeNumber(wholeNo);
      }
      if (isCurrency) {
        val = wholenumbers + " Rupees" + andStr + " " + pointStr + " " + endStr;
      } else {
        val = wholenumbers + andStr + " " + pointStr + " " + endStr;
      }
    } catch {}
  }
  return val;
}
function translateWholeNumber(number: any) {
  let word = "";
  try {
    let beginsZero = false;
    let dblAmt = parseFloat(number);
    if (dblAmt > 0) {
      beginsZero = number.startsWith("0");
      if (beginsZero) number = number.replace(/^0+/, "");
      let numDigits = number.length;
      switch (numDigits) {
        case 1: //ones' range
          word = ones(number);
          break;
        case 2: //tens' range
          word = tens(number);
          break;
        case 3: //hundreds' range
          word =
            ones(number.substring(0, 1)) +
            " Hundred  " +
            tens(number.substring(1, 3));
          break;
        case 4: //thousands' range
          word = ones(number.substring(0, 1)) + " Thousand ";
          if (number.substring(1, 2) != "0") {
            word = word + ones(number.substring(1, 2)) + " Hundred  ";
          }
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4));
          }
          break;
        case 5: //ten thousand's range
          word = tens(number.substring(0, 2)) + " Thousand ";
          if (number.substring(2, 3) != "0") {
            word = word + ones(number.substring(2, 3)) + " Hundred  ";
          }
          if (number.substring(3, 5) != "0") {
            word = word + tens(number.substring(3, 5));
          }
          break;
        case 6: //lakh' range
          word = ones(number.substring(0, 1)) + " Lakh ";
          if (number.substring(1, 3) != "0") {
            word = word + tens(number.substring(1, 3)) + " Thousand ";
          }
          if (number.substring(3, 4) != "0") {
            word = word + ones(number.substring(3, 4)) + " Hundred  ";
          }
          if (number.substring(4, 6) != "0") {
            word = word + tens(number.substring(4, 6));
          }
          break;
        case 7: //ten lakh's
          word = tens(number.substring(0, 2)) + " Lakh ";
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4)) + " Thousand ";
          }
          if (number.substring(4, 5) != "0") {
            word = word + ones(number.substring(4, 5)) + " Hundred  ";
          }
          if (number.substring(5, 7) != "0") {
            word = word + tens(number.substring(5, 7));
          }
          break;
        case 8: //crore's range
          word = ones(number.substring(0, 1)) + " Crore ";
          if (number.substring(1, 3) != "0") {
            word = word + tens(number.substring(1, 3)) + " Lakh ";
          }
          if (number.substring(3, 5) != "0") {
            word = word + tens(number.substring(3, 5)) + " Thousand ";
          }
          if (number.substring(5, 6) != "0") {
            word = word + ones(number.substring(5, 6)) + " Hundred  ";
          }
          if (number.substring(6, 8) != "0") {
            word = word + tens(number.substring(6, 8));
          }
          break;
        case 9: //ten crore's range
          word = tens(number.substring(0, 2)) + " Crore ";
          if (number.substring(2, 4) != "0") {
            word = word + tens(number.substring(2, 4)) + " Lakh ";
          }
          if (number.substring(4, 6) != "0") {
            word = word + tens(number.substring(4, 6)) + " Thousand ";
          }
          if (number.substring(6, 7) != "0") {
            word = word + ones(number.substring(6, 7)) + " Hundred  ";
          }
          if (number.substring(7, 9) != "0") {
            word = word + tens(number.substring(7, 9));
          }
          break;
        default:
          word = "Zero";
          break;
      }
    } else {
      word = "Zero";
    }
  } catch {}
  return word;
}
function tens(digit: any) {
  let digt = parseInt(digit);
  let name = "";
  switch (digt) {
    case 10:
      name = "Ten";
      break;
    case 11:
      name = "Eleven";
      break;
    case 12:
      name = "Twelve";
      break;
    case 13:
      name = "Thirteen";
      break;
    case 14:
      name = "Fourteen";
      break;
    case 15:
      name = "Fifteen";
      break;
    case 16:
      name = "Sixteen";
      break;
    case 17:
      name = "Seventeen";
      break;
    case 18:
      name = "Eighteen";
      break;
    case 19:
      name = "Nineteen";
      break;
    case 20:
      name = "Twenty";
      break;
    case 30:
      name = "Thirty";
      break;
    case 40:
      name = "Fourty";
      break;
    case 50:
      name = "Fifty";
      break;
    case 60:
      name = "Sixty";
      break;
    case 70:
      name = "Seventy";
      break;
    case 80:
      name = "Eighty";
      break;
    case 90:
      name = "Ninety";
      break;
    default:
      if (digt > 0) {
        name =
          tens(digit.substring(0, 1) + "0") + " " + ones(digit.substring(1));
      }
      break;
  }
  return name;
}
function ones(digit: any) {
  let digt = parseInt(digit);
  let name = "";
  switch (digt) {
    case 1:
      name = "One";
      break;
    case 2:
      name = "Two";
      break;
    case 3:
      name = "Three";
      break;
    case 4:
      name = "Four";
      break;
    case 5:
      name = "Five";
      break;
    case 6:
      name = "Six";
      break;
    case 7:
      name = "Seven";
      break;
    case 8:
      name = "Eight";
      break;
    case 9:
      name = "Nine";
      break;
  }
  return name;
}
function translateCents(cents: any) {
  let cts = "";
  if (cents.length == 2 && cents.substring(0, 1) == "0") {
    cts = ones(cents.substring(1, 2));
  } else if (cents.length == 2) {
    if (parseInt(cents) > 10 && parseInt(cents) < 20) {
      cts = tens(cents);
    } else {
      cts =
        tens(cents.substring(0, 1) + "0") + " " + ones(cents.substring(1, 2));
    }
  } else {
    if (cents.length == 1) {
      cents += "0";
    }
    cts = tens(cents);
  }
  return cts;
}
export const numberToWords = (
  amount: number,
  isCurrency: boolean,
  formfieldtype: string
): string | null => {
  // if(formfieldtype=="currency-with-comma")
  // {
  // Early return for 0 value
  if (amount === 0)
    return isCurrency ? "Zero rupees only." : "Zero dollars only.";

  // Define number arrays
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  //const scalesIndian = ["", "thousand", "lakh", "crore", "arab", "kharab", "neel", "padma", "shankh", "mahal","jangh", "vasant", "trilakh"];
  const scalesIndian = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    {
      /*
      // Words not shown above Quadrillion
      "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
    "decillion",
    "undecillion",
    "duodecillion",
    "tredecillion",
    "quattuordecillion",
    "quindecillion",
    "sexdecillion",
    */
    },
  ];
  const scalesWestern = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    {
      /*
      // Words not shown above Quadrillion
    "quintillion",
    "sextillion",
    "septillion",
    "octillion",
    "nonillion",
    "decillion",
    "undecillion",
    "duodecillion",
    "tredecillion",
    "quattuordecillion",
    "quindecillion",
    "sexdecillion",
    */
    },
  ];

  // Function to convert number chunk into words
  const numToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " hundred" +
        (n % 100 !== 0 ? " and " + numToWords(n % 100) : "")
      );
    return "";
  };

  // General function to split number into scales and convert to words
  const splitIntoScales = (num: string, isCurrency: boolean): string => {
    const scales = isCurrency ? scalesIndian : scalesWestern;
    let result = "";
    let scaleIndex = 0;

    while (num.length > 0) {
      let chunk;
      // Handle Indian scale (first chunk 3 digits, rest 2 digits)
      if (isCurrency && scaleIndex === 0) {
        chunk = Number(num.slice(-3)); // First chunk is 3 digits
        num = num.slice(0, -3);
      } else {
        chunk = Number(num.slice(-2)); // Subsequent chunks are 2 digits
        num = num.slice(0, -2);
      }

      if (chunk > 0) {
        result =
          numToWords(chunk) +
          (scales[scaleIndex] ? " " + scales[scaleIndex] : "") +
          " " +
          result;
      }

      scaleIndex++;
    }

    return result.trim();
  };

  // Separate integer and decimal parts
  const [integerPart, decimalPart] = amount.toString().split(".");

  // Skip if the number is 10 quadrillion or greater
  if (checkIfNumZeroOrMoreThan10Quad(integerPart.toString())) {
    return "";
  }

  // Process integer part
  let words = splitIntoScales(integerPart, isCurrency);

  // Process decimal part (if present)
  if (decimalPart && Number(decimalPart) > 0) {
    words += isCurrency
      ? ` rupees and ${numToWords(Number(decimalPart))} paise`
      : ` dollars and ${numToWords(Number(decimalPart))} cents`;
  } else {
    words += isCurrency ? " rupees" : " dollars";
  }

  // Capitalize and finalize the string
  return words.charAt(0).toUpperCase() + words.slice(1) + " only.";
};
export const numberToWordsUSD = (
  number: number,
  isCurrency: boolean,
  formfieldtype: string
): string | null => {
  // Convert input to a number

  // Words for number conversion
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const scales = [
    "",
    "thousand",
    "million",
    "billion",
    "trillion",
    "quadrillion",
    {
      /*
      // Words not shown above Quadrillion.
      "quintillion", "sextillion", "septillion", "octillion", "nonillion",
    "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion",
    "quindecillion", "sexdecillion"
    */
    },
  ];

  // Convert numbers less than 1000 to words
  const numToWords = (num: number): string => {
    if (num === 0) return "";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    }
    return (
      ones[Math.floor(num / 100)] +
      " hundred" +
      (num % 100 !== 0 ? " and " + numToWords(num % 100) : "")
    );
  };

  // Split the number into groups of three digits (Western format)
  const splitNumberIntoChunks = (num: number): number[] => {
    const chunks = [];
    while (num > 0) {
      chunks.push(num % 1000); // Extract the last three digits
      num = Math.floor(num / 1000); // Remove the last three digits
    }
    return chunks.reverse();
  };

  // Separate integer and decimal parts
  const integerPart = Math.floor(number);
  const decimalPart = Math.round((number - integerPart) * 100); // Decimal as two digits

  // Handle zero case explicitly
  if (integerPart === 0 && decimalPart === 0) {
    return isCurrency ? "Zero rupees only." : "Zero dollars only.";
  }

  // Skip if the number is 10 quadrillion or greater
  if (checkIfNumZeroOrMoreThan10Quad(integerPart.toString())) {
    return "";
  }

  // Convert integer part to words
  const chunks = splitNumberIntoChunks(integerPart);
  let words = "";

  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] > 0) {
      words += `${numToWords(chunks[i])} ${scales[chunks.length - i - 1]} `;
    }
  }

  words = words.trim();

  // Handle case where integer part is 0 but decimal part exists
  if (words === "" && integerPart === 0) {
    words = "zero";
  }

  // Add decimal part if present
  // if (decimalPart > 0) {
  //   words += ` and ${numToWords(decimalPart)} cents`;
  // } else {
  //   words += " dollars";
  // }

  if (decimalPart && Number(decimalPart) > 0) {
    words += isCurrency
      ? ` rupees and ${numToWords(Number(decimalPart))} paise`
      : ` dollars and ${numToWords(Number(decimalPart))} cents`;
  } else {
    words += isCurrency ? " rupees" : " dollars";
  }

  // Capitalize and finalize the string
  return words.charAt(0).toUpperCase() + words.slice(1) + " only.";

  // return words.charAt(0).toUpperCase() + words.slice(1) + " only.";
};
