import { useEffect,useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../Config.tsx';
import Navigation from '../components/Navigation';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedToken = useRef(false); // Add this ref to track if we've already processed the token
  
  useEffect(() => {
    const token = searchParams.get('token');
    // console.token()
    
    if (token && !processedToken.current) {
      processedToken.current = true; // Mark as processed

      // Store token
      localStorage.setItem('token', `Bearer ${token}`);
      
      // Get user info
      fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': token
        }
      })
      .then(res => {
        if(!res.ok) toast.error("Failed to get user info");
        return res.json()
      })
      .then(data => {
        if (data.username) {
          localStorage.setItem('user', data.username);
          toast.success('Successfully signed in with Google!');
          navigate('/dashboard');
        } else {
          throw new Error('Failed to get user info');
        }
      })
      .catch(err => {
        console.error('Error during OAuth callback:', err);
        toast.error('Authentication failed');
        navigate('/signin');
      });
    } else if(!token && !processedToken.current) {
      processedToken.current = true; // Mark as processed
      toast.error('Authentication failed - No token received');
      navigate('/signin');
    }
  }, [navigate, searchParams]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Signing you in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}