# AI-based Automated Data Integration Experiments

Tests for converting unstructured text to structured text

- [AI-based Automated Data Integration Experiments](#ai-based-automated-data-integration-experiments)
  - [Step 1 - PDF to unstructured text](#step-1---pdf-to-unstructured-text)
    - [pypdf tests](#pypdf-tests)
      - [Test 1: simple pdf to text conversion](#test-1-simple-pdf-to-text-conversion)
      - [Test 2: pdf with table to text conversion](#test-2-pdf-with-table-to-text-conversion)
  - [Step 2 - unstructured text to structured text via GPT](#step-2---unstructured-text-to-structured-text-via-gpt)
    - [Mistral](#mistral)
      - [Test 1.1: simple keyword extraction in french](#test-11-simple-keyword-extraction-in-french)
      - [Test 1.2: simple keyword extraction in english](#test-12-simple-keyword-extraction-in-english)
      - [Test 2.1: Ollama server+python](#test-21-ollama-serverpython)
- [Notes for AI assisted data integration](#notes-for-ai-assisted-data-integration)
  - [Links](#links)
  - [Research interests](#research-interests)
  - [Text analysis](#text-analysis)
  - [Private instances](#private-instances)
  - [Further reading](#further-reading)
    - [JSA's AI and Deep learning courses](#jsas-ai-and-deep-learning-courses)
    - [Connectivist AI](#connectivist-ai)
    - [Symbolic AI](#symbolic-ai)
    - [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](#retrieval-augmented-generation-for-knowledge-intensive-nlp-tasks)

```mermaid
---
title: Proposed method (steps 1-4)
---
flowchart LR
    A(PDF) -->|1. Transform| B(Unstructured Text)
    B --> C{Large Language\n Model query}
    C -->|2. Create a list of the\n given projects| X(''Structured'' text)
    C -->|3. Create 4 keywords\n per project| Y(''Structured'' text)
    C -->|4. Fuse these keywords\n into 1 list| Z(''Structured'' text)
    C -->|... ?| AA(''Structured'' text)
    X --> C
    Y --> C
    Z --> C
    AA --> C
```
inspired from [GGE perplexity tests](./Tests_IA.md)

## Step 1 - PDF to unstructured text

**RQ1 (Research question):** What is the best open source PDF to text tool or library for transforming pdf files to text?

**Requirements:**

1. Open source license
2. Source available on github or library available on packaging repository (Pypi, npm, etc.)
3. Must run locally
4. Must support french
5. It would be nice if information from tables could be supported

**Initial candidates:**

| Tool/library                                     | Type                              | Comment                          |
| ------------------------------------------------ | --------------------------------- | -------------------------------- |
| [pypdf](https://github.com/py-pdf/pypdf)         | Python Library                    |                                  |
| [RAGFlow](https://github.com/infiniflow/ragflow) | CLI (Command line interface) tool |                                  |
| [pd3f](https://github.com/pd3f/pd3f)             | CLI tool                          | no french support? Is it mature? |

### pypdf tests

#### Test 1: simple pdf to text conversion
```bash
python pypdf_test.py test-data/résumé-thèse-fr.pdf test-data/pypdf_test.txt
```

Notes:
- seems to have a good output
- no formatting is retained (i.e., headers, bold, color, etc.)
- perhaps markdown would be better if possible to retain some semi-structured text?

#### Test 2: pdf with table to text conversion
```bash
python pypdf_test.py test-data/résumé-thèse-tableau-fr.pdf test-data/pypdf_table_test.txt
```

Notes:
- table has poor formatting
  - newlines in table cells are represented as newlines in output text
  - separation between consecutive cells is represented by just a space
- this causes structure of table to be lost
- again perhaps markdown is better?

## Step 2 - unstructured text to structured text via GPT
**RQ2:** What prompts provide the best results for answering the natural language questions posed in the [proposed method](#unstructured-text-to-structured-text-tests)

### Mistral
Proposed model: **Mistral**
- open source
- seems to have decent French language (and multi-language) support (also produced by a French company based in Paris, so I would hope so)
- seems to have a [good balance](https://medium.com/@periphanos.a/mistral-vs-gpt-4-a-comparative-analysis-in-size-cost-and-mmlu-performance-de320060388d) of resource usage vs performance compared to larger models like chatGPT

Dependency: **[Ollama](https://github.com/ollama/ollama)** (Open LLaMa) which supports local Mistral and Mixtral models

Start Ollama with the mistral model and no history to run tests
```baSh
ollama run mistral
>>> /set nohistory
```

#### Test 1.1: simple keyword extraction in french

Note that [deepl.com](https://www.deepl.com/) translates the keywords listed in the top of the documents as :
> 3D data, spatio-temporal data, urban data, data integration, data transformation, ontologies, knowledge graphs, conceptual models, model-based, data standards


For this prompt replace the occurrence of `[text]` with the contents of [pypdf_test.txt](./test-data/pypdf_test.txt)

> Quelles sont les mots clès dans le texte suivant ? : [text]

Output:
```
Keywords: urban data, heterogeneous data integration, 3D data, spatio-temporal data, semantic web, ontologies, knowledge graphs, conceptual models, Model-Driven Architecture (MDA), data
transformation, interoperability, computational representation, data validation.

Explanation: The text is about a research thesis focusing on the integration of heterogeneous, n-dimensional urban data for creating more comprehensive views of urban landscapes and their
evolution. The key challenges addressed in the thesis are ensuring compatibility with evolving urban data norms and minimizing data loss during transformations between different data formats. The
proposed approach uses semantic modeling based on models and preserves underlying conceptual models, which allows for adaptability and maintainability while enabling interoperability with other
open data sources. Additionally, the thesis discusses the transformation of urban data models into computational representations and their application in data validation processes to ensure high-quality transformed      
data. The ultimate goal is to enable easy reuse of integrated urban data by applications such as digital twins for providing more complete views of evolving urban landscapes.
```

Notes:
- response in english even though prompt and text are in french
- keywords seem to be accurately taken and translated from keyword section with several additions proposed
- explanation was not asked for but provided
  - the explanation does seem to be generally accurate
- would a larger Mistral model respond better? I.e.,
  - in french
  - without the explanation, just the keywords

#### Test 1.2: simple keyword extraction in english

For this prompt replace the occurrence of `[text]` with the contents of [pypdf_test.txt](./test-data/pypdf_test.txt)

> What are the keywords in the following text? : [text]

Output:
```
Keywords: urban data integration, heterogeneous multi-dimensional data, Urban Data, 3D data, spatio-temporal data, urban models, semantic modeling, model-driven architecture, data transformation,       
standardization, interoperability, computationally representable models, ontologies, knowledge graphs.

Additionally, some specific terms related to the context of the text are:

* urbanization and anthropization processes
* digital twin cities
* smart city applications
* heterogeneous data sources
* semantic and structural heterogeneity
* data transformation and conversion
* Model-Driven Architecture (MDA)
* norms and models evolution
* modeling conceptual schemes
* standards for urban data
* interoperability of urban data.
```

Notes:
- like in test 1.1 keywords are largely taken from keyword section in the text and translated with several additions
- I like the proposal of new keywords "related to the context of the text"
- given these two points, this response "seems" better than the output of test 1.1
  - with this size of Mistral, do english prompts work better than french ones?
  - how do other models like `llama2` or models with larger parameters like `mixtral:8x22b` perform?

#### Test 2.1: Ollama server+python

This test will examine how we can call prompts and extract their output programatically with python.
This requires launching Ollama on a local server.

Dependency: [Ollama python](https://github.com/ollama/ollama-python)

```bash
python pypdf_test.py test-data/résumé-thèse-tableau-fr.pdf test-data/pypdf_table_test.txt
```


# Notes for AI assisted data integration

**Context:** In the context of the PEPR-tests project, we would like to use AI to integrate non-structured data (from PDF documents) to visualize and analyse their underlying knowledge.

- [AI-based Automated Data Integration Experiments](#ai-based-automated-data-integration-experiments)
  - [Step 1 - PDF to unstructured text](#step-1---pdf-to-unstructured-text)
    - [pypdf tests](#pypdf-tests)
      - [Test 1: simple pdf to text conversion](#test-1-simple-pdf-to-text-conversion)
      - [Test 2: pdf with table to text conversion](#test-2-pdf-with-table-to-text-conversion)
  - [Step 2 - unstructured text to structured text via GPT](#step-2---unstructured-text-to-structured-text-via-gpt)
    - [Mistral](#mistral)
      - [Test 1.1: simple keyword extraction in french](#test-11-simple-keyword-extraction-in-french)
      - [Test 1.2: simple keyword extraction in english](#test-12-simple-keyword-extraction-in-english)
      - [Test 2.1: Ollama server+python](#test-21-ollama-serverpython)
- [Notes for AI assisted data integration](#notes-for-ai-assisted-data-integration)
  - [Links](#links)
  - [Research interests](#research-interests)
  - [Text analysis](#text-analysis)
  - [Private instances](#private-instances)
  - [Further reading](#further-reading)
    - [JSA's AI and Deep learning courses](#jsas-ai-and-deep-learning-courses)
    - [Connectivist AI](#connectivist-ai)
    - [Symbolic AI](#symbolic-ai)
    - [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](#retrieval-augmented-generation-for-knowledge-intensive-nlp-tasks)

## Links
- [Project Repository](https://github.com/VCityTeam/PEPR-VDBI)
- [Meeting JSA DVA](../../Topic_Meetings/2024/2024_04_11_DVA_JSA.md) 

## Research interests
How to leverage AI in:
1. Extracting information from non-structured textual data sources (Natural Language Processing (NLP))
2. Automated Entity Linking
3. Data analysis

## Text analysis


## Private instances
| Model                                               | Company                                             | Pricing                                                                                                                                                                                                          |
| --------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT                                             | OpenAI (Microsoft)                                  | [pricing](https://openai.com/chatgpt/pricing) starts at 25$ / month                                                                                                                                                     |
| [OLLaMa](https://github.com/ollama/ollama-python)   | <li>Open source project<li>Based on LLaMa from Meta | A **free** version of LLaMa                                                                                                                                                                                      |
| Gemini                                              | Google                                              | [pay as you go](https://ai.google.dev/pricing)<li>5 RPM (requests per minute)<li>10 million TPM (tokens per minute)<li>2,000 RPD (requests per day)<li>[API TOS](https://ai.google.dev/terms) (terms of service) |
| Claude                                              | Anthropic                                           | No official private servers<li>[Consumer TOS](https://www.anthropic.com/legal/consumer-terms)<li>[Commercial TOS](https://www.anthropic.com/legal/commercial-terms)                                              |
| Perplexity (based on ChatGPT/supports other models) | Perplexity                                          | No official private servers ([FAQ](https://docs.perplexity.ai/page/frequently-asked-questions), [TOS](https://www.perplexity.ai/hub/legal/perplexity-ai-api-privacy))                                            |
| Grok                                                | xAI                                                 | Still in early access                                                                                                                                                                                            |

## Further reading

### [JSA's AI and Deep learning courses](https://johnsamuel.info/fr/enseignement/cours/2023/IA-DeepLearning/)
![deep learning position](https://johnsamuel.info/images/art/courses/deeplearningposition.svg)

### [Connectivist AI](https://en.wikipedia.org/wiki/Connectionism)
> "Connectionism... is the name of an approach to the study of human mental processes and cognition that utilizes mathematical models known as connectionist networks or **artificial neural networks**."
Includes approaches such as [Artificial neural networks](https://en.wikipedia.org/wiki/Neural_network_(machine_learning)) and [Deep learning](https://en.wikipedia.org/wiki/Deep_learning)

### [Symbolic AI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence)
A more "classical" approach to AI. Includes logic and search algorithms, ontologies, reasoning systems, etc.

### [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
> Large pre-trained language models have been shown to store factual knowledge in their parameters, and achieve state-of-the-art results when fine-tuned on downstream NLP tasks.
> However, their ability to access and precisely manipulate knowledge is still limited, and hence on knowledge-intensive tasks, their performance lags behind task-specific architectures.
> Additionally, providing provenance for their decisions and updating their world knowledge remain open research problems.
> Pre-trained models with a differentiable access mechanism to explicit non-parametric memory can overcome this issue, but have so far been only investigated for extractive downstream tasks.
> We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) -- models which combine pre-trained parametric and non-parametric memory for language generation.
> We introduce RAG models where the parametric memory is a pre-trained seq2seq model and the non-parametric memory is a dense vector index of Wikipedia, accessed with a pre-trained neural retriever.
> We compare two RAG formulations, one which conditions on the same retrieved passages across the whole generated sequence, the other can use different passages per token.
> We fine-tune and evaluate our models on a wide range of knowledge-intensive NLP tasks and set the state-of-the-art on three open domain QA tasks, outperforming parametric seq2seq models and task-specific retrieve-and-extract architectures.
> For language generation tasks, we find that RAG models generate more specific, diverse and factual language than a state-of-the-art parametric-only seq2seq baseline.
