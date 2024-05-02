from os import path, makedirs
import csv
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
        help="""Specify the configuration file. File must be structured as
        follows for JSON:
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
            }
        Or as follows for CSV:
        input,page_ranges,output,prompt,model""",
    )
    parser.add_argument(
        "-f",
        "--format",
        choices=["csv", "json"],
        default="csv",
        help="Specify the configuration format",
    )
    parser.add_argument(
        "-d",
        "--delimeter",
        choices=[",", ";", "\t"],
        default=",",
        help="Specify the csv delimeter (only used for 'csv' format)",
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

    runWorkflows(args.configuration, args.format, args.delimeter)


def runWorkflows(configuration: str, format: str, delimeter=",") -> None:
    """Run a series of workflows based on a configuration file in JSON.
    A configuration file must contain an object with the following keys:
    "output": a string containing the path to output workflow results.
    "inputs": an object; each key is a path to a pdf file to execute prompts
        upon; each value is a string containing the page ranges to use from the
        pdf.
    "prompts": an object containing the information required to run a workflow.
        See runWorkflow() for more information.
    """
    if format == "csv":
        with open(configuration) as file:
            config = csv.reader(file, delimiter=delimeter)
            for row in config:
                if config.line_num > 1:  # skip header
                    logging.info(
                        f"running workflow on line {config.line_num} "
                        + f"{str(row[0])} {str(row[1])}"
                    )
                    print(f"running workflow on {str(row[0])} {str(row[1])}")
                    print(row)
                    runWorkflow(
                        str(row[0]),
                        str(row[1]),
                        str(row[2]),
                        str(row[3]),
                        str(row[4]),
                        str(row[5]),
                    )
    elif format == "json":
        config = json.loads(readFile(configuration))
        for input, ranges in config["inputs"].items():
            logging.info(f"running workflow on {input} {ranges}")
            print(f"running workflow on {input} {ranges}")
            for prompt in config["prompts"]:
                if prompt.get("run"):
                    runWorkflow(
                        input,
                        ranges,
                        config["output"],
                        prompt["prompt"],
                        prompt["model"],
                        prompt.get("format"),
                    )


def runWorkflow(
    input: str,
    page_ranges: str,
    output: str,
    prompt: str,
    model: str,
    format: str,
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
        prompt: a string containing the prompt to execute over the text.
        model: the ollama model tag to use for the prompt
    """
    # step 0
    output_path = path.normpath(output)
    logging.info(f"output directory: {output_path}")
    if not path.exists(output_path):
        makedirs(output_path)

    # step 1
    input_filename = path.basename(input)
    input_text_path = path.join(output_path, input_filename[:-3] + "json")
    if not input_text_path.endswith(".pdf"):
        logging.warning(f"is input {input} a PDF?")

    if not path.exists(input_text_path):
        logging.info(
            f"converting {input} to json. writing to {input_text_path}"
        )
        writeToFile(input_text_path, json.dumps(pdf2list(input), indent=2))

    # step 2
    text = compilePages(input_text_path, page_ranges)

    logging.info(f"\nsending prompt: {prompt}[text]")
    print(f"sending prompt: {prompt}[text]")

    response = sendPrompt(model, prompt + text, format)
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

    output_path = path.join(output, "response.json")
    logging.info(f"writing response body to {output_path}")
    writeToFile(output_path, json.dumps(response, indent=2))

    message = ""
    if format == "json":
        output_path = path.join(output, "message.json")
        message = json.dumps(
            json.loads(response["response"]), indent=2  # type: ignore
        )
    else:
        output_path = path.join(output, "message.md")
        message = response["response"]  # type: ignore
    logging.info(f"writing response message to {output_path}")
    writeToFile(output_path, message)  # type: ignore
    print("done!")


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
