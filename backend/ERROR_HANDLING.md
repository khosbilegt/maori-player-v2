# Error Handling Documentation

This document describes the consistent error handling interface used throughout the Video Player Backend API.

## Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": "Additional error details (optional)"
}
```

## Error Types

### 1. Video Not Found (404)

```json
{
  "code": "VIDEO_NOT_FOUND",
  "message": "Video not found"
}
```

**When it occurs:**

- GET `/api/v1/videos/{id}` with non-existent ID
- PUT `/api/v1/videos/{id}` with non-existent ID
- DELETE `/api/v1/videos/{id}` with non-existent ID

### 2. Validation Errors (400)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": "One or more validation errors occurred",
  "validation_errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "video",
      "message": "Video URL must be a valid URL"
    }
  ]
}
```

**When it occurs:**

- POST `/api/v1/videos` with invalid data
- PUT `/api/v1/videos/{id}` with invalid data
- Any endpoint with invalid video ID format

### 3. Invalid Request (400)

```json
{
  "code": "INVALID_REQUEST",
  "message": "Invalid JSON format",
  "details": "json: cannot unmarshal string into Go struct field..."
}
```

**When it occurs:**

- Malformed JSON in request body
- Invalid data types in request body

### 4. Database Errors (500)

```json
{
  "code": "DATABASE_ERROR",
  "message": "Database operation failed",
  "details": "connection refused"
}
```

**When it occurs:**

- Database connection issues
- Database operation failures

### 5. Internal Server Error (500)

```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal server error",
  "details": "unexpected error details"
}
```

**When it occurs:**

- Unexpected server errors
- Unhandled exceptions

## Validation Rules

### Video Request Validation

| Field         | Rules                              | Error Message                                                  |
| ------------- | ---------------------------------- | -------------------------------------------------------------- |
| `title`       | Required, max 200 characters       | "Title is required" / "Title must be less than 200 characters" |
| `video`       | Required, valid URL                | "Video URL is required" / "Video URL must be a valid URL"      |
| `thumbnail`   | Optional, valid URL if provided    | "Thumbnail URL must be a valid URL"                            |
| `description` | Optional, max 1000 characters      | "Description must be less than 1000 characters"                |
| `duration`    | Optional, MM:SS or HH:MM:SS format | "Duration must be in MM:SS or HH:MM:SS format"                 |
| `subtitle`    | Optional, must start with /        | "Subtitle path must start with /"                              |

### Video ID Validation

| Rule                 | Error Message                            |
| -------------------- | ---------------------------------------- |
| Required             | "Video ID is required"                   |
| Minimum 3 characters | "Video ID must be at least 3 characters" |

## HTTP Status Codes

| Status Code | Description           | Error Codes                               |
| ----------- | --------------------- | ----------------------------------------- |
| 200         | Success               | -                                         |
| 201         | Created               | -                                         |
| 204         | No Content            | -                                         |
| 400         | Bad Request           | `INVALID_REQUEST`, `VALIDATION_ERROR`     |
| 404         | Not Found             | `VIDEO_NOT_FOUND`                         |
| 500         | Internal Server Error | `DATABASE_ERROR`, `INTERNAL_SERVER_ERROR` |

## Usage Examples

### Client-Side Error Handling

```javascript
try {
  const response = await fetch("/api/v1/videos/123");
  if (!response.ok) {
    const error = await response.json();
    console.log("Error Code:", error.code);
    console.log("Error Message:", error.message);

    if (error.validation_errors) {
      error.validation_errors.forEach((err) => {
        console.log(`${err.field}: ${err.message}`);
      });
    }
  }
} catch (error) {
  console.error("Network error:", error);
}
```

### Testing Error Responses

Use the provided `test_errors.ps1` script to test all error scenarios:

```powershell
.\test_errors.ps1
```

## Error Handling Best Practices

1. **Always check the `code` field** for programmatic error handling
2. **Display the `message` field** to users
3. **Use `details` field** for debugging purposes
4. **Handle validation errors** by displaying field-specific messages
5. **Implement retry logic** for database errors
6. **Log all errors** with appropriate levels

## Adding New Error Types

To add a new error type:

1. Define the error in `internal/errors/errors.go`:

```go
var ErrNewError = &APIError{
    Code:    "NEW_ERROR_CODE",
    Message: "New error message",
}
```

2. Add status code mapping in `getStatusCodeFromError()`:

```go
case "NEW_ERROR_CODE":
    return http.StatusBadRequest
```

3. Use the error in handlers:

```go
errors.WriteErrorResponse(w, errors.ErrNewError)
```

## Monitoring and Logging

All errors are automatically logged with:

- Error code
- Error message
- Request context
- Timestamp
- Stack trace (for internal errors)

This ensures consistent error tracking and debugging capabilities.
