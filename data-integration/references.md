# References <!-- omit in toc -->

- [Connectivist AI](#connectivist-ai)
- [Embedding](#embedding)
- [Natural Language Processing](#natural-language-processing)
- [Generative Pre-trained Transformer](#generative-pre-trained-transformer)
- [JSA's AI and Deep learning courses](#jsas-ai-and-deep-learning-courses)
- [Large Language Model](#large-language-model)
- [Retrieval](#retrieval)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](#retrieval-augmented-generation-for-knowledge-intensive-nlp-tasks)
- [Symbolic AI](#symbolic-ai)
- [Vector Store](#vector-store)


### [Connectivist AI](https://en.wikipedia.org/wiki/Connectionism)
> "Connectionism... is the name of an approach to the study of human mental processes and cognition that utilizes mathematical models known as connectionist networks or **artificial neural networks**."
Includes approaches such as [Artificial neural networks](https://en.wikipedia.org/wiki/Neural_network_(machine_learning)) and [Deep learning](https://en.wikipedia.org/wiki/Deep_learning)

### [Embedding](https://en.wikipedia.org/wiki/Embedding)
[Langchain doc](https://python.langchain.com/docs/concepts/embedding_models/)

### [Natural Language Processing](https://en.wikipedia.org/wiki/Natural_language_processing)
In this context, NLP can be implemented through Machine learning

### [Generative Pre-trained Transformer](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer)
A type of large language model used for NLP tasks

### [JSA's AI and Deep learning courses](https://johnsamuel.info/fr/enseignement/cours/2023/IA-DeepLearning/)
<img src="https://johnsamuel.info/images/art/courses/deeplearningposition.svg" width="600px">

### [Large Language Model](https://en.wikipedia.org/wiki/Large_language_model)
LLMs are artificial neural networks (an approach to Machine learning) trained for NLP tasks

### [Retrieval](https://python.langchain.com/docs/concepts/retrieval/)

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
[Langchain doc](https://python.langchain.com/docs/concepts/rag/)

See also:
- [Embedding](#embedding)
- [Retrieval](#retrieval)
- [Vector Store](#vector-store)

### [Symbolic AI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence)
A more "classical" approach to AI. Includes logic and search algorithms, ontologies, reasoning systems, etc.

### [Vector Store](https://python.langchain.com/docs/concepts/vectorstores/)
