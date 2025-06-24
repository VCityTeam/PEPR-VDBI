import logging
import time
import requests


def queryNominatim(
    query: str,
    format: str = "json",
    referer: str = "https://pepr-vdbi.fr/",
    sleep: float = 1,
) -> dict | None:
    """Send a basic geocoding query to the https://nominatim.openstreetmap.org/search API.
    Params:
    - query: the search query to be sent
    - format: the format of the response, default is json
    - referer: the referer header to be sent with the request, default is
        https://pepr-vdbi.fr/
    - sleep: the number of seconds to sleep before sending the request to avoid rate
        limiting
    -----------
    returns a dictionary of the request response if successful or None."""
    logging.debug(f"Querying nominatim api with query: {query}")
    time.sleep(sleep)
    try:
        response = requests.get(
            url=(
                f"https://nominatim.openstreetmap.org/search?q={query}&format={format}"
            ),
            headers={"Accept": "application/json", "Referer": referer},
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error occurred when querying nominatim api: {http_err}")
        # raise http_err
        print(http_err)
        return None
    except Exception as err:
        logging.error(f"Other error occurred when querying nominatim api: {err}")
        # raise err
        print(err)
        return None
    else:
        logging.debug(f"nominatim api response: {response}")
        return response.json()
