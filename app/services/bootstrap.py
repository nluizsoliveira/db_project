from __future__ import annotations

from pathlib import Path

from flask import current_app

from app.services import sql_queries

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SQL_ROOT = PROJECT_ROOT / "sql"
SCHEMA_FILE = SQL_ROOT / "upgrade_schema.sql"
FUNCTIONS_FILE = SQL_ROOT / "funcionalidades" / "upgrade_functions.sql"
TRIGGERS_FILE = SQL_ROOT / "funcionalidades" / "upgrade_triggers.sql"
POPULATE_DIR = SQL_ROOT / "populate_mocked_minimal_db"

_schema_ready = False


def ensure_schema_populated(db_session) -> None:
    global _schema_ready
    if _schema_ready:
        return

    table_count = _count_tables()
    if table_count == 0:
        _apply_schema(db_session)
        _apply_plpgsql_assets(db_session)
        _apply_sample_data(db_session)
    else:
        _apply_plpgsql_assets(db_session)

    _schema_ready = True


def _count_tables() -> int:
    result = sql_queries.fetch_one("queries/meta/table_count.sql")
    if not result:
        return 0
    return int(result.get("table_count", 0))


def _apply_schema(db_session) -> None:
    current_app.logger.info("Applying schema from %s", SCHEMA_FILE)
    db_session.run_sql_file(str(SCHEMA_FILE))


def _apply_sample_data(db_session) -> None:
    if not POPULATE_DIR.exists():
        return

    for sql_file in sorted(POPULATE_DIR.glob("*.sql")):
        current_app.logger.info("Loading sample data from %s", sql_file)
        db_session.run_sql_file(str(sql_file))


def _apply_plpgsql_assets(db_session) -> None:
    if FUNCTIONS_FILE.exists():
        current_app.logger.info("Applying functions from %s", FUNCTIONS_FILE)
        db_session.run_sql_file(str(FUNCTIONS_FILE))
    if TRIGGERS_FILE.exists():
        current_app.logger.info("Applying triggers from %s", TRIGGERS_FILE)
        db_session.run_sql_file(str(TRIGGERS_FILE))
