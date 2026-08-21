import os
import json
import argparse
import logging
from codecarbon import OfflineEmissionsTracker
from utils import read_file, write_csv
from wordcount import (
    tokenize_text,
    clean_and_count_words,
    compare_wordcounts,
    write_word_count,
)
from transcribe import transcribe


def main():
    parser = argparse.ArgumentParser(
        description="""Launch a workflow (or data pipeline). A configuration file can
        specify multiple several workflow steps. Otherwise a single step can be run by
        specifying the input/output directories and the activity type. If a configuration
        file is provided, non-debugging and logging arguments are ignored.""",
    )
    parser.add_argument(
        "config",
        help="""Specify the configuration file. File must be structured as a JSON array of
configurations, each specifying the type of activity, the inputs and outputs,
and the parameters used for the activity.

The following types are currently
supported:
- 'parse': for tokenizing a text
- 'count': for lemmatizing, filtering, and counting a list of words
- 'compare': for comparing word counts
- 'transcribe': for transcribing audio files
For example:
```json
[
    {
        "activity": "parse",
        "input_dir": "./input/wordcount-test/",
        "output_dir": "./wordcount-test_stage_0/"
    },
    {
        "activity": "count",
        "input_dir": "./wordcount-test_stage_0/",
        "output_dir": "./wordcount-test_stage_1/",
        "limit": 50,
        "params": {
        "stop_words_path": "./configs/wordcount/stop_words_english.csv"
        }
    },
    {
        "activity": "count",
        "input_dir": "./wordcount-test_stage_0/",
        "output_dir": "./wordcount-test_stage_1/",
        "limit": 100,
        "params": {
        "stop_words_path": "./configs/wordcount/stop_words_english.csv"
        }
    },
    {
        "activity": "compare",
        "inputs": [
            "./wordcount-test_stage_1/example-text_count_50.csv:./wordcount-test_stage_1/example-text_count_100.csv"
        ],
        "output_dir": "./output/wordcount-test/",
        "params": {
        "mode": "INTERSECTION"
        }
    }
]
```

Note that:
- if `input_dir` is specified, it overwrites `inputs`.
- `input_dir` is not supported by the compare activity.
- If `input_dir` is specified, all files from the specified directory are taken into
  account and inputs are set to the files in that directory.
- The transcribe step requires a docker container setup with GPU support as described in:
    https://github.com/manzolo/openai-whisper-docker""",
    )
    parser.add_argument(
        "-d",
        "--debug",
        action="store_true",
        help="Use debug mode for logging",
    )
    parser.add_argument(
        "-l",
        "--log",
        default="wordcount-workflow.log",
        help="Specify the logging file",
    )

    args = parser.parse_args()

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename=args.log,
        level=(logging.DEBUG if args.debug else logging.WARNING),
    )
    print(f"Initializing, see {args.log} for logs...")
    logging.info(
        r"""
 ______     ______    ______     ______     ______
/\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
\ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
 \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
  \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/"""
    )

    config = None
    if args.config is None:
        print("No configuration file specified, running single step.")
        logging.error("No configuration file specified, running single step.")
        config = [
            {
                "activity": args.mode,
                "input_dir": args.input_dir,
                "output_dir": args.output_dir,
                "limit": args.limit,
            }
        ]

    else:
        config = json.loads(read_file(args.config))

    runWorkflow(config)


