from utilities.io_utils import extractSheet, initDefaultLogger


def main():
    PATH = "./src/data/private/260609 VDBI Base Connaissance vdef.xlsx"
    SHEET = "GÉNÉRALITÉ"
    LOG_PATH = "general.csv.log"
    initDefaultLogger(LOG_PATH)
    extractSheet(PATH, SHEET, LOG_PATH)


if __name__ == "__main__":
    main()
