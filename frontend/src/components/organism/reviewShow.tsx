import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface ReviewShowProps {
  username: string;
  avatar: string;
  reviewText: string;
  reviewRating: number;
  photos?: string[];
  createdAt: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function ReviewShow({
  username,
  avatar,
  reviewText,
  reviewRating,
  photos,
  createdAt,
}: ReviewShowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if the content height is greater than line height * 3
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setIsTextOverflowing(isOverflowing);
    }
  }, [reviewText]);
  return (
    <div className="flex gap-4 border-b py-2">
      {/* <div className="flex-shrink-0 w-10 h-10 bg-accent-yellow rounded-full"></div> */}
      <img 
        src={avatar} 
        alt={`${username}'s avatar`}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-title-2 text-neutral-900">{username}</div>
        <div className="flex gap-2 items-center">
          <Rate value={reviewRating} max={5} size="xs" />
          <span className="text-body-3 text-neutral-600">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
        <div
          ref={textRef}
          className={`mt-3 text-body-2 text-neutral-800 break-words ${
            !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          {reviewText}
        </div>
        {isTextOverflowing && (
          <Button onClick={() => setIsExpanded(!isExpanded)} variant="link" className="w-fit px-0 text-neutral-500">
            {isExpanded ? "See less" : "See more"}
          </Button>
        )}
      </div>
    </div>
  );
}
