"""Langchain document ingestion and query service backed by pgvector."""

import argparse
import base64
import logging
import os
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Literal

import fitz
import pymupdf4llm
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_postgres import PGVector
from langchain_text_splitters import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    TokenTextSplitter,
)

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    filename="langchain.log",
    level=logging.INFO,
)
log = logging.getLogger(__name__)

_DEFAULT_TEMPLATE = (
    "Use the following pieces of context to answer the question at the end. "
    "If you don't know the answer, just say that you don't know, "
    "don't try to make up an answer. Use three sentences maximum and keep "
    "the answer as concise as possible.\n\n"
    "{context}\n\n"
    "Question: {question}\n"
    "Helpful Answer:"
)


@dataclass
class ChunkingConfig:
    strategy: Literal["recursive", "character", "token"] = "recursive"
    chunk_size: int = 500
    chunk_overlap: int = 50
    separators: list[str] | None = None


class DocumentIngestionService:
    def __init__(
        self,
        connection_string: str,
        collection_name: str = "langchain_documents",
        embedding_model: str = "nomic-embed-text",
        vision_model: str = "llava",
    ) -> None:
        self._embeddings = OllamaEmbeddings(model=embedding_model)
        self._vision_llm = ChatOllama(model=vision_model)
        self._vectorstore = PGVector(
            embeddings=self._embeddings,
            collection_name=collection_name,
            connection=connection_string,
            use_jsonb=True,
        )
        self._collection_name = collection_name
        log.info("DocumentIngestionService ready (collection=%s)", collection_name)

    def _get_splitter(self, config: ChunkingConfig):
        kwargs: dict = {"chunk_size": config.chunk_size, "chunk_overlap": config.chunk_overlap}
        if config.strategy == "recursive":
            if config.separators:
                kwargs["separators"] = config.separators
            return RecursiveCharacterTextSplitter(**kwargs)
        if config.strategy == "character":
            return CharacterTextSplitter(**kwargs)
        if config.strategy == "token":
            return TokenTextSplitter(**kwargs)
        raise ValueError(f"Unknown strategy: {config.strategy!r}")

    def _describe_image(self, image_bytes: bytes) -> str:
        image_b64 = base64.standard_b64encode(image_bytes).decode()
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": (
                        "Describe this image concisely for use in a scientific document "
                        "retrieval system. Focus on the information conveyed, not visual style."
                    ),
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{image_b64}"},
                },
            ]
        )
        return self._vision_llm.invoke([message]).content

    def _extract_elements(self, file_path: str) -> list[Document]:
        documents: list[Document] = []

        # Text and tables extracted as Markdown, one Document per page
        for chunk in pymupdf4llm.to_markdown(file_path, page_chunks=True):
            text = chunk.get("text", "").strip()
            page_num = chunk.get("metadata", {}).get("page", 0)
            if text:
                documents.append(
                    Document(
                        page_content=text,
                        metadata={"page": page_num, "element_type": "text"},
                    )
                )

        # Images described by the vision model
        pdf = fitz.open(file_path)
        for page_num, page in enumerate(pdf):
            for img_info in page.get_images(full=True):
                xref = img_info[0]
                try:
                    base_image = pdf.extract_image(xref)
                    description = self._describe_image(base_image["image"])
                    if description:
                        documents.append(
                            Document(
                                page_content=description,
                                metadata={"page": page_num, "element_type": "image_description"},
                            )
                        )
                except Exception:
                    log.exception("Skipping image xref=%d on page %d", xref, page_num)
        pdf.close()

        log.info("Extracted %d elements from %s", len(documents), file_path)
        return documents

    def _chunk_and_enrich(
        self,
        docs: list[Document],
        config: ChunkingConfig,
        source_path: str,
    ) -> list[Document]:
        chunks = self._get_splitter(config).split_documents(docs)

        doc_id = str(uuid.uuid5(uuid.NAMESPACE_URL, os.path.abspath(source_path)))
        ingested_at = datetime.now(timezone.utc).isoformat()
        total = len(chunks)

        for idx, chunk in enumerate(chunks):
            chunk.metadata.update(
                {
                    "source": source_path,
                    "doc_id": doc_id,
                    "chunk_index": idx,
                    "total_chunks": total,
                    "char_count": len(chunk.page_content),
                    "chunk_size_config": config.chunk_size,
                    "chunk_overlap_config": config.chunk_overlap,
                    "chunking_strategy": config.strategy,
                    "ingested_at": ingested_at,
                }
            )
        return chunks

    def ingest(self, file_path: str, config: ChunkingConfig | None = None) -> dict:
        if config is None:
            config = ChunkingConfig()

        log.info("Ingesting %s (strategy=%s)", file_path, config.strategy)
        elements = self._extract_elements(file_path)
        chunks = self._chunk_and_enrich(elements, config, file_path)
        self._vectorstore.add_documents(chunks)

        by_type: dict[str, int] = {}
        for chunk in chunks:
            t = chunk.metadata.get("element_type", "text")
            by_type[t] = by_type.get(t, 0) + 1

        result = {
            "file": file_path,
            "collection": self._collection_name,
            "chunks": len(chunks),
            "by_type": by_type,
            "strategy": config.strategy,
        }
        log.info("Ingestion complete: %s", result)
        return result


