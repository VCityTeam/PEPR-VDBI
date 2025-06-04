import csv
import json
import argparse
import os


def main():
    parser = argparse.ArgumentParser(
        description="""Clean wordcloud data
            1. Texts are uploaded to https://www.nuagesdemots.fr/ to create an initial
                wordcount dataset
            2. Datasets are cleaned with the python script `clean_wordcloud.py` by
                1. removing `-` characters
                2. separating words by `/` characters
                3. ignoring words using `ignored_words_en.csv` or `ignored_words_fr.csv`
                4. removing duplicates according to the following files
                    `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
                5. grouping words using `synonym_mappings_en.json` or
                    `synonym_mappings_fr.json`
            3. The final cleaned dataset is a table with the top **50** word occurences
            """,
    )
    parser.add_argument("input", help="wordcloud input data file (csv)")
    parser.add_argument(
        "-o",
        "--output_dir",
        type=str,
        help="wordcloud output directory",
        default=None,
    )
    parser.add_argument(
        "-l",
        "--limit",
        type=int,
        help="limit number of words to output. Negative value means no limit",
        default=-1,
    )
    parser.add_argument(
        "-d",
        "--delimiter",
        help="set input csv delimiter",
        default=",",
    )
    parser.add_argument(
        "-i",
        "--ignored_words",
        help="words to ignore (csv)",
        default="ignored_words_en.csv",
    )
    parser.add_argument(
        "-p",
        "--plural_words",
        help="duplicate plural words (csv)",
        default="plural_duplicates_en.csv",
    )
    parser.add_argument(
        "-s",
        "--synonyms",
        help="synonyms mappings (json)",
        default="synonym_mappings_en.json",
    )

    args = parser.parse_args()

    clean_wordcloud(
        args.input,
        args.output,
        args.ignored_words,
        args.plural_words,
        args.synonyms,
        args.delimiter,
        args.limit,
    )


def clean_wordcloud(
    input_path: str,
    output_dir: str | None = None,
    ignored_words_path: str = "ignored_words_en.csv",
    plural_words_path: str = "plural_duplicates_en.csv",
    synonyms_path: str = "synonym_mappings_en.json",
    delimiter: str = ",",
    limit: int = -1,
):
    """Clean wordcloud data
    1. Texts are uploaded to https://www.nuagesdemots.fr/ to create an initial
        wordcount dataset
    2. Datasets are cleaned with the python script `clean_wordcloud.py` by
        1. removing `-` characters
        2. separating words by `/` characters
        3. ignoring words using `ignored_words_en.csv` or `ignored_words_fr.csv`
        4. removing duplicates according to the following files
            `plural_duplicates_en.csv` or `plural_duplicates_fr.csv`
        5. grouping words using `synonym_mappings_en.json` or
            `synonym_mappings_fr.json`
    3. The final cleaned dataset is a table with the top **50** word occurences
    """
    ignored_words = []
    with open(ignored_words_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            ignored_words.append(row[0])
    # print(f"ignored words: {ignored_words}")

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
            # print(row)
            if row[1] in ignored_words:
                continue
            word = row[1].rstrip("s") if row[1] in plural_words else row[1]
            word = word.replace("-", "")
            if word in synonyms:
                word = synonyms.get(word)
            if word in word_counts:
                word_counts[word] += int(row[0])
            else:
                word_counts[word] = int(row[0])

    sorted_word_counts = list(word_counts.items())
    sorted_word_counts.sort(key=lambda x: x[1], reverse=True)

    split_input_filepath = os.path.split(input_path)
    split_input_filename = os.path.splitext(split_input_filepath[1])
    output_file = (output_dir if output_dir else split_input_filepath[0]) + (
        f"{split_input_filename[0]}_cleaned{f'_{limit}' if limit > 0 else ''}"
        + split_input_filename[1]
    )

    print(f"writing to csv {output_file}")
    with open(output_file, "w") as file:
        writer = csv.writer(file)
        row_count = 0
        writer.writerow(["weight", "word", "color", "url"])

        for row in sorted_word_counts:
            if row_count >= int(limit):
                break
            writer.writerow([row[1], row[0], "", ""])
            row_count += 1


if __name__ == "__main__":
    main()
