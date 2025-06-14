import { merge } from 'npm:d3';
import { formatIfString } from './utilities.js';

/**
 * Format known project entities from the Financing sheet
 *
 * @param {Array<Object>} workbook - The workbook to extract
 * @returns {Array<Object.<Array>} Formatted sheet data
 */
export function resolveProjectFinancingEntities(workbook, project = null) {
  const personnel = [];
  const partners = [];

  // iterate over partner sheets
  for (let index = 3; index < workbook.sheetNames.length; index++) {
    // partners
    const project_partners = mapPartnerFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        // coordinating partner sheet (index 3) is structured slightly differently
        range: index === 3 ? 'C257:E264' : 'C256:E263',
        headers: false,
      }),
      project
    );

    // personnel without a financing request
    // const personnel_no_request = mapPersonnelFinancingEntities(
    //   workbook.sheet(workbook.sheetNames[index], {
    //     range: 'B50:I61',
    //     headers: false,
    //   }),
    //   false,
    //   project,
    //   project_partners[0] ? project_partners[0].name : null,
    //   project_partners[0] ? project_partners[0].siret : null
    // );

    // personnel with a financing request
    const personnel_request = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B64:I75',
        headers: false,
      }),
      false,
      project,
      project_partners[0] ? project_partners[0].name : null,
      project_partners[0] ? project_partners[0].siret : null
    );

    // civil servant personnel
    // const personnel_public = mapPersonnelFinancingEntities(
    //   workbook.sheet(workbook.sheetNames[index], {
    //     range: 'B80:I103',
    //     headers: false,
    //   }),
    //   true,
    //   project,
    //   project_partners[0] ? project_partners[0].name : null,
    //   project_partners[0] ? project_partners[0].siret : null
    // );

    // aggregate data
    project_partners.forEach((partner) => partners.push(partner));

    // merge and filter out unwanted personnel types then add to dataset
    merge([
      personnel_request,
      // personnel_no_request,
      // personnel_public
    ]).forEach((person) => {
      // cleanup description
      person.type_post = null;
      const clean_description = person.description
        ? person.description.trim().toLocaleUpperCase()
        : null;

      // check if description is empty
      if (!clean_description) {
        person.type_post = 'other/unknown';
        personnel.push(person);
        return;
      }

      // known prefiltered post description keyword mappings to non civil servant classification
      const personnel_keyword_type_map = new Map([
        ['Post', 'Postdoctorant'],
        ['Doctorant', 'Doctorant'],
        ['Master', 'IE'],
        ['Master2', 'IE'],
        ['M2', 'IE'],
        ['stage', 'IE'],
        ['Stagiaire', 'IE'],
        ['Tech', 'Tech'],
        ['recherche', 'IR'],
        ['Expert', 'IR'],
        ['étude', 'IE'],
        ['etude', 'IE'],
        // ['IGR', 'IR'],
        // ['IGE', 'IE'],
        // ['IR', 'IR'],
        // ['IE', 'IE'],
        ['Ingénieur', 'IR'],
        ['Ingérieur', 'IR'],
        // ['data', 'IR'],
        // ['Statisticien', 'IR'],
      ]);

      // known prefiltered post description token mappings to non civil servant classification
      const personnel_token_type_map = new Map([
        // ['recherche', 'IR'],
        // ['Expert', 'IR'],
        // ['Doctorant', 'Doctorant'],
        // ['étude', 'IE'],
        // ['Master', 'IE'],
        // ['Master2', 'IE'],
        // ['M2', 'IE'],
        // ['stage', 'IE'],
        // ['Stagiaire', 'IE'],
        // ['Tech', 'Tech'],
        ['IGR', 'IR'],
        ['IGE', 'IE'],
        ['IR', 'IR'],
        ['IE', 'IE'],
        ['AI', 'AI'],
        // ['Ingénieur', 'IR'],
        // ['data', 'IR'],
      ]);

      // categorize contract dsecriptions

      // check if description contains a keyword
      for (const mapping of personnel_keyword_type_map) {
        if (clean_description.includes(mapping[0].toLocaleUpperCase())) {
          person.type_post = mapping[1];
          break;
        }
      }
      // check if description contains a token
      const tokenized_description = clean_description.split(' ');
      for (const mapping of personnel_token_type_map) {
        for (let index = 0; index < tokenized_description.length; index++) {
          const token = tokenized_description[index];
          if (token == mapping[0].toLocaleUpperCase()) {
            person.type_post = mapping[1];
            break;
          }
        }
      }

      // check if AI
      if (
        (person.type_post == 'IR' || person.type_post == 'IE') &&
        clean_description.includes('assist')
      ) {
        person.type_post = 'AI';
      }

      // default case
      if (!person.type_post) {
        person.type_post = 'other/unknown';
      }

      personnel.push(person);
    });
  }

  return { personnel, partners };
}

/**
 * Map known personnel financing entities
 *
 * @param {Array<Object>} data - A table
 * @param {Boolean} civil_servants - Are we dealing with a civil servants?
 * @param {string} project - Optional project name
 * @returns {Array<Object.<Array>} Formatted personnel data
 */
