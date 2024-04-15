# AI-based Automated Data Integration Experiments

## Unstructured text to structured text tests

```mermaid
---
title: Proposed method (steps 1-4)
---
flowchart LR
    A(PDF) -->|1. Transform| B(Unstructured Text)
    B --> C{Large Language\n Model query}
    C -->|2. Create a list of the\n given projects| X(''Structured'' text)
    C -->|3. Create 4 keywords\n per project| Y(''Structured'' text)
    C -->|4. Fuse these keywords\n into 1 list| Z(''Structured'' text)
    X --> C
    Y --> C
    Z --> C
```

### Test 1 - PDF to unstructured text

**Research question:** What is the best open source PDF to text tool or library for transforming pdf files to text?

**Requirements:**

1. Open source license
2. Source available on github or library available on packaging repository (Pypi, npm, etc.)
3. Must run locally

**Initial candidates:**

| Tool/library                                                    | Type                              |
| --------------------------------------------------------------- | --------------------------------- |
| [RAGFlow](https://github.com/infiniflow/ragflow)                | CLI (Command line interface) tool |
| [pd3f](https://github.com/pd3f/pd3f)                            | CLI tool                          |
| [pypdf](https://github.com/py-pdf/pypdf)                        | Python Library                    |
