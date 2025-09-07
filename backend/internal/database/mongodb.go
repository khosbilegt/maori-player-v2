package database

import (
	"context"
	"time"

	"video-player-backend/internal/config"
	"video-player-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDB represents the MongoDB connection and collection
type MongoDB struct {
	Client     *mongo.Client
	Database   *mongo.Database
	Collection *mongo.Collection
}

// NewMongoDB creates a new MongoDB connection
func NewMongoDB(cfg *config.Config) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.Database.URI))
	if err != nil {
		return nil, err
	}

	// Test the connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	database := client.Database(cfg.Database.Database)
	collection := database.Collection("videos")

	return &MongoDB{
		Client:     client,
		Database:   database,
		Collection: collection,
	}, nil
}

// Close closes the MongoDB connection
func (m *MongoDB) Close(ctx context.Context) error {
	return m.Client.Disconnect(ctx)
}

// VideoRepository interface for video operations
type VideoRepository interface {
	GetAll(ctx context.Context) ([]*models.Video, error)
	GetByID(ctx context.Context, id string) (*models.Video, error)
	Create(ctx context.Context, video *models.Video) error
	Update(ctx context.Context, id string, video *models.Video) error
	Delete(ctx context.Context, id string) error
}

// videoRepository implements VideoRepository
type videoRepository struct {
	collection *mongo.Collection
}

// NewVideoRepository creates a new video repository
func NewVideoRepository(db *MongoDB) VideoRepository {
	return &videoRepository{
		collection: db.Collection,
	}
}

// GetAll retrieves all videos
func (r *videoRepository) GetAll(ctx context.Context) ([]*models.Video, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var videos []*models.Video
	if err = cursor.All(ctx, &videos); err != nil {
		return nil, err
	}

	return videos, nil
}

// GetByID retrieves a video by ID
func (r *videoRepository) GetByID(ctx context.Context, id string) (*models.Video, error) {
	var video models.Video
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&video)
	if err != nil {
		return nil, err
	}
	return &video, nil
}

// Create creates a new video
func (r *videoRepository) Create(ctx context.Context, video *models.Video) error {
	video.GenerateID()
	_, err := r.collection.InsertOne(ctx, video)
	return err
}

// Update updates an existing video
func (r *videoRepository) Update(ctx context.Context, id string, video *models.Video) error {
	update := bson.M{
		"$set": bson.M{
			"title":       video.Title,
			"description": video.Description,
			"thumbnail":   video.Thumbnail,
			"video":       video.Video,
			"subtitle":    video.Subtitle,
			"duration":    video.Duration,
		},
	}

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// Delete deletes a video by ID
func (r *videoRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}
