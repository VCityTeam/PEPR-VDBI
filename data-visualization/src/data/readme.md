This directory contains input data or scripts for integrating data sources
([data loaders](https://observablehq.com/framework/data-loaders)) to be visualized using
observable. Refer to the respective [observable dashboard or markdown documentation](../)
for specific data loader documentation.

### Running dataloaders manually
To install Python dataloader dependencies, run:
```bash
pip install requests
pip install pandas
pip install openpyxl
```

Some dataloaders require your terminal be in the `../` directory

> [!NOTE] Private data
> Some data files are not provided and must be added manually to the folder `./private/`.
> Please contact the PEPR VDBI monitoring manager (responsable de la veille) if you believe data is missing:
> Diego Vinasco-Alvarez - diego.vinasco-alvarez@liris.cnrs.fr

> [!WARNING] ORCiD API access
> Data loaders that require and ORCiD API key (denoted by :asterisk:) require you have a
> file named `.env` in this directory with the following contents:
> ```bash
> # ORCiD API secrets
> CLIENT_ID="MY_APP_ID"
> CLIENT_SECRET="MY_APP_SECRET"
> ```

| Filename                                                                | Provided           | Description                                                                                                             |
| ----------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| fetch-orcid-access-token.json.sh                                        | :asterisk:         | Data loader for creating ORCiD access token (used to retrive ORCiD data)                                                |
| fr-esr-structures-recherche-publiques-actives.csv.js                    | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr                             |
| fr-esr-structures-recherche-publiques-actives.geocoded.csv              | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr (not actually a dataloader) |
| fr-esr-structures-recherche-publiques-actives.json.js                   | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr                             |
| cj_septembre_2022_nX                                                    | :white_check_mark: | INSEE catégories juridiques by level (from https://www.insee.fr/fr/information/2028129)                                 |
| orcids.csv.py                                                           | :asterisk:         | Fetch researcher ORCiD information by first and last name                                                               |
| orcids.xlsx.py                                                          | :asterisk:         | Fetch researcher ORCiD information by first and last name                                                               |
| world.json.js                                                           | :white_check_mark: | Fetch country geometry GeoJSON for projection to globe view                                                             |
