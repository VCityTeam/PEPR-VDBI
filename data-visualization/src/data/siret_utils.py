import requests
import time
import logging


def defaultCsvHeader() -> tuple:
    """Return the default CSV header for a formatted SIRET API response.
    Returns:
    - a list of strings representing the header"""
    return (
        "siret",
        "siren",
        "nom_complet",
        "source_label",
        "nature_juridique",
        "latitude",
        "longitude",
        "libelle_commune",
        "commune",
        "project_name",
        "project_coordinator",
    )


def queryAndFormatRe(
    query: str,
    project_name: str,
    project_coordinator: bool | None = None,
) -> tuple:
    response = queryRE(query)
    default_response = (
        "",
        "",
        "",
        query,
        "",
        "",
        "",
        "",
        "",
        project_name,
        str(project_coordinator) if project_coordinator is not None else "",
    )
    if response is None:
        return default_response

    formatted_response = formatReResponse(
        response,
        query,
        project_name,
        project_coordinator,
    )
    if formatted_response is None:
        return default_response
    else:
        return formatted_response


def queryRE(query: str, sleep: float = 0.2) -> dict | None:
    """Send a basic query to the recherche-entreprises.api.gouv.fr Public API. Only top
    result is returned. https://recherche-entreprises.api.gouv.fr/api
    Params:
    - query: the search query to be sent
    - sleep: the number of seconds to sleep before sending the request to avoid rate
        limiting
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
        # raise http_err
        print(http_err)
        return None
    except Exception as err:
        logging.error(
            f"Other error occurred when querying recherche-entreprises.api: {err}"
        )
        # raise err
        print(err)
        return None
    else:
        logging.debug(f"recherche-entreprises.api response: {response}")
        return response.json()


def formatReResponse(
    response: dict,
    label: str,
    project_name: str,
    project_coordinator: bool | None = None,
    use_siege: bool = True,
) -> tuple | None:
    """Format the response from the recherche-entreprises.api.gouv.fr Public API.
    Params:
    - response: the response from the API
    - label: the label from the source dataset used to identify the partner
    - project_name: the name of the project to be used in the response
    - project_coordinator: whether the partner is the project coordinator or not
    - use_siege: prefer siege results over matching etablissements data. Recommend setting
        to True unless query is a precise identifer like a siret
    -----------
    returns the response formatted according to defaultCsvHeader() or None."""
    if response is not None and len(response["results"]) > 0:
        result = response["results"][0]

        # matching etablissements may have more accurate data otherwise use siege
        matching_etablissement = (
            None
            if len(result["matching_etablissements"]) == 0
            else result["matching_etablissements"][0]
        )

        return (
            (
                matching_etablissement["siret"],
                result["siren"],
                result["nom_complet"],
                label,
                result["nature_juridique"],
                matching_etablissement["latitude"],
                matching_etablissement["longitude"],
                matching_etablissement["libelle_commune"],
                matching_etablissement["commune"],
                project_name,
                str(project_coordinator) if project_coordinator is not None else "",
            )
            if not use_siege and matching_etablissement is not None
            else (
                result["siege"]["siret"],
                result["siren"],
                result["nom_complet"],
                label,
                result["nature_juridique"],
                result["siege"]["latitude"],
                result["siege"]["longitude"],
                result["siege"]["libelle_commune"],
                result["siege"]["commune"],
                project_name,
                str(project_coordinator) if project_coordinator is not None else "",
            )
        )

    else:
        logging.warning("No results found for query")
        return None
