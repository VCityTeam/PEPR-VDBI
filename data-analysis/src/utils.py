import csv
import os


def readFile(file_path: str, encoding="UTF-8") -> str:
    text = ""
    with open(file_path, "r", encoding=encoding) as file:
        text = file.read()
    return text


def writeToFile(output_path: str, text: str, encoding="UTF-8"):
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    with open(output_path, "w", encoding=encoding) as file:
        file.write(text)


def writeWordCounts(
    word_counts: dict, output_file: str = "./wordcount.csv", limit: int | None = None
):
    """
    Write a word_count to a csv file.
    :word_counts: a dictionary where each key corresponds to a word and each value the
        word count
    :output_file: output file path
    :limit: limit number of output rows
    :sort: sort output by count?
    """
    output = list(word_counts.items())
    output.sort(key=lambda x: x[1], reverse=True)

    print(f"writing to csv {output_file}")
    output_dir = os.path.split(output_file)[0]
    if not output_dir:
        os.makedirs(output_dir)
    with open(output_file, "w") as file:
        writer = csv.writer(file)
        writer.writerow(["weight", "word", "color", "url"])
        row_count = 0

        for row in output:
            if limit and row_count > limit:
                break
            writer.writerow([row[1], row[0], "", ""])
            row_count += 1
