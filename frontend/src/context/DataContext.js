import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Demo mode - runs frontend only without backend
const DEMO_MODE = !API_URL || API_URL === '';

// Demo data
const DEMO_DATA = {
  cycles: [
    { _id: '1', id: 1, name: 'دورة مارس 2024', start_date: '2024-03-01', end_date: '2024-03-31', is_active: true }
  ],
  funds: [
    { _id: '1', id: 1, name: 'الصندوق الرئيسي', currency: 'USD', balance: 150000, type: 'main', is_main: true },
    { _id: '2', id: 2, name: 'صندوق النقد', currency: 'IQD', balance: 50000000, type: 'cash', is_main: false }
  ],
  clients: [
    { _id: '1', id: 1, name: 'أحمد محمد', phone: '07701234567', email: 'ahmed@example.com', balance: 5000 },
    { _id: '2', id: 2, name: 'سارة علي', phone: '07709876543', email: 'sara@example.com', balance: -2500 }
  ],
  subAgencies: [
    { _id: '1', id: 1, name: 'وكالة البصرة', location: 'البصرة', balance: 10000 },
    { _id: '2', id: 2, name: 'وكالة أربيل', location: 'أربيل', balance: 7500 }
  ],
  transferCompanies: [
    { _id: '1', id: 1, name: 'شركة الأمانة', balance: 25000 },
    { _id: '2', id: 2, name: 'شركة السرعة', balance: 18000 }
  ],
  approvals: [],
  members: [
    { _id: '1', id: 1, name: 'محمد أحمد', role: 'مدير', salary: 2000 },
    { _id: '2', id: 2, name: 'علي حسن', role: 'محاسب', salary: 1500 }
  ],
  dashboardSummary: {
    total_funds: 200000,
    total_debts: 15000,
    total_receivables: 8000,
    total_clients: 2,
    total_agencies: 2,
    total_companies: 2,
    cycle_profit: 12500,
    pending_approvals: 0,
    net_profit: 45000,
    total_expenses: 8500,
    payable_debts: 15000,
    receivable_debts: 22000,
    payment_dues: 5000,
    shipping_quantity: 1250
  }
};

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
    if (DEMO_MODE) {
      setCycles(DEMO_DATA.cycles);
      setActiveCycle(DEMO_DATA.cycles.find(c => c.is_active) || null);
      return;
    }
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
    if (DEMO_MODE) {
      setFunds(DEMO_DATA.funds);
      return;
    }
    try {
      const response = await api.get('/api/funds');
      setFunds(response.data);
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    if (DEMO_MODE) {
      setClients(DEMO_DATA.clients);
      return;
    }
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchSubAgencies = useCallback(async () => {
    if (DEMO_MODE) {
      setSubAgencies(DEMO_DATA.subAgencies);
      return;
    }
    try {
      const response = await api.get('/api/sub-agencies');
      setSubAgencies(response.data);
    } catch (error) {
      console.error('Error fetching sub-agencies:', error);
    }
  }, []);

  const fetchTransferCompanies = useCallback(async () => {
    if (DEMO_MODE) {
      setTransferCompanies(DEMO_DATA.transferCompanies);
      return;
    }
    try {
      const response = await api.get('/api/transfer-companies');
      setTransferCompanies(response.data);
    } catch (error) {
      console.error('Error fetching transfer companies:', error);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    if (DEMO_MODE) {
      setApprovals(DEMO_DATA.approvals);
      return;
    }
    try {
      const response = await api.get('/api/approvals');
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    if (DEMO_MODE) {
      setMembers(DEMO_DATA.members);
      return;
    }
    try {
      const response = await api.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async () => {
    if (DEMO_MODE) {
      setDashboardSummary(DEMO_DATA.dashboardSummary);
      return;
    }
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
