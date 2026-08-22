"""Configuration module for ProductionPulse backend."""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Google Cloud
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    google_application_credentials: str = ""

    # ClickHouse
    clickhouse_host: str = ""
    clickhouse_port: int = 8443
    clickhouse_username: str = "default"
    clickhouse_password: str = ""
    clickhouse_database: str = "default"

    # GCS
    gcs_bucket: str = ""

    # Parallel AI Search
    paralle_ai_api: str = ""
    parallel_api_key: str = ""

    # App
    app_env: str = "development"
    cors_origins: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
