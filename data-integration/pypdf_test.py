import os
import argparse
import json
from pypdf import PdfReader
from utils import writeToFile


def main():
    parser = argparse.ArgumentParser(description="Extract text from a pdf file")
    parser.add_argument("input", help="Specify the input PDF")
    parser.add_argument("output", help="Specify the output text file")
    parser.add_argument(
        "-f", "--format", default="json", help="Specify the output text file"
    )

    args = parser.parse_args()

    input_path = os.path.normpath(args.input)
    output_path = os.path.normpath(args.output)

    print(f"reading pdf {input_path}")
    text = ""
    if args.format == "txt":
        print(f"writing output to {output_path}")
        writeToFile(output_path, pdf2txt(input_path))
    elif args.format == "json":
        text = pdf2list(input_path)
        print(f"writing output to {output_path}")
        writeToFile(output_path, json.dumps(text, indent=2))
    else:
        raise Exception(f"Unknown format: {args.format}")


def pdf2txt(input_path: str) -> str:
    reader = PdfReader(input_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def pdf2list(input_path: str) -> list[str]:
    reader = PdfReader(input_path)
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text())
    return pages  # type: ignore


if __name__ == "__main__":
    main()
