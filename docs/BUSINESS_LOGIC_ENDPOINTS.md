# Business Logic Endpoints - Recommendations

## Overview

Beyond basic CRUD operations, these specialized endpoints handle complex business workflows, data aggregation, validations, and reporting needs.

---

## 1. Authentication & Authorization

### Login/Auth Module

**Base Route:** `/auth`

#### Login
```http
POST /auth/login
```
**Request:**
```json
{
  "profileCode": "STAFF001",
  "password": "password123"
}
```
**Response:**
```json
{
  "accessToken": "jwt-token-here",
  "refreshToken": "refresh-token-here",
  "user": {
    "id": 1,
    "staffName": "John Doe",
    "role": {
      "id": 1,
      "name": "Manager"
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```

#### Logout
```http
POST /auth/logout
```

#### Change Password
```http
POST /auth/change-password
```
**Request:**
```json
{
  "currentPassword": "old123",
  "newPassword": "new456"
}
```

#### Reset Password Request
```http
POST /auth/forgot-password
```

---

## 2. Inventory Management Business Logic

### Raw Items - Advanced Operations

**Base Route:** `/raw-items`

#### Check Stock Availability
```http
GET /raw-items/:id/availability
```
**Response:**
```json
{
  "itemId": 1,
  "currentQuantity": 150,
  "reserved": 50,
  "available": 100,
  "unit": "yard",
  "lowStockThreshold": 20,
  "needsReorder": false
}
```

#### Get Item History
```http
GET /raw-items/:id/history?startDate=2025-01-01&endDate=2025-01-31
```
**Response:**
```json
{
  "itemId": 1,
  "itemName": "Cotton Fabric White",
  "history": [
    {
      "date": "2025-01-15T10:30:00Z",
      "quantity": 50,
      "action": "added",
      "staffName": "John Doe",
      "runningBalance": 150
    }
  ],
  "totalAdded": 100,
  "totalRemoved": 30,
  "netChange": 70
}
```

#### Low Stock Alert
```http
GET /raw-items/low-stock?threshold=20
```
**Response:**
```json
{
  "items": [
    {
      "id": 5,
      "name": "Blue Thread",
      "currentQuantity": 15,
      "threshold": 20,
      "unit": "count",
      "reorderSuggestion": 100
    }
  ]
}
```

#### Bulk Import Items
```http
POST /raw-items/bulk-import
```
**Request:**
```json
{
  "items": [
    {
      "typeId": 1,
      "name": "Cotton White",
      "quantity": 100,
      "description": "Premium cotton"
    }
  ]
}
```

#### Reserve Items (for production)
```http
POST /raw-items/reserve
```
**Request:**
```json
{
  "items": [
    {
      "itemId": 1,
      "quantity": 25,
      "reservedFor": "production",
      "referenceId": 10
    }
  ]
}
```

---

## 3. Product Management Business Logic

### Product Definitions - Advanced Operations

**Base Route:** `/product-defs`

#### Calculate Product Cost
```http
POST /product-defs/calculate-cost
```
**Request:**
```json
{
  "materials": [
    {"itemId": 1, "quantity": 2.5, "costPerUnit": 500},
    {"itemId": 3, "quantity": 5, "costPerUnit": 50}
  ],
  "laborCost": 1000,
  "overheadPercentage": 15
}
```
**Response:**
```json
{
  "materialsCost": 1500,
  "laborCost": 1000,
  "overhead": 375,
  "totalCost": 2875,
  "suggestedPrice": 4312.5,
  "profitMargin": 50
}
```

#### Check Material Availability for Product
```http
GET /product-defs/:id/material-availability?quantity=10
```
**Response:**
```json
{
  "productId": 1,
  "productName": "Formal Shirt",
  "requestedQuantity": 10,
  "canProduce": true,
  "maxProducible": 50,
  "materials": [
    {
      "itemId": 1,
      "itemName": "Cotton Fabric",
      "required": 25,
      "available": 150,
      "sufficient": true
    }
  ]
}
```

#### Get Product Variants
```http
GET /product-defs/:id/variants
```
**Response:**
```json
{
  "productId": 1,
  "productName": "Formal Shirt",
  "variants": [
    {
      "sizeId": 1,
      "sizeName": "Small",
      "inStock": 15,
      "inProduction": 5,
      "reserved": 2
    }
  ]
}
```

#### Duplicate Product
```http
POST /product-defs/:id/duplicate
```
**Request:**
```json
{
  "newCode": "SHT2",
  "newName": "Formal Shirt V2",
  "modifyMaterials": true
}
```

---

## 4. Production Management Business Logic

### Production - Workflow Endpoints

**Base Route:** `/productions`

