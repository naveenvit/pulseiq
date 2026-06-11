import resend
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import settings

def generate_verification_token() -> tuple[str, datetime]:
    """Generate a secure token and its expiry time (24 hours from now)."""
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    return token, expires


def send_verification_email(to_email: str, full_name: Optional[str], token: str) -> bool:
    """
    Send a verification email to the user.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.RESEND_API_KEY:
        # In development without Resend, just print to console
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        print(f"\n[DEV MODE] Verification email for {to_email}")
        print(f"[DEV MODE] Click this link to verify: {verify_url}\n")
        return True

    resend.api_key = settings.RESEND_API_KEY

    name = full_name or "there"
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px; }}
        .logo {{ font-size: 22px; font-weight: 700; color: #2563eb; margin-bottom: 32px; }}
        h1 {{ font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 16px; }}
        p {{ font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px; }}
        .btn {{ display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }}
        .footer {{ font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px; }}
        .url {{ font-size: 12px; color: #94a3b8; word-break: break-all; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">PulseIQ</div>
        <h1>Verify your email</h1>
        <p>Hi {name},</p>
        <p>Thanks for signing up for PulseIQ! Click the button below to verify your email address and activate your account.</p>
        <a href="{verify_url}" class="btn">Verify my email</a>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <div class="footer">
          <p>If you didn't create a PulseIQ account, you can safely ignore this email.</p>
          <p class="url">Or copy this link: {verify_url}</p>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Verify your PulseIQ email address",
            "html": html_body,
        })
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send verification email: {e}")
        return False


def send_already_verified_email(to_email: str, full_name: Optional[str]) -> bool:
    """Tell the user their email is already verified (safety notice)."""
    if not settings.RESEND_API_KEY:
        print(f"[DEV MODE] Already-verified notice for {to_email}")
        return True

    resend.api_key = settings.RESEND_API_KEY
    name = full_name or "there"

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Your PulseIQ email is already verified",
            "html": f"<p>Hi {name}, your email is already verified. No action needed.</p>",
        })
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False
    
def send_password_reset_email(to_email: str, full_name: Optional[str], token: str) -> bool:
    """Send a password reset email."""
    if not settings.RESEND_API_KEY:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        print(f"\n[DEV MODE] Password reset email for {to_email}")
        print(f"[DEV MODE] Click this link to reset: {reset_url}\n")
        return True

    resend.api_key = settings.RESEND_API_KEY
    name = full_name or "there"
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 40px; }}
        .logo {{ font-size: 22px; font-weight: 700; color: #2563eb; margin-bottom: 32px; }}
        h1 {{ font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 16px; }}
        p {{ font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px; }}
        .btn {{ display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }}
        .footer {{ font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px; }}
        .url {{ font-size: 12px; color: #94a3b8; word-break: break-all; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">PulseIQ</div>
        <h1>Reset your password</h1>
        <p>Hi {name},</p>
        <p>We received a request to reset your PulseIQ password. Click the button below to choose a new one.</p>
        <a href="{reset_url}" class="btn">Reset my password</a>
        <p>This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email.</p>
        <div class="footer">
          <p class="url">Or copy this link: {reset_url}</p>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Reset your PulseIQ password",
            "html": html_body,
        })
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send reset email: {e}")
        return False