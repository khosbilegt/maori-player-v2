package utils

import (
	"encoding/csv"
	"fmt"
	"io"
	"strings"

	"video-player-backend/internal/models"
)

// CSVVocabularyRow represents a single row in the CSV file
type CSVVocabularyRow struct {
	Maori       string
	English     string
	Description string
}

// ParseVocabularyCSV parses a CSV file containing vocabulary data
// Expected CSV format: maori,english,description
func ParseVocabularyCSV(reader io.Reader) ([]*models.Vocabulary, error) {
	csvReader := csv.NewReader(reader)

	// Read all records
	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("CSV file is empty")
	}

	// Skip header row if it exists (check if first row looks like headers)
	var startRow int
	if len(records) > 0 && isHeaderRow(records[0]) {
		startRow = 1
	}

	var vocabularies []*models.Vocabulary
	var validationErrors []string
	maoriSet := make(map[string]int) // Track Māori words and their row numbers

	for i, record := range records[startRow:] {
		rowNum := startRow + i + 1

		// Validate row length
		if len(record) < 3 {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: insufficient columns (expected 3, got %d)", rowNum, len(record)))
			continue
		}

		// Parse and validate each field
		maori := strings.TrimSpace(record[0])
		english := strings.TrimSpace(record[1])
		description := strings.TrimSpace(record[2])

		// Validate required fields
		if maori == "" {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: Māori field is required", rowNum))
			continue
		}
		if english == "" {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: English field is required", rowNum))
			continue
		}
		if description == "" {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: Description field is required", rowNum))
			continue
		}

		// Check for duplicates within CSV
		if existingRow, exists := maoriSet[maori]; exists {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: Duplicate Māori word '%s' (first seen in row %d)", rowNum, maori, existingRow))
			continue
		}
		maoriSet[maori] = rowNum

		// Validate field lengths
		if len(maori) > 200 {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: Māori field exceeds 200 characters", rowNum))
			continue
		}
		if len(english) > 200 {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: English field exceeds 200 characters", rowNum))
			continue
		}
		if len(description) > 1000 {
			validationErrors = append(validationErrors,
				fmt.Sprintf("Row %d: Description field exceeds 1000 characters", rowNum))
			continue
		}

		// Create vocabulary request and convert to model
		vocabReq := &models.VocabularyRequest{
			Maori:       maori,
			English:     english,
			Description: description,
		}

		vocabulary := vocabReq.ToVocabulary()
		vocabularies = append(vocabularies, vocabulary)
	}

	// Return validation errors if any
	if len(validationErrors) > 0 {
		return nil, fmt.Errorf("CSV validation errors:\n%s", strings.Join(validationErrors, "\n"))
	}

	return vocabularies, nil
}

// isHeaderRow checks if a row looks like a header row
func isHeaderRow(row []string) bool {
	if len(row) < 3 {
		return false
	}

	// Check if the first few columns contain common header keywords
	firstCol := strings.ToLower(strings.TrimSpace(row[0]))
	secondCol := strings.ToLower(strings.TrimSpace(row[1]))
	thirdCol := strings.ToLower(strings.TrimSpace(row[2]))

	headerKeywords := []string{"maori", "māori", "english", "description"}

	for _, keyword := range headerKeywords {
		if firstCol == keyword || secondCol == keyword || thirdCol == keyword {
			return true
		}
	}

	return false
}

// ValidateCSVFormat validates that the CSV has the expected format
func ValidateCSVFormat(reader io.Reader) error {
	csvReader := csv.NewReader(reader)

	// Read first few rows to validate format
	records, err := csvReader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) == 0 {
		return fmt.Errorf("CSV file is empty")
	}

	// Check if we have at least one data row
	var dataStartRow int
	if isHeaderRow(records[0]) {
		if len(records) < 2 {
			return fmt.Errorf("CSV file only contains headers, no data rows")
		}
		dataStartRow = 1
	}

	// Validate that we have at least one valid data row
	if len(records) <= dataStartRow {
		return fmt.Errorf("no data rows found in CSV file")
	}

	// Check that all rows have the same number of columns
	expectedCols := len(records[dataStartRow])
	if expectedCols < 3 {
		return fmt.Errorf("CSV must have at least 3 columns (maori, english, description)")
	}
	for i, record := range records[dataStartRow:] {
		if len(record) != expectedCols {
			return fmt.Errorf("row %d has %d columns, expected %d",
				dataStartRow+i+1, len(record), expectedCols)
		}
	}

	return nil
}
