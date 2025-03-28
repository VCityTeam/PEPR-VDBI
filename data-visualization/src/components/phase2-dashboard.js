import { map, filter, rollup } from 'npm:d3';
import { anonymizeEntry, pseudoanonymizeEntry } from './utilities.js';
import * as Plot from 'npm:@observablehq/plot';

/**
 * Extract data from the GÉNÉRALITÉ sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Array<Object>} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getGeneralSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[0], {
    range: 'A1:HV41',
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
export function getResearcherSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[1], {
    range: 'A1:AE1087',
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
export function getLabSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[4], {
    range: 'A1:K262',
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
export function getInstitutionSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[5], {
    range: 'A1:A111',
    headers: true,
  });
}

/**
 * Format known project entities from the GÉNÉRALITÉ sheet as:
 *  {
 *    acronyme: string,
 *    auditioned: boolean,
 *    financed: boolean,
 *    budget: string,
 *    grade: string,
 *    challenge: string,
 *    name_fr: string,
 *    name_en: string,
 *    institutions: [],
 *    institution_count: number
 *    labs: [],
 *    lab_count: number
 *    partners: [],
 *    partner_count: number
 *    action: string,
 *    how: string,
 *    why: string,
 *    notes: string
 *  }
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @param {boolean} anonymize - Anonymize data or not
 * @param {Map} acronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveGeneralEntities(
  sheet,
  anonymize = false,
  acronymousDict = new Map()
) {
  return map(sheet, (d) => {
    const mapped_entities = {
      acronyme: d['ACRONYME Projet'] ? d['ACRONYME Projet'] : null,
      present: d['Présent aux journées'] ? [d['Présent aux journées']] : [], // GGE: not needed
      auditioned: d['AUDITIONNÉ'] == 'OUI', // not a list, will this cause a problem with generic map reduce functions looking for lists?
      financed: d['Financé'] == 'OUI', // not a list, will this cause a problem with generic map reduce functions looking for lists?
      budget: d['Budget (demandé) en M€'] ? d['Budget (demandé) en M€'] : null,
      grade: d['Note du jury'] ? d['Note du jury'] : null,
      challenge: d['Défi'] ? d['Défi'] : null,
      name_fr: d['NOM COMPLET FR'] ? d['NOM COMPLET FR'] : null,
      name_en: d['NOM COMPLET ANGLAIS'] ? d['NOM COMPLET ANGLAIS'] : null,
      institutions: filterEmpty([
        d['Établissement porteur'],
        d['Établissement 2'],
        d['Établissement 3'],
        d['Établissement 4'],
        d['Établissement 5'],
        d['Établissement 6'],
        d['Établissement 7'],
        d['Établissement 8'],
        d['Établissement 9'],
        d['Établissement 10'],
        d['Établissement 11'],
        d['Établissement 12'],
        d['Établissement 13'],
        d['Établissement 14'],
        d['Établissement 15'],
      ]),
      labs: filterEmpty([
        d['LABORATOIRE DU PORTEUR'],
        d['LABORATOIRE 2'],
        d['LABORATOIRE 3'],
        d['LABORATOIRE 4'],
        d['LABORATOIRE 5'],
        d['LABORATOIRE 6'],
        d['LABORATOIRE 7'],
        d['LABORATOIRE 8'],
        d['LABORATOIRE 9'],
        d['LABORATOIRE 10'],
        d['LABORATOIRE 11'],
        d['LABORATOIRE 12'],
        d['LABORATOIRE 13'],
        d['LABORATOIRE 14'],
        d['LABORATOIRE 15'],
        d['LABORATOIRE 16'],
        d['LABORATOIRE 17'],
        d['LABORATOIRE 18'],
        d['LABORATOIRE 19'],
        d['LABORATOIRE 20'],
        d['LABORATOIRE 21'],
      ]),
      partners: filterEmpty([
        d['Partenaire 1'],
        d['Partenaire 2'],
        d['Partenaire 3'],
        d['Partenaire 4'],
        d['Partenaire 5'],
        d['Partenaire 6'],
        d['Partenaire 7'],
        d['Partenaire 8'],
        d['Partenaire 9'],
        d['Partenaire 10'],
        d['Partenaire 11'],
        d['Partenaire 12'],
        d['Partenaire 13'],
        d['Partenaire 14'],
        d['Partenaire 15'],
        d['Partenaire 16'],
        d['Partenaire 17'],
        d['Partenaire 18'],
        d['Partenaire 19'],
        d['Partenaire 20'],
      ]),
      action: d['ACTION (de recherche)'] ? d['ACTION (de recherche)'] : null, // empty column?
      how: d['COMMENT'] ? d['COMMENT'] : null, // empty column?
      why: d['POUR QUOI FAIRE'] ? d['POUR QUOI FAIRE'] : null, // empty column?
      notes: d['Notes'] ? d['Notes'] : null, // not empty but almost?
    };
    mapped_entities.institution_count = mapped_entities.institutions.length;
    mapped_entities.lab_count = mapped_entities.labs.length;
    mapped_entities.partner_count = mapped_entities.partners.length;

    if (anonymize) {
      mapped_entities.acronyme = pseudoanonymizeEntry(
        mapped_entities.acronyme,
        acronymousDict,
        'dragon'
      );
      mapped_entities.name_fr = pseudoanonymizeEntry(
        mapped_entities.name_fr,
        acronymousDict,
        'darkelf'
      );
      mapped_entities.name_en = pseudoanonymizeEntry(
        mapped_entities.name_en,
        acronymousDict,
        'drow'
      );
      for (
        let index = 0;
        index < mapped_entities.institutions.length;
        index++
      ) {
        mapped_entities.institutions[index] = pseudoanonymizeEntry(
          mapped_entities.institutions[index],
          acronymousDict,
          'dwarf'
        );
      }
      for (let index = 0; index < mapped_entities.labs.length; index++) {
        mapped_entities.labs[index] = pseudoanonymizeEntry(
          mapped_entities.labs[index],
          acronymousDict,
          'highelf'
        );
      }
      for (let index = 0; index < mapped_entities.partners.length; index++) {
        mapped_entities.partners[index] = pseudoanonymizeEntry(
          mapped_entities.partners[index],
          acronymousDict,
          'goblin'
        );
      }
    }
    return mapped_entities;
  });
}

/**
 * Format known entities from the Liste chercheurs sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @param {boolean} anonymize - Anonymize data or not
 * @param {Map} acronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveResearcherEntities(
  sheet,
  anonymize = false,
  acronymousDict = new Map()
) {
  return map(
    rollup(
      sheet,
      (D) => {
        const researcher = {
          // fullname: D[0]['NOM et Prénom'] ? D[0]['NOM et Prénom'] : null,
          // lastname: D[0]['NOM'] ? D[0]['NOM'] : null,
          // firstname: D[0]['Prénom'] ? D[0]['Prénom'] : null,
          // gender: D[0]['sexe'] ? D[0]['sexe'] : null,
          fullname: anonymizeEntry(),
          lastname: anonymizeEntry(),
          firstname: anonymizeEntry(),
          gender: anonymizeEntry(),
          disciplines: D[0]['discipline chercheur']
            ? D[0]['discipline chercheur'].split(',').map((d) => d.trim())
            : [],
          discipline_erc: D[0]['discipline ERC chercheur']
            ? D[0]['discipline ERC chercheur'].split(';').map((d) => d.trim())
            : [],
          position: D[0]['position statutaire']
            ? D[0]['position statutaire']
            : null,
          cnu: D[0]['CNU'] ? D[0]['CNU'] : null,
          site: D[0]['Sites'] ? D[0]['Sites'] : null,
          // orcid: D[0]['ORCID'] ? D[0]['ORCID'] : null,
          // idhal: D[0]['IDHAL'] ? D[0]['IDHAL'] : null,
          orcid: anonymizeEntry(),
          idhal: anonymizeEntry(),
          lab: D[0]['Identifiant Laboratoire']
            ? D[0]['Identifiant Laboratoire']
            : null,
          domain_erc_lab: D[0]['DOMAINES ERC LABO']
            ? D[0]['DOMAINES ERC LABO']
            : null,
          disciplines_erc_lab: filterEmpty([
            D[0]['Discipline ERC 1 LABO'],
            D[0]['Discipline ERC 2 LABO'],
            D[0]['Discipline ERC 3 LABO'],
            D[0]['Discipline ERC 4 LABO'],
            D[0]['Discipline ERC 5 LABO'],
            D[0]['Discipline ERC 6 LABO'],
            D[0]['Discipline ERC 7 LABO'],
            D[0]['Discipline ERC 8 LABO'],
            D[0]['Discipline ERC 9 LABO'],
          ]),
          domain_hceres: D[0]['Domaines scientifique HCERES 1'],
          disciplines_hceres: filterEmpty([
            D[0]['Sous-domaines scientifique HCERES 1'],
            D[0]['Sous-Domaines scientifique HCERES 2'],
            D[0]['Sous-Domaine Scientifique HCERES 3'],
            D[0]['sous-domaine scientifique HCERES 4'],
            D[0]['sous-domaine scientifique HCERES 5'],
            D[0]['sous-domaine scientifique HCERES 6'],
          ]),
          project: [],
          notes: D[0]['notes'] ? D[0]['notes'] : null,
        };
        D.forEach((row) => {
          // every row in group should corresopond to a project the researcher is in,
          // so add every project
          researcher.project.push(row['ACRONYME Projet']);
        });
        if (anonymize) {
          // researcher.fullname = pseudoanonymizeEntry(
          //   researcher.fullname,
          //   acronymousDict,
          //   'human'
          // );
          // researcher.firstname = pseudoanonymizeEntry(
          //   researcher.firstname,
          //   acronymousDict,
          //   'human'
          // );
          // researcher.lastname = pseudoanonymizeEntry(
          //   researcher.lastname,
          //   acronymousDict,
          //   'human'
          // );
          researcher.lab = pseudoanonymizeEntry(
            researcher.lab,
            acronymousDict,
            'highelf'
          );
          for (let index = 0; index < researcher.project.length; index++) {
            researcher.project[index] = pseudoanonymizeEntry(
              researcher.project[index],
              acronymousDict,
              'dragon'
            );
          }
        }
        return researcher;
      },
      (d) => d['NOM et Prénom'] // group researcher by name
    ),
    (d) => d[1]
  );
}

/**
 * Format known entities from the Liste des labo sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @param {boolean} anonymize - Anonymize data or not
 * @param {Map} acronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveLabEntities(
  sheet,
  anonymize = false,
  acronymousDict = new Map()
) {
  return map(sheet, (d) => {
    const lab = {
      lab: d['Identifiant Laboratoire'] ? d['Identifiant Laboratoire'] : null,
      name: d['Nom Laboratoire'] ? d['Nom Laboratoire'] : null,
      institution: filterEmpty([
        d['C'],
        d['D'],
        d['E'],
        d['F'],
        d['G'],
        d['H'],
        d['I'],
        d['J'],
        d['K'],
      ]),
    };
    if (anonymize) {
      lab.lab = pseudoanonymizeEntry(lab.lab, acronymousDict, 'highelf');
      lab.name = pseudoanonymizeEntry(lab.name, acronymousDict, 'gnome');
      for (let index = 0; index < lab.institution.length; index++) {
        lab.institution[index] = pseudoanonymizeEntry(
          lab.institution[index],
          acronymousDict,
          'dwarf'
        );
      }
    }
    return lab;
  });
}

/**
 * Format known entities from the Liste des établissements sheet
 *
 * @param {Array<Object>} sheet - Extracted sheet data
 * @param {boolean} anonymize - Anonymize data or not
 * @param {Map} acronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Array<Object.<Array<string>>} Formatted sheet data
 */
