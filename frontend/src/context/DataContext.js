import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [funds, setFunds] = useState([]);
  const [clients, setClients] = useState([]);
  const [subAgencies, setSubAgencies] = useState([]);
  const [transferCompanies, setTransferCompanies] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [members, setMembers] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_URL
  });

  // Add token to all requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchCycles = useCallback(async () => {
    try {
      const response = await api.get('/api/cycles');
      setCycles(response.data);
      const active = response.data.find(c => c.is_active);
      setActiveCycle(active || null);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  }, []);

  const fetchFunds = useCallback(async () => {
    try {
      const response = await api.get('/api/funds');
      setFunds(response.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchSubAgencies = useCallback(async () => {
    try {
      const response = await api.get('/api/sub-agencies');
      setSubAgencies(response.data);
    } catch (error) {
      console.error('Error fetching sub-agencies:', error);
    }
  }, []);

  const fetchTransferCompanies = useCallback(async () => {
    try {
      const response = await api.get('/api/transfer-companies');
      setTransferCompanies(response.data);
    } catch (error) {
      console.error('Error fetching transfer companies:', error);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    try {
      const response = await api.get('/api/approvals');
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await api.get('/api/dashboard/summary');
      setDashboardSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchCycles(),
      fetchFunds(),
      fetchClients(),
      fetchSubAgencies(),
      fetchTransferCompanies(),
      fetchApprovals(),
      fetchMembers(),
      fetchDashboardSummary()
    ]);
    setLoading(false);
  }, [fetchCycles, fetchFunds, fetchClients, fetchSubAgencies, fetchTransferCompanies, fetchApprovals, fetchMembers, fetchDashboardSummary]);

  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user]);

  // Cycle operations
  const createCycle = async (data) => {
    const response = await api.post('/api/cycles', data);
    await fetchCycles();
    await fetchDashboardSummary();
    return response.data;
  };

  const activateCycle = async (cycleId) => {
    await api.put(`/api/cycles/${cycleId}/activate`);
    await fetchCycles();
    await fetchDashboardSummary();
  };

  // Fund operations
  const createFund = async (data) => {
    const response = await api.post('/api/funds', data);
    await fetchFunds();
    await fetchDashboardSummary();
    return response.data;
  };

  const fundTransaction = async (fundId, data) => {
    const response = await api.post(`/api/funds/${fundId}/transaction`, data);
    await fetchFunds();
    await fetchDashboardSummary();
    return response.data;
  };

  // Client operations
  const createClient = async (data) => {
    const response = await api.post('/api/clients', data);
    await fetchClients();
    return response.data;
  };

  const updateClient = async (clientId, data) => {
    const response = await api.put(`/api/clients/${clientId}`, data);
    await fetchClients();
    return response.data;
  };

  const deleteClient = async (clientId) => {
    await api.delete(`/api/clients/${clientId}`);
    await fetchClients();
  };

  // Sub-agency operations
  const createSubAgency = async (data) => {
    const response = await api.post('/api/sub-agencies', data);
    await fetchSubAgencies();
    return response.data;
  };

  const agencyBonus = async (agencyId, amount, notes) => {
    const response = await api.post(`/api/sub-agencies/${agencyId}/bonus`, null, {
      params: { amount, notes }
    });
    await fetchSubAgencies();
    await fetchDashboardSummary();
    return response.data;
  };

  const agencyDeductShipping = async (agencyId, amount, notes) => {
    const response = await api.post(`/api/sub-agencies/${agencyId}/deduct-shipping`, null, {
      params: { amount, notes }
    });
    await fetchSubAgencies();
    await fetchDashboardSummary();
    return response.data;
  };

  // Transfer company operations
  const createTransferCompany = async (data) => {
    const response = await api.post('/api/transfer-companies', data);
    await fetchTransferCompanies();
    return response.data;
  };

  const companyDisburse = async (companyId, amount, recordAsDebt, notes) => {
    const response = await api.post(`/api/transfer-companies/${companyId}/disburse`, null, {
      params: { amount, record_as_debt: recordAsDebt, notes }
    });
    await fetchTransferCompanies();
    await fetchDashboardSummary();
    return response.data;
  };

  // Approval operations
  const createApproval = async (data) => {
    const response = await api.post('/api/approvals', data);
    await fetchApprovals();
    return response.data;
  };

  const approvalTransaction = async (approvalId, data) => {
    const response = await api.post(`/api/approvals/${approvalId}/transaction`, data);
    await fetchApprovals();
    await fetchDashboardSummary();
    return response.data;
  };

  // Member operations
  const createMember = async (data) => {
    const response = await api.post('/api/members', data);
    await fetchMembers();
    return response.data;
  };

  // Expense operations
  const createExpense = async (data) => {
    const response = await api.post('/api/expenses', data);
    await fetchDashboardSummary();
    await fetchFunds();
    return response.data;
  };

  // Shipping operations
  const createShippingTransaction = async (data) => {
    const response = await api.post('/api/shipping', data);
    await fetchDashboardSummary();
    return response.data;
  };

  // Debt operations
  const createDebt = async (data) => {
    const response = await api.post('/api/debts', data);
    await fetchDashboardSummary();
    return response.data;
  };

  const payDebt = async (debtId, amount, notes) => {
    const response = await api.post(`/api/debts/${debtId}/pay`, null, {
      params: { amount, notes }
    });
    await fetchDashboardSummary();
    return response.data;
  };

  // FX Spread operations
  const createFxSpread = async (data) => {
    const response = await api.post('/api/fx-spread', data);
    await fetchDashboardSummary();
    await fetchFunds();
    return response.data;
  };

  // Adjustment operations
  const createAdjustment = async (data) => {
    const response = await api.post('/api/adjustments', data);
    return response.data;
  };

  // Payment due operations
  const createPaymentDue = async (data) => {
    const response = await api.post('/api/payment-due', data);
    await fetchDashboardSummary();
    return response.data;
  };

  const payPaymentDue = async (paymentId) => {
    const response = await api.post(`/api/payment-due/${paymentId}/pay`);
    await fetchDashboardSummary();
    return response.data;
  };

  // Search
  const search = async (query) => {
    const response = await api.get('/api/search', { params: { q: query } });
    return response.data;
  };

  const value = {
    cycles,
    activeCycle,
    funds,
    clients,
    subAgencies,
    transferCompanies,
    approvals,
    members,
    dashboardSummary,
    loading,
    refreshAll,
    fetchCycles,
    fetchFunds,
    fetchClients,
    fetchDashboardSummary,
    createCycle,
    activateCycle,
    createFund,
    fundTransaction,
    createClient,
    updateClient,
    deleteClient,
    createSubAgency,
    agencyBonus,
    agencyDeductShipping,
    createTransferCompany,
    companyDisburse,
    createApproval,
    approvalTransaction,
    createMember,
    createExpense,
    createShippingTransaction,
    createDebt,
    payDebt,
    createFxSpread,
    createAdjustment,
    createPaymentDue,
    payPaymentDue,
    search,
    api
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
