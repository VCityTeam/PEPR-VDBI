/**
 * Query the public ORCID search API and return the parsed JSON results
 *
 * @param {string} query - the ORCID search query string
 * @param {string} token - an ORCID API access token (currently unused, see source)
 * @param {string[]} [fields] - the ORCID profile fields to request (currently unused, see source)
 * @returns {Promise<Object>} a promise resolving to the parsed JSON response
 */
export async function searchOrcid(
  query,
  token,
  fields = [
    'orcid',
    'email',
    'given-names',
    'family-name',
    'given-and-family-names',
    'credit-name',
    'other-name',
    'current-institution-affiliation-name',
    'past-institution-affiliation-name',
  ]
) {
  const url = `https://pub.orcid.org/v3.0/search/?q=${query}`;
  // const url = "https://api.orcid.org/v3.0/csv-search/";
  // const data = {
  //   q: query,
  //   fl: fields.join(","),
  // };
  let options = {
    method: 'GET',
    mode: 'cors',
    headers: {
      // "Content-Type": "text/csv",
      Accept: 'application/json',
      // Authorization: `Bearer ${token}`,
      // 'Access-Control-Allow-Origin': '*',
    },
    // body: JSON.stringify(data),
  };

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}
