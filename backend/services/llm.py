"""
Multi-model LLM router.
Supports Claude (Haiku/Sonnet), Ollama local models, and OpenAI (optional).
"""

import anthropic
import httpx
import os
import json
from typing import AsyncGenerator

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

# Model mapping
MODEL_MAP = {
    "claude-haiku": "claude-haiku-4-5-20251001",
    "claude-sonnet": "claude-sonnet-4-6",
    "ollama-local": "qwen2.5-coder:7b",
}


async def stream_response(
    model_key: str,
    system_prompt: str,
    context: str,
    messages: list[dict],
    user_message: str,
) -> AsyncGenerator[str, None]:
    """
    Stream a response from the selected model.
    Yields text tokens one at a time.
    """
    # Build the full prompt with RAG context
    full_system = system_prompt
    if context:
        full_system += f"\n\nUse the following context to answer. If the answer is not in the context, say you don't have that information.\n\nCONTEXT:\n{context}"

    if model_key.startswith("claude"):
        async for token in _stream_claude(model_key, full_system, messages, user_message):
            yield token
    elif model_key.startswith("ollama"):
        async for token in _stream_ollama(model_key, full_system, messages, user_message):
            yield token
    else:
        yield "Error: Unknown model. Please select Claude or Ollama."


async def _stream_claude(
    model_key: str,
    system_prompt: str,
    history: list[dict],
    user_message: str,
) -> AsyncGenerator[str, None]:
    """Stream from Claude API."""
    model_id = MODEL_MAP.get(model_key, MODEL_MAP["claude-haiku"])
    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

    # Build messages list
    api_messages = []
    for msg in history[-10:]:  # Keep last 10 messages for context
        api_messages.append({"role": msg["role"], "content": msg["content"]})
    api_messages.append({"role": "user", "content": user_message})

    async with client.messages.stream(
        model=model_id,
        max_tokens=1024,
        system=system_prompt,
        messages=api_messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def _stream_ollama(
    model_key: str,
    system_prompt: str,
    history: list[dict],
    user_message: str,
) -> AsyncGenerator[str, None]:
    """Stream from Ollama local model."""
    model_id = MODEL_MAP.get(model_key, "qwen2.5-coder:7b")

    ollama_messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-10:]:
        ollama_messages.append({"role": msg["role"], "content": msg["content"]})
    ollama_messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=300) as client:
        async with client.stream(
            "POST",
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": model_id,
                "messages": ollama_messages,
                "stream": True,
                "options": {"num_ctx": 4096, "num_predict": 512, "num_gpu": 99},
            },
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        token = data.get("message", {}).get("content", "")
                        if token:
                            yield token
                    except json.JSONDecodeError:
                        continue
