import logging
import sys
import csv
import json
from utilities.utils import initDefaultLogger
from geopy.geocoders import Nominatim


def main():

    initDefaultLogger("terrain_scales.log")

    PATH = "./src/data/private/project_summary_terrains.csv"
    partner_data = [
        [
            # "project",
            "terrain",
            "latitude",
            "longitude",
            "raw_data",
        ]
    ]

    # get partner data
    terrains = set()
    with open(PATH, mode="r") as file:
        reader = csv.reader(file)
        reader.__next__()  # skip header
        for row in reader:
            terrains.add(row[1])

    # query Nominatim api using partner names and aggregate data
    geolocator = Nominatim(
        user_agent="https://github.com/VCityTeam/PEPR-VDBI", timeout=10  # type: ignore
    )
    for terrain in terrains:
        logging.debug(f"processing terrain: {terrain}")

        # get terrains
        terrain = terrain.strip()
        if terrain == "":
            logging.warning(f"terrain not found in terrain: {terrain}")
            continue

        response = geolocator.geocode(terrain, addressdetails=True)

        if response is None:
            logging.warning(f"data not found for terrain: {terrain}")
            continue

        logging.debug(f"response from nominatim: {response.raw}")  # type: ignore
        partner_data.append(
            [
                # project,
                terrain,
                response.latitude,  # type: ignore
                response.longitude,  # type: ignore
                json.dumps(response.raw),  # type: ignore
            ]
        )

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
