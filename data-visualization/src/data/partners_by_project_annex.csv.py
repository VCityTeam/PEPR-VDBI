import sys
import csv
from siret_utils import queryAndFormatRe, defaultCsvHeader
from utils import initDefaultLogger


def main():

    logging = initDefaultLogger("partners_by_project_annex.log")

    PATH = "./src/data/private/financed_annex_partners_by_project.csv"
    partner_data = [defaultCsvHeader()]

    # get partner data
    phase1_partner_data = []
    with open(PATH, mode="r") as file:
        reader = csv.reader(file)
        for row in reader:
            phase1_partner_data += [row]
    logging.debug(f"phase1_partner_data: {phase1_partner_data}")

    # query SIRET api using partner names and aggregate data
    for row in phase1_partner_data[1:]:
        project_name = row[0].strip()
        if project_name == "":
            logging.warning(f"project_name not found in row: {row}")
            continue

        partner = row[1].strip()
        if partner == "":
            logging.warning(f"partner not found in row: {row}")
            continue

        partner_data += [
            queryAndFormatRe(
                partner,
                project_name,
                "financed_annex_partners_by_project",
                use_siege=False,
            )
        ]

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
