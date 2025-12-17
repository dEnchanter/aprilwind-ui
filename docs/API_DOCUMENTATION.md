# Fashion Management System - Complete API Documentation

**Base URL:** `http://localhost:3000`
**API Version:** 1.0.0

---

## Quick Reference

### Module Overview
| Module | Endpoints | Base Path |
|--------|-----------|-----------|
| Authentication | 2 | `/auth` |
| Roles | 5 | `/roles` |
| Staff | 5 | `/staff` |
| Item Types | 5 | `/item-types` |
| Size Definitions | 5 | `/size-defs` |
| Customer Types | 5 | `/customer-types` |
| Raw Items | 15 | `/raw-items` |
| Product Definitions | 5 | `/product-defs` |
| Product for Production | 5 | `/product-for-production` |
| Material Requests | 12 | `/material-requests` |
| Production | 12 | `/productions` |
| Product Stock | 10 | `/product-stocks` |
| Customers | 5 | `/customers` |
| Invoices | 15 | `/invoices` |
| Production Orders | 15 | `/production-orders` |
| Dashboard | 4 | `/dashboard` |
| Reports | 8 | `/reports` |

**Total Endpoints:** 140+

---

## Authentication

### POST /auth/login
Login to get JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "staff": {
      "id": 1,
      "staffName": "John Doe",
      "role": { "id": 1, "name": "Administrator" }
    }
  }
}
```

### POST /auth/register
Register new user account.

**Request:**
```json
{
  "username": "newuser",
  "password": "securepass",
  "staffId": 5
}
```

---

## Core Entities

### Roles
- `GET /roles?page=1&limit=10` - List all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Staff
- `GET /staff?page=1&limit=10` - List all staff
- `GET /staff/:id` - Get staff by ID
- `POST /staff` - Create staff member
- `PATCH /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff

### Customers
- `GET /customers?page=1&limit=10` - List customers
- `GET /customers/:id` - Get customer
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

---

## Raw Materials Module

### Basic Operations
- `GET /raw-items?page=1&limit=10` - List materials
- `GET /raw-items/:id` - Get material details
- `POST /raw-items` - Create material
- `PATCH /raw-items/:id` - Update material
- `DELETE /raw-items/:id` - Delete material

### Inventory Queries
- `GET /raw-items/available` - Available materials (qty > 0)
- `GET /raw-items/summary` - Materials summary by type
- `GET /raw-items/search?term=cotton` - Search materials
- `GET /raw-items/low-stock?threshold=10` - Low stock alert
- `GET /raw-items/availability/:id` - Check specific material

### Stock Management
- `POST /raw-items/add-stock` - Add material stock (single)
- `POST /raw-items/bulk-add` - Bulk add materials
- `POST /raw-items/adjust-stock` - Adjust stock (increase/decrease)
- `GET /raw-items/:id/addition-history` - Addition history only
- `GET /raw-items/:id/transactions` - All transactions

**Add Stock Example:**
```json
{
  "itemId": 12,
  "quantity": 50,
  "staffId": 5,
  "supplier": "ABC Suppliers",
  "unitCost": 150.00,
  "notes": "Weekly restock"
}
```

**Bulk Add Example:**
```json
{
  "materials": [
    { "itemId": 12, "quantity": 50, "unitCost": 150 },
    { "itemId": 15, "quantity": 30, "unitCost": 200 }
  ],
  "staffId": 5,
  "supplier": "ABC Suppliers",
  "notes": "Monthly order"
}
```

---

## Production Module

### Material Requests
- `GET /material-requests?page=1&limit=10` - List requests
- `GET /material-requests/:id` - Get request details
- `POST /material-requests/create-with-validation` - Create with validation
- `POST /material-requests/check-availability` - Check availability
- `GET /material-requests/pending` - Pending requests
- `GET /material-requests/requester/:id` - By requester
- `GET /material-requests/:id/timeline` - Request timeline
- `GET /material-requests/analytics` - Analytics

**Workflow:**
- `POST /material-requests/:id/approve` - Approve & deduct stock
- `POST /material-requests/:id/reject` - Reject request
- `POST /material-requests/:id/cancel` - Cancel request