#### Auto-Generate Production Code
```http
POST /productions/generate-code
```
**Request:**
```json
{
  "productCode": "SHRT",
  "sizeId": 8
}
```
**Response:**
```json
{
  "code": "SHRT082501001",
  "breakdown": {
    "productCode": "SHRT",
    "size": "08",
    "year": "25",
    "month": "01",
    "serial": "001"
  }
}
```

#### Assign Production to Tailor
```http
POST /productions/:id/assign
```
**Request:**
```json
{
  "tailorId": 10,
  "priority": "high",
  "deadline": "2025-02-15"
}
```

#### Update Production Stage
```http
POST /productions/:id/update-stage
```
**Request:**
```json
{
  "stage": "Await QA",
  "staffId": 3,
  "notes": "Production completed, ready for inspection",
  "images": ["url1", "url2"]
}
```

#### Get Tailor Workload
```http
GET /productions/tailor-workload/:tailorId
```
**Response:**
```json
{
  "tailorId": 10,
  "tailorName": "Ahmed Hassan",
  "activeProductions": 5,
  "totalAssigned": 50,
  "completed": 45,
  "rejected": 2,
  "avgCompletionTime": "3.5 days",
  "qualityScore": 94.5,
  "currentWorkload": [
    {
      "productionId": 15,
      "productName": "Formal Shirt",
      "size": 8,
      "stage": "in production",
      "daysInProgress": 2
    }
  ]
}
```

#### QA Approve/Reject
```http
POST /productions/:id/qa-review
```
**Request:**
```json
{
  "qaStaffId": 3,
  "status": "approved",
  "defects": [],
  "notes": "Quality check passed"
}
```

#### Move to Stock
```http
POST /productions/:id/move-to-stock
```
**Request:**
```json
{
  "pushedBy": 3,
  "receivedBy": 8,
  "location": "Warehouse A",
  "notes": "Added to stock"
}
```

#### Batch Production Status
```http
POST /productions/batch-status
```
**Request:**
```json
{
  "productionIds": [1, 2, 3, 4],
  "newStage": "Completed",
  "staffId": 3
}
```

#### Production Analytics
```http
GET /productions/analytics?startDate=2025-01-01&endDate=2025-01-31
```
**Response:**
```json
{
  "period": "January 2025",
  "totalProductions": 150,
  "completed": 140,
  "inProgress": 8,
  "rejected": 2,
  "avgTimeToComplete": "4.2 days",
  "topTailors": [
    {
      "tailorId": 10,
      "name": "Ahmed Hassan",
      "completed": 45,
      "qualityScore": 94.5
    }
  ],
  "productBreakdown": [
    {
      "productName": "Formal Shirt",
      "quantity": 80,
      "percentage": 53.3
    }
  ]
}
```

---

## 5. Material Request Business Logic

**Base Route:** `/material-requests`

#### Auto-Calculate Material Needs
```http
POST /material-requests/calculate
```
**Request:**
```json
{
  "productionId": 1,
  "quantities": [
    {"size": 1, "quantity": 10},
    {"size": 2, "quantity": 15}
  ]
}
```
**Response:**
```json
{
  "materials": [
    {
      "itemId": 1,
      "itemName": "Cotton Fabric",
      "required": 62.5,
      "available": 150,
      "toRequest": 62.5
    }
  ],
  "canFulfill": true
}
```

#### Approve/Reject Material Request
```http
POST /material-requests/:id/approve
```
**Request:**
```json
{
  "approverId": 2,
  "approved": true,
  "notes": "Materials available",
  "modifiedQuantities": []
}
```

#### Get Pending Approvals
```http
GET /material-requests/pending-approvals
```

#### Fulfill Material Request
```http
POST /material-requests/:id/fulfill
```
**Request:**
```json
{
  "fulfilledBy": 8,
  "actualQuantities": [
    {"itemId": 1, "quantity": 25}
  ],
  "notes": "Materials issued"
}
```

---

## 6. Stock Management Business Logic

**Base Route:** `/product-stocks`

#### Get Available Stock
```http
GET /product-stocks/available?productDefId=1&sizeId=8
```
**Response:**
```json
{
  "productDefId": 1,
  "productName": "Formal Shirt",
  "sizeId": 8,
  "sizeName": "Medium",
  "totalInStock": 25,
  "available": 20,
  "reserved": 5,
  "items": [
    {
      "stockId": 1,
      "productionCode": "SHRT082501001",
      "dateAdded": "2025-01-15",
      "isAvailable": true
    }
  ]
}
```

#### Reserve Stock for Invoice
```http
POST /product-stocks/reserve
```
**Request:**
```json
{
  "items": [
    {
      "stockId": 1,
      "quantity": 5,
      "invoiceId": 10
    }
  ]
}
```

#### Stock Valuation Report
```http
GET /product-stocks/valuation
```
**Response:**
```json
{
  "totalItems": 250,
  "totalValue": 1250000,
  "byProduct": [
    {
      "productName": "Formal Shirt",
      "quantity": 100,
      "unitCost": 5000,
      "totalValue": 500000
    }
  ],
  "byLocation": [],
  "lowStockProducts": []
}
```

