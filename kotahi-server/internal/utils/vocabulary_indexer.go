package utils

import (
	"fmt"
	"regexp"
	"strings"

	"video-player-backend/internal/models"
)

// VocabularyIndexer handles indexing vocabulary words in transcript text
type VocabularyIndexer struct {
	vocabularies []*models.Vocabulary
}

// NewVocabularyIndexer creates a new vocabulary indexer
func NewVocabularyIndexer(vocabularies []*models.Vocabulary) *VocabularyIndexer {
	return &VocabularyIndexer{
		vocabularies: vocabularies,
	}
}

// IndexTranscript indexes vocabulary words found in transcript text
func (vi *VocabularyIndexer) IndexTranscript(videoID string, transcriptLines []TranscriptLine) ([]*models.VocabularyIndex, error) {
	var indexes []*models.VocabularyIndex

	for lineNum, line := range transcriptLines {
		// Find vocabulary words in this transcript line
		lineIndexes := vi.findVocabularyInLine(videoID, line, lineNum)
		indexes = append(indexes, lineIndexes...)
	}

	return indexes, nil
}

// findVocabularyInLine finds vocabulary words in a single transcript line
func (vi *VocabularyIndexer) findVocabularyInLine(videoID string, line TranscriptLine, lineNum int) []*models.VocabularyIndex {
	var indexes []*models.VocabularyIndex

	for _, vocab := range vi.vocabularies {
		// Check if the Māori word appears in this transcript line
		if vi.isWordInText(vocab.Maori, line.Text) {
			index := &models.VocabularyIndex{
				VideoID:     videoID,
				Vocabulary:  vocab.Maori,
				English:     vocab.English,
				Description: vocab.Description,
				StartTime:   line.StartTime,
				EndTime:     line.EndTime,
				Transcript:  line.Text,
				LineNumber:  lineNum + 1, // 1-based line numbering
			}
			indexes = append(indexes, index)
		}
	}

	return indexes
}

// isWordInText checks if a vocabulary word appears in the given text
func (vi *VocabularyIndexer) isWordInText(word, text string) bool {
	// Normalize case
	wordLower := strings.ToLower(strings.TrimSpace(word))
	textLower := strings.ToLower(text)

	if wordLower == "" || textLower == "" {
		return false
	}

	// Build a Unicode-aware boundary regex that avoids partial matches.
	// For multi-word phrases, allow one or more non-letter separators between words.
	parts := strings.Fields(wordLower)
	quoted := make([]string, 0, len(parts))
	for _, p := range parts {
		if p == "" {
			continue
		}
		quoted = append(quoted, regexp.QuoteMeta(p))
	}
	if len(quoted) == 0 {
		return false
	}

	inner := quoted[0]
	if len(quoted) > 1 {
		inner = strings.Join(quoted, `\\P{L}+`)
	}

	// (^|\P{L}) ensures a non-letter (or start) before, (\P{L}|$) after.
	pattern := fmt.Sprintf(`(?i)(^|\\P{L})%s(\\P{L}|$)`, inner)
	matched, _ := regexp.MatchString(pattern, textLower)
	return matched
}

// TranscriptLine represents a single line in a transcript
type TranscriptLine struct {
	StartTime float64
	EndTime   float64
	Text      string
}

// ParseVTTToLines parses VTT content into transcript lines
func ParseVTTToLines(vttContent string) ([]TranscriptLine, error) {
	lines := strings.Split(vttContent, "\n")
	var transcriptLines []TranscriptLine
	var currentLine *TranscriptLine

	for _, line := range lines {
		line = strings.TrimSpace(line)

		// Skip empty lines and VTT headers
		if line == "" || line == "WEBVTT" || strings.HasPrefix(line, "NOTE") {
			continue
		}

		// Check if this line contains timing information (format: 00:00:00.000 --> 00:00:00.000)
		if strings.Contains(line, "-->") {
			// Parse timing information
			startTime, endTime, err := parseVTTTiming(line)
			if err != nil {
				continue // Skip malformed timing lines
			}

			currentLine = &TranscriptLine{
				StartTime: startTime,
				EndTime:   endTime,
			}
			continue
		}

		// If we have a current line and this is text content
		if currentLine != nil && line != "" {
			currentLine.Text = line
			transcriptLines = append(transcriptLines, *currentLine)
			currentLine = nil
		}
	}

	return transcriptLines, nil
}

// parseVTTTiming parses VTT timing format (00:00:00.000 --> 00:00:00.000)
func parseVTTTiming(timingLine string) (startTime, endTime float64, err error) {
	parts := strings.Split(timingLine, " --> ")
	if len(parts) != 2 {
		return 0, 0, fmt.Errorf("invalid timing format")
	}

	startTime, err = parseVTTTime(parts[0])
	if err != nil {
		return 0, 0, err
	}

	endTime, err = parseVTTTime(parts[1])
	if err != nil {
		return 0, 0, err
	}

	return startTime, endTime, nil
}

// parseVTTTime parses a single VTT time format (00:00:00.000)
func parseVTTTime(timeStr string) (float64, error) {
	// Remove any additional formatting (like positioning info)
	timeStr = strings.Split(timeStr, " ")[0]

	parts := strings.Split(timeStr, ":")
	if len(parts) != 3 {
		return 0, fmt.Errorf("invalid time format")
	}

	// Parse hours
	hours, err := parseFloat(parts[0])
	if err != nil {
		return 0, err
	}

	// Parse minutes
	minutes, err := parseFloat(parts[1])
	if err != nil {
		return 0, err
	}

	// Parse seconds (which may include milliseconds)
	seconds, err := parseFloat(parts[2])
	if err != nil {
		return 0, err
	}

	totalSeconds := hours*3600 + minutes*60 + seconds
	return totalSeconds, nil
}

// parseFloat is a simple float parser (you might want to use strconv.ParseFloat instead)
func parseFloat(s string) (float64, error) {
	// This is a simplified version - in production you'd use strconv.ParseFloat
	var result float64
	var decimal float64 = 1
	var inDecimal bool

	for _, char := range s {
		if char == '.' {
			inDecimal = true
			continue
		}
		if char >= '0' && char <= '9' {
			digit := float64(char - '0')
			if inDecimal {
				decimal /= 10
				result += digit * decimal
			} else {
				result = result*10 + digit
			}
		} else {
			return 0, fmt.Errorf("invalid character in number")
		}
	}

	return result, nil
}
