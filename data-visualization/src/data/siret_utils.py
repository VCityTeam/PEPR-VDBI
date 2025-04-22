import logging
import requests
import time


def queryRE(query: str, sleep: int = 1) -> dict | None:
    """Send a basic query to the recherche-entreprises.api.gouv.fr Public API. Only top
    result is returned. https://recherche-entreprises.api.gouv.fr/api
    Params:
    - query: the search query to be sent
    -----------
    returns a dictionary of the request response if successful or None."""
    logging.debug(f"Querying recherche-entreprises.api with query: {query}")
    time.sleep(sleep)  # sleep to avoid rate limiting
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


def formatReResponse(response: dict, partner: str, project_name: str) -> list | None:
    """Format the response from the recherche-entreprises.api.gouv.fr Public API.
    Params:
    - response: the response from the API
    - partner: the name of the partner to be used in the response
    - project_name: the name of the project to be used in the response"""
    if response is not None and len(response["results"]) > 0:
        result = response["results"][0]

        # matching etablissements may have more accurate data otherwise use siege
        matching_etablissement = (
            None
            if len(result["matching_etablissements"]) == 0
            else result["matching_etablissements"][0]
        )

        siret = (
            result["siege"]["siret"]
            if matching_etablissement is None
            else matching_etablissement["siret"]
        )
        latitude = (
            result["siege"]["latitude"]
            if matching_etablissement is None
            else matching_etablissement["latitude"]
        )
        longitude = (
            result["siege"]["longitude"]
            if matching_etablissement is None
            else matching_etablissement["longitude"]
        )
        libelle_commune = (
            result["siege"]["libelle_commune"]
            if matching_etablissement is None
            else matching_etablissement["libelle_commune"]
        )
        commune = (
            result["siege"]["commune"]
            if matching_etablissement is None
            else matching_etablissement["commune"]
        )

        return (
            siret,
            result["siren"],
            result["nom_complet"],
            partner,
            result["nature_juridique"],
            latitude,
            longitude,
            libelle_commune,
            commune,
            project_name,
        )
    else:
        logging.warning("No results found for query")
        return None
