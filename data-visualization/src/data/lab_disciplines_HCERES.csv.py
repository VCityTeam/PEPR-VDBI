from utilities.utils import extractSheet, initDefaultLogger


def main():

    LOG_PATH = "lab_disciplines_HCERES.csv.log"
    initDefaultLogger(LOG_PATH)
    extractSheet(
        "./src/data/private/partenaires_aap2023.xlsx",
        "labos par discipline HCERES",
        LOG_PATH,
    )


if __name__ == "__main__":
    main()
