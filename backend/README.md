# BookNest Backend (NestJS API)

This folder contains the BookNest REST API built with NestJS + TypeORM + PostgreSQL.

## What this API does

- Session-based authentication (secure cookie sessions)
- Books catalog endpoints + reviews
- Cart management and reservation checkout
- User dashboard, wishlist, and theme preference
- Reservation lifecycle: reserve, pickup, return, extend, history/stats
- Contact message endpoint

## Tech

- NestJS
- TypeORM
- PostgreSQL (works well with hosted Neon)
- `express-session` + `connect-typeorm` (sessions stored in DB)
- `class-validator` / `class-transformer` DTO validation

## Local Setup

From the repository root:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# optional
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-long-random-secret
```

Start the API (watch mode):

```bash
npm run start:dev
```

The server listens on `http://localhost:3000` and exposes routes under `/api`.

## CORS + Cookies

The API enables CORS for the frontend dev server (`http://localhost:5173`) and allows credentials so cookie sessions work during local development.

## Useful Commands

- `npm run start:dev` — dev server (watch)
- `npm run build` — build to `dist/`
- `npm run start:prod` — run production build
- `npm run lint` — eslint (auto-fix)
- `npm run test` / `npm run test:e2e` — tests

## Environment Notes

- `DATABASE_URL` is required. The app will throw on startup if it’s missing.
- TypeORM is configured with `synchronize: true` (great for dev, review before production).

