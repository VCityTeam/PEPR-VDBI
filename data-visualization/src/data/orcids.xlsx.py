import logging
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
    WORKBOOK_PATH = "./data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
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

    # clean data and add new columns
    researcher_data["cleanname"] = (
        researcher_data.loc[:, "NOM et Prénom"]
        .copy()
        .map(lambda x: str(x).replace(",", "").replace(" -", "-").replace("- ", "-"))
    )
    researcher_data["firstname"] = (
        researcher_data.loc[:, "NOM et Prénom"].copy().map(getFirstname)
    )
    researcher_data["lastname"] = (
        researcher_data.loc[:, "NOM et Prénom"].copy().map(getLastname)
    )
    researcher_data.insert(3, "orcids", [""] * len(researcher_data.index))
    logging.debug(f"researcher_data: {researcher_data}")

    # query ORCiD to using name data
    with pd.ExcelWriter("output.xlsx") as writer:
        researcher_data.to_excel(writer, sheet_name="input_data")
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
                # researcher_data.loc[names.Index, "orcids"] = json.dumps(
                #     response[result_key]
                # )
                response_data = pd.DataFrame()
                response_data.insert(0, "orcid-id", pd.Series(dtype=str))
                response_data.insert(1, "given-names", pd.Series(dtype=str))
                response_data.insert(2, "family-names", pd.Series(dtype=str))
                response_data.insert(3, "credit-name", pd.Series(dtype=str))
                response_data.insert(4, "other-name", pd.Series(dtype=str))
                response_data.insert(5, "email", pd.Series(dtype=str))
                response_data.insert(6, "institution-name", pd.Series(dtype=str))
                if response[result_key] is not None:
                    for i in range(len(response[result_key])):
                        result = response[result_key][i]
                        response_data.loc[i, "orcid-id"] = str(result["orcid-id"])
                        response_data.loc[i, "given-names"] = str(result["given-names"])
                        response_data.loc[i, "family-names"] = str(
                            result["family-names"]
                        )
                        response_data.loc[i, "credit-names"] = str(
                            result["credit-name"]
                        )
                        response_data.loc[i, "other-names"] = str(result["other-name"])
                        response_data.loc[i, "email"] = str(result["email"])
                        response_data.loc[i, "institution-name"] = str(
                            result["institution-name"]
                        )
                    # if one response found, assume it is correct
                    if len(response[result_key]) > 0:
                        researcher_data.loc[names[0], "orcids"] = str(
                            response[result_key][0]["orcid-id"]
                        )
                        researcher_data.to_excel(writer, sheet_name="input_data")

                # sheet names cannot be longer than 31 chars
                sheet_name = f"{names[0]}_{names[1]}"[:30]
                logging.debug(f"added sheet {sheet_name}")
                response_data.to_excel(writer, sheet_name=sheet_name)

    # write data to stdout as csv
    # print(researcher_data.to_csv())


if __name__ == "__main__":
    main()
