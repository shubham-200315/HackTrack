# HackTrack Local Startup Guide

This guide will help you configure and run the HackTrack application on your local machine using your local MongoDB instance.

---

## 1. System Requirements

> **MongoDB Installation Requirement**
> Install MongoDB Community Server and make sure it is running on your machine. This is what guarantees your hackathon data stays saved locally forever.

To install and check your MongoDB status:
* **macOS**: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
* **Linux (Ubuntu/Debian)**: `sudo systemctl start mongod` or `sudo service mongod start`
* **Windows**: Open the Services application (`services.msc`) and ensure the **MongoDB Server (MongoDB)** service is running.

---

## 2. Bootstrapping & Local Launch

You can boot both the frontend and backend servers simultaneously from the project's root folder.

### Step 1: Install Dependencies
Open a terminal in the project's root folder (`/home/shubhamjaiswal/Music/HackTrack`) and run:
```bash
npm install
```
*Note: This root command triggers an automated post-install hook to install dependencies for both the `/backend` and `/frontend` folders.*

### Step 2: Start the Application
Run the local dev command in the root folder:
```bash
npm run dev
```
This executes `concurrently` to:
- Boot up the **Express Backend Server** on `http://localhost:5000`
- Launch the **Vite Frontend Server** on `http://localhost:5173`
- Pipe logs from both servers into the same terminal window with color-coded prefix tags (`[backend]`, `[frontend]`).

---

## 3. Environment Specifications

For your reference, the following local files have been preset:

### Backend Configuration (`backend/.env`)
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hacktrack
JWT_SECRET=your_super_secret_local_key
```

### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```
