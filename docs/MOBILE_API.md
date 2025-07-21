# SPARKS Mobile API Documentation

## Overview

The SPARKS Mobile API provides a comprehensive set of endpoints for mobile applications to interact with the SPARKS platform. This API uses JWT-based authentication and follows RESTful conventions.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The mobile API uses JWT (JSON Web Token) based authentication. All authenticated endpoints require a Bearer token in the Authorization header.

### Authentication Flow

1. **Login** → Receive access & refresh tokens
2. **Use access token** → Include in all API requests
3. **Token expires** → Use refresh token to get new access token
4. **Logout** → Invalidate tokens

### Token Lifecycle

- **Access Token**: Valid for 1 hour
- **Refresh Token**: Valid for 7 days

## Authentication Endpoints

### 1. Login with Credentials

Authenticate using email and password.

**Endpoint:** `POST /api/auth/mobile/credentials`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-20T15:30:00.000Z"
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

### 2. Login with Google

Authenticate using Google OAuth.

**Endpoint:** `POST /api/auth/mobile/google`

**Request Body:**
```json
{
  "idToken": "google-id-token-from-google-sign-in"
}
```

**Response:** Same as credentials login

**Error Responses:**
- `400` - Missing ID token
- `401` - Invalid Google token
- `500` - Server error

### 3. Refresh Token

Get a new access token using your refresh token.

**Endpoint:** `POST /api/auth/mobile/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-01-20T15:30:00.000Z"
}
```

**Error Responses:**
- `400` - Missing refresh token
- `401` - Invalid or expired refresh token
- `500` - Server error

### 4. Logout

Invalidate the current session.

**Endpoint:** `POST /api/auth/mobile/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### 5. Get Current User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/auth/mobile/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

## Mobile Feature Endpoints

All endpoints below require authentication via Bearer token in the Authorization header.

### 1. Dashboard

Get patient dashboard data including stats and recent activities.

**Endpoint:** `GET /api/mobile/dashboard`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "patient": {
    "id": "patient123",
    "userId": "user123",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "stats": {
    "totalSessions": 12,
    "completedSessions": 8,
    "upcomingSessions": 2,
    "cancelledSessions": 2,
    "weeklyStreak": 3
  },
  "upcomingSessions": [
    {
      "id": "session123",
      "sessionDate": "2024-01-25T10:00:00.000Z",
      "status": "SCHEDULED",
      "therapist": {
        "user": {
          "name": "Dr. Smith"
        }
      }
    }
  ],
  "recentSessions": [
    {
      "id": "session124",
      "sessionDate": "2024-01-18T10:00:00.000Z",
      "status": "COMPLETED",
      "therapist": {
        "user": {
          "name": "Dr. Smith"
        }
      }
    }
  ]
}
```

### 2. Patient Profile

Manage patient profile information.

#### Get Profile
**Endpoint:** `GET /api/mobile/profile`

