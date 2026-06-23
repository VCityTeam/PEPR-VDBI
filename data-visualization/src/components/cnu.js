const all_cnu = [...Array(93).keys()]

// CNU categories mapped to their respective CNU numbers. Useful for determining the
// domains of ordinal color scales and for determining the color (and d3 color
// interpolator) of a CNU number.
export const cnu_category_section_map = new Map([
  ['Droit, économie et gestion', all_cnu.slice(1, 7)],
  ['Lettres et sciences humaines', all_cnu.slice(7, 25)],
  ['Sciences', all_cnu.slice(25, 70).filter((d) => d <= 37 || d >= 60)],
  [
    'Sections de santé',
    all_cnu.slice(42, 57).concat([80, 81, 82, 83, 85, 86, 87, 90, 91, 92]),
  ],
  ['Pluridisciplinaire', all_cnu.slice(70, 75)],
  ['Théologie', [76, 77]],
])

export const erc_category_by_cnu_section_map = new Map([
  ['Droit, économie et gestion', 'SH - Sciences Humaines & Sociales'],
  ['Lettres et sciences humaines', 'SH - Sciences Humaines & Sociales'],
  ['Sciences', 'PE - Sciences & Technologies'],
  ['Sections de santé', 'LS - Vie & Santé'],
  ['Pluridisciplinaire', 'SH - Sciences Humaines & Sociales'],
  ['Théologie', 'SH - Sciences Humaines & Sociales'],
])

export const cnu_group_section_map = new Map([
  ['Groupe 1', [1, 2, 3, 4]],
  ['Groupe 2', [5, 6]],
  ['Groupe 3', [7, 8, 9, 10, 11, 12, 13, 14, 15]],
  ['Groupe 4', [16, 17, 18, 19, 20, 21, 22, 23, 24]],
  ['Groupe 5', [25, 26, 27]],
  ['Groupe 6', [28, 29, 30]],
  ['Groupe 7', [31, 32, 33]],
  ['Groupe 8', [34, 35, 36, 37]],
  ['Médecine', [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]],
  ['Odontologie', [56, 57, 58]],
  ['Groupe 9', [60, 61, 62, 63]],
  ['Groupe 10', [64, 65, 66, 67, 68, 69]],
  ['Groupe 12', [70, 71, 72, 73, 74]],
  ['Théologie', [76, 77]],
  ['Personnels enseignants hospitaliers (bi-appartenants)', [80, 81, 82, 83]],
  ['Pharmacie (mono-appartenants)', [85, 86, 87]],
  ['Autres sections de santé (mono-appartenants)', [90, 91, 92]],
])

