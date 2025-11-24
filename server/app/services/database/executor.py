from __future__ import annotations

from datetime import date, datetime, time
from pathlib import Path
from typing import Any, Mapping

from flask import current_app, g
from psycopg2.extras import RealDictCursor


DEFAULT_SQL_ROOT = Path(__file__).resolve().parents[3] / "sql"


class SQLExecutionError(RuntimeError):
    """Raised when a SQL asset cannot be executed."""


def _make_json_serializable(obj: Any) -> Any:
    """Convert non-JSON-serializable objects to strings."""
    from flask import current_app

    if isinstance(obj, (time, date, datetime)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_make_json_serializable(item) for item in obj]
    # Handle psycopg2 array types and other sequence-like objects
    try:
        if hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes)):
            current_app.logger.debug(f"[_make_json_serializable] Convertendo objeto iterável: {type(obj)}")
            result = [_make_json_serializable(item) for item in obj]
            current_app.logger.debug(f"[_make_json_serializable] Convertido para lista com {len(result)} itens")
            return result
    except (TypeError, ValueError) as e:
        current_app.logger.warning(f"[_make_json_serializable] Erro ao converter objeto iterável {type(obj)}: {e}")
        pass
    return obj


def _get_sql_root() -> Path:
    configured_root = current_app.config.get("SQL_ROOT_PATH")
    if configured_root:
        return Path(configured_root)
    return DEFAULT_SQL_ROOT


def _load_sql(relative_path: str) -> str:
    sql_root = _get_sql_root()
    sql_path = sql_root / relative_path
    if not sql_path.exists():
        raise SQLExecutionError(f"SQL asset not found: {sql_path}")

    return sql_path.read_text(encoding="utf-8")


def _get_connection():
    db_session = g.get("db_session")
    if db_session is None:
        return None
    return db_session.connection


def fetch_all(
    relative_path: str,
    params: Mapping[str, Any] | None = None,
) -> list[dict[str, Any]]:
    connection = _get_connection()
    if connection is None:
        return []

    query = _load_sql(relative_path)
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        results = cursor.fetchall()
        # Convert to list of dicts and make JSON serializable
        return [_make_json_serializable(dict(row)) for row in results]


def fetch_one(
    relative_path: str,
    params: Mapping[str, Any] | None = None,
) -> dict[str, Any] | None:
    from flask import current_app

    connection = _get_connection()
    if connection is None:
        current_app.logger.warning("[fetch_one] Conexão com banco não disponível")
        return None

    query = _load_sql(relative_path)
    current_app.logger.debug(f"[fetch_one] Executando query: {relative_path} com params: {params}")
    current_app.logger.debug(f"[fetch_one] Tipo de params: {type(params)}")

    # Preparar parâmetros - usar None se não houver params, ou dict se houver
    execute_params = params if params else None
    if execute_params is not None and not isinstance(execute_params, dict):
        current_app.logger.warning(f"[fetch_one] Params não é dict, convertendo. Tipo: {type(execute_params)}")
        execute_params = dict(execute_params) if hasattr(execute_params, 'items') else {}

    current_app.logger.debug(f"[fetch_one] Execute params final: {execute_params}")

    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        if execute_params:
            cursor.execute(query, execute_params)
        else:
            cursor.execute(query)
        result = cursor.fetchone()

        if result is None:
            current_app.logger.debug(f"[fetch_one] Nenhum resultado encontrado para query: {relative_path}")
            return None

        current_app.logger.debug(f"[fetch_one] Tipo do result: {type(result)}")
        current_app.logger.debug(f"[fetch_one] Result keys: {list(result.keys()) if hasattr(result, 'keys') else 'N/A'}")

        # RealDictRow is already dict-like, but convert to regular dict
        # to ensure proper serialization of arrays and other types
        try:
            result_dict = dict(result)
            current_app.logger.debug(f"[fetch_one] Result dict criado com sucesso, keys: {list(result_dict.keys())}")

            # Log valores especiais antes da serialização
            for key, value in result_dict.items():
                if not isinstance(value, (str, int, float, bool, type(None))):
                    current_app.logger.debug(f"[fetch_one] Key '{key}' tem tipo especial: {type(value)}, valor: {value}")

            # Make JSON serializable
            serialized = _make_json_serializable(result_dict)
            current_app.logger.debug(f"[fetch_one] Result serializado com sucesso")
            return serialized
        except Exception as e:
            current_app.logger.error(f"[fetch_one] Erro ao processar result: {e}")
            import traceback
            current_app.logger.error(f"[fetch_one] Traceback: {traceback.format_exc()}")
            raise


def execute_statement(
    relative_path: str,
    params: Mapping[str, Any] | None = None,
) -> None:
    connection = _get_connection()
    if connection is None:
        return

    query = _load_sql(relative_path)
    with connection.cursor() as cursor:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
    connection.commit()
