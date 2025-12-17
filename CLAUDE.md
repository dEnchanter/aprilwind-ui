# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fashion business management system built with Next.js 15, React 19, TypeScript, and TanStack Query for state management. The application manages various aspects of a fashion production business including user management, inventory, production tracking, and invoice management.

**Backend API:** The application connects to a NestJS backend API running on `http://localhost:3000` with comprehensive RESTful endpoints. See `docs/API_DOCUMENTATION.md` for complete API reference.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack on localhost:3000

# Production
npm run build           # Build for production
npm start               # Start production server on port 6080

# Code Quality
npm run lint            # Run ESLint
```

## Architecture Overview

### Route Structure

The application uses Next.js App Router with route groups:

- **(auth)**: Authentication pages (sign-in, sign-up, forgot-password, reset-password, change-password)
- **(dashboard)**: Protected dashboard pages with shared DashboardNav layout
  - dashboard-overview
  - user-management (Staff and Customers tabs)
  - items-management
  - material-request
  - production-management
  - invoice-management
  - configurations
- **(landing)**: Public landing page

### Data Fetching Architecture

**Primary Pattern**: Use TanStack Query hooks for all API interactions

- Custom hooks in `src/hooks/` wrap TanStack Query and use the fetcher utilities
- All API calls go through `src/services/fetcher.ts` and `src/services/axios.ts` which handle:
  - Bearer token authentication via `Authorization: Bearer {token}` header
  - Automatic token injection using `getAccessToken()`
  - Consistent error handling and response parsing
  - Support for multipart/form-data uploads
  - Automatic 401 handling with redirect to login
- API endpoints defined in `src/services/api.ts` as the `Endpoint` object
- Base URL: `http://localhost:3000`

**Authentication Flow (JWT-based)**:
- Login via `POST /auth/login` with `profileCode` and `password`
- Server returns `accessToken` and `refreshToken` with user details
- Tokens stored in localStorage via `src/utils/storage.ts`
- Bearer token automatically appended to all requests via axios interceptor
- User data and role details also stored in localStorage
- Token refresh supported via `POST /auth/refresh`

**Available Hooks**:
- `useLogin()` - Login with profileCode/password
- `useRegister()` - Register new user (admin only)
- `useProfile()` - Get current user profile
- `useChangePassword()` - Change own password
- `useLogout()` - Logout and clear session
- `useRoles()`, `useStaff()`, `useCustomers()` - Core entity management
- `useMaterials()`, `useMaterial()` - Raw materials management with stock operations
- `useDashboardOverview()`, `useDashboardAlerts()` - Dashboard data
- See `src/hooks/` for complete list

### Form Handling Pattern

All forms follow this pattern:
1. Use `react-hook-form` with `zodResolver` for validation
2. Schema definitions in `src/schemas/` using Zod
3. Form components in `src/components/forms/`
4. Submit handlers call `fetcher.ts` functions with appropriate `Endpoint`
5. Success/error feedback via `sonner` toast notifications

### Table Pattern

Tables use TanStack Table (@tanstack/react-table):
- Table components in `src/components/tables/`
- Column definitions in `columns.tsx` files alongside page components
- Tables handle CRUD operations via dialogs with embedded forms

### Type System

- Type definitions in `src/types/*.d.ts` (global types via `.d.ts` extension)
- Schemas in `src/schemas/*.ts` define Zod validation and infer types
- Path alias: `@/*` maps to `src/*`

### UI Components

- Built on Radix UI primitives with custom styling
- Located in `src/components/ui/`
- Uses Tailwind CSS with custom brand colors and DaisyUI plugin
- Dark mode support via `next-themes`
- Utility function `cn()` in `src/lib/utils.ts` for conditional classes

## Key Conventions

1. **Client Components**: Most dashboard pages and forms use `"use client"` directive due to interactivity requirements

2. **API Integration**:
   - Never hardcode endpoints - use `Endpoint` constants from `src/services/api.ts`
   - Always use TanStack Query hooks from `src/hooks/` instead of direct API calls
   - For new endpoints, create corresponding hooks following the existing pattern
   - Hooks handle loading states, errors, and cache invalidation automatically
   - Use typed fetcher functions: `fetchGet<T>()`, `fetchPost<T, U>()`, etc.
   - API uses RESTful conventions: GET for fetch, POST for create, PATCH for update, DELETE for remove
   - Many endpoints support pagination via `?page=1&limit=20` query params

3. **State Management**:
   - Server state: TanStack Query (primary) - **USE HOOKS**
   - Client state: React useState/useReducer
   - No global state management library
   - Query keys organized by domain (e.g., `materialKeys`, `roleKeys`)

4. **Authentication**:
   - Use `profileCode` (not username/email) for login
   - Backend uses JWT Bearer tokens
   - 401 responses automatically redirect to `/sign-in`
   - Auth state managed via TanStack Query hooks

5. **File Exports**: Prefer utility functions for common operations (e.g., `exportToExcel` in `src/utils/`)

6. **Error Handling**: All hooks show toast notifications on error/success automatically

## Production Server

The production server runs on port 6080 (configured in package.json start script)
