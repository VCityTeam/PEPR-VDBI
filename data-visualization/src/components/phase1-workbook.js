import { map, filter, rollup, merge } from "d3"
import {
  anonymizeEntry,
  pseudoanonymizeEntry,
  filterEmptyArray,
} from "./utilities.js"
import * as Plot from "@observablehq/plot"

/**
 * Extract data from the GÉNÉRALITÉ sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getGeneralSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[0], {
    // range: 'A1:BQ9',
    range: "A1:HV41",
    headers: true,
  })
}

/**
 * Extract data from the Liste chercheurs sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getResearcherSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[1], {
    // range: 'A1:AA298',
    range: "A1:AE1087",
    headers: true,
  })
}

/**
 * Extract data from the liste des labo sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getLabSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[4], {
    range: "A1:K262",
    headers: true,
  })
}

/**
 * Extract data from the liste des établissements sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getInstitutionSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[5], {
    range: "A1:A111",
    headers: true,
  })
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
 *    labs: [],
 *    partners: [],
 *    action: string,
 *    how: string,
 *    why: string,
 *    notes: string
 *  }
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @param {boolean} pseudoanonymize - Pseudoanonymize data or not
 * @param {Map} pseudoacronymousDict - A preset dictionary of pseudoanomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveGeneralEntities(
  sheet,
  anonymize = false,
  pseudoanonymousDict = new Map()
) {
  return map(sheet, (d) => {
    const mapped_entities = {
      acronyme: d["ACRONYME Projet"]
        ? cleanUpProjectLabel(d["ACRONYME Projet"])
        : null,
      present: String(d["Présent aux journées"]).toUpperCase() == "OUI", // GGE: not needed
      auditioned: String(d["AUDITIONNÉ"]).toUpperCase() == "OUI", // not a list, will this cause a problem with generic map reduce functions looking for lists?
      financed: String(d["Financé"]).toUpperCase() == "OUI", // not a list, will this cause a problem with generic map reduce functions looking for lists?
      budget: d["Budget (demandé) en M€"] ? d["Budget (demandé) en M€"] : null,
      grade: d["Note du jury"] ? d["Note du jury"] : null,
      challenge: d["Défi"] ? d["Défi"] : null,
      name_fr: d["NOM COMPLET FR"] ? d["NOM COMPLET FR"] : null,
      name_en: d["NOM COMPLET ANGLAIS"] ? d["NOM COMPLET ANGLAIS"] : null,
      institutions: filterEmptyArray([
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
      ]),
      labs: filterEmptyArray([
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
      ]),
      partners: filterEmptyArray([
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
      ]),
      action: d["ACTION (de recherche)"] ? d["ACTION (de recherche)"] : null, // empty column?
      how: d["COMMENT"] ? d["COMMENT"] : null, // empty column?
      why: d["POUR QUOI FAIRE"] ? d["POUR QUOI FAIRE"] : null, // empty column?
      notes: d["Notes"] ? d["Notes"] : null, // not empty but almost?
    }

    // clean up labels
    mapped_entities.acronyme

    if (anonymize) {
      mapped_entities.acronyme = pseudoanonymizeEntry(
        mapped_entities.acronyme,
        pseudoanonymousDict,
        "dragon"
      )
      mapped_entities.name_fr = pseudoanonymizeEntry(
        mapped_entities.name_fr,
        pseudoanonymousDict,
        "darkelf"
      )
      mapped_entities.name_en = pseudoanonymizeEntry(
        mapped_entities.name_en,
        pseudoanonymousDict,
        "drow"
      )
      for (
        let index = 0;
        index < mapped_entities.institutions.length;
        index++
      ) {
        mapped_entities.institutions[index] = pseudoanonymizeEntry(
          mapped_entities.institutions[index],
          pseudoanonymousDict,
          "dwarf"
        )
      }
      for (let index = 0; index < mapped_entities.labs.length; index++) {
        mapped_entities.labs[index] = pseudoanonymizeEntry(
          mapped_entities.labs[index],
          pseudoanonymousDict,
          "highelf"
        )
      }
      for (let index = 0; index < mapped_entities.partners.length; index++) {
        mapped_entities.partners[index] = pseudoanonymizeEntry(
          mapped_entities.partners[index],
          pseudoanonymousDict,
          "goblin"
        )
      }
    }
    return mapped_entities
  })
}

/**
 * Format known entities from the Liste chercheurs sheet
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @param {boolean} pseudoanonymize - Anonymize data or not
 * @param {Map} pseudoacronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveResearcherEntities(
  sheet,
  anonymize = true,
  pseudoanonymousDict = new Map()
) {
  return map(
    rollup(
      sheet,
      (D) => {
        const researcher = {
          id: typeof D[0]["id"] == "number" ? D[0]["id"] : null,
          fullname: D[0]["NOM et Prénom"] ? D[0]["NOM et Prénom"] : null,
          lastname: D[0]["NOM"] ? D[0]["NOM"] : null,
          firstname: D[0]["Prénom"] ? D[0]["Prénom"] : null,
          gender: D[0]["sexe"] ? D[0]["sexe"] : null,
          disciplines: D[0]["discipline chercheur"]
            ? D[0]["discipline chercheur"].split(",").map((d) => d.trim())
            : [],
          discipline_erc: D[0]["discipline ERC chercheur"]
            ? D[0]["discipline ERC chercheur"].split(";").map((d) => d.trim())
            : [],
          position: D[0]["position statutaire"]
            ? D[0]["position statutaire"]
            : null,
          cnu: D[0]["CNU"] ? D[0]["CNU"] : null,
          site: D[0]["Sites"] ? D[0]["Sites"] : null,
          orcid: D[0]["ORCID"] ? D[0]["ORCID"] : null,
          idhal: D[0]["IDHAL"] ? D[0]["IDHAL"] : null,
          lab: D[0]["Identifiant Laboratoire"]
            ? D[0]["Identifiant Laboratoire"]
            : null,
          domain_erc_lab: D[0]["DOMAINES ERC LABO"]
            ? D[0]["DOMAINES ERC LABO"]
            : null,
          disciplines_erc_lab: filterEmptyArray([
            D[0]["Discipline ERC 1 LABO"],
            D[0]["Discipline ERC 2 LABO"],
            D[0]["Discipline ERC 3 LABO"],
            D[0]["Discipline ERC 4 LABO"],
            D[0]["Discipline ERC 5 LABO"],
            D[0]["Discipline ERC 6 LABO"],
            D[0]["Discipline ERC 7 LABO"],
            D[0]["Discipline ERC 8 LABO"],
            D[0]["Discipline ERC 9 LABO"],
          ]),
          domain_hceres: D[0]["Domaines scientifique HCERES 1"],
          disciplines_hceres: filterEmptyArray([
            D[0]["Sous-domaines scientifique HCERES 1"],
            D[0]["Sous-Domaines scientifique HCERES 2"],
            D[0]["Sous-Domaine Scientifique HCERES 3"],
            D[0]["sous-domaine scientifique HCERES 4"],
            D[0]["sous-domaine scientifique HCERES 5"],
            D[0]["sous-domaine scientifique HCERES 6"],
          ]),
          project: [],
          notes: D[0]["notes"] ? D[0]["notes"] : null,
        }
        D.forEach((row) => {
          // every row in group should corresopond to a project the researcher is in,
          // so add every project
          researcher.project.push(
            row["ACRONYME Projet"]
              ? cleanUpProjectLabel(row["ACRONYME Projet"])
              : null
          )
        })
        if (anonymize) {
          researcher.fullname = anonymizeEntry()
          researcher.firstname = anonymizeEntry()
          researcher.lastname = anonymizeEntry()
          researcher.gender = anonymizeEntry()
          researcher.orcid = anonymizeEntry()
          researcher.idhal = anonymizeEntry()
          researcher.lab = pseudoanonymizeEntry(
            researcher.lab,
            pseudoanonymousDict,
            "highelf"
          )
          for (let index = 0; index < researcher.project.length; index++) {
            researcher.project[index] = pseudoanonymizeEntry(
              researcher.project[index],
              pseudoanonymousDict,
              "dragon"
            )
          }
        }
        return researcher
      },
      (d) => (d["id"] ? d["id"] : d["NOM et Prénom"]) // group researcher by id if available, otherwise by name
    ),
    (d) => d[1]
  )
}

/**
 * Format known entities from the Liste des labo sheet
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @param {boolean} pseudoanonymize - Anonymize data or not
 * @param {Map} pseudoacronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveLabEntities(
  sheet,
  anonymize = false,
  pseudoanonymousDict = new Map()
) {
  return map(sheet, (d) => {
    const lab = {
      id: d["Identifiant Laboratoire"]
        ? d["Identifiant Laboratoire"].split(" ")[0]
        : null,
      umr: d["Identifiant Laboratoire"].match(/UMR \d*/g)
        ? d["Identifiant Laboratoire"].match(/UMR \d*/g)[0]
        : null,
      lab: d["Identifiant Laboratoire"] ? d["Identifiant Laboratoire"] : null,
      name: d["Nom Laboratoire"] ? d["Nom Laboratoire"] : null,
      institution: filterEmptyArray([
        d["C"],
        d["D"],
        d["E"],
        d["F"],
        d["G"],
        d["H"],
        d["I"],
        d["J"],
        d["K"],
      ]),
    }
    if (anonymize) {
      lab.lab = pseudoanonymizeEntry(lab.lab, pseudoanonymousDict, "highelf")
      lab.name = pseudoanonymizeEntry(lab.name, pseudoanonymousDict, "gnome")
      for (let index = 0; index < lab.institution.length; index++) {
        lab.institution[index] = pseudoanonymizeEntry(
          lab.institution[index],
          pseudoanonymousDict,
          "dwarf"
        )
      }
    }
    return lab
  })
}

