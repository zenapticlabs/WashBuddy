import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { IReviewShow } from "@/types/Review";
import { formatTimeAgo } from "@/utils/functions";
import Image from "next/image";

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
      {data?.user_metadata?.avatar_url && (
        <Image
          src={data?.user_metadata?.avatar_url}
          alt={`${data.user_metadata?.full_name}'s avatar`}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-title-2 text-neutral-900">
          {data.user_metadata?.full_name}
        </div>
        <div className="flex gap-2 items-center">
          <Rate value={data.overall_rating} max={5} size="xs" />
          <span className="text-body-3 text-neutral-600">
            {formatTimeAgo(data.created_at)}
          </span>
        </div>
        <div
          ref={textRef}
          className={`mt-3 text-body-2 text-neutral-800 break-words ${
            !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          {data.comment}
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
