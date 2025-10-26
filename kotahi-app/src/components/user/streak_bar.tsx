import { Sparkles, Star, Flame } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { useGetUserProgressQuery } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";

function StreakBar() {
  const { data, isLoading } = useGetUserProgressQuery();

  const currentStreak = data?.data?.current_streak || 0;
  const longestStreak = data?.data?.longest_streak || 0;

  return (
    <div className="w-full flex gap-4 items-center border-b pb-4 border-t pt-4 flex-wrap">
      <Sparkles className="w-5 h-5 text-yellow-500" />
      <p className="text-sm font-medium">Keep your streak going!</p>

      {isLoading ? (
        <Skeleton className="h-7 w-32" />
      ) : currentStreak > 0 ? (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700"
        >
          <Flame className="w-4 h-4 mr-1 text-orange-500" />
          <p className="font-semibold text-orange-700 dark:text-orange-400">
            {currentStreak} {currentStreak === 1 ? "day" : "days"} streak!
          </p>
        </Badge>
      ) : (
        <Badge variant="outline">
          <Star className="w-4 h-4 mr-1" />
          <p>Start your streak today!</p>
        </Badge>
      )}

      {!isLoading && longestStreak > currentStreak && currentStreak > 0 && (
        <p className="text-xs text-muted-foreground ml-auto">
          Best: {longestStreak} {longestStreak === 1 ? "day" : "days"}
        </p>
      )}
    </div>
  );
}

export default StreakBar;
