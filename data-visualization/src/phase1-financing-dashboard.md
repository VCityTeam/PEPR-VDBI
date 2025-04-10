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
  cropText,
} from "./components/utilities.js";
import {
  donutChart
} from "./components/pie-chart.js";
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
    // "project",
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

function default_x_plot_options(data, width, height) {
  return {
    width: width,
    height: height,
    marginTop: 50,
    marginLeft: 150,
    y: {
      label: "Description",
      tickRotate: 10,
      tickFormat: (d) => cropText(d, 25),
    },
    x: {
      grid: true,
      axis: "top",
      label: "Occurences",
    },
    marks: [
      Plot.barX(data, {
        y: (d) => d[0],
        x: (d) => d[1],
        fill: (d) => d[1],
        stroke: "black",
        strokeOpacity: 0.1,
        // sort: {y: "y"},
        sort: {y: "-x"},
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 25,
          textOverflow: "ellipsis-end"
        }
      }),
      Plot.barX(
        data, 
        Plot.pointerY({
          x: (d) => d[1],
          y: (d) => d[0],
          fill: "white",
          opacity: 0.5,
        }),
      ),
    ],
  }; 
};

function default_y_plot_options(data, width) {
  return {
    // width: width,
    height: 500,
    marginTop: 50,
    marginBottom: 50,
    x: {
      label: "Description",
      tickRotate: 10,
      tickFormat: (d) => cropText(d, 25),
    },
    y: {
      grid: true,
      // axis: "top",
      label: "Occurences",
    },
    marks: [
      Plot.barY(data, {
        y: (d) => d[1],
        x: (d) => d[0],
        fill: (d) => d[1],
        stroke: "black",
        strokeOpacity: 0.1,
        sort: {x: "y"},
        // sort: {x: "-x"},
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 25,
          textOverflow: "ellipsis-end"
        }
      }),
      Plot.barY(
        data, 
        Plot.pointerX({
          x: (d) => d[0],
          y: (d) => d[1],
          fill: "white",
          opacity: 0.5,
        }),
      ),
    ],
  }; 
};
```

<div class="warning" label="Data visualization notice">
  Data visualizations are unverified and errors may exist. Regard these data visualizations as estimations and not a "ground truth". Note the following:
  <ul>
    <li>Civil servant positions are CDIs.</li>
    <li>The defacto employer of non-civil servant positions is their partner institution.</li>
    <li>Some projects have listed the type of contract as the employer.</li>
    <li>Some post descriptions may be laboratory identifiers.</li>
    <li>Some post descriptions are missing.</li>
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

const all_description_count = d3.rollups(
  all_data.personnel,
  (D) => D.length,
  (d) => d.description,
).filter((d) => d[0]);

const all_type_count = d3.rollups(
  all_data.personnel,
  (D) => D.length,
  (d) => d.type,
).filter((d) => d[0]);

const all_employer_count = d3.rollups(
  all_data.personnel,
  (D) => D.length,
  (d) => d.employer,
).filter((d) => d[0]);

if (debug) {
  display(all_data);
  display(all_description_count);
  display(all_type_count);
  display(all_employer_count);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          all_data.personnel,
          {
            rows: default_personnel_table_config.rows,
            width: default_personnel_table_config.width,
            maxWidth: width,
            columns: [
              "project",
              "description",
              "type",
              "employer",
              "months",
              "cost",
              "assistance",
              "support",
              "total_cost",
            ],
            header: default_personnel_table_config.header,
            align: default_personnel_table_config.align,
            format: {
              total_cost: sparkbar(
                htl,
                d3.max(all_data.personnel, (d) => d.total_cost)
              ),
            }
          }
        ))//$
      }
    </div>
  </div>
</div>
<div class="grid grid-cols-2">
  <div class="card grid-rowspan-2">
    <h2>Proposed posts by post description</h2>
    <div style="overflow: auto;height: 1000px">
      ${
        resize((width) => Plot.plot(
          default_x_plot_options(all_description_count, width, 3000)
        ))//$
      }
    </div>
  </div>
  <div class="card">
    <h2>Proposed posts by contract type</h2>
    <div style="overflow: auto;">
      ${
        resize((width) => Plot.plot(
          default_y_plot_options(all_type_count, width)
        ))//$
      }
    </div>
  </div>
  <div class="card">
    <h2>Proposed posts by employer</h2>
    <div style="overflow: auto;height: 500px">
      ${
        resize((width) => Plot.plot(
          default_x_plot_options(all_employer_count, width, 2000)
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
const inteGREEN_data = resolveProjectFinancingEntities(inteGREEN_workbook, 'inteGREEN');
if (debug) {
  display(inteGREEN_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          inteGREEN_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          inteGREEN_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const VILLEGARDEN_data = resolveProjectFinancingEntities(VILLEGARDEN_workbook, 'VILLEGARDEN');
if (debug) {
  display(VILLEGARDEN_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VILLEGARDEN_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VILLEGARDEN_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const NEO_data = resolveProjectFinancingEntities(NEO_workbook, 'NEO');
if (debug) {
  display(NEO_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          NEO_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          NEO_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const RESILIENCE_data = resolveProjectFinancingEntities(RESILIENCE_workbook, 'RESILIENCE');
if (debug) {
  display(RESILIENCE_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          RESILIENCE_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          RESILIENCE_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const TRACES_data = resolveProjectFinancingEntities(TRACES_workbook, 'TRACES');
if (debug) {
  display(TRACES_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          TRACES_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          TRACES_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const URBHEALTH_data = resolveProjectFinancingEntities(URBHEALTH_workbook, 'URBHEALTH');
if (debug) {
  display(URBHEALTH_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          URBHEALTH_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          URBHEALTH_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const VFpp_data = resolveProjectFinancingEntities(VFpp_workbook, 'VF++');
if (debug) {
  display(VFpp_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VFpp_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          VFpp_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
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
const WHAOU_data = resolveProjectFinancingEntities(WHAOU_workbook, 'WHAOU');
if (debug) {
  display(WHAOU_data);
}
```

<div class="grid grid-cols-2">
  <!-- <div class="card">
    <h2></h2>
    <span class="big">${financed_project_count.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card grid-colspan-2 grid-rowspan-2">
    <h2>Identified project personnel</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          WHAOU_data.personnel,
          {
            ...default_personnel_table_config,
            ...{
              maxWidth: width,
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
  <div class="card grid-colspan-2">
    <h2>Identified project partners</h2>
    <div>
      ${
        resize((width) => Inputs.table(
          WHAOU_data.partners,
          {
            ...default_partner_table_config,
            ...{
              width: width,
            }
          }
        ))//$
      }
    </div>
  </div>
</div>
