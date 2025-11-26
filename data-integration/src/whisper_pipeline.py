import argparse
import os


def main():
    parser = argparse.ArgumentParser(
        description="""Batch process audio files using OpenAI Whisper.
            All audio files in the input directory (`./audio-files`) will be processed.
            Follow these readme instructions to install a dockerized whisper before
            running this script:
            https://github.com/manzolo/openai-whisper-docker"""
    )
    parser.add_argument(
        "--model", "-m", default="turbo", help="Specify the model to use"
    )
    parser.add_argument(
        "--language",
        "-l",
        default="French",
        help="Specify the language of the audio files",
    )

    args = parser.parse_args()
    file_extension_whitelist = tuple([".mp3", ".wav", ".m4a", ".flac"])

    print("Starting batch processing...")
    for _, _, files in os.walk("./audio-files"):
        for file in files:
            if file.endswith(file_extension_whitelist):
                print(f"Processing audio file: {file}")
                run_whisper(file, args.model, args.language)


def run_whisper(file: str, model: str, language: str):
    """
    Run whisper.
    :param file: audio file to process
    :param model: model to use for processing
    :param language: language of the audio
    """
    command = (
        f"docker run --gpus all -it -v ${{PWD}}/models:/root/.cache/whisper"
        f' -v ${{PWD}}/audio-files:/app openai-whisper whisper "{file}" --device cuda'
        f" --model {model} --language {language} --output_dir /app --output_format txt"
    )
    print(command)
    os.system(command)


if __name__ == "__main__":
    main()
