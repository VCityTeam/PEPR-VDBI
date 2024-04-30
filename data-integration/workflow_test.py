import os
import json
import argparse
import logging
from datetime import timedelta
from utils import readFile, writeToFile
from ollama_test import sendPrompt
from pypdf_test import pdf2txt

# TODO:
# - tester formattage des prompts pour:
#   - sortie structure pour data viz
#   - impact de structure des prompts


def main():
    parser = argparse.ArgumentParser(
        description="""Launch a series of workflows (or data pipelines) based
            on a configuration"""
    )
    parser.add_argument(
        "configuration",
        help="""Specify the configuration JSON file. File must be structured as
        follows:
            {
                "output": string,
                "inputs": [
                    string
                ],
                "prompts": [
                    {
                        "prompt": string,
                        "model": string,
                        "format": string
                    }
                ]
            }""",
    )
    parser.add_argument(
        "-l",
        "--log",
        default="workflow-test.log",
        help="Specify the logging file",
    )

    args = parser.parse_args()

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename=args.log,
        # level=logging.DEBUG,
        level=logging.INFO,
    )
    print(f"Initialized, see {args.log} for execution information...")
    logging.info("=== initialized ===")

    runWorkflows(args.configuration)


def runWorkflows(configuration: str) -> None:
    """Run a series of workflows based on a configuration file in JSON."""

    config = json.loads(readFile(configuration))
    output_path = os.path.normpath(config["output"])
    logging.info(f"output: {output_path}")
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    for input in config["inputs"]:
        logging.info(f"running workflow on {input}")
        print(f"running workflow on {input}")
        runWorkflow(input, output_path, config["prompts"])


def runWorkflow(input: str, output: str, prompts: list) -> None:
    """Run a workflow on a set of input files. Each workflow will transform the
    input into a txt (unless the text file already exists). Then a given list
    of prompts is executed using Ollama python. The output of all of these
    steps is written to an output folder"""

    # step 1
    input_basepath = os.path.basename(input)
    if not input_basepath.endswith(".pdf"):
        logging.warning(f"is input {input} a PDF?")
    output_path = os.path.join(output, input_basepath[:-3] + "txt")

    text = ""
    if os.path.exists(output_path):
        logging.info(f"{output_path} exists, reading file")
        text = readFile(output_path)
    else:
        logging.info(f"converting to text: {input}")
        input_path = os.path.normpath(input)
        text = pdf2txt(input_path)
        logging.info(f"writing text to {output_path}")
        writeToFile(output_path, text)

    # step 2
    i = 0
    for prompt in prompts:
        logging.info(f"\nsending prompt: {prompt['prompt']}[text]")
        print(f"sending prompt: {prompt['prompt']}[text]")

        response = sendPrompt(
            prompt["model"], prompt["prompt"] + text, prompt["format"]
        )
        logging.debug(f"response: {response}")
        if not response["done"]:  # type: ignore
            logging.warning('response returned "done"=false')

        # print response key/value pair as a deltatime if key has "duration"
        for key, value in [
            (key, value)
            for (key, value) in response.items()  # type: ignore
            if "duration" in key
        ]:
            elapsed_time = timedelta(microseconds=value // 1000)
            logging.info(f"{key}: {elapsed_time}{value % 1000}")

        output_path = os.path.join(output, f"p{i}_response.json")
        logging.info(f"writing response body to {output_path}")
        writeToFile(output_path, json.dumps(response, indent=2))

        message = ""
        if prompt["format"] == "json":
            output_path = os.path.join(output, f"p{i}_message.json")
            message = json.dumps(
                json.loads(response["response"]), indent=2  # type: ignore
            )
        else:
            output_path = os.path.join(output, f"p{i}_message.md")
            message = response["response"]  # type: ignore
        logging.info(f"writing response message to {output_path}")
        writeToFile(output_path, message)  # type: ignore
        print("done!")
        
        i += 1


if __name__ == "__main__":
    main()