**Response:**
```json
{
  "patient": {
    "id": "patient123",
    "userId": "user123",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+0987654321",
      "relationship": "Spouse"
    },
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Update Profile
**Endpoint:** `PATCH /api/mobile/profile`

**Request Body:**
```json
{
  "name": "John Smith",
  "dateOfBirth": "1990-01-15",
  "phone": "+1234567890",
  "address": "456 New Street",
  "emergencyContact": {
    "name": "Jane Smith",
    "phone": "+0987654321",
    "relationship": "Spouse"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "patient": {
    // Updated patient object
  }
}
```

#### Update Password
**Endpoint:** `POST /api/mobile/profile/password`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### 3. Therapists

Browse and view therapist information.

#### List All Therapists
**Endpoint:** `GET /api/mobile/therapists`

**Query Parameters:**
- `specialization` (optional) - Filter by specialization
- `availability` (optional) - Filter by availability (true/false)

**Response:**
```json
{
  "therapists": [
    {
      "id": "therapist123",
      "specialization": "ADHD, Anxiety",
      "yearsOfExperience": 10,
      "bio": "Experienced therapist specializing in ADHD...",
      "user": {
        "name": "Dr. Sarah Smith",
        "email": "sarah@example.com"
      }
    }
  ]
}
```

#### Get Therapist Details
**Endpoint:** `GET /api/mobile/therapists/{therapistId}`

**Response:**
```json
{
  "therapist": {
    "id": "therapist123",
    "specialization": "ADHD, Anxiety",
    "yearsOfExperience": 10,
    "bio": "Experienced therapist specializing in ADHD...",
    "qualifications": ["PhD Psychology", "ADHD Specialist"],
    "user": {
      "name": "Dr. Sarah Smith",
      "email": "sarah@example.com"
    },
    "availability": {
      "monday": ["09:00", "10:00", "14:00"],
      "tuesday": ["10:00", "11:00", "15:00"]
    }
  }
}
```

### 4. Therapist Assignment Request

Request assignment to a specific therapist.

**Endpoint:** `POST /api/mobile/therapist-request`

**Request Body:**
```json
{
  "therapistId": "therapist123",
  "reason": "I would like to work with Dr. Smith due to her ADHD expertise",
  "preferredSchedule": "Weekday mornings"
}
```

**Response:**
```json
{
  "message": "Therapist request submitted successfully",
  "request": {
    "id": "request123",
    "patientId": "patient123",
    "therapistId": "therapist123",
    "status": "PENDING",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

### 5. Sessions

Manage therapy sessions.

#### List Patient Sessions
**Endpoint:** `GET /api/mobile/sessions`

**Query Parameters:**
- `status` (optional) - Filter by status (SCHEDULED, COMPLETED, CANCELLED)
- `startDate` (optional) - Filter sessions after this date
- `endDate` (optional) - Filter sessions before this date

**Response:**
```json
{
  "sessions": [
    {
      "id": "session123",
      "sessionDate": "2024-01-25T10:00:00.000Z",
      "status": "SCHEDULED",
      "sessionType": "INDIVIDUAL",
      "notes": "Focus on coping strategies",
      "therapist": {
        "user": {
          "name": "Dr. Smith"
        }
      }
    }
  ]
}
```

#### Get Session Details
**Endpoint:** `GET /api/mobile/sessions/{sessionId}`

**Response:**
```json
{
  "session": {
    "id": "session123",
    "sessionDate": "2024-01-25T10:00:00.000Z",
    "status": "SCHEDULED",
    "sessionType": "INDIVIDUAL",
    "duration": 60,
    "notes": "Focus on coping strategies",
    "videoLink": "https://meet.example.com/session123",
    "therapist": {
      "id": "therapist123",
      "user": {
        "name": "Dr. Smith",
        "email": "smith@example.com"
      }
    },
    "patient": {
      "id": "patient123",
      "user": {
        "name": "John Doe"
      }
    }
  }
}
```

#### Request New Session
**Endpoint:** `POST /api/mobile/sessions/request`

**Request Body:**
```json
{
  "therapistId": "therapist123",
  "preferredDate": "2024-01-25",
  "preferredTime": "10:00",
  "sessionType": "INDIVIDUAL",
  "notes": "Would like to discuss medication management"
}
```

**Response:**
```json
{
  "message": "Session request submitted successfully",
  "request": {
    "id": "request456",
    "status": "PENDING",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

### 6. Notifications

Get user notifications.

**Endpoint:** `GET /api/mobile/notifications`

**Query Parameters:**
- `unreadOnly` (optional) - Show only unread notifications (true/false)
- `limit` (optional) - Number of notifications to return (default: 20)

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif123",
      "type": "SESSION_REMINDER",
      "title": "Upcoming Session",
      "message": "You have a session with Dr. Smith tomorrow at 10:00 AM",
      "isRead": false,
      "createdAt": "2024-01-24T10:00:00.000Z",
      "metadata": {
        "sessionId": "session123"
      }
    }
  ]
}
```

### 7. Resources

Get ADHD educational resources.

**Endpoint:** `GET /api/mobile/resources`

**Query Parameters:**
- `category` (optional) - Filter by category (ARTICLES, VIDEOS, TOOLS)
- `search` (optional) - Search resources by title or content

**Response:**
```json
{
  "resources": [
    {
      "id": "resource123",
      "title": "Understanding ADHD",
      "description": "A comprehensive guide to ADHD",
      "category": "ARTICLES",
      "url": "https://example.com/adhd-guide",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "tags": ["ADHD", "Education", "Adults"],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Best Practices

### 1. Token Management

**Store tokens securely:**
```javascript
// React Native Example
import * as SecureStore from 'expo-secure-store';

// Store tokens
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Retrieve tokens
const accessToken = await SecureStore.getItemAsync('accessToken');
```

### 2. API Request Wrapper

Create a wrapper function to handle authentication:

```javascript
async function apiRequest(endpoint, options = {}) {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry request with new token
      return apiRequest(endpoint, options);
    } else {
      // Redirect to login
      navigateToLogin();
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}
```

### 3. Token Refresh Logic

Implement automatic token refresh:

```javascript
async function refreshAccessToken() {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    
    const response = await fetch(`${BASE_URL}/api/auth/mobile/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken, expiresAt } = await response.json();
      await SecureStore.setItemAsync('accessToken', accessToken);
      return accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
```

### 4. Error Handling

Implement comprehensive error handling:

```javascript
try {
  const data = await apiRequest('/api/mobile/dashboard');
  // Handle success
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // Handle auth errors
  } else if (error.message.includes('Network')) {
    // Handle network errors
  } else {
    // Handle other errors
  }
}
```

### 5. Offline Support

Consider implementing offline support:

```javascript
import NetInfo from '@react-native-community/netinfo';

async function apiRequestWithOfflineSupport(endpoint, options) {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    // Return cached data or queue request
    return getCachedData(endpoint);
  }
  
  try {
    const data = await apiRequest(endpoint, options);
    // Cache the response
    await cacheData(endpoint, data);
    return data;
  } catch (error) {
    // Fallback to cache on error
    return getCachedData(endpoint);
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

## Webhooks (Future Implementation)

Webhooks for real-time updates are planned for:
- Session status changes
- New notifications
- Therapist availability updates

## Support

For API support or to report issues:
- Email: api-support@sparks.com
- Documentation: https://docs.sparks.com/mobile-api
- Status Page: https://status.sparks.com