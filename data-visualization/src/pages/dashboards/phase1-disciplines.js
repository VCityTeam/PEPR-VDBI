import * as d3 from 'npm:d3'
import { html } from 'npm:htl'
import * as Plot from 'npm:@observablehq/plot'
import {
  cropText,
  countEntities,
  exclude,
  sparkbar,
} from '/components/utilities.js'
import { cnu_category_map } from '/components/cnu.js'
import {
  getCategoryFromCNU,
  colorCNU,
  cnu_color_map,
  interpolated_cnu_color,
  erc_color_scale,
  hceres_color_scale,
} from '/components/color.js'
import { generateIntersectionMatrix } from '/components/chord.js'
import { donutChart } from '/components/pie-chart.js'
import { parallelSetToGraph } from '/components/sankey.js'

const cnu_plot_legend_options = {
  marginLeft: 18,
  marginRight: 300,
  domain: [1, 0.1],
  range: [1, 0.4],
  format: (d) => Number(d),
  type: 'log',
}

export const cnu_plot_legend = (width) =>
  html`${Plot.legend({
    label: 'Droit, économie et gestion',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: 'Reds',
    },
  })}
  ${Plot.legend({
    label: 'Lettres et sciences humaines',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: 'Greens',
    },
  })}
  ${Plot.legend({
    label: 'Sciences',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: 'Blues',
    },
  })}
  ${Plot.legend({
    label: 'Sections de santé',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: 'Purples',
    },
  })}
  ${Plot.legend({
    label: 'Pluridisciplinaire',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      // range: [0.7, 0.1],
      type: cnu_plot_legend_options.type,
      // scheme: "YlOrBr",
      interpolate: d3.interpolateRgbBasis(['white', 'yellow', 'brown']),
    },
  })}
  ${Plot.legend({
    label: 'Autre',
    width: width,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    tickFormat: cnu_plot_legend_options.format,
    color: {
      domain: cnu_plot_legend_options.domain,
      range: cnu_plot_legend_options.range,
      type: cnu_plot_legend_options.type,
      scheme: 'Greys',
    },
  })}`

