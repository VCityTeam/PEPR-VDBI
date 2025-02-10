# Feasability notes for AI assisted data integration

**Context:** In the context of the PEPR-tests project, we would like to use AI to integrate non-structured data (from PDF documents) to visualize and analyse their underlying knowledge.

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

**Conclusion:** Ollama seems to be a good solution for our current needs based on:
- Its many existing extensions and active community
- It's free
- It's private

The downside is it may require a bit more work and time to create something operational instead of paying someone to do it.
