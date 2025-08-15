# 🚀 LinkNest - Your Personal Content Library

LinkNest is a second-brain web app that helps you **save**, **organize**, and **revisit** content from your favorite platforms like YouTube, Twitter, Medium, LinkedIn, Dev.to, and more.

<img width="1470" height="840" alt="Screenshot 2025-07-17 at 5 11 33 PM" src="https://github.com/user-attachments/assets/75ef40a2-f21a-456c-b46c-3ad177d435d9" />
 <!-- Add an actual image named screenshot.png -->

## 🌟 Features

- 🎯 Save content from multiple platforms
- 🔍 Filter by platform (YouTube, Twitter, Medium, etc.)
- 🧠 Search by title instantly
- 📌 Pin content (coming soon!)
- ✏️ Edit titles of saved content (coming soon!)
- 🗂 Organize your knowledge in a beautiful card layout
- 🌗 Fully responsive with dark mode
- 🛡️ JWT Auth & secure backend
- ⚡ Smooth user experience with React + Tailwind + Vite

---

## 📸 Preview

<img width="960" height="508" alt="Screenshot 2025-07-17 at 5 12 51 PM" src="https://github.com/user-attachments/assets/78c9e481-fc04-46b6-abb4-3da73d7a7219" />

 <!-- Replace with your dashboard screenshot -->

---

## 🛠️ Tech Stack

| Frontend | Backend | Styling | Other |
|----------|---------|---------|-------|
| React (Vite) | Node.js (Express) | Tailwind CSS | MongoDB |
| TypeScript | JWT Auth | ShadCN UI | Render (Backend hosting) |
| React Router | Axios | Dark Mode | Vercel (Frontend hosting) |

---

## 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/ayushsoni02/LinkNest.git
cd LinkNest
```

# Install frontend dependencies
```bash
cd client
npm install
```

# Run frontend
```bash
npm run dev
```

### Environment Configuration

#### **Backend (.env) MindVault-BE**
- **GOOGLE_CLIENT_ID**=your-google-client-id 
- **GOOGLE_CLIENT_SECRET**=your-google-client-secret 
- **JWT_PASSWORD**=your-jwt-secret 
- **SESSION_SECRET**=your-session-secret 
- **FRONTEND_URL**=http://localhost:5173 (or your deployed frontend URL) 
- **BACKEND_URL**=http://localhost:3000 (or your deployed backend URL)

#### **Frontend (Config.tsx)**
- **BACKEND_URL**=http://localhost:3000 (or your deployed backend URL) 
- **FRONTEND_URL**=http://localhost:5173 (or your deployed frontend URL)