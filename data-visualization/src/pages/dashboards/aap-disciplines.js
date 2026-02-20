import * as d3 from 'npm:d3'
import * as Plot from 'npm:@observablehq/plot'
import {
  cropText,
  countEntities,
  exclude,
  sparkbar,
} from '/components/utilities.js'
import { cnu_category_map } from '/components/cnu.js'
import {
  getGroupFromCNU,
  cnu_color_map,
  cnu_dark_color_map,
  quantized_cnu_color,
  cnrs_color_map,
  quantized_cnrs_color,
  erc_color_scale,
  interpolated_erc_color,
  hceres_color_scale,
  interpolated_hceres_color,
} from '/components/color.js'
import { generateIntersectionMatrix } from '/components/chord.js'
import { donutChart } from '/components/pie-chart.js'
import { parallelSetToGraph } from '/components/sankey.js'

export const cnu_plot = (data, width, cnu_plot_sort) =>
  Plot.plot({
    width: width,
    // height: 800,
    marginTop: 50,
    marginLeft: 18,
    marginRight: 300,
    x: {
      reverse: true,
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    color: {
      legend: true,
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
        fill: (d) => cnu_dark_color_map.get(getGroupFromCNU(d[0])),
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

  // const filtered_laboratories = phase_1_data.project_by_laboratories
  //   .filter(
  //     (d) =>
  //       (project ? d.project === project : true) &&
  //       (auditioned ? auditioned_projects.includes(d.project) : true) &&
  //       (financed ? financed_projects.includes(d.project) : true),
  //   )
  //   .map((d) => ({
  //     ...phase_1_data.laboratories.find((l) => l.lab === d.lab),
  //     project: d.project,
  //   }))

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
      (d) => (d.cnu ? getGroupFromCNU(d.cnu) : null),
    )
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const theme_count = countEntities(filtered_researchers, (d) => d.themes)
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const themes_by_cnu = d3
    .rollups(
      filtered_researchers.filter((d) => getGroupFromCNU(d.cnu)),
      (D) => D.flatMap((d) => d.themes),
      (d) => d.cnu,
    )
    .flatMap(([cnu, themes]) => themes.flatMap((theme) => ({ cnu, theme })))

  const unique_themes_by_cnu = d3
    .rollups(
      filtered_researchers.filter((d) => getGroupFromCNU(d.cnu)),
      (D) => new Set(D.flatMap((d) => d.themes)),
      (d) => d.cnu,
    )
    .flatMap(([cnu, themes]) =>
      [...themes].flatMap((theme) => ({ cnu, theme })),
    )

  const filtered_researcher_projects = filtered_researchers.flatMap(
    (researcher) =>
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
          cnu: researcher.cnu,
        })),
  )

  const grouped_projects_by_theme = d3.rollup(
    filtered_researcher_projects,
    (D) => new Set(D.flatMap((d) => d.themes)),
    (d) => d.project,
  )
  console.debug('grouped_projects_by_theme', grouped_projects_by_theme)

  const theme_project_matrix = generateIntersectionMatrix(
    grouped_projects_by_theme,
  )

  const grouped_projects_by_cnu = d3.rollup(
    filtered_researcher_projects,
    (D) => new Set(D.map((d) => d.cnu)),
    (d) => d.project,
  )
  console.debug('grouped_projects_by_cnu', grouped_projects_by_cnu)

  const cnu_project_matrix = generateIntersectionMatrix(grouped_projects_by_cnu)

  // const projects_by_erc = filtered_laboratories.map((lab) => ({
  //   project: lab.project,
  //   erc: lab.domain_erc
  //     ? lab.domain_erc.split(';').map((erc) => erc.trim())
  //     : [],
  //   erc_disciplines: phase_1_data.laboratories_by_disciplines_erc
  //     .filter((l) => l.lab === lab.lab)
  //     .map((l) => l.discipline),
  //   hceres: lab.domain_hceres
  //     ? lab.domain_hceres.split('-').map((hceres) => hceres.trim())
  //     : [],
  //   hceres_disciplines: phase_1_data.laboratories_by_disciplines_hceres
  //     .filter((l) => l.lab === lab.lab)
  //     .map((l) => l.discipline),
  // }))

  // const grouped_projects_by_erc = d3.rollup(
  //   projects_by_erc,
  //   (D) => new Set(D.flatMap((d) => d.erc_disciplines)),
  //   (d) => d.project,
  // )

  // const grouped_projects_by_hceres = d3.rollup(
  //   projects_by_erc,
  //   (D) => new Set(D.flatMap((d) => d.hceres_disciplines)),
  //   (d) => d.project,
  // )

  // console.debug('grouped_projects_by_erc', grouped_projects_by_erc)
  // console.debug('grouped_projects_by_hceres', grouped_projects_by_hceres)

  // const erc_project_matrix = generateIntersectionMatrix(grouped_projects_by_erc)
  // const hceres_project_matrix = generateIntersectionMatrix(
  //   grouped_projects_by_hceres,
  // )

  // const cnu_count_by_category = d3
  //   .rollups(
  //     filtered_researchers,
  //     (D) => D.length,
  //     (d) => (d.cnu ? getGroupFromCNU(d.cnu) : null),
  //   )
  //   .filter((d) => !!d[0])
  //   .sort((a, b) => d3.descending(a[1], b[1]))

  const grouped_cnu_group_by_keyword = d3.rollup(
    filtered_researcher_projects.filter((d) => getGroupFromCNU(d.cnu)),
    (D) => new Set(D.flatMap((d) => d.themes)),
    (d) => getGroupFromCNU(d.cnu),
  )

  const cnu_group_keyword_matrix = generateIntersectionMatrix(
    grouped_cnu_group_by_keyword,
  )

  const grouped_cnu_by_keyword = d3.rollup(
    filtered_researcher_projects.filter((d) => getGroupFromCNU(d.cnu)),
    (D) => new Set(D.flatMap((d) => d.themes)),
    (d) => cropText(d.cnu),
  )

  const cnu_keyword_matrix = generateIntersectionMatrix(grouped_cnu_by_keyword)

  return {
    discipline_erc_count,
    cnu_count,
    cnu_count_by_category,
    theme_count,
    theme_project_matrix,
    theme_projects: [...grouped_projects_by_theme.keys()],
    themes_by_cnu,
    unique_themes_by_cnu,
    cnu_project_matrix,
    cnu_projects: [...grouped_projects_by_cnu.keys()],
    // erc_project_matrix,
    // erc_projects: [...grouped_projects_by_erc.keys()],
    // hceres_project_matrix,
    // hceres_projects: [...grouped_projects_by_hceres.keys()],
    cnu_group_keyword_matrix,
    cnu_group_keywords: [...grouped_cnu_group_by_keyword.keys()],
    cnu_keyword_matrix,
    cnu_keywords: [...grouped_cnu_by_keyword.keys()],
  }
}

