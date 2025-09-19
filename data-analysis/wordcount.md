# Text to word count <!-- omit in toc -->

This page describes the process for counting and comparing the word used in plain text files.

> [!TIP]
> These word counts can be passed to the [word cloud generator tool](/data-visualization/src/dashboards/phase1-project-wordcounts.md) to create word clouds.

**Table of contents**

- [Method](#method)
  - [Tokenize words](#tokenize-words)
  - [Clean and count words](#clean-and-count-words)
  - [Word count comparison](#word-count-comparison)
- [To Run](#to-run)
- [Produced word counts](#produced-word-counts)
  - [PEPR VDBI Phase 1 project work package comparison](#pepr-vdbi-phase-1-project-work-package-comparison)
  - [Comparison between PEPR VDBI and PEPR Recyclage project descriptions](#comparison-between-pepr-vdbi-and-pepr-recyclage-project-descriptions)

## Method

```mermaid
---
title: Text to word count method
---
flowchart LR
start@{ shape: circle, label: " " }
  --> in@{ shape: doc, label: "Text file"}
  --> tokenize(Tokenize text)
  --> count("Clean and count words")
  --> choice@{ shape: diamond, label: "Compare word\ncounts?"}
compare(Compare word counts)
  --> out@{ shape: doc, label: "Word count dataset"}
  --> stop@{ shape: dbl-circ, label: " " }
choice -->|yes| compare
choice -->|no| out
```

### Tokenize words

Words are tokenized using [Natural Language Toolkit's](https://www.nltk.org/) `nltk.word_tokenize` function with the default configuration.

### Clean and count words

Word tokens are cleaned by:

1. [Lemmatizing](https://www.ibm.com/think/topics/stemming-lemmatization) with [Natural Language Toolkit's](https://www.nltk.org/) `nltk.stem.WordNetLemmatizer` and the default configuration
2. Mapping tokens to lower case
3. Ignoring predefined stop words
4. Removing tokens that are numeric digits
5. Removing non-alphabetic characters

Once cleaned, the word tokens are aggregated and counted.

> [!WARNING]
> The default lemmatizer does not support French

### Word count comparison

Compare two word counts by:

1. Normalizing them to account for differences in text volumes.
2. Selecting words from each word count based on their:
   1. intersection
   2. union (like an outer join)
   3. complement
3. In the case of intersecting words, updating the count of the words based on the:
   1. Average
   2. Max
   3. Min

## To Run

Before running, you must have [UV](https://docs.astral.sh/uv/) installed for managing python dependencies.
Alternatively, you may install python directly [python](https://www.python.org/).

After installing the prerequisites, install the required npm and python libraries:

```bash
uv sync
source .venv/bin/activate
```

Use the workflow script for automating the pipeline

```bash
uv run src/wordcount_workflow.py test-data/configs/wordcount/full_workflow_test_config.json
```

**Usage:**

```bash
usage: wordcount_workflow.py [-h] [-d] [-l LOG] configuration

Launch a workflow (or data pipeline) based on a configuration

positional arguments:
  configuration      Specify the configuration file.
                     File must be structured as a JSON array of configurations, each specifying the type of activity, the inputs and outputs, and the parameters used for the activity.
                     Two types are currently supported:
                     - 'parse': for reading and parsing a text into a word count
                     - 'clean': for cleaning word counts
                     - 'compare': for comparing word counts
                     For example:
                     [
                        {
                           "activity": "parse",
                           "input_dir": "./input/wordcount-test/",
                           "output_dir": "./wordcount-test_stage_0/"
                        },
                        {
                           "activity": "clean",
                           "input_dir": "./wordcount-test_stage_0/",
                           "output_dir": "./wordcount-test_stage_1/",
                           "limit": 50,
                           "params": {
                           "stop_words_path": "./configs/wordcount/stop_words_english.csv"
                           }
                        },
                        {
                           "activity": "clean",
                           "input_dir": "./wordcount-test_stage_0/",
                           "output_dir": "./wordcount-test_stage_1/",
                           "limit": 100,
                           "params": {
                           "stop_words_path": "./configs/wordcount/stop_words_english.csv"
                           }
                        },
                        {
                           "activity": "compare",
                           "inputs": [
                                 "./wordcount-test_stage_1/example-text_cleaned_50.csv:./wordcount-test_stage_1/example-text_cleaned_100.csv"
                           ],
                           "output_dir": "./output/wordcount-test/",
                           "params": {
                           "mode": "INTERSECTION"
                           }
                        }
                     ]

options:
  -h, --help         show this help message and exit
  -d, --debug        Use debug mode for logging
  -l LOG, --log LOG  Specify the logging file
```

## Produced word counts

This section documents how different word count datasets were produced.

> [!WARNING]
> Some of the input textes contain sensitive information and are not available on Github.
> Reach out to the repository maintainer if you believe you should have access to these files.

### PEPR VDBI Phase 1 project work package comparison

This dataset was initially created to test the new `nltk` integration and create word clouds for the [Journées Scientifiques PEPR VDBI 2025](https://pepr-vdbi.fr/evenements/journees-scientifiques-annuelles-villes-durables-batiments-innovants-2024-1) (JS)

The input texts were sourced by

1. Manually copying all text (with the exception of major section headers) from Sections 2.1 and 2.2 of each project call regarding WP descriptions.
2. Texts were aggregated in the [./test-data/private/input/](./test-data/private/input/) folder as `.txt` files

Once counted, the project description word counts were grouped based on their respective "Regards croisés" sessions of the JS.
Each group's word counts were compared through the sum of their intersections.

This [config](./test-data/configs/wordcount/wordcount_VDBI_project_workflow_config.json) was used to create the dataset.

The results are available in [test-data/output/js_roundtable](./test-data/output/js_roundtable/).

### Comparison between PEPR VDBI and PEPR Recyclage project descriptions

This was done using the deprecated intersection comparison workflow from [d70ef67](https://github.com/VCityTeam/PEPR-VDBI/tree/d70ef67b1900291b74fd0016c558b445f0c9c712/data-analysis) with [this configuration](https://github.com/VCityTeam/PEPR-VDBI/blob/d70ef67b1900291b74fd0016c558b445f0c9c712/data-analysis/test-data/configs/wordcount/wordcount_compare_workflow_config.json)

The initial texts from each PEPR were extracted as follows:

**PEPR VDBI project calls**

1. Manually copying all text (with the exception of major section headers) from the following three sections of each project call:
   - Resume (en)
   - Resume (fr)
   - Sections 2.1 and 2.2 regarding WP descriptions
2. Texts were aggregated in the [./test-data/private/input/](./test-data/private/input/) folder as `.txt` files

**PEPR Recyclage**

1. Copy all text (with the exception of titles and section headers) from the following three sections of each project [website](https://www.pepr-recyclage.fr/):
   - Excerpt (en)
     - Project title (en)
     - Project description (en)
     - Keywords (en)
   - Tasks (en)
   - Consortium (en)
2. Projects still under construction phases such as 'Soon to come' are removed.
3. Texts are aggregated in the [pepr_recyclage_project_XXX.txt](./test-data/input/pepr_recyclage/) folder
