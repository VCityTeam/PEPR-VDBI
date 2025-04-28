---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  ann: ./data/partners_by_project_annex.csv
  app: ./data/partners_aap2023.csv
  gen: ./data/partners_general.csv
---

```sql id=partner_data
-- Clean tables and create views

UPDATE gen
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE gen
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables
CREATE OR REPLACE VIEW union_all AS
SELECT *
FROM app
UNION
SELECT *
FROM ann
UNION
SELECT *
FROM gen;

CREATE OR REPLACE VIEW partners AS
SELECT
  siret,
  project_name,
  nom_complet,
  nature_juridique,
  libelle_commune,
  commune,
  latitude,
  longitude,
  list(project_coordinator) AS project_coordinator,
  list(source) AS source,
  list(source_label) AS source_label,
FROM union_all
GROUP BY
  siret,
  project_name,
  nom_complet,
  nature_juridique,
  libelle_commune,
  commune,
  latitude,
  longitude,
;

SELECT * FROM partners
```

# Phase 1 Actors

```js
display([...partner_data])
display(Inputs.table(partner_data))
```
