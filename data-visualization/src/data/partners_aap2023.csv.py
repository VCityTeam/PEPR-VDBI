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
        r"""
 ______     ______    ______     ______     ______
/\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
\ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
 \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
  \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/"""
    )
    PATH = "./src/data/private/partenaires_aap2023.csv"
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

        # get coordinating partner
        coordinating_partner = row[1].strip()
        if coordinating_partner != "":
            partner_data += [
                queryAndFormatRe(
                    coordinating_partner,
                    project_name,
                    "partenaires_aap2023",
                    project_coordinator=True,
                )
            ]

        # get institutional partners
        institutional_partner = row[3].strip()
        if institutional_partner != "":
            partner_data += [
                queryAndFormatRe(
                    institutional_partner,
                    project_name,
                    "partenaires_aap2023",
                    project_coordinator=False,
                )
            ]

        # get socio-economical partners
        socio_eco_partner = row[4].strip()
        if socio_eco_partner != "":
            partner_data += [
                queryAndFormatRe(
                    socio_eco_partner,
                    project_name,
                    "partenaires_aap2023",
                    project_coordinator=False,
                )
            ]

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
