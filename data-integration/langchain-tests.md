# Langchain document ingestion service <!-- omit in toc -->

## Table of contents

- [Table of contents](#table-of-contents)
- [Architecture](#architecture)
  - [Module structure](#module-structure)
  - [Ingestion flow](#ingestion-flow)
- [Design decisions](#design-decisions)
- [Chunk metadata schema](#chunk-metadata-schema)
- [Chunking strategies](#chunking-strategies)
- [Setup](#setup)
  - [Dependencies](#dependencies)
  - [Services](#services)
  - [Environment](#environment)
- [Usage](#usage)
- [Known limitations and next steps](#known-limitations-and-next-steps)

## Architecture

`langchain-manager.py` is a document ingestion and RAG query service. It extracts text, tables, and image semantics from PDFs and stores them as dense vector embeddings in a persistent pgvector-backed store. Queries retrieve the most relevant chunks and pass them to a local LLM via Ollama.

### Module structure

| Class / function                             | Responsibility                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `ChunkingConfig`                             | Dataclass holding chunking strategy and parameters                                     |
| `DocumentIngestionService`                   | Loads PDF, extracts multimodal elements, chunks, enriches metadata, writes to PGVector |
| `DocumentIngestionService._extract_elements` | pymupdf4llm for text/tables + fitz for images + ChatOllama for image descriptions      |
| `DocumentIngestionService._chunk_and_enrich` | Applies text splitter; stamps all metadata fields on each chunk                        |
| `QueryService`                               | Opens existing PGVector collection; builds LCEL retrieval chain; returns LLM answer    |
| `main`                                       | argparse with `ingest` and `query` subcommands                                         |

### Ingestion flow

```mermaid
sequenceDiagram
  participant Manager as langchain-manager
  participant Ollama
  participant PG@{ "type": "database" } as PGVector

  Manager->>Manager: Convert PDF text (with tables) to markdown
  Manager->>Manager: Capture raw image bytes per page

  loop For each image/diagram
      Manager->>Ollama: Describe image [model: llava]
      Ollama-->>Manager: Textual image description
  end

  Manager->>Manager: Metadata enrichment

  Manager->>Ollama: Embed documents (chunks) [model: nomic-embed-text]
  Ollama-->>Manager: Dense vector embeddings

  Manager->>PG: Add documents (chunks + embeddings)
```

```mermaid
flowchart TD

  PDF_file@{ shape: document } --> pymup("`**pymupdf4llm.to_markdown(page_chunks=True)**
    - Converts each page to structured Markdown
    - Tables preserved as Markdown syntax
    - element_type: 'text'`")
  pymup --> tt[Text + Table chunks]
  pymup --> fitz("`**fitz.open()** # image extraction
    Raw image bytes per page`")
  fitz --> llava("`**ChatOllama (llava)** # vision LLM
    - Textual description of each image/diagram
    - element_type: 'image_description'`")
  tt --> split("Configurable text splitter")
  llava --> split
  split --> enrich("`Metadata enrichment (doc_id, chunk_index, ingested_at, ...)`")
  enrich --> embed("`**OllamaEmbeddings (nomic-embed-text)** # dense vector embeddings`")
  embed --> pgvector("`**PGVector (langchain-postgres)** # persistent vector store
    postgresql+psycopg://...`")

  classDef default text-align:left;
```

## Design decisions

| Concern               | Choice                                                                             | Rationale                                                                                                                                                                                                               | Drawbacks                                                                                                                                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vector store          | `PGVector` (`langchain-postgres`)                                                  | Persistent across sessions; supports JSONB metadata filtering; the `pgvector/pgvector:pg17`. Tested as a docker image in `src/docker-compose.yml` during R2R tests                                                      | Requires a running PostgreSQL instance (vs. fully in-process stores like Chroma). HNSW index tuning is manual — at large scale (millions of vectors) dedicated vector DBs (Qdrant, Weaviate) have more ergonomic ANN configuration. `PGVector` creates a new connection per instantiation; long-running services should add a connection pool. |
| Embeddings            | `OllamaEmbeddings` (`nomic-embed-text`)                                            | Reuse the already-running Ollama instance; `nomic-embed-text` is a strong general-purpose open-source embedding model                                                                                                   | Embedding calls are serialized through Ollama's HTTP API; for large ingestion batches this is slower than batched local HuggingFace inference. The embedding dimension is fixed at collection-creation time — switching models requires re-ingesting all documents. Ollama must be running for both ingestion and query. |
| PDF parsing           | `pymupdf4llm`                                                                      | Converts pages to structured Markdown preserving table layout; no heavy system dependencies (no poppler, no tesseract); PyMuPDF's own `PyMuPDFLoader` in `langchain-community` has a known broken image extraction path ([#34400](https://github.com/langchain-ai/langchain/issues/34400), [#29586](https://github.com/langchain-ai/langchain/issues/29586)) | **No OCR**: scanned/image-based PDFs (no embedded text layer) produce no text output — Unstructured + tesseract would be required for those. Uses MuPDF's rule-based heuristics rather than ML-based region classification (Unstructured `strategy="hi_res"` uses a detectron2-family layout model), so complex or non-standard layouts may be less accurate. |
| Image extraction      | `fitz` (PyMuPDF) directly                                                          | pymupdf4llm is built on PyMuPDF so `fitz` is always available; calling `page.get_images()` + `extract_image()` directly bypasses the broken `PyMuPDFLoader` code path entirely                                          | Extracts all embedded images including decorative elements (logos, icons, rule lines) that add noise without retrieval value. Images repeated across pages (e.g., a header logo) are described once per occurrence with no de-duplication. Unusual color spaces (CMYK, indexed) may need conversion before the vision model can interpret them reliably. |
| Image semantics       | `ChatOllama` (llava)                                                               | Vision-capable local model served through Ollama; avoids any external API call; description is embedded as text, making images searchable in the same vector space as prose                                             | Ingestion is synchronous — each image blocks on a llava inference call, so PDFs with many figures are slow to ingest. Requires ~8 GB VRAM for `llava:7b`; on memory-constrained machines (WSL2) lighter alternatives (`moondream`, `llava-phi3`) are available but less capable. Scientific diagrams and charts may be described superficially without domain-specific prompting. |
| LLM chain             | LCEL (`RunnablePassthrough` + `PromptTemplate` + `ChatOllama` + `StrOutputParser`) | Modern Langchain pattern; composable and easy to extend                                                                                                                                                                 | LCEL's API changed rapidly across Langchain 0.1–0.3; future version upgrades may require chain refactoring. The retriever uses a fixed top-k (default k=4) with no re-ranking, which may miss relevant context in longer documents. |
| Dependency management | `[dependency-groups]` in `pyproject.toml`                                          | Brings langchain deps under uv management alongside the rest of the project                                                                                                                                             | The `langchain` group shares the environment with main deps; version conflicts (e.g., on `pydantic` or `httpx`) surface as `uv sync` failures rather than being isolated. The group significantly increases environment size and should not be installed by users who only need the basic pipelines. |

## Chunk metadata schema

Every chunk stored in the vector store carries this metadata as JSONB:

| Field                  | Type | Description                                                       |
| ---------------------- | ---- | ----------------------------------------------------------------- |
| `source`               | str  | File path passed to `ingest`                                      |
| `doc_id`               | str  | `uuid5(NAMESPACE_URL, abs_path)` — stable per-document identifier |
| `page`                 | int  | 0-indexed page number from pymupdf4llm                            |
| `element_type`         | str  | `"text"` or `"image_description"`                                 |
| `chunk_index`          | int  | Sequential position of this chunk within the document             |
| `total_chunks`         | int  | Total number of chunks produced for this document ingestion       |
| `char_count`           | int  | Actual character length of this chunk's content                   |
| `chunk_size_config`    | int  | `ChunkingConfig.chunk_size` used during ingestion                 |
| `chunk_overlap_config` | int  | `ChunkingConfig.chunk_overlap` used during ingestion              |
| `chunking_strategy`    | str  | `"recursive"`, `"character"`, or `"token"`                        |
| `ingested_at`          | str  | ISO 8601 UTC timestamp of the ingestion run                       |

The `doc_id` is derived deterministically from the absolute file path, so multiple ingestion runs of the same file produce the same `doc_id`, enabling future deduplication logic.

## Chunking strategies

| Strategy              | Class                            | Best for                                                                                              |
| --------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `recursive` (default) | `RecursiveCharacterTextSplitter` | General prose and mixed content; tries to split on paragraphs → sentences → words before hard-cutting |
| `character`           | `CharacterTextSplitter`          | Content with consistent delimiter structure; splits on a single separator                             |
| `token`               | `TokenTextSplitter`              | Token-budget-sensitive use cases (e.g. ensuring chunks fit in a context window); requires `tiktoken`  |

Recommended starting parameters for scientific PDFs: `--chunk-size 800 --chunk-overlap 100`. The default (500/50) is conservative and produces more, smaller chunks.

## Setup

### Dependencies

```bash
uv sync --group langchain
```

This installs `langchain-community`, `langchain-ollama`, `langchain-postgres`, `pymupdf4llm`, `psycopg[binary]`, `python-dotenv`, and `tiktoken`.

### Services

1. **pgvector** (PostgreSQL with pgvector extension):

   ```bash
   docker compose -f src/docker-compose.yml up -d vector_store
   ```

   The service uses `pgvector/pgvector:pg17` and persists data in a named Docker volume.

2. **Ollama**:

   ```bash
   docker compose -f src/docker-compose.yml up -d ollama
   docker exec -it ollama ollama pull nomic-embed-text   # embedding model
   docker exec -it ollama ollama pull llava              # vision model for image descriptions
   docker exec -it ollama ollama pull llama3:8b          # LLM for query responses
   ```

### Environment

Create a `.env` file at the repo root (it is gitignored):

```bash
POSTGRES_PASSWORD=your_secure_password
PGVECTOR_CONNECTION_STRING=postgresql+psycopg://user:your_secure_password@localhost:5432/vector_store
```

The `POSTGRES_PASSWORD` value must match what is used in `docker-compose.yml`. `PGVECTOR_CONNECTION_STRING` is loaded automatically by `python-dotenv`.

## Usage

```bash
# Ingest a PDF with default settings
python src/langchain-manager.py ingest -i test-data/input/document.pdf

# Ingest with custom chunking
python src/langchain-manager.py ingest -i test-data/input/document.pdf \
    --strategy recursive \
    --chunk-size 800 \
    --chunk-overlap 100

# Use a different vision model (must be available in Ollama)
python src/langchain-manager.py ingest -i test-data/input/document.pdf \
    --vision-model llava-phi3

# Ingest into a named collection (default: langchain_documents)
python src/langchain-manager.py ingest -i test-data/input/document.pdf \
    --collection villegarden

# Query
python src/langchain-manager.py query -q "What funding mechanism is described?"
python src/langchain-manager.py query -q "Summarize the methodology" -m llama3:8b

# Query a specific collection
python src/langchain-manager.py query -q "What are the results?" --collection villegarden

# Override connection string at runtime
python src/langchain-manager.py --connection-string "postgresql+psycopg://..." ingest -i doc.pdf
```

## Known limitations and next steps

- **Duplicate ingestion**: re-ingesting the same file appends new chunks rather than replacing old ones. A deduplication step using `doc_id` and `PGVector.delete` could prevent this.
- **Image descriptions are single-call**: large or complex diagrams may benefit from multi-step prompting (e.g., first classify the image type, then describe it with a targeted prompt).
- **Table element type**: pymupdf4llm embeds tables within page-level Markdown text; they are not currently split into separate `"table"` element chunks. A Markdown parser could separate table blocks for finer-grained `element_type` tagging.
- **Vision model VRAM**: `llava:7b` requires ~8 GB VRAM. On memory-constrained machines (WSL2), `moondream` or `llava-phi3` are lighter alternatives.
- **`token` strategy requires `tiktoken`**: already in the `langchain` dependency group; the default tokenizer targets `cl100k_base` (GPT-4 family) which may not match the actual Ollama model's vocabulary.
