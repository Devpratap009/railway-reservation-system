# RailPulse Command — Railway Reservation System

A full-stack **MERN** railway ticket reservation and command-center web application featuring a dark glassmorphic interface, visual route cards, live seat availability bars, multi-passenger booking, booking status tracking, and transactional seat restoration on cancellation.

## Tech Stack

- **Frontend:** React, Vite, React Router (`BrowserRouter`), CSS
- **Backend:** Node.js, Express, MongoDB Transactions
- **Database:** MongoDB Atlas
- **Utilities:** PowerShell script for automated train population

## Features

- **Train Route Discovery (`/`):** Browse trains with visual origin-to-destination tracks, live seat availability progress bars, and direct booking links.
- **Ticket Booking (`/book`):** Select a train, choose the number of seats, enter passenger names per seat, and submit reservations.
- **Bookings Management (`/bookings`):** View booked tickets with status badges (`BOOKED` / `CANCELLED`) and cancel tickets with transactional seat restoration.
- **Admin & Train Seeding (`/admin`):** Manage trains and populate train records via the backend/API or PowerShell seeding script.

## Project Structure

```text
.
├── backend/
│   ├── server.js
│   └── ...
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTrainForm.jsx
│   │   │   ├── BookingsList.jsx
│   │   │   ├── BookTicketForm.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── TrainList.jsx
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── BookTicketPage.jsx
│   │   │   └── HomePage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
└── README.md
