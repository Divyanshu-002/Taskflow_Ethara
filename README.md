# TaskFlow – Team Task Manager

A full-stack web app for creating projects, assigning tasks, and tracking progress with role-based access.

## Features

- **Authentication** – Signup / Login with JWT tokens
- **Role-Based Access** – Admin and Member roles
- **Projects** – Create, view, and delete projects
- **Team Management** – Add members to projects
- **Tasks** – Create tasks, assign to users, set priority & due date
- **Kanban Board** – Move tasks between To Do / In Progress / Done
- **Dashboard** – See stats, overdue tasks, and recent activity
- **My Tasks** – View all tasks assigned to you with filters

## Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React, React Router, Axios |
| Backend  | Node.js, Express           |
| Database | SQLite (better-sqlite3)    |
| Auth     | JWT + bcryptjs             |

## Local Setup

### 1. Clone the repo


### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm start
# App opens on http://localhost:3000
```



## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/projects | Get my projects |
| POST | /api/projects | Create project |
| POST | /api/projects/:id/members | Add member |
| GET | /api/tasks/project/:id | Get project tasks |
| GET | /api/tasks/my-tasks | Get my tasks |
| GET | /api/tasks/dashboard | Dashboard stats |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── db.js           # SQLite database setup
│   │   ├── middleware.js   # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.js     # Signup & Login
│   │       ├── projects.js # Project CRUD
│   │       ├── tasks.js    # Task CRUD
│   │       └── users.js    # User listing
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js              # Routes
    │   ├── api.js              
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   ├── ProjectDetail.js
    │   │   └── MyTasks.js
    │   └── components/
    │       └── Navbar.js
    └── package.json
```
