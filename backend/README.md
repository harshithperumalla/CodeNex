# CodeNex Backend

Node.js + Express + MongoDB API for the SparkLearn Hub frontend.

## Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Start MongoDB locally (`mongodb://127.0.0.1:27017/codenex`).
3. Install and seed:

```bash
npm install
npm run seed
npm run dev
```

Server runs at `http://localhost:5000`.

## Demo accounts (after seed)

| Role    | Email             | Password     |
|---------|-------------------|--------------|
| Admin   | admin@codenex.io  | password123  |
| Mentor  | mentor@codenex.io | password123  |
| Student | alex@codenex.io   | password123  |

## API overview

### Auth — `/api/auth`
- `POST /signup` — register (role defaults to `user`)
- `POST /login` — returns JWT + user profile
- `GET /me` — current user (Bearer token)
- `POST /forgot-password` — demo reset flow

### User / Dashboard — `/api/user`
- `GET /dashboard` — stats, charts, badges
- `GET /profile` / `PUT /profile`
- `GET /leaderboard`

### Courses — `/api/course`
- `GET /` — list courses (with enrollment progress)
- `GET /:id`
- `POST /:id/enroll`
- `PUT /:id/progress`

### Coding — `/api/coding`
- `GET /languages`
- `GET /problems` — query: `difficulty`, `category`, `search`
- `GET /problems/:id`
- `POST /problems/:id/submit` — body: `{ code, language }`
- `GET /submissions`

### Admin — `/api/admin` (admin only)
- `GET /dashboard`, `/analytics`, `/users`
- `PUT /users/:id`, `DELETE /users/:id`
- Course & problem CRUD

### Mentor — `/api/mentor` (mentor/admin)
- `GET /dashboard`, `/sessions`, `/students`
- `POST /sessions`, `PUT /sessions/:id`, `DELETE /sessions/:id`

Send JWT as: `Authorization: Bearer <token>`
