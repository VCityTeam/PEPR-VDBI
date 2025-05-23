---
theme: [dashboard, light]
sql:
  mural: ./data/private/Cartographie PEPR VDBI-1748013777151.csv
---

# Mural data

```sql id=projects
select
  -- *
  ID,
  Text as Title,
  'BG Color' as Category
from mural
where Area = 'Cartographie (à compléter)'
```
