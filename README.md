# BusyBrains E-Commerce Application

This project is a full-stack e-commerce demo built with React on the frontend and Spring Boot on the backend. It includes local JWT authentication, OAuth2/OpenID Connect single sign-on, role-based access control, product management, and user profile management.

## Features

- User registration and login with JWT
- OAuth2 / OpenID Connect login flow for providers such as Google
- Two seeded users with different roles
- Product catalog with search and category filters
- Admin-only product create, update, and delete actions
- User profile view and update
- Password change for local accounts
- Swagger UI for backend API exploration

## Seeded Users

The backend seeds these accounts automatically on startup:

| Username | Password | Role       | Access |
|----------|----------|------------|--------|
| `admin`  | `password` | `ROLE_ADMIN` | View, create, update, and delete products |
| `user`   | `password` | `ROLE_USER`  | View products only |

## Tech Stack

- Frontend: React, React Router, Axios, react-hot-toast
- Backend: Spring Boot, Spring Security, Spring Data JPA
- Authentication: JWT and OAuth2 / OIDC
- Database: H2 in-memory database by default
- Documentation: SpringDoc OpenAPI / Swagger UI

## Project Structure

```text
busybrains/
|-- backend/
|   |-- pom.xml
|   `-- src/main/
|       |-- java/com/busybrains/ecommerce/
|       `-- resources/application.properties
`-- frontend/
    |-- package.json
    `-- src/
```

## Running the Application

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend URLs:

- API base: [http://localhost:8080](http://localhost:8080)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend URL:

- App: [http://localhost:3000](http://localhost:3000)

## Authentication Flow

### Local JWT Login

1. User signs in with username and password.
2. Spring Boot validates the credentials and returns a JWT.
3. React stores the token in `localStorage`.
4. Authenticated API calls include `Authorization: Bearer <token>`.

### OAuth2 / OIDC Login

1. User clicks the SSO button on the login page.
2. Spring Security starts the provider login flow.
3. After successful provider authentication, the backend creates or links a local user.
4. The backend issues a JWT and redirects the browser to the frontend callback page.
5. React stores the JWT and signs the user into the app.

## OAuth2 Configuration

Google is wired as the example provider in `backend/src/main/resources/application.properties`.

Replace these placeholders with real credentials:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

Important local URLs:

- Backend redirect URI: `http://localhost:8080/login/oauth2/code/google`
- Frontend base URL: `http://localhost:3000`

You can add more OAuth2 providers such as Microsoft or Facebook through Spring Security client registrations if required.

## RBAC Rules

### Admin

- View all products
- Create products
- Update products
- Delete products
- View and update own profile
- Change password

### User

- View all products
- Search and filter products
- View and update own profile
- Change password
- Cannot create, update, or delete products

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` - admin only
- `PUT /api/products/{id}` - admin only
- `DELETE /api/products/{id}` - admin only

### Profile

- `GET /api/profile`
- `PUT /api/profile`
- `PUT /api/profile/change-password`

## Configuration Notes

- Default database: H2 in-memory
- Default backend port: `8080`
- Default frontend port: `3000`
- Configurable frontend API target:
  - `frontend/.env`
  - `REACT_APP_API_BASE_URL=http://localhost:8080`

## Verification

The current project has been verified with:

```bash
cd backend
mvn -q package

cd ../frontend
CI=true npm test -- --watchAll=false
npm run build
```

## Submission Note

If you plan to submit this as a single GitHub repository, make sure the final repository includes both `backend` and `frontend` folders together and that valid OAuth credentials are not committed.