function mapPersonnelFinancingEntities(
  data,
  civil_servants,
  project = null,
  default_employer = null,
  default_employer_id = null
) {
  const mapped_data = data.map((d) => {
    const person = {
      project: project, // project name
      // description: formatIfString(d['B']), // description of role
      description: anonymizeDescription(d['B']), // description of role
      type_contract: formatIfString(d['D']), // type of contract
      employer: formatIfString(d['D'])
        ? formatIfString(d['D'])
        : default_employer, // name of employer (instutution)
      employer_id: default_employer_id, // name of employer (instutution)
      months: formatIfString(d['F']), // contract length by number of months
      cost: formatIfString(d['E']), // unitary cost
      assistance: formatIfString(d['H']), // additional requested financing
      support: formatIfString(d['I']), // support cost
      total_cost: formatIfString(d['G']), // total cost
    };

    // handle special cases

    // Column D mixes contract type and employer depending on if civil servant
    if (civil_servants) {
      person.type_contract = 'CDI';
    } else {
      person.employer = default_employer;
    }
    // contract type may declare post description
    const known_doctoral_CDD_types = [
      'DOCTORANT',
      'POSTDOC',
      'POST-DOC',
      'POST-DOCTORAL',
    ];
    if (!civil_servants && person.type_contract) {
      const contract_type_tokens = person.type_contract.trim().split(' ');
      for (let index = 0; index < known_doctoral_CDD_types.length; index++) {
        const type = known_doctoral_CDD_types[index];
        const match = contract_type_tokens.find(
          (token) => token.toUpperCase() == type
        );
        if (match) {
          person.description += ` (${match})`;
          person.type_contract = contract_type_tokens
            .filter((d) => d != match)
            .join(' ');
          break;
        }
      }
    }

    return person;
  });

  // filter out empty values
  return mapped_data.filter(
    ({ description, months, cost, assistance, support, total_cost }) =>
      description || months || cost || assistance || support || total_cost
  );
}

/**
 * Map known personnel financing entities
 *
 * @param {Array<Object>} data - A table
 * @param {string} project - Project acronym
 * @returns {Array<Object.<Array>} Formatted personnel data
 */
function mapPartnerFinancingEntities(data, project) {
  return data
    .map((d) => {
      // format complete_name and type
      let complete_name = formatIfString(d['C']);
      let type = null;
      const tokens = complete_name
        ? complete_name.split(' ').map((d) => d.trim())
        : [];

      // if last token is wrapped in parentheses update the complete name and type
      if (/^\(.*\)$/.test(tokens[tokens.length - 1])) {
        complete_name = tokens.slice(0, tokens.length - 1).join(' ');
        type = tokens[tokens.length - 1].replace(/^\(|\)$/g, '');
      }

      return {
        complete_name: complete_name, // complete name
        name:
          d['D'] && d['D'].startsWith('Étab ') ? null : formatIfString(d['D']), // short name
        type: type, // partner type
        siret: d['E'] ? d['E'].replace(/[^0-9]/g, '') : null, // partner SIRET, filter out non numeric characters
        project: project, // project name
      };
    })
    .filter(({ complete_name, name, siret }) => complete_name || name || siret);
}

/**
 * Anonymize post description to return just the type of post
 *
 * @param {string || undefined} description - Post description
 * @returns {string || null} anonymized entry
 */
function anonymizeDescription(description) {
  if (!description) {
    return null;
  }
  const tokens = description
    .trim()
    // replace special characters with spaces but keep accents
    .replace(/[^a-zA-ZÀ-ž0-9\s]/g, ' ')
    .split(' ');
  const anonymized_tokens = tokens.filter(
    (token) => known_tokens.includes(token.toUpperCase()) || /^\d+$/.test(token)
  );
  return anonymized_tokens.join(' ');
}

// all known token used for post description classification
const known_tokens = [
  'adjointe',
  'administratifs',
  'Agent',
  'Agents',
  'AI',
  'Alternant',
  'Animateur',
  'ASI',
  'Assistante',
  'attaché',
  'CE',
  'Chargé',
  'chargés',
  'Chef',
  'Chercheur',
  'Chercheure',
  'clinique ',
  'conférence ',
  'conférences',
  'confirmé',
  'CPJ',
  'CR',
  'CR1',
  'CR2',
  'CRCN',
  'CRHC',
  'data',
  'Décharge',
  'Dir',
  'Directeur',
  'Directrice',
  'doc ',
  'DOCTORANT',
  'doctorante',
  'Doctorat',
  'DR',
  'DR1',
  'DR12',
  'DR2',
  'encadrant',
  'enseignant',
  'enseignement',
  'etude',
  'étude',
  'études',
  'executif',
  'Expert',
  'Facilitateur',
  'Géomaticiens ',
  'Gestionnaire',
  'HC',
  'ICPEF',
  'IDTPE',
  'IE',
  'IECN',
  'IEES',
  'IGE',
  'IGR',
  'IMBE',
  'Ing',
  'Ingénieur',
  'ingénieurs',
  'ingérieur',
  'IPEF',
  'IR',
  'IR1',
  'IR2',
  'IRCN',
  'IRHC',
  'ITPE',
  'IUSTI',
  'LCE',
  'M2',
  'maitre',
  'maître',
  'manager',
  'MASTER',
  'master ',
  'Master2',
  'MCF',
  'MCU',
  'MdC',
  'methodologiste',
  'mission',
  'Officiers',
  'PA',
  'PEA',
  'pédagogiques',
  'Personnel',
  'PF',
  'PhD',
  'POST',
  'POSTDOC',
  'postdoctorant',
  'PR',
  'Pr',
  'PR1',
  'PRCE',
  'Preventionnistes',
  'prof',
  'professeur',
  'Project',
  'projet',
  'prospective',
  'PU',
  'PUPH',
  'recherche',
  'responsable',
  'scientifique',
  'scientist',
  'SP',
  'STAGE',
  'Stages ',
  'Stagiaire',
  'stagiaires ',
  'Stagiare',
  'statisticien',
  'supérieur',
  'Tech',
  'Technicien',
  'technique',
  'TFR',
  'Thèse',
  'TR',
  'TSCDD',
  'universités',
].map((token) => token.trim().toLocaleUpperCase());
