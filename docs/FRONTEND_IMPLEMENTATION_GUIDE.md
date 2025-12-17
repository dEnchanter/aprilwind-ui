# Fashion Management System - Frontend Implementation Guide

This guide provides a complete blueprint for building the frontend application, including dashboard structure, page layouts, routing, and API endpoint mappings.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack Recommendations](#technology-stack-recommendations)
3. [Application Structure](#application-structure)
4. [Dashboard Layout](#dashboard-layout)
5. [Navigation & Routing](#navigation--routing)
6. [Page-by-Page Implementation](#page-by-page-implementation)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Component Library](#component-library)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### Application Type
**Single Page Application (SPA)** with dashboard-based layout

### Key Features
- Role-based access control (RBAC)
- Real-time dashboard updates
- Workflow management interfaces
- Comprehensive reporting
- Mobile-responsive design

### User Roles
1. **Administrator** - Full system access
2. **Manager** - Production, sales, inventory management
3. **Staff** - Limited access based on department
4. **Viewer** - Read-only access to reports

---

## Technology Stack Recommendations

### Frontend Framework
**Option 1: React (Recommended)**
```bash
npx create-react-app fashion-management --template typescript
```

**Option 2: Vue.js**
```bash
npm create vue@latest fashion-management
```

**Option 3: Angular**
```bash
ng new fashion-management
```

### UI Component Library
- **Material-UI (MUI)** - For React
- **Ant Design** - For React
- **Vuetify** - For Vue.js
- **PrimeNG** - For Angular

### State Management
- **Redux Toolkit** (React)
- **Pinia** (Vue)
- **NgRx** (Angular)
- **React Query** / **TanStack Query** (API state)

### Routing
- **React Router** (React)
- **Vue Router** (Vue)
- **Angular Router** (Angular)

### HTTP Client
- **Axios** (Recommended)
- **Fetch API**
- **Angular HttpClient**

### Charts & Visualization
- **Chart.js** / **React-Chartjs-2**
- **Recharts**
- **ApexCharts**

### Date Handling
- **date-fns**
- **Day.js**
- **Moment.js** (deprecated but still widely used)

---

## Application Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Table.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── AlertCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── KPIWidget.tsx
│   ├── production/
│   │   ├── ProductionCard.tsx
│   │   ├── StageIndicator.tsx
│   │   └── MaterialRequestForm.tsx
│   ├── inventory/
│   │   ├── StockCard.tsx
│   │   ├── AvailabilityIndicator.tsx
│   │   └── StockAdjustmentForm.tsx
│   └── sales/
│       ├── InvoiceCard.tsx
│       ├── OrderTimeline.tsx
│       └── PaymentForm.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   ├── materials/
│   │   ├── MaterialsList.tsx
│   │   ├── MaterialDetails.tsx
│   │   ├── AddMaterial.tsx
│   │   └── MaterialTransactions.tsx
│   ├── production/
│   │   ├── ProductionList.tsx
│   │   ├── ProductionDetails.tsx
│   │   ├── MaterialRequests.tsx
│   │   └── ProductionOrders.tsx
│   ├── inventory/
│   │   ├── StockList.tsx
│   │   ├── StockDetails.tsx
│   │   └── AvailabilityCheck.tsx
│   ├── sales/
│   │   ├── InvoicesList.tsx
│   │   ├── InvoiceDetails.tsx
│   │   ├── CreateInvoice.tsx
│   │   └── InvoiceWorkflow.tsx
│   ├── customers/
│   │   ├── CustomersList.tsx
│   │   ├── CustomerDetails.tsx
│   │   └── CustomerOrders.tsx
│   ├── reports/
│   │   ├── ReportsDashboard.tsx
│   │   ├── ProductionReport.tsx
│   │   ├── SalesReport.tsx
│   │   ├── InventoryReport.tsx
│   │   └── BusinessReport.tsx
│   └── settings/
│       ├── Profile.tsx
│       ├── Users.tsx
│       └── System.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── materials.service.ts
│   ├── production.service.ts
│   ├── inventory.service.ts
│   ├── sales.service.ts
│   ├── reports.service.ts
│   └── dashboard.service.ts
├── store/
│   ├── index.ts
│   ├── auth.slice.ts
│   ├── dashboard.slice.ts
│   └── ui.slice.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validators.ts
│   └── formatters.ts
├── types/
│   ├── api.types.ts
│   ├── entities.types.ts
│   └── common.types.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── usePagination.ts
│   └── useDebounce.ts
├── App.tsx
└── index.tsx
```

---

## Dashboard Layout

### Main Layout Structure

```
┌──────────────────────────────────────────────┐
│ Navbar (Logo, Search, Notifications, User)  │
├──────────┬───────────────────────────────────┤
│          │                                   │
│ Sidebar  │  Main Content Area                │
│          │                                   │
│ - Home   │  [Page Content]                   │
│ - Prod.  │                                   │
│ - Sales  │                                   │
│ - Inv.   │                                   │
│ - Rep.   │                                   │
│          │                                   │
│          │                                   │
├──────────┴───────────────────────────────────┤
│ Footer (Version, Support)                    │
└──────────────────────────────────────────────┘
```

### Navbar Components
- **Logo/Brand** - Home link
- **Global Search** - Search across entities
- **Notifications** - Alert bell icon
- **User Menu** - Profile, settings, logout

### Sidebar Menu Structure
```
Dashboard
  ├─ Overview
  └─ Analytics

Production
  ├─ Productions
  ├─ Material Requests
  ├─ Production Orders
  └─ Product Definitions

Inventory
  ├─ Raw Materials
  ├─ Product Stock
  └─ Availability Check

Sales
  ├─ Invoices
  ├─ Customers
  └─ Customer Orders

Reports
  ├─ Production Report
  ├─ Sales Report
  ├─ Inventory Report
  ├─ Materials Report
  ├─ Customer Report
  └─ Business Report

Settings
  ├─ Staff Management
  ├─ Roles & Permissions
  ├─ Master Data
  └─ System Settings
```

---

## Navigation & Routing

### Route Structure (React Router Example)

```typescript
// App Routes
const routes = [
  // Auth
  { path: '/login', component: Login, public: true },
  { path: '/register', component: Register, public: true },

  // Dashboard
  { path: '/', component: Dashboard, exact: true },
  { path: '/dashboard', component: Dashboard },

  // Materials
  { path: '/materials', component: MaterialsList },
  { path: '/materials/:id', component: MaterialDetails },
  { path: '/materials/add', component: AddMaterial },
  { path: '/materials/:id/transactions', component: MaterialTransactions },

  // Production
  { path: '/productions', component: ProductionList },
  { path: '/productions/:id', component: ProductionDetails },
  { path: '/material-requests', component: MaterialRequests },
  { path: '/production-orders', component: ProductionOrders },
  { path: '/production-orders/:id', component: ProductionOrderDetails },

  // Inventory
  { path: '/inventory/stock', component: StockList },
  { path: '/inventory/stock/:id', component: StockDetails },
  { path: '/inventory/availability', component: AvailabilityCheck },

  // Sales
  { path: '/invoices', component: InvoicesList },
  { path: '/invoices/:id', component: InvoiceDetails },
  { path: '/invoices/create', component: CreateInvoice },

  // Customers
  { path: '/customers', component: CustomersList },
  { path: '/customers/:id', component: CustomerDetails },

  // Reports
  { path: '/reports', component: ReportsDashboard },
  { path: '/reports/production', component: ProductionReport },
  { path: '/reports/sales', component: SalesReport },
  { path: '/reports/inventory', component: InventoryReport },
  { path: '/reports/business', component: BusinessReport },

  // Settings
  { path: '/settings/profile', component: Profile },
  { path: '/settings/users', component: Users },
  { path: '/settings/system', component: SystemSettings },
];
```

---

## Page-by-Page Implementation

### 1. Dashboard Page (`/dashboard`)

**Purpose:** System overview with key metrics, alerts, and activities

**API Endpoints:**
```typescript
GET /dashboard/overview
GET /dashboard/alerts
GET /dashboard/activities?limit=20
GET /dashboard/kpis
```

**Layout:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Metric Card     │ Metric Card     │ Metric Card     │
│ Production      │ Sales           │ Materials       │
│ Total: 150      │ Revenue: 5.4M   │ Low Stock: 8    │
└─────────────────┴─────────────────┴─────────────────┘

┌───────────────────────────────────────────────────────┐
│ Alerts Section                                        │
│ [!] 5 material requests pending approval             │
│ [!] 3 raw materials running low                      │
└───────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────┐
│ Recent Activities       │ KPIs                        │
│ - Production #45        │ This Month:                 │
│   completed             │ - 34 Productions            │
│ - Invoice #87 paid      │ - 3.4M Revenue              │
│ - Material request      │ This Week:                  │
│   approved              │ - 127 Activities            │
└─────────────────────────┴─────────────────────────────┘
```

**Components:**
- **MetricCard** - Shows key metric with icon and trend
- **AlertCard** - Displays alert with severity indicator
- **ActivityFeed** - List of recent system activities
- **KPIWidget** - Key performance indicators

**Implementation Example:**
```typescript
// Dashboard.tsx
import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [overviewData, alertsData, activitiesData] = await Promise.all([
      dashboardService.getOverview(),
      dashboardService.getAlerts(),
      dashboardService.getActivities(20)
    ]);

    setOverview(overviewData);
    setAlerts(alertsData.alerts);
    setActivities(activitiesData.activities);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>

      <div className="metrics-grid">
        <MetricCard
          title="Production"
          value={overview?.production.total}
          subtitle={`${overview?.production.completionRate}% completion`}
          icon="factory"
        />
        <MetricCard
          title="Sales"
          value={overview?.sales.totalRevenue}
          subtitle={`${overview?.sales.totalInvoices} invoices`}
          icon="money"
        />
        <MetricCard
          title="Materials"
          value={overview?.materials.totalRawMaterials}
          subtitle={`${overview?.materials.lowStockMaterials} low stock`}
          icon="inventory"
        />
      </div>

      <div className="alerts-section">
        <h2>Alerts</h2>
        {alerts.map(alert => (
          <AlertCard
            key={alert.type}
            type={alert.type}
            severity={alert.severity}
            message={alert.message}
            count={alert.count}
            action={alert.action}
          />
        ))}
      </div>

      <div className="activities-section">
        <h2>Recent Activities</h2>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
};
```

---

### 2. Raw Materials Management (`/materials`)

**Purpose:** Manage raw materials inventory

**Pages:**
- **Materials List** - `/materials`
- **Material Details** - `/materials/:id`
- **Add Material** - `/materials/add`
- **Transactions** - `/materials/:id/transactions`

**API Endpoints:**
```typescript
// List Page
GET /raw-items?page=1&limit=20
GET /raw-items/search?term=cotton
GET /raw-items/low-stock?threshold=10

// Details Page
GET /raw-items/:id
GET /raw-items/availability/:id
GET /raw-items/:id/transactions

// Add Stock
POST /raw-items/add-stock
POST /raw-items/bulk-add
POST /raw-items/adjust-stock
```

**Materials List Layout:**
```
┌────────────────────────────────────────────────────┐
│ Raw Materials                          [+ Add]     │
├────────────────────────────────────────────────────┤
│ Search: [________]  Filter: [All/Available/Low]   │
├────────────────────────────────────────────────────┤
│ Table:                                             │
│ ┌─────┬──────────────┬──────────┬─────────────┐  │
│ │ ID  │ Name         │ Quantity │ Actions     │  │
│ ├─────┼──────────────┼──────────┼─────────────┤  │
│ │ 12  │ Cotton Thread│ 45       │ [View][Add] │  │
│ │ 15  │ Poly Fabric  │ 8 (Low!) │ [View][Add] │  │
│ └─────┴──────────────┴──────────┴─────────────┘  │
│                                  [1] [2] [3] >>   │
└────────────────────────────────────────────────────┘
```

**Material Details Layout:**
```
┌──────────────────────────────────────────────────┐
│ Cotton Thread (CTN-001)                 [Edit]   │
├──────────────────────────────────────────────────┤
│ Current Quantity: 45                             │
│ Type: Thread                                     │
│ Status: Available                                │
├──────────────────────────────────────────────────┤
│ Actions:                                         │
│ [Add Stock] [Adjust Stock] [View Transactions]  │
├──────────────────────────────────────────────────┤
│ Recent Transactions:                             │
│ ┌────────┬──────┬──────────┬──────────────────┐ │
│ │ Date   │ Type │ Quantity │ Performed By     │ │
│ ├────────┼──────┼──────────┼──────────────────┤ │
│ │ Jan 6  │ Add  │ +50      │ John Doe         │ │
│ │ Jan 5  │ Use  │ -25      │ Production #45   │ │
│ └────────┴──────┴──────────┴──────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Add Stock Modal/Dialog:**
```
┌────────────────────────────────────┐
│ Add Material Stock                 │
├────────────────────────────────────┤
│ Quantity: [________]               │
│ Supplier: [________]               │
│ Unit Cost: [________]              │
│ Notes: [________________]          │
│                                    │
│        [Cancel]  [Add Stock]       │
└────────────────────────────────────┘
```

---

### 3. Production Management (`/productions`)

**Purpose:** Manage production orders and material requests

**Pages:**
- **Productions List** - `/productions`
- **Production Details** - `/productions/:id`
- **Material Requests** - `/material-requests`
- **Production Orders** - `/production-orders`

**API Endpoints:**
```typescript
// Productions
GET /productions?page=1&limit=20
GET /productions/stage/:stage
GET /productions/:id
GET /productions/:id/timeline
POST /productions/:id/move-to-stage
POST /productions/:id/move-to-stock

// Material Requests
GET /material-requests?page=1&limit=20
GET /material-requests/pending
POST /material-requests/create-with-validation
POST /material-requests/check-availability
POST /material-requests/:id/approve
POST /material-requests/:id/reject

// Production Orders
GET /production-orders?page=1&limit=20
GET /production-orders/status/:status
POST /production-orders/create-with-validation
POST /production-orders/:id/approve
POST /production-orders/:id/assign-to-production
```

**Productions List Layout:**
```
┌────────────────────────────────────────────────────┐
│ Productions                      [+ New]           │
├────────────────────────────────────────────────────┤
│ Filter: [All] [In Production] [Await QA] [Done]   │
├────────────────────────────────────────────────────┤
│ ┌──────────┬───────────┬─────────┬───────────┐   │
│ │ Code     │ Product   │ Stage   │ Actions   │   │
│ ├──────────┼───────────┼─────────┼───────────┤   │
│ │ PR-00045 │ Shirt (12)│ Await QA│ [View]    │   │
│ │ PR-00046 │ Blazer(42)│ In Prod │ [View]    │   │
│ └──────────┴───────────┴─────────┴───────────┘   │
└────────────────────────────────────────────────────┘
```

**Production Details with Workflow:**
```
┌──────────────────────────────────────────────────┐
│ Production: PR-00045                    [Edit]   │
├──────────────────────────────────────────────────┤
│ Product: Classic Shirt (Size 12)                │
│ Tailor: John Doe                                │
│ Current Stage: Await QA                         │
├──────────────────────────────────────────────────┤
│ Stage Progress:                                  │
│ ✓ In Production ──→ ✓ Await QA ──→ ○ Completed │
├──────────────────────────────────────────────────┤
│ Actions:                                         │
│ [Move to Completed] [Reject] [View Timeline]    │
├──────────────────────────────────────────────────┤
│ Timeline:                                        │
│ • Await QA - Jan 6 by John Doe                  │
│ • In Production - Jan 5 by Jane Smith           │
│ • Created - Jan 4 by Admin                      │
└──────────────────────────────────────────────────┘
```

**Material Request Creation:**
```
┌────────────────────────────────────────┐
│ Create Material Request                │
├────────────────────────────────────────┤
│ Materials Needed:                      │
│ ┌──────────────┬──────────┬─────────┐ │
│ │ Material     │ Quantity │ [Remove]│ │
│ ├──────────────┼──────────┼─────────┤ │
│ │ Cotton Thread│ 50       │ [X]     │ │
│ │ Poly Fabric  │ 30       │ [X]     │ │
│ └──────────────┴──────────┴─────────┘ │
│ [+ Add Material]                       │
│                                        │
│ Notes: [_______________________]       │
│                                        │
│ [Check Availability]                   │
│ ✓ All materials available              │
│                                        │
│      [Cancel]  [Submit Request]        │
└────────────────────────────────────────┘
```

---

### 4. Inventory Management (`/inventory`)

**Purpose:** Manage finished goods stock

**Pages:**
- **Stock List** - `/inventory/stock`
- **Stock Details** - `/inventory/stock/:id`
- **Availability Check** - `/inventory/availability`

**API Endpoints:**
```typescript
GET /product-stocks?page=1&limit=20
GET /product-stocks/available
GET /product-stocks/summary
GET /product-stocks/search?term=shirt
GET /product-stocks/availability/:productDefId
GET /product-stocks/:id
```

**Stock List Layout:**
```
┌────────────────────────────────────────────────────┐
│ Product Stock                       [Summary]      │
├────────────────────────────────────────────────────┤
│ Search: [________]  Filter: [All/Available/Sold]  │
├────────────────────────────────────────────────────┤
│ ┌─────────┬──────────┬──────┬────────┬─────────┐ │
│ │ Code    │ Product  │ Size │ Status │ Actions │ │
│ ├─────────┼──────────┼──────┼────────┼─────────┤ │
│ │PR-00045 │ Shirt    │ 12   │Avail ✓ │ [View]  │ │
│ │PR-00046 │ Blazer   │ 42   │ Sold   │ [View]  │ │
│ └─────────┴──────────┴──────┴────────┴─────────┘ │
└────────────────────────────────────────────────────┘
```

**Availability Check Page:**
```
┌────────────────────────────────────────┐
│ Check Product Availability             │
├────────────────────────────────────────┤
│ Select Product: [Classic Shirt     ▼]  │
│                                        │
│ [Check Availability]                   │
├────────────────────────────────────────┤
│ Results:                               │
│ Total Available: 60 units              │
│                                        │
│ By Size:                               │
│ • Size 10: 15 units available          │
│ • Size 12: 25 units available          │
│ • Size 14: 20 units available          │
│                                        │
│ [View Stock Details]                   │
└────────────────────────────────────────┘
```

---

### 5. Sales & Invoices (`/invoices`)

**Purpose:** Manage sales invoices and customer orders

**Pages:**
- **Invoices List** - `/invoices`
- **Invoice Details** - `/invoices/:id`
- **Create Invoice** - `/invoices/create`
- **Customers** - `/customers`

**API Endpoints:**
```typescript
GET /invoices?page=1&limit=20
GET /invoices/:id
GET /invoices/:id/timeline
GET /invoices/customer/:customerId
POST /invoices/create-with-validation
POST /invoices/:id/calculate-total
POST /invoices/:id/mark-as-paid
POST /invoices/:id/pack-items
POST /invoices/:id/assign-logistics
POST /invoices/:id/mark-as-delivered
```

**Invoices List Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Invoices                              [+ New Invoice]   │
├─────────────────────────────────────────────────────────┤
│ Filter: [All] [Open] [Paid] [Delivered]                │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┬─────────────┬─────────┬──────────────┐    │
│ │ Invoice# │ Customer    │ Status  │ Amount       │    │
│ ├──────────┼─────────────┼─────────┼──────────────┤    │
│ │INV-00087 │ ABC Corp    │ Paid    │ 125,000      │    │
│ │INV-00088 │ XYZ Ltd     │ Open    │ 85,500       │    │
│ └──────────┴─────────────┴─────────┴──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Invoice Details with Workflow:**
```
┌──────────────────────────────────────────────────────┐
│ Invoice: INV-00087                          [Print]  │
├──────────────────────────────────────────────────────┤
│ Customer: ABC Corporation                            │
│ Date: Jan 5, 2025                                   │
│ Status: Paid                                         │
├──────────────────────────────────────────────────────┤
│ Items:                                               │
│ ┌─────────────────┬───┬───────┬───────────┐        │
│ │ Product         │Qty│ Price │ Total     │        │
│ ├─────────────────┼───┼───────┼───────────┤        │
│ │ Classic Shirt   │ 5 │2,500  │ 12,500    │        │
│ │ Blazer          │ 3 │8,500  │ 25,500    │        │
│ └─────────────────┴───┴───────┴───────────┘        │
│                    Subtotal: 38,000                  │
│                    Tax (7.5%): 2,850                │
│                    Total: 40,850                     │
├──────────────────────────────────────────────────────┤
│ Workflow Progress:                                   │
│ ✓ Open ──→ ✓ Paid ──→ ○ Packed ──→ ○ Delivered    │
├──────────────────────────────────────────────────────┤
│ Actions: [Pack Items] [View Timeline]               │
└──────────────────────────────────────────────────────┘
```

**Create Invoice Page:**
```
┌────────────────────────────────────────────────────┐
│ Create New Invoice                                 │
├────────────────────────────────────────────────────┤
│ Customer: [ABC Corporation        ▼]               │
│                                                    │
│ Items:                                             │
│ ┌─────────────┬──────┬────────┬────────┬──────┐  │
│ │ Product     │ Size │ Qty    │ Price  │ [X]  │  │
│ ├─────────────┼──────┼────────┼────────┼──────┤  │
│ │ Shirt       │ 12   │ 5      │ 2,500  │ [X]  │  │
│ └─────────────┴──────┴────────┴────────┴──────┘  │
│ [+ Add Item]                                       │
│                                                    │
│ Subtotal: 12,500                                   │
│ Tax (%): [7.5] = 938                              │
│ Discount (%): [0] = 0                             │
│ Total: 13,438                                      │
│                                                    │
│         [Cancel]  [Create Invoice]                 │
└────────────────────────────────────────────────────┘
```

---

### 6. Production Orders (`/production-orders`)

**Purpose:** Manage custom orders from customers

**Pages:**
- **Orders List** - `/production-orders`
- **Order Details** - `/production-orders/:id`
- **Create Order** - `/production-orders/create`

**API Endpoints:**
```typescript
GET /production-orders?page=1&limit=20
GET /production-orders/status/:status
GET /production-orders/:id
GET /production-orders/:id/timeline
POST /production-orders/create-with-validation
POST /production-orders/:id/approve
POST /production-orders/:id/assign-to-production
POST /production-orders/:id/complete
POST /production-orders/:id/deliver
```

**Orders List Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Production Orders                    [+ New Order]   │
├──────────────────────────────────────────────────────┤
│ Filter: [All][Pending][Approved][In Progress][Done] │
├──────────────────────────────────────────────────────┤
│ ┌─────────┬──────────┬─────────┬──────────┬──────┐ │
│ │ Order#  │ Customer │ Status  │ Priority │ Due  │ │
│ ├─────────┼──────────┼─────────┼──────────┼──────┤ │
│ │PO-00023 │ ABC Corp │ Pending │ High     │Mar15 │ │
│ │PO-00024 │ XYZ Ltd  │ Approved│ Normal   │Apr 1 │ │
│ └─────────┴──────────┴─────────┴──────────┴──────┘ │
└──────────────────────────────────────────────────────┘
```

**Order Details with Approval:**
```
┌──────────────────────────────────────────────────────┐
│ Order: PO-00023                            [Edit]    │
├──────────────────────────────────────────────────────┤
│ Customer: ABC Corporation                            │
│ Status: Pending                                      │
│ Priority: High                                       │
│ Expected Delivery: Mar 15, 2025                     │
├──────────────────────────────────────────────────────┤
│ Order Details:                                       │
│ • Custom Blazer (Size 42) x25                       │
│   Navy blue with custom lining                       │
│   Estimated Cost: 8,500/unit                        │
│                                                      │
│ Estimated Total: 212,500                            │
├──────────────────────────────────────────────────────┤
│ Workflow:                                            │
│ ● Pending ──→ ○ Approved ──→ ○ In Prod ──→ ○ Done  │
├──────────────────────────────────────────────────────┤
│ Actions:                                             │
│ Agreed Cost: [212,500____]                          │
│ [Approve Order] [Reject Order] [View Timeline]      │
└──────────────────────────────────────────────────────┘
```

---

### 7. Reports Dashboard (`/reports`)

**Purpose:** Comprehensive business intelligence

**Pages:**
- **Reports Overview** - `/reports`
- **Production Report** - `/reports/production`
- **Sales Report** - `/reports/sales`
- **Inventory Report** - `/reports/inventory`
- **Business Report** - `/reports/business`

**API Endpoints:**
```typescript
GET /reports/production?startDate=&endDate=
GET /reports/sales?startDate=&endDate=
GET /reports/inventory
GET /reports/materials?startDate=&endDate=
GET /reports/customers
GET /reports/production-orders?startDate=&endDate=
GET /reports/staff
GET /reports/business?startDate=&endDate=
```

**Reports Dashboard Layout:**
```
┌────────────────────────────────────────────────────┐
│ Reports                                            │
├────────────────────────────────────────────────────┤
│ Date Range: [2025-01-01] to [2025-01-31] [Apply]  │
├────────────────────────────────────────────────────┤
│ Quick Reports:                                     │
│ ┌──────────────┬──────────────┬──────────────┐   │
│ │ Production   │ Sales        │ Inventory    │   │
│ │ [View]       │ [View]       │ [View]       │   │
│ └──────────────┴──────────────┴──────────────┘   │
│ ┌──────────────┬──────────────┬──────────────┐   │
│ │ Materials    │ Customers    │ Staff        │   │
│ │ [View]       │ [View]       │ [View]       │   │
│ └──────────────┴──────────────┴──────────────┘   │
├────────────────────────────────────────────────────┤
│ [Generate Comprehensive Business Report]          │
└────────────────────────────────────────────────────┘
```

**Production Report Page:**
```
┌────────────────────────────────────────────────────┐
│ Production Report                       [Export]   │
├────────────────────────────────────────────────────┤
│ Period: Jan 1 - Jan 31, 2025                      │
├────────────────────────────────────────────────────┤
│ Summary Metrics:                                   │
│ ┌─────────────┬─────────────┬──────────────────┐ │
│ │ Total: 45   │ Completed:38│ Completion: 84.4%│ │
│ └─────────────┴─────────────┴──────────────────┘ │
├────────────────────────────────────────────────────┤
│ By Stage:                                          │
│ [Chart: Production by Stage]                       │
├────────────────────────────────────────────────────┤
│ Performance:                                       │
│ • Average Production Time: 12.5 days               │
│ • Top Performer: John Doe (15 completions)        │
│                                                    │
│ Tailor Performance:                                │
│ ┌──────────┬────────┬───────────┬──────────┐     │
│ │ Tailor   │ Total  │ Completed │ In Prog  │     │
│ ├──────────┼────────┼───────────┼──────────┤     │
│ │ John Doe │ 15     │ 13        │ 2        │     │
│ │Jane Smith│ 12     │ 10        │ 2        │     │
│ └──────────┴────────┴───────────┴──────────┘     │
└────────────────────────────────────────────────────┘
```

---

## State Management

### Redux Store Structure (Example)

```typescript
// store/index.ts
const store = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
  },

  dashboard: {
    overview: null,
    alerts: [],
    activities: [],
    kpis: null,
    loading: false,
  },

  materials: {
    items: [],
    selectedItem: null,
    transactions: [],
    pagination: { page: 1, limit: 20, total: 0 },
    loading: false,
  },

  production: {
    productions: [],
    materialRequests: [],
    productionOrders: [],
    selectedProduction: null,
    loading: false,
  },

  inventory: {
    stock: [],
    selectedStock: null,
    availability: null,
    loading: false,
  },

  invoices: {
    invoices: [],
    selectedInvoice: null,
    timeline: [],
    loading: false,
  },

  reports: {
    productionReport: null,
    salesReport: null,
    inventoryReport: null,
    loading: false,
  },

  ui: {
    sidebarOpen: true,
    notifications: [],
    theme: 'light',
  },
};
```

---

## API Integration

### API Service Structure

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Examples

```typescript
// services/dashboard.service.ts
import api from './api';

export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getActivities: (limit = 20) =>
    api.get(`/dashboard/activities?limit=${limit}`),
  getKPIs: () => api.get('/dashboard/kpis'),
};

// services/materials.service.ts
export const materialsService = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/raw-items?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/raw-items/${id}`),
  search: (term) => api.get(`/raw-items/search?term=${term}`),
  getLowStock: (threshold = 10) =>
    api.get(`/raw-items/low-stock?threshold=${threshold}`),
  addStock: (data) => api.post('/raw-items/add-stock', data),
  bulkAdd: (data) => api.post('/raw-items/bulk-add', data),
  adjustStock: (data) => api.post('/raw-items/adjust-stock', data),
  getTransactions: (id, page = 1) =>
    api.get(`/raw-items/${id}/transactions?page=${page}`),
};

// services/production.service.ts
export const productionService = {
  getAll: (page = 1) => api.get(`/productions?page=${page}`),
  getById: (id) => api.get(`/productions/${id}`),
  getByStage: (stage) => api.get(`/productions/stage/${stage}`),
  moveToStage: (id, data) =>
    api.post(`/productions/${id}/move-to-stage`, data),
  moveToStock: (id, data) =>
    api.post(`/productions/${id}/move-to-stock`, data),
  getTimeline: (id) => api.get(`/productions/${id}/timeline`),
};

// services/invoices.service.ts
export const invoicesService = {
  getAll: (page = 1) => api.get(`/invoices?page=${page}`),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) =>
    api.post('/invoices/create-with-validation', data),
  calculateTotal: (id, data) =>
    api.post(`/invoices/${id}/calculate-total`, data),
  markAsPaid: (id, data) =>
    api.post(`/invoices/${id}/mark-as-paid`, data),
  packItems: (id, data) =>
    api.post(`/invoices/${id}/pack-items`, data),
  assignLogistics: (id, data) =>
    api.post(`/invoices/${id}/assign-logistics`, data),
  markAsDelivered: (id, data) =>
    api.post(`/invoices/${id}/mark-as-delivered`, data),
  getTimeline: (id) => api.get(`/invoices/${id}/timeline`),
};

// services/reports.service.ts
export const reportsService = {
  getProduction: (startDate, endDate) =>
    api.get(`/reports/production?startDate=${startDate}&endDate=${endDate}`),
  getSales: (startDate, endDate) =>
    api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
  getInventory: () => api.get('/reports/inventory'),
  getMaterials: (startDate, endDate) =>
    api.get(`/reports/materials?startDate=${startDate}&endDate=${endDate}`),
  getCustomers: () => api.get('/reports/customers'),
  getProductionOrders: (startDate, endDate) =>
    api.get(`/reports/production-orders?startDate=${startDate}&endDate=${endDate}`),
  getStaff: () => api.get('/reports/staff'),
  getBusiness: (startDate, endDate) =>
    api.get(`/reports/business?startDate=${startDate}&endDate=${endDate}`),
};
```

---

## Component Library

### Reusable Components

#### MetricCard
```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3>{title}</h3>
        {icon && <Icon name={icon} />}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {trend && (
        <div className={`metric-trend trend-${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}%
        </div>
      )}
    </div>
  );
};
```

#### AlertCard
```typescript
interface AlertCardProps {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  count?: number;
  action?: string;
  onActionClick?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  type,
  severity,
  message,
  count,
  action,
  onActionClick,
}) => {
  return (
    <div className={`alert-card alert-${severity}`}>
      <div className="alert-icon">
        {severity === 'error' && '❌'}
        {severity === 'warning' && '⚠️'}
        {severity === 'info' && 'ℹ️'}
      </div>
      <div className="alert-content">
        <div className="alert-message">{message}</div>
        {count && <div className="alert-count">{count} items</div>}
      </div>
      {action && (
        <button onClick={onActionClick} className="alert-action">
          {action}
        </button>
      )}
    </div>
  );
};
```

#### DataTable
```typescript
interface DataTableProps {
  columns: Array<{ key: string; label: string; render?: (value: any, row: any) => React.ReactNode }>;
  data: any[];
  pagination?: { page: number; limit: number; total: number };
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  loading,
}) => {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
```

---

## Best Practices

### Performance Optimization
1. **Lazy Loading** - Load pages only when needed
2. **Memoization** - Use React.memo for expensive components
3. **Virtual Scrolling** - For large lists (react-window)
4. **Debouncing** - For search inputs
5. **Caching** - Cache API responses with React Query

### Error Handling
1. **Error Boundaries** - Catch component errors
2. **Toast Notifications** - Show user-friendly messages
3. **Validation** - Client-side form validation
4. **Retry Logic** - Automatic retry for failed requests

### Security
1. **JWT Storage** - Store tokens securely (httpOnly cookies)
2. **RBAC** - Role-based route protection
3. **XSS Prevention** - Sanitize user inputs
4. **CSRF Protection** - Use CSRF tokens

### UX Improvements
1. **Loading States** - Show loaders during API calls
2. **Empty States** - Friendly messages for empty lists
3. **Confirmation Dialogs** - For destructive actions
4. **Keyboard Shortcuts** - Power user features
5. **Responsive Design** - Mobile-friendly layouts

### Code Organization
1. **Feature Folders** - Group by feature, not file type
2. **Consistent Naming** - Use clear, descriptive names
3. **Type Safety** - Use TypeScript interfaces
4. **Documentation** - Comment complex logic
5. **Testing** - Unit and integration tests

---

## Summary

This guide provides a complete blueprint for frontend implementation with:

✅ **Complete Application Structure** - Organized folder structure
✅ **Dashboard Layout** - Main interface design
✅ **17+ Pages Mapped** - Every page with API endpoints
✅ **Navigation & Routing** - Complete route structure
✅ **Component Library** - Reusable UI components
✅ **State Management** - Redux store structure
✅ **API Integration** - Complete service layer
✅ **Best Practices** - Performance, security, UX guidelines

**Next Steps:**
1. Choose your tech stack (React/Vue/Angular)
2. Set up project with recommended tools
3. Implement authentication first
4. Build dashboard as core interface
5. Add modules one by one (Materials → Production → Sales → Reports)
6. Test thoroughly with real API
7. Deploy to production

**Estimated Development Time:**
- Basic Setup: 1 week
- Dashboard + Auth: 2 weeks
- Materials Module: 1 week
- Production Module: 2 weeks
- Inventory Module: 1 week
- Sales Module: 2 weeks
- Reports Module: 1 week
- Polish & Testing: 2 weeks

**Total: 12 weeks** (3 months) for complete implementation with a small team.

---

**Last Updated:** 2025-01-06
**Version:** 1.0.0
