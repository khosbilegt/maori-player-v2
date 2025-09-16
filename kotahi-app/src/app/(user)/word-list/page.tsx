"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLearningList,
  useLearningListStats,
  useVocabularies,
  useLearningListMutations,
} from "@/lib/hooks/api";
import { toast } from "sonner";
import type { LearningListItem } from "@/lib/types";
import { BookOpen, CheckCircle, Clock, Play, Trash2 } from "lucide-react";
import Link from "next/link";

export default function LearningListPage() {
  const [selectedWord, setSelectedWord] = useState<LearningListItem | null>(
    null
  );

  const {
    data: learningListData,
    isLoading: isLoadingWords,
    error: wordsError,
  } = useLearningList();
  const { data: statsData } = useLearningListStats();
  const {
    vocabularies,
    isLoading: isLoadingVocab,
    error: vocabError,
  } = useVocabularies();
  const { updateItem, deleteItem } = useLearningListMutations();

  const learningList = learningListData?.data || [];
  const stats = statsData?.data;
  const isLoading = isLoadingWords || isLoadingVocab;

  // Enrich learning list with vocabulary data
  const enrichedWords = React.useMemo(() => {
    if (!learningList.length || !vocabularies?.length) return learningList;

    return learningList.map((word) => {
      // Find matching vocabulary entry
      const vocabMatch = vocabularies.find(
        (vocab) => vocab.maori?.toLowerCase() === word.text.toLowerCase()
      );

      return {
        ...word,
        // Use vocabulary data if available, otherwise use notes
        notes: vocabMatch?.english || word.notes || "",
        description: vocabMatch?.description || "",
        vocabulary: vocabMatch,
      };
    });
  }, [learningList, vocabularies]);

  const dummyVideos = [
    {
      id: "1",
      title: "Pakihi Māori: kōrero tuatahi",
      duration: "4:12",
      thumbnail: "/api/placeholder/200/120",
    },
    {
      id: "2",
      title: "He kōrero mō te whānau pakihi",
      duration: "5:10",
      thumbnail: "/api/placeholder/200/120",
    },
  ];

  // Handle status change
  const handleStatusChange = async (wordId: string, newStatus: string) => {
    try {
      await updateItem(wordId, {
        status: newStatus as "new" | "learning" | "learned",
      });
      toast.success("Status updated successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  // Handle word deletion
  const handleDeleteWord = async (wordId: string, wordText: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${wordText}" from your learning list?`
      )
    ) {
      return;
    }

    try {
      await deleteItem(wordId);
      toast.success("Word deleted successfully!");

      // If the deleted word was selected, clear the selection
      if (selectedWord?.id === wordId) {
        setSelectedWord(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete word");
    }
  };

  // Set default selected word
  React.useEffect(() => {
    if (enrichedWords.length > 0 && !selectedWord) {
      setSelectedWord(enrichedWords[0]);
    }
  }, [enrichedWords, selectedWord]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wordsError || vocabError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load data</p>
          {wordsError && (
            <p className="text-sm text-gray-500">Words: Failed to load</p>
          )}
          {vocabError && (
            <p className="text-sm text-gray-500">Vocabulary: Failed to load</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Statistics Bar */}
      <div className=" rounded-lg p-4">
        <div className="w-full flex gap-4 items-center border-b pb-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Saved words:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {stats?.total || enrichedWords.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Learning:</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-bold">
              {stats?.learning || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Learned:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">
              {stats?.learned || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">New:</span>
            <span className="text-orange-600 dark:text-orange-400 font-bold">
              {stats?.new || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      {learningList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Your Words */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your words</CardTitle>
              <Link href="#" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {enrichedWords.map((word) => (
                <div
                  key={word.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWord?.id === word.id
                      ? "bg-primary/10 border-primary"
                      : " hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedWord(word)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{word.text}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={word.status}
                        onValueChange={(value) =>
                          handleStatusChange(word.id, value)
                        }
                      >
                        <SelectTrigger
                          className="w-30 h-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              New
                            </div>
                          </SelectItem>
                          <SelectItem value="learning">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3" />
                              Learning
                            </div>
                          </SelectItem>
                          <SelectItem value="learned">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              Learned
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWord(word.id, word.text);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right Column - Selected Word Details */}
          <div className="space-y-6">
            {selectedWord && (
              <>
                {/* Word Details */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {selectedWord.text}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          {selectedWord.notes}
                        </p>
                      </div>

                      {/* Example Sentences */}
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg text-center text-gray-500 dark:text-gray-400">
                          <p className="text-sm">
                            No examples available for this word
                          </p>
                        </div>
                      </div>

                      <Button className="w-full">Practice this word</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Videos containing the word */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Videos containing &apos;{selectedWord.text}&apos;
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dummyVideos.map((video) => (
                        <div
                          key={video.id}
                          className=" rounded-lg p-4 space-y-3"
                        >
                          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <Play className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm mb-1">
                              {video.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {video.duration}
                              </span>
                              <Button
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                Watch
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 flex flex-col gap-4 mt-[20vh]">
          <p className="text-2xl font-bold">
            Kia Ora! Your learning list is empty
          </p>
          <p className="text-gray-600 dark:text-gray-400 w-1/2 mx-auto">
            Start watching videos and tap words to save them. They will appear
            here so you can review and practice across devices.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/library">Watch videos</Link>
            </Button>
            <Button variant="outline">Import my words</Button>
          </div>
        </div>
      )}
    </div>
  );
}
