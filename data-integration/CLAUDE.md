# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Research experiments for AI-based automated data integration: extracting structured data from unstructured documents (PDFs, audio) using local LLMs. All test data used is GDPR-sensitive and not provided in the repository.

## Setup

Python project managed with [uv](https://docs.astral.sh/uv/). To install dependencies and activate the virtual environment:

```bash
uv sync
source ./venv/bin/activate
```

The `langchain-manager.py` script has separate dependencies that are not yet integrated into the uv lock file and must be installed manually:

```bash
pip install -r src/langchain-requirements.txt
```

Langchain also requires `sqlite3 >= 3.35.0` for the Chroma vector store dependency.

## Running scripts

All scripts are run from the repo root and expect paths relative to it.

**PDF extraction:**

```bash
python src/pypdf_pipeline.py <input.pdf> <output.txt>
python src/pypdf_pipeline.py -h  # see all options
```

**Ollama prompt pipeline:**

```bash
ollama serve &
python src/ollama_pipeline.py <input.txt> <output.txt> "<prompt>"
python src/ollama_pipeline.py -h  # see all options
# For the Pagoda LIRIS remote Ollama service, pass -s -u <url> -t <JWT token>
```

**Workflow (multi-prompt pipeline over PDFs):**

```bash
python src/workflow.py test-data/configs/workflow_0_config.json
python src/workflow.py -h  # see all options
# Logs written to workflow-test.log by default
```

**Langchain RAG (interactive REPL):**

```bash
ollama serve &
python src/langchain-manager.py -i <input.pdf>
# Type "exit" to quit
```

## Architecture

The codebase is a collection of standalone experiment scripts in `src/`, each testing a different approach to document-to-structured-data extraction. Scripts are not a unified application — they are meant to be run individually.

**Pipeline scripts (`src/`):**

- `pypdf_pipeline.py` — converts PDFs to plain text page-by-page using pypdf
- `ollama_pipeline.py` — sends a single prompt+text to a local (or remote) Ollama instance; auto-pulls or creates models on `404` errors; supports custom Ollama modelfiles
- `workflow.py` — orchestrates multi-step pipelines: reads a JSON or CSV config, converts PDFs to JSON via `pypdf_pipeline`, then sends each configured prompt via `ollama_pipeline` or queries an R2R RAG system; tracks CO₂ emissions with codecarbon
- `langchain-manager.py` — RAG using Langchain + Chroma vector store + GPT4All embeddings + Ollama LLM; interactive REPL for querying ingested PDFs
- `r2r_pipeline.py` — thin wrapper around the R2R client for document ingestion (R2R is now deprecated in favor of RAGFlow)
- `litellm_pipeline.py` — minimal LiteLLM smoke test
- `whisper_pipeline.py` — batch audio transcription helper for use inside the `openai-whisper-docker` repository
- `utils.py` — two helpers: `readFile` and `writeToFile`, both defaulting to UTF-8

**Config files (`test-data/configs/`):**
JSON workflow configs follow this schema:

```json
{
  "output": "<output-dir>",
  "inputs": { "<pdf-path>": "<page-ranges>" },
  "prompts": [
    {
      "prompt": "...",
      "model": "...",
      "modelfile": "...",
      "format": "json",
      "run": true
    }
  ]
}
```

Page ranges are comma-separated strings like `"1, 2, 5-7"`. CSV configs use the header `input,page_ranges,output,prompt,model,format`.

**Ollama modelfiles (`test-data/modelfiles/`):**
Custom modelfiles for llama3 that vary `temperature`, `top_k`, and `top_p` to test JSON generation quality. Naming convention: `llama3-json1-<creativity>-<diversity>` where creativity is `creative/default/unoriginal` and diversity is `default/diverse/focused`.

## External service dependencies

- **Ollama** — must be running locally (`ollama serve`) before using most scripts. Default model is `mistral:7b`; workflow configs specify models per-prompt.
- **RAGFlow** — Docker-based RAG system. See `ragflow-tests.md` for setup. Uses `bge-m3` for embeddings and `llama3.2` for chat via Ollama. Requires `LLM_TIMEOUT_SECONDS=600` in `docker/.env`.
- **Pagoda LIRIS** — Remote Ollama service at `https://ollama-ui.pagoda.liris.cnrs.fr/ollama`; requires a JWT bearer token and responses must be streamed (`-s` flag).
