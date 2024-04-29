import os
import json
import argparse
from datetime import timedelta
from utils import readFile, writeToFile
from ollama_test import sendPrompt
from pypdf_test import pdf2txt


def main():
    parser = argparse.ArgumentParser(
        description="""Launch a series of workflows (or data pipelines) based
            on a configuration"""
    )
    parser.add_argument("configuration", help="Specify the configuration file")
    parser.add_argument(
        "-o", "--output", default="test-data", help="Specify the output folder"
    )

    args = parser.parse_args()
    runWorkflows(args.configuration, args.output)


def runWorkflows(configuration: str, output: str) -> None:
    """Run a series of workflows based on a configuration file in JSON."""

    config = json.loads(readFile(configuration))
    for workflow in config:
        output_path = os.path.join(output, workflow["workflow_name"])
        if not os.path.exists(output_path):
            os.makedirs(output_path)
        runWorkflow(workflow["input"], output_path, workflow["prompts"])


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
    output_path = os.path.join(output, "input.txt")
    text = ""
    if os.path.exists(output_path):
        print(f"{output_path} exists, reading file")
        text = readFile(output_path)
    else:
        print(f"converting to text: {input}")
        input_path = os.path.normpath(input)
        text = pdf2txt(input_path)
        print(f"writing text to {output_path}")
        writeToFile(output_path, text)

    # step 2
    i = 0
    for prompt in prompts:
        print(f"sending prompt: {prompt['prompt']}[text]")
        response = sendPrompt(prompt["model"], prompt["prompt"] + text)
        # print response key/value pair as a deltatime if key has "duration"
        for key, value in [
            (key, value)
            for (key, value) in response.items()  # type: ignore
            if "duration" in key
        ]:
            elapsed_time = timedelta(microseconds=value // 1000)
            print(f"    {key}: {elapsed_time}{value % 1000}")

        # print(response)
        output_path = os.path.join(output, f"output_p{i}.json")
        print(f"writing response to {output_path}")
        writeToFile(output_path, json.dumps(response, indent=2))

        i += 1


if __name__ == "__main__":
    main()
