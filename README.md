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

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ayushsoni02/LinkNest.git
cd LinkNest
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd MindVault-BE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your actual values (see Environment Variables section below)

# Build and start the backend
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd MindVault-FE

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### 4. Environment Variables

The backend requires several environment variables to function properly. Copy the `.env.example` file to `.env` in the `MindVault-BE` directory and update the following values:

```bash
# Database - Replace with your MongoDB connection string
MONGO_URL=mongodb://localhost:27017/linknest

# JWT Secret - Use a secure random string (minimum 32 characters)
JWT_PASSWORD=your_secure_jwt_secret_here

# Application Settings
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### Quick Setup Commands:
```bash
cd MindVault-BE
cp .env.example .env

# Generate a secure JWT secret using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Then edit .env with your preferred text editor
nano .env  # or code .env for VS Code
```

### 5. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/linknest`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get connection string and replace in `.env`

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 🚀 Quick Start (Development)

```bash
# Terminal 1 - Backend
cd MindVault-BE
npm install
cp .env.example .env  # Don't forget to edit this!
npm run dev

# Terminal 2 - Frontend
cd MindVault-FE
npm install
npm run dev
```

---

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- Use a strong, unique `JWT_PASSWORD` (minimum 32 characters)
- Generate secure JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- In production, use MongoDB Atlas with proper authentication

---

## 🛠️ Troubleshooting

### Common Issues

**Backend won't start:**
- ✅ Check if MongoDB is running (local) or connection string is correct (Atlas)
- ✅ Verify all required environment variables are set in `.env`
- ✅ Make sure you copied `.env.example` to `.env`

**CORS errors:**
- ✅ Check `FRONTEND_URL` matches your frontend development server
- ✅ Default is `http://localhost:5173` for Vite

**JWT errors:**
- ✅ Ensure `JWT_PASSWORD` is set and secure
- ✅ Clear browser localStorage/cookies if needed
