# Server — Local development notes

This project uses MySQL in all environments. For local development provide your
MySQL credentials in `server/.env`. The server will attempt to connect using
those credentials; if an env var is missing a sensible default will be used
for local development but you should set values in production.

Environment variables (put these in `server/.env` for local development):

- MYSQL_DB_NAME — Database name (default: `dev_bidding_db`)
- MYSQL_DB_USER — Database user (default: `root`)
- MYSQL_DB_PASSWORD — Database password (can be empty for local root installs)
- MYSQL_DB_HOST — Database host (default: `127.0.0.1`)
- MYSQL_DB_PORT — Database port (default: `3306`)
- SECRET_KEY — JWT secret used by auth endpoints (use a strong secret in production)

Quick tips:

- Create a dedicated database user for development instead of using `root`.
- After changing env vars, restart the server so changes take effect.
- Do not commit production secrets to your repo.
