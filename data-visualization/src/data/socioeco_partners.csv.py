from utilities.io_utils import initDefaultLogger
from utilities.siret import (
    queryRechercheEntreprises,
    formatRechercheEntreprisesResponse,
)
import pandas as pd


def main():

    LOG_PATH = "partners.csv.log"
    SHEET = "partenaires"
    WORKBOOK = "./src/data/private/partenaires_aap2023.xlsx"
    logging = initDefaultLogger(LOG_PATH)
    logging.info(f"Reading from {SHEET} in {WORKBOOK}")
    data = pd.read_excel(
        WORKBOOK,
        SHEET,
        usecols=["ID primaire", "label", "type"],
        dtype={"ID primaire": str},
    )
    data = data.loc[data["type"] == "SOCIOECONOMIQUE"].reset_index(drop=True)

    for partner in data["ID primaire"]:
        logging.info(f"Fetching data for partner {partner}")
        if partner == "":
            logging.warning(f"partner not found: {partner}")
            continue

        response = queryRechercheEntreprises(partner)
        formatted_response = formatRechercheEntreprisesResponse(
            {} if response is None else response,
            label=partner,
            project_name="",
            source="",
        )

        if formatted_response is None:
            logging.warning(f"partner not found: {partner}")
            continue
        partner_data = {
            "siret": formatted_response[0],
            "siren": formatted_response[1],
            "nom_complet": formatted_response[2],
            "nature_juridique": formatted_response[4],
            "latitude": formatted_response[5],
            "longitude": formatted_response[6],
            "libelle_commune": formatted_response[7],
            "commune": formatted_response[8],
            "code_postal": formatted_response[9],
            "region": formatted_response[10],
        }
        for key, value in partner_data.items():
            data.loc[data["ID primaire"] == partner, key] = str(value)

    logging.info("Writing data to stdout")
    print(data.to_csv(header=True, index=False))


if __name__ == "__main__":
    main()
