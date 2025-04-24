---
title: Researcher Dashboard
theme: [dashboard, light]
sql:
  partners_aap2023: ./data/partners_aap2023.csv
  partners_by_project_annex: ./data/partners_by_project_annex.csv
  partners_general: ./data/partners_general.csv
---

# Phase 1 Actors

### partners_aap2023
```sql
SELECT * FROM partners_aap2023
```

### partners_by_project_annex
```sql
SELECT * FROM partners_by_project_annex
```

### partners_general
```sql
SELECT * FROM partners_general
```

siret	siren	nom_complet	source_label	nature_juridique	latitude	longitude	libelle_commune	commune	project_name	project_coordinator	proposed_in_annex	proposed_in_appel2023	proposed_from_generality

```sql
SELECT partners_aap2023, partners_aap2023,
FROM partners_aap2023
JOIN partners_by_project_annex
  ON partners_aap2023.siret = partners_by_project_annex.siret AND
    partners_aap2023.project_name	 = partners_by_project_annex.project_name
```