export const cnu_section_label_map = new Map([
  [1, '01: Droit privé et sciences criminelles'],
  [2, '02: Droit public'],
  [3, '03: Histoire du droit et des institutions'],
  [4, '04: Science politique'],
  [5, '05: Sciences économiques'],
  [6, '06: Sciences de gestion et du management'],
  [7, '07: Sciences du langage'],
  [8, '08: Langues et littératures anciennes'],
  [9, '09: Langue et littérature française'],
  [10, '10: Littératures comparées'],
  [11, '11: Études anglophones'],
  [12, '12: Études germaniques et scandinaves'],
  [13, '13: Études slaves et baltes'],
  [14, '14: Études romanes'],
  [
    15,
    "15: Langues, littératures et cultures africaines, asiatiques et d'autres aires linguistiques",
  ],
  [16, '16: Psychologie et ergonomie'],
  [17, '17: Philosophie'],
  [
    18,
    "18: Architecture (ses théories et ses pratiques), arts appliqués, arts plastiques, arts du spectacle, épistémologie des enseignements artistiques, esthétique, musicologie, musique, sciences de l'art",
  ],
  [19, '19: Sociologie, démographie'],
  [20, '20: Ethnologie, préhistoire, anthropologie biologique'],
  [
    21,
    '21: Histoire, civilisations, archéologie et art des mondes anciens et médiévaux',
  ],
  [
    22,
    "22: Histoire et civilisations : histoire des mondes modernes, histoire du monde contemporain ; de l'art ; de la musique",
  ],
  [23, '23: Géographie physique, humaine, économique et régionale'],
  [24, "24: Aménagement de l'espace, urbanisme"],
  [25, '25: Mathématiques'],
  [26, '26: Mathématiques appliquées et applications des mathématiques'],
  [27, '27: Informatique'],
  [28, '28: Milieux denses et matériaux'],
  [29, '29: Constituants élémentaires'],
  [30, '30: Milieux dilués et optique'],
  [31, '31: Chimie théorique, physique, analytique'],
  [32, '32: Chimie organique, minérale, industrielle'],
  [33, '33: Chimie des matériaux'],
  [34, '34: Astronomie, astrophysique'],
  [35, '35: Structure et évolution de la terre et des autres planètes'],
  [
    36,
    '36: Terre solide : géodynamique des enveloppes supérieure, paléobiosphère',
  ],
  [37, '37: Enveloppes fluides du système Terre et autres planètes'],
  [42, '42: Morphologie et morphogenèse'],
  [43, '43: Biophysique et imagerie Médecin'],
  [
    44,
    '44: Biochimie, biologie cellulaire et moléculaire, physiologie et nutrition',
  ],
  [45, '45: Microbiologie, maladies transmissibles et hygiène'],
  [46, '46: Santé publique, environnement et société'],
  [47, '47: Cancérologie, génétique, hématologie, immunologie'],
  [
    48,
    "48: Anesthésiologie, réanimation, médecine d'urgence, pharmacologie et thérapeutique",
  ],
  [
    49,
    '49: Pathologie nerveuse et musculaire, pathologie mentale, handicap et rééducation',
  ],
  [50, '50: Pathologie ostéo-articulaire, dermatologie et chirurgie plastique'],
  [51, '51: Pathologie cardiorespiratoire et vasculaire'],
  [52, '52: Maladies des appareils digestif et urinaire'],
  [53, '53: Médecine interne, gériatrie et médecine générale'],
  [
    54,
    "54: Développement et pathologie de l'enfant, gynécologie-obstétrique, endocrinologie et reproduction",
  ],
  [55, '55: Pathologie de la tête et du cou'],
  [56, '56: Développement, croissance et prévention'],
  [57, '57: Chirurgie orale ; parondontologie ; biologie orale'],
  [58, '58: Réhabilitation orale'],

  [60, '60: Mécanique, génie mécanique, génie civil'],
  [61, '61: Génie informatique, automatique et traitement du signal'],
  [62, '62: Energétique, génie des procédés'],
  [63, '63: Génie électrique, électronique, photonique et systèmes'],
  [64, '64: Biochimie et biologie moléculaire'],
  [65, '65: Biologie cellulaire'],
  [66, '66: Physiologie'],
  [67, '67: Biologie des populations et écologie'],
  [68, '68: Biologie des organismes'],
  [69, '69: Neurosciences'],
  [70, "70: Sciences de l'éducation et de la formation"],
  [71, "71: Sciences de l'information et de la communication"],
  [72, '72: Epistémologie, histoire des sciences et des techniques'],
  [73, '73: Cultures et langues régionales'],
  [74, '74: Sciences et techniques des activités physiques et sportives'],
  [76, '76: Théologie catholique'],
  [77, '77: Théologie protestante'],
  [
    80,
    '80: Personnels enseignants et hospitalier de pharmacie en sciences physico-chimiques et ingénierie appliquée à la santé',
  ],
  [
    81,
    '81: Personnels enseignants et hospitalier de pharmacie en sciences du médicament et des autres produits de santé',
  ],
  [
    82,
    '82: Personnels enseignants et hospitalier de pharmacie en sciences biologiques, fondamentales et cliniques ',
  ],
  [
    85,
    '85: Personnels enseignants-chercheurs de pharmacie en sciences physico-chimiques et ingénierie appliquée à la santé',
  ],
  [
    86,
    '86: Personnels enseignants-chercheurs de pharmacie en sciences du médicament et des autres produits de santé',
  ],
  [
    87,
    '87: Personnels enseignants-chercheurs de pharmacie en sciences biologiques, fondamentales et cliniques',
  ],
  [90, '90: Maïeutique'],
  [
    91,
    '91: Personnels enseignants-chercheurs des disciplines des sciences de la rééducation et de réadaptation',
  ],
  [
    92,
    '92: Personnels enseignants-chercheurs des disciplines des sciences infirmières',
  ],
])

/**
 * Determine the category of a CNU number.
 * Based on https://conseil-national-des-universites.fr/
 *
 * @param {string} cnu - CNU full name to categorize
 * @returns {number|null} The CNU category number
 */
export function getGroupFromCNU(cnu) {
  if (!cnu) {
    console.warn(`empty cnu: ${cnu}`)
    return null
  }
  if (cnu == 'Administratif') return cnu

  // Given a string starting with a CNU number, return the number
  const cnu_number = Number(String(cnu).trim().substring(0, 2))
  const category = cnu_category_section_map
    .entries()
    .find((d) => d[1].includes(cnu_number))

  if (!category)
    console.warn(`could not categorize number: ${cnu_number}, cnu: ${cnu}`)

  return category ? category[0] : null
}

/**
 * Look up the ERC category corresponding to a CNU code's group/section
 *
 * @param {string} cnu - CNU full name to categorize
 * @returns {string} the corresponding ERC category
 */
export function getERCFromCNU(cnu) {
  return erc_category_by_cnu_section_map.get(getGroupFromCNU(cnu))
}
