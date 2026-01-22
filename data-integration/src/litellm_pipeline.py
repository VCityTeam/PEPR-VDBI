from litellm import completion

# LiteLLM getting started test
response = completion(
    model="ollama/llama2",
    response_format={"type": "json_object"},
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    api_base="http://localhost:11434",
    stream=True,
)

print(response)