export const cnu_plot = (data, width, cnu_plot_sort) =>
  Plot.plot({
    width: width,
    // height: 800,
    marginTop: 50,
    marginLeft: cnu_plot_legend_options.marginLeft,
    marginRight: cnu_plot_legend_options.marginRight,
    x: {
      reverse: true,
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    marks: [
      Plot.axisY({
        label: 'CNU',
        anchor: 'right',
        lineWidth: 30,
        textOverflow: 'ellipsis',
      }),
      Plot.barX(data.cnu_count, {
        y: (d) => d[0],
        x: (d) => d[1],
        fill: (d) => colorCNU(d, Math.max(...data.cnu_count.map((d) => d[1]))),
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { y: cnu_plot_sort },
        tip: true,
      }),
      Plot.barX(
        data.cnu_count,
        Plot.pointerY({
          y: (d) => d[0],
          x: (d) => d[1],
          fill: 'white',
          opacity: 0.5,
        }),
      ),
    ],
  })

// function generateCnuPlotOptions(data, sort = 'y', height = 350, width = 500) {
//   return {
//     width: width,
//     height: height,
//     marginTop: 50,
//     marginRight: width / 2,
//     y: {
//       label: 'CNU',
//       tickRotate: 10,
//       axis: 'right',
//       lineWidth: 35,
//       textOverflow: 'ellipsis',
//     },
//     x: {
//       reverse: true,
//       grid: true,
//       axis: 'top',
//       label: 'Occurences',
//     },
//     marks: [
//       Plot.barX(data, {
//         y: (d) => d[0],
//         x: (d) => d[1],
//         // fill: (d) => d3
//         // .scaleOrdinal(d3.schemeCategory10)
//         // .domain(cnu_category_map.keys())
//         // .unknown("grey")(getCategoryFromCNU(d[0])),
//         fill: (d) => colorCNU(d, Math.max(...data.map((d) => d[1]))),
//         stroke: 'black',
//         strokeOpacity: 0.1,
//         // sort: {y: "y"},
//         // sort: {y: "-x"},
//         sort: { y: sort },
//         tip: {
//           format: {
//             fill: false,
//           },
//           lineWidth: 25,
//           textOverflow: 'ellipsis-end',
//         },
//       }),
//       Plot.barX(
//         data,
//         Plot.pointerY({
//           y: (d) => d[0],
//           x: (d) => d[1],
//           fill: 'white',
//           opacity: 0.5,
//         }),
//       ),
//       // Plot.text(data, {
//       //   x: 0,
//       //   y: (d) => d[1],
//       // })
//     ],
//   }
// }

const default_donut_config = {
  keyMap: (d) => d[0],
  valueMap: (d) => d[1],
  colorMap: (d) => d[0],
  legendTextLength: 18,
  majorLabelText: () => '',
  minorLabelText: () => '',
}

export const cnu_group_donut = (data, width) =>
  donutChart(data.cnu_count_by_category, {
    ...default_donut_config,
    width: width * 0.6,
    legendWidth: width * 0.5,
    color: d3
      .scaleOrdinal(d3.schemeSet1.slice(1))
      // .scaleOrdinal(d3.schemeCategory10)
      .domain(cnu_category_map.keys())
      .unknown('grey'),
  })

export const erc_donut = (data, width) =>
  donutChart(data.discipline_erc_count, {
    ...default_donut_config,
    width: width * 0.6,
    legendWidth: width * 0.5,
    color: erc_color_scale,
  })

// Get relevant data by project,
// set auditioned flag to true if filtering out non-auditioned project data
// set financed flag to true if filtering out non-financed project data
function formatResearcherDataByProject(
  phase_1_data,
  auditioned_projects,
  financed_projects,
  project,
  auditioned = false,
  financed = false,
) {
  // filter by project if project, otherwise keep everything
  const filtered_researchers = phase_1_data.researchers.filter(
    (d) =>
      (project ? d.project.includes(project) : true) &&
      (auditioned
        ? d.project.some((researcher_project) =>
            auditioned_projects.includes(researcher_project),
          )
        : true) &&
      (financed
        ? d.project.some((researcher_project) =>
            financed_projects.includes(researcher_project),
          )
        : true),
  )

  const discipline_erc_count = countEntities(
    filtered_researchers,
    (d) => d.discipline_erc,
  )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  const cnu_count = d3
    .rollups(
      filtered_researchers,
      (d) => d.length,
      (d) => d.cnu,
    )
    .filter((d) => exclude(d[0]))
    .sort((a, b) => d3.descending(a[1], b[1]))

  const cnu_count_by_category = d3
    .rollups(
      filtered_researchers,
      (D) => D.length,
      (d) => (d.cnu ? getCategoryFromCNU(d.cnu) : null),
    )
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const theme_count = countEntities(filtered_researchers, (d) => d.themes)
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const projects_by_theme = filtered_researchers.flatMap((researcher) =>
    researcher.project
      .filter(
        (researcher_project) =>
          (project ? researcher_project === project : true) &&
          (auditioned
            ? auditioned_projects.includes(researcher_project)
            : true) &&
          (financed ? financed_projects.includes(researcher_project) : true),
      )
      .map((project) => ({
        project,
        themes: researcher.themes,
      })),
  )

  const grouped_projects_by_theme = d3.rollup(
    projects_by_theme,
    (D) => new Set(D.flatMap((d) => d.themes)),
    (d) => d.project,
  )
  console.debug('grouped_projects_by_theme', grouped_projects_by_theme)

  const theme_project_matrix = generateIntersectionMatrix(
    grouped_projects_by_theme,
  )

  // const theme_graph = {
  //   nodes: [
  //     ...new Set(
  //       filtered_researchers.flatMap((reasearcher) =>
  //         reasearcher.themes.map((theme) => ({
  //           id: theme,
  //           label: theme,
  //           type: 'Theme',
  //         })),
  //       ),
  //     ),
  //   ],
  //   links: filtered_researchers.flatMap((researcher) =>
  //     researcher.themes.flatMap((source_theme) =>
  //       researcher.themes
  //         .map((target_theme) =>
  //           source_theme === target_theme
  //             ? null
  //             : {
  //                 source: source_theme,
  //                 target: target_theme,
  //                 label: 'Shared researcher',
  //               },
  //         )
  //         .filter((d) => !!d),
  //     ),
  //   ),
  // }

  return {
    discipline_erc_count,
    cnu_count,
    cnu_count_by_category,
    theme_count,
    theme_project_matrix,
    projects: [...grouped_projects_by_theme.keys()],
    // theme_graph,
  }
}

export const theme_plot = (data, width, theme_plot_sort) =>
  Plot.plot({
    width: width,
    height: data.length * 20,
    marginTop: 50,
    marginBottom: 10,
    marginRight: 200,
    x: {
      label: 'Occurences',
      grid: true,
      axis: 'both',
      reverse: true,
    },
    y: {
      label: 'Subjects, themes, or research interests',
      tickRotate: -20,
      axis: 'right',
      lineWidth: 20,
      textOverflow: 'ellipsis',
    },
    marks: [
      Plot.barX(data, {
        y: (d) => d[0],
        x: (d) => d[1],
        stroke: 'black',
        strokeOpacity: 0.1,
        fill: 'var(--theme-foreground-focus)',
        sort: { y: theme_plot_sort },
        tip: {
          format: {
            fill: false,
          },
          lineWidth: 25,
          textOverflow: 'ellipsis-end',
        },
      }),
      Plot.barX(
        data,
        Plot.pointerY({
          y: (d) => d[0],
          x: (d) => d[1],
          fill: 'white',
          opacity: 0.5,
        }),
      ),
    ],
  })

export const generateDisciplineDataByProject = (
  phase_1_data,
  auditioned_projects,
  financed_projects,
) =>
  new Map([
    [
      'All Projects',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        false,
        false,
        false,
      ),
    ],
    [
      'Auditioned Projects',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        false,
        true,
        false,
      ),
    ],
    [
      'Financed Projects',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        false,
        true,
        true,
      ),
    ],
    [
      'NEO',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'NEO',
        true,
        true,
      ),
    ],
    [
      'RESILIENCE',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'RESILIENCE',
        true,
        true,
      ),
    ],
    [
      'TRACES',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'TRACES',
        true,
        true,
      ),
    ],
    [
      'VF++',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'VF++',
        true,
        true,
      ),
    ],
    [
      'VILLEGARDEN',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'VILLEGARDEN',
        true,
        true,
      ),
    ],
    [
      'WHAOU',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'WHAOU',
        true,
        true,
      ),
    ],
    [
      'INTEGREEN',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'INTEGREEN',
        true,
        true,
      ),
    ],
    [
      'URBHEALTH',
      formatResearcherDataByProject(
        phase_1_data,
        auditioned_projects,
        financed_projects,
        'URBHEALTH',
        true,
        true,
      ),
    ],
  ])

