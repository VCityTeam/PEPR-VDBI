---
toc: false
theme: light
---

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 2rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>

<div class="hero">
  <h1>PEPR VDBI Dashboards</h1>
  <h2>
    Welcome to the data visualization tests for PEPR Ville Durable & Bâtiment Innovant
    project! Use the menu on the left to explore each Dashboard. Edit&nbsp;
    <code style="font-size: 90%;">docs/index.md</code> to change this page.
  </h2>
  <a href="https://github.com/VCityTeam/PEPR-VDBI" target="_blank">
    Github<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span>
  </a>
</div>

## Context

Here is an overview of what data is visualized and the mechanisms for used for data visualization.

```mermaid
---
title: Current data integration workflow
config:
  theme: default
---
flowchart LR
  Start(( )) -.-> ZZ(Phase 1 start)
  ZZ -.-> Call(Call for projects)
  F[(Open data sources)] -->|Data fusion| DB
  DA -->|Anonymization and editorialization| AC(Analysis Communication)
  Call -.-> DA(Data analysis)
  DA -.-> AC
  AC -.-> End((( )))
  AC -.-> P(Phase n start)
  P -.-> Call
  Call -->|Store responses| DC
  DC -->|Data extraction| DB
  DB -->|Data cleaning| DB
  DB --> DA
  DA --> DB
  DC --> DA

  subgraph PEPR VDBI Nextcloud storage
    DC@{ shape: docs, label: "Document Corpus"}
    DB@{ shape: doc, label: "Spreadsheet"}
  end

  subgraph Legend
    a(( )) -.->|activity flow| b(( ))
    a(( )) -->|data flow| b(( ))
  end
```
