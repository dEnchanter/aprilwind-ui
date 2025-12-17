# Role-Based Access Control (RBAC) Permissions Guide

## Current State

### RBAC Infrastructure Status: ✅ **IMPLEMENTED**

Your system has complete RBAC infrastructure but it's **only applied to Auth endpoints**. This guide defines comprehensive role-based permissions for all modules.

### Authentication System
- **JWT Tokens** include: `roleId` and `roleName`
- **Guards**: `JwtAuthGuard`, `RolesGuard`
- **Decorators**: `@Roles()`, `@Public()`, `@CurrentUser()`
- **Validation**: Automatic role checking via `RolesGuard`

### Available Guards
```typescript
@UseGuards(JwtAuthGuard) // Authentication only
@UseGuards(JwtAuthGuard, RolesGuard) // Authentication + Authorization
```

---

## Defined Roles

Based on your business model, here are the standard roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Administrator** | Full system access | ALL |
| **Manager** | Production & operations management | HIGH |
| **Sales Person** | Customer & sales operations | MEDIUM |
| **Tailor** | Production work & material requests | LIMITED |
| **Warehouse Staff** | Inventory & raw materials | LIMITED |
| **QA Inspector** | Quality assurance & production review | LIMITED |
| **Accountant** | Financial reports & invoices | MEDIUM |
| **Logistics** | Delivery & shipping operations | LIMITED |

---

## Module-by-Module Permissions

### 1. Authentication Module (`/auth`)

| Endpoint | Public | Roles | Purpose |
|----------|--------|-------|---------|
| POST /auth/login | ✅ | - | Login |
| POST /auth/register | ❌ | Admin, Manager | Create user accounts |
| GET /auth/profile | ❌ | ALL | Get own profile |
| POST /auth/change-password | ❌ | ALL | Change own password |
| POST /auth/refresh | ✅ | - | Refresh token |
| PATCH /auth/:id/activate | ❌ | Admin, Manager | Activate account |
| PATCH /auth/:id/deactivate | ❌ | Admin, Manager | Deactivate account |
| POST /auth/:id/reset-password | ❌ | Admin, Manager | Reset user password |

**Status**: ✅ Already implemented

---

### 2. Roles Module (`/roles`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /roles | Admin, Manager | List all roles |
| GET /roles/:id | Admin, Manager | Get role details |
| POST /roles | Admin | Create new role |
| PATCH /roles/:id | Admin | Update role |
| DELETE /roles/:id | Admin | Delete role |

**Status**: ❌ Not implemented - Currently open to all authenticated users

---

### 3. Staff Module (`/staff`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /staff | Admin, Manager | List all staff |
| GET /staff/:id | Admin, Manager | Get staff details |
| POST /staff | Admin, Manager | Create staff member |
| PATCH /staff/:id | Admin, Manager | Update staff |
| DELETE /staff/:id | Admin | Delete staff |

**Status**: ❌ Not implemented

---

### 4. Raw Materials Module (`/raw-items`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /raw-items | Admin, Manager, Warehouse Staff | List materials |
| GET /raw-items/:id | Admin, Manager, Warehouse Staff | Material details |
| POST /raw-items | Admin, Manager, Warehouse Staff | Create material |
| PATCH /raw-items/:id | Admin, Manager, Warehouse Staff | Update material |
| DELETE /raw-items/:id | Admin, Manager | Delete material |
| POST /raw-items/add-stock | Admin, Manager, Warehouse Staff | Add stock |
| POST /raw-items/bulk-add | Admin, Manager, Warehouse Staff | Bulk add stock |
| POST /raw-items/adjust-stock | Admin, Manager, Warehouse Staff | Adjust stock |
| GET /raw-items/available | Admin, Manager, Warehouse Staff, Tailor | View available stock |
| GET /raw-items/summary | Admin, Manager, Warehouse Staff | Stock summary |
| GET /raw-items/low-stock | Admin, Manager, Warehouse Staff | Low stock alerts |

**Status**: ❌ Not implemented

---

