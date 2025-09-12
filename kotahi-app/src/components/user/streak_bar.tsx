import { Sparkles, Star } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";

function StreakBar() {
  return (
    <div className="w-full flex gap-4 items-center border-b pb-4 border-t pt-4">
      <Sparkles />
      <p>Up next for you</p>
      <Badge>
        <Star />
        <p>Continue streak: 3 days</p>
      </Badge>
    </div>
  );
}

export default StreakBar;
