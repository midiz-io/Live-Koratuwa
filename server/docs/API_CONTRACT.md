# Interactive Garden Experience - API Contract

## Overview
This is a **VIEW-TRACKING** webapp only (no booking/picking). The goal is to serve garden box information and track which boxes visitors opened per session.

## Authentication
- **Public API**: No authentication required, uses sessionKey for tracking
- **Admin API**: JWT token required for all admin endpoints
- **Session Management**: Auto-detected IP + language selection

---

## PUBLIC API (Visitor Side)

### 1️⃣ POST /api/session/start
**Purpose**: Initialize a visitor session

**Request Body**:
```json
{
  "ipAddress": "<auto-detected on backend>",
  "language": "en" | "si" | "zh" | "fr" | "de" | "ja" | "ru" | "hi" | "ar" | "es"
}
```

**Response**:
```json
{
  "sessionKey": "uuid-string",
  "language": "en",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `201` - Session created successfully
- `400` - Invalid language or missing fields
- `500` - Server error

---

### 2️⃣ GET /api/boxes
**Purpose**: Get list of all garden boxes for rendering on map

**Query Parameters**:
- `sessionKey` (required) - UUID session identifier

**Response**:
```json
[
  {
    "id": 1,
    "number": 1,
    "name": "Tomatoes",
    "description": "Freshly grown organic tomatoes rich in nutrients and antioxidants.",
    "visited": true
  },
  {
    "id": 2,
    "number": 2,
    "name": "Bell Peppers",
    "description": "Colorful bell peppers in red, yellow, and green varieties.",
    "visited": false
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Invalid sessionKey
- `500` - Server error

---

### 3️⃣ GET /api/boxes/:id
**Purpose**: Get full details of a single garden box

**Path Parameters**:
- `id` (required) - Box ID

**Query Parameters**:
- `sessionKey` (required) - UUID session identifier

**Response**:
```json
{
  "id": 1,
  "number": 1,
  "name": "Tomatoes",
  "description": "Freshly grown organic tomatoes rich in nutrients and antioxidants.",
  "images": []
}
```

**Status Codes**:
- `200` - Success
- `401` - Invalid sessionKey
- `404` - Box not found
- `500` - Server error

---

### 4️⃣ POST /api/visit
**Purpose**: Mark a box as visited

**Request Body**:
```json
{
  "sessionKey": "uuid-string",
  "boxId": 1
}
```

**Response**:
```json
{
  "success": true,
  "boxId": 1,
  "visitedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200` - Visit recorded successfully
- `400` - Invalid request body
- `401` - Invalid sessionKey
- `404` - Box not found
- `500` - Server error

---

## ADMIN API (Dashboard)

### 5️⃣ POST /api/admin/login
**Purpose**: Authenticate admin user

**Request Body**:
```json
{
  "email": "admin@local",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "jwt-token-string",
  "admin": {
    "id": 1,
    "email": "admin@local"
  }
}
```

**Status Codes**:
- `200` - Login successful
- `401` - Invalid credentials
- `500` - Server error

---

### 6️⃣ GET /api/admin/stats/overview
**Purpose**: High level analytics dashboard

**Headers**:
- `Authorization: Bearer <jwt-token>`

**Response**:
```json
{
  "totalSessions": 1250,
  "totalViews": 3420,
  "topLanguages": [
    { "lang": "en", "count": 100 },
    { "lang": "si", "count": 70 },
    { "lang": "zh", "count": 45 }
  ],
  "recentActivity": {
    "sessionsToday": 25,
    "viewsToday": 67
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Invalid or missing JWT token
- `500` - Server error

---

### 7️⃣ GET /api/admin/stats/boxes
**Purpose**: Show popularity of each box

**Headers**:
- `Authorization: Bearer <jwt-token>`

**Response**:
```json
[
  {
    "boxId": 1,
    "number": 1,
    "name": "Tomatoes",
    "views": 87,
    "popularity": 0.15
  },
  {
    "boxId": 2,
    "number": 2,
    "name": "Bell Peppers",
    "views": 65,
    "popularity": 0.12
  }
]
```

**Status Codes**:
- `200` - Success
- `401` - Invalid or missing JWT token
- `500` - Server error

---

### 8️⃣ GET /api/admin/stats/language-trend
**Purpose**: Language usage analytics over time

**Headers**:
- `Authorization: Bearer <jwt-token>`

**Response**:
```json
[
  { "language": "en", "count": 140, "percentage": 45.2 },
  { "language": "si", "count": 88, "percentage": 28.4 },
  { "language": "zh", "count": 35, "percentage": 11.3 },
  { "language": "fr", "count": 25, "percentage": 8.1 },
  { "language": "de", "count": 22, "percentage": 7.1 }
]
```

**Status Codes**:
- `200` - Success
- `401` - Invalid or missing JWT token
- `500` - Server error

---

## Error Response Format

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}
```

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid sessionKey or JWT)
- `404` - Not Found
- `500` - Internal Server Error

## Language Support

Supported languages:
- `en` - English
- `si` - Sinhala
- `zh` - Chinese
- `fr` - French
- `de` - German
- `ja` - Japanese
- `ru` - Russian
- `hi` - Hindi
- `ar` - Arabic
- `es` - Spanish

## Session Management

- Sessions are tied to IP addresses
- SessionKey is a UUID generated on session start
- Language preference is stored in session
- Sessions persist for 24 hours
- No refresh tokens needed for MVP
