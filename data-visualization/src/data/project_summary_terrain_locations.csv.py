import logging
import sys
import csv
from utils import initDefaultLogger
from geopy.geocoders import Nominatim


def main():

    initDefaultLogger("terrain_scales.log")

    PATH = "./src/data/private/project_summary_terrains.csv"
    partner_data = [
        [
            # "project",
            "terrain",
            "lat",
            "lon",
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
        logging.info(f"processing terrain: {terrain}")

        # get terrains
        terrain = terrain.strip()
        if terrain == "":
            logging.warning(f"terrain not found in terrain: {terrain}")
            continue

        terrain_geodata = geolocator.geocode(terrain)
        logging.debug(f"terrain_geodata from nominatim: {terrain_geodata}")

        if terrain_geodata is None:
            logging.warning(f"data not found for terrain: {terrain}")
            continue

        partner_data += [
            [
                # project,
                terrain,
                # terrain_geodata[0]["name"] if terrain_geodata else terrain,
                terrain_geodata.latitude if terrain_geodata else None,  # type: ignore
                terrain_geodata.longitude if terrain_geodata else None,  # type: ignore
            ]
        ]

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
