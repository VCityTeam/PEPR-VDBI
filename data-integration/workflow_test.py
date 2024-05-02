from os import path, makedirs
import json
import argparse
import logging
from datetime import timedelta
from utils import readFile, writeToFile
from ollama_test import sendPrompt
from pypdf_test import pdf2list

# TODO:
# - tester formattage des prompts pour:
#   - sortie structure pour data viz
#   - impact de structure des prompts
# - how to chain contexts?
# - ollama modelfile:
#   - model parameters
#   - templates


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
                "inputs": {
                    string : string
                },
                "prompts": [
                    {
                        "prompt": string,
                        "model": string         # optional,
                        "format": string        # optional,
                        "run": boolean          # optional
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
        level=logging.DEBUG,
        # level=logging.INFO,
    )
    print(f"Initialized, see {args.log} for execution information...")
    logging.info("=== initialized ===")

    runWorkflows(args.configuration)


def runWorkflows(configuration: str) -> None:
    """Run a series of workflows based on a configuration file in JSON.
    A configuration file must contain an object with the following keys:
    "output": a string containing the path to output workflow results.
    "inputs": an object; each key is a path to a pdf file to execute prompts
        upon; each value is a string containing the page ranges to use from the
        pdf.
    "prompts": an object containing the information required to run a workflow.
        See runWorkflow() for more information.
    """

    config = json.loads(readFile(configuration))
    output_path = path.normpath(config["output"])
    logging.info(f"output directory: {output_path}")
    if not path.exists(output_path):
        makedirs(output_path)

    for input, ranges in config["inputs"].items():
        logging.info(f"running workflow on {input} {ranges}")
        print(f"running workflow on {input} {ranges}")

        # step 1
        input_filename = path.basename(input)
        input_text_path = path.join(output_path, input_filename[:-3] + "json")
        if not input_text_path.endswith(".pdf"):
            logging.warning(f"is input {input} a PDF?")

        if not path.exists(input_text_path):
            logging.info(
                f"converting {input} to json. writing to {input_text_path}"
            )
            writeToFile(
                input_text_path, json.dumps(pdf2list(input), indent=2)
            )
        runWorkflow(input_text_path, ranges, output_path, config["prompts"])


def runWorkflow(
    input: str, page_ranges: str, output: str, prompts: list[dict]
) -> None:
    """Run a workflow on a set of input files. Each workflow will transform the
    input into a json file (unless the file already exists). Then a given list
    of prompts is executed using Ollama python. The output of all of these
    steps is written to an output directory.
    Parameters:
        input: a path to a JSON file containing an array of strings where each
            string corresponds to a page of text.
        page_ranges: a string containing the relevant page ranges from the text.
        output: the output directory path.
        prompts: a list of dictionaries with the following key/value pairs:
            "prompt": a string containing the prompt to execute over the text.
            "model": a string containing the Ollama model tag to use.
            "format": an optional string containing the Ollama response format.
            "run": an optional boolean specifying if the prompt should be
                skipped.
    """

    # step 2
    text = compilePages(input, page_ranges)
    i = 0
    for prompt in prompts:
        if not prompt.get("run", True):
            logging.info(f"\nskipping prompt {i}: {prompt['prompt']}[text]")
            print(f"skipping prompt {i}: {prompt['prompt']}[text]")
            continue

        logging.info(f"\nsending prompt {i}: {prompt['prompt']}[text]")
        print(f"sending prompt {i}: {prompt['prompt']}[text]")

        response = sendPrompt(
            prompt["model"], prompt["prompt"] + text, prompt.get("format", "")
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

        output_path = path.join(output, f"p{i}_response.json")
        logging.info(f"writing response body to {output_path}")
        writeToFile(output_path, json.dumps(response, indent=2))

        message = ""
        if prompt.get("format") == "json":
            output_path = path.join(output, f"p{i}_message.json")
            message = json.dumps(
                json.loads(response["response"]), indent=2  # type: ignore
            )
        else:
            output_path = path.join(output, f"p{i}_message.md")
            message = response["response"]  # type: ignore
        logging.info(f"writing response message to {output_path}")
        writeToFile(output_path, message)  # type: ignore
        print("done!")

        i += 1


def parsePageRanges(ranges: str) -> list[int]:
    page_numbers = []
    for _range in ranges.replace(" ", "").split(","):
        if "-" in _range:
            split_range = _range.split("-")
            page_numbers += [
                page
                for page in range(int(split_range[0]) - 1, int(split_range[-1]))
            ]
        else:
            page_numbers.append(int(_range) - 1)
    page_numbers.sort()
    return page_numbers


def compilePages(input: str, page_ranges: str) -> str:
    pages = json.loads(readFile(input))
    if page_ranges == "":
        return "".join(pages)
    text = ""
    for page_number in parsePageRanges(page_ranges):
        text += pages[page_number]
    return text


if __name__ == "__main__":
    main()