#### Stock Movement History
```http
GET /product-stocks/:id/movement-history
```

#### Aging Report
```http
GET /product-stocks/aging-report
```
**Response:**
```json
{
  "items": [
    {
      "stockId": 5,
      "productName": "Formal Shirt",
      "productionCode": "SHRT082312045",
      "daysInStock": 90,
      "category": "slow-moving",
      "recommendation": "Consider discount"
    }
  ]
}
```

---

## 7. Sales & Invoice Business Logic

### Invoices - Advanced Operations

**Base Route:** `/invoices`

#### Generate Invoice Number
```http
POST /invoices/generate-invoice-number
```
**Response:**
```json
{
  "invoiceNo": "INV-2025-001",
  "format": "INV-YYYY-NNN"
}
```

#### Create Invoice with Validation
```http
POST /invoices/create-with-validation
```
**Request:**
```json
{
  "customerId": 1,
  "generatedBy": 5,
  "items": [
    {
      "productDefId": 1,
      "sizeId": 8,
      "quantity": 10
    }
  ]
}
```
**Response:**
```json
{
  "invoice": {...},
  "stockReservations": [...],
  "warnings": [
    "Stock for item 2 is below threshold"
  ]
}
```

#### Calculate Invoice Total
```http
POST /invoices/calculate-total
```
**Request:**
```json
{
  "items": [
    {
      "productDefId": 1,
      "quantity": 10,
      "unitPrice": 5000
    }
  ],
  "discount": 5,
  "tax": 7.5
}
```
**Response:**
```json
{
  "subtotal": 50000,
  "discount": 2500,
  "tax": 3562.5,
  "total": 51062.5,
  "breakdown": {...}
}
```

#### Update Invoice Status
```http
POST /invoices/:id/update-status
```
**Request:**
```json
{
  "status": "paid",
  "staffId": 5,
  "paymentMethod": "bank transfer",
  "transactionRef": "TXN123456",
  "notes": "Payment confirmed"
}
```

#### Get Invoice Summary
```http
GET /invoices/:id/summary
```
**Response:**
```json
{
  "invoiceNo": "INV-2025-001",
  "customer": {...},
  "items": [...],
  "total": 51062.5,
  "status": "paid",
  "timeline": [
    {
      "stage": "open",
      "date": "2025-01-15T10:00:00Z",
      "staff": "John Doe"
    },
    {
      "stage": "paid",
      "date": "2025-01-15T14:30:00Z",
      "staff": "Jane Smith"
    }
  ]
}
```

#### Pack Invoice Items
```http
POST /invoices/:id/pack
```
**Request:**
```json
{
  "packedBy": 6,
  "packages": [
    {
      "packageNo": "PKG-001",
      "items": [1, 2, 3],
      "weight": "2.5kg"
    }
  ]
}
```

#### Assign to Logistics
```http
POST /invoices/:id/assign-logistics
```
**Request:**
```json
{
  "logisticsProvider": "DHL",
  "trackingNumber": "DHL123456789",
  "assignedBy": 5,
  "estimatedDelivery": "2025-01-20"
}
```

#### Mark as Delivered
```http
POST /invoices/:id/delivered
```
**Request:**
```json
{
  "deliveredBy": 7,
  "deliveryDate": "2025-01-19T15:00:00Z",
  "receivedBy": "Customer Name",
  "signature": "base64-image",
  "notes": "Delivered successfully"
}
```

#### Cancel Invoice
```http
POST /invoices/:id/cancel
```
**Request:**
```json
{
  "cancelledBy": 5,
  "reason": "Customer request",
  "refundAmount": 51062.5
}
```

---

## 8. Customer Management Business Logic

**Base Route:** `/customers`

#### Get Customer Purchase History
```http
GET /customers/:id/purchase-history
```
**Response:**
```json
{
  "customerId": 1,
  "customerName": "ABC Fashion Store",
  "totalOrders": 25,
  "totalSpent": 1500000,
  "avgOrderValue": 60000,
  "lastOrderDate": "2025-01-15",
  "orders": [...]
}
```

#### Get Customer Credit Status
```http
GET /customers/:id/credit-status
```
**Response:**
```json
{
  "customerId": 1,
  "creditLimit": 500000,
  "currentBalance": 150000,
  "available": 350000,
  "overdueInvoices": 0,
  "paymentHistory": "excellent"
}
```

#### Customer Analytics
```http
GET /customers/:id/analytics
```
**Response:**
```json
{
  "customerId": 1,
  "segment": "Reseller - Gold",
  "lifetimeValue": 2500000,
  "avgOrderFrequency": "2 weeks",
  "favoriteProducts": [
    {
      "productName": "Formal Shirt",
      "orderCount": 15,
      "totalQuantity": 150
    }
  ],
  "seasonalTrends": {...}
}
```

