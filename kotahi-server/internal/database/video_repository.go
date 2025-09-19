package database

import (
	"context"
	"fmt"
	"video-player-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// VideoRepository interface for video operations
type VideoRepository interface {
	GetAll(ctx context.Context) ([]*models.Video, error)
	GetByID(ctx context.Context, id string) (*models.Video, error)
	Create(ctx context.Context, video *models.Video) error
	Update(ctx context.Context, id string, video *models.Video) error
	Delete(ctx context.Context, id string) error
	FindBySubtitleFilename(ctx context.Context, filename string) ([]*models.Video, error)
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

// FindBySubtitleFilename finds videos whose subtitle path contains the given VTT filename
func (r *videoRepository) FindBySubtitleFilename(ctx context.Context, filename string) ([]*models.Video, error) {
	// Use a case-insensitive regex to match the filename within the subtitle path or URL
	fmt.Println(filename)
	filter := bson.M{"subtitle": bson.M{"$regex": filename, "$options": "i"}}
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var videos []*models.Video
	if err := cursor.All(ctx, &videos); err != nil {
		return nil, err
	}
	return videos, nil
}
