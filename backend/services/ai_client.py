"""
Shared OpenAI client configuration for IdeaProbe.
Uses GPT-4.1 — fast, accurate, cost-effective.
All agents import from here to ensure a single consistent client.

Set IDEAPROBE_OPENAI_KEY in your .env file (or Railway environment variables).
"""

import os
from openai import AsyncOpenAI

# Load API key from environment variable
_api_key = os.getenv("IDEAPROBE_OPENAI_KEY") or os.getenv("OPENAI_API_KEY")

if not _api_key:
    raise ValueError(
        "OpenAI API key not found. "
        "Set IDEAPROBE_OPENAI_KEY in your .env file. "
        "Get your key at https://platform.openai.com/api-keys"
    )

# Always direct to OpenAI — never use proxy
client = AsyncOpenAI(
    api_key=_api_key,
    base_url="https://api.openai.com/v1",
)

# GPT-4.1 — best balance of speed, accuracy, and cost
# Fast (~8-15s per agent), highly capable, supports all parameters
MODEL = os.getenv("IDEAPROBE_MODEL", "gpt-4.1")
