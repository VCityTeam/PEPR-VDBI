import { map, merge, rollup, filter } from 'npm:d3';
import { nameByRace } from 'npm:fantasy-name-generator';

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
      if (typeof mappedData.get(d.entity) === 'undefined') {
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

/**
 * rollup data by groupFunction, map to a [{entity: x, count: y}] data structure
 *
 * @param {Array} data - dataset to rollup
 * @param {Function} mapFunction - function to extract the entity from the dataset.
 *    For example to count the laboratories of a project something like:
 *    (project) => project.laboratoires
 * @returns {Array<Object.<string, number>>} -
 */
export function countEntities(data, mapFunction) {
  // extract the entity from the dataset as an array and merge all entites
  const entity_list = merge(map(data, (d) => mapFunction(d)));
  console.log("entity_list", entity_list);
  // rollup to a count of each unique entity,
  const entity_count = rollup(
    entity_list,
    (D) => D.length,
    (d) => d
  );

  // and map to a [{entity: x, count: y}] data structure
  return map(entity_count, (d) => {
    return {
      entity: d[0],
      count: d[1],
    };
  });
}

/**
 * This is effectively a join on the source and target data using
 * getTargetDatumIdFunction() to find the "primary key"
 * It permits us to add the count information for each entity to the target dataset
 *
 * @param {Array} source_data - first table if you will. It is assumed that this contains project data
 * @param {Array} target_data - table to join onto if you will. Count data will be materialized in this dataset
 * @param {string} source_key - like a foreign key from the source dataset
 * @param {string} target_key - like a primary key from the target dataset
 */
export function addEntityProjectOwnerAndPartnerCounts(
  source_data,
  target_data,
  source_key,
  target_key
) {
  // calculate count data for all entities
  const owner_count = countEntities(source_data, (d) =>
    d[source_key].slice(0, 1)
  );
  const partner_count = countEntities(source_data, (d) =>
    d[source_key].slice(1)
  );

  // console.log("owner_count", owner_count);
  // console.log("test_count", test_count);
  target_data.forEach((target_d) => {
    const target_d_entity = target_d[target_key];

    // add owner counts
    const source_owner_count = owner_count.find(
      (source_d) => target_d_entity === source_d.entity
    );
    target_d.project_owner_count =
      typeof source_owner_count === 'undefined' ? 0 : source_owner_count.count;

    // add partner counts
    const source_partner_count = partner_count.find(
      (source_d) => target_d_entity === source_d.entity
    );
    target_d.project_partner_count =
      typeof source_partner_count === 'undefined'
        ? 0
        : source_partner_count.count;

    // add total  counts
    target_d.project_total_count =
      target_d.project_owner_count + target_d.project_partner_count;
  });
}

export function joinOnKey(source_data, target_data, foreign_key, primary_key) {
  source_data[foreign_key] = target_data.find(
    (d) => d[primary_key] === foreign_key
  );
  // TODO add join from target to source
}

export function joinOnKeys(
  source_data,
  source_foreign_keys,
  target_data,
  target_primary_key,
  target_foreign_key
) {
  source_data.forEach((source_d) => {
    for (let index = 0; index < source_d[source_foreign_keys].length; index++) {
      const foreign_key = source_d[source_foreign_keys][index];
      source_d[source_foreign_keys][index] = target_data.find(
        (target_d) => target_d[target_primary_key] === foreign_key
      );
    }
  });

  target_data.forEach((target_d) => {
    target_d[target_foreign_key] = filter(source_data, (source_d) =>
      source_d[source_foreign_keys].includes(target_d)
    );
  });
}

export function joinOnOwnerPartnerKeys(
  source_data,
  source_foreign_keys,
  target_data,
  target_foreign_key,
  target_primary_key,
  target_foreign_key_filter = null
) {
  source_data.forEach((source_d) => {
    for (let index = 0; index < source_d[source_foreign_keys].length; index++) {
      const foreign_key = source_d[source_foreign_keys][index];
      const foreign_entity = target_data.find(
        (target_d) => target_d[target_primary_key] === foreign_key
      );
      source_d[source_foreign_keys][index] = foreign_entity
        ? foreign_entity
        : source_d[source_foreign_keys][index];
    }
  });

  for (let index = 0; index < target_data.length; index++) {
    if (target_foreign_key_filter) {
      target_foreign_key_filter(target_data[index]);
    } else {
      target_data[index]['owner_' + target_foreign_key] = filter(
        source_data,
        (source_d) => source_d[source_foreign_keys][0] === target_data[index]
      );

      target_data[index]['partner_' + target_foreign_key] = filter(
        source_data,
        (source_d) =>
          source_d[source_foreign_keys].slice(1).includes(target_data[index])
      );
    }
  }
}

/**
 * Anonymize a text entry based on existing dictionary values
 *
 * @param {string} entry - a text entry
 * @param {Map} dictionary - a mapping of entries to anonymized entries
 * @param {string} type - the type of name to generate; based on high fantasy races
 * @returns {string} anonymized entry
 */
export function anonymizeEntry(entry, dictionary, type = 'human') {
  if (!dictionary.has(entry)) {
    dictionary.set(
      entry,
      nameByRace(type, {
        gender: Boolean(Math.floor(Math.random() * 2)) ? 'male' : 'female',
        allowMultipleNames: Boolean(Math.floor(Math.random() * 2))
          ? true
          : false,
      })
    );
  }
  return dictionary.get(entry);
}
