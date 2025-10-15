---
style: /css/vdbi-page.css
---

# Phase 1 Data

<div class="warning">
  There are known data quality errors in the workbook.
  This page is largely for debugging purposes only.
</div>

```js
import { downloadTableButton } from "/components/utilities.js"
import {
  extractPhase1Workbook,
  getColumnOptions,
  filterOnInput,
} from "/components/phase1-workbook.js"
```

```js
const workbook = FileAttachment(
  "/data/private/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
).xlsx()
```

```js echo
const phase_1_data = extractPhase1Workbook(workbook, false)
display(phase_1_data)
```

<div class="card">
  <h2>Projects</h2>
  <div>
    ${Inputs.table(phase_1_data.projects, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.projects)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Project universities</h2>
  <div>
    ${Inputs.table(phase_1_data.universities_by_project, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.universities_by_project)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Project Laboratories</h2>
  <div>
    ${Inputs.table(phase_1_data.laboratories_by_project, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.laboratories_by_project)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratories</h2>
  <div>
    ${Inputs.table(phase_1_data.laboratories, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.laboratories)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory ERC disciplines</h2>
  <div>
    ${Inputs.table(phase_1_data.laboratories_by_disciplines_erc, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.laboratories_by_disciplines_erc)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Laboratory HCERES disciplines</h2>
  <div>
    ${Inputs.table(phase_1_data.laboratories_by_disciplines_hceres, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.laboratories_by_disciplines_hceres)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Universities</h2>
  <div>
    ${Inputs.table(phase_1_data.universities, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.universities)}
  <!-- $ -->
</div>
<div class="card">
  <h2>Researchers</h2>
  <div>
    ${Inputs.table(phase_1_data.researchers, {
      layout: "auto",
    })}
    <!-- $ -->
  </div>
  </br>
  ${downloadTableButton(() => phase_1_data.researchers)}
  <!-- $ -->
</div>
