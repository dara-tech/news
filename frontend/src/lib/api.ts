import axios from 'axios';

const isServer = typeof window === 'undefined';

const api = axios.create({
  baseURL:
    isServer
      ? process.env.INTERNAL_API_URL || 'http://localhost:5001/api' // URL for server-side requests
      : process.env.NEXT_PUBLIC_API_URL || '/api', // URL for client-side requests
  withCredentials: true, // Important for sending cookies
});

export default api;
