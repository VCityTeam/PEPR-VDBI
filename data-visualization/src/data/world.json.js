// code modified from https://observablehq.com/framework/getting-started

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}

const esr_response = await fetchJson(`https://static.observableusercontent.com/files/26fc08875c617b59939afa42f6f1e1bf5e75f11dcc2e482d963b6e4128f0250d708f983050a43862ae73d016bc328d1f3f40bc0df709d5dd310f789f334c0ee8?response-content-disposition=attachment%3Bfilename*%3DUTF-8%27%27countries-110m.json`);

process.stdout.write(JSON.stringify(esr_response));
