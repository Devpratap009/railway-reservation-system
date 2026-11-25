# RailPulse Command — Frontend

The React/Vite client for the Railway Reservation System.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to the backend API base URL, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

## Main routes

- `/` — train search and seat availability
- `/login/user` — passenger login
- `/login/admin` — administrator login
- `/register` — passenger account registration
- `/book` — authenticated passenger ticket booking
- `/bookings` — passenger's own bookings or administrator's all-bookings view
- `/admin` — administrator train management
