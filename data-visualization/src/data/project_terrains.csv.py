import logging
import sys
import csv
import time

import requests


def main():

    logging.basicConfig(
        format="%(asctime)s %(levelname)-8s %(message)s",
        filename="terrain.log",
        level=logging.DEBUG,
        # level=logging.INFO
    )
    logging.info(
        r"""
 ______     ______    ______     ______     ______
/\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
\ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
 \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
  \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/"""
    )

    PATH = "./src/data/private/partenaires_aap2023.csv"
    partner_data = [["project", "terrain", "latitude", "longitude"]]

    # get partner data
    phase1_partner_data = []
    with open(PATH, mode="r") as file:
        reader = csv.reader(file)
        for row in reader:
            phase1_partner_data += [row]
    # logging.debug(f"phase1_partner_data: {phase1_partner_data}")

    # query Nominatim api using partner names and aggregate data
    for row in phase1_partner_data[1:]:
        project_name = row[0].strip()
        if project_name == "":
            logging.warning(f"project_name not found in row: {row}")
            continue

        # get terrains
        terrain = row[5].strip()
        if terrain == "":
            logging.warning(f"terrain not found in row: {row}")
            continue

        terrain_geodata = queryNominatim(terrain)

        if terrain_geodata is None:
            logging.warning(f"data not found for terrain: {terrain}")
            continue

        partner_data += [
            [
                project_name,
                terrain,
                terrain_geodata[0]["lat"] if terrain_geodata else None,
                terrain_geodata[0]["lon"] if terrain_geodata else None,
            ]
        ]

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


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
    - referer: the referer header to be sent with the request, default is https://pepr-vdbi.fr/
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


if __name__ == "__main__":
    main()
