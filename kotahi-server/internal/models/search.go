package models

// SearchResult represents a unified search result
type SearchResult struct {
	Type        string      `json:"type"` // "video"
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description,omitempty"`
	Data        interface{} `json:"data"` // The actual Video object
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
