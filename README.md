# RailPulse Command — Railway Reservation System

A full-stack MERN railway reservation application with separate user and administrator login portals, role-based access control, train discovery, ticket booking, booking management, seat restoration when tickets are cancelled, and Socket.IO-powered live seat availability updates.

## Tech Stack

- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB / MongoDB Atlas
- **Authentication:** Password hashing with Node.js `scrypt` and signed JWT sessions
- **Realtime:** Socket.IO broadcasts seat availability changes to every connected client

## Features

### User portal
- Create a passenger account and sign in through the User Login page.
- Browse trains and see live seat availability. When another passenger books or cancels seats, open train lists and booking forms update automatically without refreshing.
- Book one or more seats with passenger names.
- View and cancel only the bookings associated with the signed-in account.

### Administrator portal
- Sign in through a separate Admin Login page.
- Add trains and configure routes and seat capacity.
- View all passenger bookings and cancel bookings when required.
- Admin accounts are created from backend environment variables; public registration cannot create an admin account.

### Security
- Passwords are hashed before they are stored in MongoDB.
- The backend issues a signed session token after successful login.
- Admin-only train creation and user-specific booking access are enforced by backend middleware, not just by hiding frontend links.
- A regular user cannot gain administrator access by selecting the admin login page.

## Project Structure

```text
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── realtime/
    │   ├── App.jsx
    │   └── index.css
    └── .env.example
```

## Run locally

### 1. Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set the values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_at_least_32_characters_long
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_strong_password_at_least_12_characters
CLIENT_URL=http://localhost:5173
```

The backend creates or updates the configured administrator account when it starts. Keep the `.env` file private and do not commit it to GitHub.

Start the backend:

```bash
npm run dev
```

### 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Login pages

- **User login:** `/login/user`
- **Admin login:** `/login/admin`
- **User registration:** `/register`
- **Admin dashboard:** `/admin`
- **Bookings:** `/bookings`

Register a normal passenger account from the User Login page. Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in the backend environment for the administrator portal.

## Deployment notes

Deploy the updated backend and frontend together. Configure `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend hosting provider. Set `VITE_API_URL` in the frontend hosting provider to the deployed backend API URL. Set `VITE_SOCKET_URL` to the deployed backend origin (without `/api`) if it cannot be inferred automatically. Set backend `CLIENT_URL` to the deployed frontend origin. Rebuild and redeploy the frontend after changing frontend environment variables.

The ticket booking and cancellation features use MongoDB transactions, so the MongoDB deployment must support transactions (for example, MongoDB Atlas or a replica set). Seat reservations are also decremented atomically to prevent simultaneous bookings from overselling seats. Socket.IO broadcasts the committed seat count only after the database transaction succeeds.
