import {
  selectAll,
  map,
  filter,
  group,
  tree,
  hierarchy,
  stratify,
  create,
  linkRadial,
} from 'd3'
import { cellToStrings } from './utilities.js'

/**
 * Convert tabular rows into a nested `{name, count, children}` tree with one
 * level per column, in the given order, beneath a single root. Rows sharing
 * the same values along a path are merged into one branch, and `count` holds
 * the number of rows passing through each node. A multi-valued cell (split on
 * `delimiter`) branches the row into every one of its values.
 *
 * @param {Object[]} data - the rows to convert
 * @param {string[]} columns - column names of the tree levels, from the root outwards
 * @param {Object} [options={}]
 * @param {string} [options.rootName='root'] - name of the root node
 * @param {string|null} [options.delimiter=null] - separator for multi-valued cells
 * @param {string|null} [options.emptyLabel=null] - node name given to empty cells;
 *   when null, a row's branch stops at its first empty cell
 * @returns {Object} a nested `{name, count, children}` tree (leaves have no `children`)
 */
export function columnsToTree(
  data,
  columns,
  { rootName = 'root', delimiter = null, emptyLabel = null } = {},
) {
  const newNode = (name) => ({ name, count: 0, children: new Map() })
  const root = newNode(rootName)

  data.forEach((row) => {
    root.count += 1
    let branches = [root]
    for (const column of columns) {
      let values = [...new Set(cellToStrings(row[column], delimiter))]
      if (values.length === 0) {
        if (emptyLabel == null) break
        values = [emptyLabel]
      }
      branches = branches.flatMap((parent) =>
        values.map((value) => {
          if (!parent.children.has(value))
            parent.children.set(value, newNode(value))
          const child = parent.children.get(value)
          child.count += 1
          return child
        }),
      )
    }
  })

  // replace child maps with arrays, dropping them from leaves
  const toObject = ({ name, count, children }) =>
    children.size
      ? { name, count, children: Array.from(children.values(), toObject) }
      : { name, count }

  return toObject(root)
}

/**
 * Convert a flat list of project objects into a d3-hierarchy-compatible
 * nested tree, rooted at 'PEPR VDBI' -> projects -> properties -> values
 *
 * @param {Object[]} projects - project entities to convert (each with an `acronyme` field)
 * @returns {Object} a nested `{name, children}` tree
 */
export function mapEntitesToProjectTree(projects) {
  // map graph to d3 hierarchy format
  const projectTree = {
    name: 'PEPR VDBI',
    children: map(projects, (project) => {
      const projectChildren = filter(
        // filter out project ids and acronymes
        Object.entries(project),
        ([key, _values]) => {
          return key != 'id' && key != 'acronyme'
        },
      ).map(([key, values]) => {
        return {
          name: key,
          children:
            // if values is a string, map it to a single object, otherwise iterate over the array
            typeof values == 'string'
              ? [
                  {
                    name: values,
                    children: [],
                  },
                ]
              : values.map((d) => {
                  return {
                    name: d,
                    children: [],
                  }
                }),
        }
      })
      return {
        name: project.acronyme,
        // map datum values to children
        children: projectChildren,
      }
    }),
  }

  return projectTree
}

// col I : produit (ou resultats) de la recherche (primaire) -> J : secondaire -> H : Quelles actions pour quelles solutions -> A : acronyme
/**
 * Group projects by primary/secondary product and action, then nest each
 * project's full subtree (from mapEntitesToProjectTree) underneath, for a
 * product-oriented dendrogram
 *
 * @param {Object[]} projects - project entities, each with `produit` (array) and `action` fields
 * @returns {Object} a nested `{name, children}` tree rooted at 'PEPR VDBI'
 */
