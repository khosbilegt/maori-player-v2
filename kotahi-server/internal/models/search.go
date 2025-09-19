package models

// SearchResult represents a unified search result
type SearchResult struct {
	Type        string      `json:"type"` // "video", "vocabulary", or "playlist"
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description,omitempty"`
	Data        interface{} `json:"data"` // The actual object (Video, Vocabulary, or Playlist)
}

// SearchResponse represents the response for general search
type SearchResponse struct {
	Query   string         `json:"query"`
	Results []SearchResult `json:"results"`
	Counts  SearchCounts   `json:"counts"`
}

// SearchCounts represents the count of results by type
type SearchCounts struct {
	Videos       int `json:"videos"`
	Vocabularies int `json:"vocabularies"`
	Playlists    int `json:"playlists"`
	Total        int `json:"total"`
}
