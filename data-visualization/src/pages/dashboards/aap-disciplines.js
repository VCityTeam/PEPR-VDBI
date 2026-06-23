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

/**
 * Build an ordinal Plot.legend for ERC domain colors
 *
 * @returns {Element} the rendered legend
 */
export const erc_legend = () =>
  Plot.legend({
    color: {
      domain: erc_color_scale.domain(),
      range: erc_color_scale.range(),
      type: 'ordinal',
    },
  })

/**
 * Horizontal bar plot of CNU section occurrence counts
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}]
 * @param {number} [options.width=600] - chart width
 * @param {number} [options.marginTop=20] - chart top margin
 * @param {number} [options.marginLeft=18] - chart left margin
 * @param {number} [options.marginRight=250] - chart right margin
 * @param {string} [options.sort='y'] - Plot sort specification applied to the y axis
 * @param {Function} [options.x_accessor] - accessor for the bar length (count)
 * @param {Function} [options.y_accessor] - accessor for the CNU label
 * @param {Function} [options.fill_accessor] - accessor for the bar fill color
 * @param {Function} [options.opacity_accessor] - accessor for the bar fill opacity
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_plot = (
  data,
  {
    width = 600,
    marginTop = 20,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) =>
      cnu_dark_color_map.get(getGroupFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
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
      }),
      Plot.barX(data, {
        y: y_accessor,
        x: x_accessor,
        fill: fill_accessor,
        fillOpacity: opacity_accessor,
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

/**
 * Horizontal bar plot of CNU section occurrence counts, colored and
 * legended by AAP round
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}]
 * @param {number} [options.width=600] - chart width
 * @param {number} [options.marginTop=50] - chart top margin
 * @param {number} [options.marginLeft=18] - chart left margin
 * @param {number} [options.marginRight=250] - chart right margin
 * @param {string} [options.sort='y'] - Plot sort specification applied to the y axis
 * @param {Function} [options.x_accessor] - accessor for the bar length (count)
 * @param {Function} [options.y_accessor] - accessor for the CNU label
 * @param {Function} [options.fill_accessor] - accessor for the bar fill (AAP round) color
 * @param {Function} [options.opacity_accessor] - accessor for the bar fill opacity
 * @returns {SVGElement} the rendered bar plot
 */
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
    opacity_accessor = () => 1,
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
      }),
      Plot.barX(data, {
        y: y_accessor,
        x: x_accessor,
        fill: fill_accessor,
        fillOpacity: opacity_accessor,
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

/**
 * Vertical (y-axis bar) variant of cnu_plot
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}]
 * @param {number} [options.width=600] - chart width
 * @param {number} [options.height=800] - chart height
 * @param {number} [options.marginTop=50] - chart top margin
 * @param {number} [options.marginLeft=50] - chart left margin
 * @param {number} [options.marginRight=50] - chart right margin
 * @param {number} [options.marginBottom=100] - chart bottom margin
 * @param {string} [options.sort='y'] - Plot sort specification applied to the x axis
 * @param {Function} [options.x_accessor] - accessor for the bar length (count)
 * @param {Function} [options.y_accessor] - accessor for the CNU label
 * @param {Function} [options.fill_accessor] - accessor for the bar fill color
 * @param {Function} [options.opacity_accessor] - accessor for the bar fill opacity
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_plot_y = (
  data,
  {
    width = 600,
    height = 800,
    marginTop = 50,
    marginLeft = 50,
    marginRight = 50,
    marginBottom = 100,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) =>
      cnu_dark_color_map.get(getGroupFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginBottom: marginBottom,
    y: {
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    x: {
      type: 'band',
      domain: cnu_section_label_map.values(),
    },
    color: {
      // legend: true,
      type: 'categorical',
    },
    marks: [
      Plot.axisX({
        label: 'CNU',
        anchor: 'bottom',
        lineWidth: 24,
        textOverflow: 'ellipsis',
        tickRotate: 40,
        fontSize: 11,
      }),
      Plot.barY(data, {
        y: x_accessor,
        x: y_accessor,
        fill: fill_accessor,
        fillOpacity: opacity_accessor,
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { x: sort },
        tip: true,
      }),
      Plot.barY(
        data,
        Plot.pointerX({
          x: y_accessor,
          y: x_accessor,
          fill: 'white',
          opacity: 0.5,
        }),
      ),
    ],
  })

/**
 * Vertical variant of cnu_by_aap_plot
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}]
 * @param {number} [options.width=600] - chart width
 * @param {number} [options.height=800] - chart height
 * @param {number} [options.marginTop=50] - chart top margin
 * @param {number} [options.marginLeft=50] - chart left margin
 * @param {number} [options.marginRight=50] - chart right margin
 * @param {number} [options.marginBottom=100] - chart bottom margin
 * @param {string} [options.sort='y'] - Plot sort specification applied to the x axis
 * @param {Function} [options.x_accessor] - accessor for the bar length (count)
 * @param {Function} [options.y_accessor] - accessor for the CNU label
 * @param {Function} [options.fill_accessor] - accessor for the bar fill (AAP round) color
 * @param {Function} [options.opacity_accessor] - accessor for the bar fill opacity
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_by_aap_plot_y = (
  data,
  {
    width = 600,
    height = 800,
    marginTop = 50,
    marginLeft = 50,
    marginRight = 50,
    marginBottom = 100,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => d[0],
    opacity_accessor = () => 1,
  } = {},
) =>
  Plot.plot({
    width: width,
    height: height,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginBottom: marginBottom,
    y: {
      grid: true,
      axis: 'both',
      label: 'Occurences',
    },
    x: {
      type: 'band',
      domain: cnu_section_label_map.values(),
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
    marks: [
      Plot.axisX({
        label: 'CNU',
        anchor: 'bottom',
        lineWidth: 24,
        textOverflow: 'ellipsis',
        tickRotate: 40,
        fontSize: 11,
      }),
      Plot.barY(data, {
        x: y_accessor,
        y: x_accessor,
        fill: fill_accessor,
        fillOpacity: opacity_accessor,
        stroke: 'black',
        strokeOpacity: 0.1,
        sort: { y: sort },
        tip: true,
      }),
      Plot.barY(
        data,
        Plot.pointerX({
          x: y_accessor,
          y: x_accessor,
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

/**
 * Donut chart of CNU counts grouped by category
 *
 * @param {Object} data - an object with a `cnu_count_by_category` field (rows of `[category, count]`)
 * @param {number} width - chart width
 * @returns {SVGElement} the rendered donut chart
 */
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

/**
 * Donut chart variant of cnu_group_donut, taking pre-shaped count data
 * directly (rows of `[category, count]`) instead of a wrapping object
 *
 * @param {Array} data - count data, rows of `[category, count]`
 * @param {number} width - chart width
 * @returns {SVGElement} the rendered donut chart
 */
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

/**
 * cnu_plot wrapper colored by the ERC domain corresponding to each CNU
 * section
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}] - same as cnu_plot, with fill_accessor defaulting to an ERC-domain color
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_plot_by_erc = (
  data,
  {
    width = 600,
    marginTop = 20,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
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
    opacity_accessor: opacity_accessor,
  })

/**
 * cnu_by_aap_plot wrapper colored by the ERC domain corresponding to each
 * CNU section
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}] - same as cnu_by_aap_plot, with fill_accessor defaulting to an ERC-domain color
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_by_aap_plot_by_erc = (
  data,
  {
    width = 600,
    marginTop = 20,
    marginLeft = 18,
    marginRight = 250,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
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
    opacity_accessor: opacity_accessor,
  })

/**
 * cnu_plot_y wrapper colored by the ERC domain corresponding to each CNU
 * section
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}] - same as cnu_plot_y, with fill_accessor defaulting to an ERC-domain color
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_plot_y_by_erc = (
  data,
  {
    width = 600,
    height = 800,
    marginTop = 20,
    marginLeft = 20,
    marginRight = 180,
    marginBottom = 180,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
  } = {},
) =>
  cnu_plot_y(data, {
    width: width,
    height: height,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginBottom: marginBottom,
    sort: sort,
    x_accessor: x_accessor,
    y_accessor: y_accessor,
    fill_accessor: fill_accessor,
    opacity_accessor: opacity_accessor,
  })

/**
 * cnu_by_aap_plot_y wrapper colored by the ERC domain corresponding to each
 * CNU section
 *
 * @param {Array} data - count data, rows of `[cnu_label, count]`
 * @param {Object} [options={}] - same as cnu_by_aap_plot_y, with fill_accessor defaulting to an ERC-domain color
 * @returns {SVGElement} the rendered bar plot
 */
export const cnu_by_aap_plot_y_by_erc = (
  data,
  {
    width = 600,
    height = 800,
    marginTop = 20,
    marginLeft = 20,
    marginRight = 180,
    marginBottom = 180,
    sort = 'y',
    x_accessor = (d) => d[1],
    y_accessor = (d) => d[0],
    fill_accessor = (d) => erc_color_scale(getERCFromCNU(y_accessor(d))),
    opacity_accessor = () => 1,
  } = {},
) =>
  cnu_by_aap_plot_y(data, {
    width: width,
    height: height,
    marginTop: marginTop,
    marginLeft: marginLeft,
    marginRight: marginRight,
    marginBottom: marginBottom,
    sort: sort,
    x_accessor: x_accessor,
    y_accessor: y_accessor,
    fill_accessor: fill_accessor,
    opacity_accessor: opacity_accessor,
  })

/**
 * Donut chart of ERC domain counts
 *
 * @param {Array} data - count data, rows of `[erc_domain, count]`
 * @param {number} width - chart width
 * @param {number} height - chart height
 * @param {Object} [options={}] - additional donutChart options, merged over the defaults
 * @returns {SVGElement} the rendered donut chart
 */
export const erc_donut = (data, width, height, options = {}) =>
  donutChart(data, {
    ...default_donut_config,
    width: width * 0.6,
    height: height,
    legendWidth: width * 0.6,
    legendTextLength: 28,
    color: erc_color_scale,
    ...options,
  })

/**
 * Filter researchers by project/audition/financing status and compute CNU,
 * ERC discipline, and keyword count breakdowns, plus keyword/CNU
 * intersection matrices for chord/sankey charts
 *
 * @param {Object} phase_1_data - phase 1 dataset with a `researchers` array (each with `project`, `discipline_erc`, `cnu`, `keywords`)
 * @param {string[]} auditioned_projects - acronyms of auditioned projects
 * @param {string[]} financed_projects - acronyms of financed projects
 * @param {string} [project] - if provided, restrict to researchers on this project
 * @param {boolean} [auditioned=false] - if true, restrict to researchers with at least one auditioned project
 * @param {boolean} [financed=false] - if true, restrict to researchers with at least one financed project
 * @returns {Object} an object with `discipline_erc_count`, `cnu_count`, `cnu_count_by_category`,
 *   `cnu_count_by_custom_category`, `keyword_count`, `keyword_project_matrix`, `keyword_projects`,
 *   `keywords_by_cnu`, `unique_keywords_by_cnu`, `cnu_project_matrix`, `cnu_projects`,
 *   `cnu_group_keyword_matrix`, `cnu_group_keywords`, `cnu_keyword_matrix`, `cnu_keywords`
 */
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

/**
 * Horizontal bar plot of researcher keyword occurrences by CNU
 *
 * @param {Object[]} data - keyword rows, each with `cnu` and `keyword` fields
 * @param {number} width - chart width
 * @param {string} keyword_plot_sort - Plot sort specification applied to the y axis
 * @param {Function} keyword_color_scale - color scale mapping a keyword to a fill color
 * @returns {SVGElement} the rendered bar plot
 */
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

/**
 * Compute ERC and CNU domain percentage ratios for a labeled dataset, used
 * in the overview summary tables
 *
 * @param {string} label - the row label (e.g. project name)
 * @param {Object} data - output of formatResearcherDataByProject, with `discipline_erc_count` and `cnu_count_by_category`
 * @returns {Object} an object with `label` and ERC/CNU domain ratio fields (`erc_sh_ratio`, `erc_pe_ratio`, `erc_ls_ratio`, `cnu_droit_ratio`, `cnu_shs_ratio`, `cnu_science_ratio`, `cnu_pluri_ratio`, `cnu_sante_ratio`)
 */
export function formatDomainPercents(label, data) {
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

/**
 * Check whether any project in a list is in the financed-projects list
 *
 * @param {string[]} projects - project acronyms to check
 * @param {string[]} financed_projects - acronyms of financed projects
 * @returns {boolean} true if at least one project is financed
 */
export function isFinanced(projects, financed_projects) {
  for (let index = 0; index < projects.length; index++) {
    if (financed_projects.includes(projects[index])) return true
  }
  return false
}

/**
 * Generate a configuration for a parallel-set (sankey) graph
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const sankey_config = (data, width) => ({
  width: width,
  height: data.nodes.length * 40,
  nodeFill: () => 'rgba(1,1,1,0.9)',
  linkFillOpacity: 0.3,
})

/**
 * Map projects to a submitted/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} projects - project entities, each with `auditioned`/`financed` booleans
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
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

/**
 * Annotate researchers with auditioned/financed status derived from their
 * projects
 *
 * @param {Object[]} researchers - researcher entities, each with `project` (array of acronyms) and `cnu`/`keywords` fields
 * @param {Object[]} projects - project entities, each with `acronyme`, `auditioned`, `financed` fields
 * @returns {Object[]} an array of `{cnu, cnu_category, keywords, auditioned, financed}` rows
 */
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

/**
 * Sort researcher-by-status records by CNU code (ascending)
 *
 * @param {Object[]} researcher_by_aap_status - output of researcher_by_aap_status
 * @returns {Object[]} the same array, sorted in place by CNU code
 */
export const cnu_by_aap_status = (researcher_by_aap_status) =>
  researcher_by_aap_status.sort(
    (a, b) => Number(a.cnu.slice(0, 2)) - Number(b.cnu.slice(0, 2)),
  )

/**
 * Convert CNU/status records into a CNU/auditioned/financed parallel-sets
 * graph
 *
 * @param {Object[]} cnu_by_aap_status - output of cnu_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const cnu_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(cnu_by_aap_status, ['cnu', 'auditioned', 'financed'])

/**
 * Filter CNU/status records by CNU category, then build a parallel-sets
 * graph
 *
 * @param {Object[]} cnu_by_aap_status - output of cnu_by_aap_status
 * @param {string} category - the CNU category to filter to
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const cnu_category_by_aap_status_graph = (cnu_by_aap_status, category) =>
  cnu_by_aap_status_graph(
    cnu_by_aap_status.filter((d) => d.cnu_category === category),
  )

/**
 * Filter CNU/status records to CNRS SHS-equivalent categories, then build a
 * parallel-sets graph
 *
 * @param {Object[]} cnu_by_aap_status - output of cnu_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
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

/**
 * Build a CNU category/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} cnu_by_aap_status - output of cnu_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
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

/**
 * Map each CNU category to its ERC-equivalent discipline, then build a
 * parallel-sets graph
 *
 * @param {Object[]} cnu_by_aap_status - output of cnu_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const custom_discipline_by_aap_status_graph = (cnu_by_aap_status) =>
  parallelSetToGraph(
    cnu_by_aap_status.map((d) => ({
      ...d,
      erc_discipline: cnu_erc_map.get(d.cnu_category),
    })),
    ['erc_discipline', 'auditioned', 'financed'],
  )

/**
 * Sort researcher-by-status records by CNU code (CNRS section variant,
 * identical to cnu_by_aap_status)
 *
 * @param {Object[]} researcher_by_aap_status - output of researcher_by_aap_status
 * @returns {Object[]} the same array, sorted in place by CNU code
 */
export const cnrs_section_by_aap_status = (researcher_by_aap_status) =>
  researcher_by_aap_status.sort(
    (a, b) => Number(a.cnu.slice(0, 2)) - Number(b.cnu.slice(0, 2)),
  )

/**
 * Generate a configuration for a parallel-set (sankey) graph for CNRS sections by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const cnrs_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => quantized_cnrs_color(d.path[0], data.nodes.length - 4),
})

/**
 * Get the color scale for CNRS categories
 *
 * @param {Object} d - link data
 * @returns {string} color for the link
 */
export const cnrs_category_link_color_scale = (d) =>
  cnrs_color_map.get(d.path[0])

// keywords

/**
 * Expand researcher-by-status records into one row per keyword
 *
 * @param {Object[]} researcher_by_aap_status - output of researcher_by_aap_status
 * @returns {Object[]} keyword rows, each with a `keyword` and `submitted: 'submitted'` field, sorted by keyword
 */
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

/**
 * Build a submitted/auditioned/financed parallel-sets graph for keywords by
 * status
 *
 * @param {Object[]} keyword_by_aap_status - output of keyword_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const keyword_by_aap_status_graph = (keyword_by_aap_status) =>
  parallelSetToGraph(keyword_by_aap_status, [
    'submitted',
    'auditioned',
    'financed',
  ])

/**
 * Generate a configuration for a parallel-set (sankey) graph for keywords by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const keyword_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => aap_state_color_scale(d.path.slice(-2).join('-')),
})

// labs

/**
 * Join project laboratories to their ERC/HCERES discipline data and
 * audition/financing status
 *
 * @param {Object} aap_data - AAP dataset with `projects`, `laboratories`, `laboratories_by_domains_erc`,
 *   `laboratories_by_disciplines_erc`, `laboratories_by_domains_hceres`, `laboratories_by_disciplines_hceres`
 * @returns {Object[]} lab rows, each with `lab`, `erc`, `erc_disciplines`, `hceres`, `hceres_disciplines`, `auditioned`, `financed`
 */
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

/**
 * Expand lab-by-status records into one row per ERC domain, excluding
 * empty/unspecified domains
 *
 * @param {Object[]} lab_by_aap_status - output of lab_by_aap_status
 * @returns {Object[]} ERC domain rows, sorted by domain
 */
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

/**
 * Build an ERC domain/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} erc_by_aap_status - output of erc_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const erc_by_aap_status_graph = (erc_by_aap_status) =>
  parallelSetToGraph(erc_by_aap_status, ['erc', 'auditioned', 'financed'])

/**
 * Expand lab-by-status records into one row per ERC discipline
 *
 * @param {Object[]} lab_by_aap_status - output of lab_by_aap_status
 * @returns {Object[]} ERC discipline rows, sorted numerically by discipline code
 */
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

/**
 * Build an ERC discipline/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} erc_disciplines_by_aap_status - output of erc_disciplines_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const erc_disciplines_by_aap_status_graph = (
  erc_disciplines_by_aap_status,
) =>
  parallelSetToGraph(erc_disciplines_by_aap_status, [
    'erc_discipline',
    'auditioned',
    'financed',
  ])

/**
 * Filter ERC discipline rows by category prefix, then build a parallel-sets
 * graph
 *
 * @param {Object[]} erc_disciplines_by_aap_status - output of erc_disciplines_by_aap_status
 * @param {string} category - the 2-character ERC category prefix to filter to
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const erc_discipline_category_by_aap_status_graph = (
  erc_disciplines_by_aap_status,
  category,
) =>
  erc_disciplines_by_aap_status_graph(
    erc_disciplines_by_aap_status.filter(
      (d) => d.erc_discipline.substring(0, 2) === category,
    ),
  )

/**
 * Generate a configuration for a parallel-set (sankey) graph for ERC categories by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const erc_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => erc_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})

/**
 * Generate a configuration for a parallel-set (sankey) graph for ERC disciplines by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const erc_disciplines_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => interpolated_erc_color(d.path[0]),
  linkFillOpacity: 0.4,
})

// HCERES

/**
 * Expand lab-by-status records into one row per HCERES domain, excluding
 * unspecified domains
 *
 * @param {Object[]} lab_by_aap_status - output of lab_by_aap_status
 * @returns {Object[]} HCERES domain rows, sorted by domain
 */
export const hceres_by_aap_status = (lab_by_aap_status) =>
  d3.sort(
    lab_by_aap_status
      .filter((d) => d.hceres.filter((h) => h !== 'Non renseigné').length > 0)
      .flatMap((d) => d.hceres.map((domain) => ({ ...d, hceres: domain }))),
    (d) => d.hceres,
  )

/**
 * Build an HCERES domain/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} hceres_by_aap_status - output of hceres_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const hceres_by_aap_status_graph = (hceres_by_aap_status) =>
  parallelSetToGraph(hceres_by_aap_status, ['hceres', 'auditioned', 'financed'])

/**
 * Expand lab-by-status records into one row per HCERES discipline
 *
 * @param {Object[]} lab_by_aap_status - output of lab_by_aap_status
 * @returns {Object[]} HCERES discipline rows, sorted by discipline
 */
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

/**
 * Build an HCERES discipline/auditioned/financed parallel-sets graph
 *
 * @param {Object[]} hceres_disciplines_by_aap_status - output of hceres_disciplines_by_aap_status
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const hceres_disciplines_by_aap_status_graph = (
  hceres_disciplines_by_aap_status,
) =>
  parallelSetToGraph(hceres_disciplines_by_aap_status, [
    'hceres_discipline',
    'auditioned',
    'financed',
  ])

/**
 * Filter HCERES discipline rows by category prefix, then build a
 * parallel-sets graph
 *
 * @param {Object[]} hceres_disciplines_by_aap_status - output of hceres_disciplines_by_aap_status
 * @param {string} category - the HCERES category prefix to filter to
 * @returns {Object} a parallel-sets graph ({nodes, links})
 */
export const hceres_discipline_category_by_aap_status_graph = (
  hceres_disciplines_by_aap_status,
  category,
) =>
  hceres_disciplines_by_aap_status_graph(
    hceres_disciplines_by_aap_status.filter((d) =>
      d.hceres_discipline.startsWith(category),
    ),
  )

/**
 * Generate a configuration for a parallel-set (sankey) graph for HCERES
 * categories by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
export const hceres_sankey_config = (data, width) => ({
  ...sankey_config(data, width),
  linkStroke: (d) => hceres_color_scale(d.path[0]),
  linkFillOpacity: 0.4,
})

/**
 * Generate a configuration for a parallel-set (sankey) graph for HCERES disciplines by status
 *
 * @param {Object} data - parallel-set graph ({nodes, links})
 * @param {number} width - chart width
 * @returns {Object} configuration for parallel-set graphs
 */
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
