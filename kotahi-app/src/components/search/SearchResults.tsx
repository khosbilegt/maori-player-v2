"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import { SearchResult, VideoData } from "@/lib/types";
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

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "video") {
      router.push(`/watch/${result.id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "video") {
      return <Play className="w-4 h-4" />;
    }
    return null;
  };

  const getTypeColor = (type: string) => {
    if (type === "video") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const renderVideoResult = (result: SearchResult) => {
    const video = result.data as VideoData;
    return (
      <div className="flex gap-4">
        <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <Play className="w-6 h-6 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{result.title}</h3>
          {result.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {result.description}
            </p>
          )}
          {video.duration && (
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
      {results.map((result) => (
        <Card
          key={`${result.type}-${result.id}`}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleResultClick(result)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">{renderResult(result)}</div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(result.type)}>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(result.type)}
                    <span className="capitalize">{result.type}</span>
                  </div>
                </Badge>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
