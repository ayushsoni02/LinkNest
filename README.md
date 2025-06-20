# 🚀 LinkNest - Your Personal Content Library

LinkNest is a second-brain web app that helps you **save**, **organize**, and **revisit** content from your favorite platforms like YouTube, Twitter, Medium, LinkedIn, Dev.to, and more.

![LinkNest Screenshot](./screenshot.png) <!-- Add an actual image named screenshot.png -->

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

![Dashboard Preview](./dashboard.png) <!-- Replace with your dashboard screenshot -->

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
git clone https://github.com/your-username/linknest.git
cd linknest

# Install frontend dependencies
cd client
npm install

# Run frontend
npm run dev


# Move to backend
cd server
npm install

# Add .env with:
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret

# Run backend
npm run dev
