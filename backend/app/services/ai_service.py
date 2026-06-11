"""
ai_service.py — Provider-agnostic AI service for PulseIQ.

Active provider is controlled by AI_PROVIDER in .env:
  gemini     → Google Gemini API
  anthropic  → Anthropic Claude API
  openai     → OpenAI API (stub, ready to implement)
  mock       → Safe hardcoded response, no API key needed

To switch providers: change AI_PROVIDER in .env and restart the server.
No code changes required.
"""

import asyncio
from abc import ABC, abstractmethod
from typing import AsyncGenerator

from app.core.config import settings


# ─────────────────────────────────────────────────────────────────────────────
# Shared constants
# ─────────────────────────────────────────────────────────────────────────────

PULSEIQ_SYSTEM_PROMPT = """You are PulseIQ, an AI-powered healthcare guidance assistant.

YOUR ROLE:
- Help users understand symptoms, medical conditions, medications, and health reports
- Provide clear, educational health information
- Guide users toward appropriate care when needed

CRITICAL RULES — NEVER BREAK THESE:
1. You are NOT a diagnostic tool. Never diagnose diseases or medical conditions.
2. Never prescribe or recommend specific medications or dosages.
3. Never replace professional medical advice. Always encourage consulting a doctor.
4. For ANY emergency symptoms, immediately tell the user to call emergency services (112 in India, 911 in USA).
5. Always include a disclaimer that your information is educational only.

EMERGENCY SYMPTOMS — respond with urgency if user mentions:
- Chest pain, pressure, or tightness
- Difficulty breathing or shortness of breath
- Signs of stroke: face drooping, arm weakness, speech difficulty
- Severe allergic reaction (anaphylaxis)
- Loss of consciousness or unresponsiveness
- Severe bleeding that won't stop
- Suicidal thoughts or self-harm

RESPONSE STYLE:
- Be warm, empathetic, and clear
- Use simple language — avoid heavy medical jargon
- Structure responses with clear sections when explaining complex topics
- Keep responses focused and not excessively long
- End every response with: "⚕️ This is educational information only. Please consult a qualified healthcare professional for personal medical advice."

CONTEXT: You are deployed in India. Be aware of Indian healthcare context (112 emergency number, AIIMS, Apollo, Fortis hospitals, common Indian health conditions) while still being helpful globally."""


EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe",
    "difficulty breathing", "shortness of breath", "stroke", "unconscious",
    "not breathing", "severe bleeding", "overdose", "suicide", "kill myself",
    "anaphylaxis", "allergic reaction", "severe", "emergency", "dying",
    "collapsed", "seizure", "convulsion",
]


def detect_emergency(message: str) -> bool:
    """Quick keyword scan to flag potential emergencies."""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in EMERGENCY_KEYWORDS)


