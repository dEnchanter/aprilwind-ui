# Authentication & Authorization Guide

## Overview

This guide covers the complete authentication and authorization system implemented in the Fashion Management System using JWT (JSON Web Tokens) and role-based access control (RBAC).

---

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Using Authentication](#using-authentication)
5. [Role-Based Authorization](#role-based-authorization)
6. [Guards & Decorators](#guards--decorators)
7. [Password Security](#password-security)
8. [Best Practices](#best-practices)

---

## Architecture

### Components

1. **JWT Strategy** - Validates JWT tokens and extracts user information
2. **Local Strategy** - Validates username/password credentials
3. **Auth Service** - Business logic for authentication operations
4. **Auth Controller** - HTTP endpoints for authentication
5. **Guards** - Protect routes requiring authentication/authorization
6. **Decorators** - Extract user info and define access rules

### Token System

- **Access Token**: Short-lived (1 hour default), used for API requests
- **Refresh Token**: Long-lived (7 days default), used to obtain new access tokens

---

## Authentication Flow

### Registration Flow

```
1. Admin creates Staff record → POST /staff
2. Admin registers login → POST /auth/register
   {
     "staffId": 1,
     "profileCode": "STAFF001",
     "password": "securePassword123"
   }
3. System hashes password with bcrypt
4. Login record created with isActive: true
```

### Login Flow

```
1. User submits credentials → POST /auth/login
   {
     "profileCode": "STAFF001",
     "password": "securePassword123"
   }
2. System validates profile code exists
3. System verifies password hash
4. System checks if account is active
5. System generates JWT tokens
6. Returns access token, refresh token, and user info
```

### Token Validation Flow

```
1. Client sends request with Authorization header
2. JwtAuthGuard extracts token from header
3. JwtStrategy validates token signature
4. JwtStrategy checks if user exists and is active
5. User object attached to request
6. Route handler processes request
```

---

## API Endpoints

### Base Route: `/auth`

#### 1. Login
```http
POST /auth/login
```

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "profileCode": "STAFF001",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "profileCode": "STAFF001",
    "staffName": "John Doe",
    "email": "john.doe@example.com",
    "role": {
      "id": 1,
      "name": "Administrator",
      "description": "Full system access"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - Account is inactive

---

#### 2. Register New User
```http
POST /auth/register
```

**Requires:** Authentication + Administrator/Manager role

**Request Body:**
```json
{
  "staffId": 5,
  "profileCode": "STAFF005",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "staffId": 5,
  "profileCode": "STAFF005",
  "isActive": true,
  "crtDate": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Staff not found
- `400 Bad Request` - Staff role does not require login
- `400 Bad Request` - Login already exists for this staff
- `400 Bad Request` - Profile code already exists

---

#### 3. Get Current User Profile
```http
GET /auth/profile
```

**Requires:** Authentication

**Response:** `200 OK`
```json
{
  "id": 1,
  "staffName": "John Doe",
  "email": "john.doe@example.com",
  "roleId": 1,
  "phoneNumber": "+234-800-123-4567",
  "role": {
    "id": 1,
    "name": "Administrator",
    "description": "Full system access"
  },
  "login": {
    "staffId": 1,
    "profileCode": "STAFF001",
    "isActive": true,
    "crtDate": "2025-01-01T00:00:00Z"
  }
}
```

---

#### 4. Get Current User (Lightweight)
```http
GET /auth/me
```

**Requires:** Authentication

**Response:** `200 OK`
```json
{
  "id": 1,
  "profileCode": "STAFF001",
  "staffName": "John Doe",
  "email": "john.doe@example.com",
  "roleId": 1,
  "roleName": "Administrator",
  "role": {
    "id": 1,
    "name": "Administrator",
    "description": "Full system access",
    "isLogin": true
  }
}
```

---

#### 5. Change Password
```http
POST /auth/change-password
```

**Requires:** Authentication

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Validation:**
- `newPassword` must be at least 6 characters

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Current password is incorrect
- `404 Not Found` - Login not found

---

#### 6. Refresh Access Token
```http
POST /auth/refresh
```

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token
- `401 Unauthorized` - Account is inactive

---

#### 7. Activate Account (Admin)
```http
PATCH /auth/:staffId/activate
```

**Requires:** Authentication + Administrator/Manager role

**Response:** `200 OK`
```json
{
  "message": "Account activated successfully"
}
```

---

#### 8. Deactivate Account (Admin)
```http
PATCH /auth/:staffId/deactivate
```

**Requires:** Authentication + Administrator/Manager role

**Response:** `200 OK`
```json
{
  "message": "Account deactivated successfully"
}
```

---

#### 9. Reset Password (Admin)
```http
POST /auth/:staffId/reset-password
```

**Requires:** Authentication + Administrator/Manager role

**Request Body:**
```json
{
  "newPassword": "temporaryPassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

---

#### 10. Logout
```http
POST /auth/logout
```

**Requires:** Authentication

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Note:** Token invalidation is handled client-side by removing the token.

---

## Using Authentication

### Client-Side Implementation

#### 1. Login and Store Tokens

```typescript
async function login(profileCode: string, password: string) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileCode, password })
  });

  const data = await response.json();

  // Store tokens securely
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}
```

#### 2. Make Authenticated Requests

```typescript
async function getProtectedData() {
  const token = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshAccessToken();
    return getProtectedData(); // Retry request
  }

  return response.json();
}
```

#### 3. Refresh Token

```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    // Refresh token expired, redirect to login
    logout();
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
}
```

#### 4. Logout

```typescript
async function logout() {
  const token = localStorage.getItem('accessToken');

  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Clear stored tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
```

---

## Role-Based Authorization

### Available Roles

Based on your `Role` entity, roles are defined by the `name` field:
- Administrator
- Manager
- Sales Person
- Tailor
- Warehouse Staff
- QA Inspector
- etc.

### Protecting Routes by Role

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { Roles } from './modules/auth/decorators/roles.decorator';

@Controller('invoices')
export class InvoiceController {
  // Only Administrator and Manager can create invoices
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Manager', 'Sales Person')
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  // All authenticated users can view invoices
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.invoiceService.findAll();
  }

  // Public route (no authentication)
  @Public()
  @Get('public-info')
  getPublicInfo() {
    return { info: 'Public information' };
  }
}
```

---

## Guards & Decorators

### JwtAuthGuard

Validates JWT token and checks if user is active.

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async protectedRoute() {
  return { message: 'This is protected' };
}
```

### RolesGuard

Checks if user has required role(s).

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator', 'Manager')
@Post('admin-only')
async adminRoute() {
  return { message: 'Admin only' };
}
```

### @Public() Decorator

Marks a route as public (skips authentication).

```typescript
@Public()
@Get('public')
async publicRoute() {
  return { message: 'Anyone can access this' };
}
```

### @CurrentUser() Decorator

Extracts current user from request.

```typescript
@UseGuards(JwtAuthGuard)
@Get('my-data')
async getMyData(@CurrentUser() user: any) {
  return { user };
}

// Get specific property
@Get('my-id')
async getMyId(@CurrentUser('id') id: number) {
  return { id };
}
```

### @Roles() Decorator

Defines required roles for a route.

```typescript
@Roles('Administrator', 'Manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
async deleteItem(@Param('id') id: number) {
  return this.service.remove(id);
}
```

---

## Password Security

### Hashing Algorithm

- **Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Automatic:** All passwords are hashed before storage

### Password Requirements

- Minimum length: 6 characters (configurable in DTOs)
- Recommended: 12+ characters with mixed case, numbers, and symbols

### Password Utility

```typescript
import { PasswordUtil } from './common/utils/password.util';

// Hash password
const hash = await PasswordUtil.hash('password123');

// Verify password
const isValid = await PasswordUtil.compare('password123', hash);

// Generate random password
const randomPassword = PasswordUtil.generateRandom(16);
```

---

## Best Practices

### Security

1. **Never log passwords** - Even in development
2. **Use HTTPS** - In production, always use HTTPS
3. **Secure token storage** - Use httpOnly cookies or secure storage
4. **Short token expiration** - Keep access tokens short-lived
5. **Rotate refresh tokens** - Implement refresh token rotation
6. **Rate limiting** - Implement login attempt limiting
7. **Strong secrets** - Use strong, random JWT_SECRET in production

### Development

```env
# Development .env
JWT_SECRET=dev-secret-change-in-prod
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

### Production

```env
# Production .env
JWT_SECRET=a-very-long-random-string-min-32-characters-1234567890
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Token Management

1. **Access Token Expiration**: Keep short (15-60 minutes)
2. **Refresh Token Expiration**: Longer (7-30 days)
3. **Token Refresh Strategy**: Refresh before expiration
4. **Automatic Refresh**: Implement automatic token refresh

### Error Handling

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error.status === 401) {
    // Invalid credentials
    showError('Invalid username or password');
  } else if (error.message.includes('inactive')) {
    // Account deactivated
    showError('Your account has been deactivated');
  } else {
    // Generic error
    showError('Login failed. Please try again.');
  }
}
```

---

## Common Scenarios

### Scenario 1: First Time Setup

```bash
# 1. Create role
POST /roles
{
  "name": "Administrator",
  "description": "System administrator",
  "isLogin": true
}

# 2. Create staff
POST /staff
{
  "roleId": 1,
  "staffName": "Admin User",
  "email": "admin@example.com",
  ...
}

# 3. Register login (direct POST to /logins for first user)
POST /logins
{
  "staffId": 1,
  "profileCode": "ADMIN001",
  "password": "admin123",
  "isActive": true
}

# 4. Login
POST /auth/login
{
  "profileCode": "ADMIN001",
  "password": "admin123"
}
```

### Scenario 2: Adding New User

```bash
# As authenticated admin:

# 1. Create staff
POST /staff
{
  "roleId": 2,
  "staffName": "New User",
  ...
}

# 2. Register login
POST /auth/register
{
  "staffId": 2,
  "profileCode": "USER002",
  "password": "tempPassword123"
}

# 3. New user logs in and changes password
POST /auth/login
POST /auth/change-password
```

### Scenario 3: Password Reset

```bash
# As admin:

# 1. Reset user password
POST /auth/5/reset-password
{
  "newPassword": "temporaryPass123"
}

# 2. Notify user to change password
# User logs in:
POST /auth/login
POST /auth/change-password
```

### Scenario 4: Deactivate User

```bash
# As admin:

# Deactivate account
PATCH /auth/5/deactivate

# Reactivate later
PATCH /auth/5/activate
```

---

## Testing Authentication

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"profileCode":"STAFF001","password":"password123"}'
```

**Authenticated Request:**
```bash
TOKEN="your-access-token-here"

curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Change Password:**
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old","newPassword":"new123"}'
```

### Using Postman

1. **Environment Variables:**
   - `baseUrl`: http://localhost:3000
   - `accessToken`: (will be set after login)

2. **Login Request:**
   - POST `{{baseUrl}}/auth/login`
   - Save `accessToken` from response

3. **Add Authorization:**
   - Type: Bearer Token
   - Token: `{{accessToken}}`

---

## Troubleshooting

### Common Issues

**Issue:** `401 Unauthorized` on all requests
**Solution:** Check if JWT_SECRET matches between .env and auth module

**Issue:** Token expired immediately
**Solution:** Check JWT_EXPIRATION setting, ensure system time is correct

**Issue:** Can't login with correct password
**Solution:** Password might not be hashed. Check login.password field

**Issue:** `Reflector` errors
**Solution:** Ensure guards and decorators are properly imported

---

## Migration from Basic Auth

If you had basic auth before:

1. **Hash existing passwords:**
```typescript
import { PasswordUtil } from './common/utils/password.util';

// Update all existing logins
const logins = await loginRepository.find();
for (const login of logins) {
  login.password = await PasswordUtil.hash(login.password);
  await loginRepository.save(login);
}
```

2. **Update client applications:**
   - Replace basic auth with Bearer token
   - Implement token refresh logic
   - Handle 401 responses

---

**Authentication system is now fully implemented and ready to use!** 🎉
