# import logging
import pandas as pd


def main():

    # WORKBOOK_PATH = "./data/private/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_PATH = "./data/private/250120 PEPR_VBDI_analyse modifiée JYT_financed_redacted.xlsx"
    WORKBOOK_SHEET = "Liste chercheurs"
    SHEET_COLUMNS = "I"

    # logging.basicConfig(
    #     format="%(asctime)s %(levelname)-8s %(message)s",
    #     filename="orcids.log",
    #     level=logging.DEBUG,
    #     # level=logging.INFO
    # )
    # logging.info("          __                 __   ")
    # logging.info("  _______/  |______ ________/  |_ ")
    # logging.info(" /  ___/\\   __\\__  \\\\_  __ \\   __\\")
    # logging.info(" \\___ \\  |  |  / __ \\|  | \\/|  |  ")
    # logging.info("/____  > |__| (____  /__|   |__|  ")
    # logging.info("     \\/            \\/             ")

    # get researcher sites
    researcher_data = pd.read_excel(
        WORKBOOK_PATH, WORKBOOK_SHEET, usecols=SHEET_COLUMNS
    )
    # print(researcher_data)

    # remove duplicates
    grouped = researcher_data.groupby("Sites").first()
    # print(grouped)
    print(grouped.to_csv())


if __name__ == "__main__":
    main()
