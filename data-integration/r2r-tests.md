# **R2R tests** <!-- omit in toc -->
Non R2R specific tests are located [here](./README.md).

**Table of contents**
- [2.3.2 Test R2R Light](#232-test-r2r-light)
  - [Preliminaries](#preliminaries)
  - [Install](#install)
    - [Install dependencies](#install-dependencies)
    - [Install and setup R2R](#install-and-setup-r2r)
    - [Ingest file(s) and setup prompts](#ingest-files-and-setup-prompts)
    - [Send query](#send-query)
  - [Results 2.3.2.1](#results-2321)
    - [Chunk search output example](#chunk-search-output-example)
    - [Completion output](#completion-output)
    - [Analysis](#analysis)
  - [Results 2.3.2.2](#results-2322)
    - [Chunk search output example](#chunk-search-output-example-1)
    - [Completion output](#completion-output-1)
    - [Analysis](#analysis-1)
  - [Perspective tests](#perspective-tests)
- [2.3.3 R2R Light workflow Tests](#233-r2r-light-workflow-tests)
  - [Method](#method)
    - [Prompts](#prompts)
      - [P1](#p1)
      - [P2](#p2)
      - [P3](#p3)
      - [P4](#p4)
      - [P4](#p4-1)
      - [P5](#p5)
      - [P6](#p6)
      - [P7](#p7)
      - [P8](#p8)
      - [P9](#p9)
      - [P10](#p10)
      - [P11](#p11)
      - [P12](#p12)
      - [P13](#p13)
      - [P14](#p14)
      - [P15](#p15)
      - [P16](#p16)
      - [P17](#p17)
    - [Install](#install-1)

# 2.3.2 Test [R2R Light](https://r2r-docs.sciphi.ai/self-hosting/installation/light)
This test will attempt to:
- Install R2R and minimal dependencies
- Ingest a document into R2R's RAG system
- Perform a query on the document
- Determine if R2R is a suitable candidate for performing local RAG
- Determine next steps

## Preliminaries
- R2R has 2 modes: `Light` and `Full`
  - `Light` is recommended for development within smaller teams so that's what we will test here.
  - Installation is based on the [R2R Light installation](https://r2r-docs.sciphi.ai/self-hosting/installation/light) documentation
- To meet our privacy needs we also need to run everything strictly locally (at least for now) so we will be using Ollama to manage and query our models.
- These tests are initially done with Python but in theory could be done with JavaScript or directly in a bash terminal.
- The relevant online documentation for each step is presented as needed and is recommended as prerequisite reading.
- Note that these instructions are run from a **WSL 2 Ubuntu** Bash shell
- The R2R documentation followed uses the `llama3.1:7b` model for generating query responses, however memory limitations were encountered when using this model (possibly due to WSL?). Instead the `llama3.2:3b` model is proposed for its lightweight size. 

## Install

### Install dependencies
- install [Docker](https://docs.docker.com/engine/install/)
- install [R2R lite dependencies](https://r2r-docs.sciphi.ai/self-hosting/installation/light#prerequisites)
  - Python 3.12 or higher
    - This documentation uses a recommended but optional unix python/venv version manager: [pyenv](https://github.com/pyenv/pyenv)
    - Specifically Python Version `3.12.9` is used.
  - pip (Python package manager)
  - Git?
  - Postgres + pgvector. These tests use docker for running Postgres with the pgvector extension
      ```bash
      docker pull pgvector/pgvector:pg17
      ```

### Install and setup R2R
1. (Optional) start with a clean python environment using [venv](https://docs.python.org/3/library/venv.html):
   ```bash
   python -m venv venv
   source ./venv/bin/activate
   ```
2. [Setup ollama](https://r2r-docs.sciphi.ai/self-hosting/local-rag#preparing-local-llms)

   Prepare a modelfile with a larger context window than the default and add it to the manifest:
   ```bash
   mkdir test-data # only if this folder doesn't already exist
   mkdir test-data/modelfiles # only if this folder doesn't already exist
   echo 'FROM llama3.2:3b
   PARAMETER num_ctx 16000' > ./test-data/modelfiles/r2r_test2321
   ```
   Add modelfile and pull models
   ```bash
   ollama pull llama3.2:3b
   ollama create llama3.2:3b -f ./test-data/modelfiles/r2r_test2321
   ollama pull mxbai-embed-large
   ```
3. [Install R2R](https://r2r-docs.sciphi.ai/self-hosting/installation/light#install-the-extra-dependencies) (light)
   ```bash
   pip install 'r2r[core]'
   ```
4. [Setup Postgres+pgvector](https://r2r-docs.sciphi.ai/self-hosting/configuration/postgres) (our vector store)
   Create a custom r2r configuration file with postgres config.
   ```bash
   touch ./test-data/r2r-test/r2r_config.toml
   ```
   This example configuration is based on the default [Ollama configuration file](https://r2r-docs.sciphi.ai/self-hosting/local-rag#configuration).
    ```toml
    [app]
    # LLM used for internal operations, like deriving conversation names
    fast_llm = "ollama/llama3.2:3b"

    # LLM used for user-facing output, like RAG replies
    quality_llm = "ollama/llama3.2:3b"

    [completion]
    provider = "litellm"
    concurrent_request_limit = 1

      [completion.generation_config]
      model = "ollama/llama3.2:3b"
      temperature = 0.1
      top_p = 1
      max_tokens_to_sample = 1_024
      stream = false 
      add_generation_kwargs = { }

    [database]
    provider = "postgres"  # currently only `postgres` is supported

    # Optional parameters (typically set in the environment instead):
    user     = "user"
    password = "password"
    host     = "localhost"
    port     = 5432           # Use a numeric port (not quoted)
    db_name  = "vector_store"
    # not specified here, but note: `app.project_name` sets the root path (schema/prefix) to all R2R tables.

    [embedding]
    provider = "ollama"
    base_model = "mxbai-embed-large"
    base_dimension = 1_024
    batch_size = 128
    add_title_as_prefix = true
    concurrent_request_limit = 32

    [completion_embedding]
    provider = "ollama"
    base_model = "mxbai-embed-large"
    base_dimension = 1_024
    batch_size = 128
    add_title_as_prefix = true
    concurrent_request_limit = 2

    [ingestion]
    excluded_parsers = [ "mp4" ]
    ```
   Launch a postgres db with docker:
   ```bash
   docker run \
    --name postgres-r2r-test \
    -d \
    -p 5432:5432 \
    -e POSTGRES_USER=user \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=vector_store \
    pgvector/pgvector:pg17
   ```
5. [Run R2R](https://r2r-docs.sciphi.ai/self-hosting/installation/light#running-r2r) with [our custom config](https://r2r-docs.sciphi.ai/self-hosting/configuration/overview#server-side-configuration)
   ```bash
   export R2R_CONFIG_PATH=$PWD/test-data/r2r-test/r2r_config.toml
   python -m r2r.serve
   ```
6. Verify the installation by accessing the R2R API at [http://localhost:7272/v3/health](http://localhost:7272/v3/health) or send a curl:
   ```bash
   curl http://localhost:7272/v3/health
   ```

Once this setup is complete you can use the `up_test_r2r.sh` script 
```bash
# run if needed for execution rights
# chmod +x up_test_r2r.sh
./up_test_r2r.sh
```

### Ingest file(s) and setup prompts
1. Use the following one liner to ingest files. For example, to ingest a pdf file located here `./test-data/input/VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI fr.pdf`
   ```bash
   python -c "from r2r import R2RClient;c = R2RClient();c.set_base_url('http://localhost:7272');c.documents.create(file_path='./test-data/input/VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI fr.pdf', ingestion_mode='fast')"
   ```
2. Check the file was correctly ingested.
   ```bash
   curl -X GET http://localhost:7272/v3/documents | less
   ```
   You should see something like this (after pretty printing):
   ```json
   {
     "results": [
       {
        "id": "b6e9bf87-5ce3-555b-b899-7b8b50fe9987",
         "collection_ids": ["122fdf6a-e116-546b-a8f6-e4cb2e2c0a09"],
         "owner_id": "2acb499e-8428-543b-bd85-0d9098718220",
         "document_type": "pdf",
         "metadata": { "version": "v0" },
         "title": "VILLEGARDEN_KAUFMANN_AAP_FRANCE2023_PEPR_VDBI fr.pdf",
         "version": "v0",
         "size_in_bytes": 3148204,
         "ingestion_status": "success",
         "extraction_status": "pending",
         "created_at": "2025-03-03T20:39:08.086026Z",
         "updated_at": "2025-03-03T20:39:08.097748Z",
         "ingestion_attempt_number": null,
         "summary": null,
         "summary_embedding": null,
         "total_tokens": 64716
       }
     ],
     "total_entries": 1
   }
   ```
   > [!TIP]
   > Check out the [API](https://r2r-docs.sciphi.ai/api-and-sdks/introduction) for more commands. Note that when running commands on a local R2R instance, you don't need to include the authorization bearer token in the request header. 
   Verify the chunks of your pdf
   ```bash
   curl -X GET http://localhost:7272/v3/documents/b6e9bf87-5ce3-555b-b899-7b8b50fe9987/chunks | less
   ```
3. Create a system prompt
   ```bash
   curl -X POST http://localhost:7272/v3/prompts \
     -H "Content-Type: application/json" \
     -d '{
          "name": "system",
          "template": "You are a helpful agent.",
          "input_types": {}
        }'
   ```
4. [Create a RAG prompt](https://r2r-docs.sciphi.ai/self-hosting/configuration/retrieval/prompts)
   ```bash
   curl -X POST http://localhost:7272/v3/prompts \
     -H "Content-Type: application/json" \
     -d '{
          "name": "rag",
          "template": "## Task:\nAnswer the query given immediately below given the context which follows later. Use line item references to like [1], [2], ... refer to specifically numbered items in the provided context. Pay close attention to the title of each given source to ensure it is consistent with the query.\n\n### Query:\n{query}\n\n### Context:\n{context}\n\nREMINDER - Use line item references to like [1], [2], ... refer to specifically numbered items in the provided context.\n## Response:",
          "input_types": {
            "query": "string",
            "context": "string"
          }
        }'
   ```

### Send query
1. Query RAG system with a prompt
   ```bash
   curl -X POST http://localhost:7272/v3/retrieval/rag \
     -H "Content-Type: application/json" \
     -d '{ "query": "What is the Villegarden project?" }' \
   > ./test-data/r2r-test/23211_results.html
   ```
2. A second test was run with an empty system prompt. See [analysis](#analysis) for why.
   Update the system prompt
   ```bash
   curl -X POST http://localhost:7272/v3/prompts \
     -H "Content-Type: application/json" \
     -d '{
          "name": "system",
          "template": "",
          "input_types": {}
        }'
   ```
   Resend the query
   ```bash
   curl -X POST http://localhost:7272/v3/retrieval/rag \
     -H "Content-Type: application/json" \
     -d '{ "query": "What is the Villegarden project?" }' \
   > ./test-data/r2r-test/23212_results.html
   ```


## Results 2.3.2.1
Initial results from using the system template: `You are a helpful agent.`:
- [Raw output](./test-data/r2r-test/23211_results.html)
- [Chunk search output](./test-data/r2r-test/23211_results_chunk_search.json)

### Chunk search output example
```json
[
  {
    "id": "cf878fa2-b643-5c67-9eaf-467ef8f68a22",
    "document_id": "b6e9bf87-5ce3-555b-b899-7b8b50fe9987",
    "owner_id": "2acb499e-8428-543b-bd85-0d9098718220",
    "collection_ids": ["122fdf6a-e116-546b-a8f6-e4cb2e2c0a09"],
    "score": 0.7570763358247369,
    "text": "PEPR  VBDI  \nAPPEL \u00c0 PROJETS \n2023\nDOCUMENT DE PR\u00c9SENTATION \nPROJET\nVILLEGARDEN7R\u00e9sum\u00e9  du projet  en fran\u00e7ais  (Non  Confidentiel  - 4000  caract\u00e8res  maximum),\nespaces  inclus)\nLes villes adoptent des politiques efficaces en mati\u00e8re de biodiversit\u00e9 et de perm\u00e9abilit\u00e9 \ns'appuyant sur des solutions bas\u00e9es sur la nature pour conserver, restaurer et am\u00e9liorer les sols \net la v\u00e9g\u00e9tation urbains afin de relever les d\u00e9fis comme la surchauffe ou l'att\u00e9nuation des \ninondations, l'am\u00e9lioration de la sant\u00e9 physique et mentale des r\u00e9sidents, la r\u00e9duction de la \npollution des sols, de l'air et de l'eau, ainsi que la protection et la restauration de la biodiversit\u00e9 et \ndes \u00e9cosyst\u00e8mes fonctionnels. Ces politiques d'am\u00e9nagement urbain, r\u00e9sum\u00e9es en \"vertes, \nfra\u00eeches et perm\u00e9ables\", sont essentielles \u00e0 la transition \u00e9cologique vers des villes durables. \nCependant, l'\u00e9talement urbain, en convertissant des terres agricoles et naturelles, a eu un impact",
    "metadata": {
      "version": "v0",
      "chunk_order": 17,
      "document_type": "pdf",
      "associated_query": "What is the Villegarden project?"
    }
  },
  ...
]
```

### Completion output

> I can help you with that. However, I notice that the text appears to be a research proposal or a document related to urban planning and sustainability. If you'd like, I can provide a general outline of how to structure a response to this type of document.
> 
> Here's a possible outline:
> 
> 1. **Introduction**: Briefly summarize the main points of the proposal and explain why it's relevant to your interests.
> 2. **Key findings or arguments**: Identify the most important aspects of the proposal that you'd like to discuss or respond to.
> 3. **Your perspective or response**: Provide your own thoughts, opinions, or responses to the key findings or arguments presented in the proposal.
> 
> If you'd like, I can help you craft a specific response to one of the sections of the proposal. Please let me know which section you're interested in responding to (e.g., "The impact of urbanization on biodiversity", "The role of green spaces in urban planning", etc.).

### Analysis
- System prompt template seems to take **FAR** too much precedence over the rag prompt template in the completion.
  - Initially the system template was `"template": "You are a helpful agent.",`.
  - It should be noted that the initial template may work better with different models, `llama3.2:3b` is relatively small after all 
- 10 chunks were returned with 21 occurrences of the string `villegarden` (not case sensitive).
  - Seems to avoid the Villegarden occurence in the header of the PDF, which is desired.
- Chunk scores are as follows:
  | chunk_order | score              |
  | ----------- | ------------------ |
  | 17          | 0.7570763358247369 |
  | 163         | 0.7566577309418312 |
  | 76          | 0.7519233293831121 |
  | 25          | 0.7513693268171234 |
  | 80          | 0.7502102999751484 |
  | 90          | 0.7434344375978015 |
  | 143         | 0.7417873163731662 |
  | 164         | 0.7404488525367307 |
  | 49          | 0.7370301578895754 |
  | 51          | 0.7352623851993308 |
- The highest scoring chunk text returned is (after formatting):
  > PEPR  VBDI  
  > APPEL À PROJETS 
  > 2023
  > DOCUMENT DE PRÉSENTATION 
  > PROJET
  > VILLEGARDEN7Résumé  du projet  en français  (Non  Confidentiel  - 4000  caractères  maximum),
  > espaces  inclus)
  > Les villes adoptent des politiques efficaces en matière de biodiversité et de perméabilité 
  > s'appuyant sur des solutions basées sur la nature pour conserver, restaurer et améliorer les sols 
  > et la végétation urbains afin de relever les défis comme la surchauffe ou l'atténuation des 
  > inondations, l'amélioration de la santé physique et mentale des résidents, la réduction de la 
  > pollution des sols, de l'air et de l'eau, ainsi que la protection et la restauration de la biodiversité et 
  > des écosystèmes fonctionnels. Ces politiques d'aménagement urbain, résumées en "vertes, 
  > fraîches et perméables", sont essentielles à la transition écologique vers des villes durables. 
  > Cependant, l'étalement urbain, en convertissant des terres agricoles et naturelles, a eu un impact
  - This is the opening lines of the abstract which is generally a good basis for finding information to respond to the given prompt.


## Results 2.3.2.2
Results from using the empty system template:
- [Raw output](./test-data/r2r-test/23212_results.html)
- [Chunk search output](./test-data/r2r-test/23212_results_chunk_search.json)

### Chunk search output example

Still chunk 17. See above.

### Completion output

> The Villegarden project is a research and development project that aims to improve the management of urban green spaces (GRS) and promote sustainable urban planning. The project focuses on evaluating the performance of different types of GRS systems, such as individual and multifamily homes, and identifying factors that affect their performance.
> 
> According to [1], the Villegarden project is part of a larger initiative to develop effective policies for biodiversity and permeability in cities. The project's objectives include evaluating the performance of GRS systems, identifying factors that affect their performance, and developing tools and models to optimize their use.
> 
> The project also aims to address the issue of artificialization in urban areas, which can lead to a loss of green spaces and ecosystem services. According to [10], artificialization is defined as "the alteration of all or part of a soil's ecological functions, including its biological, hydraulic, climatic, and agronomic potential".
> 
> The Villegarden project is expected to provide new references for biodiversity and soil management, which will be essential for the future of French cities. According to [8], the project will co-construct with urban planners, landscape professionals, associations, and citizens to develop solid data and models that can optimize the use of GRS at all scales.
> 
> In summary, the Villegarden project is a research and development initiative that aims to improve the management of urban green spaces and promote sustainable urban planning. The project focuses on evaluating the performance of different types of GRS systems, identifying factors that affect their performance, and developing tools and models to optimize their use.


### Analysis
- The generated response is much better as it actually provides a plausible description of the project 
- What are the citations pointing to? It seems to be chunk results as
  - chunk 1 is from the abstract
  - chunk 10 contains 3 mentions of artificialization
  - chunk 8 mentions biodiversity


## Perspective tests
1. Test different prompt templates using a workflow
2. Test different models, especially a larger one
3. Couldn't get Ollama to work with docker. In theory, these instructions should allow running Ollama from a Docker container:
   - Setup [Ollama Docker container](https://ollama.com/blog/ollama-is-now-available-as-an-official-docker-image)
   - If you have an Nvidia GPU, install the [Nvidia container toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installation)
   - Then run the following for setting up ollama 
   ```bash
   docker run -d --gpus=all -v $PWD/test-data/modelfiles:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
   # or run this command if you aren't using the nvidia container toolkit
   # docker run -d -v ./test-data/modelfiles:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
   ```
   Add modelfile and pull models
   ```bash
   docker exec -it ollama ollama create llama3.1 -f /root/.ollama/r2r_test232
   docker exec -it ollama ollama pull llama3.1
   docker exec -it ollama ollama pull mxbai-embed-large
   ```
   Perhaps try running with a proper docker compose and a defined network?

# 2.3.3 R2R Light workflow Tests
This test will examine:
- How R2R manages prompting workflows
- How different patterns affect the generated output
- How language affects the generated output

## Method
A series of prompts are defined to be queried on the Villegarden PDF.
These prompts are defined according to the following article:
```
@misc{white2023promptpatterncatalogenhance,
  title={A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT}, 
  author={
    Jules White and
    Quchen Fu and
    Sam Hays and
    Michael Sandborn and
    Carlos Olea and
    Henry Gilbert and
    Ashraf Elnashar and
    Jesse Spencer-Smith and
    Douglas C. Schmidt
  },
  year={2023},
  eprint={2302.11382},
  archivePrefix={arXiv},
  primaryClass={cs.SE},
  url={https://arxiv.org/abs/2302.11382}, 
}
```

Two patterns are proposed for testing: *Template*, *Persona*, and *Context Manager*.
Hypothesis:
- The *Template* pattern will provide better output results as semi-structured data (e.g. JSON).
- The *Persona* pattern will provide subjectively better results when compared to ground truth.
- The *Context Manager* pattern will provide subjectively better results when compared to ground truth.

The following invariant parameters are used in this test:
- Embedding model: `mxbai-embed-large:latest` as this is default recommendation from R2R 
- Completion model: `mixtral:8x22b` as this is a well known model for quality generation. Also, the mixture of experts model may provide good results when ingesting VDBI project information written by experts.
- Prompts are written in english

What is considered a good result?
- Limited/no hallucinations
- Well formatted response
  - Length limits are respected
  - Format syntax is respected (i.e. in the case of JSON output)
- Subjective criteria:
  - This will be given a subjective grade between 1-5 by comparing with ground truth
    1. Much worse than ground truth
    2. Worse than ground truth
    3. As good as ground truth
    4. Better than ground truth
    5. Much better than ground truth

3 responses will be generated for each prompt.
This is likely not be a representative number of responses but is more responsible in terms of energy consumption and may be enough to understand which prompts return better results compared to others.
Future tests can attempt to refine prompts based on the results of this test.

**Test workflow parameters**
Input: `test-data/input/NEO_Document-scientifique_vfin_20240209_avec lettressoutien 20P fr.pdf`
| Category             | Prompt pattern  | Prompt |
| -------------------- | --------------- | ------ |
| Output Customization | Template        | P1     |
| Output Customization | Persona         | P      |
| Context Control      | Context Manager | P      |

### Prompts

#### P1
   - Prompt:
     > What are the proposed research actions of the NEO project?
   - Template:
     > I am going to provide a template for your output in JSON. The string `XXXX` is a placeholder. Any time that you generate text, try to fit it into the placeholder(s) that I list. Please preserve the formatting and overall template that I provide. This is the template:
     > ```json
     > {
     >   "action": "XXXX"
     > }
     > ```
#### P2
   - Prompt:
     > How does the NEO project propose to perform their research actions?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "how": "XXXX"
     > }
     > ```
#### P3
   - Prompt:
     > Why does the NEO project propose their research actions?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "why": "XXXX"
     > }
     > ```
#### P4
   - Prompt:
     > What is the research proposal of the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "proposal": "XXXX"
     > }
     > ```
#### P4
   - Prompt:
     > What research actions are proposed for which solutions by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "action_solution": "XXXX"
     > }
     > ```
#### P5
   - Prompt:
     > What are the research products or results by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "solution": "XXXX"
     > }
     > ```
#### P6
   - Prompt:
     > What are the research products or results by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "solutions": [
     >     XXXX
     >   ]
     > }
     > ```
   - prompt redaction reasoning: [P5](#p5) asks the same question, however as multiple products and solutions can be returned, a JSON array may make a better template. 
#### P7
   - Prompt:
     > What are the research products or results by the NEO project? Order your answers by importance.
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "solutions": [
     >     XXXX
     >   ]
     > }
     > ```
   - prompt redaction reasoning: same as [P6](#p6) but tries to emphasize order (primary, secondary, etc.) in prompt
#### P8
   - Prompt:
     > What are the research products or results by the NEO project?
   - Template:
     > I am going to provide a template for your output in JSON. The string `XXXX` is a placeholder. Any time that you generate text, try to fit it into the placeholder(s) that I list. Please preserve the formatting and overall template that I provide. Order answers within JSON arrays by importance. This is the template:
     > ```json
     > {
     >   "solutions": [
     >     XXXX
     >   ]
     > }
     > ```
   - prompt redaction reasoning: same as [P7](#p7) but tries to emphasize array order (primary, secondary, etc.) in template
#### P9
   - Prompt:
     > What are the primary and secondary research products or results by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "primary_solution": "XXXX",
     >   "secondary_solution": "XXXX",
     > }
     > ```
   - prompt redaction reasoning: same as [P7](#p7) but tries to emphasize order (primary, secondary) with explicit JSON keys in pattern
#### P10
   - Prompt:
     > What are the urban objects and devices involved by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "objects": [
     >     XXXX
     >   ]
     > }
     > ```
#### P11
   - Prompt:
     > What are the urban objects and devices involved by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "devices": [
     >     XXXX
     >   ]
     > }
     > ```
   - prompt redaction reasoning: same as [P10](#p10) but uses a different JSON key field to see how results are affected
#### P12
   - Prompt:
     > What are the urban objects and devices involved by the NEO project?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "objects_devices": [
     >     XXXX
     >   ]
     > }
     > ```
   - prompt redaction reasoning: same as [P10](#p10) but uses a different JSON key field to see how results are affected
#### P13
   - Prompt:
     > List several keywords to describe the NEO project.
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "keywords": [
     >     XXXX
     >   ]
     > }
     > ```
#### P14
   - Prompt:
     > List several keywords to describe the NEO project.
   - Template: same as P1, except for pattern:
     > ```json
     > [
     >   XXXX
     > ]
     > ```
   - prompt redaction reasoning: same as [P13](#p13) but uses a different JSON array pattern to see how results are affected
#### P15
   - Prompt:
     > List several keywords to describe the NEO project.
   - Template: same as P1, except for pattern:
     > ```json
     > [XXXX]
     > ```
   - prompt redaction reasoning: same as [P13](#p13) but uses a different JSON array pattern to see how results are affected
#### P16
   - Prompt:
     > List several keywords to describe the NEO project.
   - Template: same as P1, except for pattern:
     > ```json
     > [
     >   "XXXX",
     >   "XXXX",
     >   ...
     > ]
     > ```
   - prompt redaction reasoning: same as [P13](#p13) but uses a different JSON array pattern to see how results are affected
#### P17
   - Prompt:
     > What are the challenges the NEO project will respond to?
   - Template: same as P1, except for pattern:
     > ```json
     > {
     >   "challenges": [
     >     XXXX
     >   ]
     > }
     > ```

These prompts are configured in the file [./test-data/configs/workflow_2.3.3_config.json](test-data/configs/workflow_2.3.3_config.json)

### Install
- Follow [the setup instructions of the previous test](#install)
						