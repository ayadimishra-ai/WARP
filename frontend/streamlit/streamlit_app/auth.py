"""
auth.py — Lightweight role-based access control for the sk.lite.

Three roles (enough for now, expandable to full Snowkap model later):
  Admin       — full access: configure, enter data, export, manage users
  Contributor — enter data, view dashboard; cannot export disclosures or manage users
  Viewer      — read-only: dashboard and reports only

Credentials are stored in data/users.json (bcrypt-hashed passwords).
In production, replace with SSO / LDAP / OAuth.
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Optional

import streamlit as st

try:
    import bcrypt as _bcrypt_lib
    _BCRYPT_AVAILABLE = True
except ImportError:
    import hashlib
    _BCRYPT_AVAILABLE = False

USERS_FILE = Path(__file__).parents[1] / "data" / "users.json"

# Industry/sector classification (GICS-inspired, India-relevant)
INDUSTRY_CHOICES = [
    "Manufacturing — Automotive",
    "Manufacturing — Cement / Construction materials",
    "Manufacturing — Chemicals & petrochemicals",
    "Manufacturing — Electronics / EMS",
    "Manufacturing — FMCG / Consumer goods",
    "Manufacturing — Metals & mining",
    "Manufacturing — Pharmaceuticals",
    "Manufacturing — Textiles & apparel",
    "Energy — Oil & gas (upstream/midstream)",
    "Energy — Power generation / utilities",
    "Energy — Renewables",
    "Agriculture, forestry & food processing",
    "Financial services — Banking",
    "Financial services — Insurance",
    "Financial services — Asset management",
    "Information technology & software",
    "Logistics & transportation",
    "Real estate & infrastructure",
    "Healthcare & hospitals",
    "Retail & e-commerce",
    "Hospitality & tourism",
    "Other",
]

# Platform admin (Snowkap manages multiple client organisations)
PLATFORM_ADMIN_USERNAME = "snowkap_admin"

ROLES = {
    "Platform Admin": {"label": "Platform Admin", "emoji": "🏢",
                       "can_export": True, "can_enter_data": True,
                       "can_manage_users": True, "can_view": True,
                       "can_manage_orgs": True},
    "Admin":       {"label": "Admin",       "emoji": "🔑",
                    "can_export": True, "can_enter_data": True,
                    "can_manage_users": True, "can_view": True},
    "Contributor": {"label": "Contributor", "emoji": "✏️",
                    "can_export": False, "can_enter_data": True,
                    "can_manage_users": False, "can_view": True},
    "Viewer":      {"label": "Viewer",      "emoji": "👁️",
                    "can_export": False, "can_enter_data": False,
                    "can_manage_users": False, "can_view": True},
    "Supplier":    {"label": "Supplier",    "emoji": "🏪",
                    "can_export": False, "can_enter_data": True,
                    "can_manage_users": False, "can_view": False},
}

# Pages each role can access (label must match NAV keys in main.py)
# ---------------------------------------------------------------------------
# Role → page visibility matrix
# ---------------------------------------------------------------------------
# Platform Admin (Snowkap staff): sees everything across all customer orgs
# Customer Admin:    full access within their own org
# Customer Contributor: data entry + analysis, no user/admin management
# Customer Viewer:   read-only dashboards and reports
# Supplier:          supplier portal only (their own GHG data + questionnaire)
# ---------------------------------------------------------------------------
ROLE_PAGES = {
    # Snowkap Platform Admin — unrestricted, cross-org
    "Platform Admin": None,

    # Customer Admin — full access within their org (None = all pages)
    "Admin": None,

    # Customer Contributor — data entry + analysis, no export/admin
    "Contributor": [
        # Configure
        "⚙️  Setup",
        "🗄️  EF manager",
        # GHG Inventory
        "🔥  Scope 1 — Direct",
        "⚡  Scope 2 — Electricity",
        "🔗  Scope 3 — Value chain",
        "📋  Data manager",
        "🌱  Initiatives",
        # Analysis
        "📊  Emissions dashboard",
        "🎯  Target register",
        "🏢  Supplier & ESG",
        "🌉  ESG bridge",
        "⚠️  Risk dashboard",
        "🗺️  Logistics map",
        "🌐  Value chain map",
        # Reporting
        "📝  ESG data points",
        "🏭  SASB standards",
        "✅  Checklist",
        "🔄  Review queue",
        # Governance
        "📜  Audit trail",
        "📚  Knowledge base",
    ],

    # Customer Viewer — read-only dashboards and reports
    "Viewer": [
        "📊  Emissions dashboard",
        "🎯  Target register",
        "📋  Data manager",
        "🌉  ESG bridge",
        "⚠️  Risk dashboard",
        "🗺️  Logistics map",
        "🌐  Value chain map",
        "🏭  SASB standards",
        "✅  Checklist",
        "📚  Knowledge base",
    ],

    # Supplier — portal only (their own data + questionnaire)
    "Supplier": [
        "🏪  Supplier portal",
    ],
}

# Data fields visible per role (controls what is shown inside pages)
ROLE_DATA_ACCESS = {
    "Platform Admin": {
        "see_all_orgs":        True,
        "see_financials":      True,
        "see_supplier_scores": True,
        "can_approve_reviews": True,
        "can_edit_ef":         True,
        "can_export":          True,
        "can_lock_inventory":  True,
    },
    "Admin": {
        "see_all_orgs":        False,  # only own org
        "see_financials":      True,
        "see_supplier_scores": True,
        "can_approve_reviews": True,
        "can_edit_ef":         True,
        "can_export":          True,
        "can_lock_inventory":  True,
    },
    "Contributor": {
        "see_all_orgs":        False,
        "see_financials":      False,
        "see_supplier_scores": True,
        "can_approve_reviews": False,
        "can_edit_ef":         False,
        "can_export":          False,
        "can_lock_inventory":  False,
    },
    "Viewer": {
        "see_all_orgs":        False,
        "see_financials":      False,
        "see_supplier_scores": False,
        "can_approve_reviews": False,
        "can_edit_ef":         False,
        "can_export":          False,
        "can_lock_inventory":  False,
    },
    "Supplier": {
        "see_all_orgs":        False,
        "see_financials":      False,
        "see_supplier_scores": False,  # sees their own score only
        "can_approve_reviews": False,
        "can_edit_ef":         False,
        "can_export":          False,
        "can_lock_inventory":  False,
    },
}


def _hash(password: str) -> str:
    if _BCRYPT_AVAILABLE:
        return _bcrypt_lib.hashpw(password.encode("utf-8"), _bcrypt_lib.gensalt()).decode("utf-8")
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def _verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    if _BCRYPT_AVAILABLE:
        try:
            return _bcrypt_lib.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
        except Exception:
            return False
    import hashlib
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


def _load_users() -> dict:
    if not USERS_FILE.exists():
        # Seed with all demo accounts on first run
        users = {
            "snowkap": {
                "password_hash": _hash("Snowkap@2024"),
                "role": "Platform Admin",
                "display_name": "Snowkap Admin",
                "org_name": "Snowkap",
            },
            "acme_admin": {
                "password_hash": _hash("Acme@2024"),
                "role": "Admin",
                "display_name": "Priya Sharma (Acme Admin)",
                "org_name": "Acme Manufacturing Pvt Ltd",
            },
            "acme_contrib": {
                "password_hash": _hash("Acme@2024"),
                "role": "Contributor",
                "display_name": "Rahul Verma (Acme Contributor)",
                "org_name": "Acme Manufacturing Pvt Ltd",
            },
            "acme_viewer": {
                "password_hash": _hash("Acme@2024"),
                "role": "Viewer",
                "display_name": "Sneha Iyer (Acme Viewer)",
                "org_name": "Acme Manufacturing Pvt Ltd",
            },
            "supplier1": {
                "password_hash": _hash("Supplier@2024"),
                "role": "Supplier",
                "display_name": "Alpha Metals Pvt Ltd",
                "org_name": "Alpha Metals Pvt Ltd",
            },
        }
        USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")
        return users
    return json.loads(USERS_FILE.read_text(encoding="utf-8"))


def _save_users(users: dict) -> None:
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")


def get_current_user() -> Optional[dict]:
    """Return current user dict or None if not logged in."""
    return st.session_state.get("_auth_user")


def is_logged_in() -> bool:
    return get_current_user() is not None


def current_role() -> Optional[str]:
    u = get_current_user()
    return u["role"] if u else None


def can(permission: str) -> bool:
    """Check if current user has a permission. Returns True if not using auth."""
    u = get_current_user()
    if u is None:
        return True  # auth disabled / not enforced
    role = u.get("role", "Viewer")
    return ROLES.get(role, {}).get(permission, False)


def page_allowed(page_label: str) -> bool:
    """Return True if the current user's role may see this nav page."""
    role = current_role()
    if role is None:
        return True
    # Platform Admin page: Snowkap staff only
    if "Platform Admin" in page_label:
        return role == "Platform Admin"
    # Users page visible to Admin + Platform Admin
    if "__user_management__" in page_label:
        return role in ("Platform Admin", "Admin")
    allowed = ROLE_PAGES.get(role)
    if allowed is None:
        return True  # Platform Admin / fallback
    return page_label in allowed


