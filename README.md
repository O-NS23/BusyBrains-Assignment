# BusyBrains E-Commerce Application

This is a full-stack e-commerce application built with React and Spring Boot. It includes JWT authentication, Google OAuth2 / OpenID Connect SSO, role-based access control, product management, and user profile management.

## Features

- Local registration and login with JWT
- Google SSO with OAuth2 / OIDC
- Admin and User seeded accounts
- Product catalog with search and category filtering
- Admin-only create, update, and delete product actions
- User profile view, update, and password change
- Swagger UI for API testing

## Seeded Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `password` | `ROLE_ADMIN` | Full product CRUD and profile management |
| `user` | `password` | `ROLE_USER` | View-only product access and profile management |

## Local Development

### Backend

```bash
cd backend
mvn spring-boot:run
```

Default local backend URL:

- `http://localhost:8081`
- Swagger: `http://localhost:8081/swagger-ui.html`

### Frontend

```bash
cd frontend
npm install
npm start
```

Default local frontend URL:

- `http://localhost:3001`

## Environment Variables

### Backend

You can use these env vars locally or on your hosting provider:

- `PORT`
- `APP_FRONTEND_BASE_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_JWT_EXPIRATION_MS`

Sample values are in [backend/.env.example](D:\busybrains\backend\.env.example).

### Frontend

- `REACT_APP_API_BASE_URL`

Sample value is in [frontend/.env.example](D:\busybrains\frontend\.env.example).

## Google OAuth Setup

Create a Google OAuth 2.0 Web Application and configure:

- Authorized JavaScript origin for local dev:
  - `http://localhost:3001`
- Authorized redirect URI for local dev:
  - `http://localhost:8081/login/oauth2/code/google`

For production, add your deployed frontend domain as an authorized JavaScript origin and your deployed backend domain as an authorized redirect URI:

- JavaScript origin example:
  - `https://your-frontend.vercel.app`
- Redirect URI example:
  - `https://your-backend.onrender.com/login/oauth2/code/google`

Do not commit your real Google client secret to GitHub.

## Deployment Architecture

For a fully functional deployment, use:

- Frontend on Vercel or Netlify
- Backend on a Java-capable host such as Render or Railway

The frontend is static and deploys cleanly to Vercel or Netlify. The Spring Boot backend should be deployed separately and exposed over HTTPS, then the frontend should point to it with `REACT_APP_API_BASE_URL`.

## Frontend Deployment

### Vercel

The frontend already includes [frontend/vercel.json](D:\busybrains\frontend\vercel.json) for SPA rewrites.

In Vercel:

1. Import the repo.
2. Set the project root to `frontend`.
3. Add env var:
   - `REACT_APP_API_BASE_URL=https://your-backend-domain`
4. Deploy.

### Netlify

The frontend already includes [frontend/netlify.toml](D:\busybrains\frontend\netlify.toml) for build settings and SPA routing.

In Netlify:

1. Import the repo.
2. Set the base directory to `frontend`.
3. Build command:
   - `npm run build`
4. Publish directory:
   - `build`
5. Add env var:
   - `REACT_APP_API_BASE_URL=https://your-backend-domain`
6. Deploy.

## Backend Deployment

The backend includes [backend/Dockerfile](D:\busybrains\backend\Dockerfile), which makes it easy to deploy to Render, Railway, or another container-friendly provider.
For Render, the repo also includes [render.yaml](D:\busybrains\render.yaml) so you can create the backend service from the repository with the expected health check and environment variables.

Minimum production env vars:

- `PORT`
- `APP_FRONTEND_BASE_URL=https://your-frontend-domain`
- `APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`

If you deploy the backend publicly and use Google SSO, add this exact redirect URI in Google Cloud:

- `https://your-backend-domain/login/oauth2/code/google`

## GitHub Push To Another Account

If you want to push this code to another GitHub account:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR-OTHER-ACCOUNT/YOUR-REPO.git
git add .
git commit -m "Prepare BusyBrains app for deployment"
git push -u origin main
```

If your current root repo still has nested Git history under `frontend`, use the clean submission copy instead:

- `D:\busybrains-submission`

## Verification

Verified locally:

- Backend packaging: `mvn -q package`
- Frontend tests: `npm test -- --watchAll=false`
- Frontend build: `npm run build`
- Admin login and product CRUD
- User login and RBAC restrictions
- Profile update and password change

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
`-- README.md
```
