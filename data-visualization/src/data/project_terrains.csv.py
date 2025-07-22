import logging
import sys
import csv
from utils import initDefaultLogger
from geopy.geocoders import Nominatim


def main():

    initDefaultLogger("terrains.log")

    PATH = "./src/data/private/partenaires_aap2023.csv"
    partner_data = [["project", "terrain", "latitude", "longitude"]]

    # get partner data
    phase1_partner_data = []
    with open(PATH, mode="r") as file:
        reader = csv.reader(file)
        reader.__next__()  # skip header
        for row in reader:
            phase1_partner_data += [row]
    # logging.debug(f"phase1_partner_data: {phase1_partner_data}")

    # query Nominatim api using partner names and aggregate data
    geolocator = Nominatim(
        user_agent="https://github.com/VCityTeam/PEPR-VDBI", timeout=10  # type: ignore
    )
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

        terrain_geodata = geolocator.geocode(terrain)
        logging.debug(f"terrain_geodata from nominatim: {terrain_geodata}")

        if terrain_geodata is None:
            logging.warning(f"data not found for terrain: {terrain}")
            continue

        partner_data += [
            [
                project_name,
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
