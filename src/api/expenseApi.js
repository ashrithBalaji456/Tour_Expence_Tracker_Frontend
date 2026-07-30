import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'https://tour-expence-tracker-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (activeGroupId) {
      config.headers['X-Trip-Group-Id'] = activeGroupId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const expenseApi = {
  // Auth & Group Operations
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  createGroup: async (groupName, memberUsernames) => {
    const response = await api.post('/auth/group', { groupName, memberUsernames });
    return response.data;
  },

  getMyGroups: async () => {
    const response = await api.get('/auth/groups');
    return response.data;
  },

  // Dashboard Summary
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Expenses CRUD
  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getExpensesByDate: async (dateString) => {
    const response = await api.get(`/expenses/date/${dateString}`);
    return response.data;
  },

  getExpensesByCategory: async (category) => {
    const response = await api.get(`/expenses/category/${category}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
  },

  // Funds CRUD (kept for reference, pool deposits simplified)
  getAllFunds: async () => {
    const response = await api.get('/funds');
    return response.data;
  },

  createFund: async (fundData) => {
    const response = await api.post('/funds', fundData);
    return response.data;
  },

  deleteFund: async (id) => {
    await api.delete(`/funds/${id}`);
  },

  // Pre-Trip / Upfront Bookings CRUD
  getPreTripMembers: async () => {
    const response = await api.get('/pretrip/members');
    return response.data;
  },

  savePreTripMember: async (memberData) => {
    const response = await api.post('/pretrip/members', memberData);
    return response.data;
  },

  deletePreTripMember: async (id) => {
    await api.delete(`/pretrip/members/${id}`);
  },

  getPreTripExpenses: async () => {
    const response = await api.get('/pretrip/expenses');
    return response.data;
  },

  createPreTripExpense: async (expenseData) => {
    const response = await api.post('/pretrip/expenses', expenseData);
    return response.data;
  },

  updatePreTripExpense: async (id, expenseData) => {
    const response = await api.put(`/pretrip/expenses/${id}`, expenseData);
    return response.data;
  },

  deletePreTripExpense: async (id) => {
    await api.delete(`/pretrip/expenses/${id}`);
  },

  getPreTripSummary: async () => {
    const response = await api.get('/pretrip/summary');
    return response.data;
  },
};