### 5. Material Request Module (`/material-requests`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /material-requests | Admin, Manager, Warehouse Staff, Tailor | List requests |
| GET /material-requests/:id | Admin, Manager, Warehouse Staff, Tailor | Request details |
| POST /material-requests/create-with-validation | Tailor, Manager | Create request |
| POST /material-requests/:id/approve | Admin, Manager, Warehouse Staff | Approve request |
| POST /material-requests/:id/reject | Admin, Manager, Warehouse Staff | Reject request |
| POST /material-requests/:id/cancel | Tailor (own only), Manager, Admin | Cancel request |
| GET /material-requests/pending | Admin, Manager, Warehouse Staff | Pending requests |
| GET /material-requests/analytics | Admin, Manager | Request analytics |

**Status**: ❌ Not implemented

---

### 6. Production Module (`/productions`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /productions | Admin, Manager, QA Inspector, Tailor | List productions |
| GET /productions/:id | Admin, Manager, QA Inspector, Tailor | Production details |
| POST /productions/create-with-validation | Manager, Tailor | Create production |
| POST /productions/:id/move-to-stage | Manager, Tailor, QA Inspector | Change stage |
| POST /productions/:id/move-to-stock | Admin, Manager, QA Inspector | Move to inventory |
| GET /productions/stage/:stage | Admin, Manager, QA Inspector, Tailor | By stage |
| GET /productions/tailor/:tailorId | Admin, Manager, Tailor (own only) | By tailor |
| GET /productions/analytics | Admin, Manager | Production analytics |

**Status**: ❌ Not implemented

---

### 7. Product Stock Module (`/product-stocks`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /product-stocks | Admin, Manager, Warehouse Staff, Sales Person | List stock |
| GET /product-stocks/:id | Admin, Manager, Warehouse Staff, Sales Person | Stock details |
| POST /product-stocks | Admin, Manager, Warehouse Staff | Create stock entry |
| PATCH /product-stocks/:id | Admin, Manager, Warehouse Staff | Update stock |
| DELETE /product-stocks/:id | Admin, Manager | Delete stock |
| GET /product-stocks/available | Admin, Manager, Warehouse Staff, Sales Person | Available stock |
| GET /product-stocks/summary | Admin, Manager, Warehouse Staff | Stock summary |
| GET /product-stocks/availability/:id | Admin, Manager, Warehouse Staff, Sales Person | Product availability |

**Status**: ❌ Not implemented

---

### 8. Customers Module (`/customers`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /customers | Admin, Manager, Sales Person | List customers |
| GET /customers/:id | Admin, Manager, Sales Person | Customer details |
| POST /customers | Admin, Manager, Sales Person | Create customer |
| PATCH /customers/:id | Admin, Manager, Sales Person | Update customer |
| DELETE /customers/:id | Admin, Manager | Delete customer |

**Status**: ❌ Not implemented

---

### 9. Invoices Module (`/invoices`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /invoices | Admin, Manager, Sales Person, Accountant | List invoices |
| GET /invoices/:id | Admin, Manager, Sales Person, Accountant | Invoice details |
| POST /invoices/create-with-validation | Admin, Manager, Sales Person | Create invoice |
| POST /invoices/:id/calculate-total | Admin, Manager, Sales Person | Calculate total |
| POST /invoices/:id/mark-as-paid | Admin, Manager, Sales Person, Accountant | Mark paid |
| POST /invoices/:id/pack-items | Admin, Manager, Warehouse Staff | Pack items |
| POST /invoices/:id/assign-logistics | Admin, Manager, Logistics | Assign delivery |
| POST /invoices/:id/mark-as-delivered | Admin, Manager, Logistics | Mark delivered |
| POST /invoices/:id/cancel | Admin, Manager | Cancel invoice |
| GET /invoices/customer/:customerId | Admin, Manager, Sales Person | Customer invoices |
| GET /invoices/analytics | Admin, Manager, Accountant | Sales analytics |

**Status**: ❌ Not implemented

---

