import { map, filter, group, rollup } from "npm:d3";

/**
 * Extract data from the GÉNÉRALITÉ sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Array<Object>} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getGeneraliteSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[6], {
    range: "A1:HV41",
    headers: true,
  });
}

/**
 * Extract data from the Liste chercheurs sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Array<Object>} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getChercheurSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[7], {
    range: "A1:AA1092",
    headers: true,
  });
}

/**
 * Extract data from the liste des labo sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Array<Object>} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getLaboSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[8], {
    range: "A1:M266",
    headers: true,
  });
}

/**
 * Extract data from the liste des établissements sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Array<Object>} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getEtablissementSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[9], {
    range: "A1:A111",
    headers: true,
  });
}

/**
 * Format known entities from the GÉNÉRALITÉ sheet as:
 *  {
 *    acronyme: string,
 *    auditionne: boolean,
 *    finance: boolean,
 *    budget: string,
 *    note: string,
 *    defi: string,
 *    nom_fr: string,
 *    nom_en: string,
 *    etablissements: [],
 *    etablissements_count: number
 *    laboratoires: [],
 *    laboratoires_count: number
 *    partenaires: [],
 *    partenaires_count: number
 *    action: string,
 *    comment: string,
 *    pourquoi: string,
 *    notes: string
 *  }
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveGeneraliteEntities(sheet) {
  return map(sheet, (d) => {
    const mapped_entities = {
      acronyme: d["ACRONYME"] ? d["ACRONYME"] : null,
      // present: d['Présent aux journées'] ? [d['Présent aux journées']] : [], // GGE: not needed
      auditionne: d["AUDITIONNÉ"] == "OUI", // not a list, will this cause a problem with generic map reduce functions looking for lists?
      finance: d["Financé"] == "OUI", // not a list, will this cause a problem with generic map reduce functions looking for lists?
      budget: d["Budget (demandé) en M€"] ? d["Budget (demandé) en M€"] : null,
      note: d["Note du jury"] ? d["Note du jury"] : null,
      defi: d["Défi"] ? d["Défi"] : null,
      nom_fr: d["NOM COMPLET FR"] ? d["NOM COMPLET FR"] : null,
      nom_en: d["NOM COMPLET ANGLAIS"] ? d["NOM COMPLET ANGLAIS"] : null,
      etablissements: filter(
        [
          d["Établissement porteur"],
          d["Établissement 2"],
          d["Établissement 3"],
          d["Établissement 4"],
          d["Établissement 5"],
          d["Établissement 6"],
          d["Établissement 7"],
          d["Établissement 8"],
          d["Établissement 9"],
          d["Établissement 10"],
          d["Établissement 11"],
          d["Établissement 12"],
          d["Établissement 13"],
          d["Établissement 14"],
          d["Établissement 15"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      laboratoires: filter(
        [
          d["LABORATOIRE DU PORTEUR"],
          d["LABORATOIRE 2"],
          d["LABORATOIRE 3"],
          d["LABORATOIRE 4"],
          d["LABORATOIRE 5"],
          d["LABORATOIRE 6"],
          d["LABORATOIRE 7"],
          d["LABORATOIRE 8"],
          d["LABORATOIRE 9"],
          d["LABORATOIRE 10"],
          d["LABORATOIRE 11"],
          d["LABORATOIRE 12"],
          d["LABORATOIRE 13"],
          d["LABORATOIRE 14"],
          d["LABORATOIRE 15"],
          d["LABORATOIRE 16"],
          d["LABORATOIRE 17"],
          d["LABORATOIRE 18"],
          d["LABORATOIRE 19"],
          d["LABORATOIRE 20"],
          d["LABORATOIRE 21"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      partenaires: filter(
        [
          d["Partenaire 1"],
          d["Partenaire 2"],
          d["Partenaire 3"],
          d["Partenaire 4"],
          d["Partenaire 5"],
          d["Partenaire 6"],
          d["Partenaire 7"],
          d["Partenaire 8"],
          d["Partenaire 9"],
          d["Partenaire 10"],
          d["Partenaire 11"],
          d["Partenaire 12"],
          d["Partenaire 13"],
          d["Partenaire 14"],
          d["Partenaire 15"],
          d["Partenaire 16"],
          d["Partenaire 17"],
          d["Partenaire 18"],
          d["Partenaire 19"],
          d["Partenaire 20"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      action: d["ACTION (de recherche)"] ? d["ACTION (de recherche)"] : null, // empty column?
      comment: d["COMMENT"] ? d["COMMENT"] : null, // empty column?
      pourquoi: d["POUR QUOI FAIRE"] ? d["POUR QUOI FAIRE"] : null, // empty column?
      notes: d["Notes"] ? d["Notes"] : null, // not empty but almost?
    };
    mapped_entities.etablissements_count =
      mapped_entities.etablissements.length;
    mapped_entities.laboratoires_count = mapped_entities.laboratoires.length;
    mapped_entities.partenaires_count = mapped_entities.partenaires.length;
    return mapped_entities;
  });
}

/**
 * Format known entities from the Liste chercheurs sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveChercheursEntities(sheet) {
  return map(
    rollup(
      sheet,
      (D) => {
        const chercheur = {
          nom: [D[0]["NOM et Prénom"]],
          projet: [],
          laboratoire: [D[0]["labo (acronyme)"]],
        };
        D.forEach((row) => {
          chercheur.projet.push(row["Projet 1"]); // every row in group should corresopond to a project the researcher is in, so add every project
        });
        return chercheur;
      },
      (d) => d["NOM et Prénom"] // group researcher by name
    ),
    (d) => d[1]
  );
}

/**
 * Format known entities from the Liste des labo sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveLaboratoireEntities(sheet) {
  return map(sheet, (d) => {
    return {
      laboratoire: d["Identifiant Laboratoire"]
        ? d["Identifiant Laboratoire"]
        : null,
      nom: d["Nom Laboratoire"] ? d["Nom Laboratoire"] : null,
      etablissements: filter(
        [
          d["Etablissement1"],
          d["Etablissement2"],
          d["Etablissement3"],
          d["Etablissement4"],
          d["Etablissement5"],
          d["Etablissement6"],
          d["Etablissement7"],
          d["Etablissement8"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
    };
  });
}

/**
 * Format known entities from the Liste des établissements sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveEtablissementEntities(sheet) {
  return map(sheet, (d) => {
    return {
      nom: d["Nom des établissements"] ? d["Nom des établissements"] : null, // just 1 column for the moment
    };
  });
}

/**
 * Create a filtered dataset, that filters based on 2 input criteria
 *
 * @param {Array} data - dataset to filter
 * @param {Array} input_criteria - all critereon to consider
 * @param {Array<Object>} criteria_functions - Objects containing functions to use for each
 * critereon. Keys contain the critereon to meet and the values contain the function to
 * execute if a critereon is met. Functions should return true or false
 * @returns {Array}
 */
export function filterOnInput(data, input_criteria, criteria_functions) {
  return filter(data, (d) => {
    for (let index = 0; index < input_criteria.length; index++) {
      const critereon = input_criteria[index].toString();
      const critereon_functions = criteria_functions[index];
      if(!critereon_functions[critereon](d)) {
        return false;
      }
    }
    return true;
  });
}
