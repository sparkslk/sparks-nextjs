# Mobile API Documentation - Patient Features

## Base URL
```
http://localhost:3000/api/mobile
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## 1. Dashboard

### Get Dashboard Data
**GET** `/dashboard`

Returns comprehensive dashboard data for the patient.

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string"
  },
  "patient": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "string"
  },
  "hasProfile": true,
  "therapist": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "specializations": ["string"]
  },
  "stats": {
    "upcomingSessions": 0,
    "completedSessions": 0,
    "totalSessions": 0,
    "nextSession": {
      "id": "string",
      "type": "string",
      "scheduledAt": "datetime",
      "therapistName": "string"
    },
    "unreadNotifications": 0
  },
  "recentActivity": [
    {
      "id": "string",
      "type": "session|notification",
      "title": "string",
      "description": "string",
      "date": "datetime",
      "icon": "string"
    }
  ],
  "quickActions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string",
      "action": "string"
    }
  ]
}
```

---

## 2. Therapist Management

### Browse Therapists
**GET** `/therapists`

Query Parameters:
- `specialty`: Filter by specialization
- `minRating`: Minimum rating (0-5)
- `maxCost`: Maximum session cost
- `availability`: "today" | "thisWeek"
- `search`: Search by name or bio

**Response:**
```json
{
  "therapists": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "email": "string",
      "image": "string",
      "bio": "string",
      "qualifications": ["string"],
      "specializations": ["string"],
      "experienceYears": 0,
      "sessionRate": 0,
      "rating": 0,
      "patientCount": 0,
      "sessionCount": 0,
      "isMyTherapist": false
    }
  ],
  "currentTherapist": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string"
  },
  "hasTherapist": false
}
```

### Get Therapist Details
**GET** `/therapists/{therapistId}`

**Response:**
```json
{
  "therapist": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "bio": "string",
    "qualifications": ["string"],
    "specializations": ["string"],
    "experienceYears": 0,
    "sessionRate": 0,
    "rating": 0,
    "consultationMode": "string",
    "languages": ["string"],
    "isMyTherapist": false,
    "averageSessionDuration": 60,
    "bookedSlots": [
      {
        "date": "datetime",
        "duration": 60
      }
    ]
  }
}
```

### Request Therapist Assignment
**POST** `/therapist-request`

**Body:**
```json
{
  "therapistId": "string",
  "message": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Therapist assignment request sent successfully",
  "requestId": "string",
  "therapist": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

### Get Assignment Status
**GET** `/therapist-request`

**Response:**
```json
{
  "hasProfile": true,
  "hasTherapist": false,
  "currentTherapist": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "specializations": ["string"],
    "assignedAt": "datetime"
  },
  "pendingRequests": [
    {
      "id": "string",
      "therapistId": "string",
      "therapistName": "string",
      "requestedAt": "datetime",
      "status": "pending"
    }
  ]
}
```

---

## 3. Session Management

### Get Sessions
**GET** `/sessions`

Query Parameters:
- `status`: Filter by status (PENDING, SCHEDULED, COMPLETED, etc.)
- `timeframe`: "upcoming" | "past" | "all"
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "sessions": [
    {
      "id": "string",
      "type": "INDIVIDUAL_THERAPY",
      "status": "SCHEDULED",
      "scheduledAt": "datetime",
      "duration": 60,
      "location": "string",
      "notes": "string",
      "isUrgent": false,
      "therapist": {
        "id": "string",
        "name": "string",
        "email": "string",
        "image": "string"
      },
      "isPast": false,
      "canCancel": true
    }
  ],
  "total": 0,
  "hasMore": false,
  "statistics": {
    "total": 0,
    "pending": 0,
    "scheduled": 0,
    "completed": 0,
    "cancelled": 0,
    "noShow": 0
  }
}
```

### Request New Session
**POST** `/sessions/request`

**Body:**
```json
{
  "sessionType": "INDIVIDUAL_THERAPY",
  "preferredDate": "2024-01-15",
  "preferredTime": "14:00",
  "duration": 60,
  "notes": "string (optional)",
  "isUrgent": false
}
```

