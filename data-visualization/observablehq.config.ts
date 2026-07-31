import MarkdownItFootnote from 'markdown-it-footnote'

const PRODUCTION = process.env.BUILD_ENV === 'production'

const devOnlyPages = [
  {
    name: 'Under Construction',
    pages: [
      {
        name: 'Phase 1 socio-economic partners',
        path: 'pages/working/phase1-partner-dashboard',
      },
      // {
      //   name: 'Phase 1 Researchers',
      //   path: 'pages/working/phase1-researcher-dashboard',
      // },
      {
        name: 'Phase 1 Laboratories',
        path: 'pages/working/phase1-laboratory-dashboard',
      },
      {
        name: 'Demonstrateurs de la Ville Durable',
        path: 'pages/working/dvd-dashboard',
      },
      // {
      //   name: 'Phase 1 Institutions',
      //   path: 'pages/working/phase1-university-dashboard',
      // },
      {
        name: 'Mural Data',
        path: 'pages/test_pages/test-mural-data',
      },
      {
        name: 'Raw Data Export',
        path: 'pages/test_pages/aap-data-dashboard',
      },
    ],
  },
  {
    name: 'Reports',
    pages: [
      {
        name: 'Lexicometric analysis - JS 2025: Round Tables (EN)',
        path: 'pages/reports/js-2025-round-table-analysis-en',
      },
      {
        name: 'Lexicometric analysis - JS 2025: NEO/SoLocale Workshop (FR)',
        path: 'pages/reports/js-2025-workshop-analysis-fr',
      },
      {
        name: 'Lexicometric analysis - JS 2025: NEO/SoLocale Workshop (EN)',
        path: 'pages/reports/js-2025-workshop-analysis-en',
      },
    ],
  },
  {
    name: 'D3/Plot/Framework Tests',
    pages: [
      {
        name: 'Plot',
        path: 'pages/test_pages/test-plot',
      },
      {
        name: 'Tree',
        path: 'pages/test_pages/test-tree',
      },
      {
        name: 'Zoomable Sunburst',
        path: 'pages/test_pages/zoomable-sunburst',
      },
      {
        name: 'Parallel Sets',
        path: 'pages/test_pages/parallel-sets',
      },
      {
        name: 'Chord diagram',
        path: 'pages/test_pages/chord-diagram',
      },
      {
        name: 'Bilevel edge bundling',
        path: 'pages/test_pages/bilevel-edge-bundling',
      },
      {
        name: 'Word Clouds',
        path: 'pages/test_pages/word-cloud',
      },
      {
        name: 'Force Diagram, Triple Graph',
        path: 'pages/test_pages/test-graph',
      },
      {
        name: 'Arc Diagram, Property Graph',
        path: 'pages/test_pages/test-arc',
      },
      {
        name: 'Import dataESR+Geospatial',
        path: 'pages/test_pages/test-esr-import',
      },
      {
        name: 'Import Excel',
        path: 'pages/test_pages/test-excel-import',
      },
      {
        name: 'SQL and DuckDB',
        path: 'pages/test_pages/test-sql-duckdb',
      },
      {
        name: 'Import ORCID',
        path: 'pages/test_pages/test-orcid-import',
      },
    ],
  },
]

// See https://observablehq.com/framework/config for documentation.
export default {
  markdownIt: (md: any) => md.use(MarkdownItFootnote),
  // The project’s title; used in the sidebar and webpage titles.
  title: 'VDBI Dashboards',
  // theme: ['light', 'dashboard'],
  head: '<link rel="icon" href="pepr-vdbi-logo.png" type="image/png" sizes="32x32">',
  style: 'css/vdbi-dashboard.css',
  search: true,
  home: 'VDBI Dashboards',
  root: 'src', // path to the source root for preview
  pages: [
    {
      name: 'Projects',
      pages: [
        {
          name: 'Projects Overview',
          path: 'pages/projects/aap-overview',
        },
        {
          name: 'Projects Financing',
          path: 'pages/projects/phase1-financing-dashboard',
        },
        {
          name: 'PEPR VDBI Constellation',
          path: 'pages/projects/vdbi-constellation',
        },
      ],
    },
    {
      name: 'Maps',
      pages: [
        {
          name: 'Projects by terrain',
          path: 'pages/geo/projects-by-terrain',
        },
        {
          name: 'Partners by project',
          path: 'pages/geo/partners-by-project',
        },
        {
          name: 'Project terrains by department',
          path: 'pages/geo/project-terrains-by-department',
        },
        {
          name: 'Financed labs',
          path: 'pages/geo/financed-labs',
        },
      ],
    },
    {
      name: 'Researchers',
      pages: [
        {
          name: 'Projects Scientific disciplines',
          path: 'pages/researchers/phase1-disciplines',
        },
      ],
    },
    {
      name: 'Data Visualisation Tools',
      pages: [
        {
          name: 'Word cloud generator',
          path: 'pages/tools/wordclouds',
        },
        {
          name: 'Knowledge graph generator',
          path: 'pages/tools/graphs',
        },
        {
          name: 'Sankey diagram generator',
          path: 'pages/tools/sankey',
        },
        {
          name: 'Chord diagram generator',
          path: 'pages/tools/chord-diagram',
        },
        {
          name: 'Gantt chart generator',
          path: 'pages/tools/gantt',
        },
        {
          name: 'Plot generator',
          path: 'pages/tools/plot',
        },
      ],
    },
    ...(PRODUCTION ? [] : devOnlyPages),
  ],
  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "pages//example-dashboard"},
  //       {name: "Report", path: "pages//example-report"}
  //     ]
  //   }
  // ],

  // Some additional configuration options and their defaults:
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
}
