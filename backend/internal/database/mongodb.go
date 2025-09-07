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
	Client                 *mongo.Client
	Database               *mongo.Database
	Collection             *mongo.Collection
	UserCollection         *mongo.Collection
	VocabularyCollection   *mongo.Collection
	WatchHistoryCollection *mongo.Collection
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
	userCollection := database.Collection("users")
	vocabularyCollection := database.Collection("vocabulary")
	watchHistoryCollection := database.Collection("watch_history")

	return &MongoDB{
		Client:                 client,
		Database:               database,
		Collection:             collection,
		UserCollection:         userCollection,
		VocabularyCollection:   vocabularyCollection,
		WatchHistoryCollection: watchHistoryCollection,
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

// UserRepository interface for user operations
type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	GetByID(ctx context.Context, id string) (*models.User, error)
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, id string, user *models.User) error
	Delete(ctx context.Context, id string) error
}

// VocabularyRepository interface for vocabulary operations
type VocabularyRepository interface {
	GetAll(ctx context.Context) ([]*models.Vocabulary, error)
	GetByID(ctx context.Context, id string) (*models.Vocabulary, error)
	Create(ctx context.Context, vocabulary *models.Vocabulary) error
	Update(ctx context.Context, id string, vocabulary *models.Vocabulary) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string) ([]*models.Vocabulary, error)
}

// userRepository implements UserRepository
type userRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *MongoDB) UserRepository {
	return &userRepository{
		collection: db.UserCollection,
	}
}

