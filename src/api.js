import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Register user
export const register = (phone, password) =>
  axios.post(`${API_BASE}/register`, { phone, password });

// Login user and store JWT automatically
export const login = async (phone, password) => {
  const res = await axios.post(`${API_BASE}/login`, { phone, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('phone', phone);
  }
  return res;
};

// Calculate price
export const getPrice = (pickup, dropoff) =>
  axios.post(`${API_BASE}/price`, { pickup, dropoff });

// Create order using JWT from localStorage automatically
export const createOrder = (payload) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User not logged in');

  return axios.post(`${API_BASE}/order`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
