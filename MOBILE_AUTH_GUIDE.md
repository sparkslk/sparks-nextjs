# Mobile Authentication API Documentation

This documentation describes how to integrate your Flutter mobile app with the NextAuth-based authentication system.

## Overview

The mobile authentication system provides JWT-based authentication specifically designed for mobile apps, bypassing NextAuth's cookie-based session management. This allows Flutter apps to authenticate users and maintain secure sessions.

## Base URL

```
https://your-domain.com/api/auth/mobile
```

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/auth/mobile/signup`

Register a new user and receive a JWT token.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "NORMAL_USER",
  "metadata": {
    "licenseNumber": "LIC123456" // Required for THERAPIST role
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER"
  },
  "expiresAt": "2024-01-15T12:00:00.000Z"
}
```

### 2. User Sign In

**Endpoint:** `POST /api/auth/mobile/signin`

Authenticate existing user credentials.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER"
  },
  "expiresAt": "2024-01-15T12:00:00.000Z"
}
```

### 3. Google OAuth Sign In

**Endpoint:** `POST /api/auth/mobile/google`

Authenticate using Google OAuth token from mobile app.

**Request Body:**

```json
{
  "idToken": "google_id_token_from_mobile_sdk",
  "email": "john.doe@gmail.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Google authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john.doe@gmail.com",
    "name": "John Doe",
    "role": "NORMAL_USER"
  },
  "isNewUser": false,
  "expiresAt": "2024-01-15T12:00:00.000Z"
}
```

### 4. Token Refresh

**Endpoint:** `POST /api/auth/mobile/refresh`

Refresh an existing JWT token.

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER"
  },
  "expiresAt": "2024-01-15T12:00:00.000Z"
}
```

### 5. Get User Profile

**Endpoint:** `GET /api/auth/mobile/profile`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "NORMAL_USER",
    "image": "https://...",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Logout

**Endpoint:** `POST /api/auth/mobile/logout`

Logout the current user (client-side token deletion required).

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful. Please delete the token from your mobile app storage."
}
```

## Protected Routes

To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example Protected Route

**Endpoint:** `GET /api/auth/mobile/protected-example`

This demonstrates how protected routes work with role-based access control.

## User Roles

The system supports the following user roles:

- `NORMAL_USER`: Basic user with limited permissions
- `PARENT_GUARDIAN`: Parent or guardian managing children
- `THERAPIST`: Licensed therapist providing services
- `MANAGER`: Manager overseeing therapists and operations
- `ADMIN`: Administrator with full system access

## Flutter Implementation Example

### 1. HTTP Service Setup

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String baseUrl = 'https://your-domain.com/api/auth/mobile';
  static const FlutterSecureStorage storage = FlutterSecureStorage();

  // Sign in
  static Future<Map<String, dynamic>> signIn(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);

    if (data['success'] && data['token'] != null) {
      await storage.write(key: 'auth_token', value: data['token']);
      await storage.write(key: 'user_data', value: jsonEncode(data['user']));
    }

    return data;
  }

  // Sign up
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
    String role = 'NORMAL_USER',
    Map<String, dynamic>? metadata,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        if (metadata != null) 'metadata': metadata,
      }),
    );

    final data = jsonDecode(response.body);

    if (data['success'] && data['token'] != null) {
      await storage.write(key: 'auth_token', value: data['token']);
      await storage.write(key: 'user_data', value: jsonEncode(data['user']));
    }

    return data;
  }

  // Get stored token
  static Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  // Get current user
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final userDataStr = await storage.read(key: 'user_data');
    if (userDataStr != null) {
      return jsonDecode(userDataStr);
    }
    return null;
  }

  // Make authenticated request
  static Future<http.Response> authenticatedRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final token = await getToken();

    if (token == null) {
      throw Exception('No authentication token found');
    }

    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    switch (method.toUpperCase()) {
      case 'GET':
        return await http.get(Uri.parse(endpoint), headers: headers);
      case 'POST':
        return await http.post(
          Uri.parse(endpoint),
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
      case 'PUT':
        return await http.put(
          Uri.parse(endpoint),
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
      case 'DELETE':
        return await http.delete(Uri.parse(endpoint), headers: headers);
      default:
        throw Exception('Unsupported HTTP method: $method');
    }
  }

  // Logout
  static Future<void> logout() async {
    try {
      await authenticatedRequest('POST', '$baseUrl/logout');
    } catch (e) {
      print('Logout request failed: $e');
    } finally {
      await storage.delete(key: 'auth_token');
      await storage.delete(key: 'user_data');
    }
  }

  // Check if user is authenticated
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }
}
```

### 2. Google Sign-In Integration

```dart
import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthService {
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  static Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleAccount = await _googleSignIn.signIn();

      if (googleAccount == null) {
        throw Exception('Google sign in was cancelled');
      }

      final GoogleSignInAuthentication googleAuth =
          await googleAccount.authentication;

      // Send to your backend
      final response = await http.post(
        Uri.parse('${AuthService.baseUrl}/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'idToken': googleAuth.idToken,
          'email': googleAccount.email,
          'name': googleAccount.displayName,
          'picture': googleAccount.photoUrl,
        }),
      );

      final data = jsonDecode(response.body);

      if (data['success'] && data['token'] != null) {
        await AuthService.storage.write(key: 'auth_token', value: data['token']);
        await AuthService.storage.write(key: 'user_data', value: jsonEncode(data['user']));
      }

      return data;
    } catch (error) {
      throw Exception('Google sign in failed: $error');
    }
  }
}
```

### 3. Authentication State Management

```dart
import 'package:flutter/foundation.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      _isAuthenticated = await AuthService.isAuthenticated();
      if (_isAuthenticated) {
        _user = await AuthService.getCurrentUser();
      }
    } catch (e) {
      _isAuthenticated = false;
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> signIn(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await AuthService.signIn(email, password);

      if (result['success']) {
        _user = result['user'];
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
```

## Security Considerations

1. **Token Storage**: Store JWT tokens securely using `flutter_secure_storage`
2. **Token Expiration**: Implement automatic token refresh logic
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Validation**: Server validates tokens on every request
5. **Role-Based Access**: Implement proper role checking in your Flutter app

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (for signup)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

## Environment Variables Required

Make sure these environment variables are set in your Next.js app:

```env
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
ADMIN_KEY=your-admin-registration-key
```

## Testing

You can test the endpoints using tools like Postman or curl:

```bash
# Sign in
curl -X POST https://your-domain.com/api/auth/mobile/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Access protected route
curl -X GET https://your-domain.com/api/auth/mobile/profile \
  -H "Authorization: Bearer your-jwt-token"
```
