import { merge } from 'npm:d3';
import { formatIfString } from './utilities.js';

/**
 * Format known project entities from the Financing sheet
 *
 * @param {Array<Object>} workbook - The workbook to extract
 * @returns {Array<Object.<Array>} Formatted sheet data
 */
export function resolveProjectFinancingEntities(workbook) {
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
      partner.name
    );

    // personnel with a financing request
    const personnel_request = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B64:I75',
        headers: false,
      }),
      false,
      partner.name
    );

    // civil servant personnel
    const personnel_public = mapPersonnelFinancingEntities(
      workbook.sheet(workbook.sheetNames[index], {
        range: 'B80:I103',
        headers: false,
      }),
      true,
      partner.name
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
 * @returns {Array<Object.<Array>} Formatted personnel data
 */
function mapPersonnelFinancingEntities(
  data,
  fonctionnaire,
  default_employer = null
) {
  const mapped_data = data.map((d) => {
    const person = {
      // description: formatIfString(d['B']), // description of role
      description: anonymizeDescription(d['B']), // description of role
      type: formatIfString(d['D']), // type of contract
      employer: formatIfString(d['D']), // name of employer (instutution)
      months: formatIfString(d['F']), // contract length by number of months
      cost: formatIfString(d['E']), // unitary cost
      assistance: formatIfString(d['H']), // additional requested financing
      support: formatIfString(d['I']), // support cost
      total_cost: formatIfString(d['G']), // total cost
    };
    if (fonctionnaire) {
      person.type = 'CDI';
    } else {
      person.employer = default_employer;
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
    'IE',
    'IEES',
    'IR',
    'IRHC',
    'DOCTORANT',
    'POSTDOC',
    'POST-DOC',
    'DR1',
    'DR2',
    'CR',
    'CRCN',
    'CRHC',
    'HC',
    'MCF',
    'STAGE',
    'M2',
    'AI',
    'IPEF',
    'PA',
    'PR',
    'PR1',
    'PRCE',
  ];
  const tokens = description.trim().split(' ');
  const anonymized_tokens = tokens.filter((token) =>
    known_tokens.includes(token.toUpperCase())
  );
  return anonymized_tokens.join(' ');
}
