FLOW 1: Inventory-Based Sales (Stock Items)

  Start: Raw Material Acquisition

  1. Purchase Raw Materials
    - Endpoint: POST /raw-items/add-stock or POST /raw-items/bulk-add
    - Staff purchases fabric, buttons, zippers, thread, etc.
    - Records: supplier, unit cost, quantity, notes
    - System: Increases raw material inventory
  2. Define Products
    - Endpoint: POST /product-defs
    - Staff defines what products can be made (e.g., "Classic Shirt")
    - Specifies: material requirements, sizes available, cost
    - Example: "Classic Shirt needs 2m fabric, 6 buttons, 1 zipper"

  Middle: Production Process

  3. Create Material Request
    - Endpoint: POST /material-requests/create-with-validation
    - Production staff requests materials for production
    - System checks availability before approval
    - Example: "Request 50m fabric for 25 shirts"
  4. Approve Material Request
    - Endpoint: POST /material-requests/:id/approve
    - Supervisor approves request
    - System: Deducts materials from raw inventory
    - Materials move to production floor
  5. Create Production Job
    - Endpoint: POST /productions/create-with-validation
    - Assign tailor, product definition, quantity, sizes
    - Generates production code: PROD-202501-00001
    - Status: in production
  6. Production Workflow
    - Endpoint: POST /productions/:id/move-to-stage
    - Stages: in production → Bidding → Await QA → Completed
    - If rejected: goes back to production or scrapped
    - Tracks timeline with staff responsible for each stage
  7. Move to Stock
    - Endpoint: POST /productions/:id/move-to-stock
    - Quality approved items moved to finished goods inventory
    - System: Creates product stock entries with sizes
    - Now available for sale

  End: Sales & Delivery

  8. Create Invoice (Sale)
    - Endpoint: POST /invoices/create-with-validation
    - Customer selects products from available stock
    - System checks stock availability before creating invoice
    - Status: open
  9. Calculate & Payment
    - Endpoint: POST /invoices/:id/calculate-total
    - Apply tax and discounts
    - Endpoint: POST /invoices/:id/mark-as-paid
    - Record payment method, reference number
    - System: Deducts from product stock
    - Status: open → paid
  10. Pack & Ship
    - Endpoint: POST /invoices/:id/pack-items
    - Items packed for delivery
    - Status: paid → packed
    - Endpoint: POST /invoices/:id/assign-logistics
    - Assign delivery personnel/company
    - Status: packed → logistic
  11. Delivery Complete
    - Endpoint: POST /invoices/:id/mark-as-delivered
    - Customer receives order
    - Status: logistic → delivered
    - END OF FLOW 1

  ---
  FLOW 2: Custom Production Orders

  Start: Customer Order

  1. Customer Places Custom Order
    - Endpoint: POST /production-orders/create-with-validation
    - Customer requests custom products (e.g., "25 navy blazers with custom lining")
    - Specifies: product name, size, quantity, specifications, expected delivery
    - Generates order number: PO-202501-00001
    - Status: pending
    - Priority: low, normal, high, urgent

  Middle: Order Processing

  2. Review & Approve Order
    - Endpoint: POST /production-orders/:id/approve
    - Management reviews order feasibility
    - Negotiates cost (estimated → agreed cost)
    - Status: pending → approved
    - Alternative: POST /production-orders/:id/reject if not feasible
  3. Assign to Production
    - Endpoint: POST /production-orders/:id/assign-to-production
    - Links order to a production job
    - Now follows FLOW 1 steps 3-7 (Material Request → Production → QA)
    - Status: approved → in_production
  4. Production Complete
    - Endpoint: POST /production-orders/:id/complete
    - All items manufactured and passed QA
    - Status: in_production → completed

  End: Delivery

  5. Deliver to Customer
    - Endpoint: POST /production-orders/:id/deliver
    - Records actual delivery date vs expected
    - Status: completed → delivered
    - System tracks on-time delivery performance
    - END OF FLOW 2

  ---
  Supporting Flows

  Staff Management

  - Start: POST /staff (create staff member)
  - Assign Role: Link to role (Administrator, Production Manager, Tailor, etc.)
  - Track Activity: All actions logged with staff ID
  - Reports: GET /reports/staff shows performance

  Customer Management

  - Register: POST /customers (name, address, country, type)
  - Track Orders: All invoices and production orders linked to customer
  - Analytics: GET /reports/customers shows top customers, lifetime value


────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
> 
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  - Dashboard: GET /dashboard/overview - Real-time metrics
  - Reports:
    - Production performance: GET /reports/production
    - Sales analysis: GET /reports/sales
    - Inventory turnover: GET /reports/inventory
    - Material usage: GET /reports/materials
    - Customer insights: GET /reports/customers
    - Production orders: GET /reports/production-orders
    - Staff performance: GET /reports/staff
    - Executive summary: GET /reports/business

  ---
  Critical Validation Points

  The system has several checkpoints to prevent errors:

  1. Material Request Approval - Checks raw material availability before deducting
  2. Production Creation - Validates product definition exists and materials requested
  3. Invoice Creation - Checks product stock availability before sale
  4. Production Order Approval - Ensures feasibility before committing
  5. Stage Transitions - Validates current status before moving to next stage

  ---
  Complete Visual Flow

  ┌─────────────────────────────────────────────────────────────────┐
  │                     START: RAW MATERIALS                         │
  │                  (Purchase fabric, buttons, etc.)                │
  └────────────────────────────┬────────────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │              DEFINE PRODUCTS (What can be made)                  │
  └────────────────────────────┬────────────────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
           ┌──────────────┐    ┌──────────────────┐
           │  STOCK PATH  │    │  CUSTOM ORDER    │
           │              │    │      PATH        │
           └──────┬───────┘    └────────┬─────────┘
                  │                     │
                  ▼                     ▼
      ┌─────────────────────┐  ┌──────────────────┐
      │ Material Request    │  │ Customer Places  │
      │ → Approve           │  │ Order → Approve  │
      └─────────┬───────────┘  └────────┬─────────┘
                │                       │
                └──────────┬────────────┘
                           ▼
                ┌─────────────────────┐
                │   PRODUCTION JOB    │
                │ (Tailor manufactures│
                │  in production →    │
                │  Bidding → QA)      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Quality Approved   │
                └──────────┬──────────┘
                           │
                  ┌────────┴─────────┐
                  │                  │
                  ▼                  ▼
      ┌─────────────────┐  ┌─────────────────┐
      │  Move to Stock  │  │ Complete Custom │
      │  (Inventory)    │  │ Order (Direct   │
      │                 │  │  to customer)   │
      └────────┬────────┘  └────────┬────────┘
               │                    │
               ▼                    │
      ┌─────────────────┐           │
      │ Create Invoice  │           │
      │ (Customer buys) │           │
      └────────┬────────┘           │
               │                    │
               ▼                    ▼
      ┌──────────────────────────────────┐
      │  PAYMENT → PACK → SHIP → DELIVER │

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
      │         FINISHED PRODUCT         │
      └──────────────────────────────────┘

  ---
  Key Metrics Tracked

  - Production: Completion rate, average time, tailor performance
  - Sales: Revenue, average order value, customer trends
  - Inventory: Stock levels, turnover rates, low stock alerts
  - Materials: Usage patterns, waste, restock needs
  - Delivery: On-time delivery rate, expected vs actual dates
  - Staff: Activity levels, productivity across modules

  ---
  Summary: The business starts with raw materials, defines products, manufactures through production jobs, maintains
   inventory, and fulfills orders either from stock (invoices) or custom production orders, ending with customer
  delivery.