// GetByEmail retrieves a user by email
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByUsername retrieves a user by username
func (r *userRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByID retrieves a user by ID
func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Create creates a new user
func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

// Update updates an existing user
func (r *userRepository) Update(ctx context.Context, id string, user *models.User) error {
	update := bson.M{
		"$set": bson.M{
			"email":      user.Email,
			"username":   user.Username,
			"password":   user.Password,
			"updated_at": user.UpdatedAt,
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

// Delete deletes a user by ID
func (r *userRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// vocabularyRepository implements VocabularyRepository
type vocabularyRepository struct {
	collection *mongo.Collection
}

// NewVocabularyRepository creates a new vocabulary repository
func NewVocabularyRepository(db *MongoDB) VocabularyRepository {
	return &vocabularyRepository{
		collection: db.VocabularyCollection,
	}
}

// GetAll retrieves all vocabulary items
func (r *vocabularyRepository) GetAll(ctx context.Context) ([]*models.Vocabulary, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var vocabularies []*models.Vocabulary
	if err := cursor.All(ctx, &vocabularies); err != nil {
		return nil, err
	}

	return vocabularies, nil
}

// GetByID retrieves a vocabulary item by ID
func (r *vocabularyRepository) GetByID(ctx context.Context, id string) (*models.Vocabulary, error) {
	var vocabulary models.Vocabulary
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&vocabulary)
	if err != nil {
		return nil, err
	}

	return &vocabulary, nil
}

// Create creates a new vocabulary item
func (r *vocabularyRepository) Create(ctx context.Context, vocabulary *models.Vocabulary) error {
	vocabulary.GenerateID()
	_, err := r.collection.InsertOne(ctx, vocabulary)
	return err
}

// Update updates an existing vocabulary item
func (r *vocabularyRepository) Update(ctx context.Context, id string, vocabulary *models.Vocabulary) error {
	vocabulary.ID = id
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": id}, vocabulary)
	return err
}

// Delete deletes a vocabulary item by ID
func (r *vocabularyRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// Search searches vocabulary items by Māori or English text
func (r *vocabularyRepository) Search(ctx context.Context, query string) ([]*models.Vocabulary, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"maori": bson.M{"$regex": query, "$options": "i"}},
			{"english": bson.M{"$regex": query, "$options": "i"}},
			{"description": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var vocabularies []*models.Vocabulary
	if err := cursor.All(ctx, &vocabularies); err != nil {
		return nil, err
	}

	return vocabularies, nil
}

// WatchHistoryRepository interface for watch history operations
type WatchHistoryRepository interface {
	GetByUserID(ctx context.Context, userID string) ([]*models.WatchHistory, error)
	GetByUserAndVideo(ctx context.Context, userID, videoID string) (*models.WatchHistory, error)
	Create(ctx context.Context, watchHistory *models.WatchHistory) error
	Update(ctx context.Context, id string, watchHistory *models.WatchHistory) error
	Delete(ctx context.Context, id string) error
	DeleteByUserAndVideo(ctx context.Context, userID, videoID string) error
	GetRecentWatched(ctx context.Context, userID string, limit int) ([]*models.WatchHistory, error)
	GetCompletedVideos(ctx context.Context, userID string) ([]*models.WatchHistory, error)
}

// watchHistoryRepository implements WatchHistoryRepository
type watchHistoryRepository struct {
	collection *mongo.Collection
}

// NewWatchHistoryRepository creates a new watch history repository
func NewWatchHistoryRepository(db *MongoDB) WatchHistoryRepository {
	return &watchHistoryRepository{
		collection: db.WatchHistoryCollection,
	}
}

// GetByUserID retrieves all watch history for a user
func (r *watchHistoryRepository) GetByUserID(ctx context.Context, userID string) ([]*models.WatchHistory, error) {
	filter := bson.M{"user_id": userID}
	opts := options.Find().SetSort(bson.D{{Key: "last_watched", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var watchHistories []*models.WatchHistory
	if err := cursor.All(ctx, &watchHistories); err != nil {
		return nil, err
	}

	return watchHistories, nil
}

// GetByUserAndVideo retrieves watch history for a specific user and video
func (r *watchHistoryRepository) GetByUserAndVideo(ctx context.Context, userID, videoID string) (*models.WatchHistory, error) {
	filter := bson.M{
		"user_id":  userID,
		"video_id": videoID,
	}

	var watchHistory models.WatchHistory
	err := r.collection.FindOne(ctx, filter).Decode(&watchHistory)
	if err != nil {
		return nil, err
	}

	return &watchHistory, nil
}

// Create creates a new watch history entry
func (r *watchHistoryRepository) Create(ctx context.Context, watchHistory *models.WatchHistory) error {
	watchHistory.GenerateID()
	_, err := r.collection.InsertOne(ctx, watchHistory)
	return err
}

// Update updates an existing watch history entry
func (r *watchHistoryRepository) Update(ctx context.Context, id string, watchHistory *models.WatchHistory) error {
	update := bson.M{
		"$set": bson.M{
			"progress":     watchHistory.Progress,
			"current_time": watchHistory.CurrentTime,
			"duration":     watchHistory.Duration,
			"completed":    watchHistory.Completed,
			"last_watched": watchHistory.LastWatched,
			"updated_at":   watchHistory.UpdatedAt,
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

// Delete deletes a watch history entry by ID
func (r *watchHistoryRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// DeleteByUserAndVideo deletes watch history for a specific user and video
func (r *watchHistoryRepository) DeleteByUserAndVideo(ctx context.Context, userID, videoID string) error {
	filter := bson.M{
		"user_id":  userID,
		"video_id": videoID,
	}

	result, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// GetRecentWatched retrieves recently watched videos for a user
func (r *watchHistoryRepository) GetRecentWatched(ctx context.Context, userID string, limit int) ([]*models.WatchHistory, error) {
	filter := bson.M{"user_id": userID}
	opts := options.Find().
		SetSort(bson.D{{Key: "last_watched", Value: -1}}).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var watchHistories []*models.WatchHistory
	if err := cursor.All(ctx, &watchHistories); err != nil {
		return nil, err
	}

	return watchHistories, nil
}

// GetCompletedVideos retrieves completed videos for a user
func (r *watchHistoryRepository) GetCompletedVideos(ctx context.Context, userID string) ([]*models.WatchHistory, error) {
	filter := bson.M{
		"user_id":   userID,
		"completed": true,
	}
	opts := options.Find().SetSort(bson.D{{Key: "last_watched", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var watchHistories []*models.WatchHistory
	if err := cursor.All(ctx, &watchHistories); err != nil {
		return nil, err
	}

	return watchHistories, nil
}
