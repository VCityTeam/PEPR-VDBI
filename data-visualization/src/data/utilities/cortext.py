import csv
import os
from tqdm import tqdm
from .io_utils import initDefaultLogger
from .text_mining import lemmatize_words


def lemmatize_cortext_terms(file_path: str):
    LOG_PATH = "lemmatize-cortext-terms.log"

    logging = initDefaultLogger(LOG_PATH)
    file_path = os.path.abspath(file_path)
    if not os.path.exists(file_path):
        logging.error(f"File {file_path} does not exist")
        return
    logging.info(f"Reading from {file_path}")
    data = []
    with open(file_path) as f:
        for row in csv.reader(f, delimiter="\t"):
            data.append(row)

    logging.debug(f"Term data: {data}")

    lemmas = []
    for term in tqdm(data[1:]):
        term_lemmas = lemmatize_words(term[1].split(" "), "fr")
        lemmas.append(" ".join(term_lemmas))
    logging.debug(f"Lemmatized terms: {lemmas}")

    # replace stems with lemmas
    for i, term in enumerate(data[1:]):
        term[0] = lemmas[i]

    # TODO group lemmas by form
    # select a1, ARRAY_AGG(a3, x => x.join("|&|")) group by a1

    logging.info("Writing data to stdout")
    return data
