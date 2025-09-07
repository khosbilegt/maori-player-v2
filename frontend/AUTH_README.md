# Authentication System

This document describes the authentication system implemented in the frontend and backend.

## Backend Authentication

### Features

- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Protected routes with middleware
- User profile management

### API Endpoints

#### Public Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

#### Protected Endpoints (require JWT token)

- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Request/Response Examples

#### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "testuser",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "testuser",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Login User

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "testuser",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### Get Profile (Protected)

```bash
GET /api/v1/auth/profile
Authorization: Bearer jwt_token_here
```

Response:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "testuser",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Frontend Authentication

### Features

- React Context for state management
- Automatic token storage in localStorage
- Protected routes
- Login/Register forms with validation
- Navigation with authentication status

### Components

#### AuthContext

- Manages authentication state
- Provides login, register, logout functions
- Handles token storage and retrieval

#### ProtectedRoute

- Wraps components that require authentication
- Redirects to login if not authenticated

#### Navigation

- Shows different content based on authentication status
- Displays user info when logged in
- Provides logout functionality

### Pages

#### LoginPage

- Email and password form
- Client-side validation
- Error handling
- Redirects to library on success

#### RegisterPage

- Email, username, and password form
- Password confirmation
- Client-side validation
- Error handling
- Redirects to library on success

## Testing

### Backend Testing

1. Start the backend server:

   ```bash
   cd backend
   go run cmd/server/main.go
   ```

2. Use the test HTML file:
   - Open `frontend/test-auth.html` in a browser
   - Test registration, login, and protected routes

### Frontend Testing

1. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the application and test:
   - Registration flow
   - Login flow
   - Protected routes
   - Logout functionality

## Environment Variables

### Backend

- `JWT_SECRET` - Secret key for JWT signing (default: "your-secret-key-change-this-in-production")
- `JWT_EXPIRATION_HOURS` - Token expiration time in hours (default: 24)
- `MONGODB_URI` - MongoDB connection string (default: "mongodb://localhost:27017")
- `MONGODB_DATABASE` - Database name (default: "video_player")

### Frontend

- The frontend is configured to connect to `http://localhost:8080` for the API

## Security Considerations

1. **JWT Secret**: Change the default JWT secret in production
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Password Requirements**: Implement stronger password requirements if needed
4. **Rate Limiting**: Consider adding rate limiting for auth endpoints
5. **Token Refresh**: Implement token refresh mechanism for better UX

## Database Schema

### Users Collection

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "username": "testuser",
  "password": "hashed_password",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Error Handling

The system provides comprehensive error handling:

### Backend Errors

- Validation errors with field-specific messages
- Authentication errors (invalid credentials, unauthorized)
- Database errors
- Internal server errors

### Frontend Errors

- Network errors
- Validation errors
- Authentication errors
- User-friendly error messages

## Future Enhancements

1. **Email Verification**: Add email verification for new registrations
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add OAuth providers (Google, GitHub, etc.)
4. **Two-Factor Authentication**: Add 2FA support
5. **Session Management**: Add session management and device tracking
6. **Admin Panel**: Add admin functionality for user management
