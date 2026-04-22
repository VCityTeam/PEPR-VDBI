import argparse
import csv
import sys
import os
from text_mining import lemmatize_text
from io_utils import initDefaultLogger


def main(input_path: str, lang: str):

    # read the input file
    with open(input_path, "r") as f:
        text = f.read()

    # lemmatize the text
    lemmatized_text = lemmatize_text(text, lang)

    # count the words
    word_counts = {}
    for word in lemmatized_text:
        word = word.lower()
        if word in word_counts:
            word_counts[word] += 1
        else:
            word_counts[word] = 1

    # remove stop words
    stop_words = []
    if lang == "en":
        with open(
            os.path.join(os.path.dirname(__file__), "stop_words_en.csv"), "r"
        ) as f:
            stop_words = f.read().splitlines()
    elif lang == "fr":
        with open(
            os.path.join(os.path.dirname(__file__), "stop_words_fr.csv"), "r"
        ) as f:
            stop_words = f.read().splitlines()

    for word in stop_words:
        if word in word_counts:
            del word_counts[word]

    # write the word counts to a csv file
    writer = csv.writer(sys.stdout)
    writer.writerow(["text", "value"])
    writer.writerows(word_counts.items())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate word count from a text file."
    )
    parser.add_argument("input_path", type=str, help="Path to the input text file.")
    parser.add_argument(
        "-l", "--lang", default="fr", type=str, help="Language of the text."
    )
    args = parser.parse_args()
    initDefaultLogger("word_count.csv.log")
    main(args.input_path, args.lang)
