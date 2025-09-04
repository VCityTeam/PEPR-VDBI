# Data Visualization

This is an [Observable Framework](https://observablehq.com/framework) project.
Before running, you must have the following prerequisites installed:

- [node.js](https://nodejs.org/)
- [python](https://www.python.org/)
- [UV](https://docs.astral.sh/uv/) for managing python dependencies

After installing the prerequisites, install the required npm and python libraries:

```bash
npm i
uv sync
source .venv/bin/activate
```

To start the local preview server, run:

```bash
npm run dev
```

Then visit <http://localhost:3000> to preview the project.

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

```ini
.
├─ src
│  ├─ components               # js scripts
│  ├─ data                     # data loaders and static data files
│  ├─ *.md                     # site pages
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.ts      # the project config file
├─ eslint.config.ts
├─ .markdownlint.json
├─ pyproject.toml
├─ package.json
└─ README.md
```

**`src`** - This is the “source root” — where the source files live.
Pages go here.
Each page is a Markdown file.
Observable Framework uses [file-based routing](https://observablehq.com/framework/routing), which means that the name of the file controls where the page is served.

**`src/index.md`** - This is the home page for the site.

**`src/data`** - [Data loaders](https://observablehq.com/framework/loaders) and static data files are stored here.

**`src/components`** - [JavaScript modules](https://observablehq.com/framework/javascript/imports) are stored here.

**`observablehq.config.ts`** - This is the [project configuration](https://observablehq.com/framework/config) file.

## Command reference

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm install`         | Install or reinstall dependencies           |
| `npm run dev`         | Start local preview server                  |
| `npm run build`       | Build your static site, generating `./dist` |
| `npm run build-jsdoc` | Build JavaScript documentation              |
| `npm run deploy`      | Deploy your project to Observable           |
| `npm run clean`       | Clear the local data loader cache           |
| `npm run observable`  | Run commands like `observable help`         |
