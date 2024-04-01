/**
 * Map a type attribute to each datum of a count dataset
 *
 * @param {Array<Object<{entity: string, count: number}>>} datasets An array of count datasets of length n
 * @param {Array<string>} count_types An array of types of length n
 * @returns {Array<Object<{entity: string, count: number}>>} An array of all datum with mapped types from each dataset
 */
export function mapCounts(datasets, count_types) {
  const mappedData = [];

  for (let index = 0; index < datasets.length; index++) {
    datasets[index].forEach((d) => {
      const typed_d = { ...d };
      typed_d.type = count_types[index];
      mappedData.push(typed_d);
    });
  }

  return mappedData;
}

/**
 * Merge each count dataset
 *
 * @param {Array<Object<{entity: string, count: number}>>} datasets An array of count datasets of length n
 * @param {Array<string>} count_types An array of names for each count field of length n
 * @returns {Array<Object<{entity: string, count: number}>>} An array of all datum with mapped types from each dataset
 */
export function mergeCounts(datasets, count_types) {
  const mappedData = new Map();

  for (let index = 0; index < datasets.length; index++) {
    datasets[index].forEach((d) => {
      if (typeof mappedData.get(d.entity) === "undefined") {
        const new_d = { entity: d.entity };
        count_types.forEach((count_type) => {
          new_d[count_type] = 0;
        });
        mappedData.set(d.entity, new_d);
      }
      mappedData.get(d.entity)[count_types[index]] = d.count;
    });
  }

  return mappedData;
}
