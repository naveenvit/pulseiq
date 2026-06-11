"""
emergency_service.py — Emergency detection and escalation for PulseIQ.

Detection runs in two layers:
  Layer 1 — Keyword scan (instant, no API call)
  Layer 2 — Context analysis (checks if keyword is used in a concerning way)

The keyword layer catches obvious emergencies immediately.
The context layer reduces false positives (e.g. "my grandfather had a heart attack
last year" should not trigger the same response as "I'm having chest pain right now").
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.emergency import EmergencyEvent
from app.models.user import User


# ─── Emergency Keywords ───────────────────────────────────────────────────────
# Organised by category and severity

CRITICAL_KEYWORDS = {
    # Immediately life-threatening — always escalate
    "cardiac": [
        "heart attack", "cardiac arrest", "my heart stopped",
        "chest crushing", "chest tightening", "left arm pain",
    ],
    "breathing": [
        "can't breathe", "cannot breathe", "not breathing",
        "stopped breathing", "choking", "airways blocked",
    ],
    "stroke": [
        "face drooping", "arm weakness", "speech difficulty",
        "sudden numbness", "sudden confusion", "stroke",
        "slurred speech", "can't speak",
    ],
    "unconscious": [
        "unconscious", "unresponsive", "passed out", "collapsed",
        "fainted and won't wake", "not waking up",
    ],
    "self_harm": [
        "kill myself", "end my life", "want to die",
        "suicidal", "overdose", "took all my pills",
        "cutting myself", "hurting myself",
    ],
    "severe_bleeding": [
        "bleeding won't stop", "severe bleeding",
        "blood won't clot", "losing a lot of blood",
    ],
    "anaphylaxis": [
        "anaphylaxis", "allergic reaction throat",
        "throat closing", "epipen", "severe allergic",
    ],
}

HIGH_RISK_KEYWORDS = {
    # Serious but may need context — still flag for safety
    "chest": [
        "chest pain", "chest pressure", "chest tightness",
        "chest discomfort", "pain in chest",
    ],
    "breathing_difficulty": [
        "difficulty breathing", "shortness of breath",
        "hard to breathe", "breathing problem",
        "gasping", "wheezing badly",
    ],
    "emergency_signals": [
        "emergency", "ambulance", "dying", "please help",
        "call doctor now", "urgent help",
    ],
    "seizure": [
        "seizure", "convulsion", "fit", "epileptic",
        "shaking uncontrollably",
    ],
    "severe_pain": [
        "unbearable pain", "worst pain", "severe pain",
        "excruciating", "pain 10 out of 10",
    ],
}

# Keywords that look scary but are almost never actual emergencies
LIKELY_HISTORICAL = [
    "had a heart attack", "history of", "my father had",
    "my mother had", "years ago", "last year", "in the past",
    "was diagnosed", "used to have", "survived",
]


# ─── Detection Logic ──────────────────────────────────────────────────────────

def scan_keywords(message: str) -> dict:
    """
    Layer 1: Fast keyword scan.
    Returns detection results with matched keywords and severity.
    """
    message_lower = message.lower()

    # Check if message is likely historical/contextual (lower the alarm)
    is_historical = any(phrase in message_lower for phrase in LIKELY_HISTORICAL)

    matched_critical = []
    matched_high = []

    for category, keywords in CRITICAL_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                matched_critical.append(keyword)

    for category, keywords in HIGH_RISK_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                matched_high.append(keyword)

    # Determine severity
    if matched_critical and not is_historical:
        return {
            "is_emergency": True,
            "severity": "critical",
            "confidence": "high",
            "keywords": matched_critical + matched_high,
            "is_historical": False,
        }

    if matched_critical and is_historical:
        return {
            "is_emergency": False,
            "severity": "historical",
            "confidence": "low",
            "keywords": matched_critical,
            "is_historical": True,
        }

    if matched_high and not is_historical:
        return {
            "is_emergency": True,
            "severity": "high",
            "confidence": "medium",
            "keywords": matched_high,
            "is_historical": False,
        }

    return {
        "is_emergency": False,
        "severity": "none",
        "confidence": "low",
        "keywords": [],
        "is_historical": is_historical,
    }


def build_emergency_response(severity: str, keywords: list[str]) -> dict:
    """
    Build the response message and UI flags based on severity.
    """
    if severity == "critical":
        return {
            "response_message": (
                "🚨 **This sounds like a medical emergency.**\n\n"
                "**Please call 112 (India) immediately or have someone call for you.**\n\n"
                "If you are alone:\n"
                "- Unlock your door if possible\n"
                "- Stay on the phone with emergency services\n"
                "- Do not drive yourself to the hospital\n\n"
                "Emergency services are trained to help you right now. "
                "Please make that call before doing anything else.\n\n"
                "⚕️ PulseIQ is an educational tool and cannot replace emergency medical care."
            ),
            "call_emergency": True,
            "escalated_to_911": True,
        }

    if severity == "high":
        return {
            "response_message": (
                "⚠️ **What you're describing could be serious.**\n\n"
                "If your symptoms are severe, sudden, or getting worse — "
                "**please call 112 or go to the nearest emergency room immediately.**\n\n"
                "While you decide:\n"
                "- Sit or lie down in a comfortable position\n"
                "- Do not eat or drink anything\n"
                "- Have someone stay with you if possible\n"
                "- Keep your phone nearby\n\n"
                "If you're unsure whether this is an emergency, it's always safer to call. "
                "Emergency services will not mind a precautionary call.\n\n"
                "⚕️ This is educational guidance only. Please seek professional medical care."
            ),
            "call_emergency": True,
            "escalated_to_911": False,
        }

    # Fallback — shouldn't normally reach here
    return {
        "response_message": (
            "If you believe you are experiencing a medical emergency, "
            "please call 112 immediately.\n\n"
            "⚕️ PulseIQ provides educational information only."
        ),
        "call_emergency": False,
        "escalated_to_911": False,
    }


# ─── Database Operations ──────────────────────────────────────────────────────

async def log_emergency_event(
    db: AsyncSession,
    user: User,
    trigger_message: str,
    detected_keywords: list[str],
    detection_method: str,
    response_shown: str,
    escalated_to_911: bool,
    session_id: Optional[uuid.UUID] = None,
) -> EmergencyEvent:
    """Save an emergency detection event to the database."""
    event = EmergencyEvent(
        user_id=user.id,
        trigger_message=trigger_message,
        detected_keywords=detected_keywords,
        detection_method=detection_method,
        response_shown=response_shown,
        escalated_to_911=escalated_to_911,
        session_id=session_id,
    )
    db.add(event)
    await db.flush()
    await db.refresh(event)

    print(
        f"[EmergencyService] 🚨 Event logged — "
        f"user={user.id} method={detection_method} "
        f"escalated={escalated_to_911} keywords={detected_keywords}"
    )
    return event


async def list_emergency_events(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[EmergencyEvent]:
    """List a user's emergency events, most recent first."""
    result = await db.execute(
        select(EmergencyEvent)
        .where(EmergencyEvent.user_id == user_id)
        .order_by(desc(EmergencyEvent.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ─── Main Detection Entry Point ───────────────────────────────────────────────

async def detect_and_respond(
    db: AsyncSession,
    user: User,
    message: str,
    session_id: Optional[uuid.UUID] = None,
) -> dict:
    """
    Full emergency detection pipeline.

    1. Run keyword scan
    2. If emergency detected, build response + log event
    3. Return structured result for the endpoint

    Returns a dict matching EmergencyDetectResponse fields.
    """
    scan = scan_keywords(message)

    if not scan["is_emergency"]:
        return {
            "is_emergency": False,
            "confidence": scan["confidence"],
            "detected_keywords": scan["keywords"],
            "detection_method": "none",
            "response_message": "",
            "call_emergency": False,
            "emergency_number": "112",
        }

    severity = scan["severity"]
    keywords = scan["keywords"]
    response_data = build_emergency_response(severity, keywords)

    # Log the event
    await log_emergency_event(
        db=db,
        user=user,
        trigger_message=message,
        detected_keywords=keywords,
        detection_method="keyword",
        response_shown=response_data["response_message"],
        escalated_to_911=response_data["escalated_to_911"],
        session_id=session_id,
    )

    return {
        "is_emergency": True,
        "confidence": scan["confidence"],
        "detected_keywords": keywords,
        "detection_method": "keyword",
        "response_message": response_data["response_message"],
        "call_emergency": response_data["call_emergency"],
        "emergency_number": "112",
    }