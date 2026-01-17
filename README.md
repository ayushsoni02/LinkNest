<p align="center">
  <h1 align="center">� LinkNest</h1>
  <p align="center">
    <strong>Your Personal Second Brain for the Modern Web</strong>
    <br />
    Save, organize, and rediscover content from YouTube, Twitter/X, Medium, GitHub, and beyond.
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
</p>

---

## 📸 Screenshots

<p align="center">
  <img width="100%" alt="LinkNest Dashboard" src="https://github.com/user-attachments/assets/75ef40a2-f21a-456c-b46c-3ad177d435d9" />
</p>

<p align="center">
  <img width="100%" alt="LinkNest Content Cards" src="https://github.com/user-attachments/assets/aeb0b5e7-9759-4b88-a68f-ec855d253dcd" />
</p>

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **🎯 Universal Link Saving** | Save content from YouTube, Twitter/X, Medium, GitHub, Substack, Instagram, and any web article |
| **📂 Nests (Collections)** | Organize your links into customizable collections called "Nests" for better categorization |
| **🔍 Smart Search & Filter** | Instantly search by title or filter by platform type |
| **🏷️ Tag System** | Add custom tags to your saved content for enhanced discoverability |
| **🔗 Shareable Nest Links** | Generate unique share links to publicly share your curated content collection |

### Smart Content Cards

- **YouTube Embeds**: Inline video player with thumbnail placeholders for performance
- **Twitter/X Embeds**: Native tweet display with authentic Twitter UI
- **Rich Article Previews**: Large OG images, favicon, site name, and description snippets
- **Platform Detection**: Automatic content type identification and badge display
- **Quick Actions**: Copy link, open in new tab, share, delete — all on hover

### User Experience

| Feature | Description |
|---------|-------------|
| **🌗 Dark Mode First** | Premium dark-themed UI designed for long reading sessions |
| **⚡ Blazing Fast** | Metadata extraction in <500ms with intelligent fallbacks |
| **📱 Fully Responsive** | Mobile-first design with dedicated mobile navigation |
| **✨ Smooth Animations** | Framer Motion powered micro-interactions and transitions |
| **🔔 Toast Notifications** | Real-time feedback for all user actions |

### Authentication & Security

- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Google OAuth 2.0**: One-click sign-in with Google account integration
- **Session Management**: Persistent sessions with secure cookie handling
- **Protected Routes**: Middleware-protected API endpoints

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 React + TypeScript + Vite                  │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐  │  │
│  │  │  Pages  │ │Components│ │   Hooks    │ │  Services   │  │  │
│  │  └────┬────┘ └────┬─────┘ └─────┬──────┘ └──────┬──────┘  │  │
│  │       └──────────┬┴─────────────┴───────────────┘         │  │
│  └──────────────────┼────────────────────────────────────────┘  │
│                     │ Axios HTTP                                 │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      API Routes                            │  │
│  │  /api/v1/auth    /api/v1/content   /api/v1/nests          │  │
│  │  /api/v1/extract /api/v1/brain     /health                │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│  ┌──────────────┐ ┌───────┴───────┐ ┌───────────────────────┐  │
│  │  Middleware  │ │   Services    │ │     Passport.js       │  │
│  │  (JWT Auth)  │ │ (Metadata     │ │  (Google OAuth 2.0)   │  │
│  │              │ │  Extractor)   │ │                       │  │
│  └──────────────┘ └───────────────┘ └───────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   Users    │ │  Contents  │ │   Nests    │ │   Links    │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI component library with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Declarative animations |
| **React Router DOM** | Client-side routing |
| **Headless UI** | Accessible UI primitives |
| **Lucide React** | Beautiful icon set |
| **react-social-media-embed** | Native YouTube/Twitter embeds |
| **React Toastify** | Toast notifications |
| **Vercel Analytics** | Performance monitoring |

#### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe backend development |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **JSON Web Token (JWT)** | Authentication tokens |
| **Passport.js** | OAuth 2.0 integration |
| **bcrypt** | Password hashing |
| **Axios + Cheerio** | Web scraping for metadata extraction |
| **express-rate-limit** | API rate limiting |

### Database Schema

```typescript
// User Model
{
  username: string      // Unique username
  email: string         // Unique email address
  password: string      // Hashed password
  googleId?: string     // Google OAuth identifier
}

// Content Model
{
  title: string         // Content title
  link: string          // Original URL
  type: string          // Platform type (youtube, twitter, article, etc.)
  tags: string[]        // User-defined tags
  description?: string  // Content snippet/summary
  image?: string        // Thumbnail/OG image URL
  nestId?: ObjectId     // Reference to Nest collection
  userId: ObjectId      // Reference to User (required)
  createdAt: Date       // Auto-generated timestamp
}

// Nest Model (Collections)
{
  name: string          // Collection name
  description?: string  // Optional description
  userId: ObjectId      // Owner reference (required)
  createdAt: Date       // Auto-generated timestamp
}

// Link Model (Share Links)
{
  hash: string          // Unique share hash
  userId: ObjectId      // Owner reference (required)
}
```

