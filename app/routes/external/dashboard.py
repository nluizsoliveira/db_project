from flask import render_template

from app.routes.external import external_blueprint
from app.services import sql_queries


@external_blueprint.get("/", endpoint="dashboard")
def dashboard() -> str:
    participations = sql_queries.fetch_all(
        "queries/external/external_participations.sql"
    )
    return render_template("external/dashboard.html", participations=participations)
