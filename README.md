# IoT Cold Chain Logistics Monitoring (Fullstack)

Minimal fullstack project for **IoT Cold Chain Logistics Monitoring**:

- **Backend**: Spring Boot 3, Spring Security, JWT, Spring Data JPA, H2 (local) / PostgreSQL (Docker)
- **Frontend**: Angular 21 (stores JWT + sends `Authorization: Bearer ...`)
- **Docker**: `Dockerfile` + `docker-compose.yml`

---

## Backend (Spring Boot)

### Run locally (H2 in-memory)

Requirements:
- Java 17+ (Docker runs Java 21)

```bash
cd backend
./mvnw.cmd -DskipTests package
set PORT=8081
java -jar target/coldchain-backend-0.0.1-SNAPSHOT-exec.jar
```

Health check:
- `http://localhost:8081/actuator/health`

### Run with Docker Compose (PostgreSQL)

1) Start Docker Desktop
2) From repo root:

```bash
docker compose up --build
```

Backend:
- `http://localhost:8080`

---

## Frontend (Angular 21)

```bash
cd frontend
npm install
npm start
```

Frontend:
- `http://localhost:4200`

Backend URL used by Angular:
- edit `frontend/src/environments/environment.ts`

---

## API Overview

### Public (no JWT)
- `POST /api/auth/register` → `{ token }`
- `POST /api/auth/login` → `{ token }`

### Protected (JWT required)
- `GET/POST/PUT/DELETE /api/shipments`
- `GET/POST/PUT/DELETE /api/readings`
  - `GET /api/readings?shipmentId=123`

---

## Demo script (for live presentation)

1) Register on the Angular UI.
2) Create a shipment with range **2–8°C**.
3) Open the shipment detail page.
4) Add a sensor reading with temperature **20°C** → shipment becomes **ALERT**.

---

## Cloud deployment (free tier friendly)

This backend is container-first. Any platform that can run a Docker image + a PostgreSQL database will work.

### Required environment variables

- `PORT`: app port (most platforms set this for you)
- `SPRING_PROFILES_ACTIVE=docker`
- `APP_JWT_SECRET`: **long random string**
- `APP_JWT_ISSUER`: e.g. `coldchain-api`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Build image

From repo root:

```bash
docker build -t coldchain-backend:latest ./backend
```

### Deploy options (examples)

- **Google Cloud Run**: deploy the container image, add env vars, connect to a managed Postgres (Cloud SQL) or external Postgres.
- **AWS ECS/Fargate**: run the container, set env vars, use RDS Postgres.
- **Azure Container Apps**: run the container, set env vars, use Azure Database for PostgreSQL.
- **Oracle Cloud (Always Free)**: run the container on a VM (or container instance), connect to a Postgres service/VM.

### Production notes

- Use a real Postgres database (not H2).
- Set a strong `APP_JWT_SECRET`.
- Restrict CORS to your deployed frontend domain (see backend `CorsConfig`).

