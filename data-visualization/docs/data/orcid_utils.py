import os
import json
import logging
import requests


def getORCiDSecrets(secret_path="./data/.env") -> dict[str, str] | None:
    """Get ORCID client app credentials (id and secret).
    -----------
    Returns dict if successful or None."""
    with open(secret_path, "r") as file:
        secrets = dict()
        for line in file.readlines():
            line = line.split("#")[0].strip().replace("'", "").replace('"', "")
            if "=" not in line:
                continue
            key, value = line.split("=")
            secrets[key] = value
        return secrets


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
                headers={"Accept": "application/json"},
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "grant_type": "client_credentials",
                    "scope": "/read-public",
                },
            )
            access_token_response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            logging.error(
                f"HTTP error occurred when generating access token: {http_err}"
            )
        except Exception as err:
            logging.error(f"Other error occurred when generating access token: {err}")
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
