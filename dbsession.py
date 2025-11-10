import os

import psycopg2
from psycopg2 import sql

class DBSession:
    def __init__(
        self,
        schema: str | None = None,
        *,
        host: str | None = None,
        port: int | str | None = None,
        database: str | None = None,
        user: str | None = None,
        password: str | None = None,
    ):
        connection_host = host or os.environ.get("DB_HOST", "localhost")
        connection_port = port or os.environ.get("DB_PORT", "5432")
        connection_database = database or os.environ.get("DB_NAME", "public")
        connection_user = user or os.environ.get("DB_USER", "postgres")
        connection_password = password or os.environ.get("DB_PASSWORD", "password")

        self.connection = psycopg2.connect(
            host=connection_host,
            port=int(connection_port),
            database=connection_database,
            user=connection_user,
            password=connection_password,
        )
        self.schema = schema
        if self.schema:
            try:
                with self.connection.cursor() as cur:
                    cur.execute(sql.SQL("SET search_path TO {};").format(sql.Identifier(self.schema)))
                self.connection.commit()
            except Exception:
                self.connection.rollback()

    def run_sql_file(self, path):
        try:
            with open(path, 'r') as file:
                query = file.read()
            with self.connection.cursor() as cursor:
                cursor.execute(query)
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            print(f"Error executing query from file {path}: {e}")

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