def can_access(feature: str) -> bool:
    """Check a named data-access feature for the current user."""
    role = current_role() or "Viewer"
    return bool(ROLE_DATA_ACCESS.get(role, {}).get(feature, False))


def login_form() -> bool:
    """Render login form. Returns True if user just logged in."""
    st.markdown("## 🌱 sk.lite")
    st.markdown("### Sign in")
    users = _load_users()

    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Sign in", type="primary")

    if submitted:
        user = users.get(username)
        if user and _verify_password(password, user["password_hash"]):
            st.session_state["_auth_user"] = {
                "username":     username,
                "role":         user["role"],
                "display_name": user.get("display_name", username),
                "org_uuid":     user.get("org_uuid", ""),
                "org_name":     user.get("org_name", ""),
            }
            st.rerun()
            return True
        else:
            st.error("Incorrect username or password.")

    # ── Demo credentials guide ────────────────────────────────────────────
    with st.expander("ℹ️ Demo login credentials", expanded=True):
        st.markdown("""
**Snowkap (platform operator)**

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `snowkap` | `Snowkap@2024` | Platform Admin | All organisations, all pages, cross-org view |

---

**Customer: Acme Manufacturing Pvt Ltd**

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `acme_admin` | `Acme@2024` | Admin | Full access — Setup, data entry, exports, user management, review approval |
| `acme_contrib` | `Acme@2024` | Contributor | Data entry (Scope 1/2/3), dashboard, initiatives, SASB, checklist |
| `acme_viewer` | `Acme@2024` | Viewer | Read-only — Dashboard, data manager, ESG bridge, knowledge base |

---

**Supplier**

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `supplier1` | `Supplier@2024` | Supplier | Supplier portal only — GHG questionnaire, own score, engagement history |

---
*After sign-in: Admin → go to **⚙️ Setup** to load Acme profile. Snowkap → **🏢 Platform Admin** → Switch org.*
""")
    return False


