---
title: Researcher Dashboard
theme: [light]
sql:
  ann: ./data/partners_by_project_annex.csv
  app: ./data/partners_aap2023.csv
  gen: ./data/partners_general.csv
---

# Phase 1 Actors

## Tables

```sql echo
SHOW TABLES
```

<!-- ```sql id=[{count_par}]
SELECT count() as count_par FROM partners
```
count_par
```js
count_par
```
```sql
SELECT * FROM partners
``` -->

### ann

```sql
SELECT * FROM ann
```
```sql id=[{count_ann}]
SELECT count() as count_ann FROM ann
```
count_ann
```js
count_ann
```

### app

```sql
SELECT * FROM app
```
```sql id=[{count_app}]
SELECT count() as count_app FROM app
```
count_app
```js
count_app
```

### gen

```sql
SELECT * FROM gen
```
```sql id=[{count_gen}]
SELECT count() as count_gen FROM gen
```
count_gen
```js
count_gen
```

## Merging

<!-- Prefer app project coordinator over gen -->

```sql echo
CREATE OR REPLACE VIEW union_all AS
SELECT
  siret,
  siren,
  nom_complet,
  -- source_label,
  nature_juridique,
  latitude,
  longitude,
  libelle_commune,
  commune,
  project_name,
  project_coordinator,
  source,
FROM app
UNION
SELECT
  siret,
  siren,
  nom_complet,
  -- source_label,
  nature_juridique,
  latitude,
  longitude,
  libelle_commune,
  commune,
  project_name,
  project_coordinator,
  source,
FROM ann
UNION
SELECT
  siret,
  siren,
  nom_complet,
  -- source_label,
  nature_juridique,
  latitude,
  longitude,
  libelle_commune,
  commune,
  project_name,
  project_coordinator,
  source,
FROM gen;

SELECT * FROM union_all
```

## Partners

```sql
SELECT
  siret,
  project_name,
  nom_complet,
  -- nature_juridique,
  -- latitude,
  -- longitude,
  -- libelle_commune,
  -- commune,
  list(project_coordinator),
  list(proposed_in_annex),
  list(proposed_in_appel2023),
  list(proposed_from_generality),
FROM union_all
GROUP BY
  siret,
  project_name,
  nom_complet,
  -- nature_juridique,
  -- latitude,
  -- longitude,
  -- libelle_commune,
  -- commune,
  -- project_coordinator,
```
