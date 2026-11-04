# API Contract Summary - STEP C Ready

## Overview
Complete API contract defined for the **VIEW-TRACKING** webapp. All endpoints are stubbed and ready for implementation.

## Endpoint Summary

### 🌐 PUBLIC API (Visitor Side)
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/session/start` | Initialize visitor session | None |
| GET | `/api/boxes` | List all garden boxes | sessionKey |
| GET | `/api/boxes/:id` | Get single box details | sessionKey |
| POST | `/api/visit` | Mark box as visited | sessionKey |

### 🔐 ADMIN API (Dashboard)
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/admin/login` | Admin authentication | None |
| GET | `/api/admin/stats/overview` | High-level analytics | JWT |
| GET | `/api/admin/stats/boxes` | Box popularity stats | JWT |
| GET | `/api/admin/stats/language-trend` | Language usage analytics | JWT |

## Key Features

### ✅ Session Management
- **Auto IP Detection**: Backend detects visitor IP automatically
- **UUID SessionKey**: Unique identifier for each visitor session
- **Language Binding**: Language preference stored in session
- **24-hour Persistence**: Sessions last 24 hours

### ✅ View Tracking
- **Box Visit Recording**: Track which boxes each visitor views
- **Language Analytics**: Store language used for each view
- **Duplicate Prevention**: Unique constraint prevents duplicate views
- **Real-time Updates**: Visited status updates immediately

### ✅ Multilingual Support
- **10 Languages**: EN, SI, ZH, FR, DE, JA, RU, HI, AR, ES
- **Dynamic Translation**: Names/descriptions translated based on session language
- **Language Analytics**: Track which languages are most popular

### ✅ Admin Dashboard
- **JWT Authentication**: Secure admin access
- **Overview Stats**: Total sessions, views, top languages
- **Box Popularity**: Most viewed garden boxes
- **Language Trends**: Usage analytics by language

## Request/Response Examples

### Session Start
```bash
POST /api/session/start
{
  "ipAddress": "127.0.0.1",
  "language": "en"
}

Response:
{
  "sessionKey": "uuid-string",
  "language": "en",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Boxes
```bash
GET /api/boxes?sessionKey=uuid-string

Response:
[
  {
    "id": 1,
    "number": 1,
    "name": "Tomatoes",
    "description": "Freshly grown organic tomatoes...",
    "visited": false
  }
]
```

### Record Visit
```bash
POST /api/visit
{
  "sessionKey": "uuid-string",
  "boxId": 1
}

Response:
{
  "success": true,
  "boxId": 1,
  "visitedAt": "2024-01-01T00:00:00.000Z"
}
```

## Implementation Status

### ✅ Completed
- [x] API contract documentation
- [x] Route stubs with validation
- [x] Error handling structure
- [x] JWT middleware for admin routes
- [x] Request/response validation
- [x] Test script for endpoint verification

### 🔄 Ready for STEP C
- [ ] Database integration with Prisma
- [ ] Session creation and management
- [ ] Box listing with translation
- [ ] Visit tracking implementation
- [ ] Admin authentication
- [ ] Analytics queries
- [ ] Error handling refinement

## Files Created

### Documentation
- `server/docs/API_CONTRACT.md` - Complete API specification
- `server/docs/API_SUMMARY.md` - This summary document

### Route Files
- `server/routes/session.js` - Session management endpoints
- `server/routes/boxes.js` - Garden box endpoints
- `server/routes/visit.js` - Visit tracking endpoints
- `server/routes/admin.js` - Admin dashboard endpoints

### Testing
- `server/test-api-stubs.js` - Endpoint testing script

## Next Steps (STEP C)

1. **Database Integration**: Connect routes to Prisma models
2. **Session Logic**: Implement session creation and validation
3. **Translation Logic**: Add language-based content translation
4. **Visit Tracking**: Implement view recording with analytics
5. **Admin Auth**: Complete JWT authentication flow
6. **Analytics Queries**: Build dashboard statistics queries
7. **Error Handling**: Refine error responses and validation

---

**Status**: API Contract Complete ✅  
**Ready for**: STEP C - API Implementation
