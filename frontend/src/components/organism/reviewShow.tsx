import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { IReviewShow } from "@/types/Review";
import { formatTimeAgo } from "@/utils/functions";
interface ReviewShowProps {
  data: IReviewShow;
}

export function ReviewShow({ data }: ReviewShowProps) {
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
  }, [data]);
  return (
    <div className="flex gap-4 border-b py-2">
      {data?.avatar && (
        <img
          src={data?.avatar}
          alt={`${data.username}'s avatar`}
          className="w-10 h-10 rounded-full"
        />
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-title-2 text-neutral-900">{data.username}</div>
        <div className="flex gap-2 items-center">
          <Rate value={data.reviewRating} max={5} size="xs" />
          <span className="text-body-3 text-neutral-600">
            {formatTimeAgo(data.createdAt)}
          </span>
        </div>
        <div
          ref={textRef}
          className={`mt-3 text-body-2 text-neutral-800 break-words ${
            !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          {data.reviewText}
        </div>
        {isTextOverflowing && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="link"
            className="w-fit px-0 text-neutral-500"
          >
            {isExpanded ? "See less" : "See more"}
          </Button>
        )}
      </div>
    </div>
  );
}
