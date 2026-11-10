# Nirnaya

AI-assisted public grievance and budget transparency demo built with Next.js, React, Recharts, and Lucide icons.

## Run locally

Requires Node.js 20.9 or later.

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open `http://localhost:3000`.

## Demo behavior

- Switch between Executive and Citizen views using the role selector in the sidebar.
- The citizen flow includes a mock OTP sign-in and a complaint filing form. The demo OTP is `123456`.
- Complaint submissions are classified by the simulated Nirnaya Core engine and saved to the browser's local storage.
- The complaint API is available at `POST /api/complaints`.
- Seeded admin analytics and sample audit flags are illustrative mock data, not official records.

## Production notes

This project is a functional prototype, not an authenticated or secure government service. Replace mock OTP and local storage with an identity provider, database, role-based authorization, secure media storage, audit-grade transaction records, and a reviewed ML pipeline before deployment. Model metrics are demo values and should not be represented as validated real-world performance.
