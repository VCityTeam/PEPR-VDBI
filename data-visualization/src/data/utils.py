import logging
import pandas as pd


def initDefaultLogger(
    filename: str = "default.log",
    start=True,
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)-8s %(message)s",
    **kwargs,
):
    logging.basicConfig(filename=filename, level=level, format=format, **kwargs)
    if start:
        startLog()
    return logging


def startLog():
    logging.info(
        r"""
 ______     ______    ______     ______     ______
/\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
\ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
 \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
  \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/"""
    )


def extractSheet(workbook: str, sheet: str, log_path: str = "extractSheet.log") -> None:
    """
    Extracts data from a specified sheet in an Excel workbook
    and outputs it as CSV to stdout.
    Args:
    - workbook (str): Path to the Excel workbook file.
    - sheet (str): Name of the sheet to extract from the workbook.
    - log_path (str): Path to the log file
    """
    logging = initDefaultLogger(log_path, False)
    logging.info(f"Reading from {sheet} in {workbook}")
    data = pd.read_excel(workbook, sheet)
    logging.info("Writing data to stdout")
    print(data.to_csv(header=True, index=False))