export function resolveInstitutionEntities(
  sheet,
  anonymize = false,
  acronymousDict = new Map()
) {
  return map(sheet, (d) => {
    const institution = {
      // just 1 column for the moment
      name: d['Nom des établissements'] ? d['Nom des établissements'] : null,
    };
    if (anonymize) {
      institution.name = pseudoanonymizeEntry(
        institution.name,
        acronymousDict,
        'gnome'
      );
    }
    return institution;
  });
}

/**
 * Extract and format data from the phase 2 excel.
 *
 * @param {Workbook} workbook - The workbook to extract
 * @param {boolean} anonymize - Anonymize data or not
 * @param {Map} acronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Object<Array<Object>>} An object containing 3 Plot formatted tables
 */
export function extractPhase2Workbook(
  workbook,
  anonymize = false,
  acronymousDict = new Map()
) {
  const project_data = resolveGeneralEntities(
    getGeneralSheet(workbook),
    anonymize,
    acronymousDict
  );
  const researcher_data = resolveResearcherEntities(
    getResearcherSheet(workbook),
    anonymize,
    acronymousDict
  );
  const laboratory_data = resolveLabEntities(
    getLabSheet(workbook),
    anonymize,
    acronymousDict
  );
  const university_data = resolveInstitutionEntities(
    getInstitutionSheet(workbook),
    anonymize,
    acronymousDict
  );

  // Move laboratory information from researcher_data to laboratory_data
  researcher_data.forEach((researcher) => {
    const lab = laboratory_data.find((lab) => lab.lab == researcher.lab);
    if (typeof lab !== 'undefined') {
      lab.domain_erc = researcher.domain_erc_lab;
      lab.disciplines_erc = [...researcher.disciplines_erc_lab];
      lab.domain_hceres = researcher.domain_hceres;
      lab.disciplines_hceres = [...researcher.disciplines_hceres];
      delete researcher.domain_erc_lab;
      delete researcher.disciplines_erc_lab;
      delete researcher.domain_hceres;
      delete researcher.disciplines_hceres;
    } else {
      console.log('laboratory not found:', researcher.lab);
    }
  });

  return {
    projects: project_data,
    researchers: researcher_data,
    laboratories: laboratory_data,
    universities: university_data,
  };
}