Session Types:
- INDIVIDUAL_THERAPY
- GROUP_THERAPY
- FAMILY_THERAPY
- COUPLES_THERAPY
- CHILD_THERAPY
- CONSULTATION

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "string",
    "type": "string",
    "scheduledAt": "datetime",
    "duration": 60,
    "status": "PENDING",
    "therapist": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
}
```

### Get Available Time Slots
**GET** `/sessions/request?date=2024-01-15&therapistId=xxx`

**Response:**
```json
{
  "date": "2024-01-15",
  "therapistId": "string",
  "availableSlots": [
    {
      "time": "2024-01-15T14:00:00Z",
      "displayTime": "2:00 PM"
    }
  ],
  "workingHours": {
    "start": "9:00",
    "end": "17:00"
  }
}
```

### Get Session Details
**GET** `/sessions/{sessionId}`

**Response:**
```json
{
  "session": {
    "id": "string",
    "type": "string",
    "status": "string",
    "scheduledAt": "datetime",
    "duration": 60,
    "location": "string",
    "notes": "string",
    "isUrgent": false,
    "cancelReason": "string",
    "completedAt": "datetime",
    "therapistNotes": "string",
    "therapist": {
      "id": "string",
      "name": "string",
      "email": "string",
      "image": "string",
      "specializations": ["string"],
      "sessionRate": 150
    },
    "isPast": false,
    "canCancel": true,
    "canReschedule": true
  }
}
```

### Cancel Session
**DELETE** `/sessions/{sessionId}`

**Body:**
```json
{
  "reason": "string (optional)"
}
```

### Reschedule Session
**PATCH** `/sessions/{sessionId}`

**Body:**
```json
{
  "newDate": "2024-01-20",
  "newTime": "15:00",
  "reason": "string (optional)"
}
```

---

## 4. Profile Management

### Get Profile
**GET** `/profile`

**Response:**
```json
{
  "hasProfile": true,
  "profile": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "MALE|FEMALE|OTHER",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "emergencyContactName": "string",
    "emergencyContactPhone": "string",
    "emergencyContactRelation": "string",
    "medicalHistory": "string",
    "currentMedications": "string",
    "allergies": "string",
    "previousTherapy": false,
    "reasonForTherapy": "string",
    "goals": "string",
    "email": "string",
    "image": "string",
    "therapist": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
}
```

### Create Profile
**POST** `/profile`

**Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "dateOfBirth": "date (required)",
  "gender": "MALE|FEMALE|OTHER (required)",
  "phone": "string (required)",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string",
  "emergencyContactRelation": "string",
  "medicalHistory": "string",
  "currentMedications": "string",
  "allergies": "string",
  "previousTherapy": false,
  "reasonForTherapy": "string",
  "goals": "string"
}
```

### Update Profile
**PATCH** `/profile`

**Body:** Same as create, but all fields are optional

---

## 5. Notifications

### Get Notifications
**GET** `/notifications`

Query Parameters:
- `unreadOnly`: true/false
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "SYSTEM|SESSION_REQUEST|SESSION_UPDATE",
      "title": "string",
      "message": "string",
      "isRead": false,
      "isUrgent": false,
      "createdAt": "datetime",
      "relatedId": "string",
      "sender": {
        "id": "string",
        "name": "string",
        "email": "string",
        "image": "string"
      }
    }
  ],
  "total": 0,
  "unreadCount": 0,
  "hasMore": false
}
```

### Mark Notifications as Read
**PATCH** `/notifications`

**Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  "markAll": false
}
```

---

## 6. Resources

### Get ADHD Resources
**GET** `/resources`

**Response:**
```json
{
  "resources": {
    "educational": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "education",
        "type": "article",
        "url": "string",
        "icon": "string"
      }
    ],
    "tools": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "tool",
        "type": "interactive",
        "action": "string",
        "icon": "string"
      }
    ],
    "supportGroups": [...],
    "emergencyContacts": [...],
    "exercises": [...],
    "tips": [...]
  },
  "savedResourceIds": ["1", "4", "5"],
  "categories": [
    {
      "id": "string",
      "name": "string",
      "count": 0
    }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Flutter Integration Example

```dart
class PatientApiService {
  static const String baseUrl = 'http://localhost:3000/api/mobile';
  
  // Dashboard
  static Future<Map<String, dynamic>> getDashboard() async {
    final token = await getAccessToken();
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    return _handleResponse(response);
  }

  // Therapists
  static Future<Map<String, dynamic>> getTherapists({
    String? specialty,
    double? minRating,
    double? maxCost,
    String? search,
  }) async {
    final token = await getAccessToken();
    final queryParams = <String, String>{};
    
    if (specialty != null) queryParams['specialty'] = specialty;
    if (minRating != null) queryParams['minRating'] = minRating.toString();
    if (maxCost != null) queryParams['maxCost'] = maxCost.toString();
    if (search != null) queryParams['search'] = search;
    
    final uri = Uri.parse('$baseUrl/therapists').replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    return _handleResponse(response);
  }

  // Session Request
  static Future<Map<String, dynamic>> requestSession({
    required String sessionType,
    required String preferredDate,
    required String preferredTime,
    int duration = 60,
    String? notes,
    bool isUrgent = false,
  }) async {
    final token = await getAccessToken();
    final response = await http.post(
      Uri.parse('$baseUrl/sessions/request'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'sessionType': sessionType,
        'preferredDate': preferredDate,
        'preferredTime': preferredTime,
        'duration': duration,
        'notes': notes,
        'isUrgent': isUrgent,
      }),
    );
    return _handleResponse(response);
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }
}
```