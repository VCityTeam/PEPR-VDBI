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
    // partner
    const partner = mapPartnerFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'D7:D10',
        headers: false,
      })
    );

    // personnel without a financing request
    const personnel_no_request = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B50:I61',
        headers: false,
      }),
      false,
      project,
      partner.name,
    );

    // personnel with a financing request
    const personnel_request = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B64:I75',
        headers: false,
      }),
      false,
      project,
      partner.name,
    );

    // civil servant personnel
    const personnel_public = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B80:I103',
        headers: false,
      }),
      true,
      project,
      partner.name,
    );

    // aggregate data
    if (
      partner.complete_name ||
      partner.name ||
      partner.type ||
      partner.siret
    ) {
      partners.push(partner);
    }
    merge([personnel_request, personnel_no_request, personnel_public]).forEach(
      (person) => {
        personnel.push(person);
      }
    );
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
  default_employer = null
) {
  const mapped_data = data.map((d) => {
    const person = {
      // description: formatIfString(d['B']), // description of role
      project: project, // project name
      description: anonymizeDescription(d['B']), // description of role
      type: formatIfString(d['D']), // type of contract
      employer: formatIfString(d['D'])
        ? formatIfString(d['D'])
        : default_employer, // name of employer (instutution)
      months: formatIfString(d['F']), // contract length by number of months
      cost: formatIfString(d['E']), // unitary cost
      assistance: formatIfString(d['H']), // additional requested financing
      support: formatIfString(d['I']), // support cost
      total_cost: formatIfString(d['G']), // total cost
    };

    // handle special cases

    // Column D mixes contract type and employer depending on if civil servant
    if (civil_servants) {
      person.type = 'CDI';
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
    if (!civil_servants && person.description == '' && person.type) {
      const contract_type_tokens = person.type.trim().split(' ');
      for (let index = 0; index < known_doctoral_CDD_types.length; index++) {
        const type = known_doctoral_CDD_types[index];
        const match = contract_type_tokens.find(
          (token) => token.toUpperCase() == type
        );
        if (match) {
          person.description = match;
          break;
        }
      }
    }
    return person;
  });

  // filter out empty values
  return mapped_data.filter(
    ({ months, cost, assistance, support, total_cost }) =>
      months || cost || assistance || support || total_cost
  );
}

/**
 * Map known personnel financing entities
 *
 * @param {Array<Object>} data - A table
 * @returns {Array<Object.<Array>} Formatted personnel data
 */
function mapPartnerFinancingEntities(data) {
  return {
    complete_name: formatIfString(data[0]['D']), // complete name
    name: formatIfString(data[1]['D']), // short name
    type: formatIfString(data[2]['D']), // partner type
    siret: formatIfString(data[3]['D']), // partner SIRET
  };
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
  const known_tokens = [
    'adjointe',
    'administratifs',
    'Agent',
    'Agents',
    'AI',
    'Alternant',
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
    'confirmé',
    'conférence ',
    'conférences',
    // 'Contribution responsable opération pour données sur sites choiss',
    // 'Contribution responsable service réhabilitation aux ateliers, journées de restitution, actions de dissémination',
    'CPJ',
    'CR',
    'CR1',
    'CR2',
    'CRCN',
    'CRHC',
    'data',
    'Dir',
    'Directeur',
    'Directrice',
    'doc ',
    'DOCTORANT',
    'doctorante',
    'DR',
    'DR1',
    'DR12',
    'DR2',
    'Décharge',
    'encadrant',
    'enseignant',
    'enseignement',
    'etude',
    'executif',
    'Expert',
    'Gestionnaire',
    'Géomaticiens ',
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
    'manager',
    'MASTER',
    'master ',
    'Master2',
    'maître',
    'MCF',
    'MCU',
    'MdC',
    'methodologiste',
    'mission',
    'Officiers',
    'Officiers SP Preventionnistes',
    'PA',
    'PEA',
    'Personnel',
    'PF',
    'POST',
    'POSTDOC',
    'postdoctorant',
    'PR',
    'Pr',
    'PR1',
    'PRCE',
    'prof',
    'professeur',
    'Project',
    'projet',
    'prospective',
    'PU',
    'PUPH',
    'pédagogiques',
    'recherche',
    'recruter',
    'scientist',
    'SP',
    'STAGE',
    'Stages ',
    'Stagiaire',
    'stagiaires ',
    'statisticien',
    'supérieur',
    'Tech',
    'Technicien',
    'technique',
    'TFR',
    'TR',
    'TSCDD',
    'universités ',
    'étude',
    'études',
  ].map((token) => token.trim().toLocaleUpperCase());
  const tokens = description
    .trim()
    // filter special characters but keep accents and replace apostrophes with spaces
    .replace(/['-]/g, ' ')
    .replace(/[^a-zA-ZÀ-ž0-9\s]/g, '')
    .split(' ');
  const anonymized_tokens = tokens.filter((token) =>
    known_tokens.includes(token.toUpperCase())
  );
  return anonymized_tokens.join(' ');
}

// old list:
// 'Stagiaire',
// 'IE',
// 'IECN',
// 'IEES',
// 'ICPEF',
// 'IDTPE',
// 'IDTPE',
// 'IR',
// 'IR1',
// 'IR2',
// 'IRHC',
// 'IPEF',
// 'ITPE',
// 'IGR',
// 'DOCTORANT',
// 'POSTDOC',
// 'POST-DOC',
// 'DR1',
// 'DR2',
// 'CR',
// 'CR1',
// 'CR2',
// 'CE',
// 'CPJ',
// 'DR',
// 'PU',
// 'CRCN',
// 'CRHC',
// 'HC',
// 'MCF',
// 'MCU',
// 'STAGE',
// 'TR',
// 'Tech',
// 'TSCDD',
// 'MASTER',
// 'M2',
// 'AI',
// 'PA',
// 'PR',
// 'PR1',
// 'PEA',
// 'PRCE',
// 'Project',
// 'manager',
// 'Data',
// 'Scientist',
// 'Décharge',
// "enseignement",
// 'Chargé',
// "étude",
// 'Directeur',
// 'projet',
// 'executif',
// 'Personnel',
// 'technique',
// 'Chef',
// 'Chercheur',
// 'Chercheure',
// 'confirmé',
