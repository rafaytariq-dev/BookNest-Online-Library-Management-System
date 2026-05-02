# BookNest Frontend (React + Vite)

This folder contains the BookNest web UI built with React and Vite.

## What the UI includes

- Authentication screens (signup/login)
- Home page with search + filtering
- Book details pages + reviews
- Wishlist management
- Cart + checkout flow for reservations
- Dashboard to manage reservations (pickup/return/extend/history)

## Tech

- React 18
- Vite
- React Router
- Context API for global state (`UserContext`, `BookContext`)
- CSS Modules
- lucide-react icons

## Local Setup

From the repository root:

```bash
cd frontend
npm install
```

Optional: create `frontend/.env` to configure the backend URL:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API + Sessions

The frontend API client (`src/services/api.js`) sends requests with `credentials: 'include'` so the browser includes the session cookie set by the backend.

## Useful Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — lint the codebase