export function mapEntitesToProductToProjectTree(projects) {
  // Group projects by primary, secondary products/results, then actions
  const projectByProduct = group(
    projects,
    (project) => project.produit[0],
    (project) => project.produit[1],
    (project) => project.action,
  )
  console.debug('projectByProduct', projectByProduct)

  // this will be added to the project leaves to map all info
  const projectTree = mapEntitesToProjectTree(projects).children

  console.debug('projectTree', projectTree)

  // this code could/should be made generic to work with any length of grouping ?
  const projectToProductTree = {
    name: 'PEPR VDBI',
    children: map(projectByProduct.entries(), ([key, value]) => {
      return {
        // primary product name
        name: key,
        // secondary product children
        children: map(value.entries(), ([key, value]) => {
          return {
            // secondary product name
            name: key,
            // action children
            children: map(value.entries(), ([key, value]) => {
              return {
                // action name
                name: key,
                // project children
                children: map(value, (project) => {
                  return {
                    // project name
                    name: project.acronyme,
                    // get this project with its descendants
                    children: projectTree
                      .find((d) => d.name == project.acronyme)
                      .children.filter(
                        // filter out acronyme, actions, and products (we already added them to the tree as ancestors)
                        (d) =>
                          d.name != 'action' &&
                          d.name != 'produit' &&
                          d.name != 'acronyme',
                      ),
                  }
                }),
              }
            }),
          }
        }),
      }
    }),
  }
  console.debug('projectToProductTree', projectToProductTree)

  return projectToProductTree
}

/**
 * Build an interactive, collapsible radial dendrogram (click a node to
 * expand/collapse its children) from tabular or hierarchical data.
 * Adapted from the Observable "Collapsible tree" / "Radial tree" examples.
 *
 * @param {Object[]|Object} data - tabular data (array of objects) or a nested hierarchy object
 * @param {Object} [options]
 * @param {Function} [options.path] - alternative to id/parentId; returns an array identifier, imputing internal nodes
 * @param {Function} [options.id] - for tabular data, given a datum returns its unique identifier (string)
 * @param {Function} [options.parentId] - for tabular data, given a datum returns its parent's identifier
 * @param {Function} [options.children] - for hierarchical data, given a datum returns its children
 * @param {Function} [options.separation] - node separation function for the tree layout
 * @param {Function} [options.sort] - comparator used to sort nodes prior to layout
 * @param {number} [options.duration=500] - transition duration in ms
 * @param {number} [options.width=640] - outer width, in pixels
 * @param {number} [options.height=640] - outer height, in pixels
 * @param {number} [options.margin=60] - shorthand for all margins
 * @param {number} [options.marginTop] - top margin, in pixels
 * @param {number} [options.marginRight] - right margin, in pixels
 * @param {number} [options.marginBottom] - bottom margin, in pixels
 * @param {number} [options.marginLeft] - left margin, in pixels
 * @param {number} [options.textLength=15] - label cutoff length
 * @param {number} [options.radius] - outer radius
 * @param {number} [options.r=3] - radius of nodes
 * @param {string} [options.fill='#999'] - fill for nodes
 * @param {number} [options.fillOpacity] - fill opacity for nodes
 * @param {number} [options.fontsize=10] - font size for labels
 * @param {string} [options.expandedLabelAnchor='outward'] - where expanded nodes' labels point: 'inward' (towards the center), 'outward' (away from the center, like leaves), or 'middle' (centered on the node)
 * @param {number} [options.expandedLabelOffset=fontsize] - perpendicular offset, in pixels, of expanded nodes' labels so they don't overlap the incoming link
 * @param {string} [options.stroke='#555'] - stroke for links
 * @param {number} [options.strokeWidth=1.5] - stroke width for links
 * @param {number} [options.strokeOpacity=0.4] - stroke opacity for links
 * @param {string} [options.strokeLinejoin] - stroke line join for links
 * @param {string} [options.strokeLinecap] - stroke line cap for links
 * @param {string} [options.halo='#fff'] - color of the label halo
 * @param {number} [options.haloWidth=3] - padding around the labels
 * @param {boolean} [options.dynamicPositioning=true] - recalculate node positions according to radius on every update
 * @param {number} [options.expandDepth=1] - nodes at this depth or deeper start collapsed (1 = only the root is expanded)
 * @param {number} [options.radialOffset=0] - rotation of the whole dendrogram, in degrees clockwise
 * @returns {SVGElement} the rendered radial dendrogram
 */
