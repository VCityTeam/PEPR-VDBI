# RAGFlow tests <!-- omit in toc -->

Tests discontinued as RAGFlow issue documentation is often in chinese. Reverting to Ollama+Langchain for RAG testing.

- [1. Dependencies](#1-dependencies)

## 1. Dependencies

Follow the [RAGFlow quickstart instructions](https://ragflow.io/docs/) to install RAGFlow version `0.24.0` (the latest release as of this writing).

Additionally follow the RAGFlow instructions for [deploying local LLMs](https://ragflow.io/docs/deploy_local_llm) with **Ollama**.
This includes:

1. Running Ollama as a docker container accessible at `http://host.docker.internal:11434` from other docker containers
2. Using models `bge-m3` and `llama3.2` for embedding and chat respectively

> [!IMPORTANT]
> The `max_tokens` parameter is not included in the default configuration for these models in the RAGFlow documentation. You must include it and set it to `8192` for `bge-m3` and `131072` for `llama3.2`.

> [!WARNING]
> There is a known issue with RAGFlow version `0.24.0` regarding the Ollama chat API.
>
> Add the following line to your `docker/.env` file as stated in [this comment](https://github.com/infiniflow/ragflow/issues/13395#issuecomment-4003029045):
>
> ```bash
> LLM_TIMEOUT_SECONDS=600
> ```