def logout() -> None:
    st.session_state.pop("_auth_user", None)
    st.rerun()


def render_user_management() -> None:
    """Admin-only user management UI."""
    if not can("can_manage_users"):
        st.error("Access denied — Admin role required.")
        return

    st.markdown("### 👥 User management")
    users = _load_users()

    # Existing users table
    st.markdown("**Current users**")
    for uname, udata in users.items():
        col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
        col1.write(f"**{uname}**")
        col2.write(udata.get("display_name", ""))
        role = udata.get("role", "Viewer")
        col3.write(f"{ROLES[role]['emoji']} {role}")
        if uname != "admin" and col4.button("Remove", key=f"rm_{uname}"):
            del users[uname]
            _save_users(users)
            st.toast(f"Removed user {uname}")
            st.rerun()

    st.markdown("---")
    st.markdown("**Add user**")
    with st.form("add_user_form"):
        nc1, nc2, nc3, nc4 = st.columns([2, 2, 2, 2])
        new_username    = nc1.text_input("Username")
        new_display     = nc2.text_input("Display name")
        new_role        = nc3.selectbox("Role", list(ROLES.keys()))
        new_password    = nc4.text_input("Password", type="password")
        add_btn = st.form_submit_button("Add user")
        if add_btn:
            if not new_username or not new_password:
                st.error("Username and password required.")
            elif new_username in users:
                st.error(f"User '{new_username}' already exists.")
            else:
                users[new_username] = {
                    "password_hash": _hash(new_password),
                    "role": new_role,
                    "display_name": new_display or new_username,
                }
                _save_users(users)
                st.success(f"✅ Added {new_username} as {new_role}")
                st.rerun()

    st.markdown("---")
    st.markdown("**Change password**")
    with st.form("change_pw_form"):
        pw1, pw2, pw3 = st.columns(3)
        cp_user = pw1.selectbox("User", list(users.keys()))
        cp_new  = pw2.text_input("New password", type="password")
        cp_btn  = st.form_submit_button("Change password")
        if cp_btn and cp_user and cp_new:
            users[cp_user]["password_hash"] = _hash(cp_new)
            _save_users(users)
            st.success(f"✅ Password updated for {cp_user}")

    st.caption(
        "**Roles:** "
        "🏢 **Platform Admin** (Snowkap) = cross-org, all pages  ·  "
        "🔑 **Admin** (Customer) = full own-org access  ·  "
        "✏️ **Contributor** = data entry + dashboard, no export/admin  ·  "
        "👁️ **Viewer** = read-only dashboard & reports  ·  "
        "🏪 **Supplier** = supplier portal only"
    )


