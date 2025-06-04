import csv
import argparse
import os


def main():
    parser = argparse.ArgumentParser(
        description="""Compare 2 wordcloud datasets""",
    )
    parser.add_argument("input_path_1", help="wordcloud 1 input data file (csv)")
    parser.add_argument("input_path_2", help="wordcloud input data file (csv)")
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
        "--delimiter_1",
        help="set input csv delimiters",
        default=",",
    )
    parser.add_argument(
        "--delimiter_2",
        help="set input csv delimiters",
        default=",",
    )
    parser.add_argument(
        "--mode",
        "-m",
        help="what comparison mode to use",
        choices=["intersection", "complement", "union"],
        default="intersection",
    )

    args = parser.parse_args()

    compare_wordclouds(**vars(args))


def compare_wordclouds(
    input_path_1: str,
    input_path_2: str,
    output_dir: str | None = None,
    limit: int = -1,
    delimiter_1: str = ",",
    delimiter_2: str = ",",
    mode: str = "intersection",
):
    word_counts_1 = {}
    with open(input_path_1, "r") as file:
        reader = csv.reader(file, delimiter=delimiter_1)
        next(reader)  # Skip the header row
        for row in reader:
            if row[1] in word_counts_1:
                word_counts_1[row[1]] += int(row[0])
            else:
                word_counts_1[row[1]] = int(row[0])
    word_counts_1 = normalize_word_count(word_counts_1)

    word_counts_2 = {}
    with open(input_path_2, "r") as file:
        reader = csv.reader(file, delimiter=delimiter_2)
        next(reader)  # Skip the header row
        for row in reader:
            if row[1] in word_counts_2:
                word_counts_2[row[1]] += int(row[0])
            else:
                word_counts_2[row[1]] = int(row[0])
    word_counts_2 = normalize_word_count(word_counts_2)

    compared_word_counts = {}
    if mode == "intersection":
        compared_word_counts = generate_intersection(word_counts_1, word_counts_2)
    elif mode == "complement":
        compared_word_counts = generate_complement(word_counts_1, word_counts_2)
    elif mode == "union":
        compared_word_counts = generate_union(word_counts_1, word_counts_2)
    else:
        print("error: mode not recognized")

    sorted_word_counts = list(compared_word_counts.items())
    sorted_word_counts.sort(key=lambda x: x[1], reverse=True)

    split_input_filepath = os.path.split(input_path_1)
    split_input_filename = os.path.splitext(split_input_filepath[1])
    output_file = (output_dir if output_dir else split_input_filepath[0]) + (
        f"{split_input_filename[0]}_cleaned{f'_{limit}_' if limit > 0 else ''}"
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


def generate_intersection(input_1: dict, input_2: dict) -> dict:
    intersection = {}
    for word, count in input_1.items():
        if word in input_2:
            intersection[word] = average(input_2.get(word), count)
    return intersection


def generate_complement(input_1: dict, input_2: dict) -> dict:
    complement = {}
    for word, count in input_1.items():
        if word not in input_2:
            complement[word] = count

    for word, count in input_2.items():
        if word not in input_1:
            complement[word] = count
    return complement


def generate_union(input_1: dict, input_2: dict) -> dict:
    union = input_1.copy()
    for word, count in input_2.items():
        if word in union:
            union[word] = average(union.get(word), count)
        else:
            union[word] = count
    return union


def average(a, b):
    if a > b:
        return ((a - b) / 2) + b
    else:
        return ((b - a) / 2) + a


def normalize_word_count(
    word_counts: dict, range_min: int = 0, range_max: int = 100
) -> dict:
    """
    Normalize the weights of a word count to a given range.
    - word_count: list - input word counts
    - range_min: int - smallest value in the range of the distribution
    - range_max: int - largest value in the range of the distribution
    """
    normalized_word_counts = {}
    range_difference = range_max - range_min
    word_count_difference = max(word_counts.values()) - min(word_counts.values())

    for word, count in word_counts.items():
        normalized_count = (
            ((count - min(word_counts)) * range_difference) / word_count_difference
        ) + range_min
        normalized_word_counts[word] = normalized_count
    return normalized_word_counts


if __name__ == "__main__":
    main()
