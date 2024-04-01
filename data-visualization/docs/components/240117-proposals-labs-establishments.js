import { map, filter } from "npm:d3";

export function getPhase1Sheet(workbook) {
  return workbook.sheet(workbook.sheetNames[0], {
    range: "A1:DR78",
    headers: true,
  });
}

export function getVillesSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[1], {
    range: "A1:E69",
    headers: true,
  });
}

export function getLabSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[4], {
    range: "A1:AK252",
    headers: true,
  });
}

export function resolvePhase1Entities(sheet) {
  // Map raw project data to a simple array of strings and objects
  const projectMap = map(sheet, (d) => {
    return {
      acronyme: filter([d["Acronyme"]], (d) => typeof d !== "undefined"),
      changements: filter(
        [d["changements à préciser depuis le 16-17 octobre 2023"]],
        (d) => typeof d !== "undefined"
      ),
      noms: filter(
        [
          d["NOM et prénom"],
          d["nom 2"],
          d["nom 3"],
          d["nom 4"],
          d["nom 5"],
          d["nom 6"],
          d["nom 7"],
          d["nom 8"],
          d["nom 9"],
          d["nom 10"],
          d["nom 11"],
          d["nom 12"],
          d["nom 13"],
          d["nom 14"],
          d["nom 15"],
          d["nom 16"],
          d["nom 17"],
          d["nom 18"],
          d["nom 19"],
          d["nom 20"],
          d["nom 21"],
          d["nom 22"],
          d["nom 23"],
          d["nom 24"],
          d["nom 25"],
          d["nom 26"],
          d["nom 27"],
          d["nom 28"],
          d["nom 29"],
          d["nom 30"],
        ],
        (d) => typeof d !== "undefined"
      ),
      etablissements: filter(
        [
          d["Etablissement du porteur"],
          d["Etablissement 2"],
          d["Etablissement 3"],
          d["Etablissement 4"],
          d["Etablissement 5"],
          d["Etablissement 6"],
          d["Etablissement 7"],
          d["Etablissement 8"],
          d["Etablissement 9"],
          d["Etablissement 10"],
          d["Etablissement 11"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      partenaires: filter(
        [
          d["Partenaire 1"],
          d["Partenaire 2"],
          d["Partenaire 3"],
          d["Partenaire 4"],
          d["Partenaire 5"],
          d["Partenaire 6"],
          d["Partenaire 7"],
          d["Partenaire 8"],
          d["Partenaire 9"],
          d["Partenaire 10"],
          d["Partenaire 11"],
          d["Partenaire 12"],
        ],
        (d) => typeof d !== "undefined"
      ),
      laboratoires: filter(
        [
          d["Laboratoire du porteur"],
          d["Labo 2"],
          d["Labo 3"],
          d["Labo 4"],
          d["Labo 5"],
          d["Labo 6"],
          d["Labo 7"],
          d["Labo 8"],
          d["Labo 9"],
          d["Labo 10"],
          d["Labo 11"],
          d["Labo 12"],
          d["Labo 13"],
          d["Labo 14"],
          d["Labo 15"],
          d["Labo 16"],
          d["Labo 17"],
          d["Labo 18"],
          d["Labo 19"],
          d["Labo 20"],
          d["Labo 21"],
          d["Labo 22"],
        ],
        (d) => typeof d !== "undefined"
      ),
      disciplines: filter(
        [
          d["discipline 1"],
          d["discipline 2"],
          d["discipline 3"],
          d["discipline 4"],
          d["discipline 5"],
          d["discipline 6"],
          d["discipline 7"],
          d["discipline 8"],
          d["discipline 9"],
          d["discipline 10"],
          d["discipline 11"],
        ],
        (d) => typeof d !== "undefined"
      ),
      erc: filter([d["ERC"]], (d) => typeof d !== "undefined"),
      mot_clefs: filter(
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
        (d) => typeof d !== "undefined"
      ),
      sites: filter(
        [
          d["site 1"],
          d["site 2"],
          d["site 3"],
          d["site 4"],
          d["site 5"],
          d["site 6"],
          d["site 7"],
          d["site 8"],
          d["site 9"],
          d["site 10"],
          d["site 11"],
        ],
        (d) => typeof d !== "undefined"
      ),
      defis: filter(
        [
          d["Defi principal"],
          d["autre défi 1"],
          d["autre défi 2"],
          d["autre défi 3"],
          d["autre défi 4"],
          d["autre défi 5"],
          d["autre défi 6"],
        ],
        (d) => typeof d !== "undefined"
      ),
      nom_complet: filter([d["Nom complet"]], (d) => typeof d !== "undefined"),
      notes: filter([d["Notes"]], (d) => typeof d !== "undefined"),
    };
  });

  return projectMap;
}

export function resolveLaboEntities(sheet) {
  // Map raw project data to a simple array of strings and objects
  const labMap = map(sheet, (d) => {
    return {
      label: filter([d["Libellé"]], (d) => typeof d !== "undefined"),
      type: filter(
        [d["Labo/ stuctures autres"]],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      nom: filter([d["Nom"]], (d) => typeof d !== "undefined" && d !== 0),
      numero: filter([d["numéro"]], (d) => typeof d !== "undefined"),
      nin: filter(
        [d["Numéro identifiant National"]],
        (d) => typeof d !== "undefined"
      ),
      classement_erc: filter(
        [
          d["Classement scientifique ERC"],
          d["ERC 1"],
          d["ERC 2"],
          d["ERC 3"],
          d["ERC 4"],
          d["ERC 5"],
          d["ERC 6"],
          d["ERC 7"],
          d["ERC 8"],
          d["ERC 9"],
        ],
        (d) => typeof d !== "undefined"
      ),
      domaine: filter(
        [
          d["Domaine scientifique 1"],
          d["Domaine scientifique 2"],
          d["Domaine scientifique 3"],
          d["Domaine scientifique 4"],
          d["Domaine scientifique 5"],
          d["Domaine scientifique 6"],
          d["Domaine scientifique 7"],
          d["Domaine scientifique 8"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
      etablissements: filter(
        [
          d["Etablissements A"],
          d["Etablissements B"],
          d["Etablissements C"],
          d["Etablissements D"],
          d["Etablissements E"],
          d["Etablissements F"],
          d["Etablissements G"],
          d["Etablissements H"],
          d["Etablissements I"],
          d["Etablissements J"],
          d["Etablissements K"],
        ],
        (d) => typeof d !== "undefined" && d !== 0
      ),
    };
  });

  return labMap;
}
