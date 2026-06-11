"""
pdf_service.py — Handles PDF file operations.

Responsibilities:
- Save uploaded files safely to disk
- Extract text content from PDFs
- Detect report metadata (lab name, report date, report type)
- Clean and normalise extracted text
"""

import os
import uuid
import re
from pathlib import Path
from typing import Optional

import PyPDF2

from app.core.config import settings


# ─── File Storage ───────────────────────────────────────────────────────────

def get_upload_dir() -> Path:
    """Return the upload directory, creating it if it doesn't exist."""
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def generate_safe_filename(original_filename: str) -> str:
    """
    Generate a UUID-based filename to prevent path traversal attacks
    and filename collisions.
    Example: "my report (1).pdf" → "a3f9c2d1-....pdf"
    """
    extension = Path(original_filename).suffix.lower()
    if extension not in [".pdf"]:
        extension = ".pdf"
    return f"{uuid.uuid4()}{extension}"


async def save_uploaded_file(file_bytes: bytes, stored_filename: str) -> str:
    """
    Save file bytes to the uploads directory.
    Returns the full path where the file was saved.
    """
    upload_dir = get_upload_dir()
    file_path = upload_dir / stored_filename

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return str(file_path)


def delete_file(storage_path: str) -> None:
    """Delete a file from disk. Silently ignores if file doesn't exist."""
    try:
        path = Path(storage_path)
        if path.exists():
            path.unlink()
    except Exception as e:
        print(f"[PDFService] Warning: could not delete file {storage_path}: {e}")


# ─── Text Extraction ─────────────────────────────────────────────────────────

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.
    Handles multi-page PDFs and cleans up whitespace.
    Returns empty string if extraction fails.
    """
    try:
        text_parts = []
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            total_pages = len(reader.pages)

            for page_num in range(total_pages):
                page = reader.pages[page_num]
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {page_num + 1} of {total_pages} ---\n{page_text}")

        raw_text = "\n\n".join(text_parts)
        return clean_extracted_text(raw_text)

    except Exception as e:
        print(f"[PDFService] Text extraction failed for {file_path}: {e}")
        return ""


def clean_extracted_text(text: str) -> str:
    """
    Clean up text extracted from PDFs.
    PDF extraction often produces extra spaces, broken lines, etc.
    """
    if not text:
        return ""

    # Replace multiple spaces with single space
    text = re.sub(r" {2,}", " ", text)

    # Replace more than 2 consecutive newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)

    return text.strip()


# ─── Metadata Detection ──────────────────────────────────────────────────────

def detect_report_type(text: str, filename: str) -> Optional[str]:
    """
    Try to detect what kind of medical report this is
    based on text content and filename keywords.
    """
    text_lower = text.lower()
    filename_lower = filename.lower()
    combined = text_lower + " " + filename_lower

    report_types = {
        "blood_test": [
            "complete blood count", "cbc", "haemoglobin", "hemoglobin",
            "wbc", "rbc", "platelet", "blood test", "haematology", "hematology",
            "hba1c", "fasting glucose", "lipid profile", "cholesterol",
        ],
        "liver_function": [
            "liver function", "lft", "sgpt", "sgot", "bilirubin",
            "alkaline phosphatase", "albumin", "liver panel",
        ],
        "kidney_function": [
            "kidney function", "kft", "creatinine", "urea", "uric acid",
            "egfr", "renal function", "bun",
        ],
        "thyroid": [
            "thyroid", "tsh", "t3", "t4", "thyroxine", "thyroid function",
        ],
        "xray": [
            "x-ray", "xray", "chest x", "radiograph", "radiology report",
        ],
        "mri": [
            "mri", "magnetic resonance", "mri scan", "mri report",
        ],
        "ecg": [
            "ecg", "electrocardiogram", "ekg", "cardiac rhythm",
        ],
        "urine_test": [
            "urine analysis", "urinalysis", "urine report", "urine routine",
        ],
        "diabetes": [
            "diabetes", "glucose tolerance", "ogtt", "fasting insulin",
        ],
    }

    for report_type, keywords in report_types.items():
        if any(keyword in combined for keyword in keywords):
            return report_type

    return "general"


def detect_lab_name(text: str) -> Optional[str]:
    """
    Try to detect the laboratory or hospital name from the report.
    Looks for common patterns in Indian medical reports.
    """
    # Look for lines near the top that might be lab names
    lines = text.split("\n")[:15]  # Check first 15 lines

    lab_keywords = [
        "diagnostic", "laboratory", "lab", "hospital", "clinic",
        "pathology", "health centre", "medical centre", "apollo",
        "fortis", "aiims", "manipal", "lal path", "dr lal", "srl",
        "metropolis", "thyrocare",
    ]

    for line in lines:
        line_lower = line.lower().strip()
        if any(keyword in line_lower for keyword in lab_keywords):
            if len(line.strip()) > 3 and len(line.strip()) < 100:
                return line.strip()

    return None


def detect_report_date(text: str) -> Optional[str]:
    """
    Try to extract the report date using common date patterns.
    """
    # Common date formats in Indian medical reports
    date_patterns = [
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",           # DD/MM/YYYY or DD-MM-YYYY
        r"\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",  # 12 Jan 2024
        r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b",  # Jan 12, 2024
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text[:2000], re.IGNORECASE)  # Check first 2000 chars
        if match:
            return match.group(1)

    return None