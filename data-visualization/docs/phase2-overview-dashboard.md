---
title: Phase 2 Overview Dashboard
theme: dashboard
---

# PEPR Projects Overview

```js
import {
  countEntities,
} from "./components/utilities.js";
import {
  getGeneraliteSheet,
  getChercheurSheet,
  getLaboSheet,
  getEtablissementSheet,
  resolveGeneraliteEntities,
  resolveChercheursEntities,
  resolveLaboratoireEntities,
  resolveEtablissementEntities,
  getColumnOptions,
  filterOnInput,
} from "./components/phase2-dashboard.js";
```

```js
const workbook1 = FileAttachment(
  "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
).xlsx();
```

```js
const anonymize = false;
const anonymizeDict = new Map();
const project_data = resolveGeneraliteEntities(
  getGeneraliteSheet(workbook1),
  anonymize,
  anonymizeDict
);
// resolveGeneraliteEntities -> @return:
// {
//    acronyme: string,
//    auditionne: boolean,
//    finance: boolean,
//    budget: string,
//    note: string,
//    defi: string,
//    nom_fr: string,
//    nom_en: string,
//    etablissements: [],
//    etablissements_count: number
//    laboratoires: [],
//    laboratoires_count: number
//    partenaires: [],
//    partenaires_count: number
//    action: string,
//    comment: string,
//    pourquoi: string,
//    notes: string
// }
const researcher_data = resolveChercheursEntities(
  getChercheurSheet(workbook1),
  anonymize,
  anonymizeDict
);
const laboratory_data = resolveLaboratoireEntities(
  getLaboSheet(workbook1),
  anonymize,
  anonymizeDict
);
const university_data = resolveEtablissementEntities(
  getEtablissementSheet(workbook1),
  anonymize,
  anonymizeDict
);
// display(project_data);
// display(researcher_data);
// display(laboratory_data);
// display(university_data);
```

```js
const auditioned_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.auditionne ? 1 : 0),
  0
);
const financed_project_count = d3.reduce(
  project_data,
  (p, v) => p + (v.finance ? 1 : 0),
  0
);

const partner_count = countEntities(project_data, (d) => d.partenaires);
// display(partner_count);
const total_partner_count = d3.reduce(partner_count, (p, v) => p + v.count, 0);
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Project count (Total / Auditioned / Financed)</h2>
    <span class="big">${project_data.length.toLocaleString("en-US")} / 
    ${auditioned_project_count.toLocaleString("en-US")} / 
    ${financed_project_count.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>University count</h2>
    <span class="big">${university_data.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Laboratory count</h2>
    <span class="big">${laboratory_data.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Partner count</h2>
    <span class="big">${total_partner_count.toLocaleString("en-US")}</span>
  </div>
</div>
