import csv
import os
import sys
from stanza import DownloadMethod
import stanza
from utilities.io_utils import initDefaultLogger


def main():

    LOG_PATH = "lemmatize-project_by_discipline.log"

    # Get project ids and acronyms
    FILE = "src/data/private/AAP2_submission_metadata.tsv"

    logging = initDefaultLogger(LOG_PATH)
    file_path = os.path.abspath(FILE)
    if not os.path.exists(file_path):
        logging.error(f"File {file_path} does not exist")
        return
    logging.info(f"Reading from {file_path}")
    project_ids = {}
    with open(file_path) as f:
        for row in csv.DictReader(f, delimiter="\t"):
            project_ids[row["DOCID"]] = row["Titre court"]

    logging.debug(f"Project ids: {project_ids}")

    # Get project disciplines
    FILE = "src/data/private/AAP2_template_export.tsv"

    file_path = os.path.abspath(FILE)
    if not os.path.exists(file_path):
        logging.error(f"File {file_path} does not exist")
        return
    logging.info(f"Reading from {file_path}")
    project_disciplines = []
    with open(file_path) as f:
        for row in csv.DictReader(f, delimiter="\t"):
            if row["\ufeffDOCID"] == "":
                continue
            project_disciplines.append(
                {
                    "DOCID": row["\ufeffDOCID"],
                    "acronyme": project_ids[row["\ufeffDOCID"]],
                    "disciplines": row["disciplines"].replace(",", ";"),
                }
            )

    logging.debug(f"Project by discipline data: {project_disciplines}")

    nlp = stanza.Pipeline(
        lang="fr",
        processors="tokenize,pos,lemma",
        tokenize_no_ssplit=True,
        logging_level="WARN",
        download_method=DownloadMethod.REUSE_RESOURCES,
    )
    doc = nlp("\n\n".join([row["disciplines"] for row in project_disciplines]))

    # logging.debug(f"Project by discipline data: {doc}")

    lemmatized_data = [
        " ".join([word.lemma for word in sentence.words])
        for sentence in doc.sentences  # type: ignore
    ]

    logging.debug(f"Number of projects: {len(project_disciplines)}")
    logging.debug(f"Number of disciplines: {len(lemmatized_data)}")
    logging.debug(f"Lemmatized data: {lemmatized_data}")

    for i, project_discipline in enumerate(project_disciplines):
        project_discipline["disciplines"] = [
            d.strip().lower() for d in lemmatized_data[i].split(";")
        ]

    logging.debug(f"Lemmatized data: {project_disciplines}")

    logging.info("Writing data to stdout")
    csv.writer(sys.stdout, delimiter="\t").writerow(["acronyme", "discipline"])
    for project_discipline in project_disciplines:
        for discipline in project_discipline["disciplines"]:
            csv.writer(sys.stdout, delimiter="\t").writerow(
                [project_discipline["acronyme"], discipline]
            )


if __name__ == "__main__":
    main()


# import { DuckDBInstance } from '@duckdb/node-api'
# import { tsvFormat } from 'd3-dsv'

# const project_by_discipline_query = `
# select distinct
#   "Titre court" as acronyme,
#   unnest(
#     apply(
#       string_split_regex(
#         disciplines,
#         '[;,]'
#       ),
#       x -> trim(regexp_replace(x, '[\n\r]', ' ', 'g'))
#     )
#   )
#   as discipline,
# from 'src/data/private/AAP2_submission_metadata.tsv'
# left join 'src/data/private/AAP2_template_export.tsv'
# on AAP2_submission_metadata.DOCID =
#   AAP2_template_export.DOCID
# `

# const instance = await DuckDBInstance.create()
# const connection = await instance.connect()

# const reader = await connection.runAndReadAll(project_by_discipline_query)
# const rows = reader.getRowObjectsJson()

# process.stdout.write(tsvFormat(rows))

# connection.closeSync()
