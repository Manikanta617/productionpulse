"""Enterprise Security & Query Guardrails for ProductionPulse."""
import re
from typing import Tuple, Optional

# Disallowed SQL statement keywords for read-only analytical safety
BLOCKED_SQL_KEYWORDS = {
    "drop", "delete", "truncate", "alter", "insert", "update", 
    "detach", "attach", "kill", "grant", "revoke", "system", 
    "create", "rename", "optimize", "replace"
}

ALLOWED_TABLES = {
    "scenes", "characters", "locations", "budget_items", 
    "schedule_items", "projects", "scene_summary"
}

def sanitize_and_validate_sql(sql: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validate SQL query against injection and destructive operations.
    Returns: (is_valid: bool, sanitized_sql: str, error_message: Optional[str])
    """
    if not sql or not isinstance(sql, str):
        return False, "", "SQL query cannot be empty."

    cleaned_sql = sql.strip().rstrip(";")
    lower_sql = cleaned_sql.lower()

    # Block multiple chained queries separated by semicolons
    if ";" in cleaned_sql:
        return False, cleaned_sql, "Multi-statement query chaining is prohibited for security."

    # Must start with safe read-only operations
    if not (lower_sql.startswith("select") or lower_sql.startswith("with") or lower_sql.startswith("show") or lower_sql.startswith("describe") or lower_sql.startswith("explain")):
        return False, cleaned_sql, "Only read-only analytical queries (SELECT, WITH, SHOW, DESCRIBE) are permitted."

    # Check for destructive keywords as standalone words
    tokens = set(re.findall(r'\b[a-zA-Z_]+\b', lower_sql))
    forbidden_used = tokens.intersection(BLOCKED_SQL_KEYWORDS)
    if forbidden_used:
        return False, cleaned_sql, f"Security Violation: Destructive operation '{', '.join(forbidden_used)}' is strictly prohibited."

    return True, cleaned_sql, None


def validate_uploaded_file(filename: str, content: bytes, max_size_mb: int = 25) -> Tuple[bool, Optional[str]]:
    """
    Validate uploaded screenplay files for MIME/magic bytes and size limit.
    """
    max_bytes = max_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        return False, f"File size exceeds maximum permitted limit of {max_size_mb}MB."

    lower_name = filename.lower()
    allowed_extensions = (".pdf", ".txt", ".fountain")
    if not any(lower_name.endswith(ext) for ext in allowed_extensions):
        return False, "Unsupported file format. Please upload a PDF, TXT, or Fountain screenplay."

    if lower_name.endswith(".pdf"):
        # Validate PDF magic header '%PDF-'
        if not content.startswith(b"%PDF-"):
            return False, "Invalid PDF file: Missing standard PDF header."

    return True, None
