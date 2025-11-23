from flask import Blueprint

views_blueprint = Blueprint("views", __name__, url_prefix="/views")


def init_app() -> None:
    from . import api  # noqa: F401
