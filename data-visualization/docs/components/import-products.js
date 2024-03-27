import { map, filter, group } from "npm:d3";

export function getProductSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[1], {
    range: "A1:AG78",
    headers: true,
  });
}

export function resolveKnownEntities(sheet) {
  // Map raw project data to a simple 2D array
  const projectMap = map(sheet, (d) => {
    return {
      acronyme: [d["Acronyme"]],
      nom: [d["NOM et prénom"]],
      titre: [d["Titre complet"]],
      action: [d["ACTION (de recherche)"]],
      comment: [d["COMMENT"]],
      pourquoi: [d["POUR QUOI FAIRE"]],
      proposition: [d["proposition de recherche (format synthétique)"]],
      actionPourSolutions: [d["Quels actions POUR quelles solutions ?"]],
      produit: filter(
        [
          d["Produit (ou résultat) de la recherche (primaire)"],
          d["Produit (ou résultat) de la recherche (Secondaire)"],
        ],
        (d) => {
          return typeof d !== "undefined";
        }
      ),
      objetOuDispositifImplique: filter(
        [
          d["objets et dispositifs urbains impliqués 1"],
          d["objets et dispositifs urbains impliqués 2"],
          d["Objets et dispositifs urbains impliqués  3"],
        ],
        (d) => {
          return typeof d !== "undefined";
        }
      ),
      motClef: filter(
        [
          d["Mot clef 1"],
          d["Mot clef 2"],
          d["Mot clef 3"],
          d["Mot clef 4"],
          d["Mot clef 5"],
          d["Mot clef 6"],
          d["Mot clef 7"],
          d["Mot clef 8"],
          d["Mot clef 9"],
          d["Mot clef 10"],
          d["Mot clef 11"],
          d["Mot clef 12"],
          d["Mot clef 13"],
        ],
        (d) => {
          return typeof d !== "undefined";
        }
      ),
      defi: filter(
        [
          d["Defi principal"],
          d["autre défi 1"],
          d["autre défi 2"],
          d["autre défi 3"],
          d["autre défi 4"],
          d["autre défi 5"],
          d["autre défi 6"],
        ],
        (d) => {
          return typeof d !== "undefined";
        }
      ),
    };
  });

  return projectMap;
}

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

  console.log("projectTree", projectTree);

  // this code could/should be made generic to work with any length of grouping ?
  const projectToProductTree = map(
    projectByProduct.entries(),
    ([key, value]) => {
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
                    children: Object.entries( // TODO: add a map here
                      // get this project with its descendants
                      projectTree.find((d) => d.name == project.acronyme[0])
                      // filter out acronyme, actions, and products (we already added them to the tree as ancestors)
                    ).filter(
                      ([key, _value]) =>
                        key != "action" && key != "produit" && "acronyme"
                    ),
                  };
                }),
              };
            }),
          };
        }),
      };
    }
  );
  console.debug("projectToProductTree", projectToProductTree);

  // put the cherry on top before returning
  return {
    name: "PEPR VDBI",
    children: projectToProductTree,
  };
}
