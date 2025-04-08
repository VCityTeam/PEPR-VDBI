import { merge } from 'npm:d3';

/**
 * Format known project entities from the Financing sheet
 *
 * @param {Array<Object>} workbook - The workbook to extract
 * @returns {Array<Object.<Array>} Formatted sheet data
 */
export function resolveProjectFinancingEntities(
  workbook,
) {
  const personnel = [];
  const partners = [];

  // iterate over partner sheets
  for (let index = 3; index < workbook.sheetNames.length; index++) {
    // partner
    const partner = mapPartnerFinancingEntities(workbook.sheet(workbook.sheetNames[index], {
      range: 'D7:D10',
      headers: false,
    }));

    // personnel without a financing request
    const personnel_no_request = mapPersonnelFinancingEntities(workbook.sheet(workbook.sheetNames[index], {
      range: 'B50:I61',
      headers: false,
    }));
    personnel_no_request.map((person) => {
      if (!person.employer) {
        person.employer = partner.name;
      }
    });

    // personnel with a financing request
    const personnel_request = mapPersonnelFinancingEntities(workbook.sheet(workbook.sheetNames[index], {
      range: 'B64:I75',
      headers: false,
    }));
    personnel_request.map((person) => {
      if (!person.employer) {
        person.employer = partner.name;
      }
    });

    // personnel without a financing request
    const personnel_public = mapPersonnelFinancingEntities(workbook.sheet(workbook.sheetNames[index], {
      range: 'B80:I103',
      headers: false,
    }));
    personnel_public.map((person) => {
      if (!person.employer) {
        person.employer = partner.name;
      }
    });

    // aggregate data
    if (
      partner.complete_name ||
      partner.name ||
      partner.type ||
      partner.siret
    ) {
      partners.push(partner);
    };
    merge([
      personnel_request,
      personnel_no_request,
      personnel_public
    ]).forEach(person => {
      personnel.push(person);
    });
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
) {
  const mapped_data = data.map((d) => {
    return {
      description: d['B'] ? d['B'] : null, // description of role
      type: d['D'] && !fonctionnaire ? d['D'] : null, // type of contract
      employer: d['D'] && fonctionnaire ? d['D'] : null, // name of employer (instutution)
      months: d['F'] ? d['F'] : null, // contract length by number of months
      cost: d['E'] ? d['E'] : null, // total cost
      assistance: d['F'] ? d['F'] : null, // additional requested financing
      support: d['F'] ? d['F'] : null, // support cost
    };
  });

  // filter out empty values
  return mapped_data.filter(({
    description,
    months,
    cost,
    assistance,
    support
  }) => description || months || cost || assistance || support);
}

/**
 * Map known personnel financing entities
 *
 * @param {Array<Object>} data - A table
 * @returns {Array<Object.<Array>} Formatted personnel data
 */
function mapPartnerFinancingEntities(
  data,
) {
  return {
    complete_name: data[0]['D'] ? data[0]['D'] : null, // complete name
    name: data[1]['D'] ? data[1]['D'] : null, // short name
    type: data[2]['D'] ? data[2]['D'] : null, // partner type
    siret: data[3]['D'] ? data[3]['D'] : null, // partner SIRET
  };
}
