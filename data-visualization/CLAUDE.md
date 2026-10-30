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
npm run jsdoc                                    # generate JS docs for src/components into jsdoc/
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
- `*.sh` — thin `curl` wrappers for fetching static external geo/data files (e.g. `france_regions.json.sh`).

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
`financing.js`, `color.js` (shared color scales, e.g. `vdbi_color_scale_diverging`, `project_color_scale`), `legend.js`,
`geocoding.js`, `orcid.js`, `timeline.js`. `utilities.js` holds generic data-shaping/export helpers
(`countEntities`, `sparkbar`, `downloadTableButton`, `downloadSVGButton`, `writeToFile`, etc.) reused across many
pages. Functions use JSDoc comments; `npm run jsdoc` renders these into `jsdoc/`.

`force-layout-simulation-worker.js` is a Web Worker used to offload force-simulation layout computation from
graph visualizations.

### Two project phases

Data and dashboards are split by program phase — `phase1-*` and `phase2-*` data loaders/files mirror each other
(projects, researchers, laboratories, institutions, socioeconomic partners, breakdowns by discipline/CNU/keyword).
When editing one phase's loader or dashboard, check whether the equivalent phase has the same file and likely
needs a matching change.

## Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Use Prettier for code and markdown formatting (see .prettierrc)
- Use ESLint for code linting (see .eslintrc.js)
- Components must not import functions from one another (e.g. `radial-dendrogram.js` importing from
  `chord.js`). A function used by more than one component goes in `src/components/utilities.js`, and a
  JS function shared by several data loaders goes in `src/data/utilities/data_utilities.js`.

### Signatures for Plot wrapper functions

Functions that wrap an Observable Plot visualisation take a fixed 2- or 3-parameter signature rather than
listing every tunable in the signature:

```js
chart = (data, options = {}, accessors = {}) => Plot.plot({ /* defaults */, ...options })
```

1. `data` — the rows to plot.
2. `options` — Plot.plot options, **spread last** inside `Plot.plot({...})` so a caller can override any
   default (`width`, `height`, margins, scales) without the wrapper having to declare it.
3. `accessors` — the destructured channel accessors (`x_accessor`, `fill_accessor`, `sort`, …) that the
   wrapper reads when building its marks. Omit this parameter when a chart has no accessors to override.

Give every object parameter a `= {}` default, so the wrapper is callable with `data` alone.

This keeps wrappers overloadable: a preset wraps another wrapper by overriding only what it changes and
spreading the caller's arguments after its own defaults, so the caller still wins:

```js
chart_by_erc = (data, options = {}, accessors = {}) =>
  chart(
    data,
    { color: erc_color_config, ...options },
    { fill_accessor: ercOf, ...accessors },
  )
```

Two things to watch:

- Keep accessors in the `accessors` parameter, not in `options`. Plot silently ignores unknown keys in
  `Plot.plot({...})`, so an accessor passed in `options` is dropped without any error.
- A `color: {type: 'categorical'}` scale with no `domain`/`range` is an _ordinal_ scale: Plot treats whatever
  the fill channel returns as a category label and assigns its own scheme colors. To get project colors, have
  the fill accessor return the category **name** and pin the scale's `domain`/`range` to the intended palette
  (see `erc_color_config` in `src/pages/researchers/aap-disciplines.js`); returning a color string from the
  accessor does not make Plot use it.

### Structure of dashboard pages (`.md`)

Observable Framework pages follow a consistent top-to-bottom order so they stay readable and the syntax
highlighting holds up:

1. **Top of the document**: the `sql:` frontmatter, all `import`s, and every data load / query. Data is
   loaded once, up front, not next to the chart that happens to need it.
2. Datasets loaded in JS code blocks should be loaded in their own block - This avoids extraneous dataloader
   calls on code updates or data cache changes.
3. **Then, per section or subsection**: the HTML structure comes _first_, and the JS code blocks it
   references come _after_ it. The only thing an HTML block may reference ahead of its definition is data,
   which the top of the page has already loaded.
4. Keep the JS inside the HTML structure minimal — ideally a single call such as
   `${resize((width) => charts.someChart(data, { width }))}`. Push real logic into a JS block below the
   section, or into a sibling `.js` module (e.g. `aap-overview.md` + `aap-overview.js`). Interpolating long
   expressions into markup hurts readability and breaks editor syntax highlighting.

### Structure of tool pages (`src/pages/tools/`)

Data visualisation tools turn a file uploaded by the user into a downloadable chart. On top of the
dashboard page rules above, they follow this order (see `src/pages/tools/radial-dendrogram.md`):

1. **Documentation of the input data**: what the tool expects (file type, how columns and rows are
   read) and what it produces, ideally with a small example file in a `csv` code block.
2. **File upload and data preview**: an `Inputs.file` input in its own block, the parsed data in a
   separate block, then an `Inputs.table` preview of it.
3. **User parameters**, split into exactly two `Inputs.form`s laid out with `formTemplate()` and
   displayed together in a single `div.card`:
   - a **data-dependent** form, for parameters whose options or defaults are derived from the uploaded
     file (e.g. a root name taken from the file name, a range bounded by the column count). It is
     rebuilt, and so reset, whenever another file is loaded.
   - a **data-independent** form, for parameters that do not reference the data (styling, sizes,
     margins, sort order, …). It keeps its values when another file is loaded.

   Read each form's value with `Generators.input(form)` in its own block. Avoid standalone inputs and
   inputs whose options depend on another parameter of the same form: Observable cannot make a form
   depend on its own value, so prefer a simpler parameter (e.g. derive levels from the column order of
   the file rather than adding a select per level).

4. **Chart/diagram view** in its own `div.card` with an id, followed by a download button (e.g.
   `downloadSVGButton('#<id> svg', …)`).
5. **Optional data views**, under a `## Data view` heading, displaying intermediate transformations
   of the data (e.g. a table of tree nodes) as `Inputs.table`s to help debug them.
