from flask import jsonify

from app.routes.reports import reports_blueprint
from app.services.database import executor as sql_queries
from app.services.auth.decorators import require_auth


@reports_blueprint.get("/overview", endpoint="overview")
@require_auth
def overview():
    reservation_rollup = sql_queries.fetch_all(
        "queries/reports/reservations_rollup.sql"
    )
    activities_cube = sql_queries.fetch_all(
        "queries/reports/activities_cube.sql"
    )
    participants_totals = sql_queries.fetch_all(
        "queries/reports/participants_totals.sql"
    )
    installation_ranking = sql_queries.fetch_all(
        "queries/reports/installation_ranking.sql"
    )
    activity_occurrences = sql_queries.fetch_all(
        "queries/reports/activity_occurrences.sql"
    )
    installations_most_reserved = sql_queries.fetch_all(
        "queries/reports/installations_most_reserved.sql"
    )
    reservations_row_number = sql_queries.fetch_all(
        "queries/reports/reservations_row_number.sql"
    )
    activities_dense_rank = sql_queries.fetch_all(
        "queries/reports/activities_dense_rank.sql"
    )
    reservations_monthly_growth = sql_queries.fetch_all(
        "queries/reports/reservations_monthly_growth.sql"
    )
    reservations_cumulative = sql_queries.fetch_all(
        "queries/reports/reservations_cumulative.sql"
    )
    activities_moving_average = sql_queries.fetch_all(
        "queries/reports/activities_moving_average.sql"
    )
    educator_activities_count = sql_queries.fetch_all(
        "queries/reports/educator_activities_count.sql"
    )

    return jsonify({
        "success": True,
        "reservation_rollup": reservation_rollup,
        "activities_cube": activities_cube,
        "participants_totals": participants_totals,
        "installation_ranking": installation_ranking,
        "activity_occurrences": activity_occurrences,
        "installations_most_reserved": installations_most_reserved,
        "reservations_row_number": reservations_row_number,
        "activities_dense_rank": activities_dense_rank,
        "reservations_monthly_growth": reservations_monthly_growth,
        "reservations_cumulative": reservations_cumulative,
        "activities_moving_average": activities_moving_average,
        "educator_activities_count": educator_activities_count,
    })
