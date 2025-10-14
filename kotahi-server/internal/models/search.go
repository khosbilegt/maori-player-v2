package models

// SearchResult represents a unified search result
type SearchResult struct {
	Type                  string                 `json:"type"` // "video"
	ID                    string                 `json:"id"`
	Title                 string                 `json:"title"`
	Description           string                 `json:"description,omitempty"`
	Data                  interface{}            `json:"data"`                             // The actual Video object
	VocabularyOccurrences []VocabularyOccurrence `json:"vocabulary_occurrences,omitempty"` // Vocabulary matches with timestamps
}

// VocabularyOccurrence represents a vocabulary word found at a specific time
type VocabularyOccurrence struct {
	Vocabulary  string  `json:"vocabulary"`
	English     string  `json:"english"`
	Description string  `json:"description"`
	StartTime   float64 `json:"start_time"` // Time in seconds where vocabulary was found
	EndTime     float64 `json:"end_time"`   // End time in seconds
	Transcript  string  `json:"transcript"` // The transcript line containing the vocabulary
}

// SearchResponse represents the response for general search
type SearchResponse struct {
	Query   string         `json:"query"`
	Results []SearchResult `json:"results"`
	Counts  SearchCounts   `json:"counts"`
}

// SearchCounts represents the count of results by type
type SearchCounts struct {
	Videos int `json:"videos"`
	Total  int `json:"total"`
}
