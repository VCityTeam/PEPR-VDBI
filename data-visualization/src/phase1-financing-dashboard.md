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

```js
const project_data = resolveProjectFinancingEntities(workbook1);
const project_table_config = {
  rows: 9,
  columns: [
    "description",
    "type",
    "employer",
    "months",
    "assistance",
    "support",
    "cost",
  ],
  header: {
    "description": "Personnel description",
    "type": "Contract type",
    "employer": "Employer",
    "months": "Contract length (months)",
    "cost": "Total cost",
    "assistance": "Requested financial assistance",
    "support": "Support cost",
  },
  width: {
    description: 250,
  },
  align: {
    description: "right",
    months: "left",
    cost: "left",
    assistance: "left",
    support: "left",
  },
  format: {
    // cost: sparkbar(d3.max(project_data.personnel, (d) => d.cost)),
  },
};
```

```js
if (debug) {
  display(project_data);
}
```

## inteGREEN
<div class="grid grid-cols-4">
  <div class="card grid-colspan-4">
    <!-- <div>${project_search_input}</div>
    <div>${project_auditioned_input}</div>
    <div>${project_financed_input}</div>
    <div>${project_note_input}</div>
    <div>${project_defi_input}</div> -->
    <div>
      ${
        resize((width) => Inputs.table(
          project_data.personnel,
          project_table_config
        ))//$
      }
    </div>
  </div>
</div>
