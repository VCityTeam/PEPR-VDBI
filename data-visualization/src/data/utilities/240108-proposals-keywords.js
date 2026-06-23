import { map, filter } from 'd3'
import { anonymizeEntry } from './data_utilities.js'

/**
 * Extract the "produits" sheet (proposal product/keyword data) from a workbook
 *
 * @param {Object} workbook - a parsed workbook (xlsx-populate-style)
 * @returns {Object[]} the sheet range A1:AG78 of the second sheet, with headers
 */
export function getProductSheet(workbook) {
  return workbook.sheet(workbook.sheetNames[1], {
    range: 'A1:AG78',
    headers: true,
  })
}

export const projectColorMap = {
  acronyme: 0,
  nom: 1,
  titre: 2,
  action: 3,
  comment: 4,
  pourquoi: 5,
  proposition: 6,
  actionPourSolutions: 7,
  produit: 8,
  objetOuDispositifImplique: 9,
  motClefs: 10,
  defi: 11,
}

/**
 * Map raw proposal-sheet rows into structured project objects (acronym,
 * names, action, products, objects/devices involved, keywords, challenges),
 * optionally anonymizing the acronym and name fields.
 *
 * @param {Object[]} sheet - rows from getProductSheet
 * @param {boolean} [anonymize=false] - whether to anonymize acronyme/nom fields
 * @param {Map} [acronymousDict=new Map()] - mapping of entries to anonymized entries, shared across calls
 * @returns {Object[]} an array of structured project objects
 */
export function resolveProjectEntities(
  sheet,
  anonymize = false,
  acronymousDict = new Map(),
) {
  // Map raw project data to a simple 2D array
  return map(sheet, (d) => {
    const projectMap = {
      acronyme: d['Acronyme'],
      nom: d['NOM et prénom'],
      titre: d['Titre complet'],
      action: d['ACTION (de recherche)'],
      comment: d['COMMENT'],
      pourquoi: d['POUR QUOI FAIRE'],
      proposition: d['proposition de recherche (format synthétique)'],
      actionPourSolutions: d['Quels actions POUR quelles solutions ?'],
      produit: filter(
        [
          d['Produit (ou résultat) de la recherche (primaire)'],
          d['Produit (ou résultat) de la recherche (Secondaire)'],
        ],
        (d) => {
          return typeof d !== 'undefined'
        },
      ),
      objetOuDispositifImplique: filter(
        [
          d['objets et dispositifs urbains impliqués 1'],
          d['objets et dispositifs urbains impliqués 2'],
          d['Objets et dispositifs urbains impliqués  3'],
        ],
        (d) => {
          return typeof d !== 'undefined'
        },
      ),
      motClefs: filter(
        [
          d['Mot clef 1'],
          d['Mot clef 2'],
          d['Mot clef 3'],
          d['Mot clef 4'],
          d['Mot clef 5'],
          d['Mot clef 6'],
          d['Mot clef 7'],
          d['Mot clef 8'],
          d['Mot clef 9'],
          d['Mot clef 10'],
          d['Mot clef 11'],
          d['Mot clef 12'],
          d['Mot clef 13'],
        ],
        (d) => {
          return typeof d !== 'undefined'
        },
      ),
      defi: filter(
        [
          d['Defi principal'],
          d['autre défi 1'],
          d['autre défi 2'],
          d['autre défi 3'],
          d['autre défi 4'],
          d['autre défi 5'],
          d['autre défi 6'],
        ],
        (d) => {
          return typeof d !== 'undefined'
        },
      ),
    }
    if (anonymize) {
      projectMap.acronyme = anonymizeEntry(projectMap.acronyme, acronymousDict)
      projectMap.nom = anonymizeEntry(projectMap.nom, acronymousDict)
    }
    return projectMap
  })
}

export const challenge_label_id_map = new Map([
  ['Le changement climatique', 1],
  ['la préservation de la biodiversité', 1],
  ['La préservation de la Biodiversité', 1],
  ['La préservation de la biodiversité', 1],
  ['La ville résiliente', 2],
  ['La ville sobre et frugale', 3],
  ['La ville inclusive et équitable', 4],
  ['La ville durable, santé et bien-être', 5],
  ['Les défis émergents, signaux faibles, nouvelles difficultés', 6],
  ['les défis émergents, signaux faibles, nouvelles difficultés', 6],
  ['Les défis émergents, signaux faibles, nouvelles difficulté', 6],
])