---

## � Installation

### Prerequisites

- **Node.js** v16.0.0 or higher
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**
- **npm** or **yarn**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ayushsoni02/LinkNest.git
cd LinkNest

# 2. Setup Backend
cd MindVault-BE
npm install
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
npm run dev

# 3. Setup Frontend (new terminal)
cd MindVault-FE
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the `MindVault-BE` directory:

```bash
# Database
MONGO_URL=mongodb://localhost:27017/linknest

# Authentication
JWT_PASSWORD=your_secure_jwt_secret_minimum_32_characters
SESSION_SECRET=your_session_secret_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start the MongoDB service
3. Use connection string: `mongodb://localhost:27017/linknest`

**Option B: MongoDB Atlas (Recommended for Production)**
1. Create an account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Configure network access (IP whitelist)
4. Create database user
5. Get connection string and update `.env`

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

---

## � API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register new user |
| `POST` | `/api/v1/auth/signin` | Login with credentials |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth |
| `GET` | `/api/v1/auth/google/callback` | Google OAuth callback |

### Content Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/content` | Create new content | ✅ |
| `GET` | `/api/v1/content` | Get all user content | ✅ |
| `PUT` | `/api/v1/content/:id` | Update content (nest, tags) | ✅ |
| `DELETE` | `/api/v1/content/:id` | Delete content | ✅ |
| `POST` | `/api/v1/extract` | Extract URL metadata | ✅ |

### Nests (Collections)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/nests` | Create new nest | ✅ |
| `GET` | `/api/v1/nests` | Get all user nests | ✅ |
| `PUT` | `/api/v1/nests/:id` | Rename nest | ✅ |
| `DELETE` | `/api/v1/nests/:id` | Delete nest | ✅ |

### Sharing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/brain/share` | Generate/manage share link | ✅ |
| `GET` | `/api/v1/brain/:shareLink` | Get shared brain content | ❌ |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

---

## � Project Structure

```
LinkNest/
├── MindVault-BE/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.ts              # Express app & routes
│   │   ├── db.ts                 # MongoDB connection & schemas
│   │   ├── auth.ts               # Authentication routes
│   │   ├── middleware.ts         # JWT verification middleware
│   │   ├── passport.ts           # Google OAuth configuration
│   │   ├── metadataExtractor.ts  # URL metadata scraping service
│   │   ├── conf.ts               # Configuration constants
│   │   └── utils.ts              # Utility functions
│   ├── dist/                     # Compiled JavaScript
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── MindVault-FE/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── NestWorkspace.tsx # Nest detail view
│   │   │   ├── Signin.tsx        # Login page
│   │   │   ├── Signup.tsx        # Registration page
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── SmartLinkCard.tsx # Content card with embeds
│   │   │   ├── PreviewModal.tsx  # URL preview modal
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── AddLink.tsx       # Universal link input
│   │   │   ├── CreateNestModal.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useNests.ts       # Nest management hook
│   │   ├── services/
│   │   │   └── aiService.ts      # AI integration service
│   │   ├── App.tsx               # Root component & routing
│   │   ├── Config.tsx            # Global configuration
│   │   └── main.tsx              # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json               # Vercel deployment config
│   └── package.json
│
└── README.md
```

---

## � Troubleshooting

### Common Issues

<details>
<summary><strong>Backend won't start</strong></summary>

- ✅ Verify MongoDB is running: `mongod --version`
- ✅ Check `MONGO_URL` in `.env` is correct
- ✅ Ensure `.env.example` was copied to `.env`
- ✅ Check port 3000 is not in use: `lsof -i :3000`

</details>

<details>
<summary><strong>CORS errors in browser</strong></summary>

- ✅ Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- ✅ Default frontend: `http://localhost:5173`
- ✅ Ensure backend CORS is enabled (it is by default)

</details>

<details>
<summary><strong>JWT/Authentication errors</strong></summary>

- ✅ Ensure `JWT_PASSWORD` is set in `.env`
- ✅ Use minimum 32 characters for JWT secret
- ✅ Clear browser localStorage and cookies
- ✅ Check token is being sent in Authorization header

</details>

<details>
<summary><strong>Google OAuth not working</strong></summary>

- ✅ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- ✅ Check callback URL matches Google Cloud Console settings
- ✅ Ensure OAuth consent screen is configured

</details>

---

## 🚢 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `MindVault-FE`
3. Add environment variable: `VITE_BACKEND_URL=https://your-backend.com`
4. Deploy

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `MindVault-BE`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add all environment variables
7. Deploy

---

## 🔒 Security Best Practices

> **⚠️ Important Security Notes**

- **Never commit `.env` files** to version control
- Use strong, unique `JWT_PASSWORD` (minimum 32 characters)
- Enable MongoDB authentication in production
- Use HTTPS in production environments
- Implement rate limiting for API endpoints (already included)
- Regularly rotate secrets and credentials

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Ayush Soni** - [@ayushsoni02](https://github.com/ayushsoni02)

---

<p align="center">
  <strong>⭐ Star this repo if you find it useful!</strong>
</p>
