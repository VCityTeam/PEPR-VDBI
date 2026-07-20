"""Langchain document ingestion and query service backed by Qdrant."""

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
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    TokenTextSplitter,
)
from qdrant_client import QdrantClient

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    filename="langchain.log",
    level=logging.DEBUG,
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


class LangchainRagService:

    def __init__(
        self,
        qdrant_url: str,
        ollama_url: str,
        ollama_token: str,
        collection_name: str = "langchain_documents",
        embedding_model: str = "qwen3-embedding:0.6b",
        vision_model: str = "llava",
    ) -> None:
        self._client_kwargs = {
            "trust_env": False,
            "headers": {"Authorization": f"Bearer {ollama_token}"},
        }

        self._embeddings = OllamaEmbeddings(
            model=embedding_model,
            base_url=ollama_url,
            client_kwargs=self._client_kwargs,
        )

        self._vision_llm = ChatOllama(
            model=vision_model,
            base_url=ollama_url,
            client_kwargs=self._client_kwargs,
        )

        self._vectorstore = QdrantVectorStore.construct_instance(
            embedding=self._embeddings,
            force_recreate=False,
            client_options={
                "url": qdrant_url,
                "trust_env": False,
            },
        )

        self._collection_name = collection_name

        log.info("LangchainRagService ready (collection=%s)", collection_name)

    def _get_splitter(self, config: ChunkingConfig):
        kwargs: dict = {
            "chunk_size": config.chunk_size,
            "chunk_overlap": config.chunk_overlap,
        }
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

        # TODO: Test image description
        # # Images described by the vision model
        # pdf = fitz.open(file_path)
        # for page_num, page in enumerate(pdf):
        #     for img_info in page.get_images(full=True):
        #         xref = img_info[0]
        #         try:
        #             base_image = pdf.extract_image(xref)
        #             description = self._describe_image(base_image["image"])
        #             if description:
        #                 documents.append(
        #                     Document(
        #                         page_content=description,
        #                         metadata={"page": page_num, "element_type": "image_description"},
        #                     )
        #                 )
        #         except Exception:
        #             log.exception("Skipping image xref=%d on page %d", xref, page_num)
        # pdf.close()

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
        log.info("%d chunks created", len(chunks))
        return chunks

    def ingest(self, file_path: str, config: ChunkingConfig | None = None) -> dict:
        if config is None:
            config = ChunkingConfig()

        log.info("Ingesting %s (strategy=%s)", file_path, config.strategy)
        elements = self._extract_elements(file_path)
        chunks = self._chunk_and_enrich(elements, config, file_path)

        self._vectorstore.from_documents(
            documents=chunks,
            collection_name=self._collection_name,
            embedding=self._embeddings,
            force_recreate=True,
            trust_env=False,
        )

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

    def query(
        self,
        question: str,
        model: str = "qwen3.5:0.8b",
        template: str = _DEFAULT_TEMPLATE,
    ) -> str:
        if not question.strip():
            return ""

        llm = ChatOllama(model=model, client_kwargs=self._client_kwargs)
        retriever = self._vectorstore.as_retriever()

        def _format_docs(docs: list[Document]) -> str:
            return "\n\n".join(d.page_content for d in docs)

        docs = retriever.invoke(question)
        log.debug("Retrieved %d documents: %s", len(docs), docs)

        # return docs

        context = _format_docs(docs)
        log.debug("Formatted context:\n%s", context)

        prompt = PromptTemplate(
            input_variables=["context", "question"], template=template
        ).invoke({"context": context, "question": question})
        log.debug("Rendered prompt:\n%s", prompt.text)

        message = llm.invoke(prompt)
        log.debug("LLM response: %s", message)

        answer = StrOutputParser().invoke(message)
        log.debug("Parsed answer: %s", answer)

        return answer


def main() -> None:

    log.info(
        r"""
         ______     ______   ______     ______     ______  
        /\  ___\   /\__  _\ /\  __ \   /\  == \   /\__  _\ 
        \ \___  \  \/_/\ \/ \ \  __ \  \ \  __<   \/_/\ \/ 
         \/\_____\    \ \_\  \ \_\ \_\  \ \_\ \_\    \ \_\ 
          \/_____/     \/_/   \/_/\/_/   \/_/ /_/     \/_/                                                    
        """
    )

    parser = argparse.ArgumentParser(
        description="Langchain document ingestion and RAG query service"
    )
    parser.add_argument(
        "--qdrant-url",
        default=os.getenv("QDRANT_URL", "http://localhost:6333"),
        help="Qdrant service URL (or set QDRANT_URL env var; default: http://localhost:6333)",
    )
    parser.add_argument(
        "--ollama-url",
        default=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        help="Ollama service URL (or set OLLAMA_URL env var; default: http://localhost:11434)",
    )
    parser.add_argument(
        "--ollama-token",
        default=os.getenv("OLLAMA_TOKEN", ""),
        help="Ollama service token (or set OLLAMA_TOKEN env var)",
    )
    parser.add_argument("--collection", default="langchain_documents")

    sub = parser.add_subparsers(dest="command", required=True)

    ingest_parser = sub.add_parser("ingest", help="Ingest a PDF into the vector store")
    ingest_parser.add_argument("-i", "--input", required=True, metavar="FILE")
    ingest_parser.add_argument(
        "--strategy", choices=["recursive", "character", "token"], default="recursive"
    )
    ingest_parser.add_argument("--chunk-size", type=int, default=500)
    ingest_parser.add_argument("--chunk-overlap", type=int, default=50)
    ingest_parser.add_argument("--embedding-model", default="qwen3-embedding:0.6b")
    ingest_parser.add_argument(
        "--vision-model",
        default="llava",
        help="Ollama vision model for image descriptions",
    )

    query_parser = sub.add_parser("query", help="Query the vector store")
    query_parser.add_argument("-q", "--question", required=True)
    query_parser.add_argument("-m", "--model", default="qwen3.5:0.8b")
    query_parser.add_argument("-t", "--template", help="Custom PromptTemplate string")
    query_parser.add_argument("--embedding-model", default="qwen3-embedding:0.6b")

    args = parser.parse_args()

    if args.command == "ingest":
        service = LangchainRagService(
            qdrant_url=args.qdrant_url,
            ollama_url=args.ollama_url,
            ollama_token=args.ollama_token,
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
        service = LangchainRagService(
            qdrant_url=args.qdrant_url,
            ollama_url=args.ollama_url,
            ollama_token=args.ollama_token,
            collection_name=args.collection,
            embedding_model=args.embedding_model,
        )
        kwargs: dict = {"question": args.question, "model": args.model}
        if args.template:
            kwargs["template"] = args.template
        print(service.query(**kwargs))

        # if args.template:
        #     print(
        #         service.query(
        #             question=args.question, model=args.model, template=args.template
        #         )
        #     )
        # else:
        #     print(service.query(question=args.question, model=args.model))


if __name__ == "__main__":
    main()
