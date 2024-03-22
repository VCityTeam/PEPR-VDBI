import { map, filter } from "npm:d3";

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