export function formatDomainPercents(label, data) {
  // debugger;
  const getFromMapOrZero = (map, value) => (map.has(value) ? map.get(value) : 0)

  const discipline_erc_count_map = new Map(data.discipline_erc_count)
  const discipline_erc_count_total =
    getFromMapOrZero(
      discipline_erc_count_map,
      'SH - Sciences Humaines & Sociales',
    ) +
    getFromMapOrZero(discipline_erc_count_map, 'PE - Sciences & Technologies') +
    getFromMapOrZero(discipline_erc_count_map, 'LS - Vie & Santé') +
    getFromMapOrZero(discipline_erc_count_map, 'non chercheur')

  const cnu_count_by_category_count_map = new Map(data.cnu_count_by_category)
  const cnu_count_by_category_count_total =
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      'Droit, économie et gestion',
    ) +
    getFromMapOrZero(
      cnu_count_by_category_count_map,
      'Lettres et sciences humaines',
    ) +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Sciences') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Pluridisciplinaire') +
    getFromMapOrZero(cnu_count_by_category_count_map, 'Sections de santé')

  return {
    label: label,
    erc_sh_ratio:
      getFromMapOrZero(
        discipline_erc_count_map,
        'SH - Sciences Humaines & Sociales',
      ) / discipline_erc_count_total,
    erc_pe_ratio:
      getFromMapOrZero(
        discipline_erc_count_map,
        'PE - Sciences & Technologies',
      ) / discipline_erc_count_total,
    erc_ls_ratio:
      getFromMapOrZero(discipline_erc_count_map, 'LS - Vie & Santé') /
      discipline_erc_count_total,
    cnu_droit_ratio:
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        'Droit, économie et gestion',
      ) / cnu_count_by_category_count_total,
    cnu_shs_ratio:
      getFromMapOrZero(
        cnu_count_by_category_count_map,
        'Lettres et sciences humaines',
      ) / cnu_count_by_category_count_total,
    cnu_science_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, 'Sciences') /
      cnu_count_by_category_count_total,
    cnu_pluri_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, 'Pluridisciplinaire') /
      cnu_count_by_category_count_total,
    cnu_sante_ratio:
      getFromMapOrZero(cnu_count_by_category_count_map, 'Sections de santé') /
      cnu_count_by_category_count_total,
  }
}

