import sys
import logging
import csv
from siret_utils import queryRE


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

    PATH = "./data/private/partenaires_aap2023.csv"
    partner_data = [
        (
            "siret",
            "nom_complet",
            "nature_juridique",
            "latitude",
            "longitude",
            "libelle_commune",
            "commune",
            "project_name",
            "project_coordinator",
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

        # get coordinating partner
        coordinating_partner = row[1].strip()
        if coordinating_partner != "":
            response = queryRE(coordinating_partner)
            if response is not None:
                for result in response["results"]:
                    partner_data += [
                        (
                            result["siege"]["siret"],
                            result["nom_complet"],
                            result["nature_juridique"],
                            result["siege"]["latitude"],
                            result["siege"]["longitude"],
                            result["siege"]["libelle_commune"],
                            result["siege"]["commune"],
                            project_name,  # project name
                            True,  # project coordinator?
                        )
                    ]

        # get institutional partners
        institutional_partner = row[3].strip()
        if institutional_partner != "":
            response = queryRE(institutional_partner)
            if response is not None:
                for result in response["results"]:
                    partner_data += [
                        (
                            result["siege"]["siret"],
                            result["nom_complet"],
                            result["nature_juridique"],
                            result["siege"]["latitude"],
                            result["siege"]["longitude"],
                            result["siege"]["libelle_commune"],
                            result["siege"]["commune"],
                            project_name,  # project name
                            False,  # project coordinator?
                        )
                    ]

        # get socio-economical partners
        socio_eco_partner = row[4].strip()
        if socio_eco_partner != "":
            response = queryRE(socio_eco_partner)
            if response is not None:
                for result in response["results"]:
                    partner_data += [
                        (
                            result["siege"]["siret"],
                            result["nom_complet"],
                            result["nature_juridique"],
                            result["siege"]["latitude"],
                            result["siege"]["longitude"],
                            result["siege"]["libelle_commune"],
                            result["siege"]["commune"],
                            project_name,  # project name
                            False,  # project coordinator?
                        )
                    ]

    # write data to file (comment out for use with observable framework data loaders)
    with open("partners.csv", "w") as file:
        writer = csv.writer(file)
        writer.writerows(partner_data)

    # write data to stdout as csv
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
