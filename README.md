# Inbotiq - Full-Stack Role-Based Authentication System

> A full-stack authentication application with JWT tokens, refresh token rotation, and role-based access control. Built with Express.js + MongoDB backend and React + Vite frontend.

## 🎯 Project Overview

**Inbotiq** is a modern, secure authentication system designed for applications requiring role-based user access control. It demonstrates best practices in security, state management, and API integration.

### What It Does
- **User Authentication**: Signup and login with email/password
- **Role-Based Access**: Support for User and Admin roles with protected routes
- **Secure Tokens**: JWT access tokens (15 min expiry) + refresh tokens (30 days, HttpOnly cookie)
- **Token Rotation**: Automatic refresh token rotation on use
- **Session Persistence**: Automatic session restoration on app reload
- **Protected Resources**: Dashboard accessible only to authenticated users

### Who It's For
- Developers building authentication systems
- ✅ Automatic session refresh without user intervention
- ✅ Single-use refresh tokens to prevent reuse attacks
- ✅ Role-based route protection
- ✅ Production-ready deployment configuration

## ✨ Features
- **User Management**: Create accounts with name, email, password, and role
- **Authentication Endpoints**:
  - `POST /api/auth/signup` - Register new user
  - `POST /api/auth/login` - Authenticate user
  - `POST /api/auth/refresh` - Get new access token
  - `POST /api/auth/logout` - Revoke refresh token
  - `GET /api/auth/me` - Get authenticated user info
- **JWT Implementation**:
  - Access tokens (short-lived, 15 minutes)
  - Refresh tokens (long-lived, 30 days)
  - Token rotation on refresh
  - Secure HttpOnly cookie storage
  - Rate limiting (100 requests per 15 min on auth endpoints)
  - Helmet.js security headers
  - Zod input validation
- **Database**: MongoDB with separate RefreshToken collection for audit trail
- **Error Handling**: Comprehensive error middleware with validation details
- **Health Check**: `/health` endpoint for deployment monitoring

### Frontend Features (React + Vite)
- **Authentication Pages**:
  - Signup with name, email, password, role selection
  - Login with email/password
  - Protected dashboard (authenticated users only)
- **State Management**:
  - Context API for global auth state
  - Access token in React memory (not localStorage)
  - Refresh token in HttpOnly cookie
  - Automatic session restoration
- **Form Validation**:
  - Zod + React Hook Form
  - Real-time password strength indicator
  - Email validation
  - Client & server-side validation
- **UI/UX**:
  - TailwindCSS + Shadcn components
  - Responsive design (mobile-friendly)
  - Dark/Light mode support
  - Loading states & error messages
  - Password visibility toggle
  - Animated transitions
- **API Integration**:
  - Axios with request/response interceptors
  - Automatic 401 handling with token refresh
  - Request queuing during refresh
  - Proper error propagation
- **Security**:
  - Protected routes with redirect
  - Automatic logout on token expiration

## 🧰 Tech Stack

This project is split into two primary layers — Backend (API) and Frontend (UI). Below is a detailed, production-focused list of technologies, tools and optional infrastructure components used or recommended for this project.

### Backend (API)
- Runtime:
  - Node.js 18+ (ES Modules)
- Frameworks & Libraries:
  - Express - HTTP server and routing
  - Mongoose - MongoDB ODM
  - jsonwebtoken - signed JWT access tokens
  - bcrypt - secure password hashing
  - zod - request body validation (schema-first, runtime-safe)
  - cookie-parser - parse cookies (HttpOnly refresh token)
  - helmet - secure HTTP headers
  - cors - origin & credential control
  - express-rate-limit - brute-force/rate limiting
  - ms - human-friendly time parsing (e.g., "15m", "30d")
- Persistence:
  - MongoDB (Atlas recommended for production)
  - Refresh tokens stored in a dedicated `RefreshToken` collection (hashed)
- Security & Cryptography:
  - crypto (Node builtin) - secure random refresh tokens + hashing (sha256)
  - Environment-managed secrets for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- Dev / Test Tools:
  - nodemon - development server auto-reload
  - jest + supertest - unit + integration tests (optional)
  - mongodb-memory-server - test DB for CI
  - eslint - linting / code quality
- Packaging / Scripts:
  - `npm run dev` - dev server
  - `npm start` - production entry
  - `npm test` - run tests

### Frontend (Client)
- Base:
  - React 18 (Vite) — fast builds, HMR
  - JavaScript (project uses non-TypeScript React)
- UI & Styling:
  - Tailwind CSS — utility-first design system
  - Shadcn-style components / Radix primitives — accessible, composable UI components
  - lucide-react (icons)
- Routing & Forms:
  - withCredentials: true — ensures cookies (refresh token) are sent
- State & Auth:
  - React Context — store user and access token in memory
  - Access token kept in-memory and attached to Authorization header
  - Refresh token persisted as HttpOnly cookie (server-side)
- Dev Tools:
  - Vite dev server (`npm run dev`)
  - ESLint (frontend config)
  - PostCSS + Autoprefixer (Tailwind)

### Infrastructure & Deployment (Recommended)
  - Vercel — ideal for Vite apps
  - Netlify or Cloudflare Pages — static hosting for optimized builds
  - MongoDB Atlas — managed DB with backups, VPC peering, strong IAM
- Additional Production Tools:
  - Redis — caching layer & session store for heavy read workloads or rate limiter persistence
  - Cloudflare / CDN — CDN + WAF in front of the frontend and API
- CI / CD:
  - Deploy pipelines to Render/Vercel on merge to `main` with environment variables set in service
  - Health checks (`/health`) for readiness probes

### Rationale & Notes
- Access tokens are short-lived JWTs (recommended ~15m) to reduce exposure if leaked.
- Refresh tokens are long-lived but rotated and stored hashed in DB to mitigate theft and reuse.
- Keeping access tokens out of localStorage and only in-memory reduces XSS attack surface.
- Using `withCredentials` plus an HttpOnly cookie for refresh tokens avoids storing persistent raw tokens on the client.
- Choosing MongoDB + Mongoose allows flexible schemas and an easy refresh token model.
- Vite + React offers modern DX (developer experience) and simple static build deployment to Vercel.