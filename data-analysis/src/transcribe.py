from codecarbon import OfflineEmissionsTracker
import os
import logging


def transcribe(file: str, model: str, language: str, tracker: OfflineEmissionsTracker):
    """
    Run whisper. Requires Docker with GPU support as described in:
        https://github.com/manzolo/openai-whisper-docker

    :param file: audio file to process
    :param model: model to use for processing
    :param language: language of the audio
    """
    command = (
        f"docker run --gpus all -it -v ${{PWD}}/models:/root/.cache/whisper"
        f' -v ${{PWD}}/audio-files:/app openai-whisper whisper "{file}" --device cuda'
        f" --model {model} --language {language} --output_dir /app --output_format txt"
    )
    logging.debug(command)
    tracker.start_task("Whisper Transcription")
    try:
        os.system(command)
    finally:
        tracker.stop_task()
