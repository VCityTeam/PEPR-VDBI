async function searchOrcid(
  query,
  token,
  fields = [
    "orcid",
    "email",
    "given-names",
    "family-name",
    "given-and-family-names",
    "credit-name",
    "other-name",
    "current-institution-affiliation-name",
    "past-institution-affiliation-name",
  ]
) {
  const url = "https://api.orcid.org/v3.0/csv-search/";
  let data = {
    q: query,
    fl: fields.join(","),
  };
  let options = {
    method: "GET",
    headers: {
      "Content-Type": "text/csv",
      "Authorization type": "Bearer",
      "Access token": token,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}
