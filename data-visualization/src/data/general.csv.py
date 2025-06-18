from utils import extractSheet, initDefaultLogger


def main():
    PATH = "./src/data/private/250120 PEPR_VBDI_analyse modifiée JYT.xlsx"
    SHEET = "GÉNÉRALITÉ"
    LOG_PATH = "general.csv.log"
    initDefaultLogger(LOG_PATH)
    extractSheet(PATH, SHEET, LOG_PATH)


if __name__ == "__main__":
    main()
