import csv
import json
import argparse
import logging
from utils import readFile
from clean_wordcloud import clean_wordcloud


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

    runWorkflow(args.configuration, args.format, args.delimeter)


def runWorkflow(
    configuration: str,
    format: str = "json",
    delimeter: str = ",",
) -> None:
    """Run a clean_wordcloud() workflow based on a configuration file.
    File must be structured as follows for JSON:
        {
            "inputs": list(string),
            "params":{
                "ignored_words_path": string,
                "plural_words_path": string,
                "synonyms_path": string,
                "delimiter": string,
                "limit": int,
            }
        }
    Or with the following header for CSV:
        input,ignored_words_path,plural_words_path,synonyms_path,delimiter,limit,

    See the clean_wordcloud() function for more details on the parameters.
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
            clean_wordcloud(*row)

    elif format == "json":
        config = json.loads(readFile(configuration))
        for input_path in config["inputs"]:
            logging.info(f"running workflow on {input_path}")
            print(f"running workflow on {input_path}")
            clean_wordcloud(input_path, **config.get("params"))


if __name__ == "__main__":
    main()
