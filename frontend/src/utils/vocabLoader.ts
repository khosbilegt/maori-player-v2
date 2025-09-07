import { environment } from "../config/environment";

export interface VocabEntry {
  maori: string;
  english: string;
  pronunciation: string;
  description: string;
}

export interface VocabData {
  [key: string]: VocabEntry;
}

/**
 * Load and process vocabulary data from vocab.json
 * Returns a normalized lookup object where keys are lowercase Māori words
 */
export const loadVocabData = async (): Promise<VocabData> => {
  try {
    // Fallback to local vocab.json file
    const response = await fetch(environment.apiBaseUrl + "/api/v1/vocabulary");
    if (!response.ok) {
      throw new Error(`Failed to load vocab data: ${response.statusText}`);
    }
    const vocabEntries = await response.json();

    // Process into lookup object with normalized keys
    const vocabData: VocabData = {};

    vocabEntries.forEach((entry: VocabEntry) => {
      // Use NFC-normalized, lowercase Māori as key for case-insensitive lookup
      const normalizedKey = entry.maori.normalize("NFC").toLowerCase().trim();
      vocabData[normalizedKey] = entry;
    });

    return vocabData;
  } catch (error) {
    console.error("Error loading vocabulary data:", error);
    return {};
  }
};

/**
 * Get vocabulary entry for a specific word
 * @param word - The word to look up (case-insensitive)
 * @returns VocabEntry if found, null otherwise
 */
export const getVocabEntry = async (
  word: string
): Promise<VocabEntry | null> => {
  const vocabData = await loadVocabData();
  const normalizedWord = word.toLowerCase().trim();
  return vocabData[normalizedWord] || null;
};

/**
 * Check if a word exists in the vocabulary
 * @param word - The word to check (case-insensitive)
 * @returns boolean indicating if the word exists
 */
export const hasVocabEntry = async (word: string): Promise<boolean> => {
  const vocabData = await loadVocabData();
  const normalizedWord = word.toLowerCase().trim();
  return normalizedWord in vocabData;
};

/**
 * Get all vocabulary data (useful for preloading)
 * @returns Complete vocabulary data object
 */
export const getAllVocabData = async (): Promise<VocabData> => {
  return await loadVocabData();
};

/**
 * Find the longest matching vocabulary phrase starting at a given position in word array
 * @param words - Array of words to search through
 * @param startIndex - Starting position in the words array
 * @param vocabData - Vocabulary lookup object
 * @returns Object with matched phrase info or null if no match
 */
export const findLongestVocabMatch = (
  words: string[],
  startIndex: number,
  vocabData: VocabData
): {
  entry: VocabEntry;
  wordCount: number;
  matchedText: string;
} | null => {
  // Try phrases of decreasing length, starting from the maximum possible
  const maxPhraseLength = Math.min(5, words.length - startIndex); // Limit to 5 words max

  for (let phraseLength = maxPhraseLength; phraseLength >= 1; phraseLength--) {
    // Extract the phrase (preserving original casing for display)
    const phraseWords = words.slice(startIndex, startIndex + phraseLength);
    const matchedText = phraseWords.join(" ");

    // Create normalized key for lookup (lowercase, trimmed)
    const normalizedPhrase = matchedText.normalize("NFC").toLowerCase().trim();

    // Also try hyphenated form to support phrases stored hyphenated in data
    const hyphenated = normalizedPhrase.replace(/\s+/g, "-");

    const vocabEntry = vocabData[normalizedPhrase] || vocabData[hyphenated];

    if (vocabEntry) {
      return {
        entry: vocabEntry,
        wordCount: phraseLength,
        matchedText: matchedText,
      };
    }
  }

  return null;
};

/**
 * Parse text and identify all vocabulary matches with their positions
 * @param text - Text to parse
 * @param vocabData - Vocabulary lookup object
 * @returns Array of match objects with positions and vocab entries
 */
export const parseTextForVocabMatches = (
  text: string,
  vocabData: VocabData
): Array<{
  startIndex: number;
  endIndex: number;
  wordCount: number;
  entry: VocabEntry;
  matchedText: string;
}> => {
  // Split text into words while preserving positions
  const words = text
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-") // normalize hyphen-like chars
    .normalize("NFC")
    .split(/(\s+)/);
  const matches: Array<{
    startIndex: number;
    endIndex: number;
    wordCount: number;
    entry: VocabEntry;
    matchedText: string;
  }> = [];

  // Get only the actual words (not whitespace), stripping punctuation so matches aren't missed
  const actualWords: string[] = [];
  const wordToSegmentMap: number[] = []; // Maps word index to segment index

  words.forEach((segment, segmentIndex) => {
    if (!segment.match(/^\s+$/)) {
      // Strip leading/trailing punctuation for matching purposes, keep hyphens and letters/numbers
      const wordOnly = (segment || "")
        .normalize("NFC")
        .toLowerCase()
        .replace(/^[^\p{Letter}0-9-]+/gu, "")
        .replace(/[^\p{Letter}0-9-]+$/gu, "");

      if (wordOnly.length > 0) {
        actualWords.push(wordOnly);
        wordToSegmentMap.push(segmentIndex);
      }
    }
  });

  let wordIndex = 0;
  while (wordIndex < actualWords.length) {
    const match = findLongestVocabMatch(actualWords, wordIndex, vocabData);

    if (match) {
      const startSegmentIndex = wordToSegmentMap[wordIndex];
      const endSegmentIndex = wordToSegmentMap[wordIndex + match.wordCount - 1];

      matches.push({
        startIndex: startSegmentIndex,
        endIndex: endSegmentIndex,
        wordCount: match.wordCount,
        entry: match.entry,
        matchedText: match.matchedText,
      });

      // Skip past the matched words
      wordIndex += match.wordCount;
    } else {
      // No match found, move to next word
      wordIndex++;
    }
  }

  return matches;
};