export function collapsableRadialDendrogram(
  data,
  {
    // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    separation = (a, b) => (a.parent == b.parent ? 1 : 2) / a.depth,
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    duration = 500, // transition duration
    width = 640, // outer width, in pixels
    height = 640, // outer height, in pixels
    margin = 60, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    textLength = 15, // label cutoff length
    radius = Math.min(
      width - marginLeft - marginRight,
      height - marginTop - marginBottom,
    ) / 2, // outer radius
    r = 3, // radius of nodes
    fill = '#999', // fill for nodes
    fillOpacity, // fill opacity for nodes
    fontsize = 10, // font size for labels
    expandedLabelAnchor = 'outward', // 'inward', 'outward', or 'middle' label placement for expanded nodes
    expandedLabelOffset = fontsize, // perpendicular offset of expanded nodes' labels, so they sit beside the incoming link
    stroke = '#555', // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = '#fff', // color of label halo
    haloWidth = 3, // padding around the labels
    dynamicPositioning = true, // recalculate positions according to radius on update
    expandDepth = 1, // nodes at this depth or deeper start collapsed
    radialOffset = 0, // rotation of the whole dendrogram, in degrees clockwise
  } = {},
) {
  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root =
    path != null
      ? stratify().path(path)(data)
      : id != null || parentId != null
        ? stratify().id(id).parentId(parentId)(data)
        : hierarchy(data, children)

  // Sort the nodes.
  if (sort != null) root.sort(sort)

  // Compute the layout.
  layout()

  root.x0 = height / 2
  root.y0 = 0
  // root.children.forEach((d) => {
  //   d.x0 = d.x
  //   d.y0 = d.y
  // })

  const svg = create('svg')
    .attr('viewBox', [-marginLeft - radius, -marginTop - radius, width, height])
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
    .attr('font-family', 'sans-serif')
    .attr('font-size', fontsize)

  // Do the first update to the initial configuration of the tree — where nodes
  // shallower than expandDepth are open.
  root.descendants().forEach((d, i) => {
    d.x0 = d.x
    d.y0 = d.y
    d.id = i
    if (d.depth >= expandDepth) {
      d._children = d.children
      d.children = null
    } else {
      d._children = null
    }
  })
  console.debug(root.descendants())

  // const zoomF = zoom().on("zoom", handleZoom)

  // svg.call(zoomF)

  update(root)
  return svg.node()

  /**
   * Re-render and transition the dendrogram's nodes and links from a given
   * source node's previous position (used on init and on click-toggle)
   *
   * @param {Object} source - the d3 hierarchy node to transition from
   * @returns {void}
   */
  function update(source) {
    const nodes = root.descendants()
    const links = root.links()

    if (dynamicPositioning) {
      // Recompute the layout.
      layout()
    }

    // Create a transition
    const transition = svg.transition().duration(duration)

    // Update the nodes
    const node = svg.selectAll('g.node').data(nodes, (d) => d.id)

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        (_d) =>
          `rotate(${(source.x * 180) / Math.PI - 90}) translate(${source.y},0)`,
      )
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', (_event, d) => {
        console.debug(root.descendants())
        click(d)
      })
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all')

    nodeEnter
      .append('circle')
      .attr('r', r)
      .attr('fill', (d) => (d._children ? stroke : fill))
      .attr('stroke-width', strokeWidth)

    nodeEnter
      .append('text')
      .attr('dy', '0.32em')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', labelAnchor)
      // crop node names longer than textLength characters
      .text((d) => {
        return d.data.name.length > textLength
          ? d.data.name.slice(0, textLength).concat('...')
          : d.data.name
      })
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', haloWidth)
      .attr('stroke', halo)
      .attr('paint-order', 'stroke')
      .attr('class', 'node_label')

    // Transition nodes to their new position.
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr(
        'transform',
        (d) =>
          `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0) rotate(${
            d.x >= Math.PI ? 180 : 0
          })`,
      )
      .attr('fill-opacity', fillOpacity)
      .attr('stroke-opacity', strokeOpacity)

    nodeUpdate
      .select('circle')
      .attr('r', r)
      .style('fill', function (d) {
        return d._children ? stroke : fill
      })

    nodeUpdate
      .select('text')
      .style('fill-opacity', fillOpacity)
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', labelAnchor)

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node
      .exit()
      .transition(transition)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 0)
      .remove()

    nodeExit.select('circle').attr('r', 1)

    // Update the links…
    const link = svg.selectAll('path.link').data(links, (d) => d.target.id)

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        linkRadial()
          .angle((_d) => source.x)
          .radius((_d) => source.y0),
      )
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-opacity', strokeOpacity)
      .attr('stroke-linecap', strokeLinecap)
      .attr('stroke-linejoin', strokeLinejoin)
      .attr('stroke-width', strokeWidth)

    // Transition links to their new position.
    link
      .merge(linkEnter)
      .transition(transition)
      .attr(
        'd',
        linkRadial()
          .angle((d) => d.x)
          .radius((d) => d.y),
      )

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition(transition)
      .remove()
      .attr(
        'd',
        linkRadial()
          .angle((_d) => source.x)
          .radius((_d) => source.y),
      )

    // Stash the old positions for transition.
    root.descendants((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }

  /**
   * Compute the tree layout, then rotate every node by radialOffset. Angles
   * are kept within [0, 2π) so that label flipping on the left half still works
   *
   * @returns {void}
   */
  function layout() {
    tree()
      .size([2 * Math.PI, radius])
      .separation(separation)(root)
    const offset = (radialOffset * Math.PI) / 180
    root.each((d) => {
      d.x = (((d.x + offset) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    })
  }

  /**
   * Whether a node is the root of the tree, i.e. has no parent
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {boolean} true if the node is the root
   */
  function isRoot(d) {
    return !d.parent
  }

  /**
   * Whether a node is expanded, i.e. shows its children. The root is excluded:
   * it has no incoming link, so its label is placed like a leaf's
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {boolean} true if the node is a non-root expanded node
   */
  function isExpanded(d) {
    return !!d.children && !isRoot(d)
  }

  /**
   * Whether a non-root node's label points away from the center: always for
   * leaves, and for expanded nodes when expandedLabelAnchor is 'outward'
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {boolean} true if the label points outward
   */
  function labelPointsOutward(d) {
    return !isExpanded(d) || expandedLabelAnchor === 'outward'
  }

  /**
   * Compute a label's text-anchor. The root's is always start; other
   * nodes on the left half are rotated by 180°, so the anchor pointing outward
   * flips from 'start' to 'end' there
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {string} the label's text-anchor
   */
  function labelAnchor(d) {
    if (isRoot(d)) return d.x > Math.PI ? 'start' : 'end'
    if (isExpanded(d) && expandedLabelAnchor === 'middle') return 'middle'
    return d.x < Math.PI === labelPointsOutward(d) ? 'start' : 'end'
  }

  /**
   * Compute a label's distance from its node, along the radius
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {number} the label's x offset, in pixels
   */
  function labelX(d) {
    if (isRoot(d)) return d.x > Math.PI ? 6 : -6
    if (isExpanded(d) && expandedLabelAnchor === 'middle') return 0
    return d.x < Math.PI === labelPointsOutward(d) ? 6 : -6
  }

  /**
   * Compute a label's perpendicular offset: expanded nodes' labels point back
   * along the incoming link, so shift them beside it to keep them readable
   *
   * @param {Object} d - the d3 hierarchy node
   * @returns {number} the label's y offset, in pixels
   */
  function labelY(d) {
    return isExpanded(d) ? -expandedLabelOffset : 0
  }

  /**
   * Toggle a node's children/`_children` to expand or collapse it, then
   * re-render the dendrogram from that node
   *
   * @param {Object} d - the clicked d3 hierarchy node
   * @returns {void}
   */
  function click(d) {
    if (d.children) {
      d._children = d.children
      d.children = null
    } else {
      d.children = d._children
      d._children = null
    }
    update(d)
  }

  /**
   * A handler function for selecting elements to transform during a zoom event
   *
   * @param {D3ZoomEvent} event the zoom event containing information on how the svg canvas is being translated and scaled
   */
  function handleZoom(event) {
    selectAll('svg g')
      .filter((_d, i) => i < 2)
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('transform', event.transform)
      .attr(
        'transform',
        'translate(' +
          event.transform.x +
          ',' +
          event.transform.y +
          ') scale(' +
          event.transform.k +
          ')',
      )
    selectAll('text.node_label')
      // .style("font-size", fontSize / event.transform.k + "px")
      .attr(
        'transform',
        'translate(' +
          event.transform.x +
          ',' +
          event.transform.y +
          ') scale(' +
          event.transform.k +
          ')',
      )
  }
}
