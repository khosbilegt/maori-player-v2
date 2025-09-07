# Video Player Backend

A scalable CRUD backend API built with Go and MongoDB for managing video objects. Built following Go best practices with a clean architecture.

## Features

- **Create** videos with POST `/api/v1/videos`
- **Read** all videos with GET `/api/v1/videos`
- **Read** single video with GET `/api/v1/videos/{id}`
- **Update** video with PUT `/api/v1/videos/{id}`
- **Delete** video with DELETE `/api/v1/videos/{id}`
- Health check endpoint at `/health`
- CORS enabled for frontend integration
- MongoDB integration with automatic ID generation
- Graceful shutdown
- Request logging
- Docker support
- Hot reload for development

## Project Structure

```
video-player-backend/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go        # Configuration management
│   ├── database/
│   │   └── mongodb.go       # Database connection and repository
│   ├── handlers/
│   │   ├── video.go         # Video HTTP handlers
│   │   └── routes.go        # Route configuration
│   ├── middleware/
│   │   ├── cors.go          # CORS middleware
│   │   └── logging.go       # Request logging middleware
│   └── models/
│       └── video.go         # Data models
├── pkg/
│   └── utils/
│       └── response.go      # Utility functions
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker configuration
├── Makefile                # Build automation
├── .air.toml              # Hot reload configuration
└── README.md
```

## Prerequisites

- Go 1.21 or later
- MongoDB (or use Docker Compose)

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:

```bash
git clone <your-repo-url>
cd video-player-backend
```

2. Start the application with MongoDB:

```bash
docker-compose up --build
```

The server will start on port 8080 and MongoDB on port 27017.

### Manual Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd video-player-backend
```

2. Install dependencies:

```bash
make deps
```

3. Start MongoDB (if not already running):

```bash
# On Windows
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

4. Run the application:

```bash
make run
```

### Development with Hot Reload

1. Install Air for hot reload:

```bash
make install-air
```

2. Start development server:

```bash
make dev
```

## API Endpoints

### GET /api/v1/videos

Get all videos

```bash
curl http://localhost:8080/api/v1/videos
```

### GET /api/v1/videos/{id}

Get a specific video by ID

```bash
curl http://localhost:8080/api/v1/videos/tetepus10e6
```

### POST /api/v1/videos

Create a new video

```bash
curl -X POST http://localhost:8080/api/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Te Tēpu: Season 10 Episode 6",
    "description": "Interactive Māori language learning video with synchronized transcripts and hover translations.",
    "thumbnail": "https://www.dropbox.com/scl/fi/eji6eappnmm25kkq45r0x/tetepus10e6.jpg?rlkey=va30la6fq31i2y03mr0ykhj6v&st=oznsw98x&raw=1",
    "video": "https://www.dropbox.com/scl/fi/r4nmatwmpqobjsi0gtaks/tetepus10e6.mp4?rlkey=kwrf1igeud9lz8l65mfg25qth&st=s2gzu1k1&raw=1",
    "subtitle": "/tetepus10e6.vtt",
    "duration": "2:34"
  }'
```

### PUT /api/v1/videos/{id}

Update an existing video

```bash
curl -X PUT http://localhost:8080/api/v1/videos/tetepus10e6 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "thumbnail": "https://example.com/new-thumbnail.jpg",
    "video": "https://example.com/new-video.mp4",
    "subtitle": "/new-subtitle.vtt",
    "duration": "3:45"
  }'
```

### DELETE /api/v1/videos/{id}

Delete a video

```bash
curl -X DELETE http://localhost:8080/api/v1/videos/tetepus10e6
```

### GET /health

Health check endpoint

```bash
curl http://localhost:8080/health
```

## Data Model

The video object has the following structure:

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "thumbnail": "string",
  "video": "string",
  "subtitle": "string",
  "duration": "string"
}
```

## Configuration

The application uses environment variables for configuration:

- `SERVER_PORT`: Server port (default: 8080)
- `SERVER_HOST`: Server host (default: localhost)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017)
- `MONGODB_DATABASE`: MongoDB database name (default: video_player)

## Development Commands

```bash
# Install dependencies
make deps

# Build the application
make build

# Run the application
make run

# Run with hot reload
make dev

# Run tests
make test

# Clean build files
make clean

# Format code
make fmt

# Build for Linux
make build-linux

# Docker build
make docker-build

# Docker run
make docker-run
```

## Database

The application uses MongoDB with:

- Database: `video_player`
- Collection: `videos`
- Default connection: `mongodb://localhost:27017`

## Error Handling

The API returns appropriate HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content (for DELETE)
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Architecture

This project follows Go best practices:

- **Clean Architecture**: Separation of concerns with internal packages
- **Dependency Injection**: Handlers receive dependencies through constructors
- **Repository Pattern**: Database operations are abstracted through interfaces
- **Middleware**: Reusable components for cross-cutting concerns
- **Configuration**: Environment-based configuration management
- **Graceful Shutdown**: Proper cleanup on application termination