def build_emergency_prefix() -> str:
    return (
        "🚨 EMERGENCY ALERT: Based on what you've described, this may be a medical emergency.\n\n"
        "**Please call 112 (India) or your local emergency number immediately.**\n\n"
        "Do not wait. Emergency services can help right now.\n\n"
        "---\n\n"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Base provider interface
# ─────────────────────────────────────────────────────────────────────────────

class BaseAIProvider(ABC):
    """
    All AI providers implement this interface.
    chat_service.py only ever calls these three methods —
    it never knows which provider is active.
    """

    @abstractmethod
    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
        is_emergency: bool = False,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens one by one."""
        ...

    @abstractmethod
    async def get_full_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> str:
        """Get a complete non-streaming response."""
        ...

    @abstractmethod
    async def generate_session_title(self, first_message: str) -> str:
        """Generate a short title for a chat session."""
        ...


# ─────────────────────────────────────────────────────────────────────────────
# Mock provider — no API key needed, safe fallback
# ─────────────────────────────────────────────────────────────────────────────

class MockAIProvider(BaseAIProvider):
    """
    Returns realistic-looking medical guidance responses without any API call.
    Used when:
    - AI_PROVIDER=mock in .env
    - Any real provider fails (automatic fallback)
    - Development / testing without API credits
    """

    MOCK_RESPONSES = [
        (
            "Thank you for reaching out to PulseIQ. I understand you have a health-related question.\n\n"
            "While I'm currently operating in demonstration mode, here's some general guidance:\n\n"
            "**General Health Tips:**\n"
            "- Stay hydrated and maintain a balanced diet\n"
            "- Get regular physical activity appropriate for your condition\n"
            "- Ensure adequate sleep (7-9 hours for most adults)\n"
            "- Monitor any persistent or worsening symptoms\n\n"
            "**When to Seek Medical Attention:**\n"
            "- Symptoms that are severe or rapidly worsening\n"
            "- Symptoms lasting more than a few days\n"
            "- Any symptom that worries you significantly\n\n"
            "⚕️ This is educational information only. Please consult a qualified healthcare professional for personal medical advice."
        ),
        (
            "I appreciate your question about your health concern.\n\n"
            "**Important Considerations:**\n\n"
            "Medical symptoms can vary greatly between individuals. What might be minor for one person "
            "could be significant for another. That's why professional evaluation is always important.\n\n"
            "**Practical Steps:**\n"
            "1. Keep track of your symptoms — when they started, severity, and what makes them better or worse\n"
            "2. Note any medications or supplements you're taking\n"
            "3. Consider scheduling an appointment with your primary care physician\n"
            "4. If symptoms are severe or sudden, seek emergency care immediately\n\n"
            "In India, you can reach emergency services by calling **112**.\n\n"
            "⚕️ This is educational information only. Please consult a qualified healthcare professional for personal medical advice."
        ),
    ]

    _response_index = 0

    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
        is_emergency: bool = False,
    ) -> AsyncGenerator[str, None]:
        response = ""
        if is_emergency:
            response += build_emergency_prefix()

        response += self.MOCK_RESPONSES[self._response_index % len(self.MOCK_RESPONSES)]
        MockAIProvider._response_index += 1

        # Simulate streaming — yield word by word with a small delay
        words = response.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.03)

    async def get_full_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> str:
        return self.MOCK_RESPONSES[0]

    async def generate_session_title(self, first_message: str) -> str:
        words = first_message.strip().split()[:6]
        title = " ".join(words)
        # Never truncate with quotes — just return clean words
        return title if len(title) > 3 else "Health Consultation"


# ─────────────────────────────────────────────────────────────────────────────
# Gemini provider
# ─────────────────────────────────────────────────────────────────────────────

class GeminiAIProvider(BaseAIProvider):
    """Google Gemini API provider with streaming support."""

    def __init__(self):
        import google.generativeai as genai

        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in .env")

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._genai = genai
        self.model_name = settings.GEMINI_MODEL

        # Safety settings — permissive for medical education context
        self.safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
        ]

        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_output_tokens": 1024,
        }

    def _build_gemini_history(self, conversation_history: list[dict]) -> list[dict]:
        """
        Convert our standard history format to Gemini's format.
        Standard: [{"role": "user/assistant", "content": "..."}]
        Gemini:   [{"role": "user/model", "parts": ["..."]}]
        """
        gemini_history = []
        for msg in conversation_history:
            gemini_role = "model" if msg["role"] == "assistant" else "user"
            gemini_history.append({
                "role": gemini_role,
                "parts": [msg["content"]],
            })
        return gemini_history

    def _build_full_prompt(self, user_message: str, is_emergency: bool) -> str:
        """Prepend system prompt to user message (Gemini handles system via first turn)."""
        if is_emergency:
            return (
                f"{PULSEIQ_SYSTEM_PROMPT}\n\n"
                f"URGENT: This message may describe a medical emergency. "
                f"Immediately tell the user to call 112 (India) or 911 (USA).\n\n"
                f"User message: {user_message}"
            )
        return f"{PULSEIQ_SYSTEM_PROMPT}\n\nUser message: {user_message}"

    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
        is_emergency: bool = False,
    ) -> AsyncGenerator[str, None]:
        try:
            model = self._genai.GenerativeModel(
                model_name=self.model_name,
                safety_settings=self.safety_settings,
                generation_config=self.generation_config,
            )

            # If we have history, use a chat session
            if conversation_history:
                gemini_history = self._build_gemini_history(conversation_history)
                chat = model.start_chat(history=gemini_history)
                prompt = user_message
                if is_emergency:
                    prompt = (
                        "URGENT MEDICAL EMERGENCY CONTEXT: "
                        "Immediately tell the user to call 112 (India) or 911 (USA). "
                        f"\n\nUser message: {user_message}"
                    )
            else:
                chat = model.start_chat(history=[])
                prompt = self._build_full_prompt(user_message, is_emergency)

            if is_emergency:
                yield build_emergency_prefix()

            # Send message with streaming
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: chat.send_message(prompt, stream=True),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            # Fallback to mock on any Gemini error
            error_msg = str(e)
            print(f"[GeminiAIProvider] Error: {error_msg} — falling back to mock")
            mock = MockAIProvider()
            async for chunk in mock.stream_response(user_message, conversation_history, is_emergency):
                yield chunk

    async def get_full_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> str:
        try:
            model = self._genai.GenerativeModel(
                model_name=self.model_name,
                safety_settings=self.safety_settings,
                generation_config={"temperature": 0.3, "max_output_tokens": 256},
            )
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: model.generate_content(user_message),
            )
            return response.text
        except Exception as e:
            print(f"[GeminiAIProvider] get_full_response error: {e}")
            mock = MockAIProvider()
            return await mock.get_full_response(user_message, conversation_history)

    async def generate_session_title(self, first_message: str) -> str:
        try:
            model = self._genai.GenerativeModel(model_name=self.model_name)
            prompt = (
                f"Generate a short, descriptive title (maximum 5 words) for a healthcare "
                f"conversation that starts with: '{first_message}'. "
                f"Return ONLY the title. No quotes. No punctuation at the end."
            )
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: model.generate_content(prompt),
            )
            title = response.text.strip().strip('"').strip("'").strip(".")
            # Hard cap at 50 chars, break on word boundary
            if len(title) > 50:
                title = title[:50].rsplit(" ", 1)[0]
            return title
        except Exception:
            mock = MockAIProvider()
            return await mock.generate_session_title(first_message)


# ─────────────────────────────────────────────────────────────────────────────
# Anthropic provider (ready to re-enable when you add credits)
# ─────────────────────────────────────────────────────────────────────────────

class AnthropicAIProvider(BaseAIProvider):
    """Anthropic Claude provider. Set AI_PROVIDER=anthropic in .env to activate."""

    def __init__(self):
        from anthropic import AsyncAnthropic
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is not set in .env")
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"

    async def stream_response(
        self,
        user_message: str,
        conversation_history: list[dict],
        is_emergency: bool = False,
    ) -> AsyncGenerator[str, None]:
        messages = conversation_history + [{"role": "user", "content": user_message}]
        system = PULSEIQ_SYSTEM_PROMPT
        if is_emergency:
            yield build_emergency_prefix()
            system = "URGENT: This is a potential medical emergency. Tell user to call 112 immediately.\n\n" + system

        try:
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=1024,
                system=system,
                messages=messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as e:
            print(f"[AnthropicAIProvider] Error: {e} — falling back to mock")
            mock = MockAIProvider()
            async for chunk in mock.stream_response(user_message, conversation_history, is_emergency):
                yield chunk

    async def get_full_response(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> str:
        try:
            messages = conversation_history + [{"role": "user", "content": user_message}]
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=256,
                messages=messages,
            )
            return response.content[0].text
        except Exception as e:
            print(f"[AnthropicAIProvider] get_full_response error: {e}")
            return MockAIProvider().MOCK_RESPONSES[0]

    async def generate_session_title(self, first_message: str) -> str:
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=30,
                messages=[{
                    "role": "user",
                    "content": (
                        f"Generate a short title (maximum 5 words) for a healthcare chat "
                        f"starting with: '{first_message}'. "
                        f"Return ONLY the title. No quotes. No punctuation at the end."
                    ),
                }],
            )
            title = response.content[0].text.strip().strip('"').strip("'").strip(".")
            if len(title) > 50:
                title = title[:50].rsplit(" ", 1)[0]
            return title
        except Exception:
            return await MockAIProvider().generate_session_title(first_message) 


# ─────────────────────────────────────────────────────────────────────────────
# Provider factory — reads AI_PROVIDER from .env
# ─────────────────────────────────────────────────────────────────────────────

def _create_provider() -> BaseAIProvider:
    """
    Create and return the configured AI provider.
    Falls back to MockAIProvider if provider init fails.
    """
    provider_name = settings.AI_PROVIDER.lower().strip()
    print(f"[AIService] Initialising provider: {provider_name}")

    try:
        if provider_name == "gemini":
            provider = GeminiAIProvider()
            print("[AIService] ✅ Gemini provider ready")
            return provider

        elif provider_name == "anthropic":
            provider = AnthropicAIProvider()
            print("[AIService] ✅ Anthropic provider ready")
            return provider

        elif provider_name == "mock":
            print("[AIService] ✅ Mock provider ready (no API key needed)")
            return MockAIProvider()

        else:
            print(f"[AIService] ⚠️ Unknown provider '{provider_name}' — falling back to mock")
            return MockAIProvider()

    except Exception as e:
        print(f"[AIService] ❌ Failed to init '{provider_name}': {e}")
        print("[AIService] ⚠️ Falling back to mock provider")
        return MockAIProvider()


# ─────────────────────────────────────────────────────────────────────────────
# Singleton — import this everywhere
# ─────────────────────────────────────────────────────────────────────────────

ai_service: BaseAIProvider = _create_provider()