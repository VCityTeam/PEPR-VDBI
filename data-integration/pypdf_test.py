import os
import argparse
from pypdf import PdfReader


def main():
    parser = argparse.ArgumentParser(
        description="""Extract text from a pdf file""")
    parser.add_argument("input", help="Specify the input PDF")
    parser.add_argument("output", help="Specify the output text file")

    args = parser.parse_args()

    input_path = os.path.normpath(args.input)
    output_path = os.path.normpath(args.output)

    print(f"reading pdf {input_path}")
    text = pdf2txt(input_path)
    print(f"writing output to {output_path}")
    writeToFile(text)


def pdf2txt(input_path: str) -> str:
    reader = PdfReader(input_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def writeToFile(output_path: str, text: str) -> None:
    with open(output_path, 'w', encoding="UTF-8") as file:
        file.write(text)


if __name__ == "__main__":
    main()
