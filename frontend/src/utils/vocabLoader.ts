import { environment } from "../config/environment";
import { getAssetPath } from "./assetPaths";

export interface VocabEntry {
  id: string;
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
      // Use lowercase Māori word as key for case-insensitive lookup
      const normalizedKey = entry.maori.toLowerCase().trim();
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
  vocabId: string;
} | null => {
  // Try phrases of decreasing length, starting from the maximum possible
  const maxPhraseLength = Math.min(5, words.length - startIndex); // Limit to 5 words max

  for (let phraseLength = maxPhraseLength; phraseLength >= 1; phraseLength--) {
    // Extract the phrase (preserving original casing for display)
    const phraseWords = words.slice(startIndex, startIndex + phraseLength);
    const matchedText = phraseWords.join(" ");

    // Create normalized key for lookup (lowercase, trimmed)
    const normalizedPhrase = matchedText.toLowerCase().trim();

    const vocabEntry = vocabData[normalizedPhrase];
    if (vocabEntry) {
      return {
        entry: vocabEntry,
        wordCount: phraseLength,
        matchedText: matchedText,
        vocabId: vocabEntry.id,
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
  vocabId: string;
}> => {
  // Split text into words while preserving positions
  const words = text.split(/(\s+)/);
  const matches: Array<{
    startIndex: number;
    endIndex: number;
    wordCount: number;
    entry: VocabEntry;
    matchedText: string;
    vocabId: string;
  }> = [];

  // Get only the actual words (not whitespace)
  const actualWords: string[] = [];
  const wordToSegmentMap: number[] = []; // Maps word index to segment index

  words.forEach((segment, segmentIndex) => {
    if (!segment.match(/^\s+$/)) {
      actualWords.push(segment);
      wordToSegmentMap.push(segmentIndex);
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
        vocabId: match.vocabId,
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
