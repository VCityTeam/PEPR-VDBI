import { map, merge, rollups, filter, selectAll, create } from "d3";
import { button } from "@observablehq/inputs";
import { nameByRace } from "fantasy-name-generator";
import { html } from "htl";

// TODO: mapCounts and mergeCounts need to be reworked with new countEntities

/**
 * Map a type attribute to each datum of a count dataset
 *
 * @param {Object[]} datasets - An array of count datasets of length n
 * @param {Object[]} datasets[].entity - a datum value
 * @param {Object[]} datasets[].count - the count of the datum's value in a dataset
 * @param {string[]} count_types An array of types of length n
 * @returns {Object[]} - An array of all datum with mapped types from each dataset
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
 * @param {Object[]} datasets - An array of count datasets of length n
 * @param {Object[]} datasets[].entity - a datum value
 * @param {Object[]} datasets[].count - the count of the datum's value in a dataset
 * @param {string[]} count_types An array of types of length n
 * @returns {Object[]} - An array of all datum with mapped types from each dataset
 */
export function mergeCounts(datasets, count_types) {
  // TODO: this can be optimized and simplified with a map, reduce, Array.concat
  const mappedData = new Map();

  for (let index = 0; index < datasets.length; index++) {
    datasets[index].forEach((d) => {
      if (typeof mappedData.get(d[0]) === "undefined") {
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
 * @param {object[]} data - dataset to rollup
 * @param {Function} mapFunction - function to extract the entity to be counted from
 *    the dataset.
 *    For example to count the laboratories of a project something like:
 *    (project) => project.laboratoires
 * @returns {array[]} - [[datum 1, count 1], [datum 2, count 2], ...]
 */
export function countEntities(data, mapFunction) {
  // extract the entity from the dataset as an array and merge all entites
  // rollup to a count of each unique entity,
  return rollups(
    merge(map(data, (d) => mapFunction(d))),
    (D) => D.length,
    (d) => d,
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
  target_key,
) {
  // calculate count data for all entities
  const owner_count = countEntities(source_data, (d) =>
    d[source_key].slice(0, 1),
  );
  const partner_count = countEntities(source_data, (d) =>
    d[source_key].slice(1),
  );

  // console.log("owner_count", owner_count);
  // console.log("test_count", test_count);
  target_data.forEach((target_d) => {
    const target_d_entity = target_d[target_key];

    // add owner counts
    const source_owner_count = owner_count.find(
      (source_d) => target_d_entity === source_d[0],
    );
    target_d.project_owner_count =
      typeof source_owner_count === "undefined" ? 0 : source_owner_count[1];

    // add partner counts
    const source_partner_count = partner_count.find(
      (source_d) => target_d_entity === source_d[0],
    );
    target_d.project_partner_count =
      typeof source_partner_count === "undefined" ? 0 : source_partner_count[1];

    // add total  counts
    target_d.project_total_count =
      target_d.project_owner_count + target_d.project_partner_count;
  });
}

export function joinOnKey(source_data, target_data, foreign_key, primary_key) {
  source_data[foreign_key] = target_data.find(
    (d) => d[primary_key] === foreign_key,
  );
  // TODO add join from target to source
}

export function joinOnKeys(
  source_data,
  source_foreign_keys,
  target_data,
  target_primary_key,
  target_foreign_key,
) {
  source_data.forEach((source_d) => {
    for (let index = 0; index < source_d[source_foreign_keys].length; index++) {
      const foreign_key = source_d[source_foreign_keys][index];
      source_d[source_foreign_keys][index] = target_data.find(
        (target_d) => target_d[target_primary_key] === foreign_key,
      );
    }
  });

  target_data.forEach((target_d) => {
    target_d[target_foreign_key] = filter(source_data, (source_d) =>
      source_d[source_foreign_keys].includes(target_d),
    );
  });
}

export function joinOnOwnerPartnerKeys(
  source_data,
  source_foreign_keys,
  target_data,
  target_foreign_key,
  target_primary_key,
  target_foreign_key_filter = null,
) {
  source_data.forEach((source_d) => {
    for (let index = 0; index < source_d[source_foreign_keys].length; index++) {
      const foreign_key = source_d[source_foreign_keys][index];
      const foreign_entity = target_data.find(
        (target_d) => target_d[target_primary_key] === foreign_key,
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
      target_data[index]["owner_" + target_foreign_key] = filter(
        source_data,
        (source_d) => source_d[source_foreign_keys][0] === target_data[index],
      );

      target_data[index]["partner_" + target_foreign_key] = filter(
        source_data,
        (source_d) =>
          source_d[source_foreign_keys].slice(1).includes(target_data[index]),
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
export function pseudoanonymizeEntry(entry, dictionary, type = "human") {
  if (!dictionary.has(entry)) {
    dictionary.set(
      entry,
      nameByRace(type, {
        gender: Math.floor(Math.random() * 2) ? "male" : "female",
        allowMultipleNames: Math.floor(Math.random() * 2) ? true : false,
      }),
    );
  }
  return dictionary.get(entry);
}

export function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  tooltip.classList.add("card");
  tooltip.style.position = "absolute";
  return tooltip;
}

export function cropText(text, maxLength = 20) {
  if (!text) return "";

  return text.length > maxLength
    ? text.slice(0, maxLength - 3).concat("...")
    : text;
}

export function wrapText(text, maxWidth = 20, newlineCharter = "\n") {
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  for (let word of words) {
    if (currentLine.length + word.length > maxWidth - 1) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }

  return lines.join(newlineCharter);
}

export function wrapTextWithTspans(text, maxWidth = 20) {
  const words = text.split(" ");

  if (words.length === 1) {
    return html`<tspan>${cropText(text, maxWidth)}</tspan>`;
  }

  let lines = "";
  let currentLine = "";

  for (let word of words) {
    if (currentLine.length + word.length > maxWidth - 1) {
      lines += `<tspan>${currentLine.trim()}</tspan>`;
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  lines += `<tspan>${currentLine.trim()}</tspan>`;

  return html`<text>${lines}</text>`;
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
    "non renseignée",
    "Non connue",
    "non connue",
    "non connues",
    "Non Renseigné",
  ].includes(d);

export function sparkbar(
  max,
  {
    background = "var(--theme-foreground-focus)",
    // background = "var(--theme-foreground-focus-alt)",
    color = "black",
    float = "right",
    format = (x) => x.toLocaleString("en-US"),
  } = {},
) {
  // code source: https://observablehq.com/framework/inputs/table
  return (x) =>
    html`<div
      style="
        background: ${background};
        color: ${color};
        width: ${(100 * x) / max}%;
        float: ${float};
        padding-right: 3px;
        box-sizing: border-box;
        overflow: visible;
        display: flex;
        justify-content: ${float === "right" ? "end" : "start"};"
    >
      ${format(x)}
    </div>`;
}

export function filterEmptyArray(data) {
  return filter(
    // use array substring for (headerless) ranges?
    data,
    (d) => typeof d !== "undefined" && d !== 0,
  );
}

/**
 * Format a field value by trimming strings and setting empty values to null
 *
 * @param {any} d - input datum
 * @returns {any} - formatted datum
 */
export function formatIfString(d) {
  if (typeof d === "string") {
    return d.trim() ? d.trim() : null;
  } else if (typeof d === "undefined") {
    return null;
  }
  return d;
}

/**
 * Converts a string to lowercase, except for uppercase acronyms.
 * Preserves the case of words that contain no lowercase letters.
 * Initially generated by `Gemini 3 Pro (low)`
 *
 * @param {string} str - The input string
 * @returns {string} The processed string
 */
export function toLowerPreservingAcronyms(str) {
  if (!str) return str;
  // Match chunks of words/numbers (including accents) to process them individually
  // This allows handling hyphenated words like "Micro-USB" correctly
  return str.replace(/[\w\u00C0-\u00FF]+/g, (word) => {
    // If the word contains ANY lowercase letter, convert it to lowercase
    // Otherwise (all caps, numbers, or symbols), keep it as is
    return /[a-z]/.test(word) ? word.toLowerCase() : word;
  });
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
  const segs = path.split(".");
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
 * A button for copying a table to the clipboard as a csv.
 *
 * @param {object[]} data - the data to be copied, rows should contain keys
 *  corresponding to the columns of the table
 * @param {object} options - button options
 * @param {Array|null} options.columns - a list of columns to be copied, if null all columns
 *  will be copied
 * @param {String} options.label - button label
 * @param {String} options.delimeter -
 * @returns {button} - a button element that copies the data to the clipboard
 */
export function copyTableToClipboardButton(
  data,
  { columns = null, label = "Copy to clipboard", delimeter = "," } = {},
) {
  if (columns === null) columns = Object.keys(data[0]);

  return button(label, {
    value: null,
    reduce: () =>
      navigator.clipboard.writeText(
        data.reduce(
          (a, v) =>
            a + columns.map((col) => v[col] || "").join(delimeter) + "\n",
          columns.join(delimeter) + "\n",
        ),
      ),
  });
}

/**
 * A button for copying an SVG element to the clipboard.
 *
 * @param {Element} element - the element to be copied. Ignored if callback is set
 * @param {String} label - button label
 * @param {Function} callback - an optional callback function to dynamically return the SVG
 * @returns {button} - a button element that copies the element html to the clipboard
 */
export function copySVGToClipboardButton(
  element,
  label = "Copy to clipboard",
  callback = undefined,
) {
  if (!element && !callback) {
    console.warn("copySVGToClipboardButton: element and callback are empty");
    return button(label, { value: null, reduce: () => {} });
  }

  // add the xmlns attribute to the element if it is not present
  if (element && !element.attributes.getNamedItem("xmlns")) {
    element.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  return button(label, {
    value: null,
    reduce: () =>
      navigator.clipboard.writeText(callback ? callback() : element.outerHTML),
  });
}

/**
 * A button for downloading a table.
 * Semicolon delimited by default for EU Excel/List separator compatibility :
 * https://superuser.com/questions/606272/how-to-get-excel-to-interpret-the-comma-as-a-default-delimiter-in-csv-files
 *
 * @param {Function} callback - a callback function to get the data to be downloaded,
 *   rows should contain keys corresponding to the columns of the table
 * @param {String} label - button label
 * @param {String} filename - downloaded file name
 * @returns {button} - a button element that copies the element html to the clipboard
 */
export function downloadTableButton(
  callback,
  {
    label = "Download (.csv)",
    filename = "download.csv",
    columns = null,
    delimeter = ";",
  } = {},
) {
  return button(label, {
    value: null,
    reduce: () => {
      console.debug("downloading data with callback: ", callback());
      const data = callback();

      if (columns === null) columns = Object.keys(data[0]);
      writeToFile(
        data.reduce(
          (a, v) =>
            a +
            columns
              .map((col) => String(v[col]).replace(/(\r\n|\r|\n)/g, " ") || "")
              .join(delimeter) +
            "\n",
          columns.join(delimeter) + "\n",
        ),
        filename,
        "text/csv",
      );
    },
  });
}

/**
 * A button for downloading a table as a csv.
 *
 * @param {Function} callback - a callback function to get the data to be downloaded,
 *   rows should contain keys corresponding to the columns of the table
 * @param {String} label - button label
 * @param {String} filename - downloaded file name
 * @returns {button} - a button element that copies the element html to the clipboard
 */
export function downloadJSONButton(
  callback,
  { label = "Download", filename = "download.json" } = {},
) {
  return button(label, {
    value: null,
    reduce: () => {
      const data = callback();
      console.debug("downloading data: ", data);
      writeToFile(JSON.stringify(data, null, 2), filename, "application/json");
    },
  });
}

/**
 * A button for downloading one or many an SVG elements with a d3 selector.
        ),
        filename,
        "text/csv"
      )
    },
  })
}

/**
 * A button for downloading one or many an SVG elements with a d3 selector.
 *
 * @param {String} selector - a d3 selector string for returning the svg elements to be downloaded.
 * @param {String} label - button label
 * @param {String} filename - downloaded file name
 * @returns {button} - a button element that copies the element html to the clipboard
 */
export function downloadSVGButton(
  selector,
  label = "Download (.svg)",
  filename = "download.svg",
) {
  return button(label, {
    value: null,
    reduce: () => {
      console.debug("downloading content with selector: ", selector);
      let width = 0;
      let height = 0;
      const content = create("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

      selectAll(selector)
        .nodes()
        .forEach((d) => {
          content.html(content.html() + d.outerHTML);

          width = Math.max(
            width,
            Math.floor(d.attributes["width"] ? d.attributes["width"].value : 0),
          );
          height += Math.floor(
            d.attributes["height"] ? d.attributes["height"].value : 0,
          );
        });

      content
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `-5 0 ${width + 5} ${height}`);

      // serialize the svg content
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(content.node());

      //add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      writeToFile(source, filename, "image/svg+xml");
    },
  });
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
 * @param {FormData|string} [options.body] The request body
 * @param {string} [options.responseType] The expected
 * response type.
 * @param {Object<string>} [options.urlParameters] A dictionary of
 * URL parameters.
 * @returns {Promise<XMLHttpRequest>} Request promise
 */
export function request(method, url, options = {}) {
  const args = options || {};
  const body = args.body || "";
  const responseType = args.responseType || null;
  const urlParameters = args.urlParameters || null;
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    if (urlParameters) {
      url += "?";
      for (const [paramKey, paramValue] of Object.entries(urlParameters)) {
        url += `${encodeURIComponent(paramKey)}=${encodeURIComponent(
          paramValue,
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

/**
 * Generate a button to write a blob to a file
 * adapted from https://flexiple.com/javascript/javascript-write-to-file-detailed.
 *
 * Used Github Copilot to improve BOM handling for UTF-8 text files.
 *
 * @param {any} content - content to write
 * @param {String} content_type - file content mime type
 *
 * @returns {button}
 */
export function writeToFile(
  content,
  filename = "download.txt",
  content_type = "text/plain;charset=utf-8",
) {
  // Ensure the content type declares UTF-8 for text-like MIME types
  if (
    content_type &&
    (content_type.startsWith("text/") || content_type === "application/json") &&
    !/charset=/i.test(content_type)
  ) {
    content_type = `${content_type};charset=utf-8`;
  }

  // Ensure we write text; for text/CSV and JSON include a BOM so Excel/Windows
  // will correctly detect UTF-8 encoding when opening the file.
  const text = typeof content === "string" ? content : String(content);
  const needsBom =
    content_type.startsWith("text/") || content_type === "application/json";
  const bom = needsBom ? "\uFEFF" : "";

  // Use Blob (more conventional for binary/text downloads) instead of File
  const blob = new Blob([bom + text], { type: content_type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
