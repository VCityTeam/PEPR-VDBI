import pandas as pd
from utils import initDefaultLogger


def main():

    # WORKBOOK_PATH = "./src/data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_PATH = (
        "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
    )
    WORKBOOK_SHEET = "Liste chercheurs"
    SHEET_COLUMNS = "I"

    logging = initDefaultLogger("researcher_sites.log")

    logging.info("get researcher sites")
    researcher_data = pd.read_excel(
        WORKBOOK_PATH, WORKBOOK_SHEET, usecols=SHEET_COLUMNS
    )
    # print(researcher_data)

    # remove duplicates
    grouped = researcher_data.groupby("Sites").first()
    # print(grouped)
    logging.info("writing out")
    print(grouped.to_csv())


if __name__ == "__main__":
    main()
