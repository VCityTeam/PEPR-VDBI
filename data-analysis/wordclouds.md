Create word clouds from project descriptions

## Text collection process by source

Text input and output is stored on the Gouv+Anim nextcloud. Ask Diego Vinasco-Alvarez for more information.

### PEPR VDBI project calls

1. Copy all text (with the exception of major section headers) from the following three sections of each project call:
   * Resume (en)
   * Resume (fr)
   * Sections 2.1 and 2.2 regarding WP descriptions
2. Texts are aggregated in the `financed_project_XXX.txt` files

### PEPR Recyclage

1. Copy all text (with the exception of titles and section headers) from the following three sections of each project [website](https://www.pepr-recyclage.fr/):
   * Excerpt (en)
     * Project title (en)
     * Project description (en)
     * Keywords (en)
   * Tasks (en)
   * Consortium (en)
2. For projects still under construction phases such as 'Soon to come' are removed.
3. Texts are aggregated in the `pepr_recyclage_project_XXX.txt` files

## Text treatment

1. Texts are uploaded to https://www.nuagesdemots.fr/ to create an initial wordcount dataset
2. Datasets are cleaned by
   1. separating words by `/` characters
   2. ignoring words using the stop words from https://countwordsfree.com/stopwords:
      1. `stop_words_english.csv`
      2. `stop_words_french.csv`
   3. removing `-` characters
   4. removing duplicates according to the following files `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
   5. grouping words using `synonym_mappings_en.json` or `synonym_mappings_fr.json`
3. The final cleaned dataset is a table with the top **50** word occurences

## Text comparison
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

## Experimentation
Automated batch processing is possible with the python script [wordcloud_workflow.py](src/wordcloud_workflow.py). For example to run a configuration to clean a word count:
```bash
python src/wordcloud_workflow.py clean test-data/configs/wordclouds/wordcloud_clean_workflow_config.json
```
To run a configuration to compare two word counts:
```bash
python src/wordcloud_workflow.py compare test-data/configs/wordclouds/wordcloud_compare_workflow_config.json
```
For usage, run:
```bash
python src/wordcloud_workflow.py -h
```
