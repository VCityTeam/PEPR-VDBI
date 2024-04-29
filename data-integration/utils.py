def readFile(file_path: str, encoding="UTF-8") -> str:
    text = ""
    with open(file_path, 'r', encoding=encoding) as file:
        text = file.read()
    return text


def writeToFile(output_path: str, text: str) -> None:
    with open(output_path, 'w', encoding="UTF-8") as file:
        file.write(text)
