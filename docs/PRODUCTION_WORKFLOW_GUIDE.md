# Production Workflow API Guide

## Overview

This guide covers all production workflow endpoints that manage the complete lifecycle of fashion product manufacturing from assignment to stock.

**Base Route:** `/productions`

---

## Table of Contents

1. [Production Code Generation](#production-code-generation)
2. [Assign to Tailor](#assign-to-tailor)
3. [Update Production Stage](#update-production-stage)
4. [QA Review](#qa-review)
5. [Move to Stock](#move-to-stock)
6. [Tailor Workload](#tailor-workload)
7. [Batch Update](#batch-update)
8. [Production Analytics](#production-analytics)
9. [Complete Workflow Example](#complete-workflow-example)

---

## Production Code Generation

### Generate Production Code

```http
POST /productions/generate-code
```

Generates a unique production code following the format: `[PROD_CODE(4)][SIZE(2)][YEAR(2)][MONTH(2)][SERIAL(3)]`

**Request Body:**
```json
{
  "productCode": "SHRT",
  "sizeId": 8
}
```

**Validation:**
- `productCode`: Exactly 4 characters
- `sizeId`: Number (positive integer)

**Response:** `200 OK`
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

**Code Format Explanation:**
- `SHRT` - Product code (4 chars)
- `08` - Size (2 digits)
- `25` - Year 2025 (last 2 digits)
- `01` - Month January (2 digits)
- `001` - Random serial number (3 digits)

**Usage:**
```bash
curl -X POST http://localhost:3000/productions/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "SHRT",
    "sizeId": 8
  }'
```

---

## Assign to Tailor

### Assign Production to Tailor

```http
POST /productions/:id/assign
```

Assigns a production unit to a specific tailor. Automatically moves production from "Bidding" to "in production" stage.

**Path Parameters:**
- `id` - Production ID

**Request Body:**
```json
{
  "tailorId": 10,
  "priority": "high",
  "deadline": "2025-02-15",
  "notes": "Urgent order, needs completion by Friday"
}
```

**Validation:**
- `tailorId`: Required, number (must exist in Staff table)
- `priority`: Optional, one of: "low", "medium", "high"
- `deadline`: Optional, ISO date string
- `notes`: Optional, string

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "SHRT082501001",
  "prodRequestedId": 1,
  "productInfo": {
    "name": "Formal Shirt",
    "size": 8,
    "details": "White formal shirt with long sleeves"
  },
  "tailorId": 10,
  "assignDate": "2025-01-15T10:30:00Z",
  "stage": "in production",
  "materialRequest": {...},
  "productionStages": [
    {
      "id": 1,
      "productionId": 1,
      "stateName": "in production",
      "staffId": 10,
      "changeDate": "2025-01-15T10:30:00Z",
      "description": "Production assigned to tailor"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Production or tailor not found
- `400 Bad Request` - Validation errors

**Usage:**
```bash
curl -X POST http://localhost:3000/productions/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "tailorId": 10,
    "priority": "high",
    "notes": "Urgent production"
  }'
```

---

## Update Production Stage

### Update Stage with Tracking

```http
POST /productions/:id/update-stage
```

Updates production stage and creates a stage history record for tracking.

**Path Parameters:**
- `id` - Production ID

**Request Body:**
```json
{
  "stage": "Await QA",
  "staffId": 3,
  "notes": "Production completed, ready for quality inspection",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

**Validation:**
- `stage`: Required, one of: "in production", "Bidding", "Await QA", "Rejected", "Completed"
- `staffId`: Required, number
- `notes`: Optional, string
- `images`: Optional, array of strings (URLs)

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "SHRT082501001",
  "stage": "Await QA",
  "productionStages": [
    {
      "id": 1,
      "stateName": "in production",
      "staffId": 10,
      "changeDate": "2025-01-15T10:30:00Z",
      "description": "Production assigned to tailor"
    },
    {
      "id": 2,
      "stateName": "Await QA",
      "staffId": 3,
      "changeDate": "2025-01-17T14:00:00Z",
      "description": "Production completed, ready for quality inspection"
    }
  ]
}
```

**Stage Progression:**
1. `Bidding` → Initial state
2. `in production` → Assigned to tailor
3. `Await QA` → Production completed, awaiting inspection
4. `Completed` → QA approved
5. `Rejected` → QA failed (can be reassigned)

**Usage:**
```bash
curl -X POST http://localhost:3000/productions/1/update-stage \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "Await QA",
    "staffId": 3,
    "notes": "Ready for inspection"
  }'
```

---

## QA Review

### Quality Assurance Review

```http
POST /productions/:id/qa-review
```

Performs quality assurance review and approves or rejects the production.

**Path Parameters:**
- `id` - Production ID

**Request Body (Approved):**
```json
{
  "qaStaffId": 3,
  "status": "approved",
  "defects": [],
  "notes": "Quality check passed, excellent work"
}
```

**Request Body (Rejected):**
```json
{
  "qaStaffId": 3,
  "status": "rejected",
  "defects": ["Uneven stitching on collar", "Button alignment issue"],
  "notes": "Needs rework"
}
```

**Validation:**
- `qaStaffId`: Required, number
- `status`: Required, one of: "approved", "rejected"
- `defects`: Optional, array of strings
- `notes`: Optional, string

**Response (Approved):** `200 OK`
```json
{
  "id": 1,
  "code": "SHRT082501001",
  "stage": "Completed",
  "productionStages": [
    ...
    {
      "id": 3,
      "stateName": "Completed",
      "staffId": 3,
      "changeDate": "2025-01-17T16:00:00Z",
      "description": "QA Approved: Quality check passed, excellent work"
    }
  ]
}
```

**Response (Rejected):** `200 OK`
```json
{
  "id": 1,
  "code": "SHRT082501001",
  "stage": "Rejected",
  "productionStages": [
    ...
    {
      "id": 3,
      "stateName": "Rejected",
      "staffId": 3,
      "changeDate": "2025-01-17T16:00:00Z",
      "description": "QA Rejected: Uneven stitching on collar, Button alignment issue"
    }
  ]
}
```

**Usage:**
```bash
# Approve
curl -X POST http://localhost:3000/productions/1/qa-review \
  -H "Content-Type: application/json" \
  -d '{
    "qaStaffId": 3,
    "status": "approved",
    "notes": "Perfect quality"
  }'

# Reject
curl -X POST http://localhost:3000/productions/1/qa-review \
  -H "Content-Type: application/json" \
  -d '{
    "qaStaffId": 3,
    "status": "rejected",
    "defects": ["Stitching issue"],
    "notes": "Needs rework"
  }'
```

---

## Move to Stock

### Move Completed Production to Stock

```http
POST /productions/:id/move-to-stock
```

Moves a completed production to product stock inventory. Only works for productions in "Completed" stage.

**Path Parameters:**
- `id` - Production ID

**Request Body:**
```json
{
  "pushedBy": 3,
  "receivedBy": 8,
  "location": "Warehouse A - Shelf B3",
  "notes": "High-quality finished product"
}
```

**Validation:**
- `pushedBy`: Required, number (staff ID who pushes from production)
- `receivedBy`: Required, number (staff ID who receives in warehouse)
- `location`: Optional, string
- `notes`: Optional, string

**Response:** `200 OK`
```json
{
  "production": {
    "id": 1,
    "code": "SHRT082501001",
    "stage": "Completed",
    ...
  },
  "stock": {
    "id": 1,
    "productDefId": 1,
    "productionCode": "SHRT082501001",
    "dateAdded": "2025-01-17T17:00:00Z",
    "pushedBy": 3,
    "receivedBy": 8,
    "productInfo": {
      "name": "Formal Shirt",
      "size": 8,
      "details": "White formal shirt with long sleeves"
    },
    "isAvailable": true
  }
}
```

**Business Rules:**
- Production must be in "Completed" stage
- Cannot move same production to stock twice
- Automatically creates stock entry with `isAvailable: true`
- Creates final production stage record

**Error Responses:**
- `400 Bad Request` - Production not completed
- `400 Bad Request` - Already in stock
- `400 Bad Request` - Cannot determine product definition
- `404 Not Found` - Staff not found

**Usage:**
```bash
curl -X POST http://localhost:3000/productions/1/move-to-stock \
  -H "Content-Type: application/json" \
  -d '{
    "pushedBy": 3,
    "receivedBy": 8,
    "location": "Warehouse A",
    "notes": "Excellent quality"
  }'
```

---

## Tailor Workload

### Get Tailor Workload and Performance

```http
GET /productions/tailor-workload/:tailorId
```

Retrieves comprehensive workload and performance metrics for a specific tailor.

**Path Parameters:**
- `tailorId` - Tailor staff ID

**Response:** `200 OK`
```json
{
  "tailorId": 10,
  "tailorName": "Ahmed Hassan",
  "activeProductions": 5,
  "totalAssigned": 50,
  "completed": 43,
  "rejected": 2,
  "avgCompletionTime": "3.8 days",
  "qualityScore": "95.6",
  "currentWorkload": [
    {
      "productionId": 15,
      "productionCode": "SHRT082501015",
      "productName": "Formal Shirt",
      "size": 8,
      "stage": "in production",
      "daysInProgress": 2
    },
    {
      "productionId": 18,
      "productionCode": "PANT102501018",
      "productName": "Formal Trousers",
      "size": 10,
      "stage": "Await QA",
      "daysInProgress": 4
    }
  ]
}
```

**Metrics Explained:**
- `activeProductions`: Productions in progress (in production, Bidding, Await QA)
- `totalAssigned`: All productions ever assigned
- `completed`: Successfully completed productions
- `rejected`: Productions rejected by QA
- `avgCompletionTime`: Average time from assignment to completion
- `qualityScore`: Percentage of completed vs rejected (100% = no rejections)
- `currentWorkload`: Detailed list of active productions

**Error Responses:**
- `404 Not Found` - Tailor not found

**Usage:**
```bash
curl http://localhost:3000/productions/tailor-workload/10
```

---

## Batch Update

### Batch Update Production Status

```http
POST /productions/batch-update
```

Updates multiple productions to the same stage simultaneously.

**Request Body:**
```json
{
  "productionIds": [1, 2, 3, 4, 5],
  "newStage": "Await QA",
  "staffId": 3,
  "notes": "Batch completed and sent for QA inspection"
}
```

**Validation:**
- `productionIds`: Required, array of numbers
- `newStage`: Required, one of: "in production", "Bidding", "Await QA", "Rejected", "Completed"
- `staffId`: Required, number
- `notes`: Required, string

**Response:** `200 OK`
```json
{
  "message": "Successfully updated 5 productions",
  "updated": [
    {
      "productionId": 1,
      "productionCode": "SHRT082501001",
      "previousStage": "in production",
      "newStage": "Await QA"
    },
    {
      "productionId": 2,
      "productionCode": "SHRT082501002",
      "previousStage": "in production",
      "newStage": "Await QA"
    },
    ...
  ]
}
```

**Business Rules:**
- All production IDs must exist
- Creates stage history record for each production
- Atomic operation - all succeed or all fail

**Error Responses:**
- `404 Not Found` - Staff not found
- `400 Bad Request` - Some production IDs not found

**Usage:**
```bash
curl -X POST http://localhost:3000/productions/batch-update \
  -H "Content-Type: application/json" \
  -d '{
    "productionIds": [1, 2, 3],
    "newStage": "Completed",
    "staffId": 3,
    "notes": "Batch QA approved"
  }'
```

---

## Production Analytics

### Get Production Analytics

```http
GET /productions/analytics?startDate=2025-01-01&endDate=2025-01-31
```

Retrieves comprehensive production analytics for a date range.

**Query Parameters:**
- `startDate` - Start date (ISO format: YYYY-MM-DD)
- `endDate` - End date (ISO format: YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "period": "2025-01-01 to 2025-01-31",
  "totalProductions": 150,
  "completed": 140,
  "inProgress": 8,
  "rejected": 2,
  "avgTimeToComplete": "4.2 days",
  "topTailors": [
    {
      "tailorId": 10,
      "completed": 45
    },
    {
      "tailorId": 12,
      "completed": 38
    },
    {
      "tailorId": 15,
      "completed": 32
    }
  ],
  "productBreakdown": [
    {
      "productName": "Formal Shirt",
      "quantity": 80,
      "percentage": "53.3"
    },
    {
      "productName": "Formal Trousers",
      "quantity": 45,
      "percentage": "30.0"
    },
    {
      "productName": "Blazer",
      "quantity": 25,
      "percentage": "16.7"
    }
  ]
}
```

**Analytics Explained:**
- `totalProductions`: Total productions assigned in date range
- `completed`: Successfully completed productions
- `inProgress`: Currently in production
- `rejected`: Rejected by QA
- `avgTimeToComplete`: Average days from assignment to completion
- `topTailors`: Best performing tailors by completion count
- `productBreakdown`: Production distribution by product type

**Usage:**
```bash
curl "http://localhost:3000/productions/analytics?startDate=2025-01-01&endDate=2025-01-31"
```

---

## Complete Workflow Example

### End-to-End Production Process

```bash
# Step 1: Generate production code
curl -X POST http://localhost:3000/productions/generate-code \
  -H "Content-Type: application/json" \
  -d '{"productCode":"SHRT","sizeId":8}'
# Response: { "code": "SHRT082501001", ... }

# Step 2: Create production
curl -X POST http://localhost:3000/productions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SHRT082501001",
    "prodRequestedId": 1,
    "productInfo": {
      "name": "Formal Shirt",
      "size": 8,
      "details": "White formal shirt"
    },
    "tailorId": 10,
    "stage": "Bidding"
  }'
# Response: { "id": 1, ... }

# Step 3: Assign to tailor
curl -X POST http://localhost:3000/productions/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "tailorId": 10,
    "priority": "high",
    "notes": "Urgent order"
  }'
# Stage automatically changes to "in production"

# Step 4: Update stage to Await QA
curl -X POST http://localhost:3000/productions/1/update-stage \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "Await QA",
    "staffId": 10,
    "notes": "Production completed"
  }'

# Step 5: QA Review (Approve)
curl -X POST http://localhost:3000/productions/1/qa-review \
  -H "Content-Type: application/json" \
  -d '{
    "qaStaffId": 3,
    "status": "approved",
    "notes": "Quality check passed"
  }'
# Stage changes to "Completed"

# Step 6: Move to stock
curl -X POST http://localhost:3000/productions/1/move-to-stock \
  -H "Content-Type: application/json" \
  -d '{
    "pushedBy": 3,
    "receivedBy": 8,
    "location": "Warehouse A"
  }'
# Creates stock entry, product available for sale

# Step 7: Check tailor performance
curl http://localhost:3000/productions/tailor-workload/10

# Step 8: View analytics
curl "http://localhost:3000/productions/analytics?startDate=2025-01-01&endDate=2025-01-31"
```

---

## Status Codes Reference

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful operation |
| 201 | Created | Production created |
| 400 | Bad Request | Validation error or business rule violation |
| 404 | Not Found | Production, staff, or resource not found |
| 500 | Internal Server Error | Server error |

---

## Best Practices

### Production Code Management
1. Always generate codes through the API (don't create manually)
2. Codes are unique and collision-checked
3. Store codes immediately after generation

### Stage Transitions
1. Follow proper stage progression
2. Always include meaningful notes
3. Track who made the change (staffId)

### QA Review
1. Document defects clearly for rejected items
2. Include specific feedback in notes
3. Review can only be done once per production

### Batch Operations
1. Use batch update for efficiency
2. Limit batch size to 100 productions
3. Always include descriptive notes

### Analytics
1. Use reasonable date ranges (max 1 year)
2. Query during off-peak hours for large datasets
3. Cache results for frequently accessed periods

---

## Common Scenarios

### Scenario 1: Rush Order
```bash
# Generate code with high priority
POST /productions/generate-code
POST /productions (create with Bidding stage)
POST /productions/:id/assign (with priority: "high")
# Monitor with GET /productions/tailor-workload/:tailorId
```

### Scenario 2: Batch Production
```bash
# Create multiple productions
# Assign all to same tailor or distribute
POST /productions/batch-update (move all to Await QA together)
POST /productions/batch-update (QA approve all)
# Batch move to stock
```

### Scenario 3: Quality Issue
```bash
POST /productions/:id/qa-review (status: "rejected")
POST /productions/:id/update-stage (back to "in production")
POST /productions/:id/assign (reassign to tailor)
```

---

## Troubleshooting

### Issue: Can't move to stock
**Cause:** Production not in "Completed" stage
**Solution:** Run QA review with status "approved" first

### Issue: Batch update fails
**Cause:** One or more production IDs don't exist
**Solution:** Verify all IDs exist before batch update

### Issue: Invalid production code
**Cause:** Manual code creation with wrong format
**Solution:** Always use /generate-code endpoint

---

**Production workflow endpoints ready! 🎉**
