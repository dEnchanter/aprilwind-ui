# Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

---

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE fashion_db;
```

Or using psql command line:
```bash
psql -U postgres
CREATE DATABASE fashion_db;
\q
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_DATABASE=fashion_db

# Application
NODE_ENV=development
PORT=3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

**Development mode (with hot reload):**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000`

---

## Verify Installation

### Check Server Status

Open your browser or use curl:

```bash
curl http://localhost:3000
```

You should see the default NestJS response.

### Check Database Connection

The application will automatically:
1. Connect to PostgreSQL
2. Create all tables (via TypeORM `synchronize: true` in development)
3. Set up all relationships

Check the console output - you should see:
```
Application is running on: http://localhost:3000
```

---

## Quick API Test

### 1. Create a Role

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrator",
    "description": "System administrator with full access",
    "isLogin": true
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Administrator",
  "description": "System administrator with full access",
  "isLogin": true
}
```

### 2. Get All Roles

```bash
curl http://localhost:3000/roles
```

### 3. Create an Item Type

```bash
curl -X POST http://localhost:3000/item-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fabric",
    "code": "FB",
    "unit": "yard"
  }'
```

### 4. Create a Size Definition

```bash
curl -X POST http://localhost:3000/size-defs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Large",
    "description": "Large size for adults",
    "genderType": "male"
  }'
```

---

## Project Structure

```
src/
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts          # Pagination DTOs
│   └── interfaces/
│       └── base-service.interface.ts  # Base service interface
├── entities/
│   ├── role.entity.ts                 # Role entity
│   ├── staff.entity.ts                # Staff entity
│   ├── item-type.entity.ts            # ItemType entity
│   └── ... (18 entities total)
├── modules/
│   ├── role/
│   │   ├── dto/
│   │   │   ├── create-role.dto.ts    # Create DTO
│   │   │   └── update-role.dto.ts    # Update DTO
│   │   ├── role.controller.ts         # REST controller
│   │   ├── role.service.ts            # Business logic
│   │   └── role.module.ts             # Module definition
│   └── ... (18 modules total)
├── app.module.ts                      # Root module
└── main.ts                            # Application entry point
```

---

## Available Endpoints

All 18 modules with full CRUD operations:

### Staff & Authentication
- `/roles` - Role management
- `/staff` - Staff management
- `/logins` - Authentication credentials

### Inventory Management
- `/item-types` - Material type definitions
- `/raw-items` - Raw materials inventory
- `/raw-item-trackers` - Inventory movement tracking

### Product Management
- `/size-defs` - Size definitions
- `/product-defs` - Product definitions
- `/products-for-production` - Production requests

### Production Management
- `/material-requests` - Material requisitions
- `/productions` - Active productions
- `/production-stages` - Production progress tracking
- `/product-stocks` - Finished goods inventory

### Sales & Customer Management
- `/customer-types` - Customer categorization
- `/customers` - Customer management
- `/invoices` - Sales orders
- `/invoice-stages` - Order status tracking
- `/product-stock-stages` - Product fulfillment tracking

See `API_DOCUMENTATION.md` for complete endpoint details.

---

## Common Operations

### Create Complete Product Flow

```bash
# 1. Create staff
curl -X POST http://localhost:3000/staff \
  -H "Content-Type: application/json" \
  -d '{...}'

# 2. Create product definition
curl -X POST http://localhost:3000/product-defs \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SHRT",
    "name": "Formal Shirt",
    "cost": 5000,
    "def": [{"item": 1, "qty": 2.5}],
    "productSizes": [1, 2, 3],
    "creatorId": 1
  }'

# 3. Request production
curl -X POST http://localhost:3000/products-for-production \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "requestedBy": 1,
    "quantity": [{"size": 1, "quantity": 10}],
    "productGuide": [{"id": 1, "qty": "25 yards"}],
    "isActive": true
  }'
```

---

## Development Tools

### TypeORM CLI Commands

Generate a migration:
```bash
npm run typeorm migration:generate -- -n MigrationName
```

