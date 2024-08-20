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


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    filename="langchain.log",
    level=logging.DEBUG,
    # level=logging.INFO,
)

# load the pdf and split it into chunks
loader = UnstructuredPDFLoader(
    "test-data/_VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI.pdf"
)
data = loader.load()

# logging.debug(data)

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)


logging.debug(all_splits)

with SuppressStdout():
    vectorstore = Chroma.from_documents(
        documents=all_splits, embedding=GPT4AllEmbeddings()  # type: ignore
    )

while True:
    query = input("\nQuery: ")
    if query == "exit":
        break
    if query.strip() == "":
        continue

    # Prompt
    template = """Use the following pieces of context to answer the question at
    the end. If you don't know the answer, just say that you don't know, don't
    try to make up an answer. Use three sentences maximum and keep the answer as
    concise as possible.
    {context}
    Question: {question}
    Helpful Answer:"""
    QA_CHAIN_PROMPT = PromptTemplate(
        input_variables=["context", "question"],
        template=template,
    )

    llm = Ollama(
        model="llama3:8b",
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    )  # type: ignore
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=vectorstore.as_retriever(),
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
    )

    result = qa_chain({"query": query})

    logging.debug(result)
