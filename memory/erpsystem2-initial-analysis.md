# ERPSYSTEM2 Initial Structural Analysis (for LorkERP migration)

## Main modules discovered
- Home Dashboard (`/dashboard`)
- Sheet (`/sheet`)
- Payroll Audit (`/payroll`)
- Search (`/search`)
- Clients (`/clients`)
- Member Directory (`/member-directory`, `/member-directory/member/:memberUserId`)
- Member Adjustments (`/member-adjustments`)
- Sub Agencies (`/sub-agencies`)
- Main Agency (`/main-agency`)
- Transfer Companies (`/transfer-companies`)
- Funds (`/funds`)
- Debts Hub (`/debts`, `/debts/company/:id`, `/debts/fund/:id`)
- Payables (Debt on us) (`/payables-us`)
- Receivables (Debt to us) (`/receivables-to-us`)
- Payment Due (`/payment-due`)
- FX Spread (`/fx-spread`)
- Shipping (`/shipping`)
- Expenses (`/expenses-manual`)
- Profit Sources (`/profit-sources`, `/profit-sources/:sourceType/detail`)
- Admin Brokerage (`/admin-brokerage`)
- Deferred Balance (`/deferred-balance`)
- Settings (`/settings`)

## Quick action (+) system
Floating radial action button with two roots:
- Outgoing (`صادر`): shipping sell, sub-agency reward, transfer-company payout, fund payout, expense, payment-due.
- Incoming (`وارد`): shipping buy/salary-swap, debt, accreditation, FX spread, receivables, sub-agency deduction.

This acts as a workflow router and lightweight modal launcher across core accounting modules.

## Relationships snapshot
- **Debt triad**: Debts hub links to Payables, Receivables, and Payment Due; each page cross-links back.
- **Entity accounting**: Transfer Companies, Funds, Sub Agencies all feed debt/receivable/payable summaries.
- **Shipping ↔ accounting**: shipping operations impact profit, debt totals, and dashboard aggregates.
- **FX Spread/Admin Brokerage/Expenses**: all feed ledger/profit view and dashboard KPIs.
- **Member Directory + Adjustments + Deferred Balance + Search**: user-centric operations sharing member identifiers, salary/deferred state, and audit lookup.
- **Settings**: system control and destructive/reset operations.

## Notes for migration to current LorkERP frontend
- Preserve current LorkERP visual identity; port logic, structure, page flows, and controls from ERPSYSTEM2.
- Enforce RTL, responsive behavior, and UI-only CRUD flows.
- Rebuild with React + Tailwind + Lucide in current project architecture (no backend additions).
