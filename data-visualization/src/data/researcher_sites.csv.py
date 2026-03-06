import pandas as pd
from utilities.io_utils import initDefaultLogger
from geopy.geocoders import Nominatim
from time import sleep


def main():

    # WORKBOOK_PATH = "./src/data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_PATH = (
        "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
    )
    WORKBOOK_SHEET = "Liste chercheurs"
    # SHEET_COLUMNS = "G"  # this is the correct column but it isn't working??I
    SHEET_COLUMNS = "G"

    logging = initDefaultLogger("researcher_sites.log")

    logging.info("get researcher sites")
    researcher_data = pd.read_excel(
        WORKBOOK_PATH, WORKBOOK_SHEET, usecols=SHEET_COLUMNS
    )
    logging.debug(f"researcher_data:\n{researcher_data}")

    # remove duplicates
    grouped_sites = researcher_data.groupby("Sites").first()

    # geocode sites
    geolocator = Nominatim(
        user_agent="https://github.com/VCityTeam/PEPR-VDBI",
        timeout=10,  # type: ignore
    )

    for site in grouped_sites.index:
        if site is None or site == "":
            continue

        logging.info(f"geocoding site: {site}")
        location = geolocator.geocode(site)
        logging.debug(f"location: {location}")

        if location:
            grouped_sites.at[site, "latitude"] = location.latitude  # type: ignore
            grouped_sites.at[site, "longitude"] = location.longitude  # type: ignore
            grouped_sites.at[site, "raw_data"] = location.raw  # type: ignore
        else:
            logging.warning(f"Could not geocode site: {site}")
            grouped_sites.at[site, "latitude"] = None
            grouped_sites.at[site, "longitude"] = None
            grouped_sites.at[site, "raw_data"] = None
        sleep(1)

    # print(grouped_sites)
    logging.info("writing out")
    print(grouped_sites.to_csv())


if __name__ == "__main__":
    main()
