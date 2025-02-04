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
> Data files not provided must be added manually to this folder.

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
| 250120 PEPR_VBDI_analyse modifiée JYT.xlsx                              | :x:                | PEPR Phase 2 project, researcher, site information (latest)                                                             |
| 241021 PEPR_VBDI_analyse modifiée JYT.xlsx                              | :x:                | PEPR Phase 2 project, researcher, site information                                                                      |
| PEPR_VBDI_analyse_210524_15h24_GGE.xlsx                                 | :x:                | PEPR Phase 2 project, researcher, site information                                                                      |
| 240108_consortium, contenus des propositions CNRS-SHS_GGE_JYT_ANRT.xlsx | :x:                | PEPR Phase 1 keywords, project actions, and challenges                                                                  |
| 240117 consortium laboratoire, établissement CNRS-SHS_Stat.xlsx         | :x:                | PEPR Phase 1 project, researcher, site information                                                                      |
| events.json                                                             | :white_check_mark: | Observable example event data                                                                                           |
| fetch-orcid-access-token.json.sh                                        | :asterisk:         | Data loader for creating ORCiD access token (used to retrive ORCiD data)                                                |
| fr-esr-structures-recherche-publiques-actives.csv.js                    | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr                             |
| fr-esr-structures-recherche-publiques-actives.geocoded.csv              | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr (not actually a dataloader) |
| fr-esr-structures-recherche-publiques-actives.json.js                   | :white_check_mark: | Site, university, and/or laboratory information from data.enseignementsup-recherche.gouv.fr                             |
| launches.csv.js                                                         | :white_check_mark: | Observable example rocket launch data                                                                                   |
| orcids.csv                                                              | :white_check_mark: | General researcher ORCiD information                                                                                    |
| orcids.csv.py                                                           | :asterisk:         | Fetch researcher ORCiD information by first and last name                                                               |
| orcids.xlsx                                                             | :white_check_mark: | General researcher ORCiD information                                                                                    |
| orcids.xlsx.py                                                          | :asterisk:         | Fetch researcher ORCiD information by first and last name                                                               |
| world.json.js                                                           | :white_check_mark: | Fetch country geometry GeoJSON for projection to globe view                                                             |
