---
toc: false
style: /css/vdbi-page.css
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
title: Veille data integration and analysis workflow
config:
  theme: default
---
stateDiagram-v2

  direction LR

  [*] --> ZZ
  ZZ --> Call
  Call --> DI
  DI --> DA
  DA --> AA
  AA --> AC
  AC --> [*]
  AC --> P
  P --> Call

  ZZ : Phase 1 start
  Call : Call for projects
  DI : Data integration
  DA : Data analysis
  AA : Analysis Anonymisation
  AC : Analysis Communication
  P : Phase n+1 start
```

```mermaid
---
title: Veille data integration sequence
config:
  theme: default
---
sequenceDiagram

  %% call->>PDFs: Store responses
  %% PDFs->>sheets: Data extraction
  %% sheets->>app: Data import
  %% app->>app: Data cleaning
  %% app->>open: API call
  %% open->>app: Data fusion
  %% app->>sheets: Data update

  %% participant call as Calls for project
  %% participant app as Observable App
  %% participant open@{ "type": "database"} as Open Data Sources

  %% box Nextcloud Document Corpus
  %%   participant PDFs@{ "type": "collections"}
  %%   participant sheets@{ "type": "collections"} as Spreadsheets
  %% end

  call->>PDFs: Store responses
  PDFs->>sh: Data extraction
  sh->>gr: Data import
  gr->>gr: Data cleaning
  gr->>open: API call
  open->>gr: Data fusion
  gr->>sh: Data update
  app->>gr: API call
  gr->>app: Data import
  app->>app: (Visualisation-specific) Data treatment

  participant call as Calls for project
  participant app as Observable App
  participant open as Open Data Sources
  participant gr as Grist

  box Nextcloud Document Corpus
    participant PDFs
    participant sh as Spreadsheets
  end
```