// Table //
const generateSparkbar = sparkbar(1, {
  format: (x) => `${(x * 100).toPrecision(3)}%`,
  float: 'right',
})

export const overview_table_erc_config = {
  // height: 400,
  columns: [
    'label',
    // "erc_sh_ratio",
    // "erc_pe_ratio",
    // "erc_ls_ratio",
    'cnu_droit_ratio',
    'cnu_shs_ratio',
    'cnu_science_ratio',
    'cnu_pluri_ratio',
    'cnu_sante_ratio',
  ],
  header: {
    label: 'Project',
    erc_sh_ratio: '% ERC SH',
    erc_pe_ratio: '% ERC PE',
    erc_ls_ratio: '% ERC VS',
    cnu_droit_ratio: '% CNU Droit, économie et gestion',
    cnu_shs_ratio: '% CNU Lettres et SH',
    cnu_science_ratio: '% CNU Sciences',
    cnu_pluri_ratio: '% CNU Pluridisciplinaire',
    cnu_sante_ratio: '% CNU Santé',
  },
  format: {
    erc_sh_ratio: generateSparkbar,
    erc_pe_ratio: generateSparkbar,
    erc_ls_ratio: generateSparkbar,
    cnu_droit_ratio: generateSparkbar,
    cnu_shs_ratio: generateSparkbar,
    cnu_science_ratio: generateSparkbar,
    cnu_pluri_ratio: generateSparkbar,
    cnu_sante_ratio: generateSparkbar,
  },
}

export const overview_table_cnu_config = {
  // height: 400,
  columns: [
    'label',
    'erc_sh_ratio',
    'erc_pe_ratio',
    'erc_ls_ratio',
    // "cnu_droit_ratio",
    // "cnu_shs_ratio",
    // "cnu_science_ratio",
    // "cnu_pluri_ratio",
    // "cnu_sante_ratio",
  ],
  header: {
    label: 'Project',
    erc_sh_ratio: '% ERC SH',
    erc_pe_ratio: '% ERC PE',
    erc_ls_ratio: '% ERC VS',
    cnu_droit_ratio: '% CNU Droit, économie et gestion',
    cnu_shs_ratio: '% CNU Lettres et SH',
    cnu_science_ratio: '% CNU Sciences',
    cnu_pluri_ratio: '% CNU Pluridisciplinaire',
    cnu_sante_ratio: '% CNU Santé',
  },
  format: {
    erc_sh_ratio: generateSparkbar,
    erc_pe_ratio: generateSparkbar,
    erc_ls_ratio: generateSparkbar,
    cnu_droit_ratio: generateSparkbar,
    cnu_shs_ratio: generateSparkbar,
    cnu_science_ratio: generateSparkbar,
    cnu_pluri_ratio: generateSparkbar,
    cnu_sante_ratio: generateSparkbar,
  },
}

export function isFinanced(projects, financed_projects) {
  for (let index = 0; index < projects.length; index++) {
    if (financed_projects.includes(projects[index])) return true
  }
  return false
}

// Compare project status per discipline
// - sankey across project status by
//   - themes,
//   - CNUs,
//   - ERC
// - Look at which themes were financed

const sankey_config = (data, width) => ({
  width: width,
  height: data.nodes.length * 40,
  nodeFill: () => 'rgba(1,1,1,0.9)',
})

