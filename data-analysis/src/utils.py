import os
import csv


def read_file(file_path: str, encoding="UTF-8") -> str:
    text = ""
    with open(file_path, "r", encoding=encoding) as file:
        text = file.read()
    return text


def write_file(output_path: str, text: str, encoding="UTF-8"):
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(output_path, "w", encoding=encoding) as file:
        file.write(text)


def write_csv(output_path: str, data: list, encoding="UTF-8"):
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(output_path, "w", encoding=encoding) as file:
        csv_writer = csv.writer(file)
        for row in data:
            csv_writer.writerow(row)
