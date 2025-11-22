from flask import Blueprint

admin_blueprint = Blueprint("admin", __name__, url_prefix="/admin")


def init_app() -> None:
    """
    Import only the administrative routes that are active in the system.
    """

    from . import dashboard  # noqa: F401
    from . import activities  # noqa: F401
    from . import installations  # noqa: F401
    from . import equipment  # noqa: F401
    from . import events  # noqa: F401
    from . import users  # noqa: F401
    from . import reservations  # noqa: F401
