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

```sql id=[{count_ann}]
SELECT count() as count_ann FROM ann
```
```sql id=[{count_app}]
SELECT count() as count_app FROM app
```
```sql id=[{count_gen}]
SELECT count() as count_gen FROM gen
```
```sql id=[{count_par}]
SELECT count() as count_par FROM partners
```

count_ann
```js
count_ann
```

count_app
```js
count_app
```

count_gen
```js
count_gen
```

count_par
```js
count_par
```

```sql
SELECT * FROM partners
```

### ann

```sql
SELECT * FROM ann
```

### app

```sql
SELECT * FROM app
```

### gen

```sql
SELECT * FROM gen
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
  -- project_coordinator,
  -- project_coordinator AS app_project_coordinator,
  -- project_coordinator AS gen_project_coordinator,
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
  -- project_coordinator,
  -- project_coordinator AS app_project_coordinator,
  -- project_coordinator AS gen_project_coordinator,
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
  -- project_coordinator,
  -- project_coordinator AS app_project_coordinator,
  -- project_coordinator AS gen_project_coordinator,
FROM gen;

SELECT * FROM union_all
```

## Partners

```sql
-- SELECT *
-- FROM union_all as all1
-- JOIN union_all as all2
--   USING (siret, project_name)
```