export const theme_plot = (data, width, theme_plot_sort, theme_color_scale) =>
  Plot.plot({
    width: width,
    height: 800,
    x: {
      label: 'Occurences',
      grid: true,
      axis: 'both',
      reverse: true,
      nice: true,
    },
    y: {
      // label: 'Researcher keywords',
      // tickRotate: -20,
      axis: 'right',
      lineWidth: 20,
      textOverflow: 'ellipsis',
      tickFormat: (d) => cropText(d, 40),
    },
    marginTop: 50,
    marginBottom: 10,
    marginRight: 200,
    marks: [
      Plot.barX(data, {
        y: 'cnu',
        x: 1,
        fill: (d) => theme_color_scale(d.theme),
        sort: { y: theme_plot_sort },
        tip: {
          lineWidth: 25,
          textOverflow: 'ellipsis-end',
          format: {
            fill: false,
          },
        },
      }),
    ],
  })

// TODO: this should be refactored to work asynchronously
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

export const chord_config = {
  formatValue: (d) => '',
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

export const sankey_config = (data, width) => ({
  width: width,
  height: data.nodes.length * 40,
  nodeFill: () => 'rgba(1,1,1,0.9)',
  linkFillOpacity: 0.3,
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

// researcher

export const researcher_by_aap_status = (researchers, projects) =>
  researchers.map((d) => {
    const researcher_projects = d.project.map((project_name) =>
      projects.find((p) => p.acronyme === project_name),
    )
    return {
      cnu: cropText(d.cnu, 30),
      cnu_category: getGroupFromCNU(d.cnu) || 'Unknown',
      themes: d.themes,
      auditioned: researcher_projects.some((p) => p.auditioned)
        ? 'auditioned'
        : 'not auditioned',
      financed: researcher_projects.some((p) => p.financed)
        ? 'financed'
        : 'not financed',
    }
  })

// CNUs

export const cnu_by_aap_status = (researcher_by_aap_status) =>
  researcher_by_aap_status.sort(
    (a, b) => Number(a.cnu.slice(0, 2)) - Number(b.cnu.slice(0, 2)),
  )

export const cnu_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(cnu_by_aap_status, ['cnu', 'auditioned', 'financed'])

export const cnu_category_by_aap_status_graph = (cnu_by_aap_status, category) =>
  cnu_by_aap_status_graph(
    cnu_by_aap_status.filter((d) => d.cnu_category === category),
  )

export const cnu_CNRS_SHS_category_by_aap_status_graph = (cnu_by_aap_status) =>
  cnu_by_aap_status_graph(
    cnu_by_aap_status.filter((d) =>
      [
        'Droit, économie et gestion',
        'Pluridisciplinaire',
        'Lettres et sciences humaines',
      ].includes(d.cnu_category),
    ),
  )

export const cnu_categories_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(cnu_by_aap_status, [
    'cnu_category',
    'auditioned',
    'financed',
  ])

export const aap_state_color_scale = d3.scaleOrdinal(
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

export const cnu_category_link_color_scale = (d) => cnu_color_map.get(d.path[0])

export const cnu_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => quantized_cnu_color(d.path[0], data.nodes.length - 4),
})

// CNRS-ésque section

const cnu_erc_map = new Map([
  ['Lettres et sciences humaines', 'SH - Sciences Humaines & Sociales'],
  ['Sections de santé', 'LS - Vie & Santé'],
  ['Sciences', 'PE - Sciences & Technologies'],
  ['Droit, économie et gestion', 'SH - Sciences Humaines & Sociales'],
  ['Pluridisciplinaire', 'SH - Sciences Humaines & Sociales'],
])

export const custom_discipline_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(
    cnu_by_aap_status.map((d) => ({
      ...d,
      erc_discipline: cnu_erc_map.get(d.cnu_category),
    })),
    ['erc_discipline', 'auditioned', 'financed'],
  )

export const cnrs_section_by_aap_status = (researcher_by_aap_status) =>
  researcher_by_aap_status.sort(
    (a, b) => Number(a.cnu.slice(0, 2)) - Number(b.cnu.slice(0, 2)),
  )

export const cnrs_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => quantized_cnrs_color(d.path[0], data.nodes.length - 4),
})

