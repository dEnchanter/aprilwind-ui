# Production Orders & Reports Consolidation Guide

This comprehensive guide covers two major business intelligence features:
1. **Production Order Workflow** - Customer-to-production order management
2. **Reports Consolidation** - Comprehensive business intelligence and analytics

## Table of Contents

1. [Production Order Workflow](#production-order-workflow)
   - [Overview](#overview)
   - [Order Lifecycle](#order-lifecycle)
   - [API Endpoints](#production-order-api-endpoints)
   - [Use Cases](#production-order-use-cases)
2. [Reports Consolidation](#reports-consolidation)
   - [Available Reports](#available-reports)
   - [Report Endpoints](#report-endpoints)
   - [Data Insights](#data-insights)
3. [Integration](#integration)
4. [Examples](#examples)
5. [Best Practices](#best-practices)

---

## Production Order Workflow

### Overview

The Production Order system bridges the gap between customers and production, enabling you to manage custom orders from customers that require production. This is separate from standard invoices and provides a complete workflow for custom garment orders.

**Key Features:**
- Links customers directly to production
- Complete order lifecycle tracking
- Cost estimation and agreement
- Delivery date management
- Priority handling (low, normal, high, urgent)
- Full audit trail with stage tracking

**Workflow States:**
```
pending → approved → in_production → completed → delivered
          ↓
       rejected
          ↓
       cancelled (from any non-final state)
```

### Order Lifecycle

#### 1. Order Received (`pending`)
Customer places a production order with specifications.

**Data Captured:**
- Customer information
- Order details (products, sizes, quantities, specifications)
- Estimated costs
- Expected delivery date
- Priority level
- Special requirements/notes

#### 2. Order Review (`pending → approved/rejected`)
Management reviews and approves or rejects the order.

**On Approval:**
- Agreed total cost is set
- Expected delivery date confirmed
- Order moves to `approved` status

**On Rejection:**
- Reason is documented
- Order moves to `rejected` status
- No further processing

#### 3. Production Assignment (`approved → in_production`)
Approved order is assigned to a production unit.

**Actions:**
- Link to existing production (Production entity)
- Track assignment in stages
- Order moves to `in_production` status

#### 4. Production Completion (`in_production → completed`)
Production is finished and ready for delivery.

**Actions:**
- Quality checks complete
- Products ready
- Order moves to `completed` status

#### 5. Delivery (`completed → delivered`)
Order is delivered to customer.

**Actions:**
- Actual delivery date recorded
- Customer confirmation
- Order moves to `delivered` status (final)

#### 6. Cancellation (any state → `cancelled`)
Order can be cancelled before delivery.

**Rules:**
- Cannot cancel `delivered` orders
- Cannot cancel already `cancelled` orders
- Reason must be provided
- Full audit trail maintained

### Production Order API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/production-orders` | List all orders (paginated) |
| POST | `/production-orders` | Create new order (basic) |
| POST | `/production-orders/create-with-validation` | Create order with full validation |
| GET | `/production-orders/generate-number` | Generate next order number |
| GET | `/production-orders/analytics` | Get order analytics |
| GET | `/production-orders/status/:status` | Get orders by status |
| GET | `/production-orders/customer/:customerId` | Get customer's orders |
| GET | `/production-orders/:id` | Get order details |
| GET | `/production-orders/:id/timeline` | Get order workflow history |
| POST | `/production-orders/:id/approve` | Approve order |
| POST | `/production-orders/:id/reject` | Reject order |
| POST | `/production-orders/:id/assign-to-production` | Assign to production |
| POST | `/production-orders/:id/complete` | Mark as completed |
| POST | `/production-orders/:id/deliver` | Mark as delivered |
| POST | `/production-orders/:id/cancel` | Cancel order |
| PATCH | `/production-orders/:id` | Update order details |
| DELETE | `/production-orders/:id` | Delete order |

### Production Order Use Cases

#### Use Case 1: Customer Places Custom Order

**Scenario:** A customer wants 50 custom shirts with specific embroidery.

```bash
POST /production-orders/create-with-validation
{
  "customerId": 12,
  "orderDetails": [
    {
      "productName": "Custom Polo Shirt",
      "size": 12,
      "quantity": 50,
      "specifications": "Navy blue with company logo embroidered on left chest. Logo dimensions: 3x3 inches. High-quality cotton blend.",
      "estimatedCost": 2500
    }
  ],
  "receivedBy": 5,
  "expectedDeliveryDate": "2025-02-15",
  "priority": "normal",
  "notes": "Customer requested sample before full production"
}
```

**Response:**
```json
{
  "id": 1,
  "orderNo": "PO-202501-00001",
  "customerId": 12,
  "customer": {
    "id": 12,
    "name": "ABC Corporation",
    "address": "123 Business St",
    "country": "USA"
  },
  "orderDetails": [
    {
      "productName": "Custom Polo Shirt",
      "size": 12,
      "quantity": 50,
      "specifications": "Navy blue with company logo...",
      "estimatedCost": 2500
    }
  ],
  "status": "pending",
  "estimatedTotalCost": 125000,
  "expectedDeliveryDate": "2025-02-15",
  "priority": "normal",
  "notes": "Customer requested sample before full production",
  "orderDate": "2025-01-06T10:00:00Z",
  "receiver": {
    "id": 5,
    "staffName": "Jane Doe"
  },
  "orderStages": [
    {
      "status": "pending",
      "staffName": "Jane Doe",
      "stageDate": "2025-01-06T10:00:00Z",
      "notes": "Production order received from customer"
    }
  ]
}
```

#### Use Case 2: Approve Order with Negotiated Price

**Scenario:** Management reviews the order and approves with agreed pricing.

```bash
POST /production-orders/1/approve
{
  "approvedBy": 3,
  "agreedTotalCost": 130000,
  "expectedDeliveryDate": "2025-02-20",
  "notes": "Approved with 10-day sample review period"
}
```

**Response:**
```json
{
  "id": 1,
  "orderNo": "PO-202501-00001",
  "status": "approved",
  "estimatedTotalCost": 125000,
  "agreedTotalCost": 130000,
  "approvedBy": 3,
  "approver": {
    "id": 3,
    "staffName": "Mike Johnson"
  },
  "expectedDeliveryDate": "2025-02-20",
  "orderStages": [
    {
      "status": "pending",
      "staffName": "Jane Doe",
      "stageDate": "2025-01-06T10:00:00Z",
      "notes": "Production order received from customer"
    },
    {
      "status": "approved",
      "staffName": "Mike Johnson",
      "stageDate": "2025-01-06T11:30:00Z",
      "notes": "Approved with 10-day sample review period"
    }
  ]
}
```

#### Use Case 3: Assign to Production

**Scenario:** Order is assigned to a production line.

```bash
POST /production-orders/1/assign-to-production
{
  "productionId": 45,
  "assignedBy": 3,
  "notes": "Assigned to Production Line A - Start after sample approval"
}
```

#### Use Case 4: Track Order Status

**Scenario:** Customer service checks order status.

```bash
GET /production-orders/1/timeline
```

**Response:**
```json
{
  "orderId": 1,
  "orderNo": "PO-202501-00001",
  "currentStatus": "in_production",
  "customer": {
    "id": 12,
    "name": "ABC Corporation"
  },
  "timeline": [
    {
      "status": "pending",
      "performedBy": "Jane Doe",
      "date": "2025-01-06T10:00:00Z",
      "notes": "Production order received from customer"
    },
    {
      "status": "approved",
      "performedBy": "Mike Johnson",
      "date": "2025-01-06T11:30:00Z",
      "notes": "Approved with agreed cost: 130000"
    },
    {
      "status": "in_production",
      "performedBy": "Mike Johnson",
      "date": "2025-01-07T08:00:00Z",
      "notes": "Assigned to production #PR-202501-00045"
    }
  ],
  "orderDate": "2025-01-06T10:00:00Z",
  "expectedDeliveryDate": "2025-02-20",
  "actualDeliveryDate": null
}
```

#### Use Case 5: Analytics and Reporting

**Scenario:** Management reviews production order performance.

```bash
GET /production-orders/analytics
```

**Response:**
```json
{
  "totalOrders": 87,
  "byStatus": {
    "pending": 12,
    "approved": 8,
    "in_production": 15,
    "completed": 8,
    "delivered": 42,
    "rejected": 2,
    "cancelled": 0
  },
  "byPriority": {
    "low": 10,
    "normal": 65,
    "high": 10,
    "urgent": 2
  },
  "revenue": {
    "completed": "6,500,000",
    "pending": "1,250,000"
  },
  "deliveryPerformance": {
    "totalDelivered": 42,
    "onTimeDeliveries": 38,
    "lateDeliveries": 4,
    "onTimeRate": "90.5%"
  }
}
```

---

## Reports Consolidation

### Overview

The Reports system provides comprehensive business intelligence by consolidating data from all modules into actionable insights. All reports support optional date filtering for period-based analysis.

**Key Benefits:**
- Single source of truth for business metrics
- Cross-module data aggregation
- Performance tracking and KPIs
- Trend analysis
- Decision support

### Available Reports

#### 1. Production Report
**Endpoint:** `GET /reports/production?startDate=2025-01-01&endDate=2025-01-31`

**Insights:**
- Production volume and completion rates
- Average production time
- Tailor/staff performance
- Stage distribution
- Quality metrics

**Use For:**
- Production efficiency analysis
- Resource allocation
- Performance reviews
- Process optimization

#### 2. Sales and Revenue Report
**Endpoint:** `GET /reports/sales?startDate=2025-01-01&endDate=2025-01-31`

**Insights:**
- Total revenue by status
- Top customers by spending
- Sales trends over time
- Average order value
- Revenue forecasting data

**Use For:**
- Financial planning
- Sales performance tracking
- Customer value analysis
- Growth tracking

#### 3. Inventory Report
**Endpoint:** `GET /reports/inventory`

**Insights:**
- Stock levels by product
- Turnover rates
- Low stock alerts
- Size distribution
- Out of stock products

**Use For:**
- Inventory management
- Reorder planning
- Product performance
- Space optimization

#### 4. Material Usage Report
**Endpoint:** `GET /reports/materials?startDate=2025-01-01&endDate=2025-01-31`

**Insights:**
- Material consumption rates
- Top used materials
- Addition vs. removal trends
- Low stock materials
- Cost tracking (when recorded)

**Use For:**
- Material planning
- Cost control
- Supplier negotiations
- Waste reduction

#### 5. Customer Report
**Endpoint:** `GET /reports/customers`

**Insights:**
- Customer spending analysis
- Order frequency
- Customer segmentation (by type, country)
- Top customers
- Lifetime value

**Use For:**
- Customer relationship management
- Marketing campaigns
- Credit decisions
- Service prioritization

#### 6. Production Order Report
**Endpoint:** `GET /reports/production-orders?startDate=2025-01-01&endDate=2025-01-31`

**Insights:**
- Order status distribution
- Priority distribution
- Revenue from custom orders
- Delivery performance
- Processing time

**Use For:**
- Custom order management
- Capacity planning
- Customer satisfaction tracking
- Process improvement

#### 7. Staff Performance Report
**Endpoint:** `GET /reports/staff`

**Insights:**
- Activity levels by staff member
- Performance across modules
- Role distribution
- Workload balance

**Use For:**
- Performance reviews
- Workload distribution
- Training needs identification
- Productivity improvement

#### 8. Comprehensive Business Report
**Endpoint:** `GET /reports/business?startDate=2025-01-01&endDate=2025-01-31`

**Insights:**
- All key metrics in one view
- Cross-module summary
- Executive dashboard data
- High-level KPIs

**Use For:**
- Executive reporting
- Board presentations
- Strategic planning
- Quick business overview

### Report Endpoints

| Endpoint | Query Params | Description |
|----------|--------------|-------------|
| `/reports/production` | startDate, endDate | Production performance metrics |
| `/reports/sales` | startDate, endDate | Sales and revenue analysis |
| `/reports/inventory` | - | Current inventory status |
| `/reports/materials` | startDate, endDate | Material usage and costs |
| `/reports/customers` | - | Customer analytics |
| `/reports/production-orders` | startDate, endDate | Custom order analytics |
| `/reports/staff` | - | Staff performance metrics |
| `/reports/business` | startDate, endDate | Comprehensive business report |

### Data Insights

#### Production Report Example

```bash
GET /reports/production?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "summary": {
    "totalProductions": 45,
    "completed": 38,
    "inProgress": 5,
    "awaitingQA": 2,
    "rejected": 0,
    "completionRate": "84.4%"
  },
  "byStage": {
    "Completed": 38,
    "in production": 5,
    "Await QA": 2
  },
  "performance": {
    "averageProductionTime": "12.5 days",
    "tailorPerformance": [
      {
        "tailorId": 7,
        "total": 15,
        "completed": 13,
        "inProgress": 2
      },
      {
        "tailorId": 9,
        "total": 12,
        "completed": 10,
        "inProgress": 2
      }
    ]
  }
}
```

#### Sales Report Example

```bash
GET /reports/sales?startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "summary": {
    "totalInvoices": 67,
    "totalRevenue": "4,250,000",
    "averageOrderValue": "63,432"
  },
  "revenueByStatus": {
    "paid": { "count": 35, "revenue": 2200000 },
    "delivered": { "count": 20, "revenue": 2050000 },
    "open": { "count": 12, "revenue": 0 }
  },
  "topCustomers": [
    {
      "customerId": 12,
      "customerName": "ABC Corporation",
      "revenue": "850,000",
      "orderCount": 15,
      "averageOrderValue": "56,667"
    },
    {
      "customerId": 8,
      "customerName": "XYZ Retailers",
      "revenue": "620,000",
      "orderCount": 10,
      "averageOrderValue": "62,000"
    }
  ],
  "salesTrend": [
    { "month": "2025-01", "count": 67, "revenue": 4250000 }
  ]
}
```

#### Customer Report Example

```bash
GET /reports/customers
```

**Response:**
```json
{
  "summary": {
    "totalCustomers": 145,
    "activeCustomers": 87,
    "totalRevenue": "12,450,000"
  },
  "topCustomers": [
    {
      "customerId": 12,
      "customerName": "ABC Corporation",
      "customerType": "resellers",
      "totalInvoices": 45,
      "totalProductionOrders": 8,
      "totalSpending": "2,850,000",
      "averageOrderValue": "63,333",
      "country": "USA"
    }
  ],
  "distribution": {
    "byType": {
      "resellers": 95,
      "direct": 50
    },
    "byCountry": {
      "USA": 80,
      "UK": 35,
      "Canada": 30
    }
  }
}
```

---

## Integration

### Dashboard Integration

Both Production Orders and Reports integrate with the Dashboard module:

```bash
# Dashboard shows production order alerts
GET /dashboard/alerts
```

Response includes production order alerts:
```json
{
  "alerts": [
    {
      "type": "urgent_production_orders",
      "severity": "error",
      "count": 2,
      "message": "2 urgent production orders require attention"
    }
  ]
}
```

### Cross-Module Data Flow

```
Customer Places Order
        ↓
Production Order Created (pending)
        ↓
Order Approved
        ↓
Assigned to Production Entity
        ↓
Materials Requested (Material Request Module)
        ↓
Production Completed
        ↓
Stock Created (Product Stock Module)
        ↓
Order Delivered
        ↓
Invoice Generated (Invoice Module)
        ↓
All Data Feeds into Reports
```

---

## Examples

### Example 1: Monthly Business Review

Get comprehensive business metrics for the month:

```bash
# Get overall business report
curl "http://localhost:3000/reports/business?startDate=2025-01-01&endDate=2025-01-31"

# Get detailed production analysis
curl "http://localhost:3000/reports/production?startDate=2025-01-01&endDate=2025-01-31"

# Get sales performance
curl "http://localhost:3000/reports/sales?startDate=2025-01-01&endDate=2025-01-31"

# Get customer insights
curl http://localhost:3000/reports/customers
```

### Example 2: Custom Order Management

Complete workflow for managing a custom order:

```bash
# 1. Customer places order
curl -X POST http://localhost:3000/production-orders/create-with-validation \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 12,
    "orderDetails": [
      {
        "productName": "Custom Blazer",
        "size": 42,
        "quantity": 25,
        "specifications": "Charcoal gray wool blend, custom lining",
        "estimatedCost": 8500
      }
    ],
    "receivedBy": 5,
    "expectedDeliveryDate": "2025-03-15",
    "priority": "high"
  }'

# 2. Approve order
curl -X POST http://localhost:3000/production-orders/1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": 3,
    "agreedTotalCost": 212500,
    "notes": "Premium materials approved"
  }'

# 3. Assign to production
curl -X POST http://localhost:3000/production-orders/1/assign-to-production \
  -H "Content-Type: application/json" \
  -d '{
    "productionId": 78,
    "assignedBy": 3,
    "notes": "High priority - fast track"
  }'

# 4. Track progress
curl http://localhost:3000/production-orders/1/timeline

# 5. Complete and deliver
curl -X POST http://localhost:3000/production-orders/1/complete \
  -H "Content-Type: application/json" \
  -d '{"completedBy": 7}'

curl -X POST http://localhost:3000/production-orders/1/deliver \
  -H "Content-Type: application/json" \
  -d '{
    "deliveredBy": 5,
    "actualDeliveryDate": "2025-03-14"
  }'
```

### Example 3: Performance Analysis

Analyze performance across modules:

```bash
# Get staff performance
curl http://localhost:3000/reports/staff

# Get production efficiency
curl "http://localhost:3000/reports/production?startDate=2025-01-01&endDate=2025-01-31"

# Get material usage
curl "http://localhost:3000/reports/materials?startDate=2025-01-01&endDate=2025-01-31"

# Get inventory turnover
curl http://localhost:3000/reports/inventory
```

### Example 4: Customer Analysis

Identify top customers and opportunities:

```bash
# Get customer report
curl http://localhost:3000/reports/customers

# Get specific customer's orders
curl "http://localhost:3000/production-orders/customer/12?page=1&limit=20"

# Get customer's invoice history (from Invoice module)
curl "http://localhost:3000/invoices/customer/12?page=1&limit=20"
```

---

## Best Practices

### Production Order Management

1. **Always Use Validation Endpoint**
   - Use `/create-with-validation` instead of basic create
   - Ensures customer and staff exist
   - Generates proper order numbers
   - Creates initial stage record

2. **Set Realistic Delivery Dates**
   - Consider production capacity
   - Add buffer for unexpected delays
   - Communicate clearly with customers

3. **Use Priority Levels**
   - `urgent`: Same-day or next-day delivery
   - `high`: Within 1 week
   - `normal`: Standard timeline (2-3 weeks)
   - `low`: Flexible timeline (4+ weeks)

4. **Document Everything**
   - Always provide notes in status changes
   - Record reasons for rejections/cancellations
   - Track customer communications

5. **Track Costs Carefully**
   - Accurate estimated costs upfront
   - Clear agreed costs in approval
   - Account for material fluctuations

### Report Usage

1. **Regular Review Cadence**
   - Daily: Dashboard alerts and activities
   - Weekly: Production and sales reports
   - Monthly: Comprehensive business report
   - Quarterly: Customer and staff reports

2. **Date Range Selection**
   - Use specific date ranges for period analysis
   - Omit dates for all-time historical data
   - Compare periods (e.g., month-over-month)

3. **Action on Insights**
   - Low stock alerts → Place orders
   - Poor delivery performance → Review process
   - Top customers → Nurture relationships
   - Low performers → Training/support

4. **Data Quality**
   - Ensure all transactions are recorded
   - Regular data validation
   - Complete material tracking
   - Accurate cost recording

5. **Export and Share**
   - Use report data for presentations
   - Share with stakeholders
   - Archive for historical comparison
   - Feed into BI tools if needed

---

## Error Handling

### Common Production Order Errors

**Error:** Order cannot be approved
```json
{
  "statusCode": 400,
  "message": "Cannot approve order with status \"rejected\". Order must be pending."
}
```
**Solution:** Only pending orders can be approved. Check order status first.

**Error:** Production not found
```json
{
  "statusCode": 404,
  "message": "Production with ID 999 not found"
}
```
**Solution:** Verify production exists before assigning order.

**Error:** Cannot cancel delivered order
```json
{
  "statusCode": 400,
  "message": "Cannot cancel order with status \"delivered\"."
}
```
**Solution:** Delivered orders cannot be cancelled. Create credit note instead.

### Report Performance Issues

**Issue:** Slow report generation with large datasets

**Solutions:**
- Use date ranges to limit data
- Consider pagination for detailed views
- Add database indexes if needed
- Cache frequently accessed reports (future enhancement)

---

## Future Enhancements

Potential improvements to consider:

### Production Orders
1. **Partial Deliveries**: Support delivering orders in batches
2. **Order Templates**: Save specifications for repeat orders
3. **Customer Portal**: Let customers track their orders
4. **Automated Notifications**: Email/SMS updates on status changes
5. **Cost Revisions**: Handle cost changes during production
6. **Quality Metrics**: Track defect rates per order

### Reports
1. **Export to Excel/PDF**: Download reports in various formats
2. **Scheduled Reports**: Email reports automatically
3. **Custom Reports**: User-defined report configurations
4. **Visualizations**: Charts and graphs
5. **Forecasting**: Predictive analytics
6. **Benchmarking**: Compare against industry standards
7. **Real-time Dashboards**: Live data updates

---

## Summary

This implementation provides:

### Production Order Workflow
- Complete customer-to-production order lifecycle
- 11 workflow endpoints
- Priority handling and cost management
- Full audit trail with stage tracking
- Analytics and performance metrics
- Integration with existing production system

### Reports Consolidation
- 8 comprehensive report endpoints
- Cross-module data aggregation
- Period-based analysis support
- Executive and operational insights
- Staff, customer, and product analytics
- Single source of truth for business intelligence

Both systems are production-ready, fully documented, and integrate seamlessly with your existing fashion management system.
