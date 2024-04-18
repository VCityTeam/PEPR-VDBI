import os
import argparse
from pypdf_test import writeToFile
import ollama


def main():
    parser = argparse.ArgumentParser(
        description="""Prompt a local Ollama service to analyze a text file""")
    parser.add_argument("input", help="Specify the input text file")
    parser.add_argument("output", help="Specify the output text file")
    parser.add_argument("prompt", help="Specify the prompt")
    parser.add_argument("-s", "--separator", default=" : ", help="""Specify the
                        separator between the prompt and the text file""")
    parser.add_argument("-m", "--model", default="mistral:text", help="""
                        Specify the ollama model tag""")

    args = parser.parse_args()

    input_path = os.path.normpath(args.input)
    output_path = os.path.normpath(args.output)

    print(f"reading {input_path}")
    text = readFile(input_path)
    print("sending prompt")
    try:
        response = ollama.generate(model=args.model,
                                   prompt=args.prompt +
                                   args.separator +
                                   text)
    except ollama.ResponseError as e:
        print('Error:', e.error)
        if e.status_code == 404:
            print(f'Attempting to pull {args.model}')
            ollama.pull(args.model)
    print(f"writing response to {output_path}")
    writeToFile(output_path, response)


def readFile(file_path: str, encoding="UTF-8") -> str:
    text = ""
    with open(file_path, 'r', encoding=encoding) as file:
        text = file.read()
    return text


if __name__ == "__main__":
    main()
