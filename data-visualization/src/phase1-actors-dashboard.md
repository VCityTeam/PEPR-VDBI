---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  partners_aap2023: ./data/partners_aap2023.csv
  partners_by_project_annex: ./data/partners_by_project_annex.csv
  partners_general: ./data/partners_general.csv
  orcids: ./data/orcids.csv
---

# Phase 1 Actors

<!-- 
```js
const partners_aap2023_test = FileAttachment(
  "./data/partners_aap2023.csv"
);
const test = partners_aap2023_test.csv();
```

```js
display(partners_aap2023_test);
```

```js
display(test);
```
-->

```sql
SELECT * FROM partners_aap2023 LIMIT 10
```

```sql
SHOW partners_aap2023
```

```sql
SELECT #1, #2 FROM partners_aap2023
```

```sql
SELECT * FROM orcids
```