### 10. Production Orders Module (`/production-orders`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /production-orders | Admin, Manager, Sales Person | List orders |
| GET /production-orders/:id | Admin, Manager, Sales Person | Order details |
| POST /production-orders/create-with-validation | Admin, Manager, Sales Person | Create order |
| POST /production-orders/:id/approve | Admin, Manager | Approve order |
| POST /production-orders/:id/reject | Admin, Manager | Reject order |
| POST /production-orders/:id/assign-to-production | Manager | Assign to production |
| POST /production-orders/:id/complete | Manager, QA Inspector | Mark completed |
| POST /production-orders/:id/deliver | Admin, Manager, Logistics | Mark delivered |
| POST /production-orders/:id/cancel | Admin, Manager | Cancel order |
| GET /production-orders/status/:status | Admin, Manager, Sales Person | By status |
| GET /production-orders/customer/:customerId | Admin, Manager, Sales Person | Customer orders |
| GET /production-orders/analytics | Admin, Manager | Order analytics |

**Status**: ❌ Not implemented

---

### 11. Dashboard Module (`/dashboard`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /dashboard/overview | ALL authenticated | System overview |
| GET /dashboard/alerts | ALL authenticated | System alerts |
| GET /dashboard/activities | ALL authenticated | Recent activities |
| GET /dashboard/kpis | Admin, Manager, Accountant | Key metrics |

**Note**: Dashboard data should be filtered based on role. For example:
- **Tailor**: Only see their own production stats
- **Sales Person**: Only see sales & customer metrics
- **Admin/Manager**: See everything

**Status**: ❌ Not implemented

---

### 12. Reports Module (`/reports`)

| Endpoint | Roles | Purpose |
|----------|-------|---------|
| GET /reports/production | Admin, Manager | Production report |
| GET /reports/sales | Admin, Manager, Accountant | Sales report |
| GET /reports/inventory | Admin, Manager, Warehouse Staff | Inventory report |
| GET /reports/materials | Admin, Manager, Warehouse Staff | Materials report |
| GET /reports/customers | Admin, Manager, Sales Person | Customer report |
| GET /reports/production-orders | Admin, Manager | Production orders report |
| GET /reports/staff | Admin, Manager | Staff performance |
| GET /reports/business | Admin, Manager, Accountant | Complete business report |

**Status**: ❌ Not implemented

---

## Frontend Page Access Control

### Page-Level Permissions

| Page | Route | Allowed Roles |
|------|-------|---------------|
| **Dashboard** | `/` | ALL |
| **Raw Materials** | `/materials` | Admin, Manager, Warehouse Staff |
| **Material Requests** | `/material-requests` | Admin, Manager, Warehouse Staff, Tailor |
| **Production** | `/production` | Admin, Manager, QA Inspector, Tailor |
| **Product Stock** | `/inventory` | Admin, Manager, Warehouse Staff, Sales Person |
| **Customers** | `/customers` | Admin, Manager, Sales Person |
| **Invoices** | `/invoices` | Admin, Manager, Sales Person, Accountant, Logistics |
| **Production Orders** | `/production-orders` | Admin, Manager, Sales Person |
| **Reports** | `/reports` | Admin, Manager, Accountant |
| **Staff Management** | `/staff` | Admin, Manager |
| **Roles Management** | `/roles` | Admin |
| **Settings** | `/settings` | ALL |
| **User Profile** | `/profile` | ALL |

### UI Element Visibility by Role

#### Administrator
- **Can See**: Everything
- **Can Do**: All operations
- **Restrictions**: None

#### Manager
- **Can See**: All pages except Roles management
- **Can Do**: Most operations except system configuration
- **Restrictions**: Cannot manage roles

#### Sales Person
- **Can See**: Dashboard, Customers, Invoices, Production Orders, Product Stock
- **Can Do**: Create/manage invoices, customers, view stock
- **Restrictions**: Cannot access production or materials

#### Tailor
- **Can See**: Dashboard, Material Requests, Production (own jobs)
- **Can Do**: Create material requests, update own production jobs
- **Restrictions**: Can only see own production jobs

