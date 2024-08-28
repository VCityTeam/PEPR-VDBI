import os
import json
import logging
import requests
import pandas as pd
from time import sleep


def main():

    CLIENT_ID = "APP-JYXHEML7DYQIA0R0"
    CLIENT_SECRET = "a2c72289-0e1f-4611-b16a-3b91f14b3206"
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
    logging.info("=================")

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

        # throttle requests
        # input()
        sleep(0.0001)

    # write data to stdout as csv
    # with open("test.csv", "w") as file:
    #     file.write(researcher_data.to_csv())
    print(researcher_data.to_csv())


def getAccessToken(
    client_id: str, client_secret: str, token_path="./data/orcid_token"
) -> str | None:
    """Get access token using an ORCID client app credentials using ORCID Public API.
    Request response is stored in a local file.
    client_id and client_secret are strings used to authenticate an ORCID app.
    -----------
    Returns token if successful or None."""
    # if no api access token is stored in TOKEN_PATH, generate and store a new one
    if not os.path.exists(os.path.normpath(token_path)):
        # error checking adapted from https://realpython.com/python-requests/
        try:
            access_token_response = requests.post(
                url="https://orcid.org/oauth/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "grant_type": "client_credentials",
                    "scope": "/read-public",
                },
                headers={"Accept": "application/json"},
            )
            access_token_response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            logging.error(
                f"HTTP error occurred when generating access token: {http_err}"
            )
        except Exception as err:
            logging.error(
                f"Other error occurred when generating access token: {err}"
            )
        else:
            logging.info("Generating and storing new token")
            with open(token_path, "w") as file:
                file.write(json.dumps(access_token_response.json(), indent=2))

    with open(token_path, "r") as file:
        token = json.loads(file.read())["access_token"]
        logging.debug(f"token: {token}")
    return token


def queryOrcid(query: str, token: str, rows=10, expanded=False) -> dict | None:
    """Send a basic query to the ORCID Public API using an access token. Params:
    query: the query to be sent
    token: the access token to authenticate the query with
    rows: max number of results to return
    expanded: use ORCiD expanded search (returns more info per result)
    -----------
    returns a dictionary of the request response if successful or None."""
    search_api = "expanded-search" if expanded else "search"
    try:
        query_response = requests.get(
            url=f"https://pub.orcid.org/v3.0/{search_api}/?q={query}&rows={rows}",
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {token}",
            },
        )
        query_response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error occurred when querying ORCid: {http_err}")
    except Exception as err:
        logging.error(f"Other error occurred when querying ORCid: {err}")
    else:
        return query_response.json()


def getFirstname(fullname: str) -> str:
    # list of names (hyphenated or not)
    names = str(fullname).split(" ")
    firstnames = " ".join([name for name in names if not name.isupper()])
    if firstnames == "":
        logging.warning(f"Could not find firstnames of {fullname}")
    return firstnames


def getLastname(fullname: str) -> str:
    # list of names (hyphenated or not)
    names = str(fullname).split(" ")
    lastnames = " ".join([name for name in names if name.isupper()])
    if lastnames == "":
        logging.warning(f"Could not find lastnames of {fullname}")
    return lastnames


if __name__ == "__main__":
    main()