export const projects_by_aap_status_graph = (projects) =>
  parallelSetToGraph(
    projects.map((d) => ({
      submitted: 'submitted',
      auditioned: d.auditioned ? 'auditioned' : 'not auditioned',
      financed: d.financed ? 'financed' : 'not financed',
    })),
    ['submitted', 'auditioned', 'financed'],
  )

// CNUs

export const cnu_by_aap_status = (researchers, projects) =>
  researchers
    .map((d) => {
      const researcher_projects = d.project.map((project_name) =>
        projects.find((p) => p.acronyme === project_name),
      )
      return {
        cnu: cropText(d.cnu, 30),
        cnu_category: getCategoryFromCNU(d.cnu) || 'Unknown',
        auditioned: researcher_projects.some((p) => p.auditioned)
          ? 'auditioned'
          : 'not auditioned',
        financed: researcher_projects.some((p) => p.financed)
          ? 'financed'
          : 'not financed',
      }
    })
    .sort((a, b) => Number(a.cnu.slice(0, 2)) - Number(b.cnu.slice(0, 2)))

export const cnu_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(cnu_by_aap_status, ['cnu', 'auditioned', 'financed'])

export const cnu_category_by_aap_status_graph = (cnu_by_aap_status, category) =>
  cnu_by_aap_status_graph(
    cnu_by_aap_status.filter((d) => d.cnu_category === category),
  )

export const cnu_categories_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(cnu_by_aap_status, [
    'cnu_category',
    'auditioned',
    'financed',
  ])

export const project_state_color_scale = d3.scaleOrdinal(
  [
    'submitted-auditioned',
    'submitted-not auditioned',
    'auditioned-financed',
    'auditioned-not financed',
    'not auditioned-financed',
    'not auditioned-not financed',
  ],
  ['lightblue', 'pink', 'lightgreen', 'pink', 'pink', 'pink'],
)

export const cnu_link_color_scale = (d) => interpolated_cnu_color(d.path[0])
// cnu_color_map.get(getCategoryFromCNU(d.path[0]))

export const cnu_category_link_color_scale = (d) => cnu_color_map.get(d.path[0])

export const cnu_sankey_config = (data, width, total_cnu_count) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => cnu_link_color_scale(d, total_cnu_count),
})

// ERC

export const lab_by_aap_status = (labs, projects) =>
  projects.flatMap((project) => {
    const project_labs = project.labs.map((lab_name) =>
      labs.find((l) => l.lab === lab_name),
    )
    return project_labs
      .filter((l) => l !== undefined)
      .map((l) => ({
        lab: cropText(l.lab, 30),
        erc: l.domain_erc || '',
        hceres: l.domain_hceres || '',
        auditioned: project.auditioned ? 'auditioned' : 'not auditioned',
        financed: project.financed ? 'financed' : 'not financed',
      }))
  })

export const erc_by_aap_status = (labs, projects) =>
  d3.sort(
    lab_by_aap_status(labs, projects)
      .filter((d) => d.erc !== '' && d.erc !== 'Non Renseigné')
      .flatMap((d) =>
        d.erc.split(';').map((erc) => ({
          ...d,
          erc: erc.trim(),
        })),
      ),
    (d) => d.erc,
  )

export const erc_by_aap_status_graph = (erc_by_aap_status) =>
  parallelSetToGraph(erc_by_aap_status, ['erc', 'auditioned', 'financed'])

export const erc_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => erc_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})

// HCERES

export const hceres_by_aap_status = (labs, projects) =>
  d3.sort(
    lab_by_aap_status(labs, projects)
      .filter((d) => d.hceres !== '' && d.hceres !== 'Non renseigné')
      .flatMap((d) =>
        d.hceres.split('-').map((hceres) => ({
          ...d,
          hceres: hceres.trim().replace('SV ', 'SVE '), // TODO: move correction to data processing
        })),
      ),
    (d) => d.hceres,
  )

export const hceres_by_aap_status_graph = (hceres_by_aap_status) =>
  parallelSetToGraph(hceres_by_aap_status, ['hceres', 'auditioned', 'financed'])

export const hceres_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => hceres_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})
