import { map, merge, rollups, filter } from 'npm:d3';
import { nameByRace } from 'npm:fantasy-name-generator';
import * as htl from 'npm:htl';

// TODO: mapCounts and mergeCounts need to be reworked with new countEntities

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
 * Merge each count dataset from countEntities()
 *
 * @param {Array<Object<{entity: string, count: number}>>} datasets An array of count datasets of length n
 * @param {Array<string>} count_types An array of names for each count field of length n
 * @returns {Array<Object<{entity: string, count: number}>>} An array of all datum with mapped types from each dataset
 */
export function mergeCounts(datasets, count_types) {
  // TODO: this can be optimized and simplified with a map, reduce, Array.concat
  const mappedData = new Map();

  for (let index = 0; index < datasets.length; index++) {
    datasets[index].forEach((d) => {
      if (typeof mappedData.get(d[0]) === 'undefined') {
        const new_d = { entity: d[0] };
        count_types.forEach((count_type) => {
          new_d[count_type] = 0;
        });
        mappedData.set(d[0], new_d);
      }
      mappedData.get(d[0])[count_types[index]] = d[1];
    });
  }

  return mappedData;
}

/**
 * map data using an an accessor function, merge the data, then rollups data to count
 * occurrences of each entity. This is useful for counting the ocurrences of property
 * values in Arrays
 *
 * @param {Array} data - dataset to rollup
 * @param {Function} mapFunction - function to extract the entity to be counted from
 *    the dataset.
 *    For example to count the laboratories of a project something like:
 *    (project) => project.laboratoires
 * @returns {Array<Array>} - [[datum 1, count 1], [datum 2, count 2], ...]
 */
export function countEntities(data, mapFunction) {
  // extract the entity from the dataset as an array and merge all entites
  // rollup to a count of each unique entity,
  return rollups(
    merge(map(data, (d) => mapFunction(d))),
    (D) => D.length,
    (d) => d
  );
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
      (source_d) => target_d_entity === source_d[0]
    );
    target_d.project_owner_count =
      typeof source_owner_count === 'undefined' ? 0 : source_owner_count[1];

    // add partner counts
    const source_partner_count = partner_count.find(
      (source_d) => target_d_entity === source_d[0]
    );
    target_d.project_partner_count =
      typeof source_partner_count === 'undefined' ? 0 : source_partner_count[1];

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
 * Anonymize a text entry
 *
 * @returns {string} anonymized entry
 */
export function anonymizeEntry() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * (Pseudo)Anonymize a text entry based on existing dictionary values
 *
 * @param {string} entry - a text entry
 * @param {Map} dictionary - a mapping of entries to anonymized entries
 * @param {string} type - the type of name to generate; based on high fantasy races
 * @returns {string} anonymized entry
 */
export function pseudoanonymizeEntry(entry, dictionary, type = 'human') {
  if (!dictionary.has(entry)) {
    dictionary.set(
      entry,
      nameByRace(type, {
        gender: Math.floor(Math.random() * 2) ? 'male' : 'female',
        allowMultipleNames: Math.floor(Math.random() * 2) ? true : false,
      })
    );
  }
  return dictionary.get(entry);
}

export function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.classList.add('card');
  tooltip.style.position = 'absolute';
  return tooltip;
}

export function cropText(text, maxLength = 20) {
  return text.length > maxLength
    ? text.slice(0, maxLength - 3).concat('...')
    : text;
}

/**
 * function for filtering out *known* unknown values
 *
 * @param {any} d - value to check
 * @returns {Boolean} - true if the value is an known value;
 *   false if the value is an unknown value
 */
export const exclude = (d) =>
  ![
    null,
    'non renseignée',
    'Non connue',
    'non connue',
    'non connues',
    'Non Renseigné',
  ].includes(d);

export function sparkbar(
  max,
  background = 'var(--theme-green)',
  color = 'black'
) {
  // code source: https://observablehq.com/framework/inputs/table
  return (x) => htl.html`<div style="
    background: ${background};
    color: ${color};
    width: ${(100 * x) / max}%;
    float: left;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: start;">${x.toLocaleString('en-US')}`;
}

export function filterEmptyArray(data) {
  return filter(
    // use array substring for (headerless) ranges?
    data,
    (d) => typeof d !== 'undefined' && d !== 0
  );
}

/**
 * Format a field value by trimming strings and setting empty values to null
 *
 * @param {any} d - input datum
 * @returns {any} - formatted datum
 */
export function formatIfString(d) {
  if (typeof d === 'string') {
    return d.trim() ? d.trim() : null;
  } else if (typeof d === 'undefined') {
    return null;
  }
  return d;
}

export function downloadDataAsCSV(data) {
  const newline = '\u000D\u000A';
  const export_buffer = [data[0].columns.toString() + newline];
  data.forEach((recipe) => {
    recipe.values.forEach((row) => {
      const row_buffer = row
        .map((col) => {
          if (typeof col == 'string' && col.includes(',')) {
            return `"${col}"`;
          }
          return col;
        })
        .toString();
      export_buffer.push(row_buffer + newline);
    });
  });
  console.debug(export_buffer);

  const link = document.createElement('a');
  const file = new Blob(export_buffer, {
    type: 'text/plain',
  });
  link.href = URL.createObjectURL(file);
  link.download = 'favorites.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * From https://www.npmjs.com/package/@ud-viz/utils_browser
 * Gets an attribute of an object from the given path. To get nested attributes,
 * the path qualifiers must be separated by dots ('.'). If the path is not
 * nested (does not contain any dot), the function is equivalent to `obj[path]`.
 *
 * @param {object} obj - object to get attribute
 * @param {string} path - path to get the attribute
 * @returns {*} - attribute vaue
 * @example
 * const obj = {test: {msg: "Hello world !"}};
 * console.log(getAttributeByPath(obj, "test.msg")); // prints "Hello world !";
 * console.log(getAttributeByPath(obj, "other")); // undefined
 */
export function getAttributeByPath(obj, path) {
  const segs = path.split('.');
  let val = obj;
  for (const seg of segs) {
    val = val[seg];
    if (val === undefined) {
      break;
    }
  }
  return val;
}

/**
 * Performs an HTTP request.
 * Adapted from 
 *
 * @async
 * @param {string} method The HTTP method. Accepted methods include `GET`,
 * `DELETE`, `POST` and `PUT`.
 * @param {string} url The requested URL.
 * @param {object} [options] A dictionary of optional parameters. These
 * options include the following :
 * @param {FormData | string} [options.body] The request body
 * @param {string} [options.responseType] The expected
 * response type.
 * @param {Object<string, string>} [options.urlParameters] A dictionary of
 * URL parameters.
 * @returns {Promise<XMLHttpRequest>} Request promise
 */
export function request(method, url, options = {}) {
  const args = options || {};
  const body = args.body || '';
  const responseType = args.responseType || null;
  const urlParameters = args.urlParameters || null;
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    if (urlParameters) {
      url += '?';
      for (const [paramKey, paramValue] of Object.entries(urlParameters)) {
        url += `${encodeURIComponent(paramKey)}=${encodeURIComponent(
          paramValue
        )}&`;
      }
    }
    req.open(method, url, true);

    if (responseType) {
      req.responseType = responseType;
    }

    req.send(body);

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        resolve(req);
      } else {
        reject(req.responseText);
      }
    };
  });
}
