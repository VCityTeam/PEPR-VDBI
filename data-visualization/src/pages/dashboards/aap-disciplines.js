import * as d3 from 'npm:d3'
import * as Plot from 'npm:@observablehq/plot'
import {
  cropText,
  countEntities,
  exclude,
  sparkbar,
} from '../../components/utilities.js'
import {
  cnu_category_section_map,
  getGroupFromCNU,
  getERCFromCNU,
  cnu_section_label_map,
} from '../../components/cnu.js'
import {
  cnu_color_map,
  cnu_dark_color_map,
  quantized_cnu_color,
  cnrs_color_map,
  quantized_cnrs_color,
  erc_color_scale,
  interpolated_erc_color,
  hceres_color_scale,
  interpolated_hceres_color,
} from '../../components/color.js'
import { generateIntersectionMatrix } from '../../components/chord.js'
import { donutChart } from '../../components/pie-chart.js'
import { parallelSetToGraph } from '../../components/sankey.js'

export const cnu_legend = Plot.legend({
  color: {
    domain: cnu_dark_color_map.keys(),
    range: cnu_dark_color_map.values(),
    type: 'ordinal',
  },
})

export const erc_legend = () =>
  Plot.legend({
    color: {
      domain: erc_color_scale.domain(),
      range: erc_color_scale.range(),
      type: 'ordinal',
    },
  })

export const cnu_plot = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) =>
      cnu_dark_color_map.get(getGroupFromCNU(y_accessor(d))),
  } = {},
) =>
  Plot.plot({
    width: width,
    // height: 800,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    x: {
      reverse: true,
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    color: {
      // legend: true,
      type: 'categorical',
    },
    y: {
      type: 'band',
      domain: cnu_section_label_map.values(),
    },
    marks: [
      Plot.axisY({
        label: 'CNU',
        anchor: 'right',
        lineWidth: 24,
        textOverflow: 'ellipsis',
        tickRotate: -45,
      }),
      Plot.barX(data, {
        y: y_accessor,
        x: x_accessor,
        fill: fill_accessor,
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { y: sort },
        tip: true,
      }),
      Plot.barX(
        data,
        Plot.pointerY({
          y: y_accessor,
          x: x_accessor,
          fill: 'white',
          opacity: 0.5,
        }),
      ),
    ],
  })

export const cnu_by_aap_plot = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => d[0],
  } = {},
) =>
  Plot.plot({
    width: width,
    // height: 800,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    x: {
      reverse: true,
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    color: {
      legend: true,
      domain: ['AAP 1', 'AAP 2'],
      range: [
        'var(--theme-foreground-focus)',
        'var(--theme-foreground-focus-alt)',
      ],
      type: 'categorical',
    },
    y: {
      type: 'band',
      domain: cnu_section_label_map.values(),
      tickRotate: 45,
    },
    marks: [
      Plot.axisY({
        label: 'CNU',
        anchor: 'right',
        lineWidth: 24,
        textOverflow: 'ellipsis',
        tickRotate: -45,
      }),
      Plot.barX(data, {
        y: y_accessor,
        x: x_accessor,
        fill: fill_accessor,
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { y: sort },
        tip: true,
      }),
      Plot.barX(
        data,
        Plot.pointerY({
          y: y_accessor,
          x: x_accessor,
          fill: 'white',
          opacity: 0.5,
        }),
      ),
    ],
  })

