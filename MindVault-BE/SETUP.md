# LinkNest Backend Setup

## Environment Variables Setup

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your actual values:**

   ### Required Variables:

   - `MONGO_URL`: Your MongoDB connection string
   - `JWT_PASSWORD`: A secure secret key for JWT tokens

   ### Optional Variables:

   - `PORT`: Server port (default: 3000)
   - `NODE_ENV`: Environment (development/production)
   - `FRONTEND_URL`: Frontend URL for CORS

   ### Email Configuration (for future features):

   - `EMAIL_SERVICE`: Email service provider
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email app password

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Start the development server:
   ```bash
   npm run dev
   ```

## Important Notes

- **Never commit your `.env` file** - it contains sensitive information
- Use strong, unique values for `JWT_PASSWORD` in production
- For MongoDB, you can use MongoDB Atlas (cloud) or local MongoDB installation

## Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Setup for Google OAuth
Just to need add some more variables in .env file.
For more information refer **README.md** inside `MindVault-BE`
### Google OAuth credentials
- GOOGLE_CLIENT_ID=`your_google_client_id_here`
- GOOGLE_CLIENT_SECRET=`your_google_client_secret_here`

### express-session
- SESSION_SECRET=`your_session_secret_here`