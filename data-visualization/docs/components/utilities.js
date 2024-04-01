import { map } from "npm:d3";

/**
 * Map a type attribute to each datum of a dataset
 *
 * @param {Array<Object<{entity: string, count: number}>>} datasets An array of count datasets of length n
 * @param {Array<string>} types An array of types of length n
 * @returns {Array<Object<{entity: string, count: number}>>} An array of all datum with mapped types from each dataset
 */
export function mapCounts(datasets, types) {
  // copy data1 and add type to each datum
  const mappedData = [];

  for (let index = 0; index < datasets.length; index++) {
    const dataset = datasets[index]
    dataset.forEach((d) => {
      d.type = types[index];
      mappedData.push(d);
    });
  }
  
  return mappedData;
}
