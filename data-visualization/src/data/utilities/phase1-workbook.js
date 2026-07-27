import { map, rollup, merge } from 'd3'
import {
  anonymizeEntry,
  pseudoanonymizeEntry,
  filterEmptyArray,
  toLowerPreservingAcronyms,
  mapRowToColumnKeys,
  rowsToObjectArray,
} from './data_utilities.js'
import { v4 as uuidv4 } from 'uuid'
import { queryAndFormatRE } from './siret_api.js'
// import { queryAndFormatESR } from './rnsr_api.js'

/**
 * Extract data from the GÉNÉRALITÉ sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getGeneralSheet(workbook) {
  mapRowToColumnKeys(workbook, 0)
  return rowsToObjectArray(workbook.worksheets[0].getRows(2, 40))
  // return Object.fromEntries(new Map(entries))
  // return workbook.sheet(workbook.worksheets[0], {
  //   // range: 'A1:BQ9',
  //   range: 'A1:HV41',
  //   headers: true,
  // })
}

/**
 * Extract data from the Liste chercheurs sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getResearcherSheet(workbook) {
  mapRowToColumnKeys(workbook, 1)
  return rowsToObjectArray(workbook.worksheets[1].getRows(2, 1086))
  // return workbook.sheet(workbook.worksheets[1], {
  //   // range: 'A1:AA298',
  //   range: 'A1:AE1087',
  //   headers: true,
  // })
}

/**
 * Extract data from the adresses mail sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getMailSheet(workbook) {
  mapRowToColumnKeys(workbook, 3)
  return rowsToObjectArray(workbook.worksheets[3].getRows(2, 1086))
  // return workbook.sheet(workbook.worksheets[1], {
  //   // range: 'A1:AA298',
  //   range: 'A1:AE1087',
  //   headers: true,
  // })
}

/**
 * Extract data from the liste des labo sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getLabSheet(workbook) {
  mapRowToColumnKeys(workbook, 4)
  return rowsToObjectArray(workbook.worksheets[4].getRows(2, 261))
  // return workbook.sheet(workbook.worksheets[4], {
  //   range: 'A1:K262',
  //   headers: true,
  // })
}

/**
 * Extract data from the liste des établissements sheet
 *
 * @param {Workbook} workbook - The workbook to extract
 * @returns {Object[]} A dictionary of the extracted sheet, each column header is used a key.
 *    Columns headers with identical information are grouped into the same key (e.g., "lab1" and "lab2" are grouped into "lab").
 */
