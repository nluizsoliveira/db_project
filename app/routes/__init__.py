from flask import Flask

from app.routes.home import home_blueprint


def register_routes(app: Flask) -> None:
    app.register_blueprint(home_blueprint)
