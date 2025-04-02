---
title: Initial import test
theme: light
---

# Import and visualize Geospatial ESR Open Data

Import and visualize ORCIDs using their [API](https://info.orcid.org/documentation/api-tutorials/api-tutorial-searching-the-orcid-registry/)

## Integration process

```mermaid
---
config:
  theme: default
---
flowchart TD
  A(( )) --> B("Extract Researcher name (first, last) from excel")
  B --> C(Fetch related ORCID for each researcher)
  C --> D(Store ORCIDs in CSV file)
  D --> E((( )))
```

# Visualization results

```js
import { searchOrcid } from "./components/orcid.js" 

// const access_token_reponse = FileAttachment(
//   "./data/fetch-orcid-access-token.json"
// ).json();
```

```js echo
// display(access_token_reponse);
const response = await searchOrcid(
  "vinasco",
  // access_token_reponse.access_token,
  "38be4302-f5de-4e69-9e51-44df3ab2f1c2",
);
```

```js
display(response);
```
