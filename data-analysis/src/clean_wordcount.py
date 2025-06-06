import csv
import json
import argparse
import os
from utils import writeWordCounts


def main():
    parser = argparse.ArgumentParser(
        description="""Clean wordcloud data
            1. Texts are uploaded to https://www.nuagesdemots.fr/ to create an initial
                wordcount dataset
            2. Datasets are cleaned with the python script `clean_wordcount.py` by
                1. removing `-` characters
                2. separating words by `/` characters
                3. ignoring words using `stop_words_en.csv` or `stop_words_fr.csv`
                4. removing duplicates according to the following files
                    `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
                5. grouping words using `synonym_mappings_en.json` or
                    `synonym_mappings_fr.json`
            3. The final cleaned dataset is a table with the top **50** word occurences
            """,
    )
    parser.add_argument("input_path", help="wordcloud input data file (csv)")
    parser.add_argument(
        "-o",
        "--output_dir",
        type=str,
        help="wordcloud output directory",
        default="./",
    )
    parser.add_argument(
        "-l",
        "--limit",
        type=int,
        help="limit number of words to output",
    )
    parser.add_argument(
        "-d",
        "--delimiter",
        help="set input csv delimiter",
        default=",",
    )
    parser.add_argument(
        "-i",
        "--stop_words_path",
        help="words to ignore (csv)",
        default="stop_words_english.csv",
    )
    parser.add_argument(
        "-p",
        "--plural_words_path",
        help="duplicate plural words (csv)",
        default="plural_duplicates_en.csv",
    )
    parser.add_argument(
        "-s",
        "--synonyms_path",
        help="synonyms mappings (json)",
        default="synonym_mappings_en.json",
    )

    args = parser.parse_args()

    clean_wordcount(**vars(args))


def clean_wordcount(
    input_path: str,
    output_dir: str = "./",
    stop_words_path: str = "stop_words_en.csv",
    plural_words_path: str = "plural_duplicates_en.csv",
    synonyms_path: str = "synonym_mappings_en.json",
    limit: int | None = None,
    delimiter: str = ",",
):
    """Clean wordcloud data
    Word count csv should follow the structure used by https://www.nuagesdemots.fr/
    2. Datasets are cleaned by
        1. separating words by `/` characters
        2. ignoring words using `stop_words_en.csv` or `stop_words_fr.csv`
        3. removing `-` characters
        4. removing duplicates according to the following files
            `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
        5. grouping words using `synonym_mappings_en.json` or
            `synonym_mappings_fr.json`
    3. The final cleaned dataset is a table with the top **50** word occurences
    """
    stop_words = []
    with open(stop_words_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            stop_words.append(row[0])
    # print(f"ignored words: {stop_words}")

    plural_words = []
    with open(plural_words_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            plural_words.append(row[0])
    # print(f"plural words: {plural_words}")

    synonyms = {}
    with open(synonyms_path, "r") as file:
        synonym_dump = json.load(file)
        for target_word, source_words in synonym_dump.items():
            for source_word in source_words:
                synonyms[source_word] = target_word
    # print(f"synonyms: {synonyms}")

    word_counts = {}
    with open(input_path, "r") as file:
        reader = csv.reader(file, delimiter=delimiter)
        next(reader)  # Skip the header row
        for row in reader:
            for word in row[1].split("/"):
                if word in stop_words:
                    continue
                word = word.rstrip("s") if word in plural_words else word
                word = word.replace("-", "")
                if word in synonyms:
                    word = synonyms.get(word)
                if word in word_counts:
                    word_counts[word] += int(row[0])
                else:
                    word_counts[word] = int(row[0])

    split_input_filename = os.path.splitext(os.path.split(input_path)[1])
    output_file = (
        f"{output_dir}{split_input_filename[0]}_cleaned{f'_{limit}' if limit else ''}"
        + split_input_filename[1]
    )

    writeWordCounts(word_counts, output_file, limit)


if __name__ == "__main__":
    main()