export const cnrs_category_link_color_scale = (d) =>
  cnrs_color_map.get(d.path[0])

// themes

export const theme_by_aap_status = (researcher_by_aap_status) =>
  d3.sort(
    researcher_by_aap_status
      .filter((d) => d.themes)
      .flatMap((d) =>
        d.themes.map((t) => ({
          ...d,
          theme: t,
          submitted: 'submitted',
        })),
      ),
    (d) => d.theme,
  )

export const theme_by_aap_status_graph = (theme_by_aap_status) =>
  parallelSetToGraph(theme_by_aap_status, [
    'submitted',
    'auditioned',
    'financed',
  ])

export const theme_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => aap_state_color_scale(d.path.slice(-2).join('-')),
})

// labs

export const lab_by_aap_status = (
  labs,
  projects,
  lab_erc_discipline_map,
  lab_hceres_discipline_map,
) =>
  projects.flatMap((project) => {
    const project_labs = project.labs.map((lab_name) =>
      labs.find((l) => l.lab === lab_name),
    )
    return project_labs
      .filter((l) => l !== undefined)
      .map((l) => ({
        lab: cropText(l.lab, 30),
        erc: l.domain_erc || '',
        erc_disciplines: lab_erc_discipline_map
          .filter((d) => d.lab === l.lab)
          .map((d) => d.discipline),
        hceres: l.domain_hceres || '',
        hceres_disciplines: lab_hceres_discipline_map
          .filter((d) => d.lab === l.lab)
          .map((d) => d.discipline),
        auditioned: project.auditioned ? 'auditioned' : 'not auditioned',
        financed: project.financed ? 'financed' : 'not financed',
      }))
  })

// ERC

export const erc_by_aap_status = (lab_by_aap_status) =>
  d3.sort(
    lab_by_aap_status
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

export const erc_disciplines_by_aap_status = (lab_by_aap_status) =>
  d3.sort(
    lab_by_aap_status.flatMap((d) =>
      d.erc_disciplines.map((discipline) => ({
        ...d,
        erc_discipline: cropText(discipline, 40),
      })),
    ),
    (d) => Number(d.erc_discipline.substring(2, 4)),
  )

export const erc_disciplines_by_aap_status_graph = (
  erc_disciplines_by_aap_status,
) =>
  parallelSetToGraph(erc_disciplines_by_aap_status, [
    'erc_discipline',
    'auditioned',
    'financed',
  ])

export const erc_discipline_category_by_aap_status_graph = (
  erc_disciplines_by_aap_status,
  category,
) =>
  erc_disciplines_by_aap_status_graph(
    erc_disciplines_by_aap_status.filter(
      (d) => d.erc_discipline.substring(0, 2) === category,
    ),
  )

export const erc_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => erc_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})

export const erc_disciplines_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => interpolated_erc_color(d.path[0]),
  linkFillOpacity: 0.4,
})

// HCERES

export const hceres_by_aap_status = (lab_by_aap_status) =>
  d3.sort(
    lab_by_aap_status
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

export const hceres_disciplines_by_aap_status = (lab_by_aap_status) =>
  d3.sort(
    lab_by_aap_status.flatMap((d) =>
      d.hceres_disciplines.map((discipline) => ({
        ...d,
        hceres_discipline: cropText(discipline, 40),
      })),
    ),
    (d) => d.hceres_discipline,
  )

export const hceres_disciplines_by_aap_status_graph = (
  hceres_disciplines_by_aap_status,
) =>
  parallelSetToGraph(hceres_disciplines_by_aap_status, [
    'hceres_discipline',
    'auditioned',
    'financed',
  ])

export const hceres_discipline_category_by_aap_status_graph = (
  hceres_disciplines_by_aap_status,
  category,
) =>
  hceres_disciplines_by_aap_status_graph(
    hceres_disciplines_by_aap_status.filter((d) =>
      d.hceres_discipline.startsWith(category),
    ),
  )

export const hceres_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => hceres_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})

export const hceres_disciplines_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) =>
    interpolated_hceres_color(
      d.path[0],
      data.nodes
        .filter(
          (d) =>
            ![
              'auditioned',
              'not auditioned',
              'financed',
              'not financed',
            ].includes(d.id),
        )
        .map((d) => d.id),
    ),
  linkFillOpacity: 0.4,
})
