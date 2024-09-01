export function decimalToMixedFraction(decimal, identifyPositive = false) {
  const wholeNumber = Math.trunc(decimal); // Use Math.trunc instead of Math.floor
  const fractionalPart = Math.abs(decimal - wholeNumber); // Use absolute value to handle the fractional part correctly

  const fractionSymbols = {
    "0.50": "½",
    "0.25": "¼",
    "0.75": "¾",
    "0.33": "⅓",
    "0.66": "⅔",
    "0.125": "⅛",
    // Add more fractions if needed
  };

  if (fractionalPart === 0) {
    return `${wholeNumber > 0 && identifyPositive ? '+'+wholeNumber : wholeNumber}`;
  }

  const fractionString = fractionalPart.toFixed(2);
  const fractionSymbol = fractionSymbols[`${fractionString}`];
  if (fractionSymbol) {
    return wholeNumber === 0 ? fractionSymbol : `${wholeNumber > 0 && identifyPositive ? '+'+wholeNumber : wholeNumber}${fractionSymbol}`;
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

  return `${wholeNumber > 0 && identifyPositive ? '+'+wholeNumber : wholeNumber} ${simplifiedNumerator}/${simplifiedDenominator}`;
}