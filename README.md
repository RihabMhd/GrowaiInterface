# 🎬 GrowAI — Frontend (Gestion des Employés & Tâches)

Frontend web application for an internal **agency management system** used to manage employees, projects, tasks, planning, and production workflows in a video production & editing agency.

Built with **React.js** and designed to work with a **Laravel REST API backend**.

---

## 🚀 Project Overview

GrowAI is a centralized system that helps production agencies manage:

- 👥 Employees & their skills
- 📁 Projects (video production lifecycle)
- ✅ Tasks (pre-production, shooting, post-production, delivery)
- 📊 Workload & performance tracking
- 📅 Planning (calendar / Kanban / Gantt)
- 🔔 Real-time notifications
- 📈 Analytics & reporting

---

## 🧱 Tech Stack

- ⚛️ Frontend: :contentReference[oaicite:0]{index=0}
- 🎨 Styling: CSS / Tailwind (if used)
- 🌐 API Communication: Axios / Fetch API
- 🔐 Authentication: JWT + OAuth2 (Google / Facebook)
- 🔌 Real-time: WebSockets (Socket.io compatible backend)
- 🧩 State Management: Context API / Redux (if applicable)
- 🧠 Backend: :contentReference[oaicite:1]{index=1} (REST API)

---

## 📁 Project Structure

```bash
src/
│
├── api/                # API calls (Axios instances)
├── assets/             # Images, icons, static files
├── components/         # Reusable UI components
├── pages/              # Main pages (Dashboard, Login, Projects...)
├── layouts/            # App layout (Sidebar, Header)
├── context/            # Global state management
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── routes/             # App routing configuration
├── styles/             # Global styles
└── App.jsx             # Root component