export const cnu_by_aap_plot_2 = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fy_accessor = (d) => d[0],
    fill_accessor = (d) => d[0],
  } = {},
) =>
  Plot.plot({
    width: width,
    // height: 800,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    x: {
      reverse: true,
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    color: {
      legend: true,
      domain: ['AAP 1', 'AAP 2'],
      range: [
        'var(--theme-foreground-focus)',
        'var(--theme-foreground-focus-alt)',
      ],
      type: 'categorical',
    },
    y: {
      type: 'band',
      tickFormat: null,
      tickSize: null,
    },
    marks: [
      Plot.axisFy({
        label: 'CNU',
        anchor: 'right',
        lineWidth: 24,
        textOverflow: 'ellipsis',
        tickSize: 5,
        domain: cnu_section_label_map.values(),
      }),
      Plot.barX(data, {
        y: y_accessor,
        x: x_accessor,
        fy: fy_accessor,
        fill: fill_accessor,
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { y: sort },
        tip: true,
      }),
      Plot.barX(
        data,
        Plot.pointerY({
          y: y_accessor,
          x: x_accessor,
          fy: fy_accessor,
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
  legendTextLength: 35,
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
      .domain(cnu_category_section_map.keys())
      .unknown('grey'),
  })

export const custom_cnu_group_donut = (data, width) =>
  donutChart(data, {
    ...default_donut_config,
    width: width * 0.6,
    legendWidth: width * 0.5,
    color: d3
      .scaleOrdinal(d3.schemeSet1.slice(1))
      // .scaleOrdinal(d3.schemeCategory10)
      .domain(cnu_category_section_map.keys())
      .unknown('grey'),
  })

export const cnu_plot_by_erc = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
  } = {},
) =>
  cnu_plot(data, {
    width: width,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    sort: sort,
    x_accessor: x_accessor,
    y_accessor: y_accessor,
    fill_accessor: fill_accessor,
  })

export const cnu_by_aap_plot_by_erc = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
  } = {},
) =>
  cnu_by_aap_plot(data, {
    width: width,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    sort: sort,
    x_accessor: x_accessor,
    y_accessor: y_accessor,
    fill_accessor: fill_accessor,
  })

export const cnu_by_aap_plot_by_erc_2 = (
  data,
  {
    width = 600,
    marginTop = 50,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fy_accessor = (d) => d[2],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
  } = {},
) =>
  cnu_by_aap_plot_2(data, {
    width: width,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    sort: sort,
    x_accessor: x_accessor,
    y_accessor: y_accessor,
    fy_accessor: fy_accessor,
    fill_accessor: fill_accessor,
  })

export const erc_donut = (data, width, height) =>
  donutChart(data, {
    ...default_donut_config,
    width: width * 0.6,
    height: height,
    legendWidth: width * 0.6,
    color: erc_color_scale,
  })

// Get relevant data by project,
// set auditioned flag to true if filtering out non-auditioned project data
// set financed flag to true if filtering out non-financed project data
export function formatResearcherDataByProject(
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

  const cnu_count_by_custom_category = new Map(cnu_count_by_category)
  cnu_count_by_custom_category.set(
    'Lettres et sciences humaines',
    cnu_count_by_custom_category.get('Lettres et sciences humaines') +
      cnu_count_by_custom_category.get('Droit, économie et gestion') +
      cnu_count_by_custom_category.get('Pluridisciplinaire'),
  )
  cnu_count_by_custom_category.delete('Droit, économie et gestion')
  cnu_count_by_custom_category.delete('Pluridisciplinaire')

  const keyword_count = countEntities(filtered_researchers, (d) => d.keywords)
    .filter((d) => !!d[0])
    .sort((a, b) => d3.descending(a[1], b[1]))

  const keywords_by_cnu = d3
    .rollups(
      filtered_researchers.filter((d) => getGroupFromCNU(d.cnu)),
      (D) => D.flatMap((d) => d.keywords),
      (d) => d.cnu,
    )
    .flatMap(([cnu, keywords]) =>
      keywords.flatMap((keyword) => ({ cnu, keyword })),
    )

  const unique_keywords_by_cnu = d3
    .rollups(
      filtered_researchers.filter((d) => getGroupFromCNU(d.cnu)),
      (D) => new Set(D.flatMap((d) => d.keywords)),
      (d) => d.cnu,
    )
    .flatMap(([cnu, keywords]) =>
      [...keywords].flatMap((keyword) => ({ cnu, keyword })),
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
          keywords: researcher.keywords,
          cnu: researcher.cnu,
        })),
  )

  const grouped_projects_by_keyword = d3.rollup(
    filtered_researcher_projects,
    (D) => new Set(D.flatMap((d) => d.keywords)),
    (d) => d.project,
  )
  console.debug('grouped_projects_by_keyword', grouped_projects_by_keyword)

  const keyword_project_matrix = generateIntersectionMatrix(
    grouped_projects_by_keyword,
  )

  const grouped_projects_by_cnu = d3.rollup(
    filtered_researcher_projects,
    (D) => new Set(D.map((d) => d.cnu)),
    (d) => d.project,
  )
  console.debug('grouped_projects_by_cnu', grouped_projects_by_cnu)

  const cnu_project_matrix = generateIntersectionMatrix(grouped_projects_by_cnu)

  const grouped_cnu_group_by_keyword = d3.rollup(
    filtered_researcher_projects.filter((d) => getGroupFromCNU(d.cnu)),
    (D) => new Set(D.flatMap((d) => d.keywords)),
    (d) => getGroupFromCNU(d.cnu),
  )

  const cnu_group_keyword_matrix = generateIntersectionMatrix(
    grouped_cnu_group_by_keyword,
  )

  const grouped_cnu_by_keyword = d3.rollup(
    filtered_researcher_projects.filter((d) => getGroupFromCNU(d.cnu)),
    (D) => new Set(D.flatMap((d) => d.keywords)),
    (d) => cropText(d.cnu),
  )

  const cnu_keyword_matrix = generateIntersectionMatrix(grouped_cnu_by_keyword)

  return {
    discipline_erc_count,
    cnu_count,
    cnu_count_by_category,
    cnu_count_by_custom_category: [...cnu_count_by_custom_category],
    keyword_count,
    keyword_project_matrix,
    keyword_projects: [...grouped_projects_by_keyword.keys()],
    keywords_by_cnu,
    unique_keywords_by_cnu,
    cnu_project_matrix,
    cnu_projects: [...grouped_projects_by_cnu.keys()],
    cnu_group_keyword_matrix,
    cnu_group_keywords: [...grouped_cnu_group_by_keyword.keys()],
    cnu_keyword_matrix,
    cnu_keywords: [...grouped_cnu_by_keyword.keys()],
  }
}

