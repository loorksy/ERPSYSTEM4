# LorkERP - Professional Arabic Accounting System

## Original Problem Statement
A professional, comprehensive Arabic RTL accounting system (LorkERP) with a full financial flow map, Dashboard, Analytics, and multiple entities (Clients, Funds, Shipping, Expenses, etc.). Future integration with Google Sheets. To be deployed on a VPS.

## Tech Stack
- **Frontend:** React, TailwindCSS, React Router, Recharts, Lucide-React, Framer Motion
- **Backend:** Python, FastAPI, PyMongo, JWT Auth (python-jose), Passlib
- **Database:** MongoDB

## Architecture
- RTL (Arabic) layout throughout
- JWT token-based auth stored in localStorage (NOT cookies - preview env limitation)
- Sidebar navigation on desktop, bottom nav on mobile

## Completed Features
- [x] Project structure setup (React + FastAPI + MongoDB)
- [x] Core RTL Layout (Layout.js) with Sidebar + Bottom Nav
- [x] JWT Authentication (login, register, logout, me)
- [x] Dashboard with financial summary cards
- [x] Analytics page with Recharts (trends, shipping trends)
- [x] Scaffold pages for all accounting modules
- [x] FAB/Quick Action button - Desktop: left side, Mobile: centered in bottom nav, Menu: centered overlay
- [x] Auth migration from cookies to localStorage (fixed preview env issue)

## Data Status
- **MOCKED:** Most business pages (Clients, Funds, Shipping, Expenses, Debts, etc.) use mock/static data

## Upcoming Tasks (P0-P1)
- [ ] Implement CRUD for scaffolded pages (Clients, Funds, Shipping, Expenses, Debts, SubAgencies)
- [ ] Proper MongoDB ObjectId handling in all API responses

## Future Tasks (P2)
- [ ] Google Sheets Integration
- [ ] Advanced reporting & PDF invoice/receipt generation

## Key Files
- `/app/backend/server.py` - All routing, endpoints, JWT logic
- `/app/frontend/src/components/Layout.js` - Main layout with sidebar, bottom nav, FAB
- `/app/frontend/src/context/AuthContext.js` - Auth state management
- `/app/frontend/src/context/DataContext.js` - App data context
- `/app/frontend/src/pages/` - All page components

## Test Credentials
- Email: admin@lorkerp.com
- Password: Admin@123456
