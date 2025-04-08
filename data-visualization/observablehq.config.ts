// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: 'PEPR Dashboards',
  theme: 'light',
  root: 'src', // path to the source root for preview
  pages: [
    {
      name: 'Phase 1 Overview',
      path: 'phase1-overview-dashboard',
    },
    {
      name: 'Phase 1 Projects by discipline',
      path: 'phase1-project-dashboard',
    },
    {
      name: 'Demonstrateurs de la Ville Durable',
      path: 'dvd-dashboard',
    },
    // {
    //   name: 'Phase 1 Laboratories',
    //   path: 'phase1-laboratory-dashboard', //deprecated
    // },
    // {
    //   name: 'Phase 1 Institutions',
    //   path: 'phase1-university-dashboard', //deprecated
    // },
    // {
    //   name: 'Phase 1 Financing',
    //   path: 'phase1-financing-dashboard', //deprecated
    // },
    {
      name: 'Tests',
      pages: [
        {
          name: 'Phase 1 Researchers',
          path: 'phase1-researcher-dashboard',
        },
        {
          name: 'Raw Data Test',
          path: 'phase1-data-dashboard',
        },
        {
          name: 'Import Excel Tests',
          path: '/test-excel-import',
        },
        {
          name: 'Import dataESR+Geospatial Tests',
          path: '/test-esr-import',
        },
        {
          name: 'Phase 1 Overview Test',
          path: 'phase1-dashboard',
        },
        {
          name: 'Import ORCID Tests',
          path: '/test-orcid-import',
        },
        {
          name: 'Plot Tests',
          path: '/test-plot',
        },
        {
          name: 'Tree Tests',
          path: '/test-tree',
        },
        {
          name: 'Force Diagram, Triple Graph Tests',
          path: '/test-graph',
        },
        {
          name: 'Arc Diagram, Property Graph Tests',
          path: '/test-arc',
        },
      ],
    },
    {
      name: 'Examples',
      pages: [
        {
          name: 'Example Index',
          path: '/example-index',
        },
        {
          name: 'Example Report',
          path: '/example-report',
        },
        {
          name: 'Example Dashboard',
          path: '/example-dashboard',
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
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
};
