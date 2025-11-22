from flask import Blueprint

staff_blueprint = Blueprint("staff", __name__, url_prefix="/staff")


def init_app() -> None:
    from . import dashboard  # noqa: F401
    from . import activities  # noqa: F401
    from . import equipment  # noqa: F401
    from . import installations  # noqa: F401
