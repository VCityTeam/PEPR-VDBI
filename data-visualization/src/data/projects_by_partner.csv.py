from utilities.utils import extractSheet, initDefaultLogger


def main():

    LOG_PATH = "projects_by_partner.csv.log"
    initDefaultLogger(LOG_PATH)
    extractSheet(
        "./src/data/private/partenaires_aap2023.xlsx",
        "projets par partenaire",
        LOG_PATH,
    )


if __name__ == "__main__":
    main()
