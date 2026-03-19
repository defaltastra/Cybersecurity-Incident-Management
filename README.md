# Cybersecurity Incident Management UI 🛡️

A full-stack incident tracking platform for security teams, built with a modern React frontend and ASP.NET Core backend.

---

## Overview 🚀

This project helps teams report, track, and resolve cybersecurity incidents with role-based access:

- **Admin** 👑: full visibility, incident deletion, analyst management
- **Analyst** 🧠: can create incidents, update their own incidents, and is locked from editing once an incident is resolved

---

## Screenshots 📸

![Dashboard](./image.png)

![User Management](./image1.png)

---

## Tech Stack 🧰

**Frontend** 🎨
- React + TypeScript
- Vite
- Tailwind CSS

**Backend** ⚙️
- ASP.NET Core (.NET 9)
- Entity Framework Core
- SQLite
- BCrypt password hashing

---

## First-Time Setup ⚡

### 1. Prerequisites

Install these first:

- `git`
- `.NET SDK 9`
- `Node.js 20+` and `npm`

Check versions:

```bash
dotnet --version
node --version
npm --version
```

### 2. Get the project

```bash
git clone https://github.com/defaltastra/Cybersecurity-Incident-Management
cd "Cybersecurity Incident Management UI"
```

### 3. Backend setup (first run)

```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

Backend starts on the ASP.NET port shown in terminal (usually `http://localhost:5038`).

### 4. Frontend setup (first run)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend usually runs on `http://localhost:5173`.

### 5. Login

Use the seeded admin account:

- `admin@admin.com`
- `admin123`

### 6. If you need a clean database

From project root:

```bash
rm backend/cybersecurity_incident_management.db
cd backend
dotnet run
```

This recreates the database and reseeds the default admin.

---

## Default Admin Account 🔐

Seeded automatically at backend startup:

- **Email**: `admin@admin.com`
- **Password**: `admin123`

---

## Access Rules 📋

| Feature | Admin | Analyst |
|---|---|---|
| View incidents | Yes (all) | Yes (own only) |
| Create incidents | Yes | Yes |
| Update incident details | Yes | Yes (own only, not resolved) |
| Update incident status | Yes | Yes (own only, not resolved) |
| Delete incidents | Yes | No |
| View users | Yes (analysts only) | No |
| Delete users | Yes (analysts only) | No |

---

## Project Structure 🗂️

```text
.
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   └── Services/
└── frontend/
	├── src/app/components/
	├── src/app/pages/
	├── src/app/context/
	└── src/app/lib/
```

---

## Notes 📝

- Passwords are stored as BCrypt hashes 🔒.
- API caller identity is passed with `X-User-Id` in frontend requests 📨.
- User management intentionally hides Admin accounts and manages analysts only 👥.
