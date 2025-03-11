from langchain.document_loaders import UnstructuredPDFLoader
from langchain.vectorstores import Chroma
from langchain.embeddings import GPT4AllEmbeddings
from langchain import PromptTemplate
from langchain.llms import Ollama
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
import sys
import os
import logging
import argparse


def main():
    parser = argparse.ArgumentParser(
        description="""Prompt a local Ollama GPT service to query a pdf file"""
    )
    parser.add_argument("-i", "--input_file", help="Specify the input pdf file")
    parser.add_argument(
        "-m",
        "--model",
        default="llama3:8b",
        help="Specify the Ollama llm to use",
    )
    parser.add_argument(
        "-t", "--template", help="Specify the query template to use"
    )
    args = parser.parse_args()

    lm = LangchainManger(
        # "test-data/input/_VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI.pdf"
        # "test-data/input/_VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI_tables.pdf"
        args.input_file
    )
    while True:
        query = input("Query: ")
        if query == "exit":
            break
        print(lm.query(query, template=args.template))


class SuppressStdout:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, "w")
        sys.stderr = open(os.devnull, "w")

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr


class LangchainManger:
    __slots__ = ["all_splits"]

    def __init__(self, document):
        logging.basicConfig(
            format="%(asctime)s %(levelname)-8s %(message)s",
            filename="langchain.log",
            level=logging.DEBUG,
            # level=logging.INFO,
        )

        logging.info(
            r"""
             ______     ______    ______     ______     ______
            /\  ___\   /\__  _\  /\  __ \   /\  == \   /\__  _\
            \ \___  \  \/_/\ \/  \ \  __ \  \ \  __<   \/_/\ \/
             \/\_____\    \ \_\   \ \_\ \_\  \ \_\ \_\    \ \_\
              \/_____/     \/_/    \/_/\/_/   \/_/ /_/     \/_/
            
            """
        )

        # load the pdf and split it into chunks
        loader = UnstructuredPDFLoader(document)
        data = loader.load()

        logging.info("Data loaded")
        logging.debug(data)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=0
        )
        self.all_splits = text_splitter.split_documents(data)

        logging.info("Data split")
        logging.debug(self.all_splits)

    def query(
        self,
        query,
        model="llama3:8b",
        template="""Use the following pieces of context to answer the question at
            the end. If you don't know the answer, just say that you don't know,
            don't try to make up an answer. Use three sentences maximum and keep the
            answer as concise as possible.
            {context}
            Question: {question}
            Helpful Answer:
            """,
    ):
        if query.strip() == "":
            return None

        with SuppressStdout():
            vectorstore = Chroma.from_documents(
                documents=self.all_splits,
                embedding=GPT4AllEmbeddings(),  # type: ignore
            )

        # Prompt
        QA_CHAIN_PROMPT = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )

        llm = Ollama(
            model=model,
            callback_manager=CallbackManager(
                [StreamingStdOutCallbackHandler()]
            ),
        )  # type: ignore
        qa_chain = RetrievalQA.from_chain_type(
            llm,
            retriever=vectorstore.as_retriever(),
            chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
        )

        result = qa_chain({"query": query})

        logging.debug(result)
        return result


if __name__ == "__main__":
    main()