Run migrations:
```bash
npm run typeorm migration:run
```

Revert migration:
```bash
npm run typeorm migration:revert
```

### Linting and Formatting

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:cov
```

Run e2e tests:
```bash
npm run test:e2e
```

---

## Debugging

### Enable Detailed Logging

In `.env`:
```env
NODE_ENV=development
```

This enables:
- TypeORM SQL query logging
- Detailed error messages
- Stack traces

### Common Issues

**Issue:** `ECONNREFUSED` database connection error
**Solution:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check PostgreSQL is listening on correct port

**Issue:** `relation does not exist` error
**Solution:**
- Set `synchronize: true` in development (already configured)
- Or run migrations manually

**Issue:** Validation errors on POST requests
**Solution:**
- Check request body matches DTO structure
- Ensure all required fields are present
- Verify data types match DTO definitions

---

## Production Deployment

### Before Deployment

1. **Disable synchronize:**
   ```typescript
   // In app.module.ts
   synchronize: false  // Never use true in production
   ```

2. **Use migrations:**
   ```bash
   npm run typeorm migration:generate -- -n InitialSchema
   npm run typeorm migration:run
   ```

3. **Environment variables:**
   - Use secure passwords
   - Set `NODE_ENV=production`
   - Configure proper CORS settings

4. **Security:**
   - Implement authentication (JWT)
   - Add authorization guards
   - Enable rate limiting
   - Use HTTPS

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fashion_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_DATABASE: fashion_db
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with Docker:
```bash
docker-compose up -d
```

---

## API Testing Tools

### Recommended Tools

1. **Postman** - GUI-based API testing
   - Import collection from API documentation
   - Create environments for dev/staging/prod

2. **Insomnia** - Alternative to Postman
   - Lightweight and fast
   - Good for REST and GraphQL

3. **Thunder Client** - VS Code extension
   - Built into VS Code
   - Simple and efficient

4. **cURL** - Command line testing
   - Quick tests
   - Script automation

### Sample Postman Collection

Create a new collection with these requests:

```
Fashion Management API
├── Staff & Auth
│   ├── Create Role
│   ├── Get All Roles
│   ├── Get Role by ID
│   ├── Update Role
│   └── Delete Role
├── Inventory
│   ├── Create Item Type
│   ├── Create Raw Item
│   └── Track Inventory
└── ... (continue for all modules)
```

---

## Performance Optimization

### Database Indexing

Add indexes for frequently queried fields:

```typescript
@Entity()
@Index(['email'])
@Index(['roleId'])
export class Staff {
  // ...
}
```

### Query Optimization

Use selective relations loading:

```typescript
// Instead of loading all relations
const staff = await staffRepository.findOne({
  where: { id },
  relations: ['role', 'login', 'rawItemTrackers', 'createdProducts']
});

// Load only what you need
const staff = await staffRepository.findOne({
  where: { id },
  relations: ['role']  // Only load role
});
```

### Caching

Consider implementing Redis caching for:
- Frequently accessed lookup tables
- Product definitions
- Size definitions

---

## Next Steps

1. **Implement Authentication**
   - Add JWT authentication
   - Protect routes with guards
   - Implement role-based access control

2. **Add Swagger Documentation**
   - Install `@nestjs/swagger`
   - Add API decorators
   - Generate OpenAPI spec

3. **Implement Business Logic**
   - Add inventory validation
   - Implement production code generation
   - Add invoice number generation

4. **Add Advanced Features**
   - File upload for images
   - PDF invoice generation
   - Email notifications
   - Audit logging

5. **Testing**
   - Unit tests for services
   - Integration tests for controllers
   - E2E tests for workflows

---

## Support & Documentation

- **Entity Relationships:** See `ENTITY_RELATIONSHIPS.md`
- **API Endpoints:** See `API_DOCUMENTATION.md`
- **NestJS Docs:** https://docs.nestjs.com
- **TypeORM Docs:** https://typeorm.io

---

**Happy Coding! 🚀**
