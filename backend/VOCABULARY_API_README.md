# Vocabulary API Documentation

This document describes the vocabulary API endpoints for managing Māori vocabulary items.

## Overview

The vocabulary API provides CRUD operations for managing Māori vocabulary items, including:

- Māori text
- English translation
- Pronunciation guide
- Description/context

## API Endpoints

All endpoints are prefixed with `/api/v1/vocabulary`

### 1. Get All Vocabulary Items

**GET** `/api/v1/vocabulary`

Returns all vocabulary items in the database.

**Response:**

```json
[
  {
    "id": "kia-ora",
    "maori": "Kia ora",
    "english": "Hello",
    "pronunciation": "KEY-a O-ra",
    "description": "A common greeting meaning hello.",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 2. Get Specific Vocabulary Item

**GET** `/api/v1/vocabulary/{id}`

Returns a specific vocabulary item by ID.

**Parameters:**

- `id` (string, required): The vocabulary item ID

**Response:**

```json
{
  "id": "kia-ora",
  "maori": "Kia ora",
  "english": "Hello",
  "pronunciation": "KEY-a O-ra",
  "description": "A common greeting meaning hello.",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**

- `404 Not Found`: Vocabulary item not found
- `400 Bad Request`: Invalid ID format

### 3. Create New Vocabulary Item

**POST** `/api/v1/vocabulary`

Creates a new vocabulary item.

**Request Body:**

```json
{
  "maori": "Aroha",
  "english": "Love",
  "pronunciation": "AH-roh-hah",
  "description": "A feeling of love, compassion, or empathy."
}
```

**Response:**

```json
{
  "id": "aroha",
  "maori": "Aroha",
  "english": "Love",
  "pronunciation": "AH-roh-hah",
  "description": "A feeling of love, compassion, or empathy.",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Validation Rules:**

- `maori`: Required, 1-200 characters
- `english`: Required, 1-200 characters
- `pronunciation`: Required, 1-200 characters
- `description`: Required, 1-1000 characters

**Error Responses:**

- `400 Bad Request`: Validation errors or invalid JSON
- `500 Internal Server Error`: Database error

### 4. Update Vocabulary Item

**PUT** `/api/v1/vocabulary/{id}`

Updates an existing vocabulary item.

**Parameters:**

- `id` (string, required): The vocabulary item ID

**Request Body:**

```json
{
  "maori": "Aroha",
  "english": "Love and Compassion",
  "pronunciation": "AH-roh-hah",
  "description": "A feeling of love, compassion, empathy, and care for others."
}
```

**Response:**

```json
{
  "id": "aroha",
  "maori": "Aroha",
  "english": "Love and Compassion",
  "pronunciation": "AH-roh-hah",
  "description": "A feeling of love, compassion, empathy, and care for others.",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Error Responses:**

- `404 Not Found`: Vocabulary item not found
- `400 Bad Request`: Validation errors or invalid JSON
- `500 Internal Server Error`: Database error

### 5. Delete Vocabulary Item

**DELETE** `/api/v1/vocabulary/{id}`

Deletes a vocabulary item.

**Parameters:**

- `id` (string, required): The vocabulary item ID

**Response:**

- `204 No Content`: Successfully deleted

**Error Responses:**

- `404 Not Found`: Vocabulary item not found
- `400 Bad Request`: Invalid ID format
- `500 Internal Server Error`: Database error

### 6. Search Vocabulary Items

**GET** `/api/v1/vocabulary/search?q={query}`

Searches vocabulary items by Māori text, English translation, or description.

**Query Parameters:**

- `q` (string, required): Search query

**Response:**

```json
[
  {
    "id": "kia-ora",
    "maori": "Kia ora",
    "english": "Hello",
    "pronunciation": "KEY-a O-ra",
    "description": "A common greeting meaning hello.",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Error Responses:**

- `400 Bad Request`: Missing or empty query parameter
- `500 Internal Server Error`: Database error

## Data Model

### Vocabulary Object

```typescript
interface Vocabulary {
  id: string; // Unique identifier (auto-generated from Māori text)
  maori: string; // Māori text (1-200 characters)
  english: string; // English translation (1-200 characters)
  pronunciation: string; // Pronunciation guide (1-200 characters)
  description: string; // Description/context (1-1000 characters)
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}
```

### Vocabulary Request Object

```typescript
interface VocabularyRequest {
  maori: string; // Māori text (required)
  english: string; // English translation (required)
  pronunciation: string; // Pronunciation guide (required)
  description: string; // Description/context (required)
}
```

## Error Responses

All error responses follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": "Additional error details (optional)"
}
```

### Common Error Codes

- `VOCABULARY_NOT_FOUND`: Vocabulary item not found
- `INVALID_REQUEST`: Invalid request format or validation errors
- `DATABASE_ERROR`: Database operation failed
- `VALIDATION_ERROR`: Input validation failed

## Usage Examples

### Using curl

```bash
# Get all vocabulary items
curl -X GET http://localhost:8080/api/v1/vocabulary

# Get specific vocabulary item
curl -X GET http://localhost:8080/api/v1/vocabulary/kia-ora

# Create new vocabulary item
curl -X POST http://localhost:8080/api/v1/vocabulary \
  -H "Content-Type: application/json" \
  -d '{
    "maori": "Aroha",
    "english": "Love",
    "pronunciation": "AH-roh-hah",
    "description": "A feeling of love, compassion, or empathy."
  }'

# Update vocabulary item
curl -X PUT http://localhost:8080/api/v1/vocabulary/aroha \
  -H "Content-Type: application/json" \
  -d '{
    "maori": "Aroha",
    "english": "Love and Compassion",
    "pronunciation": "AH-roh-hah",
    "description": "A feeling of love, compassion, empathy, and care for others."
  }'

# Search vocabulary items
curl -X GET "http://localhost:8080/api/v1/vocabulary/search?q=hello"

# Delete vocabulary item
curl -X DELETE http://localhost:8080/api/v1/vocabulary/aroha
```

### Using PowerShell

```powershell
# Get all vocabulary items
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/vocabulary" -Method GET

# Create new vocabulary item
$vocabulary = @{
    maori = "Aroha"
    english = "Love"
    pronunciation = "AH-roh-hah"
    description = "A feeling of love, compassion, or empathy."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/vocabulary" -Method POST -Body $vocabulary -ContentType "application/json"
```

## Database Seeding

To populate the database with initial vocabulary data:

```bash
# Run the vocabulary seeding script
cd backend
go run cmd/seed-vocabulary/main.go
```

This will read the vocabulary data from `frontend/public/vocab.json` and insert it into the MongoDB database.

## Testing

Use the provided PowerShell test script:

```powershell
# Run the vocabulary API tests
cd backend
.\test-vocabulary-api.ps1
```

This script tests all CRUD operations and error handling scenarios.

## Notes

- All endpoints are currently public (no authentication required)
- Vocabulary IDs are auto-generated from the Māori text (sanitized for URL safety)
- Search is case-insensitive and searches across Māori text, English translation, and description
- All timestamps are in ISO 8601 format (UTC)
- The API follows RESTful conventions