/**
 * Format known entities from the Liste des établissements sheet
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @param {boolean} pseudoanonymize - Anonymize data or not
 * @param {Map} pseudoacronymousDict - A preset dictionary of anomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveInstitutionEntities(
  sheet,
  anonymize = false,
  pseudoanonymousDict = new Map()
) {
  return map(sheet, (d) => {
    const institution = {
      // just 1 column for the moment
      name: d["Nom des établissements"] ? d["Nom des établissements"] : null,
    }
    if (anonymize) {
      institution.name = pseudoanonymizeEntry(
        institution.name,
        pseudoanonymousDict,
        "gnome"
      )
    }
    return institution
  })
}

/**
 * Extract and format data from the phase 1 excel.
 *
 * @param {Workbook} workbook - The workbook to extract
 * @param {boolean} pseudoanonymize - pseudoanonymize data or not
 * @param {Map} pseudoacronymousDict - A preset dictionary of anomymized entry mappings
 * @param {boolean} onlyFinanced - Filter out non-financed projects?
 * @returns {Object[]} An object containing formatted tables
 */
export function extractPhase1Workbook(
  workbook,
  pseudoanonymize = true,
  pseudoanonymousDict = new Map(),
  onlyFinanced = false
) {
  const projects = resolveGeneralEntities(
    getGeneralSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict
  ).filter((d) => (onlyFinanced ? d.financed : true))
  const researchers = resolveResearcherEntities(
    getResearcherSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict
  ).filter((researcher) =>
    onlyFinanced
      ? projects.some(({ acronyme }) => researcher.project.includes(acronyme))
      : true
  )
  researchers.forEach(
    (d) =>
      (d.project = d.project.filter((projet) =>
        onlyFinanced
          ? projects.some(({ acronyme }) => projet === acronyme)
          : true
      ))
  )

  const laboratories = resolveLabEntities(
    getLabSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict
  ).filter((lab) =>
    onlyFinanced ? projects.some(({ labs }) => labs.includes(lab.lab)) : true
  )
  const universities = resolveInstitutionEntities(
    getInstitutionSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict
  ).filter((university) =>
    onlyFinanced
      ? projects.some(({ institutions }) =>
          institutions.includes(university.name)
        )
      : true
  )

  // Extract socioeconomic partners from projects
  let socioeconomic_partners = []
  projects.forEach((project) => {
    socioeconomic_partners = socioeconomic_partners.concat(
      project.partners.map((partner) => ({
        project: project.acronyme,
        partner: partner,
      }))
    )
  })

  // Move university-project links from projects to project_by_universities
  let project_by_universities = []
  projects.forEach((project) => {
    project_by_universities = project_by_universities.concat(
      project.institutions.map((inst) => ({
        project: project.acronyme,
        university: inst,
      }))
    )
    // delete project.institutions
  })

  // Move laboratory information from researchers to laboratory_data
  let project_by_laboratories = []
  projects.forEach((project) => {
    project_by_laboratories = project_by_laboratories.concat(
      project.labs.map((lab) => ({
        project: project.acronyme,
        lab: lab,
        // umr: lab.match(/UMR \d*/g),
      }))
    )
    // delete project.labs
  })

  let laboratories_by_disciplines_erc = new Map()
  let laboratories_by_disciplines_hceres = new Map()
  researchers.forEach((researcher) => {
    const lab = laboratories.find((lab) => lab.lab == researcher.lab)
    if (typeof lab !== "undefined") {
      lab.domain_erc = researcher.domain_erc_lab
      if (!laboratories_by_disciplines_erc.has(lab.lab)) {
        laboratories_by_disciplines_erc.set(lab.lab, new Set())
      }
      if (!laboratories_by_disciplines_hceres.has(lab.lab)) {
        laboratories_by_disciplines_hceres.set(lab.lab, new Set())
      }
      researcher.disciplines_erc_lab.forEach((d) =>
        laboratories_by_disciplines_erc.get(lab.lab).add(d)
      )
      lab.domain_hceres = researcher.domain_hceres
      researcher.disciplines_hceres.forEach((d) =>
        laboratories_by_disciplines_hceres.get(lab.lab).add(d)
      )
      delete researcher.domain_erc_lab
      delete researcher.disciplines_erc_lab
      delete researcher.domain_hceres
      delete researcher.disciplines_hceres
    } else {
      console.warn("laboratory not found:", researcher.lab)
    }
  })

  return {
    projects,
    researchers,
    laboratories,
    project_by_laboratories,
    laboratories_by_disciplines_erc: merge(
      laboratories_by_disciplines_erc.keys().map((lab) =>
        [...laboratories_by_disciplines_erc.get(lab)].map((discipline) => ({
          lab: lab,
          discipline: discipline ? discipline : null,
        }))
      )
    ),
    laboratories_by_disciplines_hceres: merge(
      laboratories_by_disciplines_hceres.keys().map((lab) =>
        [...laboratories_by_disciplines_hceres.get(lab)].map((discipline) => ({
          lab: lab,
          discipline: discipline ? discipline : null,
        }))
      )
    ),
    universities,
    project_by_universities,
    socioeconomic_partners,
  }
}

