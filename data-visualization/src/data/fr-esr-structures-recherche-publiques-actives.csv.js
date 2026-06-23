// code modified from https://observablehq.com/framework/getting-started

import { fetchCsv } from './utilities/data_utilities.js'

const order_by = 'numero_national_de_structure'
const use_labels = true
const format = 'csv'
const delimiter = ','
const list_separator = ';'

const csv_response = await fetchCsv(
  `https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-structures-recherche-publiques-actives/exports/${format}?order_by=${order_by}&delimiter=${delimiter}&list_separator=${list_separator}&use_labels=${use_labels}`,
)

process.stdout.write(csv_response)
