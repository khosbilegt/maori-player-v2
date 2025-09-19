package database

import (
	"context"
	"time"

	"video-player-backend/internal/config"
	"video-player-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	LearningListCollection *mongo.Collection
	PlaylistCollection     *mongo.Collection
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
	learningListCollection := database.Collection("learning_list")
	playlistCollection := database.Collection("playlists")

	return &MongoDB{
		Client:                 client,
		Database:               database,
		Collection:             collection,
		UserCollection:         userCollection,
		VocabularyCollection:   vocabularyCollection,
		WatchHistoryCollection: watchHistoryCollection,
		LearningListCollection: learningListCollection,
		PlaylistCollection:     playlistCollection,
	}, nil
}

// Close closes the MongoDB connection
func (m *MongoDB) Close(ctx context.Context) error {
	return m.Client.Disconnect(ctx)
}

// videoRepository implements VideoRepository
type videoRepository struct {
	collection *mongo.Collection
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

// VocabularyRepository interface for vocabulary operations
type VocabularyRepository interface {
	GetAll(ctx context.Context) ([]*models.Vocabulary, error)
	GetByID(ctx context.Context, id string) (*models.Vocabulary, error)
	Create(ctx context.Context, vocabulary *models.Vocabulary) error
	CreateBatch(ctx context.Context, vocabularies []*models.Vocabulary) error
	CheckExisting(ctx context.Context, maoriText string) (*models.Vocabulary, error)
	UpsertBatch(ctx context.Context, vocabularies []*models.Vocabulary) ([]*models.Vocabulary, []*models.Vocabulary, error)
	Update(ctx context.Context, id string, vocabulary *models.Vocabulary) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string) ([]*models.Vocabulary, error)
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

// CreateBatch creates multiple vocabulary items in a single operation
func (r *vocabularyRepository) CreateBatch(ctx context.Context, vocabularies []*models.Vocabulary) error {
	if len(vocabularies) == 0 {
		return nil
	}

	// Generate IDs for all vocabulary items
	for _, vocab := range vocabularies {
		vocab.GenerateID()
	}

	// Convert to interface slice for InsertMany
	docs := make([]interface{}, len(vocabularies))
	for i, vocab := range vocabularies {
		docs[i] = vocab
	}

	_, err := r.collection.InsertMany(ctx, docs)
	return err
}

// CheckExisting checks if a vocabulary item with the given Māori text already exists
func (r *vocabularyRepository) CheckExisting(ctx context.Context, maoriText string) (*models.Vocabulary, error) {
	var vocabulary models.Vocabulary
	err := r.collection.FindOne(ctx, bson.M{"maori": maoriText}).Decode(&vocabulary)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found, but not an error
		}
		return nil, err
	}
	return &vocabulary, nil
}

// UpsertBatch handles batch upsert operations, returning created and updated items
func (r *vocabularyRepository) UpsertBatch(ctx context.Context, vocabularies []*models.Vocabulary) ([]*models.Vocabulary, []*models.Vocabulary, error) {
	if len(vocabularies) == 0 {
		return []*models.Vocabulary{}, []*models.Vocabulary{}, nil
	}

	var created []*models.Vocabulary
	var updated []*models.Vocabulary

	for _, vocab := range vocabularies {
		vocab.GenerateID()

		// Check if item already exists
		existing, err := r.CheckExisting(ctx, vocab.Maori)
		if err != nil {
			return nil, nil, err
		}

		if existing != nil {
			// Update existing item
			existing.UpdateFromRequest(&models.VocabularyRequest{
				Maori:       vocab.Maori,
				English:     vocab.English,
				Description: vocab.Description,
			})

			if err := r.Update(ctx, existing.ID, existing); err != nil {
				return nil, nil, err
			}
			updated = append(updated, existing)
		} else {
			// Create new item
			if err := r.Create(ctx, vocab); err != nil {
				return nil, nil, err
			}
			created = append(created, vocab)
		}
	}

	return created, updated, nil
}