/**
 * Clean up a project label.
 *
 * @param {string} label - The project label to clean up
 * @returns {string} The cleaned-up project label
 */
function cleanUpProjectLabel(label) {
  return label.toUpperCase().replace(/É/g, "E")
}

/**
 * Create a filtered dataset, that filters based on 2 input criteria
 *
 * @param {Array} data - dataset to filter
 * @param {Array} input_criteria - all critereon to consider
 * @param {Function[]} criteria_functions - functions to use for each critereon.
 *    Keys contain the critereon to meet and the values contain the function to
 *    execute if a critereon is met. Functions should return true or false. If 'All'
 *    is passed in as criterion, the criterion is ignored (and accepted)
 * @returns {Array} filtered dataset
 */
export function filterOnInput(data, input_criteria, criteria_functions) {
  return filter(data, (d) => {
    for (let index = 0; index < input_criteria.length; index++) {
      const critereon = input_criteria[index]
      const critereon_function = criteria_functions[index]
      if (critereon_function(d) != critereon && critereon !== "All") {
        return false
      }
    }
    return true
  })
}

/**
 * Return the possible options of a column
 *
 * @param {Object[]} data - the dataset
 * @param {String} key - the column to search in
 * @returns {String[]} an Array of the possible options found in the column
 */
export function getColumnOptions(data, key) {
  const options = new Set(["All"])
  data.forEach((d) => options.add(d[key]))
  return options
}

