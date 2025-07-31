import csv
from enum import StrEnum, auto
from utils import read_file, write_csv
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from nltk import download, word_tokenize, pos_tag


def get_wordnet_pos(tag):
    if tag.startswith("J"):
        return wordnet.ADJ
    elif tag.startswith("V"):
        return wordnet.VERB
    elif tag.startswith("N"):
        return wordnet.NOUN
    elif tag.startswith("R"):
        return wordnet.ADV
    else:
        return wordnet.NOUN


def lemmatize_words(words: list[str], language: str = "eng") -> list[str]:
    """Lemmatize a list of words"""
    pos_tags = []
    try:
        pos_tags = pos_tag(words, lang=language)
    except LookupError:
        download("averaged_perceptron_tagger_eng")
        pos_tags = pos_tag(words, lang=language)
    # print(f"pos_tags: {pos_tags}")
    lemmatizer = WordNetLemmatizer()

    try:
        return [
            lemmatizer.lemmatize(word, get_wordnet_pos(tag)) for word, tag in pos_tags
        ]
    except LookupError:
        download("wordnet")
        return [
            lemmatizer.lemmatize(word, get_wordnet_pos(tag)) for word, tag in pos_tags
        ]


def tokenize_text(
    input_path: str,
) -> list[str]:
    """Parse and tokenize a text file"""
    text = read_file(input_path)
    tokens = []
    try:
        tokens = word_tokenize(text)
    except LookupError:
        download("punkt_tab")
        tokens = word_tokenize(text)
    return [token for token in tokens]


def clean_wordcount(
    input_path: str,
    stop_words_path: str = "stop_words_en.csv",
    language: str = "eng",
    limit: int | None = None,
    delimiter: str = ",",
) -> list[tuple[str, int]]:
    """Clean wordcloud data
    Word count csv should have a header and contain two columns:
        1. word count (int)
        2. word (str)
    2. Datasets are cleaned by
        1. removing all non-alphabetic characters
        2. ignoring defined stop words
        3. stemming words
    3. The final cleaned dataset is a table with the top **50** word occurences
    :param input_path: path to the word count csv file (see text_to_wordcount())
    :param stop_words_path: path to the stop words csv file
    :param plural_words_path: path to the plural words csv file
    :param synonyms_path: path to the synonyms json file
    :param language: language for stemming
    :param limit: limit number of output rows
    :param delimiter: csv delimiter
    """
    stop_words = []
    with open(stop_words_path, "r") as file:
        reader = csv.reader(file)
        for row in reader:
            stop_words.append(row[0])
    # print(f"ignored words: {stop_words}")

    # Stem/lemmatize words
    word_counts = {}
    lemmatized_words = []
    with open(input_path, "r") as file:
        reader = csv.reader(file, delimiter=delimiter)
        lemmatized_words = lemmatize_words([row[0] for row in reader], language)

    # print(f"lemmatized words: {lemmatized_words}")
    # remove stop words, digits, and non-alphanumeric characters
    for word in lemmatized_words:
        word = word.lower()
        if word in stop_words or word.isdigit() or not word.isalnum():
            continue
        if word in word_counts:
            word_counts[word] += 1
        else:
            word_counts[word] = 1

    return format_word_count(word_counts, limit)


def compare_wordcounts(
    input_path_1: str,
    input_path_2: str,
    mode: str = "INTERSECTION",
    strategy: str = "SUM",
    limit: int | None = None,
    delimiter_1: str = ",",
    delimiter_2: str = ",",
) -> list[tuple[str, int]]:

    if strategy not in [member.name for member in CompareStrategy]:
        raise ValueError("Unknown strategy: ", strategy)
    strategy = CompareStrategy[strategy]

    if mode not in [member.name for member in CompareMode]:
        raise ValueError("Unknown mode: ", mode)
    mode = CompareMode[mode]

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
    # write_word_count(word_counts_1, "word_counts_1.csv")

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
    # write_word_count(word_counts_2, "word_counts_2.csv")

    compared_word_counts = {}
    if mode == CompareMode.INTERSECTION:
        compared_word_counts = generate_intersection(
            word_counts_1, word_counts_2, strategy
        )
    elif mode == CompareMode.COMPLEMENT:
        compared_word_counts = generate_complement(word_counts_1, word_counts_2)
    elif mode == CompareMode.UNION:
        compared_word_counts = generate_union(word_counts_1, word_counts_2, strategy)
    else:
        print("error: mode not recognized")

    return format_word_count(compared_word_counts, limit)
    # split_input_filename_1 = os.path.splitext(os.path.split(input_path_1)[1])
    # split_input_filename_2 = os.path.splitext(os.path.split(input_path_2)[1])
    # output_file = (
    #     f"{output_dir}{split_input_filename_1[0]}_{mode}_{strategy}_"
    #     f"{split_input_filename_2[0]}{split_input_filename_1[1]}"
    # )

    # write_word_count(compared_word_counts, output_file, limit)


def generate_intersection(input_1: dict, input_2: dict, strategy: str = "SUM") -> dict:
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


def generate_union(input_1: dict, input_2: dict, strategy: str = "SUM") -> dict:
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
    count_1: int, count_2: int, strategy: str = "SUM"
) -> int | None:
    """
    Calculate intersecting count values.
    """
    max_count = max(count_1, count_2)
    min_count = min(count_1, count_2)
    if strategy == CompareStrategy.AVERAGE:
        return round(((max_count - min_count) / 2) + min_count)
    elif strategy == CompareStrategy.MIN:
        return min_count
    elif strategy == CompareStrategy.MAX:
        return max_count
    elif strategy == CompareStrategy.SUM:
        return count_1 + count_2
    elif strategy == CompareStrategy.DIFFERENCE:
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


def write_word_count(
    word_counts: list,
    output_file: str = "./wordcount.csv",
    limit: int | None = None,
):
    """
    Write a word_count to a csv file.
    :word_counts: a list of words and corresponding word counts
    :output_file: output file path
    :limit: limit number of output rows
    """
    output = [["weight", "word", "color", "url"]]
    output.extend([[weight, word, "", ""] for word, weight in word_counts])

    print(f"writing to csv {output_file}")
    write_csv(output_file, output[:limit])


def format_word_count(
    word_counts: dict,
    limit: int | None = None,
) -> list[tuple[str, int]]:
    """
    Format a word count dictionary to a 2D list.
    :word_counts: a list of words and corresponding word counts
    :limit: limit number of output rows
    """
    output = [(word, count) for word, count in word_counts.items()]
    output.sort(key=lambda x: x[1], reverse=True)
    return output[:limit]


# ENUMS #


class CompareMode(StrEnum):
    """Enum for word count modes"""

    INTERSECTION = auto()
    COMPLEMENT = auto()
    UNION = auto()


class CompareStrategy(StrEnum):
    """Enum for word count strategies"""

    AVERAGE = auto()
    MIN = auto()
    MAX = auto()
    SUM = auto()
    DIFFERENCE = auto()