def runWorkflow(config: list[dict]) -> None:
    """Run a workflow based on a workflow configuration.
    :config: A list of workflow step configurations. Each configuration is a dictionary
        specifying the type of activity, the inputs and outputs, and the parameters used
        for the activity.
    """

    tracker = OfflineEmissionsTracker(
        save_to_logger=True, logging_logger=logging.getLogger()
    )

    for activity_config in config:
        # parse the inputs and parameters for activity
        parsed_activity_config = []
        inputs = activity_config.get("inputs", [])
        output_dir = activity_config["output_dir"]
        limit = activity_config.get("limit", None)
        logging.debug(f"Activity config: {json.dumps(activity_config, indent=2)}")

        if "input_dir" in activity_config:
            # If input_dir is specified, overwrite `inputs` to the files in that directory
            input_dir = activity_config["input_dir"]
            if not os.path.exists(input_dir):
                logging.error(f"Input directory does not exist: {input_dir}")
                print(f"Input directory does not exist: {input_dir}")
                return None

            inputs = [
                os.path.join(input_dir, input_file)
                for input_file in os.listdir(input_dir)
                if os.path.isfile(os.path.join(input_dir, input_file))
            ]

        for input_path in inputs:
            row_params = activity_config.get("params", {}).copy()
            row_params["input_path"] = input_path
            parsed_activity_config.append(row_params)

        logging.debug(
            f"Parsed activity config: {json.dumps(parsed_activity_config, indent=2)}"
        )

        if activity_config.get("activity") == "parse":
            runParse(parsed_activity_config, output_dir)
        elif activity_config.get("activity") == "count":
            runCount(parsed_activity_config, output_dir, limit)
        elif activity_config.get("activity") == "compare":
            runCompare(parsed_activity_config, output_dir, limit)
        elif activity_config.get("activity") == "transcribe":
            runTranscribe(parsed_activity_config, tracker)
        else:
            logging.error(f"Unknown activity type: {activity_config.get('activity')}")
            print(f"Unknown activity type: {activity_config.get('activity')}")
    print("Done!")


def runParse(config: list[dict], output_dir: str = "./"):
    """Run tokenize_text() on one file based on a configuration"""
    for params in config:
        row_params = params.copy()  # deep copy
        input_path = row_params["input_path"]

        logging.info(f"running tokenize_text() on {input_path}")
        tokens = tokenize_text(**row_params)

        # print(tokens)
        input_basename = os.path.splitext(os.path.basename(input_path))[0]
        output_file = f"{output_dir}{input_basename}.csv"
        logging.info(f"writing tokens to {output_file}")
        write_csv(output_file, [[token] for token in tokens])


def runCount(config: list[dict], output_dir: str = "./", limit: int | None = None):
    """Run clean_and_count_words() on one file based on a configuration"""
    for params in config:
        row_params = params.copy()  # deep copy
        input_path = row_params["input_path"]

        logging.info(f"running clean_and_count_words() on {input_path}")
        word_counts = clean_and_count_words(**row_params)

        split_input_filename = os.path.splitext(os.path.basename(input_path))
        output_file = (
            f"{output_dir}{split_input_filename[0]}_count"
            + (f"_{row_params["limit"]}" if "limit" in row_params else "")
            + split_input_filename[1]
        )
        logging.info(f"writing tokens to {output_file}")
        write_word_count(word_counts, output_file, limit)


def runCompare(config: list[dict], output_dir: str = "./", limit: int | None = None):
    """
    Run compare_wordcount() based on a configuration. Unlike runCount(), two inputs are
    required for comparison. Thus the each input must be formed as a tuple of strings e.g.
        `["path1","path2"]`
    """
    for params in config:
        row_params = params.copy()  # deep copy
        split_paths = row_params.pop("input_path").split(":")
        if len(split_paths) != 2:
            logging.error(f"Invalid input paths: {split_paths}")
            return None

        logging.info(f"running compare_wordcount() on {split_paths}")

        row_params["input_path_1"], row_params["input_path_2"] = split_paths
        compared_word_counts = compare_wordcounts(**row_params)

        split_input_filename_1 = os.path.splitext(os.path.basename(split_paths[0]))
        split_input_filename_2 = os.path.splitext(os.path.basename(split_paths[1]))
        mode = row_params["mode"] if "mode" in row_params else "INTERSECTION"
        strategy = row_params["strategy"] if "strategy" in row_params else "SUM"
        output_file = (
            f"{output_dir}{split_input_filename_1[0]}_{mode}_{strategy}_"
            f"{split_input_filename_2[0]}{limit if limit else ""}.csv"
        )

        logging.info(f"writing tokens to {output_file}")
        write_word_count(compared_word_counts, output_file, limit)


def runTranscribe(config: list[dict], tracker: OfflineEmissionsTracker) -> None:
    """Run transcribe() on one file based on a configuration"""
    for params in config:
        row_params = params.copy()  # deep copy
        input_path = row_params["input_path"]
        model = row_params.get("model", "turbo")
        language = row_params.get("language")

        if language is None:
            logging.error("Language parameter is required for transcription.")
            print("Language parameter is required for transcription.")
            return None

        logging.info(f"running transcribe() on {input_path}")
        transcribe(input_path, model, language, tracker)


if __name__ == "__main__":
    main()
