# Feasability notes for AI assisted data integration

**Context:** In the context of the PEPR-tests project, we would like to use AI to integrate non-structured data (from PDF documents) to visualize and analyse their underlying knowledge.

- [Feasability notes for AI assisted data integration](#feasability-notes-for-ai-assisted-data-integration)
  - [Links](#links)
  - [Research interests](#research-interests)
  - [Private instances](#private-instances)
  - [Further reading](#further-reading)
    - [JSA's AI and Deep learning courses](#jsas-ai-and-deep-learning-courses)
    - [Connectivist AI](#connectivist-ai)
    - [Symbolic AI](#symbolic-ai)
    - [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](#retrieval-augmented-generation-for-knowledge-intensive-nlp-tasks)
    - [Natural Language Processing](#natural-language-processing)
    - [Generative Pre-trained Transformer](#generative-pre-trained-transformer)
    - [Large Language Model](#large-language-model)

## Links
- [Meeting JSA DVA](https://github.com/VCityTeam/VCity/blob/master/Topic_Meetings/2024/2024_04_11_DVA_JSA.md) 

## Research interests
How to leverage AI in:
1. Extracting information from non-structured textual data sources (Natural Language Processing (NLP))
2. Automated Entity Linking
3. Data analysis

## Private instances
| Model                                               | Company                                             | Pricing                                                                                                                                                                                                          |
| --------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT                                             | OpenAI (Microsoft)                                  | [pricing](https://openai.com/chatgpt/pricing) starts at 25$ / month                                                                                                                                              |
| [OLLaMa](https://github.com/ollama/ollama-python)   | <li>Open source project<li>Based on LLaMa from Meta | A **free** version of LLaMa and many other open source models                                                                                                                                                    |
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

![conceptual flow of using RAG with LLMs.](https://docs.aws.amazon.com/images/sagemaker/latest/dg/images/jumpstart/jumpstart-fm-rag.jpg)
[Source](https://aws.amazon.com/what-is/retrieval-augmented-generation/)

### [Natural Language Processing](https://en.wikipedia.org/wiki/Natural_language_processing)
In this context, NLP can be implemented through Machine learning

### [Generative Pre-trained Transformer](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer)
A type of large language model used for NLP tasks

### [Large Language Model](https://en.wikipedia.org/wiki/Large_language_model)
LLMs are artificial neural networks (an approach to Machine learning) trained for NLP tasks