/**
 * Create a filtered dataset, that filters based on 2 input criteria
 *
 * @param {Array} data - dataset to filter
 * @param {Array} input_criteria - all critereon to consider
 * @param {Array<Function>} criteria_functions - functions to use for each critereon.
 *    Keys contain the critereon to meet and the values contain the function to
 *    execute if a critereon is met. Functions should return true or false. If 'All'
 *    is passed in as criterion, the criterion is ignored (and accepted)
 * @returns {Array} filtered dataset
 */
export function filterOnInput(data, input_criteria, criteria_functions) {
  return filter(data, (d) => {
    for (let index = 0; index < input_criteria.length; index++) {
      const critereon = input_criteria[index];
      const critereon_function = criteria_functions[index];
      if (critereon_function(d) != critereon && critereon !== 'All') {
        return false;
      }
    }
    return true;
  });
}

/**
 * Return the possible options of a column
 *
 * @param {Array<Object>} data - the dataset
 * @param {String} key - the column to search in
 * @returns {Array<String>} an Array of the possible options found in the column
 */
export function getColumnOptions(data, key) {
  const options = new Set(['All']);
  data.forEach((d) => options.add(d[key]));
  return options;
}

function filterEmpty(data) {
  return filter(
    // use array substring for (headerless) ranges?
    data,
    (d) => typeof d !== 'undefined' && d !== 0
  );
}

