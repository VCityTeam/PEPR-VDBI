# import logging
import pandas as pd


def main():

    # WORKBOOK_PATH = "./data/PEPR_VBDI_analyse_210524_15h24_GGE.xlsx"
    WORKBOOK_PATH = "./data/241021 PEPR_VBDI_analyse modifiée JYT.xlsx"
    WORKBOOK_SHEET = "Liste chercheurs"
    SHEET_COLUMNS = "A,I"

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
    grouped = researcher_data.groupby("NOM et Prénom").first()
    print(grouped.to_csv())


if __name__ == "__main__":
    main()
