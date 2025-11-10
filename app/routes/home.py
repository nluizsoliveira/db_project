from flask import Blueprint, jsonify, g


home_blueprint = Blueprint("home", __name__)


@home_blueprint.route("/", methods=["GET"])
def index():
    db_session = g.get("db_session")
    if db_session is None:
        return jsonify({"error": "database session unavailable"}), 500

    with db_session.connection.cursor() as cursor:
        cursor.execute("SELECT NOW()")
        result = cursor.fetchone()

    return jsonify({"database_time": result[0].isoformat()})
