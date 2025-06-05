import csv
import json
import argparse
import logging
from utils import readFile
from clean_wordcount import clean_wordcount
from compare_wordcounts import compare_wordcounts


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
                "inputs": list(string),
                "params": {
                    "output_dir": string,
                    "ignored_words_path": string,
                    "plural_words_path": string,
                    "synonyms_path": string,
                    "delimiter": string,
                    "limit": int,
                }
            }
        Or with the following header for CSV:
            input,ignored_words_path,plural_words_path,synonyms_path,delimiter,limit,""",
    )
    parser.add_argument(
        "workflow",
        choices=["clean", "compare"],
        help="Specify the workflow",
    )
    parser.add_argument(
        "-f",
        "--format",
        choices=["csv", "json"],
        default="json",
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
        default="wordcloud-workflow.log",
        help="Specify the logging file",
    )

    args = parser.parse_args()

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename=args.log,
        level=(logging.DEBUG if args.debug else logging.INFO),
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

    config = parseConfig(args.configuration, args.format, args.delimeter)
    if args.workflow == "clean":
        runWorkflowClean(config)
    elif args.workflow == "compare":
        runWorkflowCompare(config)


def parseConfig(
    configuration: str,
    format: str = "json",
    delimeter: str = ",",
) -> list[tuple[str, dict]]:
    """Parse a configuration file.
    File must be structured as follows for JSON:
        {
            "inputs": list(string),
            "params": dict,
        }
    Or with the following header for CSV:
        input,*parameters

    See the workflow function for more details on the parameters.
    """
    config = []
    if format == "csv":
        with open(configuration) as file:
            csv_file = csv.reader(file, delimiter=delimeter)
            header = next(csv_file)[1:]
            for row in csv_file:
                row_params = dict(
                    (header[row.index(value)], value) for value in row[1:]
                )
                config.append((row[0], row_params))
    elif format == "json":
        temp_config = json.loads(readFile(configuration))
        row_params = temp_config.get("params")
        for input_path in temp_config["inputs"]:
            row = [input_path]
            config.append((input_path, row_params))
    return config


def runWorkflowClean(config: list[tuple[str, dict]]):
    """Run a clean_wordcount() workflow based on a configuration file"""
    for input_path, params in config:
        logging.info(f"running workflow on {input_path}")
        print(f"running workflow on {input_path}")
        if params.get("limit") == "":
            params["limit"] = None
        clean_wordcount(input_path, **params)


def runWorkflowCompare(config: list[tuple[str, dict]]):
    """
    Run a compare_wordcount() workflow based on a configuration file. Unlike
    runWorkflowClean(), two inputs are required. Thus the input string is delimited by a
    ':' character. E.g. `path1:path2`
    """
    for input_paths, params in config:
        logging.info(f"running workflow on {input_paths}")
        print(f"running workflow on {input_paths}")
        split_paths = input_paths.split(":")
        if len(split_paths) != 2:
            logging.error(f"Invalid input paths: {input_paths}")
            return None
        compare_wordcounts(split_paths[0], split_paths[1], **params)


if __name__ == "__main__":
    main()
