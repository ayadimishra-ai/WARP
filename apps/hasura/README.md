# Hasura with Docker Compose

This is a local hasura setup with docker compose.

---

## Docker Compose

This docker compose file contains Postgress image and Hsaura graphql engine image

### Postgres image

- Version : 12
- Ports : 5432:5432

### Hasura Graphql Engine Image

- Version : 2.10.0 with Auto-apply Migrations and Metadata
- Ports : 8080:8080

---

## Scripts

- Start hasura docker compose `start:docker`
- Stop hasura docker containers `stop:docker`
- Start hasura console `start:hasura` at port `5000`
