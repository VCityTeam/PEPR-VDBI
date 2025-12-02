# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
import os
import logging
import argparse
import glob
import subprocess
import torch
import whisper
import pyannote.audio
from sklearn.cluster import AgglomerativeClustering
from pyannote.audio import Audio
from pyannote.core import Segment
import wave
import contextlib
import numpy as np
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
import datetime
from codecarbon import OfflineEmissionsTracker
from codecarbon.output_methods.logger import LoggerOutput


def main():
    parser = argparse.ArgumentParser(
        description="""Batch process audio files using OpenAI Whisper.
            All audio files in the input directory (`./audio-files`) will be processed.
            Follow these readme instructions to install a dockerized whisper before
            running this script:
            https://github.com/manzolo/openai-whisper-docker"""
    )
    parser.add_argument(
        "-m", "--model", default="turbo", help="Specify the model to use"
    )
    parser.add_argument(
        "-l",
        "--language",
        default="French",
        help="Specify the language of the audio files",
    )
    parser.add_argument(
        "-d",
        "--diarization_speakers",
        default=0,
        help=(
            "Specify the number of speakers for diarization. Leave blank or 0 to skip"
            "diarization."
        ),
        type=int,
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
    LoggerOutput(logging.getLogger())

    file_extension_whitelist = tuple([".mp3", ".wav", ".m4a", ".flac"])
    embedding_model = (
        PretrainedSpeakerEmbedding(
            "speechbrain/spkrec-ecapa-voxceleb", device=torch.device("cuda")
        )
        if args.diarization_speakers > 0
        else None
    )
    tracker = OfflineEmissionsTracker(project_name="whisper-pyannote-pipeline")

    for _, _, files in os.walk("./audio-files"):
        for file in files:
            if file.endswith(file_extension_whitelist):
                logging.info(f"Processing audio file: {file}")
                if args.diarization_speakers > 0 and embedding_model is not None:
                    diarize(
                        file,
                        args.language,
                        args.diarization_speakers,
                        embedding_model,
                        args.model,
                        tracker,
                    )
                else:
                    transcribe(file, args.model, args.language, tracker)


def transcribe(file: str, model: str, language: str, tracker: OfflineEmissionsTracker):
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
    logging.debug(command)
    tracker.start_task("Whisper Transcription")
    try:
        os.system(command)
    finally:
        tracker.stop_task()


def diarize(
    file: str,
    language: str,
    speakers: int,
    embedding_model,
    model_name: str,
    tracker: OfflineEmissionsTracker,
):
    """
    Run whisper with diarization.
    :param file: audio file to process
    :param model: model to use for processing
    :param language: language of the audio
    :param speakers: number of speakers for diarization
    """
    model = whisper.load_model(model_name)
    seg = extract_speakers(model, file, language, speakers, embedding_model, tracker)
    write_segments(seg, f"{os.path.splitext(file)[0]}.txt")


def extract_speakers(
    model,
    path,
    language,
    num_speakers,
    embedding_model,
    tracker: OfflineEmissionsTracker,
):
    """Diarization with speaker names. Adapted from:
    https://dmnfarrell.github.io/general/whisper-diarization"""

    mono = "mono.wav"
    cmd = "ffmpeg -i {} -y -ac 1 mono.wav".format(path)
    options = whisper.DecodingOptions(language=language)
    subprocess.check_output(cmd, shell=True)
    result = None
    tracker.start_task("Whisper Diarization")
    try:
        result = model.transcribe(mono, options=options)
    finally:
        tracker.stop_task()
    segments = result["segments"]

    with contextlib.closing(wave.open(mono, "r")) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)

    audio = Audio()

    def segment_embedding(segment):
        start = segment["start"]
        # Whisper overshoots the end timestamp in the last segment
        end = min(duration, segment["end"])
        clip = Segment(start, end)
        waveform, sample_rate = audio.crop(mono, clip)
        return embedding_model(waveform[None])

    embeddings = np.zeros(shape=(len(segments), 192))
    tracker.start_task("Pyannote Embedding Segmentation")
    try:
        for i, segment in enumerate(segments):
            embeddings[i] = segment_embedding(segment)
    finally:
        tracker.stop_task()
    embeddings = np.nan_to_num(embeddings)

    clustering = None
    tracker.start_task("SkLearn Agglomerative Clustering")
    try:
        clustering = AgglomerativeClustering(num_speakers).fit(embeddings)
    finally:
        tracker.stop_task()
    labels = clustering.labels_
    for i in range(len(segments)):
        segments[i]["speaker"] = "SPEAKER " + str(labels[i] + 1)
    return segments


def write_segments(segments, outfile):
    """write out segments to file. Adapted from:
    https://dmnfarrell.github.io/general/whisper-diarization"""

    def time(secs):
        return datetime.timedelta(seconds=round(secs))

    f = open(outfile, "w")
    for i, segment in enumerate(segments):
        if i == 0 or segments[i - 1]["speaker"] != segment["speaker"]:
            f.write(
                "\n" + segment["speaker"] + " " + str(time(segment["start"])) + "\n"
            )
        f.write(segment["text"][1:] + " ")
    f.close()


if __name__ == "__main__":
    main()