// Update updates an existing vocabulary item
func (r *vocabularyRepository) Update(ctx context.Context, id string, vocabulary *models.Vocabulary) error {
	update := bson.M{
		"$set": bson.M{
			"maori":       vocabulary.Maori,
			"english":     vocabulary.English,
			"description": vocabulary.Description,
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

// VocabularyIndexRepository interface for vocabulary index operations
type VocabularyIndexRepository interface {
	Create(ctx context.Context, index *models.VocabularyIndex) error
	CreateBatch(ctx context.Context, indexes []*models.VocabularyIndex) error
	GetByVideoID(ctx context.Context, videoID string) ([]*models.VocabularyIndex, error)
	SearchByVocabulary(ctx context.Context, vocabulary string) ([]*models.VocabularyIndex, error)
	SearchByEnglish(ctx context.Context, english string) ([]*models.VocabularyIndex, error)
	DeleteByVideoID(ctx context.Context, videoID string) error
	GetAll(ctx context.Context) ([]*models.VocabularyIndex, error)
	GetStats(ctx context.Context) (map[string]interface{}, error)
}

type vocabularyIndexRepository struct {
	collection *mongo.Collection
}

// NewVocabularyIndexRepository creates a new vocabulary index repository
func NewVocabularyIndexRepository(db *mongo.Database) VocabularyIndexRepository {
	return &vocabularyIndexRepository{
		collection: db.Collection("vocabulary_index"),
	}
}

// Create creates a new vocabulary index entry
func (r *vocabularyIndexRepository) Create(ctx context.Context, index *models.VocabularyIndex) error {
	index.GenerateID()
	_, err := r.collection.InsertOne(ctx, index)
	return err
}

// CreateBatch creates multiple vocabulary index entries in a single operation
func (r *vocabularyIndexRepository) CreateBatch(ctx context.Context, indexes []*models.VocabularyIndex) error {
	if len(indexes) == 0 {
		return nil
	}

	for _, index := range indexes {
		index.GenerateID()
	}

	docs := make([]interface{}, len(indexes))
	for i, index := range indexes {
		docs[i] = index
	}

	_, err := r.collection.InsertMany(ctx, docs)
	return err
}

// GetByVideoID retrieves all vocabulary indexes for a specific video
func (r *vocabularyIndexRepository) GetByVideoID(ctx context.Context, videoID string) ([]*models.VocabularyIndex, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"video_id": videoID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var indexes []*models.VocabularyIndex
	if err := cursor.All(ctx, &indexes); err != nil {
		return nil, err
	}

	return indexes, nil
}

// SearchByVocabulary searches for vocabulary indexes by Māori word/phrase
func (r *vocabularyIndexRepository) SearchByVocabulary(ctx context.Context, vocabulary string) ([]*models.VocabularyIndex, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"vocabulary": bson.M{"$regex": vocabulary, "$options": "i"}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var indexes []*models.VocabularyIndex
	if err := cursor.All(ctx, &indexes); err != nil {
		return nil, err
	}

	return indexes, nil
}

// SearchByEnglish searches for vocabulary indexes by English translation
func (r *vocabularyIndexRepository) SearchByEnglish(ctx context.Context, english string) ([]*models.VocabularyIndex, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"english": bson.M{"$regex": english, "$options": "i"}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var indexes []*models.VocabularyIndex
	if err := cursor.All(ctx, &indexes); err != nil {
		return nil, err
	}

	return indexes, nil
}

// DeleteByVideoID deletes all vocabulary indexes for a specific video
func (r *vocabularyIndexRepository) DeleteByVideoID(ctx context.Context, videoID string) error {
	_, err := r.collection.DeleteMany(ctx, bson.M{"video_id": videoID})
	return err
}

// GetAll retrieves all vocabulary indexes
func (r *vocabularyIndexRepository) GetAll(ctx context.Context) ([]*models.VocabularyIndex, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var indexes []*models.VocabularyIndex
	if err := cursor.All(ctx, &indexes); err != nil {
		return nil, err
	}

	return indexes, nil
}

// GetStats retrieves statistics about vocabulary indexes
func (r *vocabularyIndexRepository) GetStats(ctx context.Context) (map[string]interface{}, error) {
	totalCount, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	// Get unique vocabulary count
	uniqueVocabPipeline := []bson.M{
		{"$group": bson.M{"_id": "$vocabulary"}},
		{"$count": "unique_vocabulary"},
	}

	var uniqueVocabResult []bson.M
	cursor, err := r.collection.Aggregate(ctx, uniqueVocabPipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &uniqueVocabResult); err != nil {
		return nil, err
	}

	uniqueCount := 0
	if len(uniqueVocabResult) > 0 {
		if count, ok := uniqueVocabResult[0]["unique_vocabulary"].(int32); ok {
			uniqueCount = int(count)
		}
	}

	// Get unique video count
	uniqueVideoPipeline := []bson.M{
		{"$group": bson.M{"_id": "$video_id"}},
		{"$count": "unique_videos"},
	}

	var uniqueVideoResult []bson.M
	cursor, err = r.collection.Aggregate(ctx, uniqueVideoPipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &uniqueVideoResult); err != nil {
		return nil, err
	}

	uniqueVideoCount := 0
	if len(uniqueVideoResult) > 0 {
		if count, ok := uniqueVideoResult[0]["unique_videos"].(int32); ok {
			uniqueVideoCount = int(count)
		}
	}

	return map[string]interface{}{
		"total_indexes":     totalCount,
		"unique_vocabulary": uniqueCount,
		"unique_videos":     uniqueVideoCount,
	}, nil
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
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

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

	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
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
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
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

// Learning List Repository Methods

// CreateLearningListItem creates a new learning list item
func (m *MongoDB) CreateLearningListItem(ctx context.Context, item *models.LearningList) error {
	_, err := m.LearningListCollection.InsertOne(ctx, item)
	return err
}

// GetLearningListByUserID retrieves all learning list items for a user
func (m *MongoDB) GetLearningListByUserID(ctx context.Context, userID primitive.ObjectID) ([]*models.LearningList, error) {
	cursor, err := m.LearningListCollection.Find(ctx, bson.M{"user_id": userID}, options.Find().SetSort(bson.M{"timestamp": -1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []*models.LearningList
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

// GetLearningListItemByID retrieves a specific learning list item by ID
func (m *MongoDB) GetLearningListItemByID(ctx context.Context, id primitive.ObjectID) (*models.LearningList, error) {
	var item models.LearningList
	err := m.LearningListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

// UpdateLearningListItem updates a learning list item
func (m *MongoDB) UpdateLearningListItem(ctx context.Context, id primitive.ObjectID, update bson.M) error {
	_, err := m.LearningListCollection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

// DeleteLearningListItem deletes a learning list item
func (m *MongoDB) DeleteLearningListItem(ctx context.Context, id primitive.ObjectID) error {
	_, err := m.LearningListCollection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// GetLearningListByStatus retrieves learning list items by status for a user
func (m *MongoDB) GetLearningListByStatus(ctx context.Context, userID primitive.ObjectID, status string) ([]*models.LearningList, error) {
	filter := bson.M{
		"user_id": userID,
		"status":  status,
	}

	cursor, err := m.LearningListCollection.Find(ctx, filter, options.Find().SetSort(bson.M{"timestamp": -1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []*models.LearningList
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

// GetLearningListByVideoID retrieves learning list items for a specific video
func (m *MongoDB) GetLearningListByVideoID(ctx context.Context, userID primitive.ObjectID, videoID string) ([]*models.LearningList, error) {
	filter := bson.M{
		"user_id":  userID,
		"video_id": videoID,
	}

	cursor, err := m.LearningListCollection.Find(ctx, filter, options.Find().SetSort(bson.M{"timestamp": -1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []*models.LearningList
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

// PlaylistRepository interface for playlist operations
type PlaylistRepository interface {
	GetAll(ctx context.Context) ([]*models.Playlist, error)
	GetByID(ctx context.Context, id string) (*models.Playlist, error)
	GetByUserID(ctx context.Context, userID string) ([]*models.Playlist, error)
	GetPublicPlaylists(ctx context.Context) ([]*models.Playlist, error)
	Create(ctx context.Context, playlist *models.Playlist) error
	Update(ctx context.Context, id string, playlist *models.Playlist) error
	Delete(ctx context.Context, id string) error
	AddVideo(ctx context.Context, id, videoID string) error
	RemoveVideo(ctx context.Context, id, videoID string) error
	ReorderVideos(ctx context.Context, id string, videoIDs []string) error
}

// playlistRepository implements PlaylistRepository
type playlistRepository struct {
	collection *mongo.Collection
}

// NewPlaylistRepository creates a new playlist repository
func NewPlaylistRepository(db *MongoDB) PlaylistRepository {
	return &playlistRepository{
		collection: db.PlaylistCollection,
	}
}

// GetAll retrieves all playlists
func (r *playlistRepository) GetAll(ctx context.Context) ([]*models.Playlist, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var playlists []*models.Playlist
	if err = cursor.All(ctx, &playlists); err != nil {
		return nil, err
	}

	return playlists, nil
}

// GetByID retrieves a playlist by ID
func (r *playlistRepository) GetByID(ctx context.Context, id string) (*models.Playlist, error) {
	var playlist models.Playlist
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&playlist)
	if err != nil {
		return nil, err
	}
	return &playlist, nil
}

// GetByUserID retrieves all playlists for a specific user
func (r *playlistRepository) GetByUserID(ctx context.Context, userID string) ([]*models.Playlist, error) {
	filter := bson.M{"user_id": userID}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var playlists []*models.Playlist
	if err = cursor.All(ctx, &playlists); err != nil {
		return nil, err
	}

	return playlists, nil
}

// GetPublicPlaylists retrieves all public playlists
func (r *playlistRepository) GetPublicPlaylists(ctx context.Context) ([]*models.Playlist, error) {
	filter := bson.M{"is_public": true}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var playlists []*models.Playlist
	if err = cursor.All(ctx, &playlists); err != nil {
		return nil, err
	}

	return playlists, nil
}

// Create creates a new playlist
func (r *playlistRepository) Create(ctx context.Context, playlist *models.Playlist) error {
	playlist.GenerateID()
	_, err := r.collection.InsertOne(ctx, playlist)
	return err
}

// Update updates an existing playlist
func (r *playlistRepository) Update(ctx context.Context, id string, playlist *models.Playlist) error {
	update := bson.M{
		"$set": bson.M{
			"name":        playlist.Name,
			"description": playlist.Description,
			"video_ids":   playlist.VideoIDs,
			"is_public":   playlist.IsPublic,
			"updated_at":  playlist.UpdatedAt,
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

// Delete deletes a playlist by ID
func (r *playlistRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// AddVideo adds a video to a playlist
func (r *playlistRepository) AddVideo(ctx context.Context, id, videoID string) error {
	update := bson.M{
		"$addToSet": bson.M{"video_ids": videoID},
		"$set":      bson.M{"updated_at": time.Now()},
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

// RemoveVideo removes a video from a playlist
func (r *playlistRepository) RemoveVideo(ctx context.Context, id, videoID string) error {
	update := bson.M{
		"$pull": bson.M{"video_ids": videoID},
		"$set":  bson.M{"updated_at": time.Now()},
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

// ReorderVideos reorders videos in a playlist
func (r *playlistRepository) ReorderVideos(ctx context.Context, id string, videoIDs []string) error {
	update := bson.M{
		"$set": bson.M{
			"video_ids":  videoIDs,
			"updated_at": time.Now(),
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
