# Modular Express Bookshop API with JWT Session Middleware and Multi-Router Architecture

A Node.js Express REST API implementing a book review platform with modular router decomposition, JWT-based session authentication, and Promise-driven route handlers. Features three distinct routing layers (auth, general, booksdb) with role-based review write access.

---

## Architecture Overview

### Request Pipeline

```
Client Request
  |
  v
[Express JSON Parser]              -- Body deserialization
  |
  v
[Session Middleware]               -- /customer/* session binding
  |
  v
[JWT Auth Middleware]              -- /customer/auth/* token verification
  |
  v
[Router Selection]
  |-- /customer/*  -> auth_users.js (authenticated routes)
  |-- /*           -> general.js    (public routes)
  |
  v
[Controller Logic]                 -- Business rules, data mutation
  |
  v
[booksdb.js]                       -- In-memory book database (10 entries)
```

### Router Decomposition

| Router | Prefix | Middleware | Responsibility |
|:---|:---|:---|:---|
| `auth_users.js` | `/customer` | JWT verification | Login, register, review add/delete |
| `general.js` | `/` | None | Book listing, search by ISBN/author/title |
| `booksdb.js` | - | None | In-memory book data store (10 entries) |

### Authentication Flow

```
1. POST /customer/register  { "username": "alice", "password": "s3cret" }
2. POST /customer/login     { "username": "alice", "password": "s3cret" }
   -> Server creates JWT, stores in session.authorization.accessToken
3. POST /customer/auth/review/1  ?review=Excellent
   -> JWT middleware validates token, injects req.user
   -> Controller writes review to booksdb[isbn].reviews[username]
```

### Key Design Decisions

- **Session-Bound JWT**: Tokens are stored in `express-session` rather than client-side storage, enabling server-side session invalidation via `session.destroy()`.
- **Per-User Review Scoping**: Reviews are keyed by `(isbn, username)`, allowing each user one review per book with overwrite semantics.
- **Promise-Wrapped Data Access**: `general.js` wraps synchronous array lookups in Promises for consistent async patterns, preparing for future database migration.
- **Conditional Middleware Application**: JWT middleware is applied only to `/customer/auth/*` routes, leaving public endpoints unauthenticated.

---

## Technical Stack Matrix

| Component | Technology | Version | Role |
|:---|:---|:---|:---|
| Runtime | Node.js | 18+ | JavaScript execution engine |
| Framework | Express | ^4.18.1 | HTTP routing, middleware pipeline |
| Auth Tokens | jsonwebtoken | ^9.0.3 | JWT sign/verify lifecycle |
| Session Store | express-session | ^1.17.3 | Server-side session persistence |
| HTTP Client | axios | ^1.13.5 | External API communication |
| Dev Server | nodemon | ^3.1.11 | Auto-restart on file changes |
| Module System | CommonJS | - | `require()`/`module.exports` |

---

## Operational Blueprint

### Prerequisites

- Node.js 18+ (via NVM recommended)
- npm 9+

### Local Setup

```bash
# Clone the repository
git clone https://github.com/amrbassal98-ux/expressBookReviews.git
cd expressBookReviews/final_project

# Install dependencies (user-space, no sudo)
npm install

# Start the development server
npm start
```

The server boots on `http://localhost:5000`.

### API Endpoints

| Method | Path | Auth Required | Description |
|:---|:---|:---|:---|
| `POST` | `/customer/register` | No | Register new user |
| `POST` | `/customer/login` | No | Authenticate, receive JWT session |
| `GET` | `/` | No | List all books |
| `GET` | `/isbn/:isbn` | No | Get book by ISBN |
| `GET` | `/author/:author` | No | Get books by author |
| `GET` | `/title/:title` | No | Get books by title |
| `GET` | `/review/:isbn` | No | Get reviews for a book |
| `PUT` | `/customer/auth/review/:isbn` | Yes | Add/update review for a book |
| `DELETE` | `/customer/auth/review/:isbn` | Yes | Delete your review for a book |

---

## Project Structure

```
expressBookReviews/
  final_project/
    index.js                    # Application entry, middleware wiring
    package.json                # Dependencies and scripts
    router/
      auth_users.js             # Authenticated routes: login, register, reviews
      general.js                # Public routes: book listing, search
      booksdb.js                # In-memory book database (10 entries)
  .gitignore
  LICENSE
```

---

## Architectural Modernization Roadmap

### 1. Containerized Multi-Stage Dockerfile

Implement a two-stage Docker build: Stage 1 uses `node:18-alpine` to install production dependencies; Stage 2 copies only `node_modules/` and application code into a minimal runtime image. Add a `.dockerignore` excluding `.git/`, `node_modules/`, and `.DS_Store`. This produces a sub-40MB deployable artifact suitable for Kubernetes or Cloud Foundry.

### 2. Structural Input Validation with Joi

Replace manual `if (!req.body)` guards with Joi schema validation middleware. Define `registerSchema`, `loginSchema`, and `reviewSchema` as reusable validation chains enforcing type constraints, string length limits, and pattern matching (e.g., ISBN format validation). Attach validation errors to a structured `{ error: { field, message } }` response format for client-side consumption.

### 3. OpenAPI 3.0 Specification Layer

Generate a machine-readable API specification using `swagger-jsdoc` route-level JSDoc annotations. Serve the spec via `swagger-ui-express` at `/api-docs`. This enables automated client SDK generation, Postman collection import, contract testing with `prism`, and integration with API management gateways.

---

*Part of the IBM Full-Stack Cloud Developer Professional Certificate portfolio.*