export function getSortable3DCountPlot(
  data,
  x = 'count',
  y = 'type',
  fy = 'entity',
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = 'Plasma',
  x_label = 'Occurrences',
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  fy_tick_format_cuttoff = 25, // cut off label after this many characters
  fy_label = 'Entity',
  sort_criteria = '-x',
  tip = true
) {
  return Plot.plot({
    height: data.length * row_height, // assure adequate horizontal space for each line
    width: width,
    marginLeft: margin_left,
    marginRight: margin_right,
    color: {
      scheme: color_scheme,
    },
    x: {
      grid: true,
      axis: 'top',
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x])) + domain_max],
    },
    fy: {
      tickFormat: (d) =>
        d.length > fy_tick_format_cuttoff ? d.slice(0, 23).concat('...') : d, // cut off long tick labels
      label: fy_label,
    },
    marks: [
      Plot.barX(data, {
        x: x,
        y: y,
        fy: fy,
        fill: x,
        sort: { fy: sort_criteria },
        tip: tip,
      }),
    ],
  });
}

export function getSortable2MarkCountPlot(
  data,
  x1 = 'count',
  // y1 = "type",
  x2 = 'count',
  y2 = 'type',
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = 'Plasma',
  x_label = 'Occurrences',
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  y_tick_format_cuttoff = 25, // cut off label after this many characters
  y_label = 'Entity',
  sort_criteria = '-x',
  tip = true
) {
  return Plot.plot({
    height: data.length * row_height, // assure adequate horizontal space for each line
    width: width,
    marginLeft: margin_left,
    marginRight: margin_right,
    color: {
      scheme: color_scheme,
    },
    x: {
      grid: true,
      axis: 'top',
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x1])) + domain_max],
    },
    y: {
      tickFormat: (d) =>
        d.length > y_tick_format_cuttoff ? d.slice(0, 23).concat('...') : d, // cut off long tick labels
      label: y_label,
    },
    // marks: [
    //   Plot.barX(data, {
    //     x: x1,
    //     y: y1,
    //     fill: x1,
    //     sort: { y1: sort_criteria },
    //     tip: tip,
    //   }),
    // ],
    marks: [
      Plot.barX(data, {
        x: x2,
        y: y2,
        fill: x2,
        sort: { y2: sort_criteria },
        tip: tip,
      }),
    ],
  });
}
