# Quick Authentication Testing Guide

## Prerequisites

1. Database running: `fashion_db`
2. Server running: `npm run start:dev`
3. Environment configured: JWT_SECRET in `.env`

---

## Quick Test Flow

### Step 1: Create Test Role
```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrator",
    "description": "System administrator with full access",
    "isLogin": true
  }'
```

Expected: `201 Created` with role data

---

### Step 2: Create Test Staff
```bash
curl -X POST http://localhost:3000/staff \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 1,
    "staffName": "Test Admin",
    "dob": "1990-01-01",
    "address": "Test Address",
    "lga": "Test LGA",
    "stateOfOrigin": "Lagos",
    "country": "Nigeria",
    "identity": {
      "type": "National ID",
      "number": "12345678901"
    },
    "email": "admin@test.com",
    "phoneNumber": "+234-800-000-0000",
    "nextofkin": {
      "name": "Next Of Kin",
      "address": "Test Address",
      "relationship": "Spouse"
    },
    "references": []
  }'
```

Expected: `201 Created` with staff data (note the `id`)

---

### Step 3: Create Login (First Time - Direct)
```bash
curl -X POST http://localhost:3000/logins \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": 1,
    "profileCode": "ADMIN001",
    "password": "admin123",
    "isActive": true
  }'
```

Expected: `201 Created` with login data (password will be hashed)

---

### Step 4: Login and Get Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "profileCode": "ADMIN001",
    "password": "admin123"
  }'
```

Expected: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "profileCode": "ADMIN001",
    "staffName": "Test Admin",
    "email": "admin@test.com",
    "role": {
      "id": 1,
      "name": "Administrator",
      "description": "System administrator with full access"
    }
  }
}
```

**Save the `accessToken` for next steps!**

---

### Step 5: Test Protected Route
```bash
# Replace YOUR_TOKEN with the accessToken from Step 4
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: `200 OK` with user profile

---

### Step 6: Test Role-Based Access
```bash
# This should work (Administrator role)
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": 2,
    "profileCode": "USER002",
    "password": "user123"
  }'
```

Expected: `201 Created` (if staff with id 2 exists) or `404 Not Found`

---

### Step 7: Change Password
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newAdmin456"
  }'
```

Expected: `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

### Step 8: Test New Password
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "profileCode": "ADMIN001",
    "password": "newAdmin456"
  }'
```

Expected: `200 OK` with new tokens

---

### Step 9: Test Refresh Token
```bash
# Replace YOUR_REFRESH_TOKEN with the refreshToken from previous login
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

Expected: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Step 10: Test Unauthorized Access
```bash
# Try without token
curl -X GET http://localhost:3000/roles

# Try with invalid token
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer invalid-token"
```

Expected: `401 Unauthorized`

---

## PowerShell Version (Windows)

If using PowerShell, use this format:

```powershell
# Login
$body = @{
    profileCode = "ADMIN001"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$token = $response.accessToken

# Use token
Invoke-RestMethod -Uri "http://localhost:3000/auth/profile" `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## Postman Collection

### 1. Environment Setup
Create environment variables:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: (will be set automatically)
- `refreshToken`: (will be set automatically)

### 2. Login Request
- **Method:** POST
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
```json
{
  "profileCode": "ADMIN001",
  "password": "admin123"
}
```
- **Tests (auto-save tokens):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.accessToken);
    pm.environment.set("refreshToken", jsonData.refreshToken);
}
```

### 3. Protected Request
- **Method:** GET
- **URL:** `{{baseUrl}}/auth/profile`
- **Authorization:** Bearer Token
- **Token:** `{{accessToken}}`

---

## Common Test Scenarios

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "profileCode": "ADMIN001",
    "password": "wrongpassword"
  }'
```
Expected: `401 Unauthorized`

### Inactive Account
```bash
# Deactivate account (as admin)
curl -X PATCH http://localhost:3000/auth/1/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN"

# Try to login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "profileCode": "ADMIN001",
    "password": "admin123"
  }'
```
Expected: `401 Unauthorized` with message about inactive account

### Expired Token
Wait for token to expire (1 hour by default) or set shorter expiration in development.

---

## Verification Checklist

- [ ] Can create role with `isLogin: true`
- [ ] Can create staff member
- [ ] Can create login (password gets hashed)
- [ ] Can login with correct credentials
- [ ] Receive valid JWT tokens
- [ ] Can access protected routes with token
- [ ] Cannot access protected routes without token
- [ ] Can change password
- [ ] Can refresh access token
- [ ] Role-based access works (admin routes)
- [ ] Account activation/deactivation works
- [ ] Invalid credentials return 401
- [ ] Inactive accounts cannot login

---

## Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
npm run build
```

### "Unauthorized" on all requests
1. Check JWT_SECRET in `.env`
2. Ensure database connection
3. Verify token is sent in Authorization header

### Password validation fails
Check that password is being hashed in LoginService

### Role guard not working
Ensure both `JwtAuthGuard` and `RolesGuard` are applied, and `@Roles()` decorator is used

---

## Next Steps

Once authentication is verified:

1. Apply `@UseGuards(JwtAuthGuard)` to protect existing endpoints
2. Add role-based restrictions where needed
3. Implement refresh token rotation
4. Add rate limiting on login endpoint
5. Set up proper HTTPS in production

---

**Authentication System Ready! 🎉**
