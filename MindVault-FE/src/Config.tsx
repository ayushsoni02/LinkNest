// Detect if we are in development mode or production
const isDev = import.meta.env.MODE === 'development';

export const BACKEND_URL = isDev 
    ? "http://localhost:3000" 
    : "https://cerebra.onrender.com";

export const FRONTEND_URL = isDev 
    ? "http://localhost:5173" 
    : "https://cerebra-gamma.vercel.app";