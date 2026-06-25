# HackTrack — Hackathon Tracker

HackTrack is a monorepo application designed to help developers track, schedule, and evaluate hackathons, rounds, prototypes, and outcomes.

---

## 1. Project Folder Layout

Here is the clean directory tree showing the decoupled root structure:

```text
HackTrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # MongoDB connection config
│   │   ├── controllers/
│   │   │   └── hackathonController.ts  # Hackathon CRUD controllers
│   │   ├── middleware/
│   │   │   └── validationMiddleware.ts # Zod body validation middleware
│   │   ├── models/
│   │   │   └── Hackathon.ts            # Mongoose Schema & Interfaces
│   │   ├── routes/
│   │   │   └── hackathonRoutes.ts      # API routes mounting controllers
│   │   └── index.ts                    # Express Server entry point
│   ├── .env                            # Backend environment file
│   ├── nodemon.json                    # Nodemon live reload configuration
│   ├── package.json                    # Backend dependencies & scripts
│   └── tsconfig.json                   # Backend TypeScript configurations
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.ts                # Axios client with interceptors
    │   ├── App.css                     # Reset css file
    │   ├── App.tsx                     # Main Dashboard UI & dynamic forms
    │   ├── index.css                   # Tailwind css entry & fonts
    │   └── main.tsx                    # Vite react entry point
    ├── index.html                      # Entry HTML file
    ├── postcss.config.js               # PostCSS configurations
    ├── tailwind.config.js              # Tailwind tokens & themes
    ├── package.json                    # Frontend dependencies & scripts
    └── tsconfig.json                   # Frontend TypeScript configurations
```

---

## 2. MongoDB Schema Definition (Mongoose / TypeScript)

The model is defined in `backend/src/models/Hackathon.ts`.
- **`globalStatus`** is dynamically calculated using system date comparisons on **registration deadlines** and **evaluation round deadlines** in a Mongoose `pre('validate')` hook.
- When retrieving records via the controllers, the global statuses are synced asynchronously to guarantee real-time accuracy.

---

## 3. Backend API & Validations (Express + TS)

- Fully typed CRUD handlers are defined in `backend/src/controllers/hackathonController.ts`.
- Requests to write or update are strictly validated using a nested Zod schema in `backend/src/middleware/validationMiddleware.ts`. Any validation failures emit structured errors highlighting the exact nested path (e.g. `rounds.0.title`).

---

## 4. Frontend Shell Configuration (Vite + React + TS)

- **Vite & React with TS**: Scaled to run on standard Node environments (Vite 5).
- **Tailwind Tokens**: Configured in `frontend/tailwind.config.js` to feature modern design elements:
  - Custom border radius extensions (`rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-4xl`).
  - Subtle gray neutral scale (`slate`-based neutral-50 to neutral-950).
  - Soft indigo accent colors (`brand`).
  - Plus Jakarta Sans modern typography.
- **Axios Interceptors**: The Axios instance in `frontend/src/api/axios.ts` catches response failures, formats detailed console logs, and propagates friendly, unified messages.
- **Demo Fallback Mode**: If the MongoDB server is offline, the frontend seamlessly switches to a highly functional browser `LocalStorage` mode. You can create, edit, delete, and check off rounds immediately.

---

## How to Run the Project

### Prerequisites
- Node.js installed on your machine (v20.15+)
- Local MongoDB instance running on `mongodb://localhost:27017` (optional, fallback provided)

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
The server will boot at `http://localhost:5000`.

### Step 2: Start the Frontend App
```bash
cd frontend
npm run dev
```
Vite will start the client, and you can open the URL displayed in the terminal.
