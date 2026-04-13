# Assignment 3 – Developer Documentation

## 1. Overview

This API provides authenticated access to mail messages for a corporate mail system, with role-based access control, request logging, rate limiting, and centralized error handling. Clients must log in to receive a JWT token and include it in subsequent requests.

---

## 2. Authentication

### 2.1 Auth Method

- Scheme: Bearer token (JWT, signed with HS256)
- Tokens expire after **1 hour**
- How to obtain a token:
  - Endpoint: `POST /auth/login`
  - Request body format:
```json
    {
      "username": "user1",
      "password": "user123"
    }
```
  - Example success response:
```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
```

### 2.2 Using the Token

- Required header for authenticated requests:
  - `Authorization: Bearer <token>`
- If the header is missing, malformed, or the token is expired/invalid, the API returns `401 Unauthorized`.

---

## 3. Roles & Access Rules

- `admin`
  - Can view any mail message regardless of ownership.
- `user`
  - Can only view their own mail messages where `mail.userId` matches their `userId`.

| Endpoint       | Method | admin        | user             |
|----------------|--------|--------------|------------------|
| `/auth/login`  | POST   | ✅ open       | ✅ open           |
| `/status`      | GET    | ✅ open       | ✅ open           |
| `/mail/:id`    | GET    | ✅ all mail   | ✅ own mail only  |

---

## 4. Endpoints

### 4.1 `POST /auth/login`

**Description:**  
Authenticate with username/password and receive a JWT.

**Request Body:**

```json
{
  "username": "user1",
  "password": "user123"
}
```

**Success Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Failure reasons:**

| Scenario | Status | error |
|---|---|---|
| Missing username or password | 400 | `BadRequest` |
| Wrong credentials | 401 | `Unauthorized` |

---

### 4.2 `GET /mail/:id`

**Description:**
Retrieve a single mail message by ID.

**Authentication:**

* Requires `Authorization: Bearer <token>` header.

**Access Rules:**

* `admin`: may view any mail ID.
* `user`: may view only mail where `mail.userId` matches their own `userId`.

**Example Request:**

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```

**Example Success Response (200):**

```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

**Example Forbidden Response (403):**

```json
{
  "error": "Forbidden",
  "message": "Forbidden. You do not have permission to access this resource.",
  "statusCode": 403,
  "requestId": "04a455c6-8cc0-41e8-bc1e-d1dd242f518e",
  "timestamp": "2026-04-13T17:44:17.428Z"
}
```

---

### 4.3 `GET /status`

**Description:**
Simple health check to confirm the API is running.

**Authentication:**

* None required.

**Example Response (200):**

```json
{
  "status": "ok"
}
```

---

## 5. Rate Limiting

* Keyed by: `userId` from the JWT token.
* Limit: `RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_SECONDS` (default: 5 requests per 60 seconds).
* Strategy: fixed-window — counter resets after the window expires.
* Applied to: `GET /mail/:id`
* A `Retry-After` header is included in the response indicating seconds to wait.

Example response when limit is exceeded:

```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Try again in 60 second(s).",
  "statusCode": 429,
  "requestId": "e89431e9-8549-4dbe-aad2-4948f877958f",
  "timestamp": "2026-04-13T18:09:51.871Z"
}
```

---

## 6. Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": "ErrorCategory",
  "message": "A safe explanation.",
  "statusCode": 403,
  "requestId": "04a455c6-8cc0-41e8-bc1e-d1dd242f518e",
  "timestamp": "2026-04-13T17:44:17.428Z"
}
```

| `error` value         | Status | When |
|-----------------------|--------|------|
| `BadRequest`          | 400    | Missing or invalid input |
| `Unauthorized`        | 401    | Missing, invalid or expired token |
| `Forbidden`           | 403    | Authenticated but no permission |
| `NotFound`            | 404    | Resource does not exist |
| `TooManyRequests`     | 429    | Rate limit exceeded |
| `InternalServerError` | 500    | Unexpected server error |

Stack traces and internal details are never exposed to the client.

---

## 7. Example Flows

### 7.1 Happy Path: Login + Access Own Mail

**Step 1 — Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "user123"}'
```
Response:
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Step 2 — Access own mail:**
```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```
Response (200):
```json
{
  "id": 2,
  "userId": 2,
  "subject": "Hello User1",
  "body": "Your report is ready."
}
```

---

### 7.2 Error Path: User Accessing Someone Else's Mail

Login as `user1`, then attempt to read mail id 1 (belongs to admin):

```bash
curl http://localhost:3000/mail/1 \
  -H "Authorization: Bearer <token>"
```
Response (403):
```json
{
  "error": "Forbidden",
  "message": "Forbidden. You do not have permission to access this resource.",
  "statusCode": 403,
  "requestId": "04a455c6-8cc0-41e8-bc1e-d1dd242f518e",
  "timestamp": "2026-04-13T17:44:17.428Z"
}
```

---

### 7.3 Error Path: Rate Limit Exceeded

After 5 requests within 60 seconds:

```bash
curl http://localhost:3000/mail/2 \
  -H "Authorization: Bearer <token>"
```
Response (429):
```json
{
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Try again in 60 second(s).",
  "statusCode": 429,
  "requestId": "e89431e9-8549-4dbe-aad2-4948f877958f",
  "timestamp": "2026-04-13T18:09:51.871Z"
}