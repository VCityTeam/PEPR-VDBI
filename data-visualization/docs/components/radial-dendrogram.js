import {
  tree,
  hierarchy,
  stratify,
  map,
  filter,
  create,
  linkRadial,
} from "npm:d3";

export function mapToProjectTree(projects) {
  // map graph to d3 hierarchy format
  const projectTree = {
    name: "PEPR VDBI",
    children: map(projects, (project) => {
      const projectChildren = filter(
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
export function mapProductToProjectTree(projects) {
  // map graph to d3 hierarchy format
  const projectTree = {
    name: "PEPR VDBI",
    children: map(projects, (project) => {
      const projectChildren = filter(
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


export function radialDendrogram(
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
    height = 400, // outer height, in pixels
    margin = 60, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    radius = Math.min(
      width - marginLeft - marginRight,
      height - marginTop - marginBottom
    ) / 2, // outer radius
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "#999", // fill for nodes
    fillOpacity, // fill opacity for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo
    haloWidth = 3, // padding around the labels
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

  const svg = create("svg").attr("viewBox", [
    -marginLeft - radius,
    -marginTop - radius,
    width,
    height,
  ]);

  const links = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr(
      "d",
      linkRadial()
        .angle((d) => d.x)
        .radius((d) => d.y)
    );

  const nodes = svg
    .append("g")
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
    .attr(
      "transform",
      (d) => `
          rotate(${(d.x * 180) / Math.PI - 90})
          translate(${d.y},0)
        `
    )
    .attr("fill", (d) => (d.children ? "#555" : "#999"))
    .attr("r", 2.5);

  svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .attr(
      "transform",
      (d) => `
          rotate(${(d.x * 180) / Math.PI - 90}) 
          translate(${d.y},0) 
          rotate(${d.x >= Math.PI ? 180 : 0})
        `
    )
    .attr("dy", "0.31em")
    .attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
    .attr("text-anchor", (d) =>
      d.x < Math.PI === !d.children ? "start" : "end"
    )
    .text((d) => d.data.name)
    .clone(true)
    .lower()
    .attr("stroke", "white");

  return svg.node();
}
