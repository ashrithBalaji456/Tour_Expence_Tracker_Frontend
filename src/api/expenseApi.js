import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tour-expence-tracker-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const expenseApi = {
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

  // Funds CRUD
  getAllFunds: async () => {
    const response = await api.get('/funds');
    return response.data;
  },

  addFund: async (fundData) => {
    const response = await api.post('/funds', fundData);
    return response.data;
  },

  updateFund: async (id, fundData) => {
    const response = await api.put(`/funds/${id}`, fundData);
    return response.data;
  },

  deleteFund: async (id) => {
    await api.delete(`/funds/${id}`);
  },

  // Pre-Trip Planner API
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
