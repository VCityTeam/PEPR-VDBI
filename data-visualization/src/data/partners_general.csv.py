# import sys
import logging
import sys
import csv
from siret_utils import queryAndFormatRe, defaultCsvHeader


def main():

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename="partners.log",
        level=logging.DEBUG,
        # level=logging.INFO
    )
    logging.info(
        """
          __                 __
  _______/  |______ ________/  |_
 /  ___/\\   __\\__  \\\\_  __ \\   __\\
 \\___ \\  |  |  / __ \\|  | \\/|  |
/____  > |__| (____  /__|   |__|
     \\/            \\/"""
    )

    PATH = "./src/data/private/generality.csv"
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

        # get institutional coordinating partners
        partner = row[9].strip()
        if partner != "":
            partner_data += [
                queryAndFormatRe(
                    partner,
                    project_name,
                    project_coordinator=True,
                    proposed_from_generality=True,
                )
            ]

        # get other institutional partners
        for partner in row[10:24]:
            partner = partner.strip()
            if partner == "":
                continue

            partner_data += [
                queryAndFormatRe(
                    partner,
                    project_name,
                    project_coordinator=False,
                    proposed_from_generality=True,
                )
            ]

        # get socio-eco partners
        for partner in row[45:65]:
            partner = partner.strip()
            if partner == "":
                continue

            partner_data += [
                queryAndFormatRe(
                    partner,
                    project_name,
                    project_coordinator=False,
                    proposed_from_generality=True,
                )
            ]

    # write data to stdout as csv
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
