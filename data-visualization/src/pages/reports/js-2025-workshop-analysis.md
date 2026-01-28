---
style: /css/vdbi-page.css
sql:
  entities: "/data/private/VDBI_JS_2025_atelier_NEO_entities.tsv"
  # extracted_terms: "/data/private/VDBI_JS_2025_atelier_NEO_extracted_terms.tsv"
  nouns_by_group: "/data/private/VDBI_JS_2025_atelier_NEO_nouns_by_group.tsv"
  nouns: "/data/private/VDBI_JS_2025_atelier_NEO_nouns.tsv"
  # verbs: "/data/private/VDBI_JS_2025_atelier_NEO_verbs.tsv"
  # adj: "/data/private/VDBI_JS_2025_atelier_NEO_adj.tsv"
---

# VDBI JS 2025 Lexicometric Analysis <!-- omit in toc -->

## NEO/SoLocale Workshop <!-- omit in toc -->

## 1. Context

This report provides a lexicometric analysis of the NEO/SoLocale workshop held
on November 5th, 2025 during the [2025 PEPR VDBI Journées Scientifiques](https://pepr-vdbi.fr/evenements/journees-scientifiques-annuelles-villes-durables-batiments-innovants-2025).

The purpose of this analysis is to automatically identify the most relevant keywords
and entities noted during the workshop. Additionally, this report identifies the
known limitations of the proposed methodology and when compared to a manual analysis.

The NEO/SoLocale workshop was composed largely of group discussions and activities.
This report will focus on a the final "World café" synthesis activity, where 3
groups of paricipants were asked to present the conclusions of their group work.
The activity theme is :

> "Comment garder la mémoire et retranscrire les démarches de collaboration et
> de co-création des outils de la connaissance en vue de la réplicabilité sur
> d’autres territoires ? Illustration à travers le cas d’usage Sol autour de la
> problématique plus spécifique des données."

To answer this, one or more questions were assigned to each group:

> 1. Comment capitaliser et transmettre les apprentissages à l’échelle
>    nationale ?
> 2. Comment documenter le processus ? Quels sont les éléments transposables
>    (ou non) ? Quelles spécificités propres au territoire ?
> 3. Comment évaluer et améliorer les processus (de coconstruction, d’apprentissage
>    réciproque) ?

Other activities of the workshop, including the question sections, will
unfortunately not be analyzed due to insufficient quality of the recorded workshop
audio.

The report is structured as follows:

- [Section 2](#2-method) details the proposed methodology and steps for reproducibility
- [Section 3](#3-lexical-analysis-results) presents the results of the lexicometric
  analysis
- [Section 4](#4-method-review) reviews the limitations of the proposed methodology

## 2. Method

The diagram below illustrates the analysis process.

First, a video of the workshop activity was recorded live. The recordings for the
workshop are not currently made publicly available for participant and animator
privacy. The audio was then extracted and cut with [Microsoft Clipchamp](https://clipchamp.com/en/)
to be transcribed.

Transcription was done using [Whisper](https://github.com/openai/whisper)'s
`large-v2` model. This transcript was manually verified and corrected. An evaluation
of the transcription quality is provided in [section 4.1](#41-whisper-error-rate-measurement).

Next, the transcript was processed using the [Cortext](https://www.cortext.net/)
social science and humanities research infrastructure.
Cortext uses Natural Language Processing (NLP) and machine learning to extract keywords
and entities from a corpus. This analysis uses two main Cortext tasks:

1. **Named Entity Recognition (NER)** [[5.1]](#51-cortext-documentation-named-entity-recognition)
   to "identify and index persons, places, organizations, etc."
   The following metrics are provided for each extracted entity:
   - _frequency_: The number of times the entity appears in the workshop
   - _type_: The type of the entity (e.g. Person, Organization, Location)
2. **(Multi)Term extraction** [[5.2]](#52-cortext-documentation-multiterm-extraction)
   to identifiy terms used during the workshop. Including "not only simple terms
   but also multi-terms (called [n-grams](https://en.wikipedia.org/wiki/N-gram))."
   The following metrics are provided for each extracted term:
   - _C-value_: A measure of the frequency of a term
   - _G2_ (gf.idf): An alternative frequency measurement of a term "based on the
   assumption that interesting terms tend to be repeated within the same document."
   <!-- - _Specificity_ (${tex`X^2`}): How specific a term is within the text -->
   - _Occurrences_: The number of group presentations where a term appears
   - _Cooccurrence_: The number of times the term cooccurs with other terms in the
   same group presentation
   <!-- 3. **W2V Explorer** [[5.3]](#53-cortext-documentation-w2v-explorer) to "[learn]
      the word embedding of every word... in a corpus and [visualize] the position
      of words in a reduced 2 dimensional space. Words are also clustered according
      to their proximity." -->

<div class="note">

The term '_corpus_' refers to a corpus of documents. In this case, each document
refers to a transcript of a group presentation of the workshop.

</div>

<div class="note">

Cortext NER doesn't have as many entity types or configurations for french.

</div>

<div class="note">

Only the extracted noun terms are used in this analysis. Initial extaction of verbs
and adjectives did not yield interesting results.

</div>

<div class="note">

The term extraction step is run once on the entire corpus, and once for each
group presentation to extract term frequency by group statistics.

</div>

```mermaid
---
title: "Fig 1. Analysis Process"
config:
  theme: neutral
---

stateDiagram-v2

  %%direction LR

  video     : Workshop video recording
  audio     : Workshop audio
  corpus    : Cortext corpus
  entities  : Named entities
  %sim       : Term/Entity similarity

  [*] --> video
  [*] --> audio
  video --> audio       : Extract audio
  audio --> Transcript  : Transcribe with Whisper
  Transcript --> corpus         : Import into Cortext

  state fork2 <<fork>>
    corpus --> fork2
    fork2 --> entities    : Named Entity Recognition
    fork2 --> Multiterms  : Extract multiterms

  %state join <<join>>
  %  Multiterms --> join
  %  entities --> join
  %  join --> sim : W2VExplorer

  state join2 <<join>>
    entities --> join2
    Multiterms --> join2
    join2 --> [*]
```

The following parameters were used to configure the Cortext tasks as of 19/12/2025.

| Task                    | Parameter                | Value |
| :---------------------- | ------------------------ | ----- |
| Terms extraction        | Textual Fields           | text  |
| Terms extraction        | Minimum Frequency        | 2     |
| Terms extraction        | language                 | fr    |
| Terms extraction        | Monogramms are forbidden | no    |
| Named Entity Recognizer | Textual Fields           | text  |
| Named Entity Recognizer | language                 | fr    |

<div class="note">Unmentioned parameters use their default settings</div>

## 3. Lexical Analysis Results

```js
import {
  downloadSVGButton,
  downloadTableButton,
} from "/components/utilities.js"
```

```sql id=nouns_by_group
select * from nouns_by_group
```

```sql id=nouns
select * from nouns
```

```sql id=entities
select * from entities
```

Each group presentation is numbered based on their respective question(s) as
follows:

- **Group 1:** "Comment capitaliser et transmettre les apprentissages à l’échelle
  nationale ?"
- **Group 2:** "Comment documenter le processus ? Quels sont les éléments transposables
  (ou non) ?"
- **Group 3:** "Comment évaluer et améliorer les processus
  (de coconstruction, d’apprentissage réciproque) ?"

Between the [extracted entities](#3-1-extracted-entities-by-group)
(identified persons, places, organizations, etc.) and the
[extracted terms](#3-3-extracted-terms-by-frequency), we can observe the following:

- There is little overlap between the extracted entities and terms
  - With the only exception being "PEPR", evoked by group 1
- There is no overlap between the extracted entities of each group presentation
- There is little overlap entity reuse within each group presentation (with the
  exception of the "PEPR" in group 1)
- Looking at the top 6 most frequently used terms overall and by group, we can see
  that **#question**", **#territoire**", **#acteurs**", **#projet**", and **#processus-de-co-construction**
  are the most commonly used terms.

  | Top 6 by frequency                | Top 6 by group frequency          |
  | --------------------------------- | --------------------------------- |
  | **#question**                     | **#territoire**                   |
  | **#territoire**                   | #sujet                            |
  | **#acteurs**                      | **#question**                     |
  | #notion                           | **#acteurs**                      |
  | #projet                           | #métropole                        |
  | **#processus-de-co-construction** | **#processus-de-co-construction** |

- Interestingly, group 3 evokes the term **#processus** and **#processus-de-co-construction**
  more than group 2 despite both groups' question being about processes [[3.2]](#3-2-extracted-terms-by-frequency-by-group).
  This seems to be due to the fact that group 2's presentation focused more on the
  transposable elements of the process of documentation than _how_ to document it.
- Looking at the extracted entities and terms by group

### 3.1. Extracted Entities by group

<div id="entities">
  ${resize((width) =>
    generateEntitiesPlot(entities, width)
  )}<!-- $ -->
  <!-- ${downloadSVGButton("#entities svg")} -->

</div>

```js
const entity_type_map = new Map([
  ["loc", "Location"],
  ["org", "Organization"],
  ["misc", "Miscellaneous"],
])

const generateEntitiesPlot = (data, width) =>
  Plot.auto(data, {
    x: (d) => Number(d.frequency),
    y: "entity",
    fx: "group",
    color: (d) => entity_type_map.get(d.type),
    mark: "bar",
  }).plot({
    width: width,
    y: { label: "Entity", grid: true },
    x: { label: "Frequency" },
    fx: { label: "Group" },
    color: { legend: true },
    marginLeft: 150,
  })
```

${extractedTermsByGroupHtmlTemplate([...nouns_by_group])}

${extractedTermsHtmlTemplate([...nouns])}

```js
const column_title_map = new Map([
  ["C-value", "3.3. Terms by frequency"],
  ["Gfidf", "3.4. Terms by group frequency"],
  // ["Specificity chi2", "3.5. Terms by specificity"],
  ["Occurrences", "3.6. Terms by group occurrences"],
  ["Cooccurrences", "3.7. Terms by group co-occurrences"],
])

const column_label_map = new Map([
  ["C-value", "C-value"],
  ["Gfidf", "G2 (gf.idf)"],
  // ["Specificity chi2", "X^2"],
  ["Occurrences", "Group occurrences"],
  ["Cooccurrences", "Group co-occurrences"],
])

const generateExtractedTermsPlot = (data, x_column) =>
  resize((width) =>
    Plot.plot({
      x: {
        label: column_label_map.get(x_column),
        ticks: d3.max(data.map((d) => d[x_column])) === 1 ? 1 : undefined,
        // axis: "both",
        nice: true,
      },
      symbol: { legend: true },
      width: width,
      marginLeft: 180,
      grid: true,
      marks: [
        Plot.frame(),
        Plot.barX(data, {
          x: (d) => Number(d[x_column]),
          y: "Main form",
          fill: "var(--theme-foreground-focus-alt)",
          sort: { y: "-x" },
        }),
      ],
    }),
  )

const extractedTermsHtmlTemplate = (data) =>
  html`<div class="grid grid-cols-2">
    ${column_title_map.keys().map(
      (column) =>
        html`<div>
          <h3>${column_title_map.get(column)}</h3>
          <div id="all-terms-${column}-plot">
            ${generateExtractedTermsPlot(data, column)}
          </div>
        </div>`,
    )}
  </div>`
// ${downloadSVGButton(`#all-terms-${column}-plot svg`)}

const extractedTermsByGroupHtmlTemplate = (data) =>
  html`<h3>3.2. Extracted terms by frequency by group</h3>
    ${resize((width) =>
      Plot.plot({
        x: {
          label: column_label_map.get("C-value"),
          ticks: d3.max(data.map((d) => d["C-value"])) === 1 ? 1 : undefined,
          // axis: "both",
          nice: true,
        },
        fx: { label: "Group" },
        symbol: { legend: true },
        width: width,
        marginLeft: 180,
        grid: true,
        marks: [
          Plot.frame(),
          Plot.barX(data, {
            x: (d) => Number(d["C-value"]),
            y: "Main form",
            fill: "var(--theme-foreground-focus-alt)",
            fx: "group",
            sort: { y: "-x" },
          }),
        ],
      }),
    )}`
// ${downloadSVGButton(`#terms-${"C-value"}-plot svg`)}
```

## 4. Method review

### 4.1. Whisper error rate measurement

The Whisper transcription accuracy was measured using the [Word Error Rate (WER)](https://en.wikipedia.org/wiki/Word_error_rate)

```tex
WER=\frac{S+D+I}{N}=\frac{S+D+I}{S+D+C}
```

Where

- ${tex`S`} is the number of substitutions,
- ${tex`D`} is the number of deletions,
- ${tex`I`} is the number of insertions,
- ${tex`N`} is the number of words in the reference (N=S+D+C),
- ${tex`C`} is the number of correct words

For this study words are separated by spaces (i.e., '_c'est_' is considered
a single word)

The following table shows the WER for each group presentation:

| Source text          | S   | D   | I   | N    | WER          |
| :------------------- | --- | --- | --- | :--- | :----------- |
| Group 1 presentation | 3   | 2   | 4   | 319  | 0.028213     |
| Group 2 presentation | 1   | 42  | 31  | 1000 | 0.074000     |
| Group 3 presentation | 29  | 204 | 88  | 907  | 0.353914     |
| **Total**            | 33  | 248 | 133 | 2226 | **0.185984** |

<div class="note">

It should be noted that a large majority of measured deletions are clustered
together. Surprisingly, Whisper's errors often materialize as several
repetitive, duplicate lines. These are easy to find and correct manually.

</div>

<div class="tip">

A [git diff](https://git-scm.com/docs/git-diff) is used to help identify the WER
manually. Notably, existing tools with known limitations could be used in the future:

- [Understanding and Calculating Word Error Rate (WER) in Automatic Speech Recognition using python](https://medium.com/@ramadhanimassawe14/understanding-and-calculating-word-error-rate-wer-in-automatic-speech-recognition-using-python-661f18b518a5)
- [WER-in-python](https://github.com/zszyellow/WER-in-python/tree/master);
  hypothesis and/or reference may need data cleaning depending on use-case

</div>

## 5. References and links

For more information, see the Cortext documentation for details on the methods
used, the parameters and the metrics provided, and scientific references.

### 5.1. [Cortext documentation: Named Entity Recognition](https://docs.cortext.net/named-entity-recognizer/)

### 5.2. [Cortext documentation: (Multi)Term extraction](https://docs.cortext.net/lexical-extraction/)

### 5.3. [Cortext documentation: W2V Explorer](https://docs.cortext.net/w2v-explorer/)
