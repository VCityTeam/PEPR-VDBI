---
theme: [light]
sql:
  mural_data: /data/private/Cartographie PEPR VDBI-1748339060380.csv
  # link_store: /data/private/mural_links.csv
  # mural_data: /data/private/Cartographie PEPR VDBI-1748013777151.csv
---

```js
import {
  forceGraph,
  MuralGraph,
  mapTableToPropertyGraphLinks,
  mapTableToTriples,
} from "/components/graph.js"
import { circleLegend } from "/components/legend.js"
```

# Mural link editor

projects ${Inputs.table(projects)}

```sql id=projects echo
select
  -- *
  ID as id,
  "Text" as label,
  "BG Color" as "type",
  -- "Sticky type" as shape
  "Position X" as fx,
  "Position Y" as fy,
from mural_data
where
  Area = 'Cartographie (à compléter)' and
  "Text" is not null
```

## Mural project data

```js echo
const project_graph_data = {
  nodes: [...projects].map((d) => d.toJSON()),
  links: [],
}
display(project_graph_data)
```

```js echo
const project_color_scale = new Map([
  ["#AAED92", "Projet PEPR VDBI"],
  ["#FCF281", "Projet externe"],
  ["#9EDCFA", "Centre Opérationel"],
  ["#FCB6D4", "Projet PEPR (externe)"],
  ["#0561A6", "Structure"],
  ["#FFC061", "other"],
])

const project_graph = new MuralGraph(project_graph_data, {
  id: "project_graph",
  width: 1000,
  height: 1000,
  margin: 500,
  r: 20,
  fontSize: 50,
  strokeWidth: 5,
  keyMap: (d) => d.label,
  valueMap: (d) => d.type,
  color: d3.scaleOrdinal(
    [...project_color_scale.keys()],
    [...project_color_scale.keys()]
  ),
  nodeLabelOpacity: 1,
  linkLabelOpacity: 1,
  nodeLabelOffset: 25,
  legend: circleLegend([...project_color_scale.values()], {
    keyMap: (d) => d,
    valueMap: (d) => d,
    color: d3.scaleOrdinal(
      [...project_color_scale.values()],
      [...project_color_scale.keys()]
    ),
    radius: 40,
    lineSeparation: 120,
    text: (d) => d,
    fontSize: 100,
    backgroundColor: "black",
    backgroundStroke: "black",
    backgroundOpacity: 0.1,
  }),
})
```

## Mural graph

<div id="graph_container" class="card">${project_graph.getCanvas()}</div>
${downloadSVGButton("#graph_container svg")}

## Mural graph data

${Inputs.table(mural_links)}
${downloadTableButton(() => mural_links)}

```js
import {
  downloadSVGButton,
  downloadTableButton,
} from "/components/utilities.js"
```

```js
const mural_links = (async function* () {
  while (true) {
    yield [...project_graph.links].map(({ source, target, label }) => {
      return {
        source: source.id,
        target: target.id,
        label: label,
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
})()
```

## Missing links from latest export

```js
display(
  [...rawhtml.getElementsByTagName("p")]
    .map((d) => {
      let ownText = ""
      d.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          ownText += child.textContent
        }
      })
      return ownText.trim()
    })
    .filter(
      (d) =>
        d &&
        !mural_links.some(({ label }) => label === d) &&
        ![...projects].some(({ label }) => label === d)
    )
)
```

