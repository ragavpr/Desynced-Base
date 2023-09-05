export const roundDecimal = (num: number, decimal_places: number) => +(
  Math.round(parseFloat(num + `e+${decimal_places}`))
    + `e-${decimal_places}`
);