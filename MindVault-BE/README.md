## This readme mainly focus on implementation of oauth of Google through passport
## LinkNest Backend API with Google OAuth

### Authentication API

The LinkNest backend now supports both traditional JWT authentication and Google OAuth.

## These endpoints move to the seperate module auth.ts for better understanding or maintainence
### Traditional Authentication Endpoints

- **POST /api/v1/auth/register** - Register new user
- **POST /api/v1/auth/login** - Login existing user
- **GET /api/v1/auth/me** - Get current user (requires token)

### Google OAuth Endpoints

- **GET /api/v1/auth/google** - Initiate Google OAuth flow
- **GET /api/v1/auth/google/callback** - Handle Google OAuth callback

## OAuth Implementation Details

### Dependencies

```json
{
  "passport": "^0.6.x",
  "passport-google-oauth20": "^2.0.x"
}
```

### Configuration

OAuth requires the following environment variables:

```
MONGO_URL=mongodb-connection-uri
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_PASSWORD=your-jwt-secret
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### Implementation

OAuth is implemented using Passport.js with the Google OAuth 2.0 strategy. The main components are:

1. **Passport Configuration** (in `passport.ts`)
   - Configures Google OAuth 2.0 strategy
   - Handles serialization and deserialization of user objects

2. **Auth Routes** (in `auth.ts`)
   - Defines routes for Google OAuth initiation and callback
   - Handles user creation or linking based on email
   - Issues JWT tokens upon successful authentication

3. **Authentication Middleware** (in `middleware.ts`)
   - Verifies JWT tokens for protected routes
   - Works with both traditional and OAuth authentication methods

### OAuth Flow

1. Frontend redirects to `/api/v1/auth/google`
2. User authenticates with Google
3. Google redirects to `/api/v1/auth/google/callback`
4. Backend creates/finds user and generates JWT
5. User is redirected to frontend with token
6. Frontend stores token and redirects to dashboard

### Development Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Set authorized origin URI : `http://localhost:5173` or frontend url
3. Set authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback` or `http://${backend}/api/v1/auth/google/callback`
4. Add credentials to `.env` file
5. Configure frontend to redirect to `/api/v1/auth/google` for OAuth login