---

## 9. Dashboard & Reports

**Base Route:** `/reports`

#### Dashboard Summary
```http
GET /reports/dashboard
```
**Response:**
```json
{
  "inventory": {
    "totalItems": 50,
    "totalValue": 500000,
    "lowStockItems": 5
  },
  "production": {
    "activeProductions": 15,
    "completedToday": 8,
    "avgTimeToComplete": "4.2 days"
  },
  "sales": {
    "todaysSales": 250000,
    "monthlyTarget": 5000000,
    "achievement": 45.5,
    "pendingInvoices": 12
  },
  "stock": {
    "totalProducts": 250,
    "totalValue": 1250000,
    "availableForSale": 230
  }
}
```

#### Sales Report
```http
GET /reports/sales?startDate=2025-01-01&endDate=2025-01-31
```
**Response:**
```json
{
  "period": "January 2025",
  "totalRevenue": 2500000,
  "totalOrders": 50,
  "avgOrderValue": 50000,
  "topProducts": [...],
  "topCustomers": [...],
  "salesByDay": [...],
  "paymentMethods": {...}
}
```

#### Production Report
```http
GET /reports/production?startDate=2025-01-01&endDate=2025-01-31
```

#### Inventory Report
```http
GET /reports/inventory
```

#### Financial Report
```http
GET /reports/financial?year=2025&month=1
```
**Response:**
```json
{
  "period": "January 2025",
  "revenue": 2500000,
  "cogs": 1200000,
  "grossProfit": 1300000,
  "expenses": {
    "labor": 500000,
    "overhead": 200000,
    "other": 100000
  },
  "netProfit": 500000,
  "profitMargin": 20
}
```

#### Staff Performance Report
```http
GET /reports/staff-performance?staffId=10
```

---

## 10. Notifications & Alerts

**Base Route:** `/notifications`

#### Get User Notifications
```http
GET /notifications/my-notifications
```

#### Mark as Read
```http
POST /notifications/:id/read
```

#### Create System Alert
```http
POST /notifications/create-alert
```
**Request:**
```json
{
  "type": "low_stock",
  "priority": "high",
  "message": "Cotton Fabric below threshold",
  "recipients": [1, 2, 3]
}
```

#### Get Alert Preferences
```http
GET /notifications/preferences
```

---

## 11. Settings & Configuration

**Base Route:** `/settings`

#### Get System Settings
```http
GET /settings
```

#### Update Settings
```http
PATCH /settings
```
**Request:**
```json
{
  "lowStockThreshold": 20,
  "productionLeadTime": 5,
  "taxRate": 7.5,
  "invoicePrefix": "INV",
  "currency": "NGN"
}
```

#### Get Business Rules
```http
GET /settings/business-rules
```

---

## 12. File Management

**Base Route:** `/files`

#### Upload Image
```http
POST /files/upload
```
**Request:** multipart/form-data

#### Get Image
```http
GET /files/:fileId
```

#### Delete File
```http
DELETE /files/:fileId
```

---

## 13. Audit & Logs

**Base Route:** `/audit`

#### Get Audit Logs
```http
GET /audit/logs?entity=production&entityId=1
```

#### Get User Activity
```http
GET /audit/user-activity/:staffId?startDate=2025-01-01
```

---

## Implementation Priority

### Phase 1 (Critical - Implement First)
1. ✅ Authentication (login, logout, change password)
2. ✅ Invoice status workflow (create, approve, pack, deliver)
3. ✅ Production stage transitions (assign, QA, complete)
4. ✅ Material request approval workflow
5. ✅ Stock availability checks

### Phase 2 (Important)
1. Dashboard summary
2. Product cost calculation
3. Material availability checking
4. Production code generation
5. Invoice number generation

### Phase 3 (Enhanced Features)
1. Reports and analytics
2. Notifications
3. Bulk operations
4. File management
5. Advanced search and filters

### Phase 4 (Optimization)
1. Caching frequently accessed data
2. Background jobs for heavy operations
3. Export to PDF/Excel
4. Email notifications
5. SMS alerts

---

## Security Considerations

1. **JWT Authentication**: All business logic endpoints should require authentication
2. **Role-Based Access**: Different staff roles should have different permissions
3. **Audit Logging**: Track all critical business operations
4. **Input Validation**: Validate all business logic inputs
5. **Transaction Management**: Use database transactions for complex operations

---

## Next Steps for Implementation

1. Implement authentication module first
2. Add authorization guards to controllers
3. Create business logic services
4. Add transaction support for complex operations
5. Implement audit logging
6. Add validation for business rules
7. Create report generation services
8. Add notification system

Would you like me to implement any of these endpoints?