export function getSortable3DCountPlot(
  data,
  x = "count",
  y = "type",
  fy = "entity",
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = "Plasma",
  x_label = "Occurrences",
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  fy_tick_format_cuttoff = 25, // cut off label after this many characters
  fy_label = "Entity",
  sort_criteria = "-x",
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
      axis: "top",
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x])) + domain_max],
    },
    fy: {
      tickFormat: (d) =>
        d.length > fy_tick_format_cuttoff ? d.slice(0, 23).concat("...") : d, // cut off long tick labels
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
  })
}

export function getSortable2MarkCountPlot(
  data,
  x1 = "count",
  // y1 = "type",
  x2 = "count",
  y2 = "type",
  width = 1500,
  row_height = 17,
  margin_left = 60,
  margin_right = 140,
  color_scheme = "Plasma",
  x_label = "Occurrences",
  domain_min = 0,
  domain_max = 1, // added to max occurrences to define the domain max
  y_tick_format_cuttoff = 25, // cut off label after this many characters
  y_label = "Entity",
  sort_criteria = "-x",
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
      axis: "top",
      label: x_label,
      // domain useful for constraining ticks between 0 and max occurrences + 1
      domain: [domain_min, Math.max(...data.map((d) => d[x1])) + domain_max],
    },
    y: {
      tickFormat: (d) =>
        d.length > y_tick_format_cuttoff ? d.slice(0, 23).concat("...") : d, // cut off long tick labels
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
  })
}
