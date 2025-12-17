from time import sleep
from utilities.utils import initDefaultLogger
import pandas as pd
import requests
from collections.abc import Iterable


def main():

    LOG_PATH = "labs.csv.log"
    SHEET = "partenaires"
    WORKBOOK = "./src/data/private/partenaires_aap2023.xlsx"

    logging = initDefaultLogger(LOG_PATH)
    logging.info(f"Reading from {SHEET} in {WORKBOOK}")
    data = pd.read_excel(WORKBOOK, SHEET, usecols=["ID primaire", "label", "type"])
    data = data.loc[data["type"] == "LABORATOIRE"].reset_index(drop=True)

    logging.debug(f"Laboratory data: {data}")

    for lab in data["ID primaire"]:
        logging.info(f"Fetching data for laboratory {lab}")
        try:
            response = requests.get(
                url=(
                    "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/"
                    "catalog/datasets/fr-esr-structures-recherche-publiques-actives/"
                    f'records?where=numero_national_de_structure="{lab}"'
                ),
                headers={
                    "Accept": "application/json",
                },
            )
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            logging.error(
                "HTTP error occurred when querying "
                f"https://data.enseignementsup-recherche.gouv.fr: {http_err}"
            )
            print(http_err)
            return None
        except Exception as err:
            logging.error(
                "Other error occurred when querying "
                f"https://data.enseignementsup-recherche.gouv.fr: {err}"
            )
            print(err)
            return None
        else:
            response_json = response.json()
            logging.debug(
                "https://data.enseignementsup-recherche.gouv.fr response: "
                f"{response_json}"
            )

            if int(response_json.get("total_count", 0)) > 0:
                lab_data = response_json["results"][0]
                for key, value in lab_data.items():
                    data.loc[data["ID primaire"] == lab, key] = (
                        str(value) if isinstance(value, Iterable) else value
                    )
            else:
                logging.warning(f"No data found for laboratory {lab}")

        sleep(0.2)  # to avoid overwhelming the server

    data.drop(columns=["type"], inplace=True)
    logging.info("Writing data to stdout")
    print(data.to_csv(header=True, index=False))


if __name__ == "__main__":
    main()
