# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is an [Observable Framework](https://observablehq.com/framework) project that builds data-visualization
dashboards and reports for PEPR VDBI (Programmes et Équipements Prioritaires de Recherche - Ville Durable et
Bâtiment Innovant), a French research program. Pages are Markdown files with embedded JS/SQL that render D3 /
Observable Plot charts against data produced by build-time data loaders.

## Commands

```bash
npm i && uv sync && source .venv/bin/activate   # install JS + Python deps (first time / after pulling)
npm run dev                                      # start local preview server at http://localhost:3000
npm run build                                    # build static site to ./dist
npm run build-jsdoc                              # generate JS docs for src/components into jsdoc/
npm run refresh                                   # clear only the data loader cache (src/.observablehq/cache/data)
npm run clean                                    # nuke dist, .venv, node_modules, and the loader cache
npx eslint .                                     # lint JS (eslint.config.js: recommended rules + browser globals)
```

There is no JS/Python test suite in this repo. "Testing" a change means running `npm run dev` and visually
checking the affected dashboard page, or running an individual data loader directly (see below).

Data loaders are cached by Observable Framework; after editing a loader's _source data_ (not the loader script
itself), run `npm run refresh` or delete the relevant file under `src/.observablehq/cache/data/` to force
regeneration.

## Architecture

### Pages and routing

`src/` is the Framework source root (set via `root: 'src'` in `observablehq.config.ts`). Every `.md` file under
`src/pages/` is a routed page; the sidebar structure (Dashboards / Data Visualisation Tools / Reports / Under
Construction / D3-Plot-Framework Tests) is defined explicitly in `observablehq.config.ts`, not inferred from the
filesystem. When adding a new page, add it to the `pages` array in `observablehq.config.ts` or it won't appear in
the sidebar.

Pages declare their data dependencies in YAML frontmatter under a `sql:` key, mapping a SQL table alias to a
data file path (loaded into an in-page DuckDB instance, e.g. `await sql\`select ... from table_alias\``). See
`src/pages/dashboards/phase1-map-dashboard.md`for the pattern. Heavier page logic sometimes lives in a sibling`.js`file imported by the`.md`(e.g.`aap-overview.md`+`aap-overview.js`).

### Data loaders (`src/data/`)

Observable Framework data loaders: any file shaped `<output-name>.<ext>.<loader-ext>` is executed at build/preview
time and its stdout becomes the static file `<output-name>.<ext>` served to pages. Three loader languages are
used in this repo:

- `*.js` — Node scripts (ESM, `import`/`await`), e.g. read a JSON workbook and emit TSV via `d3-dsv`.
- `*.py` — Python scripts run through the project's `uv`-managed venv; shared helpers live in
  `src/data/utilities/` (`io_utils.py`, `siret_api.py`, `text_mining.py`, `cortext.py`, etc.). Most just call
  `extractSheet()` from `io_utils.py` to pull a sheet out of a private Excel workbook and print CSV to stdout.
- `*.sh` — thin `curl` wrappers for fetching static external geo/data files (e.g. `world.json.sh`,
  `france_regions.json.sh`).

Loaders that need API credentials (currently ORCiD) read them from a `.env` file in `src/data/`
(`CLIENT_ID`/`CLIENT_SECRET`) — see `fetch-orcid-access-token.json.sh`. Some Python loaders write progress logs
to `<name>.log` via `initDefaultLogger()`; these log files are checked into the repo working tree (not gitignored)
and can be large.

**`src/data/private/`** holds source spreadsheets/CSVs (consortium data, partner lists, project workbooks) that
are not distributed with the repo and are required by many loaders. Claude Code is configured to deny reading
this directory (and `.env*`) — see `.claude/settings.json`. If a loader fails because a private input file is
missing, that's expected in this environment; don't try to work around the restriction, ask the user instead.

### Components (`src/components/`)

Shared JS modules imported by pages via `/components/<name>.js`. Organized by chart/visualization type rather
than by page — `graph.js` (force-directed/property graphs, largest module), `projection-map.js` (D3 geo
projections + choropleth marks for France/Italy/IDF region presets), `sankey.js`, `chord.js`, `pie-chart.js`,
`bubble-chart.js`, `radial-dendrogram.js`, `zoomable-sunburst.js`, `cloud.js` (word clouds), `cnu.js`,
`financing.js`, `color.js` (shared color scales, e.g. `vdbi_color_scheme`, `project_color_scale`), `legend.js`,
`geocoding.js`, `orcid.js`, `timeline.js`. `utilities.js` holds generic data-shaping/export helpers
(`countEntities`, `sparkbar`, `downloadTableButton`, `downloadSVGButton`, `writeToFile`, etc.) reused across many
pages. Functions use JSDoc comments; `npm run build-jsdoc` renders these into `jsdoc/`.

`force-layout-simulation-worker.js` is a Web Worker used to offload force-simulation layout computation from
graph visualizations.

### Two project phases

Data and dashboards are split by program phase — `phase1-*` and `phase2-*` data loaders/files mirror each other
(projects, researchers, laboratories, institutions, socioeconomic partners, breakdowns by discipline/CNU/keyword).
When editing one phase's loader or dashboard, check whether the equivalent phase has the same file and likely
needs a matching change.

## Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Use Prettier for code formatting (see .prettierrc)
- Use ESLint for code linting (see .eslintrc.js)
