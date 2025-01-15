import {
  selectAll,
  map,
  filter,
  group,
  tree,
  hierarchy,
  stratify,
  create,
  linkRadial
} from "npm:d3";

export function mapEntitesToProjectTree(projects) {
  // map graph to d3 hierarchy format
  const projectTree = {
    name: "PEPR VDBI",
    children: map(projects, (project) => {
      const projectChildren = filter(
        // filter out project ids and acronymes
        Object.entries(project),
        ([key, _values]) => {
          return key != "id" && key != "acronyme";
        }
      ).map(([key, values]) => {
        return {
          name: key,
          children: values.map((d) => {
            return {
              name: d,
            };
          }),
        };
      });
      return {
        name: project.acronyme[0],
        // map datum values to children
        children: projectChildren,
      };
    }),
  };

  return projectTree;
}

// col I : produit (ou resultats) de la recherche (primaire) -> J : secondaire -> H : Quelles actions pour quelles solutions -> A : acronyme
export function mapEntitesToProductToProjectTree(projects) {
  // Group projects by primary, secondary products/results, then actions
  const projectByProduct = group(
    projects,
    (project) => project.produit[0],
    (project) => project.produit[1],
    (project) => project.action[0]
  );
  console.debug("projectByProduct", projectByProduct);

  // this will be added to the project leaves to map all info
  const projectTree = mapEntitesToProjectTree(projects).children;

  console.debug("projectTree", projectTree);

  // this code could/should be made generic to work with any length of grouping ?
  const projectToProductTree = {
    name: "PEPR VDBI",
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
                    name: project.acronyme[0],
                    // get this project with its descendants
                    children: projectTree
                      .find((d) => d.name == project.acronyme[0])
                      .children.filter(
                        // filter out acronyme, actions, and products (we already added them to the tree as ancestors)
                        (d) =>
                          d.name != "action" &&
                          d.name != "produit" &&
                          d.name != "acronyme"
                      ),
                  };
                }),
              };
            }),
          };
        }),
      };
    }),
  };
  console.debug("projectToProductTree", projectToProductTree);

  return projectToProductTree;
}

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
    depth = 100, // set fixed depth
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
      height - marginTop - marginBottom
    ) / 2, // outer radius
    r = 3, // radius of nodes
    fill = "#999", // fill for nodes
    fillOpacity, // fill opacity for nodes
    fontsize = 10, // font size for labels
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo
    haloWidth = 3, // padding around the labels
    dynamicPositioning = true, // recalculate positions according to radius on update
  } = {}
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
      : hierarchy(data, children);

  // Sort the nodes.
  if (sort != null) root.sort(sort);

  // Compute the layout.
  tree()
    .size([2 * Math.PI, radius])
    .separation(separation)(root);

  root.x0 = height / 2;
  root.y0 = 0;
  // root.children.forEach((d) => {
  //   d.x0 = d.x;
  //   d.y0 = d.y;
  // });

  const svg = create("svg")
    .attr("viewBox", [-marginLeft - radius, -marginTop - radius, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", fontsize);

  // Do the first update to the initial configuration of the tree — where a number of nodes
  // are open (arbitrarily selected as the root, plus nodes with 7 letters).
  root.descendants().forEach((d, i) => {
    d.x0 = d.x;
    d.y0 = d.y;
    d.id = i;
    if (i > 0) {
      d._children = d.children;
      d.children = null;
    } else {
      d._children = null;
    }
  });
  console.debug(root.descendants());

  // const zoomF = zoom().on("zoom", handleZoom);

  // svg.call(zoomF);

  update(root);
  return svg.node();

  function update(source) {
    const nodes = root.descendants();
    const links = root.links();

    if (dynamicPositioning) {
      // Recompute the layout.
      tree()
        .size([2 * Math.PI, radius])
        .separation(separation)(root);
    }

    // Create a transition
    const transition = svg.transition().duration(duration);

    // Update the nodes
    const node = svg.selectAll("g.node").data(nodes, (d) => d.id);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (_d) =>
          `rotate(${(source.x * 180) / Math.PI - 90}) translate(${source.y},0)`
      )
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", (_event, d) => {
        console.debug(root.descendants());
        click(d);
      })
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    nodeEnter
      .append("circle")
      .attr("r", r)
      .attr("fill", (d) => (d._children ? stroke : fill))
      .attr("stroke-width", strokeWidth);

    nodeEnter
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr("text-anchor", (d) =>
        d.x < Math.PI === !d.children ? "start" : "end"
      )
      // crop node names longer than textLength characters
      .text((d) => {
        return d.data.name.length > textLength
          ? d.data.name.slice(0, textLength).concat("...")
          : d.data.name;
      })
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", haloWidth)
      .attr("stroke", halo)
      .attr("paint-order", "stroke")
      .attr("class", "node_label");

    // Transition nodes to their new position.
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr(
        "transform",
        (d) =>
          `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0) rotate(${
            d.x >= Math.PI ? 180 : 0
          })`
      )
      .attr("fill-opacity", fillOpacity)
      .attr("stroke-opacity", strokeOpacity);

    nodeUpdate
      .select("circle")
      .attr("r", r)
      .style("fill", function (d) {
        return d._children ? stroke : fill;
      });

    nodeUpdate
      .select("text")
      .style("fill-opacity", fillOpacity)
      .attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr("text-anchor", (d) =>
        d.x < Math.PI === !d.children ? "start" : "end"
      );

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node
      .exit()
      .transition(transition)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .attr("stroke-width", 0)
      .remove();

    nodeExit.select("circle").attr("r", 1);

    // Update the links…
    const link = svg.selectAll("path.link").data(links, (d) => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        linkRadial()
          .angle((_d) => source.x)
          .radius((_d) => source.y0)
      )
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth);

    // Transition links to their new position.
    link
      .merge(linkEnter)
      .transition(transition)
      .attr(
        "d",
        linkRadial()
          .angle((d) => d.x)
          .radius((d) => d.y)
      );

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition(transition)
      .remove()
      .attr(
        "d",
        linkRadial()
          .angle((_d) => source.x)
          .radius((_d) => source.y)
      );

    // Stash the old positions for transition.
    root.descendants((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  /**
   * A handler function for selecting elements to transform during a zoom event
   *
   * @param {D3ZoomEvent} event the zoom event containing information on how the svg canvas is being translated and scaled
   */
  function handleZoom(event) {
    selectAll("svg g")
      .filter((_d, i) => i < 2)
      .attr("height", "100%")
      .attr("width", "100%")
      .attr('transform', event.transform)
      .attr(
        "transform",
        "translate(" +
          event.transform.x +
          "," +
          event.transform.y +
          ") scale(" +
          event.transform.k +
          ")"
      );
    selectAll("text.node_label")
      // .style("font-size", fontSize / event.transform.k + "px")
      .attr(
        "transform",
        "translate(" +
          event.transform.x +
          "," +
          event.transform.y +
          ") scale(" +
          event.transform.k +
          ")"
      );
  }
}
