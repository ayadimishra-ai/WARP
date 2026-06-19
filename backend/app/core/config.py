from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_ENV: str = "local"
    APP_BASE_URL: str = "http://localhost:8000"
    PARENT_ORIGIN: str = "http://localhost:3000"

    # Database
    DB_HOST: str
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Hasura (kept for GraphQL subscriptions until full migration)
    HASURA_GRAPHQL_URL: str = ""
    HASURA_ADMIN_SECRET: str = ""
    HASURA_GRAPHQL_JWT_SECRET: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AWS
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = ""
    S3_BUCKET_REGION: str = "ap-south-1"
    S3_PUBLIC_BASE_URL: str = ""

    # Email / SMTP
    EMAIL_SMTP_HOST: str = ""
    EMAIL_SMTP_PORT: int = 587
    EMAIL_SMTP_SECURE: bool = True
    EMAIL_SMTP_USER: str = ""
    EMAIL_SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    # Internal shared keys
    WARP_INTERNAL_SHARED_KEY: str
    CRON_SECRET: str

    # RARA (document AI)
    RARA_URL: str = ""
    RARA_AUTH_KEY: str = ""

    # Webhook
    HASURA_WEBHOOK_SECRET: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
