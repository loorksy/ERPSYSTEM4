import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Funds from './pages/Funds';
import Shipping from './pages/Shipping';
import Expenses from './pages/Expenses';
import Debts from './pages/Debts';
import SubAgencies from './pages/SubAgencies';
import TransferCompanies from './pages/TransferCompanies';
import Approvals from './pages/Approvals';
import SearchPage from './pages/Search';
import Settings from './pages/Settings';
import Sheet from './pages/Sheet';
import Payroll from './pages/Payroll';
import MemberDirectory from './pages/MemberDirectory';
import MemberAdjustments from './pages/MemberAdjustments';
import Messages from './pages/Messages';
import MainAgency from './pages/MainAgency';
import FxSpread from './pages/FxSpread';
import PaymentDue from './pages/PaymentDue';
import ProfitSources from './pages/ProfitSources';
import { PayablesUs, ReceivablesToUs, AdminBrokerage } from './pages/DebtPages';

// Components
import Layout from './components/Layout';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="spinner w-10 h-10 mx-auto mb-4" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DataProvider>{children}</DataProvider>;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sheet" element={<Sheet />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="clients" element={<Clients />} />
            <Route path="member-directory" element={<MemberDirectory />} />
            <Route path="member-adjustments" element={<MemberAdjustments />} />
            <Route path="messages" element={<Messages />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="sub-agencies" element={<SubAgencies />} />
            <Route path="main-agency" element={<MainAgency />} />
            <Route path="transfer-companies" element={<TransferCompanies />} />
            <Route path="funds" element={<Funds />} />
            <Route path="debts" element={<Debts />} />
            <Route path="payables-us" element={<PayablesUs />} />
            <Route path="receivables-to-us" element={<ReceivablesToUs />} />
            <Route path="payment-due" element={<PaymentDue />} />
            <Route path="fx-spread" element={<FxSpread />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="expenses-manual" element={<Expenses />} />
            <Route path="profit-sources" element={<ProfitSources />} />
            <Route path="admin-brokerage" element={<AdminBrokerage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
