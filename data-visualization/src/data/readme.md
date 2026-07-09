# Data directory

This directory contains input data or scripts for integrating data sources
([data loaders](https://observablehq.com/framework/data-loaders)) to be visualized
using observable. Refer to the respective [observable dashboard or markdown documentation](../)
for specific data loader documentation.

## Running dataloaders manually

To install Python dataloader dependencies, [install uv](https://docs.astral.sh/uv/getting-started/installation/)

Once installed, sync installed libraires:

```bash
uv sync
```

Some dataloaders require your terminal be in the `../` directory

> [!NOTE] Private data
> Some data files are not provided and must be added manually to the folder `./private/`.
> Please contact the PEPR VDBI monitoring manager (responsable de la veille) if you believe data is missing:
> Diego Vinasco-Alvarez - <diego.vinasco-alvarez@liris.cnrs.fr>

> [!WARNING] ORCiD API access
> Data loaders that require and ORCiD API key (denoted by :asterisk:) require you have a
> file named `.env` in this directory with the following contents:
>
> ```bash
> # ORCiD API secrets
> CLIENT_ID="MY_APP_ID"
> CLIENT_SECRET="MY_APP_SECRET"
> ```

## Grist data schema

```mermaid
---
config:
  theme: forest
---
erDiagram
    Projet 1+ to 0+ Laboratoire  : "Laboratoire par Projet"
    Laboratoire 1 to 0+ LABEL : "Labels des laboratoires"
    Projet 1+ to 0+ Institution  : "Institution par Projet"
    Institution 1 to 0+ _LABEL : "Labels des institutions"
    Projet 1 to 1+ "Membre par Projet" : ""
    "Membre par Projet" 1+ to 1 Membre : ""
    Membre 1+ to 0+ CNU          : "Membre par CNU"
    Membre 1+ to 0+ "Mot clé"    : "Membre par Mot clé"
    Projet 1+ to 0+ "Partenaire socioeconomique" : "Partenaire socioeco par Projet"
    "Partenaire socioeconomique" 1 to 0+ LABEL_ : "Labels des partenaires socioeconomiques"

    %% Projet {
    %%     Text        ID_PROJET       PK
    %%     Choice      TYPE
    %%     Text?       NOM_FR          UK
    %%     Text?       NOM_EN          UK
    %%     Toggle      FINANCE
    %%     Choice?     NOTE
    %%     Choice?     DEFI_PRINCIPALE
    %%     Toggle?     DEFI_1
    %%     Toggle?     DEFI_2
    %%     Toggle?     DEFI_3
    %%     Toggle?     DEFI_4
    %%     Toggle?     DEFI_5
    %%     Toggle?     DEFI_6
    %%     Numeric     BUDGET
    %%     Text?       COMMENTAIRE
    %% }

    %% Laboratoire {
    %%     Text        ID_UNITE                        PK
    %%     Text?       numero_national_de_structure    UK
    %%     Text?       libelle
    %%     Text?       sigle
    %%     Numeric?    annee_de_creation
    %%     Choice?     type_de_structure
    %%     Numeric?    code_de_type_de_structure
    %%     Numeric?    code_de_niveau_de_structure
    %%     Numeric?    code_postal
    %%     Text[]?     label_numero                        "Les numeros de l'unité"
    %%     Text[]?     code_domaine_scientifique
    %%     Text[]?     domaine_scientifique
    %%     Text[]?     code_panel_erc
    %%     Text[]?     panel_erc
    %% }

    %% Institution {
    %%     Text        ID_INSTITUTION      PK
    %%     Numeric?    siret               UK
    %%     Numeric?    siren               UK
    %%     Text?       libelle
    %%     Text?       nom_complet
    %%     Numeric?    nature_juridique
    %%     Numeric?    latitude
    %%     Numeric?    longitude
    %%     Text?       libelle_commune
    %%     Numeric?    code_postal
    %%     Numeric?    region
    %% }

    %% "Partenaire socioeconomique" {
    %%     Text        ID_PARTENAIRE       PK
    %%     Numeric?    siret               UK
    %%     Numeric?    siren               UK
    %%     Text?       libelle
    %%     Text?       nom_complet
    %%     Text?       activities
    %%     Numeric?    nature_juridique
    %%     Numeric?    latitude
    %%     Numeric?    longitude
    %%     Text?       libelle_commune
    %%     Numeric?    code_postal
    %%     Numeric?    region
    %%     Text?       COMMENTAIRE
    %% }

    %% Membre {
    %%     Text        ID_MEMBRE   PK
    %%     Toggle      ACTIVE
    %%     Text?       PRENOM
    %%     Text?       NOM
    %%     Text?       EMAIL       UK
    %%     Choice?     GENRE
    %%     Text?       ORCID       UK
    %%     Text?       IDHAL       UK
    %%     Text?       IDREF       UK
    %%     Text?       SITE
    %% }

    %% "Membre par Projet" {
    %%     Text      MEMBRE    PK,FK
    %%     Choice?   POSITION  PK
    %%     Text      PROJET    PK,FK
    %% }
```
