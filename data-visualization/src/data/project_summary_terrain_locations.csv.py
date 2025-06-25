import logging
import sys
import csv
from utils import initDefaultLogger
from nominatim_utils import queryNominatim


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
    for terrain in terrains:
        logging.info(f"processing terrain: {terrain}")

        # get terrains
        terrain = terrain.strip()
        if terrain == "":
            logging.warning(f"terrain not found in terrain: {terrain}")
            continue

        terrain_geodata = queryNominatim(terrain)

        if terrain_geodata is None:
            logging.warning(f"data not found for terrain: {terrain}")
            continue

        partner_data += [
            [
                # project,
                terrain,
                # terrain_geodata[0]["name"] if terrain_geodata else terrain,
                terrain_geodata[0]["lat"] if terrain_geodata else None,
                terrain_geodata[0]["lon"] if terrain_geodata else None,
            ]
        ]

    logging.info("Writing data to stdout")
    writer = csv.writer(sys.stdout)
    writer.writerows(partner_data)


if __name__ == "__main__":
    main()
