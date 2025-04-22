import sys
import logging
import csv
from siret_utils import queryRE, formatReResponse


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

    PATH = "./data/private/financed_annex_partners_by_project.csv"
    partner_data = [
        (
            "siret",
            "siren",
            "nom_complet",
            "source_label",
            "nature_juridique",
            "latitude",
            "longitude",
            "libelle_commune",
            "commune",
            "project_name",
        )
    ]

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
            continue

        # get partner
        partner = row[1].strip()
        if partner != "":
            response = queryRE(partner)
            if response is not None:
                formatted_response = formatReResponse(
                    response, partner, project_name
                )
                if formatted_response is not None:
                    partner_data += [formatted_response]

    # write data to file (comment out for use with observable framework data loaders)
    with open("annex_partners_by_project.csv", "w") as file:
        writer = csv.writer(file)
        writer.writerows(partner_data)

    # write data to stdout as csv
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