#### Warehouse Staff
- **Can See**: Dashboard, Raw Materials, Material Requests, Product Stock
- **Can Do**: Manage inventory, approve material requests, add stock
- **Restrictions**: Cannot access sales or production orders

#### QA Inspector
- **Can See**: Dashboard, Production
- **Can Do**: Move production through QA stages, reject items
- **Restrictions**: Cannot create production or access sales

#### Accountant
- **Can See**: Dashboard, Invoices, Reports
- **Can Do**: View financial reports, mark invoices as paid
- **Restrictions**: Cannot access production or inventory

#### Logistics
- **Can See**: Dashboard, Invoices (delivery view), Production Orders (delivery)
- **Can Do**: Mark items as shipped/delivered
- **Restrictions**: Limited to delivery operations

---

## Implementation Guide

### Backend Implementation

#### Step 1: Add Guards to Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('raw-items')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply to all routes
export class RawItemsController {

  @Get()
  @Roles('Administrator', 'Manager', 'Warehouse Staff')
  findAll() {
    // Only Admin, Manager, Warehouse Staff can list materials
  }

  @Post('add-stock')
  @Roles('Administrator', 'Manager', 'Warehouse Staff')
  addStock(@Body() addStockDto: AddStockDto) {
    // Only authorized roles can add stock
  }

  @Delete(':id')
  @Roles('Administrator', 'Manager')
  remove(@Param('id') id: number) {
    // Only Admin and Manager can delete
  }
}
```

#### Step 2: Apply Global Authentication

Add to `src/app.module.ts`:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

Then mark public routes with `@Public()`:

```typescript
@Public()
@Post('auth/login')
async login() {
  // Public route
}
```

#### Step 3: Add Data Filtering by Role

```typescript
@Get('productions')
@Roles('Administrator', 'Manager', 'Tailor', 'QA Inspector')
async findAll(@CurrentUser() user: any, @Query() query: any) {
  // If user is Tailor, only show their productions
  if (user.roleName === 'Tailor') {
    query.tailorId = user.id;
  }

  return this.productionService.findAll(query);
}
```

---

### Frontend Implementation

#### Step 1: Store User Role

```typescript
// authSlice.ts (Redux)
interface AuthState {
  user: {
    id: number;
    name: string;
    email: string;
    role: {
      id: number;
      name: string; // 'Administrator', 'Manager', etc.
    };
  } | null;
  token: string | null;
}

// After login
dispatch(setUser({
  user: response.user,
  token: response.accessToken
}));
```

#### Step 2: Route Protection

```typescript
// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role.name)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

// Usage in routes
<Route
  path="/materials"
  element={
    <ProtectedRoute allowedRoles={['Administrator', 'Manager', 'Warehouse Staff']}>
      <MaterialsPage />
    </ProtectedRoute>
  }
/>
```

#### Step 3: Conditional UI Rendering

```typescript
// usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canManageMaterials: ['Administrator', 'Manager', 'Warehouse Staff'].includes(user?.role.name),
    canCreateInvoice: ['Administrator', 'Manager', 'Sales Person'].includes(user?.role.name),
    canApproveOrders: ['Administrator', 'Manager'].includes(user?.role.name),
    canViewReports: ['Administrator', 'Manager', 'Accountant'].includes(user?.role.name),
    isAdmin: user?.role.name === 'Administrator',
    isTailor: user?.role.name === 'Tailor',
    // ... etc
  };
};

// Usage in components
function InvoicePage() {
  const { canCreateInvoice } = usePermissions();

  return (
    <div>
      <h1>Invoices</h1>
      {canCreateInvoice && (
        <Button onClick={handleCreate}>Create Invoice</Button>
      )}
    </div>
  );
}
```

#### Step 4: Navigation Menu Filtering

```typescript
// navigationConfig.ts
export const navigationItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
    roles: ['ALL']
  },
  {
    label: 'Raw Materials',
    path: '/materials',
    icon: 'inventory',
    roles: ['Administrator', 'Manager', 'Warehouse Staff']
  },
  {
    label: 'Production',
    path: '/production',
    icon: 'build',
    roles: ['Administrator', 'Manager', 'Tailor', 'QA Inspector']
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: 'receipt',
    roles: ['Administrator', 'Manager', 'Sales Person', 'Accountant']
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'analytics',
    roles: ['Administrator', 'Manager', 'Accountant']
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: 'people',
    roles: ['Administrator', 'Manager']
  },
  {
    label: 'Roles',
    path: '/roles',
    icon: 'security',
    roles: ['Administrator']
  }
];

