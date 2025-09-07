# Watch History API Documentation

This document describes the Watch History API endpoints that allow users to track their video viewing progress and maintain a history of watched videos.

## Overview

The Watch History API provides functionality to:

- Track video viewing progress (current time, duration, completion status)
- Maintain a history of watched videos
- Retrieve recently watched videos
- Get completed videos
- Update or delete watch history entries

## Authentication

All watch history endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Watch History

**GET** `/api/v1/watch-history`

Retrieves all watch history for the authenticated user, sorted by last watched date (most recent first).

**Response:**

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "video_id": "507f1f77bcf86cd799439013",
      "progress": 0.75,
      "current_time": 180.0,
      "duration": 240.0,
      "completed": false,
      "last_watched": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Watch History for Specific Video

**GET** `/api/v1/watch-history/video?video_id=<video_id>`

Retrieves watch history for a specific video for the authenticated user.

**Query Parameters:**

- `video_id` (required): The ID of the video

**Response:**

```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "video_id": "507f1f77bcf86cd799439013",
    "progress": 0.75,
    "current_time": 180.0,
    "duration": 240.0,
    "completed": false,
    "last_watched": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create or Update Watch History

**POST** `/api/v1/watch-history`

Creates a new watch history entry or updates an existing one for the authenticated user.

**Request Body:**

```json
{
  "video_id": "507f1f77bcf86cd799439013",
  "progress": 0.75,
  "current_time": 180.0,
  "duration": 240.0,
  "completed": false
}
```

**Request Fields:**

- `video_id` (required): The ID of the video
- `progress` (required): Progress as a decimal between 0.0 and 1.0
- `current_time` (required): Current time in seconds (must be non-negative)
- `duration` (required): Total video duration in seconds (must be positive)
- `completed` (optional): Whether the video was fully watched

**Response:**

```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "video_id": "507f1f77bcf86cd799439013",
    "progress": 0.75,
    "current_time": 180.0,
    "duration": 240.0,
    "completed": false,
    "last_watched": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Notes:**

- If a watch history entry already exists for the user and video, it will be updated
- If no entry exists, a new one will be created
- Progress >= 0.9 automatically marks the video as completed
- The `last_watched` timestamp is automatically updated

### 4. Delete Watch History

**DELETE** `/api/v1/watch-history?video_id=<video_id>`

Deletes watch history for a specific video for the authenticated user.

**Query Parameters:**

- `video_id` (required): The ID of the video

**Response:**

- Status: 204 No Content (on success)

### 5. Get Recent Watched Videos

**GET** `/api/v1/watch-history/recent?limit=<limit>`

Retrieves recently watched videos for the authenticated user.

**Query Parameters:**

- `limit` (optional): Maximum number of videos to return (default: 10, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "video_id": "507f1f77bcf86cd799439013",
      "progress": 0.75,
      "current_time": 180.0,
      "duration": 240.0,
      "completed": false,
      "last_watched": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 6. Get Completed Videos

**GET** `/api/v1/watch-history/completed`

Retrieves all completed videos for the authenticated user, sorted by last watched date (most recent first).

**Response:**

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "video_id": "507f1f77bcf86cd799439013",
      "progress": 1.0,
      "current_time": 240.0,
      "duration": 240.0,
      "completed": true,
      "last_watched": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "code": "UNAUTHORIZED",
  "message": "Unauthorized access"
}
```

### 400 Bad Request

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": "One or more validation errors occurred",
  "validation_errors": [
    {
      "field": "progress",
      "message": "Progress must be between 0.0 and 1.0"
    }
  ]
}
```

### 404 Not Found

```json
{
  "code": "WATCH_HISTORY_NOT_FOUND",
  "message": "Watch history not found"
}
```

### 500 Internal Server Error

```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal server error"
}
```

## Data Model

### WatchHistory

| Field          | Type    | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| `id`           | string  | Unique identifier for the watch history entry         |
| `user_id`      | string  | ID of the user who watched the video                  |
| `video_id`     | string  | ID of the video that was watched                      |
| `progress`     | number  | Progress as a decimal between 0.0 and 1.0             |
| `current_time` | number  | Current time in seconds                               |
| `duration`     | number  | Total video duration in seconds                       |
| `completed`    | boolean | Whether the video was fully watched                   |
| `last_watched` | string  | ISO 8601 timestamp of when the video was last watched |
| `created_at`   | string  | ISO 8601 timestamp of when the entry was created      |
| `updated_at`   | string  | ISO 8601 timestamp of when the entry was last updated |

## Usage Examples

### Frontend Integration

```javascript
// Update watch progress
const updateWatchProgress = async (videoId, currentTime, duration) => {
  const progress = currentTime / duration;

  const response = await fetch("/api/v1/watch-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      video_id: videoId,
      progress: progress,
      current_time: currentTime,
      duration: duration,
      completed: progress >= 0.9,
    }),
  });

  return response.json();
};

// Get watch history for a video
const getVideoWatchHistory = async (videoId) => {
  const response = await fetch(
    `/api/v1/watch-history/video?video_id=${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

// Get recent watched videos
const getRecentWatched = async (limit = 10) => {
  const response = await fetch(`/api/v1/watch-history/recent?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
```

## Testing

Use the provided test script to verify the API functionality:

```powershell
.\test-watch-history-api.ps1
```

Make sure the backend server is running before executing the test script.

## Database Schema

The watch history data is stored in the `watch_history` collection with the following structure:

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  video_id: ObjectId,
  progress: Number,
  current_time: Number,
  duration: Number,
  completed: Boolean,
  last_watched: Date,
  created_at: Date,
  updated_at: Date
}
```

## Notes

- All timestamps are stored in UTC
- Progress is automatically calculated and validated
- Videos are considered completed when progress >= 0.9
- Watch history entries are unique per user-video combination
- The API automatically handles creating new entries or updating existing ones
