from os import path, makedirs
import csv
import json
import argparse
import logging
from datetime import timedelta
from utils import readFile, writeToFile
from ollama_test import sendPrompt as sendOllamaPrompt
from pypdf_test import pdf2list
from r2r import R2RClient


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
        Or with the following header for CSV:
        input,page_ranges,output,prompt,model,format""",
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
        "--debug",
        action="store_true",
        help="Use debug mode for logging",
    )
    parser.add_argument(
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
    parser.add_argument(
        "-m",
        "--mode",
        choices=["ollama", "r2r"],
        default="ollama",
        help="Specify the workflow mode",
    )

    args = parser.parse_args()

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename=args.log,
        level=logging.DEBUG if args.debug else logging.INFO,
    )
    print(f"Initialized, see {args.log} for logs...")
    logging.info(
        r"""
 ______     ______    ______     ______     ______
/\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
\ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
 \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
  \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/"""
    )

    runWorkflows(args.configuration, args.format, args.delimeter, args.mode)


def runWorkflows(configuration: str, format: str, delimeter=",", mode="ollama") -> None:
    """Run a series of workflows based on a configuration file in JSON.
    A configuration file must contain an object with the following keys:
    - "output": a string containing the path to output workflow results.
    - "inputs": an object; each key is a path to a pdf file to execute prompts
        upon; each value is a string containing the page ranges to use from the
        pdf.
    - "prompts": an array containing the information required to run each workflow.
        See runOllamaWorkflow() for more information.
    """
    if format == "csv":
        config = []
        with open(configuration) as file:
            csv_file = csv.reader(file, delimiter=delimeter)
            for row in csv_file:
                config.append(row)
        for row in config[1:]:
            logging.info(
                f"running workflow on line {config.index(row)}"
                + f"{str(row[0])} {str(row[1])}"
            )
            print(f"running workflow on {str(row[0])} {str(row[1])}")
            if mode == "ollama":
                runOllamaWorkflow(
                    str(row[0]),
                    str(row[1]),
                    path.join(str(row[2]), f"p{config.index(row)}.json"),
                    str(row[3]),
                    str(row[4]),
                    str(row[5]),
                    str(row[6]),
                )
            elif mode == "r2r":
                logging.error("r2r mode not implemented")
                pass
                # runR2RWorkflow(configuration)
            else:
                logging.error(f"mode {mode} not recognized")

    elif format == "json":
        config = json.loads(readFile(configuration))
        if mode == "ollama":
            for input, ranges in config["inputs"].items():
                logging.info(f"running workflow on {input} {ranges}")
                print(f"running workflow on {input} {ranges}")
                for prompt_config in config["prompts"]:
                    if prompt_config.get("run"):
                        runOllamaWorkflow(
                            input,
                            ranges,
                            path.join(
                                config["output"],
                                f"p{config['prompts'].index(prompt_config)}.json",
                            ),
                            prompt_config["prompt"],
                            prompt_config["model"],
                            prompt_config.get("modelfile"),
                            prompt_config.get("format", ""),
                        )
        elif mode == "r2r":
            # initial setup
            logging.info(f"creating client connection {config.get("url")}")
            client = R2RClient()
            client.set_base_url(config.get("url"))

            # update templates
            for template_config in config.get("templates"):
                logging.info(type(template_config.get("input_types")))
                response = client.prompts.update(
                    name=template_config.get("name"),
                    template=template_config.get("template"),
                    input_types=template_config.get("input_types"),
                )
                logging.info(f"template update response: {response}")

            # first ingest files if necessary
            ingested_document_titles = [
                document.title for document in client.documents.list().results
            ]
            logging.debug(f"ingested document titles: {ingested_document_titles}")
            if len(ingested_document_titles) == 0:
                # no existing docs so ingest all
                R2RIngestDocuments(client, config.get("inputs"))
            else:
                for document_path in config.get("inputs"):
                    # if document not already ingested, ingest it
                    if path.basename(document_path) not in ingested_document_titles:
                        logging.info(f"ingesting document: {document_path}")
                        response = client.documents.create(
                            file_path=document_path, ingestion_mode="fast"
                        )
                        logging.info(f"ingestion response: {response}")

            # then run the workflows
            # for prompt_config in config.get("prompts"):
            #     output = (
            #         prompt_config.get("output")
            #         if prompt_config.get("output") is not None
            #         else config.get("output")
            #     )
            #     model = (
            #         prompt_config.get("model")
            #         if prompt_config.get("model") is not None
            #         else config.get("model")
            #     )
            #     modelfile = (
            #         prompt_config.get("modelfile")
            #         if prompt_config.get("modelfile") is not None
            #         else config.get("modelfile")
            #     )
            #     output_format = (
            #         prompt_config.get("format")
            #         if prompt_config.get("format") is not None
            #         else config.get("format")
            #     )
            #     runR2RWorkflow(
            #         output=output,
            #         prompt=prompt_config.get("prompt"),
            #         model=model,
            #         modelfile=modelfile,
            #         output_format=output_format,
            #         client=client,
            #     )
        else:
            logging.error(f"mode {mode} not recognized")


def R2RIngestDocuments(client: R2RClient, documents: list[str]) -> None:
    """Ingest a list of documents into the R2R system.
    Parameters:
        client: an R2RClient used to manage the RAG system.
        documents: a list of strings containing the paths to the documents to ingest.
    """
    for document_path in documents:
        logging.info(f"ingesting document: {document_path}")
        client.document_path.create(file_path=document_path)


def runR2RWorkflow(
    output: str,
    prompt: str,
    model: str,
    modelfile: str,
    format: str,
    client: R2RClient,
    template="rag",
) -> None:
    """Run a workflow on a set of input files using R2R. Each workflow assumes the
    relevant documents have already been ingested into a vector store. Then a given list
    of prompts is executed using R2R. The output of all of these
    steps is written to an output directory.
    Parameters:
        output: the output directory path.
        prompt: a string containing the prompt to execute over the text.
        template: a string containing the template to execute with the prompt.
        model: a string of the ollama model tag to use for the prompt.
        modelfile: the path to the modelfile to use for the prompt.
        format: a string of the ollama response format.
        client: an R2RClient used to manage the RAG system.
    """
    # step 0
    output_path = path.normpath(output)
    logging.info(f"output directory: {output_path}")
    if not path.exists(output_path):
        makedirs(output_path)

    # step 1
    logging.info(f"\nsending prompt: {prompt}")
    print(f"sending prompt: {prompt}")

    response = client.prompts.update(
        name="rag", template=template, input_types={"name": "string"}
    )

    response = sendOllamaPrompt(model, prompt, modelfile, format)
    logging.debug(f"response: {response}")
    if not response["done"]:  # type: ignore
        logging.warning('response returned "done"=false')


def runOllamaWorkflow(
    input: str,
    page_ranges: str,
    output: str,
    prompt: str,
    model: str,
    modelfile: str,
    format: str,
) -> None:
    """Run a workflow on a set of input files using Ollama and pypdf. Each workflow will
    transform the input into a json file (unless the file already exists). Then a given
    list of prompts is executed. The output of all of these steps is
    written to an output directory.
    Parameters:
        input: a path to a JSON file containing an array of strings where each
            string corresponds to a page of text.
        page_ranges: a string containing the relevant page ranges from the text.
        output: the output directory path.
        prompt: a string containing the prompt to execute over the text.
        model: a string of the ollama model tag to use for the prompt.
        model: the modelfile to use for the prompt.
        format: a string of the ollama response format.
    """
    # step 0
    output_path = path.normpath(output)
    logging.info(f"output directory: {output_path}")
    if not path.exists(output_path):
        makedirs(output_path)

    # step 1
    if not input.endswith(".pdf"):
        logging.warning(f"is input {input} a PDF?")

    input_text_path = f"{path.splitext(input)[0]}.json"
    if not path.exists(input_text_path):
        logging.info(f"converting {input} to json. writing to {input_text_path}")
        writeToFile(input_text_path, json.dumps(pdf2list(input), indent=2))

    # step 2
    text = compilePages(input_text_path, page_ranges)

    logging.info(f"\nsending prompt: {prompt}[text]")
    print(f"sending prompt: {prompt}[text]")

    response = sendOllamaPrompt(model, prompt + text, modelfile, format)
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
        try:
            message = json.dumps(
                json.loads(response["response"]), indent=2  # type: ignore
            )
        except json.decoder.JSONDecodeError:
            message = response["response"]  # type: ignore
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
                page for page in range(int(split_range[0]) - 1, int(split_range[-1]))
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
