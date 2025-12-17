# Material Request Approval System Guide

This guide provides comprehensive documentation for the Material Request Approval System in the Fashion Management System.

## Table of Contents

1. [Overview](#overview)
2. [Approval Status Flow](#approval-status-flow)
3. [Key Features](#key-features)
4. [API Endpoints](#api-endpoints)
5. [Complete Workflow Example](#complete-workflow-example)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Overview

The Material Request Approval System manages the complete lifecycle of material requisitions from production staff, including validation, approval/rejection, and stock management. It provides:

- **Material Request Management**: Create and track material requisitions
- **Availability Checking**: Verify material stock before approval
- **Approval Workflow**: Approve or reject requests with full audit trail
- **Automatic Stock Deduction**: Optionally deduct materials from inventory on approval
- **Timeline Tracking**: Complete history of all status changes
- **Analytics**: Approval rates, rejection reasons, and material usage patterns

### Key Entities

- **MaterialRequest**: Main material requisition record
- **MaterialRequestStages**: Audit trail of approval status changes
- **RawItems**: Available raw materials inventory
- **RawItemTracker**: Tracks all material movements (additions/removals)
- **ProductForProduction**: Production order linked to the material request
- **Staff**: Personnel involved in requesting and approving

---

## Approval Status Flow

Material requests follow this status progression:

```
pending → approved (materials deducted from stock)
  ↓
pending → rejected
  ↓
pending/rejected → cancelled
```

### Status Descriptions

| Status | Description | Next Allowed Status |
|--------|-------------|---------------------|
| **pending** | Request submitted, awaiting approval | `approved`, `rejected`, `cancelled` |
| **approved** | Request approved, materials assigned | None (terminal) |
| **rejected** | Request rejected by approver | `cancelled` |
| **cancelled** | Request cancelled by requester | None (terminal) |

---

## Key Features

### 1. Material Availability Checking

Before approving a request, the system automatically checks if sufficient materials are available in stock.

### 2. Automatic Stock Deduction

When a request is approved, materials are automatically:
- Deducted from raw items inventory
- Tracked in the raw item tracker with `isAdded: false`
- Linked to the approving staff member

### 3. Complete Audit Trail

Every status change is recorded in `MaterialRequestStages` with:
- Staff who made the change
- Timestamp of the change
- Notes or reasons for the action

### 4. Requester Tracking

Each request is linked to a requester (staff member) for accountability and reporting.

---

## API Endpoints

### 1. Create Material Request with Validation

Create a new material request with automatic validation.

**Endpoint**: `POST /material-requests/create-with-validation`

**Request Body**:
```json
{
  "productionId": 5,
  "requesterId": 10,
  "materials": [
    {
      "item_id": 3,
      "qty": 50
    },
    {
      "item_id": 7,
      "qty": 25
    }
  ],
  "quantity": [
    {
      "size": 8,
      "quantity": 10
    },
    {
      "size": 10,
      "quantity": 5
    }
  ]
}
```

**Validation Performed**:
- Production order exists
- Requester (staff) exists
- All materials exist in raw items table

**Response**:
```json
{
  "id": 1,
  "productionId": 5,
  "requesterId": 10,
  "materials": [...],
  "quantity": [...],
  "approvalStatus": "pending",
  "isAssigned": false,
  "requestDate": "2025-01-15T10:00:00.000Z",
  "production": {...},
  "materialRequestStages": [
    {
      "id": 1,
      "status": "pending",
      "staffId": 10,
      "notes": "Material request submitted",
      "stageDate": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**What Happens**:
1. Validates production order exists
2. Validates requester exists
3. Validates all materials exist
4. Creates material request with status "pending"
5. Creates initial stage record
6. Sets `isAssigned` to false

---

### 2. Check Material Availability

Check if requested materials are available in stock before submitting a request.

**Endpoint**: `POST /material-requests/check-availability`

**Request Body**:
```json
{
  "materials": [
    {
      "item_id": 3,
      "qty": 50
    },
    {
      "item_id": 7,
      "qty": 25
    }
  ]
}
```

**Response**:
```json
{
  "allAvailable": false,
  "materials": [
    {
      "itemId": 3,
      "itemName": "Cotton Fabric - White",
      "itemCode": "RAW-0003",
      "requestedQty": 50,
      "availableQty": 100,
      "isAvailable": true,
      "shortage": 0
    },
    {
      "itemId": 7,
      "itemName": "Thread - Black",
      "itemCode": "RAW-0007",
      "requestedQty": 25,
      "availableQty": 15,
      "isAvailable": false,
      "shortage": 10
    }
  ],
  "summary": {
    "totalItems": 2,
    "availableItems": 1,
    "unavailableItems": 1
  }
}
```

**Use Case**: Use this endpoint before creating a material request to verify availability.

---

### 3. Approve Material Request

Approve a pending material request and optionally deduct materials from stock.

**Endpoint**: `POST /material-requests/:id/approve`

**Request Body**:
```json
{
  "approverId": 15,
  "deductFromStock": true,
  "notes": "Approved for urgent production order"
}
```

**Fields**:
- `approverId`: Staff ID of the approver
- `deductFromStock` (optional): Whether to deduct materials (default: true)
- `notes` (optional): Approval notes

**Requirements**:
- Request status must be "pending"
- Approver must exist
- All materials must be available in sufficient quantity

**Response**: Updated material request with status "approved"

**What Happens**:
1. Verifies approver exists
2. Checks request is in "pending" status
3. Verifies all materials are available
4. If `deductFromStock` is true:
   - Deducts quantity from each raw item
   - Creates raw item tracker records (isAdded: false)
5. Updates request status to "approved"
6. Sets `approverId`, `approveDate`, and `isAssigned`
7. Creates approval stage record

**Error Cases**:
```json
{
  "statusCode": 400,
  "message": "Insufficient materials: Thread - Black (need 10 more)"
}
```

---

### 4. Reject Material Request

Reject a pending material request with a reason.

**Endpoint**: `POST /material-requests/:id/reject`

**Request Body**:
```json
{
  "rejectedBy": 15,
  "reason": "Materials needed for higher priority order",
  "notes": "Please resubmit after completing Order #123"
}
```

**Requirements**:
- Request status must be "pending"
- Rejecting staff must exist

**Response**: Updated material request with status "rejected"

**What Happens**:
1. Verifies staff exists
2. Checks request is in "pending" status
3. Updates request status to "rejected"
4. Creates rejection stage record with reason

---

### 5. Cancel Material Request

Cancel a material request (cannot cancel approved requests).

**Endpoint**: `POST /material-requests/:id/cancel`

**Request Body**:
```json
{
  "cancelledBy": 10,
  "reason": "Production order changed",
  "notes": "Will submit new request with updated requirements"
}
```

**Requirements**:
- Request status must NOT be "approved"
- Cancelling staff must exist

**Response**: Updated material request with status "cancelled"

**What Happens**:
1. Verifies staff exists
2. Checks request is not "approved"
3. Updates request status to "cancelled"
4. Creates cancellation stage record

**Note**: Approved requests cannot be cancelled because materials have already been deducted from stock.

---

### 6. Get Pending Material Requests

Retrieve all material requests awaiting approval.

**Endpoint**: `GET /material-requests/pending`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `GET /material-requests/pending?page=1&limit=20`

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "productionId": 5,
      "requesterId": 10,
      "materials": [...],
      "approvalStatus": "pending",
      "requestDate": "2025-01-15T10:00:00.000Z",
      "production": {...},
      "materialRequestStages": [...]
    },
    ...
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Use Case**: Display all pending requests to approvers in a dashboard.

---

### 7. Get Material Request Timeline

Retrieve the complete approval history for a material request.

**Endpoint**: `GET /material-requests/:id/timeline`

**Response**:
```json
{
  "requestId": 1,
  "productionId": 5,
  "requesterId": 10,
  "currentStatus": "approved",
  "timeline": [
    {
      "status": "pending",
      "staffName": "John Requester",
      "notes": "Material request submitted",
      "date": "2025-01-15T10:00:00.000Z"
    },
    {
      "status": "approved",
      "staffName": "Mary Approver",
      "notes": "Approved - Materials deducted from stock",
      "date": "2025-01-15T14:30:00.000Z"
    }
  ]
}
```

**Use Case**: Audit trail for investigating approval delays or tracking accountability.

---

### 8. Get Requester's Material Requests

Retrieve all material requests submitted by a specific staff member.

**Endpoint**: `GET /material-requests/requester/:requesterId`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `GET /material-requests/requester/10?page=1&limit=10`

**Response**:
```json
{
  "requester": {
    "id": 10,
    "staffName": "John Requester"
  },
  "requests": [
    {
      "id": 1,
      "productionId": 5,
      "approvalStatus": "approved",
      "requestDate": "2025-01-15T10:00:00.000Z",
      "approveDate": "2025-01-15T14:30:00.000Z",
      "materialCount": 2,
      "isAssigned": true
    },
    ...
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

**Use Case**: Track individual staff member's request history and approval rates.

---

### 9. Get Material Request Analytics

Retrieve analytics and insights for a date range.

**Endpoint**: `GET /material-requests/analytics`

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Example**: `GET /material-requests/analytics?startDate=2025-01-01&endDate=2025-01-31`

**Response**:
```json
{
  "period": "2025-01-01 to 2025-01-31",
  "totalRequests": 120,
  "byStatus": {
    "pending": 25,
    "approved": 80,
    "rejected": 10,
    "cancelled": 5
  },
  "approvalRate": "66.7",
  "rejectionRate": "8.3",
  "avgApprovalTime": "4.5 hours",
  "topMaterials": [
    {
      "itemId": 3,
      "requestCount": 45,
      "totalQuantity": 2250
    },
    ...
  ]
}
```

**Metrics Provided**:
- Total requests by status
- Approval and rejection rates
- Average time to approve
- Most requested materials

---

## Complete Workflow Example

### Scenario: Production staff needs materials for a new order

#### Step 1: Check Material Availability

```bash
POST /material-requests/check-availability
{
  "materials": [
    {"item_id": 3, "qty": 50},
    {"item_id": 7, "qty": 25}
  ]
}
```

**Result**: All materials available

#### Step 2: Create Material Request

```bash
POST /material-requests/create-with-validation
{
  "productionId": 5,
  "requesterId": 10,
  "materials": [
    {"item_id": 3, "qty": 50},
    {"item_id": 7, "qty": 25}
  ],
  "quantity": [
    {"size": 8, "quantity": 10}
  ]
}
```

**Status**: pending

#### Step 3: Approver Reviews Pending Requests

```bash
GET /material-requests/pending
```

**Result**: List of all pending requests including the new one

#### Step 4: Approve Material Request

```bash
POST /material-requests/1/approve
{
  "approverId": 15,
  "deductFromStock": true,
  "notes": "Approved for Order #5"
}
```

**Status**: approved → Materials deducted from stock

#### Step 5: View Approval Timeline

```bash
GET /material-requests/1/timeline
```

**Result**: Complete history showing submission and approval

---

## Error Handling

### Common Errors

#### 1. Insufficient Materials
```json
{
  "statusCode": 400,
  "message": "Insufficient materials: Cotton Fabric - White (need 25 more), Thread - Black (need 10 more)"
}
```

**Solution**: Wait for stock replenishment or reduce requested quantity

#### 2. Invalid Status for Action
```json
{
  "statusCode": 400,
  "message": "Material request can only be approved when status is 'pending'. Current status: approved"
}
```

**Solution**: Check current status before attempting action

#### 3. Cannot Cancel Approved Request
```json
{
  "statusCode": 400,
  "message": "Cannot cancel approved material requests"
}
```

**Solution**: Approved requests cannot be cancelled because materials have been deducted

#### 4. Production Not Found
```json
{
  "statusCode": 404,
  "message": "Production with ID 999 not found"
}
```

**Solution**: Verify production order exists before creating request

#### 5. Staff Not Found
```json
{
  "statusCode": 404,
  "message": "Requester with ID 999 not found"
}
```

**Solution**: Verify staff ID is correct

---

## Best Practices

### 1. Always Check Availability First

Before creating a material request, use the availability checker:

```bash
POST /material-requests/check-availability
```

This prevents creating requests that will be rejected due to insufficient materials.

### 2. Use Create with Validation

Always use `POST /material-requests/create-with-validation` instead of the standard create endpoint to ensure:
- Production order exists
- Requester exists
- All materials exist
- Initial stage record is created

### 3. Monitor Pending Requests

Regularly check pending requests to avoid delays:

```bash
GET /material-requests/pending
```

Set up alerts for requests pending longer than a threshold (e.g., 24 hours).

### 4. Provide Clear Rejection Reasons

When rejecting requests, always provide clear, actionable reasons:

```json
{
  "reason": "Materials allocated to higher priority Order #123",
  "notes": "Please resubmit after Order #123 completes (Est. 3 days)"
}
```

### 5. Track Approval Metrics

Regularly review analytics to identify:
- Approval bottlenecks
- Frequently rejected requests
- High-demand materials
- Slow approval times

```bash
GET /material-requests/analytics?startDate=2025-01-01&endDate=2025-01-31
```

### 6. Use Timeline for Auditing

When investigating issues, always check the timeline:

```bash
GET /material-requests/:id/timeline
```

This provides complete accountability and helps identify process improvements.

### 7. Implement Role-Based Access

Restrict endpoint access based on staff roles:
- **Production Staff**: Create requests, check availability, view their requests
- **Approvers**: Approve/reject requests, view pending requests
- **Management**: View analytics, access all requests

### 8. Handle Stock Deduction Carefully

When approving, carefully consider the `deductFromStock` option:
- `true` (default): Deduct immediately - use for normal workflow
- `false`: Don't deduct - use for special cases (e.g., materials from external source)

### 9. Set Approval Thresholds

Consider implementing automatic approval for small quantities:
- Requests under a threshold → Auto-approve
- Requests over threshold → Require manual approval

### 10. Monitor Material Usage Patterns

Use analytics to identify:
- Frequently requested materials → Keep higher stock levels
- Rarely requested materials → Reduce stock levels
- Peak request periods → Plan stock accordingly

---

## Integration with Other Modules

### Production Module

Material requests are linked to production orders:
```bash
GET /product-for-productions/:id
```

Shows which material requests are associated with a production order.

### Raw Items Module

Material availability is checked against raw items inventory:
```bash
GET /raw-items/:id
```

View current stock levels before creating requests.

### Raw Item Tracker

All material movements are tracked:
```bash
GET /raw-item-trackers?itemId=3
```

View complete history of additions and removals for a material.

---

## Database Schema

### MaterialRequest Table
```sql
material_request (
  id INT PRIMARY KEY,
  production_id INT,
  requester_id INT,
  materials JSONB, -- [{item_id, qty}]
  quantity JSONB, -- [{size, quantity}]
  approver_id INT,
  request_date TIMESTAMP,
  approve_date TIMESTAMP,
  is_assigned BOOLEAN,
  approval_status VARCHAR -- 'pending', 'approved', 'rejected', 'cancelled'
)
```

### MaterialRequestStages Table
```sql
material_request_stages (
  id INT PRIMARY KEY,
  material_request_id INT,
  staff_id INT,
  status VARCHAR, -- 'pending', 'approved', 'rejected', 'cancelled'
  notes TEXT,
  stage_date TIMESTAMP
)
```

### RawItems Table
```sql
raw_items (
  id INT PRIMARY KEY,
  type_id INT,
  quantity INT, -- Current stock level
  name VARCHAR,
  code VARCHAR,
  description VARCHAR
)
```

### RawItemTracker Table
```sql
raw_item_tracker (
  id INT PRIMARY KEY,
  item_id INT,
  staff_id INT,
  quantity INT,
  is_added BOOLEAN, -- true for additions, false for removals
  tracker_date TIMESTAMP
)
```

---

## Troubleshooting

### Request Stuck in Pending

**Problem**: Material request created but not being approved

**Solution**:
1. Check if it's in pending requests:
   ```bash
   GET /material-requests/pending
   ```
2. Review timeline for any status changes:
   ```bash
   GET /material-requests/:id/timeline
   ```
3. Verify materials are available:
   ```bash
   POST /material-requests/check-availability
   ```

### Materials Not Deducted

**Problem**: Request approved but materials not deducted from stock

**Solution**:
1. Check if `deductFromStock` was set to false
2. Review raw item tracker:
   ```bash
   GET /raw-item-trackers?itemId=:id
   ```
3. Manually adjust if necessary

### Wrong Approval Status

**Problem**: Request shows wrong status

**Solution**:
1. Check timeline for actual status history:
   ```bash
   GET /material-requests/:id/timeline
   ```
2. Do not manually update status - use proper endpoints

### Cannot Approve - Insufficient Materials

**Problem**: Approval fails due to insufficient materials

**Solution**:
1. Check current material levels:
   ```bash
   GET /raw-items/:id
   ```
2. Either:
   - Add more materials to stock
   - Reduce requested quantity in a new request
   - Reject current request and create new one later

---

## API Response Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Material request created successfully |
| 400 | Bad Request | Invalid status, insufficient materials, validation failed |
| 404 | Not Found | Material request, staff, or production not found |
| 500 | Server Error | Database error, internal error |

---

## Conclusion

The Material Request Approval System provides a complete solution for managing material requisitions with:

- **Automated Validation**: Verify production, staff, and materials exist
- **Stock Management**: Automatic deduction and tracking
- **Complete Audit Trail**: Every action is recorded with staff and timestamp
- **Flexible Workflow**: Approve, reject, or cancel with full control
- **Analytics & Reporting**: Track approval rates, material usage, and performance

For questions or issues, refer to:
- [Entity Relationships Guide](./ENTITY_RELATIONSHIPS.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Production Workflow Guide](./PRODUCTION_WORKFLOW_GUIDE.md)
- [Invoice Workflow Guide](./INVOICE_WORKFLOW_GUIDE.md)
