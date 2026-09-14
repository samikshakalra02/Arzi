"""
ARZI Autonomous Civic RTI & Statutory Legal Intelligence Platform
Real Live Cloud AI Drafting Engine
Connects over the internet to:
1. Anthropic API (Claude Sonnet Model 4.6 / Claude 3.7 Sonnet)
2. OpenAI / OpenRouter API (GPT-OSS 1208 / GPT-4o)
3. Google Gemini API (Gemini 3.8 Flash / 3.7 Flash)
"""

import os
import json
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class CloudLLMEngine:
    def __init__(self):
        self.timeout = 35.0

    def get_api_key(self, provider: str) -> Optional[str]:
        """Retrieves API key from environment variables or .env file."""
        if provider == "gemini":
            return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        elif provider == "claude":
            return os.environ.get("ANTHROPIC_API_KEY")
        elif provider == "gpt":
            return os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENROUTER_API_KEY")
        return None

    def get_provider_and_model_id(self, model_display_name: str) -> tuple[str, str]:
        """Maps user-selected model display name to provider and remote model id."""
        name_lower = (model_display_name or "").lower().strip()
        if "claude" in name_lower or "sonnet" in name_lower:
            # Map Claude Sonnet 4.6 to Anthropic latest sonnet
            return "claude", os.environ.get("ANTHROPIC_MODEL_ID", "claude-3-7-sonnet-20250219")
        elif "gpt" in name_lower or "oss" in name_lower:
            # Map GPT-OSS 1208 to OpenAI or OpenRouter model
            return "gpt", os.environ.get("OPENAI_MODEL_ID", "gpt-4o")
        elif "3.7" in name_lower:
            return "gemini", os.environ.get("GEMINI_37_MODEL_ID", "gemini-2.0-flash")
        else:
            # Default to Gemini 3.8 Flash (Gemini 2.0 Flash / 1.5 Flash endpoint)
            return "gemini", os.environ.get("GEMINI_38_MODEL_ID", "gemini-2.0-flash")

    def build_legal_prompt(self, document_type: str, language: str, data: Dict[str, Any]) -> str:
        is_hi = (language == "hi")
        lang_instruction = "HINDI (Devanagari script) with authentic legal terminology" if is_hi else "ENGLISH in formal statutory legal style"
        
        return f"""You are a senior statutory advocate of the High Court / Supreme Court of India.
Draft an official, legally enforceable {document_type} in {lang_instruction}.

APPLICANT / COMPLAINANT PARTICULARS:
- Name: {data.get('name', 'Citizen Applicant')}
- Address: {data.get('address', 'Civil Lines, Delhi')}
- Contact: {data.get('contact', '9876543210')}

RESPONDENT PUBLIC AUTHORITY:
- Department: {data.get('department', 'Public Authority')}
- Office / Address: {data.get('office_address', 'District Office')}
- Designated Officer: {data.get('pio_name', 'Designated PIO')} ({data.get('pio_designation', 'Public Information Officer')})

MATTER & FACTUAL GROUNDS:
- Subject Matter: {data.get('subject', 'Statutory Inquiry')}
- Specific Questions / Requisitions under Section 2(f):
{data.get('questions', '1. Supply certified true copies of relevant files and administrative noting.')}
- Statutory Grounds / Delay: {data.get('grounds', 'Deemed refusal beyond statutory limit.')}
- Relief / Prayers Sought: {data.get('prayers', 'Direct immediate compliance and supply certified records free of cost.')}
- Statutory Fees / Penalties: {data.get('fees', 'Statutory Fee of Rs. 10 paid. Notice of Section 20 penalty.')}

STATUTORY REQUIREMENTS:
1. Cite relevant Indian laws (RTI Act 2005 Sec 6(1) or 19(1) or 20, CPC 1908 Sec 80, BNS 2023 Sec 198/318(4), IPC 166/409).
2. Format as a clean, complete, professional legal instrument ready for official submission.
3. Do not include chat commentary or conversational filler. Output only the complete legal instrument."""

    def call_gemini(self, model_id: str, prompt: str, api_key: str) -> str:
        """Makes real live cloud API call to Google Gemini API over the internet."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 4096
            }
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"Google Gemini API error ({resp.status_code}): {resp.text}")
            result_json = resp.json()
            candidates = result_json.get("candidates", [])
            if not candidates:
                raise RuntimeError(f"Gemini returned empty candidates: {result_json}")
            text_parts = candidates[0].get("content", {}).get("parts", [])
            return "".join(part.get("text", "") for part in text_parts)

    def call_claude(self, model_id: str, prompt: str, api_key: str) -> str:
        """Makes real live cloud API call to Anthropic Claude API over the internet."""
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": model_id,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"Anthropic Claude API error ({resp.status_code}): {resp.text}")
            result_json = resp.json()
            content_items = result_json.get("content", [])
            return "".join(item.get("text", "") for item in content_items if item.get("type") == "text")

    def call_gpt(self, model_id: str, prompt: str, api_key: str) -> str:
        """Makes real live cloud API call to OpenAI or OpenRouter API over the internet."""
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        url = f"{base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": "You are a senior Indian statutory legal draftsman."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 4096
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"OpenAI/GPT API error ({resp.status_code}): {resp.text}")
            result_json = resp.json()
            choices = result_json.get("choices", [])
            if not choices:
                raise RuntimeError(f"GPT returned empty choices: {result_json}")
            return choices[0].get("message", {}).get("content", "")

    def generate_live(self, document_type: str, language: str, data: Dict[str, Any], model_name: str) -> tuple[bool, str]:
        """
        Executes real live cloud call to chosen AI model over the internet.
        Returns: (is_live_success: bool, content: str)
        """
        provider, model_id = self.get_provider_and_model_id(model_name)
        api_key = self.get_api_key(provider)

        key_env_names = {
            "gemini": "GEMINI_API_KEY (or GOOGLE_API_KEY)",
            "claude": "ANTHROPIC_API_KEY",
            "gpt": "OPENAI_API_KEY (or OPENROUTER_API_KEY)"
        }

        if not api_key:
            return False, f"[LIVE CLOUD AI STATUS: PENDING API KEY]\nTo generate live using {model_name}, please provide your {key_env_names.get(provider, 'API Key')}."

        prompt = self.build_legal_prompt(document_type, language, data)

        try:
            if provider == "gemini":
                content = self.call_gemini(model_id, prompt, api_key)
            elif provider == "claude":
                content = self.call_claude(model_id, prompt, api_key)
            elif provider == "gpt":
                content = self.call_gpt(model_id, prompt, api_key)
            else:
                return False, f"Unsupported cloud provider: {provider}"

            live_text = content.strip() + f"\n\n[LIVE CLOUD AI GENERATED VIA: {model_name} ({model_id}) | REAL-TIME INTERNET ENGINE]"
            return True, live_text

        except Exception as e:
            logger.error(f"Live Cloud API call failed for {model_name}: {e}")
            return False, f"[LIVE CLOUD API ERROR: {str(e)}]"

cloud_llm = CloudLLMEngine()
