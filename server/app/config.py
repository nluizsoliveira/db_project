import os


class AppConfig:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "change-me")
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    # Session configuration
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "false").lower() == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_NAME = "session"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", "5432"))
    DB_NAME = os.environ.get("DB_NAME", "public")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
    DB_SCHEMA = os.environ.get("DB_SCHEMA")
