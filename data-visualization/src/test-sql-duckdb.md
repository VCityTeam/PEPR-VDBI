---
title: Researcher Dashboard
theme: [light]
sql:
  ann: ./data/partners_by_project_annex.csv
  aap: ./data/partners_aap2023.csv
  gen: ./data/partners_general.csv
---

# Phase 1 Actors

The purpose of this test is to understand the process and limitations of integrating and
manipulating data using the Observable Framework and DuckDB:
- [SQL code block documentation](https://observablehq.com/framework/sql)
- [Observable DuckDB documentation](https://observablehq.com/framework/lib/duckdb)

The test will load and merge 3 different CSVs concerning project and partner information:
  - `./data/partners_by_project_annex.csv`
  - `./data/partners_aap2023.csv`
  - `./data/partners_general.csv`

```sql echo
SHOW TABLES
```

<div class="tip">
  Reloading the page may fix some errors! Some queries, views, and variables don't seem to
  load well during asyncronous SQL calls from different code blocks.
</div>

## Tables

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

### aap

```sql
SELECT * FROM aap
```
```sql id=[{count_aap}]
SELECT count() as count_aap FROM aap
```
count_aap
```js
count_aap
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

## Merge

```sql echo
-- clean tables and create views

UPDATE gen
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE gen
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

-- merge tables
CREATE OR REPLACE VIEW union_all AS
SELECT *
FROM aap
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
  -- nature_juridique,
  -- latitude,
  -- longitude,
  -- libelle_commune,
  -- commune,
  list(project_coordinator) AS project_coordinator,
  list(source) AS source,
FROM union_all
GROUP BY
  siret,
  project_name,
  nom_complet,;
  -- nature_juridique,
  -- latitude,
  -- longitude,
  -- libelle_commune,
  -- commune,
  -- project_coordinator,

SELECT * FROM partners
```

## Compare differences by project-partner counts

<!--
```sql id=total_partner_counts
# this doesn't work well asyncronously as `partners` may not load in time
SELECT project_name, count() AS partner_count, 'total' AS source
FROM partners
GROUP BY project_name
ORDER BY project_name ASC;
``` -->

```sql id=ann_partner_counts
SELECT project_name, count() AS partner_count, 'ann' AS source
FROM ann
GROUP BY project_name
ORDER BY project_name ASC;
```

```sql id=aap_partner_counts
SELECT project_name, count() AS partner_count, 'aap' AS source
FROM aap
GROUP BY project_name
ORDER BY project_name ASC;
```

```sql id=gen_partner_counts
-- update just in case the previous async update call hasn't run
UPDATE gen
  SET project_name = 'RESILIENCE'
  WHERE project_name = 'RÉSILIENCE';
UPDATE gen
  SET project_name = 'NEO'
  WHERE project_name = 'NÉO';

SELECT project_name, count() AS partner_count, 'gen' AS source
FROM gen
GROUP BY project_name
ORDER BY project_name ASC;
```

```js
await visibility(); // stall so the partners table is created in time (hopefully)

const total_partner_counts = await sql`
  SELECT project_name, count() AS partner_count, 'total' AS source
  FROM partners
  GROUP BY project_name
  ORDER BY project_name ASC;`;

const all_counts = d3.merge([
  total_partner_counts,
  ann_partner_counts,
  aap_partner_counts,
  gen_partner_counts,
])
display(Plot.plot({
  marginBottom: 50,
  fill: {legend: true},
  x: {
    tickRotate: 50,
  },
  marks: [
    Plot.barY(all_counts, {
      fill: "source",
      fx: "project_name",
      x: "source",
      y: "partner_count",
      tip: true
    }),
  ]
}));
```
