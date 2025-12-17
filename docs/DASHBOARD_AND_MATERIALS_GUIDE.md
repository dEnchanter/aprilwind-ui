# Dashboard & Material Addition Workflow Guide

This guide covers two major features:
1. **Dashboard/Overview System** - Centralized system monitoring and analytics
2. **Raw Material Addition Workflow** - Complete material stock management

## Table of Contents

1. [Dashboard System](#dashboard-system)
   - [Overview](#overview)
   - [Alerts](#alerts)
   - [Recent Activities](#recent-activities)
   - [KPIs](#kpis)
2. [Material Addition Workflow](#material-addition-workflow)
   - [Single Material Addition](#single-material-addition)
   - [Bulk Addition](#bulk-addition)
   - [Stock Adjustments](#stock-adjustments)
   - [Transaction History](#transaction-history)
3. [Entity Changes](#entity-changes)
4. [API Reference](#api-reference)
5. [Examples](#examples)

---

## Dashboard System

The dashboard module provides a centralized view of your entire fashion management system with key metrics, alerts, and recent activities.

### Overview

Get comprehensive metrics across all modules in one call.

**Endpoint:** `GET /dashboard/overview`

**Response Structure:**
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
    "open": 12,
    "paid": 45,
    "delivered": 28,
    "totalRevenue": "5,450,000",
    "averageOrderValue": "62,643"
  },
  "materials": {
    "pendingRequests": 5,
    "approvedRequests": 34,
    "totalRawMaterials": 145,
    "lowStockMaterials": 8
  },
  "inventory": {
    "totalProductStock": 320,
    "availableStock": 245,
    "soldStock": 75,
    "availabilityRate": "76.6"
  }
}
```

**Metrics Explained:**

**Production Metrics:**
- `total`: Total number of production orders
- `active`: Productions currently in progress or awaiting QA
- `completed`: Finished productions
- `completionRate`: Percentage of completed productions

**Sales Metrics:**
- `totalInvoices`: All invoices in the system
- `open/paid/delivered`: Invoice counts by status
- `totalRevenue`: Sum of paid/packed/logistic/delivered invoices
- `averageOrderValue`: Revenue divided by total invoices

**Materials Metrics:**
- `pendingRequests`: Material requests awaiting approval
- `approvedRequests`: Approved material requests
- `totalRawMaterials`: Total raw material types in inventory
- `lowStockMaterials`: Materials with quantity < 10

**Inventory Metrics:**
- `totalProductStock`: Total finished goods in stock
- `availableStock`: Available items (not sold)
- `soldStock`: Items marked as sold
- `availabilityRate`: Percentage of available stock

### Alerts

Get actionable alerts requiring attention.

**Endpoint:** `GET /dashboard/alerts`

**Response Structure:**
```json
{
  "totalAlerts": 4,
  "alerts": [
    {
      "type": "material_requests",
      "severity": "warning",
      "count": 5,
      "message": "5 material request(s) awaiting approval",
      "action": "Review material requests",
      "link": "/material-requests/pending"
    },
    {
      "type": "low_stock",
      "severity": "error",
      "count": 3,
      "message": "3 raw material(s) running low",
      "items": [
        {
          "id": 12,
          "name": "Cotton Thread",
          "currentQty": 5
        }
      ],
      "action": "Restock materials",
      "link": "/raw-items/low-stock?threshold=10"
    },
    {
      "type": "qa_pending",
      "severity": "info",
      "count": 7,
      "message": "7 production(s) awaiting QA review",
      "action": "Perform QA review",
      "link": "/productions?stage=Await QA"
    },
    {
      "type": "unpaid_invoices",
      "severity": "warning",
      "count": 12,
      "message": "12 invoice(s) awaiting payment",
      "action": "Follow up on payments",
      "link": "/invoices?status=open"
    },
    {
      "type": "logistics_pending",
      "severity": "info",
      "count": 4,
      "message": "4 order(s) ready for logistics",
      "action": "Assign to logistics",
      "link": "/invoices?status=packed"
    }
  ]
}
```

**Alert Types:**
- `material_requests`: Pending material requisitions
- `low_stock`: Materials below threshold (< 10)
- `qa_pending`: Productions awaiting quality assurance
- `unpaid_invoices`: Open invoices awaiting payment
- `logistics_pending`: Packed orders ready for delivery

**Severity Levels:**
- `error`: Critical issues requiring immediate attention
- `warning`: Important but not critical
- `info`: Informational alerts

### Recent Activities

View recent activities across all modules with timeline.

**Endpoint:** `GET /dashboard/activities?limit=20`

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response Structure:**
```json
{
  "total": 15,
  "activities": [
    {
      "type": "production",
      "action": "Production moved to Completed",
      "details": {
        "productionId": 45,
        "productionCode": "PR-202501-00045",
        "stage": "Completed"
      },
      "performedBy": "John Doe",
      "timestamp": "2025-01-06T10:30:00Z"
    },
    {
      "type": "invoice",
      "action": "Invoice paid",
      "details": {
        "invoiceId": 87,
        "invoiceNo": "INV-202501-00087",
        "status": "paid"
      },
      "performedBy": "Jane Smith",
      "timestamp": "2025-01-06T09:15:00Z"
    },
    {
      "type": "material_request",
      "action": "Material request approved",
      "details": {
        "requestId": 23,
        "status": "approved",
        "notes": "All materials available"
      },
      "performedBy": "Mike Johnson",
      "timestamp": "2025-01-06T08:45:00Z"
    }
  ]
}
```

**Activity Types:**
- `production`: Production stage changes
- `invoice`: Invoice status changes
- `material_request`: Material request approvals/rejections

### KPIs

Get key performance indicators for the current period.

**Endpoint:** `GET /dashboard/kpis`

**Response Structure:**
```json
{
  "thisMonth": {
    "productions": 34,
    "completedProductions": 28,
    "invoices": 45,
    "revenue": "3,450,000"
  },
  "thisWeek": {
    "activities": 127
  }
}
```

**KPI Breakdown:**
- **This Month**: Productions, completions, invoices, and revenue for current month
- **This Week**: Total system activities in the last 7 days

---

## Material Addition Workflow

Complete workflow for adding and managing raw material stock with full audit trails.

### Single Material Addition

Add stock for a single material with tracking.

**Endpoint:** `POST /raw-items/add-stock`

**Request Body:**
```json
{
  "itemId": 12,
  "quantity": 50,
  "staffId": 5,
  "notes": "Weekly restock from supplier",
  "supplier": "ABC Fabrics Ltd",
  "unitCost": 150.00
}
```

**Fields:**
- `itemId` (required): Raw material ID
- `quantity` (required): Quantity to add (min: 1)
- `staffId` (required): Staff member performing the addition
- `notes` (optional): Additional notes
- `supplier` (optional): Supplier name
- `unitCost` (optional): Cost per unit

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 50 units of Cotton Thread",
  "materialId": 12,
  "materialName": "Cotton Thread",
  "previousQuantity": 25,
  "newQuantity": 75,
  "addedQuantity": 50,
  "tracker": {
    "id": 145,
    "itemId": 12,
    "staffId": 5,
    "quantity": 50,
    "isAdded": true,
    "notes": "Added 50 units from ABC Fabrics Ltd at 150/unit",
    "trackerDate": "2025-01-06T10:30:00Z"
  }
}
```

**Process:**
1. Validates staff exists
2. Validates raw material exists
3. Increases material quantity
4. Creates tracker record for audit trail
5. Returns detailed result with before/after quantities

### Bulk Addition

Add multiple materials in a single transaction.

**Endpoint:** `POST /raw-items/bulk-add`

**Request Body:**
```json
{
  "materials": [
    {
      "itemId": 12,
      "quantity": 50,
      "unitCost": 150.00
    },
    {
      "itemId": 15,
      "quantity": 30,
      "unitCost": 200.00
    },
    {
      "itemId": 18,
      "quantity": 100
    }
  ],
  "staffId": 5,
  "supplier": "ABC Fabrics Ltd",
  "notes": "Monthly bulk order"
}
```

**Fields:**
- `materials` (required): Array of materials to add
  - `itemId`: Material ID
  - `quantity`: Quantity to add
  - `unitCost` (optional): Cost per unit
- `staffId` (required): Staff member performing the addition
- `supplier` (optional): Common supplier for all materials
- `notes` (optional): Common notes for all additions

**Response:**
```json
{
  "success": true,
  "message": "Processed 3 materials. 3 successful, 0 failed",
  "successCount": 3,
  "errorCount": 0,
  "results": [
    {
      "itemId": 12,
      "itemName": "Cotton Thread",
      "previousQuantity": 25,
      "newQuantity": 75,
      "addedQuantity": 50,
      "success": true
    },
    {
      "itemId": 15,
      "itemName": "Polyester Fabric",
      "previousQuantity": 45,
      "newQuantity": 75,
      "addedQuantity": 30,
      "success": true
    },
    {
      "itemId": 18,
      "itemName": "Buttons",
      "previousQuantity": 200,
      "newQuantity": 300,
      "addedQuantity": 100,
      "success": true
    }
  ],
  "errors": [],
  "performedBy": "John Doe",
  "supplier": "ABC Fabrics Ltd"
}
```

**Process:**
1. Validates staff exists
2. Processes each material individually
3. Catches errors per material (doesn't stop on failure)
4. Creates separate tracker records for each material
5. Returns detailed results with success/error counts

**Error Handling:**
If some materials fail, they're added to the `errors` array:
```json
{
  "success": false,
  "message": "Processed 3 materials. 2 successful, 1 failed",
  "successCount": 2,
  "errorCount": 1,
  "results": [
    // ... successful materials
  ],
  "errors": [
    {
      "itemId": 99,
      "error": "Raw item with ID 99 not found",
      "success": false
    }
  ]
}
```

### Stock Adjustments

Adjust material quantities with reason tracking (increase or decrease).

**Endpoint:** `POST /raw-items/adjust-stock`

**Request Body:**
```json
{
  "itemId": 12,
  "quantity": 10,
  "adjustmentType": "decrease",
  "staffId": 5,
  "reason": "Damaged materials found during inspection",
  "notes": "Physical count revealed 10 damaged units"
}
```

**Fields:**
- `itemId` (required): Material ID
- `quantity` (required): Quantity to adjust (min: 1)
- `adjustmentType` (required): "increase" or "decrease"
- `staffId` (required): Staff member making adjustment
- `reason` (required): Reason for adjustment
- `notes` (optional): Additional details

**Response:**
```json
{
  "success": true,
  "message": "Successfully decreased 10 units of Cotton Thread",
  "materialId": 12,
  "materialName": "Cotton Thread",
  "adjustmentType": "decrease",
  "previousQuantity": 75,
  "newQuantity": 65,
  "adjustedQuantity": 10,
  "reason": "Damaged materials found during inspection",
  "tracker": {
    "id": 146,
    "itemId": 12,
    "staffId": 5,
    "quantity": 10,
    "isAdded": false,
    "notes": "Adjustment (decrease): Damaged materials found during inspection. Physical count revealed 10 damaged units",
    "trackerDate": "2025-01-06T11:00:00Z"
  },
  "performedBy": "John Doe"
}
```

**Process:**
1. Validates staff exists
2. Validates material exists
3. For decrease: Checks sufficient quantity available
4. Updates material quantity
5. Creates tracker record with adjustment details
6. Returns complete audit trail

**Adjustment Types:**
- `increase`: Add to stock (inventory count correction, found items, etc.)
- `decrease`: Remove from stock (damage, loss, theft, etc.)

**Use Cases:**
- Physical inventory corrections
- Damage/spoilage
- Quality control removals
- Found/missing inventory
- Reconciliation adjustments

### Transaction History

#### Material Addition History

Get history of material additions only.

**Endpoint:** `GET /raw-items/:id/addition-history?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "materialId": 12,
  "materialName": "Cotton Thread",
  "currentQuantity": 65,
  "totalAdditions": 15,
  "totalQuantityAdded": 450,
  "data": [
    {
      "id": 145,
      "quantity": 50,
      "addedBy": "John Doe",
      "date": "2025-01-06T10:30:00Z",
      "notes": "Added 50 units from ABC Fabrics Ltd at 150/unit"
    },
    {
      "id": 140,
      "quantity": 30,
      "addedBy": "Jane Smith",
      "date": "2025-01-05T09:15:00Z",
      "notes": "Weekly restock"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

#### Complete Transaction History

Get all transactions (additions AND removals).

**Endpoint:** `GET /raw-items/:id/transactions?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "materialId": 12,
  "materialName": "Cotton Thread",
  "currentQuantity": 65,
  "totalTransactions": 45,
  "totalAdditions": 450,
  "totalRemovals": 385,
  "data": [
    {
      "id": 146,
      "type": "removal",
      "quantity": 10,
      "performedBy": "John Doe",
      "date": "2025-01-06T11:00:00Z",
      "notes": "Adjustment (decrease): Damaged materials found during inspection"
    },
    {
      "id": 145,
      "type": "addition",
      "quantity": 50,
      "performedBy": "John Doe",
      "date": "2025-01-06T10:30:00Z",
      "notes": "Added 50 units from ABC Fabrics Ltd at 150/unit"
    },
    {
      "id": 143,
      "type": "removal",
      "quantity": 25,
      "performedBy": "Mike Johnson",
      "date": "2025-01-06T08:00:00Z",
      "notes": "Used for production PR-202501-00045"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Entity Changes

### New Field Added

**RawItemTracker Entity:**
Added `notes` field to support detailed tracking:

```typescript
@Column({ type: 'text', nullable: true })
notes: string;
```

This field stores:
- Addition details (supplier, unit cost, purpose)
- Adjustment reasons and notes
- Production usage references
- Any other relevant information for audit trails

**Database Migration:**
When you run the app with `synchronize: true` (development), the field will be automatically added. For production, create a migration:

```sql
ALTER TABLE raw_item_tracker ADD COLUMN notes TEXT;
```

---

## API Reference

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/overview` | Get system overview with key metrics |
| GET | `/dashboard/alerts` | Get actionable alerts |
| GET | `/dashboard/activities?limit=20` | Get recent activities |
| GET | `/dashboard/kpis` | Get key performance indicators |

### Material Addition Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/raw-items/add-stock` | Add stock for single material |
| POST | `/raw-items/bulk-add` | Bulk add multiple materials |
| POST | `/raw-items/adjust-stock` | Adjust stock (increase/decrease) |
| GET | `/raw-items/:id/addition-history` | Get material addition history |
| GET | `/raw-items/:id/transactions` | Get all transactions (additions + removals) |

---

## Examples

### Example 1: Daily Dashboard Check

Start your day by checking the dashboard:

```bash
# Get overview
curl http://localhost:3000/dashboard/overview

# Check alerts
curl http://localhost:3000/dashboard/alerts

# View recent activities
curl http://localhost:3000/dashboard/activities?limit=10
```

### Example 2: Receiving Material Shipment

When materials arrive from supplier:

```bash
curl -X POST http://localhost:3000/raw-items/bulk-add \
  -H "Content-Type: application/json" \
  -d '{
    "materials": [
      {"itemId": 12, "quantity": 100, "unitCost": 150},
      {"itemId": 15, "quantity": 50, "unitCost": 200},
      {"itemId": 18, "quantity": 200, "unitCost": 5}
    ],
    "staffId": 5,
    "supplier": "ABC Fabrics Ltd",
    "notes": "January monthly order - Invoice #INV-2025-001"
  }'
```

### Example 3: Physical Inventory Adjustment

Found damaged materials during inspection:

```bash
curl -X POST http://localhost:3000/raw-items/adjust-stock \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 12,
    "quantity": 5,
    "adjustmentType": "decrease",
    "staffId": 5,
    "reason": "Damaged materials - water damage",
    "notes": "Found damaged during weekly inspection. Filed damage report #DR-2025-003"
  }'
```

### Example 4: Audit Material Usage

Review complete transaction history for a material:

```bash
# Get addition history only
curl http://localhost:3000/raw-items/12/addition-history?page=1&limit=20

# Get complete transaction history
curl http://localhost:3000/raw-items/12/transactions?page=1&limit=20
```

### Example 5: Monitor Low Stock

Check dashboard alerts for low stock materials:

```bash
# Get all alerts (includes low stock)
curl http://localhost:3000/dashboard/alerts

# Get detailed low stock report
curl http://localhost:3000/raw-items/low-stock?threshold=10&page=1&limit=10
```

### Example 6: End-of-Month Review

Generate month-end reports:

```bash
# Get KPIs for the month
curl http://localhost:3000/dashboard/kpis

# Get production metrics
curl http://localhost:3000/dashboard/overview

# Get materials summary
curl http://localhost:3000/raw-items/summary
```

---

## Best Practices

### Dashboard Usage

1. **Daily Monitoring**: Check dashboard overview and alerts every morning
2. **Alert Response**: Address high-severity alerts immediately
3. **Activity Review**: Monitor recent activities for unusual patterns
4. **KPI Tracking**: Review monthly KPIs for business insights

### Material Management

1. **Always Track Additions**: Use add-stock or bulk-add endpoints, never manual updates
2. **Document Adjustments**: Always provide detailed reason for adjustments
3. **Regular Audits**: Review transaction history periodically
4. **Supplier Tracking**: Always include supplier information for additions
5. **Cost Recording**: Record unit costs for accurate inventory valuation

### Audit Trail

1. **Complete Notes**: Provide detailed notes for all transactions
2. **Reference Numbers**: Include invoice numbers, PO numbers, or report numbers
3. **Staff Accountability**: Always use correct staffId
4. **Regular Reviews**: Audit transaction history monthly

### Error Handling

1. **Bulk Operations**: Check response for errors array
2. **Validation**: Ensure staff and materials exist before operations
3. **Quantity Checks**: Verify sufficient quantity before decreases
4. **Transaction Safety**: Use bulk-add for multiple materials to track them together

---

## Troubleshooting

### Common Issues

**Issue: Dashboard overview shows 0 for all metrics**
- Cause: Database might be empty or not seeded
- Solution: Check that entities exist in database

**Issue: Bulk add partially succeeds**
- Cause: Some material IDs don't exist
- Solution: Check `errors` array in response for details

**Issue: Cannot decrease material quantity**
- Cause: Insufficient quantity available
- Solution: Check current quantity before adjustment

**Issue: Tracker records missing notes**
- Cause: Notes field is optional
- Solution: Always provide notes for better audit trails

**Issue: Dashboard activities not showing**
- Cause: No recent stage changes
- Solution: This is normal if system hasn't been active

---

## Integration Points

### With Production Module

When materials are used in production, automatic removals are tracked:
```javascript
// Automatic tracker record created during production material usage
{
  itemId: 12,
  quantity: 25,
  isAdded: false,
  notes: "Used for production PR-202501-00045"
}
```

### With Material Request Module

When material requests are approved with stock deduction:
```javascript
// Automatic tracker record created during approval
{
  itemId: 12,
  quantity: 30,
  isAdded: false,
  notes: "Material request #23 approved and deducted"
}
```

### Dashboard Auto-Updates

The dashboard pulls real-time data from:
- Production module (stages, completions)
- Invoice module (sales, revenue)
- Material Request module (approvals, pending)
- Raw Items module (stock levels, low stock)
- Product Stock module (inventory availability)

No caching - all metrics are calculated on-demand for accuracy.

---

## Security Considerations

1. **Staff Validation**: All operations require valid staffId
2. **Audit Trail**: Complete history of who did what and when
3. **Immutable Records**: Tracker records cannot be deleted or modified
4. **Authorization**: Consider adding role-based access control (RBAC) for sensitive operations

---

## Performance Notes

1. **Dashboard Overview**: May be slow with large datasets (1000+ records)
   - Consider adding pagination or date filters
   - Add caching for high-traffic scenarios

2. **Transaction History**: Paginated by default
   - Use appropriate page sizes (10-50 recommended)
   - Default limit is 10 for optimal performance

3. **Bulk Operations**: Process up to 100 materials efficiently
   - For larger batches, consider splitting into multiple requests

---

## Future Enhancements

Potential improvements for consideration:

1. **Dashboard Filters**: Date range filters for KPIs and activities
2. **Export Functionality**: Export transaction history to CSV/Excel
3. **Notifications**: Real-time alerts via WebSocket or email
4. **Barcode Integration**: Scan barcodes for material additions
5. **Approval Workflow**: Require approval for large adjustments
6. **Cost Tracking**: Enhanced cost analysis and reporting
7. **Forecasting**: Predict when materials will run low
8. **Supplier Management**: Track supplier performance and pricing

---

## Summary

This implementation provides:

- **Dashboard System**: Complete system monitoring with overview, alerts, activities, and KPIs
- **Material Addition**: Full workflow for adding, adjusting, and tracking raw materials
- **Audit Trail**: Complete history of all material transactions
- **Integration**: Seamless integration with existing production and material request workflows

All operations are fully tracked, validated, and auditable for compliance and accountability.
