export function decimalToMixedFraction(decimal) {
  const wholeNumber = Math.floor(decimal);
  const fractionalPart = decimal - wholeNumber;

  const fractionSymbols = {
    "0.50": "½",
    "0.25": "¼",
    "0.75": "¾",
    "0.33": "⅓",
    "0.66": "⅔",
    "0.125": "⅛",
    "0.75": "¾"
    // Add more fractions if needed
  };

  if (fractionalPart === 0) {
    return `${wholeNumber}`;
  }

  const fractionString = fractionalPart.toFixed(2);
  const fractionSymbol = fractionSymbols[`${fractionString}`];
  if (fractionSymbol) {
    return wholeNumber === 0 ? fractionSymbol : `${wholeNumber}${fractionSymbol}`;
  }

  // If no predefined fraction symbol is found, return decimal with fraction part
  const numerator = Math.round(fractionalPart * 1000);
  const denominator = 1000;
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  const simplifiedNumerator = numerator / divisor;
  const simplifiedDenominator = denominator / divisor;

  if (wholeNumber === 0) {
    return `${simplifiedNumerator}/${simplifiedDenominator}`;
  }

  return `${wholeNumber} ${simplifiedNumerator}/${simplifiedDenominator}`;
}
