from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from app.services import sql_queries


auth_blueprint = Blueprint("auth", __name__, url_prefix="/auth")


@auth_blueprint.route("/login", methods=["GET"])
def login():
    if session.get("user_id"):
        return redirect(_get_redirect_url_for_user())
    return render_template("auth/login.html")


@auth_blueprint.route("/login", methods=["POST"])
def login_post():
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "").strip()
    ip_origin = request.remote_addr

    if not email or not password:
        flash("Email and password are required", "error")
        return render_template("auth/login.html"), 400

    result = sql_queries.fetch_one(
        "queries/auth/login_user.sql",
        {
            "email_or_cpf": email,
            "password": password,
            "ip_origin": ip_origin,
        },
    )

    if not result or not result.get("result"):
        flash("Invalid credentials", "error")
        return render_template("auth/login.html"), 401

    auth_data = result["result"]

    if not auth_data.get("success"):
        flash(auth_data.get("message", "Invalid credentials"), "error")
        return render_template("auth/login.html"), 401

    # Store user data in session
    session["user_id"] = auth_data["user_id"]
    session["user_email"] = auth_data["email"]
    session["user_nome"] = auth_data["nome"]
    session["profile_access"] = _build_profile_access(auth_data.get("roles", []))

    return redirect(_get_redirect_url_for_user())


@auth_blueprint.route("/register", methods=["GET"])
def register():
    if session.get("user_id"):
        return redirect(_get_redirect_url_for_user())
    return render_template("auth/register.html")


@auth_blueprint.route("/register", methods=["POST"])
def register_post():
    cpf = request.form.get("cpf", "").strip()
    nusp = request.form.get("nusp", "").strip()
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "").strip()
    password_confirm = request.form.get("password_confirm", "").strip()

    if not all([cpf, nusp, email, password, password_confirm]):
        flash("All fields are required", "error")
        return render_template("auth/register.html"), 400

    if password != password_confirm:
        flash("Passwords do not match", "error")
        return render_template("auth/register.html"), 400

    result = sql_queries.fetch_one(
        "queries/auth/request_registration.sql",
        {
            "cpf_pessoa": cpf,
            "nusp": nusp,
            "email": email,
            "password": password,
        },
    )

    if not result or not result.get("result"):
        flash("Error processing registration request", "error")
        return render_template("auth/register.html"), 500

    registration_data = result["result"]

    if not registration_data.get("success"):
        flash(registration_data.get("message", "Error processing request"), "error")
        return render_template("auth/register.html"), 400

    flash(registration_data.get("message", "Registration request created successfully"), "success")
    return redirect(url_for("auth.login"))


@auth_blueprint.route("/pending-registrations", methods=["GET"])
def pending_registrations():
    if not session.get("user_id"):
        flash("Authentication required", "error")
        return redirect(url_for("auth.login"))

    # Check if user is admin (simple check via session)
    profile_access = session.get("profile_access", {})
    if not profile_access.get("admin"):
        flash("Admin access required", "error")
        return redirect(url_for("home.index"))

    registrations = sql_queries.fetch_all("queries/auth/list_pending_registrations.sql")

    return render_template("auth/pending_registrations.html", registrations=registrations)


@auth_blueprint.route("/approve-registration", methods=["POST"])
def approve_registration():
    if not session.get("user_id"):
        flash("Authentication required", "error")
        return redirect(url_for("auth.login"))

    profile_access = session.get("profile_access", {})
    if not profile_access.get("admin"):
        flash("Admin access required", "error")
        return redirect(url_for("home.index"))

    id_solicitacao = request.form.get("id_solicitacao")
    if not id_solicitacao:
        flash("Invalid request", "error")
        return redirect(url_for("auth.pending_registrations"))

    result = sql_queries.fetch_one(
        "queries/auth/approve_registration.sql",
        {
            "id_solicitacao": int(id_solicitacao),
            "cpf_admin": session["user_id"],
        },
    )

    if result and result.get("result") and result["result"].get("success"):
        flash("Registration approved successfully", "success")
    else:
        message = result.get("result", {}).get("message", "Error approving registration") if result else "Error processing request"
        flash(message, "error")

    return redirect(url_for("auth.pending_registrations"))


@auth_blueprint.route("/reject-registration", methods=["POST"])
def reject_registration():
    if not session.get("user_id"):
        flash("Authentication required", "error")
        return redirect(url_for("auth.login"))

    profile_access = session.get("profile_access", {})
    if not profile_access.get("admin"):
        flash("Admin access required", "error")
        return redirect(url_for("home.index"))

    id_solicitacao = request.form.get("id_solicitacao")
    observacoes = request.form.get("observacoes", "").strip()

    if not id_solicitacao:
        flash("Invalid request", "error")
        return redirect(url_for("auth.pending_registrations"))

    result = sql_queries.fetch_one(
        "queries/auth/reject_registration.sql",
        {
            "id_solicitacao": int(id_solicitacao),
            "cpf_admin": session["user_id"],
            "observacoes": observacoes if observacoes else None,
        },
    )

    if result and result.get("result") and result["result"].get("success"):
        flash("Registration rejected", "success")
    else:
        message = result.get("result", {}).get("message", "Error rejecting registration") if result else "Error processing request"
        flash(message, "error")

    return redirect(url_for("auth.pending_registrations"))


@auth_blueprint.route("/logout", methods=["GET"])
def logout():
    session.clear()
    return redirect(url_for("home.index"))


def _build_profile_access(roles):
    """Build profile access dictionary from roles array."""
    if not roles:
        return {}
    return {role: True for role in roles}


def _get_redirect_url_for_user():
    """Get redirect URL based on user's primary role."""
    profile_access = session.get("profile_access", {})
    if profile_access.get("admin"):
        return url_for("admin.dashboard")
    if profile_access.get("staff"):
        return url_for("staff.dashboard")
    if profile_access.get("internal"):
        return url_for("internal.dashboard")
    if profile_access.get("external"):
        return url_for("external.dashboard")
    return url_for("home.index")
