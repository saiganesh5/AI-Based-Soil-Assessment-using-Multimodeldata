# AI Soil Health Assessment

Backend services for soil and crop health insights, combining:
- A Spring Boot REST API for user/auth, profiles, and orchestration.
- A FastAPI plant disease classifier that runs a TensorFlow model and is proxied by the Spring API.

## What this repo contains
- Spring Boot backend (Java 21, Maven) under `src/main/java`
- FastAPI ML service in `main.py` (expects a `googlenet.keras` model file)
- Email OTP workflows, JWT auth, PostgreSQL persistence

## Architecture
- Spring Boot API listens on `:8080`
- FastAPI plant disease service listens on `:8000`
- Spring Boot proxies plant disease endpoints at `/api/plant/**` to FastAPI

## Requirements
- Java 21
- Maven (or use the Maven wrapper `mvnw` / `mvnw.cmd`)
- PostgreSQL
- Python 3.10+ (tested with 3.11) and pip

## Environment variables
Spring Boot loads `secrets.env` from the repo root on startup. Use placeholders and keep real secrets out of git.

Example `secrets.env`:
```env
DB_URL=jdbc:postgresql://localhost:5432/AiSoilHealthAssessment
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=replace_with_a_long_random_secret
EMAIL=your_smtp_email@gmail.com
EMAIL_PASSWORD=your_smtp_app_password
SENDBRIDGE_API_TOKEN=your_sendbridge_token
```

FastAPI model paths can be overridden with environment variables:
```env
PLANT_MODEL_PATH=path/to/googlenet.keras
PLANT_LABELS_TXT=path/to/class_names.txt
PLANT_LABELS_JSON=path/to/class_names.json
```

## Setup

### 1) Database
Create a PostgreSQL database and update `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` in `secrets.env`.

### 2) Run the Spring Boot backend
```bash
./mvnw spring-boot:run
```
On Windows:
```bash
mvnw.cmd spring-boot:run
```

The API will start on `http://localhost:8080`.

### 3) Run the FastAPI plant disease service
Install Python dependencies (no `requirements.txt` in this repo):
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi uvicorn tensorflow pillow numpy
```
Run the service:
```bash
python main.py
```

The ML API will start on `http://localhost:8000`.

## API overview

### Health
- `GET /greet` -> backend health message
- `GET /api/plant/` -> ML service info (proxied)
- `GET /api/plant/healthz` -> ML service health (proxied)

### Auth and user
- `POST /auth/send-otp` -> send signup OTP
- `POST /auth/verify-otp` -> verify OTP
- `POST /auth/register` -> create user (requires OTP verified)
- `POST /auth/login` -> login, returns JWT
- `GET /auth/me` -> current user (JWT required)
- `POST /auth/forgot-password` -> send reset OTP
- `POST /auth/reset-password` -> reset password (OTP verified)

### Profile
- `GET /fetch-user` -> get profile (JWT required)
- `PUT /update-user` -> update profile (JWT required)

### Plant disease prediction (proxied)
- `POST /api/plant/predict` -> multipart form upload of an image
  - query param: `top_k` (default 5)

Example request:
```bash
curl -X POST "http://localhost:8080/api/plant/predict?top_k=5" ^
  -F "file=@path/to/leaf.jpg"
```

### Admin/test endpoints
- `POST /addUser` -> raw user insert (no auth)
- `DELETE /rmUser/{id}` -> delete user by id (no auth)

## JWT auth
Use the `Authorization` header:
```
Authorization: Bearer <token>
```

## Notes
- The Spring Boot app expects `secrets.env` in the repo root.
- The FastAPI service requires `googlenet.keras` in the repo root or `PLANT_MODEL_PATH`.
- Email OTP flows rely on SMTP and SendBridge for validation.

## License
No license specified yet.
