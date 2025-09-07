# Database Seeding

This document explains how to seed the database with sample video data.

## Prerequisites

1. Make sure MongoDB is running
2. Make sure the backend server dependencies are installed (`go mod tidy`)

## Seeding the Database

### Method 1: Using the Seed Command

Run the seed command to populate the database with sample videos:

```bash
cd backend
go run cmd/seed/main.go
```

This will:

- Connect to your MongoDB database
- Create 5 sample videos from the original library.json
- Set specific IDs to match the original data
- Log the progress of each video creation

### Method 2: Using the API Endpoint

You can also use the seed endpoint (for development):

```bash
curl -X POST http://localhost:8080/seed
```

Note: This endpoint currently just returns instructions to use the seed command.

## Sample Data

The seed script creates the following videos:

1. **Te Tēpu: Season 10 Episode 6** (ID: tetepus10e6)
2. **Tu Maori Ki Te Ao Pixie Williams** (ID: pixie-williams)
3. **Rahera Shortland** (ID: rahera_shortland)
4. **Te Tepu Season 10 Episode 23 - Māori Music** (ID: maori-music)
5. **Te Tepu Season 9 Episode 3 - Te Arawa** (ID: tetepus9e3)

## Verifying the Data

After seeding, you can verify the data by:

1. **Using the API:**

   ```bash
   curl http://localhost:8080/api/v1/videos
   ```

2. **Using the frontend:** The frontend will now fetch videos from the backend API instead of the static JSON file.

## Troubleshooting

### MongoDB Connection Issues

- Make sure MongoDB is running on `mongodb://localhost:27017`
- Check the `MONGODB_URI` environment variable if using a different connection string

### Duplicate Videos

- The seed script will create videos with specific IDs
- If you run it multiple times, you may get duplicate key errors
- To avoid this, you can clear the videos collection first or modify the script to check for existing videos

### Frontend Not Loading Videos

- Make sure the backend server is running on `http://localhost:8080`
- Check the browser console for any CORS or network errors
- The frontend will fall back to the static library.json if the backend is unavailable

## Customizing the Seed Data

To modify the sample data:

1. Edit `backend/cmd/seed/main.go`
2. Update the `sampleVideos` slice with your desired video data
3. Run the seed command again

## Production Considerations

- Remove or secure the `/seed` endpoint in production
- Use proper database migrations instead of seeding scripts
- Consider using environment-specific seed data
- Implement proper error handling and rollback mechanisms
