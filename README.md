# BookNest — Online Library Management System

BookNest is a full-stack library management web app where users can browse books, manage a wishlist, reserve books for pickup, and track their borrowing activity.

The project is split into a React (Vite) frontend and a NestJS + TypeORM backend using PostgreSQL (e.g., Neon).

## Features

- Session-based authentication (signup/login/logout) using secure cookies
- Browse/search books, filter by category/genre, view detailed book pages
- Reviews & ratings on books
- Wishlist (save/remove favorites)
- Cart + reservation checkout (pickup date + duration)
- Dashboard to manage reservations: pickup, return, extend loans, view history
- Fine calculation for overdue returns
- Contact form endpoint

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Context API state management
- CSS Modules
- lucide-react icons

**Backend**
- NestJS
- TypeORM
- PostgreSQL
- express-session + cookie-parser (cookie sessions)
- connect-typeorm session store (sessions stored in DB)
- class-validator / class-transformer DTO validation

## Project Structure

```
.
├─ backend/   # NestJS API (port 3000, prefix /api)
└─ frontend/  # React app (port 5173)
```

## Getting Started (Local)

### Prerequisites

- Node.js 18+ (recommended)
- A PostgreSQL database (local or hosted) and its connection string

### 1) Backend setup

From the repo root:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Required
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# Optional
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-long-random-secret
```

Run the API:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

### 2) Frontend setup

In a new terminal:

```bash
cd frontend
npm install
```

Optional: create `frontend/.env` to point to a different backend URL:

```env
VITE_API_URL=http://localhost:3000/api
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Useful Scripts

**Backend** (in `backend/`)
- `npm run start:dev` — start NestJS in watch mode
- `npm run build` / `npm run start:prod` — build and run production build
- `npm run test` / `npm run test:e2e` — run tests
- `npm run lint` — lint (auto-fix enabled)

**Frontend** (in `frontend/`)
- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run preview` — preview production build

## API Quick Reference

Base URL: `http://localhost:3000/api`

- Auth: `/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/session`, `/auth/profile`
- Books: `/books`, `/books/:id`, `/books/categories`, `/books/featured`, `/books/new-arrivals`
- Reviews: `/books/:id/reviews` (GET/POST)
- Cart: `/cart` (GET/POST), `/cart/:id` (DELETE), `/cart` (DELETE clear)
- Reservations: `/reservations`, `/reservations/checkout`, `/reservations/:id/pickup`, `/reservations/:id/return`, `/reservations/:id/extend`
- Users: `/users/me`, `/users/dashboard`, `/users/theme`, `/users/wishlist`

## Notes

- The frontend includes credentials on requests (`credentials: 'include'`) so session cookies work locally.
- By default, the backend enables CORS for `http://localhost:5173` and allows credentials.
