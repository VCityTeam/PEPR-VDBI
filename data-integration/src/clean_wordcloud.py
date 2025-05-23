import csv
import json
import argparse
import os


def main():
    parser = argparse.ArgumentParser(
        description="Clean wordcloud data",
    )
    parser.add_argument("input", help="wordcloud input file (csv)")
    parser.add_argument(
        "-l",
        "--limit",
        help="limit number of words to output",
        default=50,
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
        default="ignored_words.csv",
    )
    parser.add_argument(
        "-p",
        "--plural_words",
        help="duplicate plural words (csv)",
        default="plural_duplicates.csv",
    )
    parser.add_argument(
        "-s",
        "--synonyms",
        help="synonyms mappings (json)",
        default="synonym_mappings.json",
    )

    args = parser.parse_args()

    ignored_words = []
    with open(args.ignored_words, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            ignored_words.append(row[0])
    # print(f"ignored words: {ignored_words}")

    plural_words = []
    with open(args.plural_words, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            plural_words.append(row[0])
    # print(f"plural words: {plural_words}")

    synonyms = {}
    with open(args.synonyms, "r") as file:
        synonym_dump = json.load(file)
        for target_word, source_words in synonym_dump.items():
            for source_word in source_words:
                synonyms[source_word] = target_word
    # print(f"synonyms: {synonyms}")

    word_counts = {}
    with open(args.input, "r") as file:
        reader = csv.reader(file, delimiter=args.delimiter)
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

    split_input_file = os.path.splitext(args.input)
    output_file = f"{split_input_file[0]}_cleaned{split_input_file[1]}"
    print(f"writing to csv {output_file}")
    with open(output_file, "w") as file:
        writer = csv.writer(file)
        row_count = 0
        writer.writerow(["weight", "word", "color", "url"])
        for word, count in word_counts.items():
            if row_count >= int(args.limit):
                break
            writer.writerow([count, word, "", ""])
            row_count += 1


if __name__ == "__main__":
    main()
