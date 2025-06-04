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
2. Datasets are cleaned with the python script [clean_wordcloud.py](src/) by
   1. removing `-` characters
   2. separating words by `/` characters
   3. ignoring words using `ignored_words_en.csv` or `ignored_words_fr.csv`
   4. removing duplicates according to the following files `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
   5. grouping words using `synonym_mappings_en.json` or `synonym_mappings_fr.json`
3. The final cleaned dataset is a table with the top **50** word occurences

```bash
python src/wordcloud_workflow.py test-data/configs/wordclouds/wordcloud_workflow_config.json
```
