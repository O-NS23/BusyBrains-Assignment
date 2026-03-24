# BusyBrains E-Commerce Application

## Project Overview

This project is a full-stack e-commerce web application built with:

- React for the frontend
- Spring Boot for the backend
- Spring Security with JWT for local authentication
- Google OAuth 2.0 / OpenID Connect for SSO
- H2 database for local development

The application supports:

- User registration and login
- Google single sign-on
- Role-based access control for `ROLE_ADMIN` and `ROLE_USER`
- Product listing similar to Amazon / Flipkart style dashboards
- Admin-only product update and delete actions
- User profile management, profile updates, and password changes

## System Architecture

The application follows a client-server architecture:

User -> React frontend -> Spring Boot REST APIs -> Database

Main components:

- `frontend/`: React application
- `backend/`: Spring Boot REST API
- `database`: H2 for local development

## Roles and Access

Seeded users:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `password` | `ROLE_ADMIN` | View, create, update, and delete products |
| `user` | `password` | `ROLE_USER` | View products only |

RBAC rules:

- Admin can create, update, and delete products
- User can only view products
- Both authenticated users can manage their own profile

## Features

- JWT-based local authentication
- Google SSO with OAuth2 / OIDC
- Role-based route and API protection
- Product search and product catalog dashboard
- Profile view and update
- Password change
- Swagger UI for API exploration

## Local Setup

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

Default local backend URL:

- `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- Health check: `http://localhost:8081/api/health`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Default local frontend URL:

- `http://localhost:3001`

## Environment Variables

### Backend

Supported backend environment variables:

- `PORT`
- `APP_FRONTEND_BASE_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_JWT_EXPIRATION_MS`
- `SERVER_FORWARD_HEADERS_STRATEGY`

Example file:

- `backend/.env.example`

### Frontend

Supported frontend environment variables:

- `REACT_APP_API_BASE_URL`

Example file:

- `frontend/.env.example`

## API Details

### Authentication APIs

- `POST /api/auth/register` -> register a new user
- `POST /api/auth/login` -> login with username and password
- `GET /api/auth/sso/status` -> check whether Google SSO is configured
- `GET /oauth2/authorization/google` -> start Google sign-in

### Product APIs

- `GET /api/products` -> view all products
- `POST /api/products` -> create a product (`ROLE_ADMIN`)
- `PUT /api/products/{id}` -> update a product (`ROLE_ADMIN`)
- `DELETE /api/products/{id}` -> delete a product (`ROLE_ADMIN`)

### Profile APIs

- `GET /api/profile` -> view current user profile
- `PUT /api/profile` -> update current user profile
- `PUT /api/profile/change-password` -> change current user password

### Utility APIs

- `GET /api/health` -> health check
- `GET /swagger-ui.html` -> Swagger documentation

## SSO Configuration

Create a Google OAuth 2.0 Web Application in Google Cloud Console.

### Local OAuth configuration

Authorized JavaScript origins:

- `http://localhost:3001`

Authorized redirect URIs:

- `http://localhost:8081/login/oauth2/code/google`

### Deployed OAuth configuration

Authorized JavaScript origins:

- `https://your-frontend-domain`

Authorized redirect URIs:

- `https://your-backend-domain/login/oauth2/code/google`

Production notes:

- Do not commit your real Google client secret
- On Railway or similar reverse-proxy hosts, set `SERVER_FORWARD_HEADERS_STRATEGY=framework`
- `APP_FRONTEND_BASE_URL` must be the frontend root URL, not `/login`

## Deployment

Recommended deployment split:

- Frontend: Vercel or Netlify
- Backend: Railway, Render, or another Java-capable host

### Live URLs

- Frontend: `https://busy-brains-assignment-five.vercel.app`
- Backend: `https://busybrains-backend-production.up.railway.app`
- Health check: `https://busybrains-backend-production.up.railway.app/api/health`

Deployment files included in the repo:

- `frontend/vercel.json`
- `frontend/netlify.toml`
- `backend/Dockerfile`
- `render.yaml`

### Frontend deployment

Set:

- `REACT_APP_API_BASE_URL=https://your-backend-domain`

### Backend deployment

Set:

- `APP_FRONTEND_BASE_URL=https://your-frontend-domain`
- `APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`

## Verification and Testing

Verified locally:

- `mvn -q package`
- `npm test -- --watchAll=false`
- `npm run build`
- Admin login works
- User login works
- Admin product CRUD works
- User product modification is blocked by RBAC
- Profile update works
- Password change works
- Google SSO flow is implemented and deployment-ready

## Project Structure

```text
busybrains/
|-- backend/
|   |-- Dockerfile
|   |-- pom.xml
|   `-- src/main/
|-- frontend/
|   |-- netlify.toml
|   |-- vercel.json
|   |-- package.json
|   `-- src/
|-- render.yaml
`-- README.md
```
