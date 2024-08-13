import os
from sys import stdout
import json
import requests
# from pandas import read_excel

CLIENT_ID = "APP-JYXHEML7DYQIA0R0"
CLIENT_SECRET = "a2c72289-0e1f-4611-b16a-3b91f14b3206"
TOKEN_PATH = "./data/orcid_token"

# if no api access token is stored in TOKEN_PATH, generate and store a new one
if not os.path.exists(os.path.normpath(TOKEN_PATH)):
    # error checking adapted from https://realpython.com/python-requests/
    try:
        access_token_response = requests.post(
            url="https://orcid.org/oauth/token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "client_credentials",
                "scope": "/read-public",
            },
            headers={"Accept": "application/json"},
        )
        access_token_response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        exit(1)
    except Exception as err:
        print(f"Other error occurred: {err}")
        exit(1)
    else:
        print("Generating and storing new token:", access_token_response.json())
        with open(TOKEN_PATH, "w") as file:
            file.write(json.dumps(access_token_response.json(), indent=2))

with open(TOKEN_PATH, "r") as file:
    token = json.loads(file.read())["access_token"]

# print(token)


def queryOrcid(query: str, token: str) -> dict[str, str]:
    try:
        query_response = requests.get(
            url="https://pub.orcid.org/v3.0/search/",
            params={
                "q": query,
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


response = queryOrcid("vinasco", token)
stdout.write(json.dumps(response, indent=2))
