# Vocabulary CSV Batch Upload

This feature allows administrators to upload vocabulary items in bulk via CSV files.

## API Endpoint

**POST** `/api/v1/vocabulary/batch-upload?duplicates={mode}`

**Authentication:** Admin role required

**Query Parameters:**

- `duplicates` (optional): Controls how duplicate vocabulary items are handled
  - `update` (default): Update existing items with new data (upsert behavior)
  - `skip`: Skip duplicate items, only create new ones
  - `error`: Return error if any duplicates are found

## CSV Format

The CSV file must contain exactly 3 columns in the following order:

1. **maori** - The Māori word/phrase (required, max 200 characters)
2. **english** - The English translation (required, max 200 characters)
3. **description** - Detailed description (required, max 1000 characters)

### Sample CSV

```csv
maori,english,description
Kia ora,Hello,"A traditional Māori greeting meaning hello or goodbye"
Whānau,Family,"Extended family including grandparents, aunts, uncles, and cousins"
Aroha,Love,"Love, compassion, and empathy"
```

**Note:** Fields containing commas must be enclosed in double quotes for proper CSV parsing.

## CSV Formatting Rules

- **Comma delimiter:** Fields are separated by commas
- **Quote escaping:** Fields containing commas, quotes, or newlines must be enclosed in double quotes
- **Quote escaping within quoted fields:** Use double quotes (`""`) to represent a literal quote character
- **Header row:** Optional - the system auto-detects header rows
- **Comments:** Lines starting with `#` are treated as comments and ignored

### Examples:

```csv
# This is a comment line
maori,english,description
Kia ora,Hello,"A traditional Māori greeting meaning hello or goodbye"
Whānau,Family,"Extended family including grandparents, aunts, uncles, and cousins"
"Tēnā koe","Hello (to one person)","A formal greeting to one person"
```

## Usage

### Using curl

```bash
# Default behavior (update duplicates)
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "csv=@vocabulary.csv" \
  http://localhost:8080/api/v1/vocabulary/batch-upload

# Skip duplicates
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "csv=@vocabulary.csv" \
  "http://localhost:8080/api/v1/vocabulary/batch-upload?duplicates=skip"

# Error on duplicates
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "csv=@vocabulary.csv" \
  "http://localhost:8080/api/v1/vocabulary/batch-upload?duplicates=error"
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append("csv", csvFile);

// Default behavior (update duplicates)
const response = await fetch("/api/v1/vocabulary/batch-upload", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_ADMIN_TOKEN",
  },
  body: formData,
});

// Skip duplicates
const responseSkip = await fetch(
  "/api/v1/vocabulary/batch-upload?duplicates=skip",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_ADMIN_TOKEN",
    },
    body: formData,
  }
);

// Error on duplicates
const responseError = await fetch(
  "/api/v1/vocabulary/batch-upload?duplicates=error",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_ADMIN_TOKEN",
    },
    body: formData,
  }
);

const result = await response.json();
console.log(`Processed ${result.total} vocabulary items`);
```

## Validation Rules

- **File size:** Maximum 100MB
- **File type:** Must be a CSV file (.csv extension or text/csv content type)
- **Required fields:** All 3 columns must be present and non-empty
- **Field lengths:**
  - Māori: max 200 characters
  - English: max 200 characters
  - Description: max 1000 characters
- **Header row:** Optional - the system will auto-detect if the first row contains headers
- **Duplicate detection:**
  - Within CSV: Duplicate Māori words in the same file are detected and reported
  - Against database: Behavior controlled by `duplicates` query parameter

## Response Format

### Success Response (201 Created)

**Default Mode (update duplicates):**

```json
{
  "message": "Processed 8 vocabulary items: 5 created, 3 updated",
  "created": 5,
  "updated": 3,
  "total": 8,
  "created_items": [
    {
      "id": "kia-ora",
      "maori": "Kia ora",
      "english": "Hello",
      "description": "A traditional Māori greeting meaning hello or goodbye"
    }
    // ... newly created items
  ],
  "updated_items": [
    {
      "id": "whanau",
      "maori": "Whānau",
      "english": "Family",
      "description": "Extended family including grandparents, aunts, uncles, and cousins"
    }
    // ... updated items
  ]
}
```

**No Duplicates Found:**

```json
{
  "message": "Processed 5 vocabulary items: 5 created, 0 updated",
  "created": 5,
  "updated": 0,
  "total": 5,
  "created_items": [
    // ... all items
  ],
  "updated_items": []
}
```

**Update Mode (upsert):**

```json
{
  "message": "Processed 8 vocabulary items: 5 created, 3 updated",
  "created": 5,
  "updated": 3,
  "total": 8,
  "created_items": [
    // ... newly created items
  ],
  "updated_items": [
    // ... updated items
  ]
}
```

### Error Response (400 Bad Request)

**CSV Validation Error:**

```json
{
  "code": "INVALID_REQUEST",
  "message": "CSV parsing failed",
  "details": "CSV validation errors:\nRow 3: Māori field is required\nRow 5: Description field exceeds 1000 characters"
}
```

**Duplicate Error (default mode):**

```json
{
  "code": "INVALID_REQUEST",
  "message": "Duplicate vocabulary items found",
  "details": "The following Māori words already exist: Kia ora, Whānau"
}
```

## Error Handling

The system provides detailed validation errors for:

- Missing required fields
- Field length violations
- Invalid CSV format
- File size/type restrictions
- Database insertion errors
- Duplicate vocabulary items (configurable behavior)

All validation errors are returned with specific row numbers and field names to help identify and fix issues in the CSV file.

## Duplicate Handling

The system handles duplicates in two ways:

### 1. Within CSV File

- Duplicate Māori words within the same CSV file are automatically detected
- Validation errors are returned with row numbers of duplicates
- Upload fails if duplicates are found within the CSV

### 2. Against Database

- Controlled by the `duplicates` query parameter
- **`update` (default)**: Updates existing vocabulary items with new data (upsert behavior)
- **`skip`**: Only creates new vocabulary items, skips existing ones
- **`error`**: Upload fails if any vocabulary items already exist in the database

## Notes

- Vocabulary items are automatically assigned unique IDs based on the Māori text
- The batch upload uses MongoDB's `InsertMany` operation for optimal performance
- All existing validation rules for individual vocabulary creation apply to batch uploads
- The endpoint is admin-only to prevent unauthorized bulk data modifications
- Duplicate detection is based on the Māori text field (case-sensitive)
- The `update` mode will update all fields (English, Pronunciation, Description) for existing items
