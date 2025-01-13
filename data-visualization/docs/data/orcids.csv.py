import logging
import json
import pandas as pd
from orcid_utils import (
    getORCiDSecrets,
    getAccessToken,
    queryOrcid,
    getFirstname,
    getLastname,
)


def main():

    secrets = getORCiDSecrets()
    CLIENT_ID = secrets["CLIENT_ID"]
    CLIENT_SECRET = secrets["CLIENT_SECRET"]
    WORKBOOK_PATH = "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_SHEET = "Liste chercheurs"
    SHEET_COLUMNS = "A"
    EXPANDED_SEARCH = True

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename="orcids.log",
        level=logging.DEBUG,
        # level=logging.INFO
    )
    logging.info("          __                 __   ")
    logging.info("  _______/  |______ ________/  |_ ")
    logging.info(" /  ___/\\   __\\__  \\\\_  __ \\   __\\")
    logging.info(" \\___ \\  |  |  / __ \\|  | \\/|  |  ")
    logging.info("/____  > |__| (____  /__|   |__|  ")
    logging.info("     \\/            \\/             ")

    # Generate or retrieve access token
    token = getAccessToken(CLIENT_ID, CLIENT_SECRET)
    if token is None:
        logging.critical("Access token could not be retrieved or generated")
        exit(1)

    # get researcher names
    researcher_data = pd.read_excel(
        WORKBOOK_PATH, WORKBOOK_SHEET, usecols=SHEET_COLUMNS
    )
    # researcher data notes:
    # - Names are always in the format LASTNAME firstname
    # - Composite first names are not always hyphenated
    #   e.g. A555 "GROMAIRE Marie Christine"
    # - Multple unhyphenated last names exist e.g. A522 "VAN DEN ENDE Martijn"
    # - Commas are sometimes used e.g. A508 "GRAMAGLIA, Christelle"
    # - Hyphenation errors exist e.g. A506 "GIORGIS- ALLEMAND Lise"
    #   - These hyphenation errors are only preceded or followed by one space
    #     character
    # - There are also weird edge cases
    #   - e.g. A244 "DECHAUME-MONCHARMONT F.-X" and A312 "DESROUSSEAUx Maylis"

    # clean data
    researcher_data.map(
        lambda x: str(x).replace(",", "").replace(" -", "-").replace("- ", "-")
    )

    # add new columns
    researcher_data["firstname"] = (
        researcher_data.loc[:, "NOM et Prénom"].copy().map(getFirstname)
    )
    researcher_data["lastname"] = (
        researcher_data.loc[:, "NOM et Prénom"].copy().map(getLastname)
    )
    researcher_data.insert(3, "orcids", [""] * len(researcher_data.index))
    logging.debug(f"researcher_data: {researcher_data}")

    # query ORCiD to using name data
    for names in researcher_data.itertuples():
        firstname_query = ""
        lastname_query = ""
        if len(names[3]) > 0:
            firstname_query = f"given-names:{names[3]}"
        if len(names[4]) > 0:
            lastname_query = f"family-name:{names[4]}"

        if len(names[3]) > 0 and len(names[4]) > 0:
            query = f"{firstname_query}+AND+{lastname_query}"
        else:
            query = f"{firstname_query}{lastname_query}"

        response = queryOrcid(query, token, expanded=EXPANDED_SEARCH)
        logging.debug(f"ORCiD query response: {response}")
        if response is not None:
            result_key = "expanded-result" if EXPANDED_SEARCH else "result"
            researcher_data.loc[names.Index, "orcids"] = json.dumps(
                response[result_key]
            )

    # write data to stdout as csv
    # with open("test.csv", "w") as file:
    #     file.write(researcher_data.to_csv())
    print(researcher_data.to_csv())


if __name__ == "__main__":
    main()