### Productions
- `GET /productions?page=1&limit=10` - List productions
- `GET /productions/:id` - Get production details
- `POST /productions/create-with-validation` - Create with validation
- `GET /productions/generate-code` - Generate code
- `GET /productions/stage/:stage` - By stage
- `GET /productions/tailor/:tailorId` - By tailor
- `GET /productions/:id/timeline` - Production timeline
- `GET /productions/analytics` - Analytics

**Workflow:**
- `POST /productions/:id/move-to-stage` - Move to stage
- `POST /productions/:id/move-to-stock` - Move to inventory

**Stages:** `in production`, `Bidding`, `Await QA`, `Rejected`, `Completed`

---

## Inventory Module

### Product Stock
- `GET /product-stocks?page=1&limit=10` - List stock
- `GET /product-stocks/:id` - Get stock item
- `POST /product-stocks` - Create stock entry
- `PATCH /product-stocks/:id` - Update stock
- `DELETE /product-stocks/:id` - Delete stock

### Stock Queries
- `GET /product-stocks/available` - Available stock
- `GET /product-stocks/summary` - Summary by product
- `GET /product-stocks/search?term=shirt` - Search stock
- `GET /product-stocks/size/:size` - By size
- `GET /product-stocks/availability/:productDefId` - Product availability

**Availability Response:**
```json
{
  "productDefId": 1,
  "productName": "Classic Shirt",
  "totalAvailable": 60,
  "bySize": [
    { "size": 10, "quantity": 15, "stockIds": [101, 102] },
    { "size": 12, "quantity": 25, "stockIds": [104, 105] }
  ]
}
```

---

## Sales Module

### Invoices
- `GET /invoices?page=1&limit=10` - List invoices
- `GET /invoices/:id` - Get invoice
- `POST /invoices/create-with-validation` - Create with validation
- `GET /invoices/generate-number` - Generate invoice number
- `GET /invoices/customer/:customerId` - Customer's invoices
- `GET /invoices/:id/timeline` - Invoice timeline
- `GET /invoices/analytics` - Sales analytics

### Invoice Workflow
- `POST /invoices/:id/calculate-total` - Calculate with tax/discount
- `POST /invoices/:id/mark-as-paid` - Mark as paid
- `POST /invoices/:id/pack-items` - Pack items
- `POST /invoices/:id/assign-logistics` - Assign logistics
- `POST /invoices/:id/mark-as-delivered` - Mark delivered
- `POST /invoices/:id/cancel` - Cancel invoice

**Invoice Lifecycle:**
```
open → paid → packed → logistic → delivered
  ↓
expired (cancelled)
```

**Mark as Paid Example:**
```json
{
  "receivedBy": 5,
  "paymentMethod": "transfer",
  "referenceNumber": "TXN123456",
  "paymentDate": "2025-01-06",
  "notes": "Bank transfer"
}
```

---

## Production Orders Module

### Production Orders (Customer → Production)
- `GET /production-orders?page=1&limit=10` - List orders
- `GET /production-orders/:id` - Get order
- `POST /production-orders/create-with-validation` - Create order
- `GET /production-orders/generate-number` - Generate order number
- `GET /production-orders/status/:status` - By status
- `GET /production-orders/customer/:customerId` - Customer's orders
- `GET /production-orders/:id/timeline` - Order timeline
- `GET /production-orders/analytics` - Analytics

### Order Workflow
- `POST /production-orders/:id/approve` - Approve order
- `POST /production-orders/:id/reject` - Reject order
- `POST /production-orders/:id/assign-to-production` - Assign to production
- `POST /production-orders/:id/complete` - Mark completed
- `POST /production-orders/:id/deliver` - Mark delivered
- `POST /production-orders/:id/cancel` - Cancel order

**Order Lifecycle:**
```
pending → approved → in_production → completed → delivered
   ↓
rejected
   ↓
cancelled (any non-final state)
```

