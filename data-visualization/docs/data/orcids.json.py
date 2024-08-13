import os
from sys import stdout
import json
import requests
import pandas as pd


def main():

    CLIENT_ID = "APP-JYXHEML7DYQIA0R0"
    CLIENT_SECRET = "a2c72289-0e1f-4611-b16a-3b91f14b3206"
    WORKBOOK_PATH = "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_SHEET = "Liste chercheurs"
    SHEET_COLUMNS = "A"

    # Generate or retrieve access token
    token = getAccessToken(CLIENT_ID, CLIENT_SECRET)
    if token is None:
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
    #   - These hyphenation errors are only preceded or followed by one space character
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
    researcher_data.insert(3, "orcids", [dict()]*len(researcher_data.index))
    print(researcher_data)

    # query ORCiD to using name data
    for names in researcher_data.itertuples():
        firstname_query, lastname_query = ""
        if len(names[2]) > 0:
            firstname_query = f"given-names:{names[2]}"
        if len(names[3]) > 0:
            lastname_query = f"family-name:{names[3]}"

        if len(names[2]) > 0 and len(names[3]) > 0:
            query = f"{firstname_query}+AND+{lastname_query}"
        else:
            query = f"{firstname_query}{lastname_query}"

        response = queryOrcid(query, token)
        if response is not None:
            researcher_data.loc[names.index, "orcids"] = response

    # write data to stdout as csv
    # stdout.write(researcher_data.to_csv())


def getAccessToken(
    client_id: str, client_secret: str, token_path="./data/orcid_token"
) -> str | None:
    """Get access token using an ORCID client app credentials using ORCID Public API.
    Request response is stored in a local file.
    client_id and client_secret are strings used to authenticate an ORCID app.
    -----------
    Returns token if successfull or None."""
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
            print(f"HTTP error occurred: {http_err}")
        except Exception as err:
            print(f"Other error occurred: {err}")
        else:
            print("Generating and storing new token:", access_token_response.json())
            with open(token_path, "w") as file:
                file.write(json.dumps(access_token_response.json(), indent=2))

    with open(token_path, "r") as file:
        token = json.loads(file.read())["access_token"]
        # print(token)
    return token


def queryOrcid(query: str, token: str, rows=10) -> dict[str, str] | None:
    """Send a basic query to the ORCID Public API using an access token. Params:
    query: the query to be sent
    token: the access token to authenticate the query with
    rows: max number of results to return
    -----------
    returns a dictionary of the request response if successfull or None."""
    try:
        query_response = requests.get(
            url="https://pub.orcid.org/v3.0/search/",
            params={
                "q": query,
                "rows": rows,
            },
            headers={"Accept": "application/json", "Authorization": f"Bearer {token}"},
        )
        query_response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        exit(1)
    except Exception as err:
        print(f"Other error occurred: {err}")
        exit(1)
    else:
        return query_response.json()


def getFirstname(fullname: str) -> str:
    # list of names (hyphenated or not)
    names = str(fullname).split(" ")
    firstnames = " ".join([name for name in names if not name.isupper()])
    if firstnames == "":
        print(f"Could not find firstnames of {fullname}")
    return firstnames


def getLastname(fullname: str) -> str:
    # list of names (hyphenated or not)
    names = str(fullname).split(" ")
    lastnames = " ".join([name for name in names if name.isupper()])
    if lastnames == "":
        print(f"Could not find lastnames of {fullname}")
    return lastnames


if __name__ == "__main__":
    main()
