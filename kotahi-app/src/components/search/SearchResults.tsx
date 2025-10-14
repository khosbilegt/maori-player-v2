"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, BookOpen } from "lucide-react";
import { SearchResult, VideoData, VocabularyOccurrence } from "@/lib/types";
import { useRouter } from "next/navigation";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  error?: any;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error searching. Please try again.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          No results found. Try different search terms.
        </p>
      </div>
    );
  }

  const handleResultClick = (result: SearchResult, startTime?: number) => {
    if (result.type === "video") {
      const url = startTime
        ? `/watch/${result.id}?t=${startTime}`
        : `/watch/${result.id}`;
      router.push(url);
    }
  };

  const renderVideoResult = (result: SearchResult) => {
    const video = result.data as VideoData;
    const occurrences = result.vocabulary_occurrences || [];

    return (
      <div className="flex gap-4">
        <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <img
            className="w-full aspect-video text-gray-500"
            src={video.thumbnail}
            alt="Video"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{result.title}</h3>
          {result.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {result.description}
            </p>
          )}

          {/* Display all vocabulary occurrences */}
          {occurrences.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {occurrences.length} occurrence
                  {occurrences.length > 1 ? "s" : ""} found
                </span>
              </div>
              {occurrences.map((occurrence, index) => (
                <div
                  key={index}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleResultClick(result, occurrence.start_time);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {occurrence.vocabulary}
                    </Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {occurrence.english}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.floor(occurrence.start_time / 60)}:
                      {(occurrence.start_time % 60).toFixed(0).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                    "{occurrence.transcript}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {video.duration && occurrences.length === 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">{video.duration}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResult = (result: SearchResult) => {
    if (result.type === "video") {
      return renderVideoResult(result);
    }
    return (
      <div>
        <h3 className="font-semibold text-lg">{result.title}</h3>
        {result.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {result.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const occurrences = result.vocabulary_occurrences || [];
        return (
          <Card
            key={`${result.type}-${result.id}`}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleResultClick(result)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">{renderResult(result)}</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    {occurrences.length > 0 ? "View Video" : "View"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SearchResults;
