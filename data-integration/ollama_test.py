import os
import argparse
from utils import readFile, writeToFile
import ollama


def main():
    parser = argparse.ArgumentParser(
        description="""Prompt a local Ollama service to analyze a text file"""
    )
    parser.add_argument("input", help="Specify the input text file")
    parser.add_argument("output", help="Specify the output text file")
    parser.add_argument("prompt", help="Specify the prompt")
    parser.add_argument(
        "-s",
        "--separator",
        default=" : ",
        help="""Specify the
                        separator between the prompt and the text file""",
    )
    parser.add_argument(
        "-m",
        "--model",
        default="mistral",
        help="""Specify the
                        ollama model tag""",
    )

    args = parser.parse_args()

    input_path = os.path.normpath(args.input)
    output_path = os.path.normpath(args.output)

    print(f"reading {input_path}")
    text = readFile(input_path)
    print("sending prompt")
    prompt = args.prompt + args.separator + text
    response = sendPrompt(args.model, prompt)

    print(f"writing response to {output_path}")
    writeToFile(output_path, response["response"])  # type: ignore


def sendPrompt(model: str, prompt: str, format="json"):
    response = {}
    try:
        response = ollama.generate(model=model, prompt=prompt)
    except ollama.ResponseError as e:
        print("Error:", e.error)
        if e.status_code == 404:
            print(f"Attempting to pull {model}")
            ollama.pull(model)

            print("resending prompt")
            response = ollama.generate(
                model=model, prompt=prompt, format=format  # type: ignore
            )

    if response == {}:
        raise Exception(
            "No response (or an empty response) was received from Ollama service"
        )
    return response  # type: ignore


if __name__ == "__main__":
    main()
