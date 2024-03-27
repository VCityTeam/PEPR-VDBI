import { tree, hierarchy, stratify, create, linkRadial } from "npm:d3";

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
    textLength = 15, // max text length before cropping
    radius = Math.min(
      width - marginLeft - marginRight,
      height - marginTop - marginBottom
    ) / 2, // outer radius
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
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
      // crop node names longer than 20 characters
      .text((d) => {
        return d.data.name.length > textLength
          ? d.data.name.slice(0, textLength).concat("...")
          : d.data.name;
      })
      .attr("stroke-linejoin", "round") // needed?
      .attr("stroke-width", haloWidth)
      .attr("stroke", halo)
      .attr("paint-order", "stroke");

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
}

