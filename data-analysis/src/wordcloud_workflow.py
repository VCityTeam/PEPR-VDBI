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
        "workflow",
        choices=["clean", "compare"],
        help="Specify the workflow",
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
) -> list[dict]:
    """Parse a configuration file.
    File must be structured as follows for JSON:
        {
            "inputs": list,
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
            header = next(csv_file)
            for row in csv_file:
                row_params = dict((header[row.index(value)], value) for value in row)
                config.append(row_params)
    elif format == "json":
        temp_config = json.loads(readFile(configuration))
        for input_path in temp_config["inputs"]:
            row_params = temp_config["params"].copy()
            row_params["input_path"] = input_path
            config.append(row_params)
    return config


def runWorkflowClean(config: list[dict]):
    """Run a clean_wordcount() workflow based on a configuration file"""
    for params in config:
        row_params = params.copy()
        logging.info(f"running workflow on {row_params['input_path']}")
        print(f"running workflow on {row_params['input_path']}")
        if row_params.get("limit") == "":
            row_params["limit"] = None
        clean_wordcount(**row_params)


def runWorkflowCompare(config: list[dict]):
    """
    Run a compare_wordcount() workflow based on a configuration file. Unlike
    runWorkflowClean(), two inputs are required. Thus the each input must be formed as a
    tuple of strings e.g. `["path1","path2"]`
    """
    print(config[0])
    for params in config:
        row_params = params.copy()
        split_paths = row_params.pop("input_path").split(":")
        if len(split_paths) != 2:
            logging.error(f"Invalid input paths: {split_paths}")
            return None

        logging.info(f"running workflow on {split_paths}")
        print(f"running workflow on {split_paths}")

        row_params["input_path_1"] = split_paths[0]
        row_params["input_path_2"] = split_paths[1]
        compare_wordcounts(**row_params)


if __name__ == "__main__":
    main()
