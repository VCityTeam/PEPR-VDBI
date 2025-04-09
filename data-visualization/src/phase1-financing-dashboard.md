---
title: Phase 1 Financing Dashboard
theme: [dashboard, light]
---

# Phase 1 Proposed Financing

```js
import {
  resolveProjectFinancingEntities,
} from "./components/financing.js";
import {
  sparkbar,
  countEntities,
} from "./components/utilities.js";
```

```js
const debug = true;

const default_personnel_table_config = {
  rows: 30,
  width: {
    // description: 200,
    total_cost: 250,
  },
  columns: [
    "description",
    "type",
    "employer",
    "months",
    "cost",
    "assistance",
    "support",
    "total_cost",
  ],
  header: {
    "description": "Post description",
    "type": "Contract type",
    "employer": "Employer",
    "months": "Contract length (months)",
    "cost": "Unitary cost",
    "assistance": "Financial assistance requested",
    "support": "Support cost",
    "total_cost": "Total cost",
  },
  align: {
    total_cost: "left",
  },
};

const default_partner_table_config = {
  header: {
    "complete_name": "Complete name",
    "name": "Name",
    "type": "Type",
    "siret": "SIRET",
  },
};
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist. Regard these data visualizations as estimations and not a "ground truth". Note the following assumtions:
  <ul>
    <li>Civil servant positions are CDIs.</li>
    <li>The defacto employer of non-civil servant positions is their partner institution.</li>
  </ul>
</div>

## All Financed Projects

```js
const all_data = {
  personnel: d3.merge([
    inteGREEN_data.personnel,
    VILLEGARDEN_data.personnel,
    NEO_data.personnel,
    RESILIENCE_data.personnel,
    TRACES_data.personnel,
    URBHEALTH_data.personnel,
    VFpp_data.personnel,
    WHAOU_data.personnel,
  ]),
  partners: d3.groups(
    d3.merge([
      inteGREEN_data.partners,
      VILLEGARDEN_data.partners,
      NEO_data.partners,
      RESILIENCE_data.partners,
      TRACES_data.partners,
      URBHEALTH_data.partners,
      VFpp_data.partners,
      WHAOU_data.partners,
    ]),
    (d) => d.siret
  ).map((D) => D[1][0]),
}
if (debug) {
  display(all_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          all_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(all_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          all_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## inteGREEN

```js
const inteGREEN_workbook = FileAttachment(
  "./data/private/inteGREEN_France2030_aap_pepr_vdbi_2023_AnnexeFinanciere.xlsx"
).xlsx();
```

```js
const inteGREEN_data = resolveProjectFinancingEntities(inteGREEN_workbook);
if (debug) {
  display(inteGREEN_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          inteGREEN_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(inteGREEN_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          inteGREEN_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## VILLEGARDEN

```js
const VILLEGARDEN_workbook = FileAttachment(
  "./data/private/France2030_aap_pepr_vdbi_2023_AnnexeFinanciere_VILLEGARDEN_07_02_2024.xlsx"
).xlsx();
```

```js
const VILLEGARDEN_data = resolveProjectFinancingEntities(VILLEGARDEN_workbook);
if (debug) {
  display(VILLEGARDEN_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VILLEGARDEN_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(VILLEGARDEN_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VILLEGARDEN_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## NEO

```js
const NEO_workbook = FileAttachment(
  "./data/private/NEO_AnnexeFinanciere_totale_finale.xlsx"
).xlsx();
```

```js
const NEO_data = resolveProjectFinancingEntities(NEO_workbook);
if (debug) {
  display(NEO_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          NEO_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(NEO_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          NEO_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## RESILIENCE

```js
const RESILIENCE_workbook = FileAttachment(
  "./data/private/PEPR_RESILIENCE_07022024.xlsx"
).xlsx();
```

```js
const RESILIENCE_data = resolveProjectFinancingEntities(RESILIENCE_workbook);
if (debug) {
  display(RESILIENCE_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          RESILIENCE_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(RESILIENCE_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          RESILIENCE_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## TRACES

```js
const TRACES_workbook = FileAttachment(
  "./data/private/France2030_aap_pepr_vdbi_2023_AnnexeFinanciere_TRACES.xlsx"
).xlsx();
```

```js
const TRACES_data = resolveProjectFinancingEntities(TRACES_workbook);
if (debug) {
  display(TRACES_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          TRACES_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(TRACES_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          TRACES_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## URBHEALTH

```js
const URBHEALTH_workbook = FileAttachment(
  "./data/private/France2030_aap_pepr_vdbi_2023_AnnexeFinanciere_URBHEALTH_2024_02_05.xlsx"
).xlsx();
```

```js
const URBHEALTH_data = resolveProjectFinancingEntities(URBHEALTH_workbook);
if (debug) {
  display(URBHEALTH_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          URBHEALTH_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(URBHEALTH_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          URBHEALTH_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## VF++

```js
const VFpp_workbook = FileAttachment(
  "./data/private/VF2PLUS_France2030_aap_pepr_vdbi_2023_AnnexeFinanciere_global.xlsx"
).xlsx();
```

```js
const VFpp_data = resolveProjectFinancingEntities(VFpp_workbook);
if (debug) {
  display(VFpp_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VFpp_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(VFpp_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VFpp_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>

## WHAOU

```js
const WHAOU_workbook = FileAttachment(
  "./data/private/WHAOU_PEPR_VDBI_AnnexeFinanciere.xlsx"
).xlsx();
```

```js
const WHAOU_data = resolveProjectFinancingEntities(WHAOU_workbook);
if (debug) {
  display(WHAOU_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          WHAOU_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              format: {
                total_cost: sparkbar(
                  htl,
                  d3.max(WHAOU_data.personnel, (d) => d.total_cost)
                ),
              }
            }
          }
        ))//$
      }
    </div>
  </div>
  <div class="card grid-colspan-4">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          WHAOU_data.partners,
          default_partner_table_config
        ))//$
      }
    </div>
  </div>
</div>
