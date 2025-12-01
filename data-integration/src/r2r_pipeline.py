import argparse
from r2r import R2RClient


def main():
    parser = argparse.ArgumentParser(description="Ingest a file into the R2R service")
    parser.add_argument(
        "input_file",
        help="Define file to ingest",
    )

    args = parser.parse_args()
    client = R2RClient()
    client.set_base_url("http://localhost:7272")
    client.documents.create(file_path=args.input_file, ingestion_mode="fast")


if __name__ == "__main__":
    main()