```js
const rawhtml = html`<p
    style="
    padding-left: 467pt;
    text-indent: 0pt;
    line-height: 5pt;
    text-align: left;
  "
  >
    Stockage données
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="text-indent: 0pt; text-align: right">ANR MONITREE</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 150pt; text-indent: 0pt; text-align: center">
    FPCUP (COPERNICUS
  </h1>
  <h1 style="padding-left: 150pt; text-indent: 0pt; text-align: center">)</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 148pt; text-indent: 0pt; text-align: center">TID</h1>
  <h1 style="padding-left: 150pt; text-indent: 0pt; text-align: center">
    CityOrchestra
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 151pt; text-indent: 0pt; text-align: center">
    UMACC
  </h1>
  <h1 style="padding-left: 151pt; text-indent: 0pt; text-align: center">
    (projet EPE IRIS- E)
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 38pt; text-indent: 13pt; text-align: left">
    ANR PERMEPOLIS
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s1"
    style="padding-left: 54pt; text-indent: -1pt; text-align: center"
  >
    Studio Métropoles Durables (LabEx IMU)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 71pt; text-indent: 0pt; text-align: left">
    CO MISCIB
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 75pt; text-indent: 0pt; text-align: left">
    élaboration de scénarios intégrés
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 138pt; text-indent: 0pt; text-align: left">
    dépôt commun, Villegarden --&gt; biodiversité/sols
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 206pt; text-indent: 0pt; text-align: center">
    Travail sur un glossaire
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s2"
    style="padding-left: 202pt; text-indent: 0pt; text-align: center"
  >
    SOLU-BIOD
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 72pt; text-indent: -9pt; text-align: left">
    PIA labex IMU
  </p>
  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s1"
    style="padding-left: 145pt; text-indent: 0pt; text-align: center"
  >
    ANR DIAMS (en
  </p>
  <p class="s1" style="padding-left: 80pt; text-indent: 0pt; text-align: left">
    finalisation)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 68pt; text-indent: -18pt; text-align: left">
    premices de la demarche de validation de modeles mmicroclimatiques
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 103pt; text-indent: 0pt; text-align: center">
    a permis le developpement des approches interdisciplinaires sur Lyon
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 37pt; text-indent: 1pt; text-align: left">
    synergie des approches, convergence des terrains
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 80pt; text-indent: 0pt; text-align: left">
    terrain commun, these à linterface
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s1"
    style="padding-left: 103pt; text-indent: 0pt; text-align: center"
  >
    MITI 80PRIME METEORS
  </p>
  <p
    class="s1"
    style="padding-left: 104pt; text-indent: 0pt; text-align: center"
  >
    (fini)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 100pt; text-indent: -74pt; text-align: left">
    base du projet vf++ <span class="s4">ANR </span
    ><span class="s5">coolpath</span>
  </p>
  <p
    style="
    padding-top: 3pt;
    padding-left: 35pt;
    text-indent: 3pt;
    text-align: left;
  "
  >
    données thermophysio et microclimatique de ref. amélioration des modeles
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    VF++
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 4pt; text-indent: -1pt; text-align: left">
    H2020 MUSIC
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="text-indent: 0pt; text-align: right">NEO</h1>
  <p style="padding-top: 4pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 64pt; text-indent: -51pt; text-align: left">
    Méthodo communes / espaces privés / espaces publics
  </p>
  <p style="padding-top: 5pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: right">
    Transitions professionnelles...
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="text-indent: 0pt; text-align: right">Anthares</p>
  <p
    style="
    padding-top: 5pt;
    padding-left: 93pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    valorisation des resultats
  </p>
  <p
    style="
    padding-top: 6pt;
    padding-left: 68pt;
    text-indent: -12pt;
    text-align: left;
  "
  >
    données thermophysio de reference
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 94pt; text-indent: 0pt; text-align: left">
    PN ISSU
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 122pt; text-indent: 0pt; text-align: center">
    données thermophysio et environnementales
  </p>
  <p style="padding-left: 121pt; text-indent: 0pt; text-align: center">
    de reference
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 6pt; text-indent: 9pt; text-align: left">
    ANR H3SENSING
  </p>
  <p style="padding-top: 7pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s7"
    style="padding-left: 134pt; text-indent: 0pt; text-align: center"
  >
    MESR
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s8"
    style="
    padding-left: 133pt;
    text-indent: 0pt;
    line-height: 8pt;
    text-align: center;
  "
  >
    Fresque de
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 50pt; text-indent: -38pt; text-align: left">
    AMDAC / Opendata + Département A7 (infra ministérielles)
  </p>
  <h1
    style="
    padding-top: 4pt;
    padding-left: 35pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    SNO OBSERVIL
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    IR OZCAR
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 3pt; text-indent: 9pt; text-align: left">
    Equipex TERRAFORMA
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 131pt; text-indent: 0pt; text-align: center">
    Equipex+ Gaia DATA TERRA THEIA
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 64pt; text-indent: 0pt; text-align: left">
    participants en commun aux deux projets
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 38pt; text-indent: -25pt; text-align: left">
    carto interactive / datavisualisation pour diffusion des résultats aux
    participants
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    ANR BISES
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 39pt; text-indent: 0pt; text-align: left">
    VILLEGARDEN
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 1pt; text-indent: 0pt; text-align: left">
    ANR GARLAND
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s3"
    style="padding-left: 118pt; text-indent: 0pt; text-align: center"
  >
    IMU -
  </p>
  <p
    class="s3"
    style="padding-left: 120pt; text-indent: 0pt; text-align: center"
  >
    Collectifs
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 115pt; text-indent: 0pt; text-align: center">
    Echanges de contacts
  </p>
  <p style="padding-left: 115pt; text-indent: 0pt; text-align: center">
    et de données sur les terrains
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    style="
    padding-left: 11pt;
    text-indent: 0pt;
    line-height: 4pt;
    text-align: left;
  "
  >
    variations in microclimates
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    cofinancements et terrains communs
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 44pt; text-indent: 0pt; text-align: left">
    Partenaires
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h2 style="padding-left: 174pt; text-indent: 0pt; text-align: center">
    Association Française Génie Parasismique
  </h2>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s9" style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    SDMIS
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 86pt; text-indent: 0pt; text-align: center">
    Echanges de contacts
  </p>
  <p style="padding-left: 86pt; text-indent: 0pt; text-align: center">
    et de données sur les terrains
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s6"
    style="padding-left: 118pt; text-indent: 0pt; text-align: center"
  >
    Terrains
  </p>
  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s9" style="padding-left: 70pt; text-indent: -5pt; text-align: left">
    Communauté de l&#39;Ouest Rhodanien
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h2 style="padding-left: 131pt; text-indent: 0pt; text-align: center">
    Communauté d&#39;Agglomération de Montélimar
  </h2>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s9" style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    Autres terrains
  </p>
  <p class="s8" style="padding-left: 19pt; text-indent: -4pt; text-align: left">
    la donnée urbaine
  </p>
  <p
    style="
    padding-left: 93pt;
    text-indent: 0pt;
    line-height: 5pt;
    text-align: left;
  "
  >
    Méthodo
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">PANAME</h1>
  <p style="padding-top: 8pt; text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 16pt; text-indent: -1pt; text-align: left">
    post-doc IPSL thème urbain
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    participants communs sur thématique commune
  </p>
  <p
    class="s9"
    style="
    padding-top: 4pt;
    padding-left: 15pt;
    text-indent: 6pt;
    text-align: left;
  "
  >
    Autres partenaires
  </p>
  <p
    class="s9"
    style="padding-left: 133pt; text-indent: 0pt; text-align: center"
  >
    Ecole Nationale Supérieure de la Police
  </p>
  <p style="padding-top: 7pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 15pt; text-indent: 7pt; text-align: left">
    DSA Patrimoine ENSA Paris-Belleville
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1
    style="
    padding-top: 4pt;
    padding-left: 21pt;
    text-indent: -1pt;
    text-align: left;
  "
  >
    15&#39; city villes
  </h1>
  <p class="s10" style="padding-left: 14pt; text-indent: 0pt; text-align: left">
    moyennes <span class="p">Outil de visualisation</span>
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 14pt; text-indent: 0pt; text-align: left">
    CORTEXT RETICULAR
  </h1>
  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s11"
    style="padding-left: 132pt; text-indent: 0pt; text-align: center"
  >
    Modèles visant
  </p>
  <p
    class="s11"
    style="padding-left: 132pt; text-indent: 0pt; text-align: center"
  >
    la production d&#39;indicateurs
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 14pt; text-indent: 0pt; text-align: left">
    ACTRIS-NEXT
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    style="
    padding-left: 14pt;
    text-indent: 27pt;
    line-height: 72%;
    text-align: left;
  "
  >
    stress abiotique de la végétation urbaine Réseau de mesure francilien
  </p>
  <p style="padding-top: 5pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    PEPR ICCARE
  </p>
  <p class="s3" style="padding-left: 14pt; text-indent: 0pt; text-align: left">
    Projet THEMIS
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 14pt; text-indent: 0pt; text-align: left">TRACES</h1>
  <p style="padding-top: 8pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 14pt; text-indent: 6pt; text-align: left">
    Atelier EVS &quot;Faire territoire&quot;
  </p>
  <p style="padding-top: 4pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    CSTB
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    Ontologies / Semantique
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s7"
    style="
    padding-left: 27pt;
    text-indent: 0pt;
    line-height: 5pt;
    text-align: left;
  "
  >
    Banque
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    Méthodes analyse
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s12"
    style="
    padding-left: 58pt;
    text-indent: 0pt;
    line-height: 8pt;
    text-align: left;
  "
  >
    France ville
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    ANR OPTISOIL
  </h1>
  <p style="padding-top: 4pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    style="
    padding-left: 21pt;
    text-indent: 33pt;
    line-height: 287%;
    text-align: left;
  "
  >
    urban climate services pollution des sols
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="text-indent: 0pt; text-align: left">InteGREEN</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 61pt; text-indent: -39pt; text-align: left">
    comparaison de certains indicateurs entre Paris, Lille et Marseille
  </p>
  <p
    class="s3"
    style="
    padding-top: 6pt;
    padding-left: 139pt;
    text-indent: 0pt;
    text-align: center;
  "
  >
    PEPR IRIMA
  </p>
  <p
    class="s3"
    style="padding-left: 140pt; text-indent: 0pt; text-align: center"
  >
    (Séismes, risques naturels)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    Chaire EcoUrIDF
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s1" style="padding-left: 24pt; text-indent: 0pt; text-align: left">
    Séminaire PEPS
  </p>
  <p
    class="s7"
    style="
    padding-top: 3pt;
    padding-left: 75pt;
    text-indent: 8pt;
    text-align: left;
  "
  >
    des Territoires
  </p>
  <p
    style="
    padding-top: 5pt;
    padding-left: 15pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Veille commune
  </p>
  <h1
    style="
    padding-top: 4pt;
    padding-left: 28pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    CO SIVDBI
  </h1>
  <p
    style="
    padding-top: 5pt;
    padding-left: 29pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    CAP Territoires
  </p>
  <p
    class="s12"
    style="padding-left: 137pt; text-indent: 0pt; text-align: center"
  >
    et territoires durables
  </p>
  <h1
    style="
    padding-left: 144pt;
    text-indent: 0pt;
    line-height: 8pt;
    text-align: center;
  "
  >
    CAP
  </h1>
  <h1 style="padding-left: 145pt; text-indent: 0pt; text-align: center">
    Territoires
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 36pt; text-indent: 0pt; text-align: left">
    Thèse CIFRE
  </h1>
  <p
    style="
    padding-top: 5pt;
    padding-left: 9pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Village Olympique/Paralympique
  </p>
  <p style="padding-top: 5pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    style="
    padding-left: 61pt;
    text-indent: 0pt;
    line-height: 6pt;
    text-align: left;
  "
  >
    vague de chaleur
  </p>
  <p
    class="s1"
    style="padding-left: 75pt; text-indent: -1pt; text-align: center"
  >
    &quot;Propriété, Environnement, Patrimoine, Société&quot;
  </p>
  <p
    style="
    padding-top: 3pt;
    padding-left: 34pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Données d&#39;intérêt générale Données de grande échelle
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="padding-left: 22pt; text-indent: 0pt; text-align: left">
    CNIG
  </p>
  <p
    style="
    padding-top: 6pt;
    padding-left: 40pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Plateforme de données
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="padding-left: 19pt; text-indent: 0pt; text-align: left">
    Hexadone
  </p>
  <p style="padding-top: 2pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 23pt; text-indent: -6pt; text-align: left">
    Datacentre Labellisé (Hebergement)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="padding-left: 22pt; text-indent: 0pt; text-align: left">
    UNIF
  </p>
  <h1 style="padding-left: 22pt; text-indent: 5pt; text-align: left">
    Plaine Commune
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 22pt; text-indent: 0pt; text-align: left">
    Thèse ED129
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 23pt; text-indent: 0pt; text-align: left">
    outil d&#39;aide à la décision - carto interactive
  </p>
  <h3
    style="
    padding-top: 5pt;
    padding-left: 28pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Mind map
  </h3>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s2"
    style="
    padding-left: 22pt;
    text-indent: 11pt;
    line-height: 108%;
    text-align: left;
  "
  >
    PEPR SOLU-BIOD
  </p>
  <p
    class="s2"
    style="
    padding-left: 25pt;
    text-indent: 0pt;
    line-height: 9pt;
    text-align: left;
  "
  >
    living labs
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 22pt; text-indent: 104pt; text-align: left">
    élaboration de scénarios intégrés analyses d&#39;accessibilité (15min) /
    carto sensible
  </p>
  <p style="padding-top: 2pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s6"
    style="padding-left: 22pt; text-indent: -1pt; text-align: center"
  >
    Réseau scientifique Ministère de la Culture &quot;Architecture et
    Transformation&quot;
  </p>
  <p style="padding-top: 7pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 22pt; text-indent: -7pt; text-align: left">
    Projet de recherche &quot;Savoir défaire&quot;
  </p>
  <p style="padding-top: 2pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s6"
    style="padding-left: 134pt; text-indent: 0pt; text-align: center"
  >
    Programme structurant MSH Paris Saclay
  </p>
  <p
    class="s6"
    style="padding-left: 134pt; text-indent: 0pt; text-align: center"
  >
    &quot;Des territoires et leurs universités&quot;
  </p>
  <p style="padding-top: 7pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 22pt; text-indent: 0pt; text-align: left">
    DIM PAMIR
  </p>
  <p class="s3" style="padding-left: 22pt; text-indent: 0pt; text-align: left">
    Patrimoine
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 56pt; text-indent: -3pt; text-align: right">
    1/2 thèse ADEME
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s1"
    style="padding-left: 86pt; text-indent: 0pt; text-align: center"
  >
    Séminaire &quot;Environnements urbains et dérèglement global&quot;
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    Cartodoc
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 9pt; text-indent: 5pt; text-align: left">
    Outil de visualisation
  </p>
  <p
    class="s7"
    style="
    padding-top: 4pt;
    padding-left: 12pt;
    text-indent: -5pt;
    text-align: left;
  "
  >
    Ville de Paris
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 15pt; text-indent: 4pt; text-align: left">
    Recherche de données de flux d&#39;eau territorialisée
  </p>
  <p style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    dans l&#39;assainissement
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    SISP&amp;Eau ANRS MIE
  </h1>
  <p style="padding-top: 2pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 66pt; text-indent: -48pt; text-align: left">
    indicateurs de bien-être liés à la végétalisation urbaine
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">EGOUT</h1>
  <p
    class="s9"
    style="
    padding-top: 4pt;
    padding-left: 26pt;
    text-indent: -10pt;
    text-align: left;
  "
  >
    Métropole d&#39;Aix Marseille Provence
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    RI-URBANS
  </h1>
  <p style="padding-top: 5pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    Modélisation potentiel oxydant
  </p>
  <p
    style="
    padding-top: 2pt;
    padding-left: 52pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Projet Emergences / IA Frugale
  </p>
  <p
    class="s1"
    style="
    padding-top: 2pt;
    padding-left: 86pt;
    text-indent: 0pt;
    text-align: center;
  "
  >
    PEPR IA
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 179pt; text-indent: 0pt; text-align: center">
    Données
  </p>
  <p style="padding-left: 179pt; text-indent: 0pt; text-align: center">
    Jumeau Numérique National
  </p>
  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s7"
    style="padding-left: 86pt; text-indent: 0pt; text-align: center"
  >
    IGN
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 19pt; text-indent: 0pt; text-align: left">
    OBEPINE+
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 36pt; text-indent: 0pt; text-align: left">
    Surveillance sanitaire
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 19pt; text-indent: 0pt; text-align: left">
    Hydrologie urbaine
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 19pt; text-indent: 0pt; text-align: left">WHAOU</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 19pt; text-indent: 0pt; text-align: left">
    Chimie des eaux usées
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h3 style="padding-left: 137pt; text-indent: 0pt; text-align: center">
    RECHARGE (PEPR
  </h3>
  <h3 style="padding-left: 138pt; text-indent: 0pt; text-align: center">
    OneWater)
  </h3>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 19pt; text-indent: 0pt; text-align: left">
    Indicateurs de santé
  </p>
  <p
    class="s9"
    style="
    padding-top: 1pt;
    padding-left: 14pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    DataTerra <span class="s13">AERIS</span>
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s9"
    style="padding-left: 23pt; text-indent: -16pt; text-align: left"
  >
    Métropole de Lille
  </p>
  <h4
    style="
    padding-top: 5pt;
    padding-left: 19pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    RESILIENCE
  </h4>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 4pt; text-indent: 0pt; text-align: left">
    Pertinence des
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 67pt; text-indent: -32pt; text-align: left">
    Cartographie multi-échelles des polluants atmosphériques
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 19pt; text-indent: 0pt; text-align: left">ACTRIS</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 32pt; text-indent: 0pt; text-align: left">
    POLL-EXPO
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 19pt; text-indent: 0pt; text-align: left">ACME</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 139pt; text-indent: 0pt; text-align: center">
    Cartographie
  </p>
  <p style="padding-left: 139pt; text-indent: 0pt; text-align: center">
    polluants émergents (T4.3 et 3.4)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 139pt; text-indent: 0pt; text-align: center">
    URBHEALTH
  </h1>
  <p style="padding-top: 1pt; text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 80pt; text-indent: 0pt; text-align: left">
    BATENQUE
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    style="
    padding-left: 264pt;
    text-indent: 0pt;
    line-height: 10pt;
    text-align: left;
  "
  >
    <span />
  </p>
  <p style="padding-left: 40pt; text-indent: -34pt; text-align: left">
    Exposition intérieur/extérieur à la pollution atmosphérique
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 64pt; text-indent: 0pt; text-align: left">ENZU</h1>
  <p
    class="s3"
    style="
    padding-top: 7pt;
    padding-left: 3pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    Modélisation particules ultrafines
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s6"
    style="padding-left: 133pt; text-indent: 0pt; text-align: center"
  >
    Jumeau Numérique National
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    UGE
  </p>
  <p
    style="
    padding-top: 2pt;
    padding-left: 102pt;
    text-indent: 0pt;
    text-align: center;
  "
  >
    Mise à dispo des données (25% de la recherche nationale V et T durables)
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p
    class="s14"
    style="
    padding-left: 191pt;
    text-indent: 0pt;
    line-height: 107%;
    text-align: center;
  "
  >
    Démonstrateurs ville
  </p>
  <p
    class="s14"
    style="padding-left: 191pt; text-indent: 0pt; text-align: center"
  >
    durable
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">OPUR</h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    Socioécosystème Seine
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 13pt; text-indent: 0pt; text-align: left">
    Bien et mieux vivre en ville
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s6" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    Bien-être résidentiel
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">SAPHIR</h1>
  <p style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    indicateurs CAP Territoires
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    MobilAir
  </h1>
  <p style="padding-top: 2pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 22pt; text-indent: -15pt; text-align: left">
    source d&#39;inspiration pour des collaborations réussies avec des
    municipalités
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 58pt; text-indent: 0pt; text-align: left">
    UPEX-Paris
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 21pt; text-indent: 0pt; text-align: left">
    POPARTS
  </h1>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p class="s3" style="padding-left: 15pt; text-indent: 0pt; text-align: left">
    Modélisation potentiel oxydant
  </p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 52pt; text-indent: 0pt; text-align: left">
    Partenaires académiques
  </p>
  <p style="padding-top: 6pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-left: 9pt; text-indent: 0pt; text-align: left">terrain</p>
  <h1
    style="
    padding-top: 5pt;
    padding-left: 52pt;
    text-indent: 0pt;
    text-align: left;
  "
  >
    PIREN-
  </h1>
  <h1 style="padding-left: 54pt; text-indent: 0pt; text-align: left">Seine</h1>
  <p
    class="s15"
    style="
    padding-top: 5pt;
    padding-left: 52pt;
    text-indent: 1pt;
    line-height: 106%;
    text-align: center;
  "
  >
    Ville- Métabolisme, Chaire PSL
  </p>
  <p style="padding-top: 11pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="padding-top: 4pt; text-indent: 0pt; text-align: left"><br /></p>
  <p class="s7" style="text-indent: 0pt; text-align: right">ENP Blois</p>
  <p
    class="s7"
    style="
    padding-top: 4pt;
    padding-left: 185pt;
    text-indent: 0pt;
    text-align: center;
  "
  >
    action coeur de ville
  </p>
  <p style="padding-top: 4pt; text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 68pt; text-indent: 0pt; text-align: left">
    CO MESAP
  </h1>
  <p style="padding-top: 5pt; text-indent: 0pt; text-align: left"><br /></p>
  <p style="text-indent: 0pt; text-align: left"><br /></p>
  <h1 style="padding-left: 5pt; text-indent: 4pt; text-align: left">
    carto sensible
  </h1>
  <p
    style="
    padding-top: 5pt;
    padding-left: 41pt;
    text-indent: -36pt;
    text-align: left;
  "
  >
    formats de données en sortie de modèle et intégration SIG
  </p>
  <p style="text-indent: 0pt; text-align: left"><span /></p>
  <p style="text-indent: 0pt; text-align: left">
    <span />
  </p> `
```