export function getInstitutionSheet(workbook) {
  mapRowToColumnKeys(workbook, 5)
  return rowsToObjectArray(workbook.worksheets[5].getRows(2, 110))
  // return workbook.sheet(workbook.worksheets[5], {
  //   range: 'A1:A111',
  //   headers: true,
  // })
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
 * @param {Row[]} sheet - Extracted sheet data
 * @param {boolean} [pseudoanonymize=false] - Pseudoanonymize data or not
 * @param {Map} [pseudoacronymousDict=new Map()] - A preset dictionary of pseudoanomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveGeneralEntities(
  sheet,
  anonymize = false,
  pseudoanonymousDict = new Map(),
) {
  return map(sheet, (d) => {
    const mapped_entities = {
      acronyme: d['ACRONYME Projet']
        ? cleanUpProjectLabel(d['ACRONYME Projet'])
        : null,
      present: String(d['Présent aux journées']).toUpperCase() == 'OUI', // GGE: not needed
      auditioned: String(d['AUDITIONNÉ']).toUpperCase() == 'OUI', // not a list, will this cause a problem with generic map reduce functions looking for lists?
      financed: String(d['Financé']).toUpperCase() == 'OUI', // not a list, will this cause a problem with generic map reduce functions looking for lists?
      budget: cleanDatum(d['Budget (demandé) en M€']),
      grade: cleanDatum(d['Note du jury']),
      challenge: cleanDatum(d['Défi']),
      name_fr: cleanDatum(d['NOM COMPLET FR']),
      name_en: cleanDatum(d['NOM COMPLET ANGLAIS']),
      institutions: filterEmptyArray([
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
      labs: filterEmptyArray([
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
      partners: filterEmptyArray([
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
      action: cleanDatum(d['ACTION (de recherche)']), // empty column?
      how: cleanDatum(d['COMMENT']), // empty column?
      why: cleanDatum(d['POUR QUOI FAIRE']), // empty column?
      notes: cleanDatum(d['Notes']), // not empty but almost?
    }

    // clean up labels
    mapped_entities.acronyme

    if (anonymize) {
      mapped_entities.acronyme = pseudoanonymizeEntry(
        mapped_entities.acronyme,
        pseudoanonymousDict,
        'dragon',
      )
      mapped_entities.name_fr = pseudoanonymizeEntry(
        mapped_entities.name_fr,
        pseudoanonymousDict,
        'darkelf',
      )
      mapped_entities.name_en = pseudoanonymizeEntry(
        mapped_entities.name_en,
        pseudoanonymousDict,
        'drow',
      )
      for (
        let index = 0;
        index < mapped_entities.institutions.length;
        index++
      ) {
        mapped_entities.institutions[index] = pseudoanonymizeEntry(
          mapped_entities.institutions[index],
          pseudoanonymousDict,
          'dwarf',
        )
      }
      for (let index = 0; index < mapped_entities.labs.length; index++) {
        mapped_entities.labs[index] = pseudoanonymizeEntry(
          mapped_entities.labs[index],
          pseudoanonymousDict,
          'highelf',
        )
      }
      for (let index = 0; index < mapped_entities.partners.length; index++) {
        mapped_entities.partners[index] = pseudoanonymizeEntry(
          mapped_entities.partners[index],
          pseudoanonymousDict,
          'goblin',
        )
      }
    }
    return mapped_entities
  })
}

/**
 * Format known entities from the Liste chercheurs and adresses mail sheet
 *
 * @param {Object[]} researcher_sheet - Extracted researcher sheet data
 * @param {Object[]} mail_sheet - Extracted mail sheet data
 * @param {boolean} [pseudoanonymize=true] - Anonymize data or not
 * @param {Map} [pseudoanonymousDict=new Map()] - A preset dictionary of anomymized entry mappings
 * @returns {Object[]} Formatted sheet data
 */
export function resolveResearcherEntities(
  researcher_sheet,
  mail_sheet,
  anonymize = true,
  pseudoanonymousDict = new Map(),
) {
  return map(
    rollup(
      researcher_sheet,
      (D) => {
        const researcher = {
          id:
            typeof D[0]['id'] === 'number' && D[0]['id'] !== ''
              ? D[0]['id']
              : uuidv4(),
          fullname: cleanDatum(D[0]['NOM et Prénom']),
          lastname: cleanDatum(D[0]['NOM']),
          firstname: cleanDatum(D[0]['Prénom']),
          email: cleanDatum(
            mail_sheet.find(
              (email) =>
                `${cleanDatum(email['NOM'])} ${cleanDatum(email['Prénom'])}` ===
                  cleanDatum(D[0]['NOM et Prénom']) ||
                (cleanDatum(email['NOM']) === cleanDatum(D[0]['NOM']) &&
                  cleanDatum(email['Prénom']) === cleanDatum(D[0]['Prénom'])),
            )?.['adresse mail'],
          ),
          gender: cleanDatum(D[0]['sexe']),
          keywords: D[0]['objets, thèmes, intérêts de recherche']
            ? D[0]['objets, thèmes, intérêts de recherche']
                .split(',')
                .map((d) => toLowerPreservingAcronyms(d.trim()))
            : [],
          discipline_erc: D[0]['discipline ERC chercheur']
            ? D[0]['discipline ERC chercheur'].split(';').map((d) => d.trim())
            : [],
          position: cleanDatum(D[0]['position statutaire']),
          cnu: cleanDatum(D[0]['discipline CNU']),
          site: cleanDatum(D[0]['Sites']),
          orcid: cleanDatum(D[0]['ORCID']),
          idhal: cleanDatum(D[0]['IDHAL']),
          lab: cleanDatum(D[0]['Identifiant Laboratoire']),
          domain_erc_lab: D[0]['DOMAINE ERC LABO (sources RNSR)']
            ? D[0]['DOMAINE ERC LABO (sources RNSR)']
                .split(';')
                .map((d) => d.trim())
            : [],
          disciplines_erc_lab: filterEmptyArray([
            D[0]['DISCIPLINES ERC LABO 1 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 2 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 3 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 4 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 5 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 6 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 7 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 8 (sources RNSR)'],
            D[0]['DISCIPLINES ERC LABO 9 (sources RNSR)'],
          ]),
          domain_hceres: D[0]['Domaines scientifique HCERES 1 (sources RNSR)']
            ? D[0]['Domaines scientifique HCERES 1 (sources RNSR)']
                .split(' - ')
                .map((d) => d.trim().replace('SV ', 'SVE '))
            : [],
          disciplines_hceres: filterEmptyArray([
            D[0]['Sous-domaines scientifique HCERES 1  (sources RNSR)'],
            D[0]['Sous-Domaines scientifique HCERES 2  (sources RNSR)'],
            D[0]['Sous-Domaine Scientifique HCERES 3  (sources RNSR)'],
            D[0]['sous-domaine scientifique HCERES 4  (sources RNSR)'],
            D[0]['sous-domaine scientifique HCERES 5  (sources RNSR)'],
            D[0]['sous-domaine scientifique HCERES 6  (sources RNSR)'],
          ]),
          project: [],
          notes: cleanDatum(D[0]['notes']),
        }
        D.forEach((row) => {
          // every row in group should corresopond to a project the researcher is in,
          // so add every project
          researcher.project.push(
            row['ACRONYME Projet']
              ? cleanUpProjectLabel(row['ACRONYME Projet'])
              : null,
          )
        })
        if (anonymize) {
          researcher.fullname = anonymizeEntry()
          researcher.firstname = anonymizeEntry()
          researcher.lastname = anonymizeEntry()
          researcher.gender = anonymizeEntry()
          researcher.email = anonymizeEntry()
          researcher.orcid = anonymizeEntry()
          researcher.idhal = anonymizeEntry()
          researcher.lab = pseudoanonymizeEntry(
            researcher.lab,
            pseudoanonymousDict,
            'highelf',
          )
          for (let index = 0; index < researcher.project.length; index++) {
            researcher.project[index] = pseudoanonymizeEntry(
              researcher.project[index],
              pseudoanonymousDict,
              'dragon',
            )
          }
        }
        return researcher
      },
      (d) => (d['id'] ? cleanDatum(d['id']) : cleanDatum(d['NOM et Prénom'])), // group researcher by id if available, otherwise by name
    ),
    (d) => d[1],
  )
}

/**
 * Flatten each researcher's keywords into a list of researcher/keyword pairs
 *
 * @param {Object[]} researchers - researcher entities, each with a `keywords` array
 * @returns {Object[]} an array of `{researcher, keyword}` rows
 */
export function resolveResearcherByKeywords(researchers) {
  let researcher_by_keywords = []
  researchers.forEach((researcher) => {
    researcher_by_keywords = researcher_by_keywords.concat(
      researcher.keywords.map((keyword) => ({
        researcher: researcher.id,
        keyword: keyword,
      })),
    )
  })
  return researcher_by_keywords
}

/**
 * Format known entities from the Liste des labo sheet
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @returns {Object[]} Formatted sheet data
 */
export function resolveLabEntities(sheet) {
  return map(sheet, (d) => {
    const lab = {
      id: d['Identifiant Laboratoire']
        ? d['Identifiant Laboratoire'].split(' ')[0]
        : null,
      umr: d['Identifiant Laboratoire'].match(/UMR \d*/g)
        ? d['Identifiant Laboratoire'].match(/UMR \d*/g)[0]
        : null,
      lab: cleanDatum(d['Identifiant Laboratoire']),
      name: cleanDatum(d['Nom Laboratoire']),
      institution: filterEmptyArray([
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
      // ...(d['Identifiant Laboratoire']
      //   ? await queryAndFormatESR(
      //       d['Identifiant Laboratoire'].split(' ')[0],
      //       'aap1_export',
      //     )
      //   : {}),
    }
    return lab
  })
}

/**
 * Format known entities from the Liste des établissements sheet
 *
 * @param {Object[]} sheet - Extracted sheet data
 * @returns {Object[]} Formatted sheet data
 */
export function resolveInstitutionEntities(sheet) {
  // return Promise.all(
  // map(sheet, (d) => {
  // const name = cleanDatum(d['Nom des établissements'])
  // const response = await queryAndFormatRE(name, 'aap1_export')
  // return { name, ...response }
  // }),
  // )
  return map(sheet, (d) => ({
    name: cleanDatum(d['Nom des établissements']),
  }))
}

/**
 * Enrich a list of socioeconomic partner labels with SIRET/recherche-entreprises
 * API data
 *
 * @param {string[]} partners - partner labels to query
 * @returns {Promise<Object[]>} a promise resolving to an array of `{label, ...response}` objects
 */
export async function enrichSocioeconomicPartnersEntities(partners) {
  return Promise.all(
    map(partners, async (d) => {
      const response = await queryAndFormatRE(d, 'aap1_export')
      return { label: d, ...response }
    }),
  )
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
  {
    pseudoanonymize = false,
    pseudoanonymousDict = new Map(),
    onlyFinanced = false,
  } = {},
) {
  const projects = resolveGeneralEntities(
    getGeneralSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict,
  ).filter((d) => (onlyFinanced ? d.financed : true))

  const researchers = resolveResearcherEntities(
    getResearcherSheet(workbook),
    getMailSheet(workbook),
    pseudoanonymize,
    pseudoanonymousDict,
  ).filter((researcher) =>
    onlyFinanced
      ? projects.some(({ acronyme }) => researcher.project.includes(acronyme))
      : true,
  )
  researchers.forEach(
    (d) =>
      (d.project = d.project.filter((projet) =>
        onlyFinanced
          ? projects.some(({ acronyme }) => projet === acronyme)
          : true,
      )),
  )

  const project_by_researchers = researchers.flatMap((d) =>
    d.project.map((project) => ({ researcher: d.id, project })),
  )

  const laboratories = resolveLabEntities(getLabSheet(workbook)).filter(
    (lab) =>
      onlyFinanced ? projects.some(({ labs }) => labs.includes(lab.lab)) : true,
  )

  const universities = resolveInstitutionEntities(
    getInstitutionSheet(workbook),
  ).filter((university) =>
    onlyFinanced
      ? projects.some(({ institutions }) =>
          institutions.includes(university.name),
        )
      : true,
  )

  // Extract socioeconomic partners from projects
  const socioeconomic_partners = [
    ...new Set(projects.flatMap(({ partners }) => partners)),
  ].map((d) => ({ partner: d }))

  let project_by_socioeconomic_partners = []
  projects.forEach((project) => {
    project_by_socioeconomic_partners =
      project_by_socioeconomic_partners.concat(
        project.partners.map((partner) => ({
          project: project.acronyme,
          partner: partner,
        })),
      )
  })

  // Move university-project links from projects to project_by_universities
  let project_by_universities = []
  projects.forEach((project) => {
    project_by_universities = project_by_universities.concat(
      project.institutions.map((inst) => ({
        project: project.acronyme,
        university: inst,
      })),
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
      })),
    )
  })

  const laboratories_by_domains_erc = new Map()
  const laboratories_by_disciplines_erc = new Map()
  const laboratories_by_domains_hceres = new Map()
  const laboratories_by_disciplines_hceres = new Map()
  researchers.forEach((researcher) => {
    const lab = laboratories.find((lab) => lab.lab == researcher.lab)
    if (typeof lab !== 'undefined') {
      lab.domain_erc = researcher.domain_erc_lab
      if (!laboratories_by_domains_erc.has(lab.lab)) {
        laboratories_by_domains_erc.set(lab.lab, new Set())
      }
      researcher.domain_erc_lab.forEach((d) =>
        laboratories_by_domains_erc.get(lab.lab).add(d),
      )

      if (!laboratories_by_disciplines_erc.has(lab.lab)) {
        laboratories_by_disciplines_erc.set(lab.lab, new Set())
      }
      researcher.disciplines_erc_lab.forEach((d) =>
        laboratories_by_disciplines_erc.get(lab.lab).add(d),
      )

      lab.domain_hceres = researcher.domain_hceres
      if (!laboratories_by_domains_hceres.has(lab.lab)) {
        laboratories_by_domains_hceres.set(lab.lab, new Set())
      }
      researcher.domain_hceres.forEach((d) =>
        laboratories_by_domains_hceres.get(lab.lab).add(d),
      )

      if (!laboratories_by_disciplines_hceres.has(lab.lab)) {
        laboratories_by_disciplines_hceres.set(lab.lab, new Set())
      }
      researcher.disciplines_hceres.forEach((d) =>
        laboratories_by_disciplines_hceres.get(lab.lab).add(d),
      )

      delete researcher.domain_erc_lab
      delete researcher.disciplines_erc_lab
      delete researcher.domain_hceres
      delete researcher.disciplines_hceres
    } else {
      console.warn('laboratory not found:', researcher.lab)
    }
  })

  return {
    projects,
    researchers,
    researcher_by_keywords: resolveResearcherByKeywords(researchers),
    laboratories,
    project_by_laboratories,
    laboratories_by_domains_erc: merge(
      [...laboratories_by_domains_erc.keys()].map((lab) =>
        [...laboratories_by_domains_erc.get(lab)].map((domain) => ({
          lab: lab,
          domain: domain || null,
        })),
      ),
    ),
    laboratories_by_disciplines_erc: merge(
      [...laboratories_by_disciplines_erc.keys()].map((lab) =>
        [...laboratories_by_disciplines_erc.get(lab)].map((discipline) => ({
          lab: lab,
          discipline: discipline || null,
        })),
      ),
    ),
    laboratories_by_disciplines_hceres: merge(
      [...laboratories_by_disciplines_hceres.keys()].map((lab) =>
        [...laboratories_by_disciplines_hceres.get(lab)].map((discipline) => ({
          lab: lab,
          discipline: discipline || null,
        })),
      ),
    ),
    laboratories_by_domains_hceres: merge(
      [...laboratories_by_domains_hceres.keys()].map((lab) =>
        [...laboratories_by_domains_hceres.get(lab)].map((domain) => ({
          lab: lab,
          domain: domain || null,
        })),
      ),
    ),
    universities,
    project_by_universities,
    socioeconomic_partners,
    project_by_socioeconomic_partners,
    project_by_researchers,
  }
}

/**
 * Clean up a project label.
 *
 * @param {string} label - The project label to clean up
 * @returns {string} The cleaned-up project label
 */
function cleanUpProjectLabel(label) {
  return label.toUpperCase().replace(/É/g, 'E')
}

/**
 * Trim a string value, or normalize a falsy value to null
 *
 * @param {*} d - the value to clean
 * @returns {string|*|null} the trimmed string, the original value, or null
 */
function cleanDatum(d) {
  if (!d) return null
  if (typeof d === 'string') return d.trim()
  return d
}
