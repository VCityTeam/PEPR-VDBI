import { map } from "npm:d3-array";

export function countPhase1(sheet) {
  return map(sheet, (d) => {
    let count;
    switch (typeof d) {
      case "string":
        count = 1;
        break;
      case "Array":
        count = length(d);
      default:
        count = 0;
        break;
    }
    return count;
  });
}
