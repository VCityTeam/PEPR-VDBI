export function mapProductsToGraph(data) {
  // create triples for each project and add them to an array (representing the graph)
  const projectGraph = [];

  data.forEach((project) => {
    // link to root node
    projectGraph.push(["PEPR VDBI", "hasProjet", project.id]);
    // each project has a key/value pair
    for (const [key, value] of Object.entries(project)) {
      // skip id cells
      if (key != "id") {
        // each value is an array of properties
        value.forEach((element) => {
          projectGraph.push([
            project.id, // project id
            key, // property name
            element, // unique value
          ]);
        });
      }
    }
  });

  return projectGraph;
}