# ---------------------------------------------------------------------------
# Notification helpers
# ---------------------------------------------------------------------------

def get_notification_count(org_id: str) -> int:
    """Return count of pending items for sidebar bell icon."""
    count = 0
    try:
        from pathlib import Path
        import sqlite3
        review_db = Path(__file__).parents[1] / "data" / "reviews.sqlite"
        if review_db.exists():
            conn = sqlite3.connect(str(review_db))
            row = conn.execute(
                "SELECT COUNT(*) FROM review_submissions WHERE org_id=? AND status='Pending'",
                (org_id,)
            ).fetchone()
            conn.close()
            count += row[0] if row else 0
    except Exception:
        pass
    return count


def signup_form() -> bool:
    """
    Self-registration form for new organisations.
    Creates an Admin user and pre-fills Setup profile.
    Returns True if registration succeeded.
    """
    st.markdown("### Create your account")
    st.caption("All fields required. You will be signed in as Admin after registration.")

    users = _load_users()

    with st.form("signup_form"):
        s1, s2 = st.columns(2)
        org_name    = s1.text_input("Organisation name *")
        industry    = s2.selectbox("Industry / sector *", INDUSTRY_CHOICES)
        u1, u2 = st.columns(2)
        username    = u1.text_input("Username *", placeholder="e.g. aisha.kumar")
        display_name= u2.text_input("Display name *", placeholder="e.g. Aisha Kumar")
        p1, p2 = st.columns(2)
        password    = p1.text_input("Password *", type="password",
                                    placeholder="Min 8 characters")
        password2   = p2.text_input("Confirm password *", type="password")
        submitted   = st.form_submit_button("Create account", type="primary")

    if submitted:
        if not all([org_name, industry, username, display_name, password, password2]):
            st.error("All fields are required.")
            return False
        if len(password) < 8:
            st.error("Password must be at least 8 characters.")
            return False
        if password != password2:
            st.error("Passwords do not match.")
            return False
        if username in users:
            st.error(f"Username '{username}' is already taken.")
            return False

        # Create admin user
        users[username] = {
            "password_hash": _hash(password),
            "role": "Admin",
            "display_name": display_name,
            "org_name": org_name,
            "industry": industry,
        }
        _save_users(users)

        # Pre-fill org profile in session state
        import streamlit as _st
        if not hasattr(_st, "session_state"):
            pass
        else:
            try:
                _st.session_state["org_profile"] = {
                    **_st.session_state.get("org_profile", {}),
                    "org_name": org_name,
                    "industry": industry,
                    "setup_done": False,
                }
            except Exception:
                pass

        # Auto-login
        import streamlit as _st
        try:
            _st.session_state["_auth_user"] = {
                "username": username,
                "role": "Admin",
                "display_name": display_name,
                "org_name": org_name,
                "industry": industry,
            }
        except Exception:
            pass

        return True
    return False