**Create Order Example:**
```json
{
  "customerId": 12,
  "orderDetails": [
    {
      "productName": "Custom Blazer",
      "size": 42,
      "quantity": 25,
      "specifications": "Navy blue with custom lining",
      "estimatedCost": 8500
    }
  ],
  "receivedBy": 5,
  "expectedDeliveryDate": "2025-03-15",
  "priority": "high"
}
```

---

## Dashboard Module

### GET /dashboard/overview
System-wide overview metrics.

**Response:**
```json
{
  "production": {
    "total": 150,
    "active": 23,
    "completed": 98,
    "completionRate": "65.3"
  },
  "sales": {
    "totalInvoices": 87,
    "totalRevenue": "5,450,000",
    "averageOrderValue": "62,643"
  },
  "materials": {
    "pendingRequests": 5,
    "lowStockMaterials": 8
  },
  "inventory": {
    "totalProductStock": 320,
    "availableStock": 245
  }
}
```

### GET /dashboard/alerts
Actionable alerts requiring attention.

**Response:**
```json
{
  "totalAlerts": 4,
  "alerts": [
    {
      "type": "low_stock",
      "severity": "error",
      "count": 3,
      "message": "3 raw material(s) running low",
      "action": "Restock materials"
    }
  ]
}
```

### GET /dashboard/activities?limit=20
Recent system activities.

### GET /dashboard/kpis
Key performance indicators.

---

## Reports Module

All reports support optional date filtering: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### GET /reports/production
Production performance report.

**Key Metrics:**
- Total productions
- Completion rate
- Average production time
- Tailor performance

### GET /reports/sales
Sales and revenue analysis.

**Key Metrics:**
- Total revenue
- Revenue by status
- Top customers
- Sales trends

### GET /reports/inventory
Current inventory status.

**Key Metrics:**
- Stock levels by product
- Turnover rates
- Low stock alerts

### GET /reports/materials
Material usage report.

**Key Metrics:**
- Top used materials
- Addition vs removal
- Low stock items

### GET /reports/customers
Customer analytics.

**Key Metrics:**
- Top customers by spending
- Customer segmentation
- Lifetime value

### GET /reports/production-orders
Production order analytics.

**Key Metrics:**
- Order distribution
- Delivery performance
- Revenue from orders

### GET /reports/staff
Staff performance report.

**Key Metrics:**
- Activity levels
- Performance by module
- Workload balance

### GET /reports/business
Comprehensive business report (all modules).

---

## Common Patterns

### Pagination
```http
GET /endpoint?page=2&limit=20
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 2,
  "limit": 20,
  "totalPages": 5
}
```

### Date Filtering
```http
GET /reports/sales?startDate=2025-01-01&endDate=2025-01-31
```

### Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error

---

## Workflow Summary

### Material Request Flow
```
Create → Check Availability → Approve → Stock Deducted
```

### Production Flow
```
Create → In Production → Await QA → Completed → Move to Stock
```

### Invoice Flow
```
Create → Calculate → Paid → Packed → Logistics → Delivered
```

### Production Order Flow
```
Receive → Approve → Assign Production → Complete → Deliver
```

---

## Best Practices

1. **Always use `create-with-validation` endpoints** for critical operations
2. **Check availability** before creating orders
3. **Use pagination** on all list endpoints
4. **Include notes** in workflow transitions
5. **Monitor dashboard alerts** regularly
6. **Use timeline endpoints** to track history
7. **Filter reports by date** for better performance
8. **Handle errors gracefully** with user-friendly messages
9. **Cache dashboard metrics** to reduce API calls
10. **Use batch operations** (bulk-add) when applicable

---

## Testing

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Create Material Request:**
```bash
curl -X POST http://localhost:3000/material-requests/create-with-validation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "requestedBy": 5,
    "materials": [{"item_id": 12, "qty": 50}]
  }'
```

**Get Dashboard:**
```bash
curl http://localhost:3000/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support & Documentation

- **Full Guides:** See `DASHBOARD_AND_MATERIALS_GUIDE.md` and `PRODUCTION_ORDERS_AND_REPORTS_GUIDE.md`
- **Frontend Guide:** See `FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Issues:** Report issues to development team
- **Updates:** Check API version in response headers

---

**Last Updated:** 2025-01-06
**API Version:** 1.0.0
