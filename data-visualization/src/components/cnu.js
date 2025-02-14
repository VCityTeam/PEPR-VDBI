// CNU categories mapped to their respective CNU numbers. Useful for determining the
// domains of ordinal color scales and for determining the color (and d3 color
// interpolator) of a CNU number.
export const cnu_category_map = new Map([
  [
    'Sciences',
    [...Array(70).keys()].slice(25, 70).filter((d) => d <= 37 || d >= 60),
  ],
  ['Lettres et sciences humaines', [...Array(25).keys()].slice(7, 25)],
  [
    'Sections de santé',
    [...Array(17).keys()]
      .map((d) => d + 42)
      .concat([80, 81, 82, 83, 85, 86, 87, 90, 91, 92]),
  ],
  ['Droit, économie et gestion', [...Array(7).keys()].slice(1, 7)],
  ['Pluridisciplinaire', [...Array(5).keys()].map((d) => d + 70)],
  ['Théologie', [76, 77]],
]);
