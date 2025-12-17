from utilities.utils import extractSheet, initDefaultLogger


def main():

    LOG_PATH = "projects.csv.log"
    initDefaultLogger(LOG_PATH)
    extractSheet(
        "./src/data/private/partenaires_aap2023.xlsx",
        "partenaires aap 2023",
        LOG_PATH,
    )


if __name__ == "__main__":
    main()
