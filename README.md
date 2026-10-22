
# URL Shortener

A full-stack URL-shortening application built with React, FastAPI, and SQLAlchemy. Users can create short links, manage their URLs, and track click activity through a personal dashboard.

## Features

- **User authentication** — Register, log in, and manage account credentials.
- **URL shortening** — Generate short links from valid URLs.
- **Link management** — View and delete your short links.
- **Click analytics** — Track click counts and inspect individual click records.
- **Account settings** — Change your password or delete your account.
- **Theme support** — Light, dark, and system themes.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | SQLAlchemy, SQLite |
| Authentication | JWT, password hashing |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set up the backend

From the repository root, create a virtual environment and install the dependencies:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Create your local environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

Configure the required environment variables in `backend/.env`:

- `SECRET_KEY` — A randomly generated secret used to sign JWTs.
- `CONSTANT` — A non-zero odd integer required by the short-code generator.
- `DATABASE_URL` — The SQLAlchemy database connection URL.

The example configuration uses SQLite.

### 3. Initialize the database

From the `backend/` directory, with the virtual environment active:

```powershell
python make_tables.py
```

### 4. Run the backend

From the `backend/` directory:

```powershell
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 5. Run the frontend

Open a separate terminal:

```powershell
cd frontend
npm ci
npm run dev
```

The frontend will be available at `http://localhost:5173`.

To use a different backend URL, set `VITE_API_URL` in `frontend/.env.local`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Authenticate and obtain an access token |
| `GET` | `/auth/me` | Retrieve the current account |
| `PUT` | `/auth/me/password` | Change password |
| `DELETE` | `/auth/me` | Delete account |
| `POST` | `/api/urls` | Create a short link |
| `GET` | `/api/urls` | List your links and click counts |
| `GET` | `/api/urls/{url_id}` | Retrieve link details |
| `GET` | `/api/urls/{url_id}/clicks` | Retrieve click records |
| `DELETE` | `/api/urls/{url_id}` | Delete a short link |
| `GET` | `/r/{short_code}` | Record a click and redirect |

All endpoints except registration, login, the health endpoint, and public redirects require bearer-token authentication.

## Validation

Run the frontend lint checks and production build from `frontend/`:

```bash
npm run lint
npm run build
```

## Security Notes

- Frontend environment variables prefixed with `VITE_` are exposed to browser code.
- Access tokens are stored in browser `localStorage`.