class QueryService:
    def __init__(
        self,
        connection_string: str,
        collection_name: str = "langchain_documents",
        embedding_model: str = "nomic-embed-text",
    ) -> None:
        self._vectorstore = PGVector(
            embeddings=OllamaEmbeddings(model=embedding_model),
            collection_name=collection_name,
            connection=connection_string,
            use_jsonb=True,
        )

    def query(
        self,
        question: str,
        model: str = "llama3:8b",
        template: str = _DEFAULT_TEMPLATE,
    ) -> str:
        if not question.strip():
            return ""

        llm = ChatOllama(model=model)
        retriever = self._vectorstore.as_retriever()

        def _format_docs(docs: list[Document]) -> str:
            return "\n\n".join(d.page_content for d in docs)

        chain = (
            {"context": retriever | _format_docs, "question": RunnablePassthrough()}
            | PromptTemplate(input_variables=["context", "question"], template=template)
            | llm
            | StrOutputParser()
        )
        return chain.invoke(question)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Langchain document ingestion and RAG query service"
    )
    parser.add_argument(
        "--connection-string",
        default=os.getenv("PGVECTOR_CONNECTION_STRING"),
        help="pgvector connection string (or set PGVECTOR_CONNECTION_STRING env var)",
    )
    parser.add_argument("--collection", default="langchain_documents")

    sub = parser.add_subparsers(dest="command", required=True)

    p_ingest = sub.add_parser("ingest", help="Ingest a PDF into the vector store")
    p_ingest.add_argument("-i", "--input", required=True, metavar="FILE")
    p_ingest.add_argument(
        "--strategy", choices=["recursive", "character", "token"], default="recursive"
    )
    p_ingest.add_argument("--chunk-size", type=int, default=500)
    p_ingest.add_argument("--chunk-overlap", type=int, default=50)
    p_ingest.add_argument("--embedding-model", default="nomic-embed-text")
    p_ingest.add_argument(
        "--vision-model", default="llava", help="Ollama vision model for image descriptions"
    )

    p_query = sub.add_parser("query", help="Query the vector store")
    p_query.add_argument("-q", "--question", required=True)
    p_query.add_argument("-m", "--model", default="llama3:8b")
    p_query.add_argument("-t", "--template", help="Custom PromptTemplate string")
    p_query.add_argument("--embedding-model", default="nomic-embed-text")

    args = parser.parse_args()

    if not args.connection_string:
        parser.error("Provide --connection-string or set PGVECTOR_CONNECTION_STRING env var")

    if args.command == "ingest":
        service = DocumentIngestionService(
            connection_string=args.connection_string,
            collection_name=args.collection,
            embedding_model=args.embedding_model,
            vision_model=args.vision_model,
        )
        result = service.ingest(
            args.input,
            ChunkingConfig(
                strategy=args.strategy,
                chunk_size=args.chunk_size,
                chunk_overlap=args.chunk_overlap,
            ),
        )
        print(f"Ingested {result['chunks']} chunks from {result['file']!r}")
        print(f"  Collection : {result['collection']}")
        print(f"  Strategy   : {result['strategy']}")
        print(f"  By type    : {result['by_type']}")

    elif args.command == "query":
        service = QueryService(
            connection_string=args.connection_string,
            collection_name=args.collection,
            embedding_model=args.embedding_model,
        )
        kwargs: dict = {"question": args.question, "model": args.model}
        if args.template:
            kwargs["template"] = args.template
        print(service.query(**kwargs))


if __name__ == "__main__":
    main()