// Sidebar.tsx
function Sidebar() {
  const { user } = useAuth();

  const visibleItems = navigationItems.filter(item =>
    item.roles.includes('ALL') || item.roles.includes(user?.role.name)
  );

  return (
    <nav>
      {visibleItems.map(item => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## Implementation Checklist

### Backend Tasks

- [ ] Apply `@UseGuards(JwtAuthGuard, RolesGuard)` to all controllers
- [ ] Add `@Roles()` decorator to all endpoints per this guide
- [ ] Implement global JwtAuthGuard in app.module
- [ ] Mark public routes with `@Public()` decorator
- [ ] Add role-based data filtering in services
- [ ] Test all endpoints with different roles
- [ ] Document role requirements in API docs

### Frontend Tasks

- [ ] Create ProtectedRoute component
- [ ] Implement usePermissions hook
- [ ] Add role-based navigation filtering
- [ ] Create Unauthorized page
- [ ] Conditional button/action rendering
- [ ] Role-based dashboard customization
- [ ] Test all routes with different roles
- [ ] Add role indicator in UI header

### Database Tasks

- [ ] Seed initial roles (Administrator, Manager, etc.)
- [ ] Create default admin user
- [ ] Assign roles to existing staff
- [ ] Set `isLogin: true` for roles requiring system access

---

## Testing RBAC

### Test Scenarios

#### Scenario 1: Administrator Access
```bash
# Login as Admin
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileCode":"ADMIN001","password":"admin123"}' \
  | jq -r '.accessToken')

# Should succeed - Admin can access everything
curl http://localhost:3000/roles -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/staff -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/reports/business -H "Authorization: Bearer $TOKEN"
```

#### Scenario 2: Tailor Access
```bash
# Login as Tailor
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileCode":"TAIL001","password":"tailor123"}' \
  | jq -r '.accessToken')

# Should succeed
curl http://localhost:3000/material-requests -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/productions -H "Authorization: Bearer $TOKEN"

# Should fail (403 Forbidden)
curl http://localhost:3000/roles -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/invoices -H "Authorization: Bearer $TOKEN"
```

#### Scenario 3: Sales Person Access
```bash
# Login as Sales Person
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileCode":"SALE001","password":"sales123"}' \
  | jq -r '.accessToken')

# Should succeed
curl http://localhost:3000/customers -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/invoices -H "Authorization: Bearer $TOKEN"

# Should fail (403 Forbidden)
curl http://localhost:3000/raw-items -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/productions -H "Authorization: Bearer $TOKEN"
```

---

## Security Best Practices

1. **Principle of Least Privilege**: Users should only have access to what they need
2. **Role Hierarchy**: Admin > Manager > Staff roles
3. **Audit Logging**: Log all role-based actions for compliance
4. **Regular Reviews**: Periodically review and update permissions
5. **Data Isolation**: Ensure users can only see their own data when applicable
6. **Token Validation**: Always validate roles server-side, never trust client
7. **Error Messages**: Don't reveal unauthorized endpoints (use 404 instead of 403 when appropriate)

---

## Summary

**Current State**:
- ✅ RBAC infrastructure complete
- ❌ Only Auth endpoints protected
- ❌ Other modules open to all authenticated users

**Next Steps**:
1. Apply guards and role decorators to all controllers
2. Implement frontend route protection
3. Add role-based UI filtering
4. Test thoroughly with different user roles

**Priority Order**:
1. **High**: Production, Invoices, Production Orders (business critical)
2. **Medium**: Raw Materials, Customers, Staff (operational)
3. **Low**: Reports, Dashboard (read-only/informational)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-06
**Status:** Ready for implementation
