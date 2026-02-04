import csv
import logging
import sys
from utilities.cortext import lemmatize_cortext_terms


def main():
    FILE = "./src/data/private/js-2025-tables-rondes-adj-extracted-terms.tsv"

    lemmatized_data = lemmatize_cortext_terms(FILE)

    logging.info("Writing data to stdout")
    csv.writer(sys.stdout, delimiter="\t").writerows(lemmatized_data)


if __name__ == "__main__":
    main()
