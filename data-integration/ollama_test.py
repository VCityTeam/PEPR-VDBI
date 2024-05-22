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
        help="""Specify the separator between the prompt and the text file""",
    )
    parser.add_argument(
        "-f",
        "--format",
        default="",
        help="""Specify the ollama response format.""",
    )
    parser.add_argument(
        "-m",
        "--model",
        default="mistral",
        help="""Specify the ollama model tag. If a modelfile is given, this
            parameter is used as the model name.""",
    )
    parser.add_argument(
        "--modelfile",
        default=None,
        help="""Specify the ollama modelfile filepath.""",
    )

    args = parser.parse_args()

    input_path = os.path.normpath(args.input)
    output_path = os.path.normpath(args.output)

    print(f"reading {input_path}")
    text = readFile(input_path)
    print("sending prompt")
    prompt = args.prompt + args.separator + text
    response = sendPrompt(
        model=args.model,
        prompt=prompt,
        modelfile_path=args.modelfile,
        format=args.format,
    )

    print(f"writing response to {output_path}")
    writeToFile(output_path, response["response"])  # type: ignore


def sendPrompt(model: str, prompt: str, modelfile_path=None, format=""):
    response = {}
    try:
        response = ollama.generate(
            model=model, prompt=prompt, format=format  # type: ignore
        )
    except ollama.ResponseError as e:
        print("Error:", e.error)
        if e.status_code == 404:
            if modelfile_path is None:
                print(f"pulling {model}")
                ollama.pull(model)

                print("resending prompt")
                response = ollama.generate(
                    model=model, prompt=prompt, format=format  # type: ignore
                )
            else:
                print(f"creating {model} based on {modelfile_path}")
                modelfile = readFile(modelfile_path)
                for server_response in ollama.create(
                    model=model, modelfile=modelfile
                ):
                    print(server_response)
                    # if type(server_response) is str:
                    #     print(server_response)
                    # else:
                    #     print(server_response["status"])  # type: ignore

                print("resending prompt")
                response = ollama.generate(
                    model=model, prompt=prompt, format=format  # type: ignore
                )
    if response == {}:
        raise Exception(
            """No response (or an empty response) was received from Ollama
            service"""
        )
    return response


if __name__ == "__main__":
    main()
