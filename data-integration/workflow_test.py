import os
import json
import argparse
from time import process_time
from utils import readFile, writeToFile
from ollama_test import sendPrompt
from pypdf_test import pdf2txt


def main():
    parser = argparse.ArgumentParser(
        description="""TODO define me""")
    parser.add_argument("configuration", help="Specify the configuration file")
    parser.add_argument("output", help="Specify the output text file")

    args = parser.parse_args()
    runWorkflows(args.configuration, args.output)


def runWorkflows(configuration: str, output) -> None:
    """Run a series of workflows based on a configuration file in JSON."""

    config = json.load(readFile(configuration))

    for workflow in config:
        output_path = os.path.join(output, workflow.output)
        runWorkflow(workflow.input, output_path, workflow.prompts)


def runWorkflow(input: str, output: str, prompts: list) -> None:
    """Run a workflow on a set of input files. Each workflow will execute the
    following:
    - step 1: Read a project proposal (PDF), transform its contents to text
    - step 2: excecute a chain of GPT prompts to extract the following info:
      - step 2.1 keywords
      - step 2.2 short abstract
      - step 2.3 partners
      - step 2.4 exterior something
      - step 2.5 laboratories
      - step 2.6 disciplines
    The output of all of these steps is written to an output folder"""

    # step 1
    print(f"converting to text: {input}")
    input_path = os.path.normpath(input)
    text = pdf2txt(input_path)

    output_path = os.path.join(output, "output_1.txt")
    print(f"writing text to {output_path}")
    writeToFile(output_path, text)

    # step 2
    i = 0
    for prompt in prompts:
        timer = process_time()
        print(f"sending prompt: {input}")
        response = sendPrompt(prompt.model, prompt.prompt + text)
        print("elapsed time:", process_time() - timer)

        output_path = os.path.join(output, f"output_2_{i}.txt")
        print(f"writing response to {output_path}")
        writeToFile(output_path, response)

        i += 1


if __name__ == "__main__":
    main()
