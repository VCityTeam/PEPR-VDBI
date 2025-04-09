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
const workbook1 = FileAttachment(
  "./data/private/inteGREEN_France2030_aap_pepr_vdbi_2023_AnnexeFinanciere.xlsx"
).xlsx();
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist. Regard these data visualizations as estimations and not a "ground truth". Note the following assumtions:
  <ul>
    <li>Civil servant positions are CDIs.</li>
    <li>The defacto employer of non-civil servant positions is their partner institution.</li>
  </ul>
</div>

## inteGREEN

```js
const integreen_project_data = resolveProjectFinancingEntities(workbook1);

const integreen_project_table_config = {
  rows: 15,
  columns: [
    "description",
    "type",
    "employer",
    "months",
    "assistance",
    "support",
    "cost",
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
  width: {
    description: 200,
    total_cost: 250,
  },
  align: {
    // description: "right",
    // months: "left",
    total_cost: "left",
    // assistance: "left",
    // support: "left",
  },
  format: {
    support: (d) => {return d != null ? d : 0},
    total_cost: sparkbar(htl, d3.max(integreen_project_data.personnel, (d) => d.total_cost)),
  },
};
```

```js
if (debug) {
  display(integreen_project_data);
}
```

<div class="grid grid-cols-4">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-4">
    <!-- <div>${project_search_input}</div>
    <div>${project_auditioned_input}</div>
    <div>${project_financed_input}</div>
    <div>${project_note_input}</div>
    <div>${project_defi_input}</div> -->
    <div>
      ${
        resize((width) => Inputs.table(
          integreen_project_data.personnel,
          integreen_project_table_config
        ))//$
      }
    </div>
  </div>
</div>
