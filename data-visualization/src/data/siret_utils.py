import logging
import requests


def queryRE(query: str) -> dict | None:
    """Send a basic query to the recherche-entreprises.api.gouv.fr Public API. Only top
    result is returned. https://recherche-entreprises.api.gouv.fr/api
    Params:
    - query: the search query to be sent
    -----------
    returns a dictionary of the request response if successful or None."""
    try:
        response = requests.get(
            url=(
                f"https://recherche-entreprises.api.gouv.fr/search?"
                f"q={query}&page=1&per_page=1"
            ),
            headers={
                "Accept": "application/json",
            },
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        logging.error(
            f"HTTP error occurred when querying recherche-entreprises.api: {http_err}"
        )
    except Exception as err:
        logging.error(
            f"Other error occurred when querying recherche-entreprises.api: {err}"
        )
    else:
        logging.debug(f"recherche-entreprises.api response: {response}")
        return response.json()
