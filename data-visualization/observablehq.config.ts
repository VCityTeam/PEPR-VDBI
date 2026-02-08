// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: 'VDBI Dashboards',
  // theme: ['light', 'dashboard'],
  head: '<link rel="icon" href="pepr-vdbi-logo.png" type="image/png" sizes="32x32">',
  style: 'css/vdbi-dashboard.css',
  search: true,
  home: "VDBI Dashboards",
  root: 'src', // path to the source root for preview
  pages: [
    {
      name: 'Dashboards',
      pages: [
        {
          name: 'Phase 1 Overview',
          path: 'pages/dashboards/phase1-overview-dashboard',
        },
        {
          name: 'Phase 1 Cartography',
          path: 'pages/dashboards/phase1-map-dashboard',
        },
        {
          name: 'Phase 1 Scientific disciplines',
          path: 'pages/dashboards/phase1-disciplines',
        },
        {
          name: 'Phase 1 Financing',
          path: 'pages/dashboards/phase1-financing-dashboard',
        },
        {
          name: 'PEPR VDBI Constellation',
          path: 'pages/dashboards/vdbi-constellation',
        },
      ]
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
          name: 'Plot generator',
          path: 'pages/tools/plot',
        },
      ]
    },
    {
      name: 'Reports',
      pages: [
        {
          name: 'Lexicometric analysis - JS 2025: NEO/SoLocale Workshop',
          path: 'pages/reports/js-2025-workshop-analysis-fr',
        },
        {
          name: 'Lexicometric analysis - JS 2025: Round Tables',
          path: 'pages/reports/js-2025-round-table-analysis-en',
        },
      ]
    },
    {
      name: 'Under Construction',
      pages: [
        {
          name: 'Phase 1 socio-economic partners',
          path: 'pages/dashboards/working/phase1-partner-dashboard',
        },
        // {
        //   name: 'Phase 1 Researchers',
        //   path: 'pages/dashboards/working/phase1-researcher-dashboard',
        // },
        {
          name: 'Phase 1 Laboratories',
          path: 'pages/dashboards/working/phase1-laboratory-dashboard',
        },
        {
          name: 'Demonstrateurs de la Ville Durable',
          path: 'pages/dashboards/working/dvd-dashboard',
        },
        // {
        //   name: 'Phase 1 Institutions',
        //   path: 'pages/dashboards/working/phase1-university-dashboard',
        // },
        {
          name: 'Mural Data',
          path: 'pages/test_pages/test-mural-data',
        },
        {
          name: 'Raw Data Export',
          path: 'pages/test_pages/phase1-data-dashboard',
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
};
