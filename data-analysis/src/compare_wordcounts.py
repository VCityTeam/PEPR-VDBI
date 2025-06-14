import csv
import argparse
import os
from utils import writeWordCounts


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
        help="Wordcloud output directory",
        default="./",
    )
    parser.add_argument(
        "-m",
        "--mode",
        help="What comparison mode to use",
        choices=["intersection", "complement", "union"],
        default="intersection",
    )
    parser.add_argument(
        "-s",
        "--strategy",
        help="What strategy to determing intersect word count (weight). "
        "Doesn't affect complement mode",
        choices=["average", "min", "max", "sum", "difference"],
        default="sum",
    )
    parser.add_argument(
        "-l",
        "--limit",
        type=int,
        help="Limit number of words to output. Negative value means no limit",
    )
    parser.add_argument(
        "--delimiter_1",
        help="Set input csv delimiters",
        default=",",
    )
    parser.add_argument(
        "--delimiter_2",
        help="Set input csv delimiters",
        default=",",
    )

    args = parser.parse_args()

    compare_wordcounts(**vars(args))


def compare_wordcounts(
    input_path_1: str,
    input_path_2: str,
    output_dir: str = "./",
    mode: str = "intersection",
    strategy: str = "sum",
    limit: int | None = None,
    delimiter_1: str = ",",
    delimiter_2: str = ",",
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
    word_counts_1 = normalize_word_counts(word_counts_1)

    # uncomment for debugging normalization
    # writeWordCounts(word_counts_1, "word_counts_1.csv")

    word_counts_2 = {}
    with open(input_path_2, "r") as file:
        reader = csv.reader(file, delimiter=delimiter_2)
        next(reader)  # Skip the header row
        for row in reader:
            if row[1] in word_counts_2:
                word_counts_2[row[1]] += int(row[0])
            else:
                word_counts_2[row[1]] = int(row[0])
    word_counts_2 = normalize_word_counts(word_counts_2)

    # uncomment for debugging normalization
    # writeWordCounts(word_counts_2, "word_counts_2.csv")

    compared_word_counts = {}
    if mode == "intersection":
        compared_word_counts = generate_intersection(
            word_counts_1, word_counts_2, strategy
        )
    elif mode == "complement":
        compared_word_counts = generate_complement(word_counts_1, word_counts_2)
    elif mode == "union":
        compared_word_counts = generate_union(word_counts_1, word_counts_2, strategy)
    else:
        print("error: mode not recognized")

    split_input_filename_1 = os.path.splitext(os.path.split(input_path_1)[1])
    split_input_filename_2 = os.path.splitext(os.path.split(input_path_2)[1])
    output_file = (
        f"{output_dir}{split_input_filename_1[0]}_{mode}_{strategy}_"
        f"{split_input_filename_2[0]}{split_input_filename_1[1]}"
    )

    writeWordCounts(compared_word_counts, output_file, limit)


def generate_intersection(input_1: dict, input_2: dict, strategy: str = "min") -> dict:
    """
    Takes two word counts returns a new word count containing the intersection of keys
    with their average weights.

    :param input_1: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :param input_2: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :return: a dictionary containing the intersection of `input_1` and `input_2`.
    """
    intersection = {}
    for word, count in input_1.items():
        if word in input_2:
            intersection[word] = get_intersect_count(
                input_2.get(word, 0), count, strategy
            )
    return intersection


def generate_complement(input_1: dict, input_2: dict) -> dict:
    """
    Takes two word counts returns a new word count containing the complement of their keys

    :param input_1: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :param input_2: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :return: a dictionary containing the complement of `input_1` and `input_2`.
    """
    complement = {}
    for word, count in input_1.items():
        if word not in input_2:
            complement[word] = count

    for word, count in input_2.items():
        if word not in input_1:
            complement[word] = count
    return complement


def generate_union(input_1: dict, input_2: dict, strategy: str = "min") -> dict:
    """
    Takes two word counts returns a new word count containing the union of keys.
    The count of words in both inputs are averaged.

    :param input_1: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :param input_2: a dictionary containing words as keys and their corresponding
    counts (or weights) as values
    :return: a dictionary containing the union of `input_1` and `input_2`.
    """
    union = input_1.copy()
    for word, count in input_2.items():
        if word in union:
            union[word] = get_intersect_count(union.get(word, 0), count, strategy)
        else:
            union[word] = count
    return union


def get_intersect_count(
    count_1: int, count_2: int, strategy: str = "min"
) -> int | None:
    """
    Calculate intersecting count values.
    """
    max_count = max(count_1, count_2)
    min_count = min(count_1, count_2)
    if strategy == "average":
        return round(((max_count - min_count) / 2) + min_count)
    elif strategy == "min":
        return min_count
    elif strategy == "max":
        return max_count
    elif strategy == "sum":
        return count_1 + count_2
    elif strategy == "difference":
        return max_count - min_count
    else:
        print(f"error: unknown intersect strategy: {strategy}")
        return None


def normalize_word_counts(
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
    count_max = max(word_counts.values())
    count_min = min(word_counts.values())
    word_count_difference = count_max - count_min

    for word, count in word_counts.items():
        normalized_count = (
            ((count - count_min) * range_difference) / word_count_difference
        ) + range_min
        normalized_word_counts[word] = round(normalized_count)

    return normalized_word_counts


if __name__ == "__main__":
    main()