export const keyword_plot = (
  data,
  width,
  keyword_plot_sort,
  keyword_color_scale,
) =>
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
        fill: (d) => keyword_color_scale(d.keyword),
        sort: { y: keyword_plot_sort },
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
      keywords: d.keywords,
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

// keywords

export const keyword_by_aap_status = (researcher_by_aap_status) =>
  d3.sort(
    researcher_by_aap_status
      .filter((d) => d.keywords)
      .flatMap((d) =>
        d.keywords.map((t) => ({
          ...d,
          keyword: t,
          submitted: 'submitted',
        })),
      ),
    (d) => d.keyword,
  )

export const keyword_by_aap_status_graph = (keyword_by_aap_status) =>
  parallelSetToGraph(keyword_by_aap_status, [
    'submitted',
    'auditioned',
    'financed',
  ])

export const keyword_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => aap_state_color_scale(d.path.slice(-2).join('-')),
})

// labs

export const lab_by_aap_status = (aap_data) =>
  aap_data.projects.flatMap((project) => {
    const project_labs = project.labs.map((lab_name) =>
      aap_data.laboratories.find((l) => l.lab === lab_name),
    )
    return project_labs
      .filter((l) => l !== undefined)
      .map((l) => ({
        lab: cropText(l.lab, 30),
        erc: aap_data.laboratories_by_domains_erc
          .filter((d) => d.lab === l.lab)
          .map((d) => d.domain),
        erc_disciplines: aap_data.laboratories_by_disciplines_erc
          .filter((d) => d.lab === l.lab)
          .map((d) => d.discipline),
        hceres: aap_data.laboratories_by_domains_hceres
          .filter((d) => d.lab === l.lab)
          .map((d) => d.domain),
        hceres_disciplines: aap_data.laboratories_by_disciplines_hceres
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
      .filter(
        (d) =>
          d.erc.filter((domain) => !['', 'Non Renseigné'].includes(domain))
            .length > 0,
      )
      .flatMap((d) => d.erc.map((domain) => ({ ...d, erc: domain }))),
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
      .filter((d) => d.hceres.filter((h) => h !== 'Non renseigné').length > 0)
      .flatMap((d) => d.hceres.map((domain) => ({ ...d, hceres: domain }))),
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
