import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ClipboardCheck,
  Search,
  Users,
  UserCog,
  SlidersHorizontal,
  MessageSquare,
  CheckCircle,
  Building,
  Building2,
  Truck,
  Wallet,
  Receipt,
  CreditCard,
  HandCoins,
  Clock,
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  Coins,
  BarChart3,
  RefreshCw,
  Home
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { activeCycle, cycles } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuSections = [
    {
      title: 'الرئيسية',
      items: [
        { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
        { icon: BarChart3, label: 'التحليلات', path: '/analytics' },
        { icon: FileSpreadsheet, label: 'Sheet', path: '/sheet' },
      ]
    },
    {
      title: 'العمليات',
      items: [
        { icon: ClipboardCheck, label: 'تدقيق الرواتب', path: '/payroll' },
        { icon: Search, label: 'البحث', path: '/search' },
        { icon: Users, label: 'بيانات العملاء', path: '/clients' },
        { icon: UserCog, label: 'بيانات المستخدمين', path: '/member-directory' },
        { icon: SlidersHorizontal, label: 'إضافات وخصومات', path: '/member-adjustments' },
        { icon: MessageSquare, label: 'ترتيب الرسائل', path: '/messages' },
        { icon: CheckCircle, label: 'الاعتمادات', path: '/approvals' },
      ]
    },
    {
      title: 'الوكالات والتحويل',
      items: [
        { icon: Building, label: 'الوكالات الفرعية', path: '/sub-agencies' },
        { icon: Building2, label: 'الوكالة الرئيسية', path: '/main-agency' },
        { icon: Truck, label: 'شركات التحويل', path: '/transfer-companies' },
        { icon: Wallet, label: 'الصناديق', path: '/funds' },
      ]
    },
    {
      title: 'الديون والمستحقات',
      items: [
        { icon: Receipt, label: 'الديون', path: '/debts' },
        { icon: CreditCard, label: 'دين علينا', path: '/payables-us' },
        { icon: HandCoins, label: 'ديين لنا', path: '/receivables-to-us' },
        { icon: Clock, label: 'مطلوب دفع', path: '/payment-due' },
        { icon: TrendingUp, label: 'فرق التصريف', path: '/fx-spread' },
      ]
    },
    {
      title: 'المالية',
      items: [
        { icon: Package, label: 'الشحن', path: '/shipping' },
        { icon: DollarSign, label: 'المصاريف', path: '/expenses-manual' },
        { icon: Coins, label: 'مصادر الربح', path: '/profit-sources' },
        { icon: Briefcase, label: 'وساطة إدارية', path: '/admin-brokerage' },
      ]
    },
    {
      title: 'النظام',
      items: [
        { icon: Settings, label: 'الإعدادات', path: '/settings' },
      ]
    }
  ];

  const fabOutActions = [
    { icon: Package, label: 'شحن', action: () => navigate('/shipping?type=out') },
    { icon: Building, label: 'وكالة فرعية', action: () => navigate('/sub-agencies?action=bonus') },
    { icon: Truck, label: 'شركة تحويل', action: () => navigate('/transfer-companies?action=disburse') },
    { icon: Wallet, label: 'صندوق', action: () => navigate('/funds?action=transfer') },
    { icon: DollarSign, label: 'مصروف', action: () => navigate('/expenses-manual?action=add') },
    { icon: Clock, label: 'مطلوب دفع', action: () => navigate('/payment-due') },
  ];

  const fabInActions = [
    { icon: Package, label: 'شحن + تبديل راتب', action: () => navigate('/shipping?type=in') },
    { icon: Receipt, label: 'دين', action: () => navigate('/debts?action=add') },
    { icon: CheckCircle, label: 'اعتماد', action: () => navigate('/approvals?action=add') },
    { icon: TrendingUp, label: 'فرق تصريف', action: () => navigate('/fx-spread?action=add') },
    { icon: HandCoins, label: 'ديين لنا', action: () => navigate('/receivables-to-us') },
    { icon: Building, label: 'خصم وكالة', action: () => navigate('/sub-agencies?action=deduct') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          data-testid="mobile-menu-button"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">LorkERP</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold"
          >
            {user?.name?.charAt(0) || 'م'}
          </button>
          
          {userMenuOpen && (
            <div className="absolute left-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50">
                <Settings className="w-4 h-4" />
                الإعدادات
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">LorkERP</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cycle Selector */}
          {activeCycle && (
            <div className="p-4 border-b border-slate-200">
              <div className="bg-primary-50 rounded-lg p-3">
                <p className="text-xs text-primary-600 font-medium">الدورة النشطة</p>
                <p className="text-sm font-semibold text-primary-800">{activeCycle.name}</p>
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1 px-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                      data-testid={`nav-${item.path.replace('/', '')}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-ghost w-full justify-start text-red-600 hover:bg-red-50"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 pt-16 lg:pt-0 min-h-screen pb-24 lg:pb-8">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* FAB - Quick Action Button */}
      <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-80 lg:translate-x-0 z-[60]">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-[61]"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* صادر */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-red-600">
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">صادر</span>
                  </div>
                  <div className="space-y-2">
                    {fabOutActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFabOpen(false);
                          action.action();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* وارد */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">وارد</span>
                  </div>
                  <div className="space-y-2">
                    {fabInActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFabOpen(false);
                          action.action();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            fabOpen 
              ? 'bg-slate-800 text-white' 
              : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
          }`}
          whileTap={{ scale: 0.95 }}
          data-testid="quick-action-fab"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-around h-full">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-16 h-full ${
              isActive('/dashboard') ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">الرئيسية</span>
          </Link>
          <Link
            to="/sheet"
            className={`flex flex-col items-center justify-center w-16 h-full ${
              isActive('/sheet') ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs mt-1">Sheet</span>
          </Link>
          <div className="w-16" /> {/* Spacer for FAB */}
          <Link
            to="/clients"
            className={`flex flex-col items-center justify-center w-16 h-full ${
              isActive('/clients') ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">العملاء</span>
          </Link>
          <Link
            to="/search"
            className={`flex flex-col items-center justify-center w-16 h-full ${
              isActive('/search') ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">البحث</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
