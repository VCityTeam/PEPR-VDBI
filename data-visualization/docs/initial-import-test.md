---
title: Initial table test
---

# Import and visualize sheet "240117 consortium laboratoire^J"

Visualize the first sheet from the phase 1 Excel document as a table.

## Integration process

D3 and the Observable framework can't import `.xls` or `.xlsx` files, so we must export to `.csv` first.
Then the data should be transformed into a table (in a relational formalism) using a [component](./components/initial-component-test.js).

```mermaid
flowchart LR
    subgraph Excel doc
        AA[Sheet 1]
        AB[Sheet ...]
        AC[Sheet n]
    end
    AA -->|Export| BA[CSV 1]
    AB -->|Export| BB[CSV ...]
    AC -->|Export| BC[CSV n]
    subgraph Web Application
        C("Table (relational formalism)")
    end
    BA -->|Load| C
    BB -->|Load| C
    BC -->|Load| C
```

## Visualization result

```js
import {timeline} from "./components/timeline.js";
```

```js
const events = FileAttachment("./data/phase1_sheet1.csv").csv({typed: true});
```

```js
timeline(events, {height: 300})
```
