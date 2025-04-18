import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { IMyReview } from "@/types/Review";
import { formatTimeAgo } from "@/utils/functions";
import { EllipsisVertical, Eye, MapPin, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
interface MyReviewProps {
  data: IMyReview;
  pictureMode?: boolean;
}

export function MyReview({ data, pictureMode = false }: MyReviewProps) {
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
      {data?.carWashImage && (
        <img
          src={data?.carWashImage}
          alt={`${data.carWashName}'s image`}
          className="w-10 h-10 rounded-full md:block hidden"
        />
      )}
      <div className="flex flex-col min-w-0 w-full">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            {data?.carWashImage && (
              <img
                src={data?.carWashImage}
                alt={`${data.carWashName}'s image`}
                className="w-10 h-10 rounded-full block md:hidden"
              />
            )}
            <div className="flex flex-col gap-1">
              <div className="text-title-2 text-neutral-900">
                {data.carWashName}
              </div>
              <div className="flex gap-2 items-center">
                <MapPin size={16} className="text-neutral-500" />
                <span className="text-body-3 text-neutral-600">
                  {data.carWashAddress}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-1 hidden md:flex">
              <div className="h-6 w-6 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
                <Star className="text-white stroke-0.5" size={16} />
              </div>
              <span className="text-body-2 text-neutral-500">+ 25 Points</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-100 duration-300">
                  <EllipsisVertical size={20} className="text-neutral-900" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {pictureMode && (
          <div className="flex items-center gap-1 flex-row md:hidden py-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
              <Star className="text-white stroke-0.5" size={16} />
            </div>
            <span className="text-body-2 text-neutral-500">+ 25 Points</span>
          </div>
        )}
        {!pictureMode && (
          <div className="flex gap-2 items-center py-3">
            <div className="md:hidden">
              <Rate value={data.reviewRating} max={5} size="sm" />
            </div>
            <div className="hidden md:flex">
              <Rate value={data.reviewRating} max={5} size="xs" />
            </div>
            <span className="text-body-3 text-neutral-600">
              {formatTimeAgo(data.createdAt)}
            </span>
          </div>
        )}
        {!pictureMode && (
          <>
            <div
              ref={textRef}
              className={`text-body-2 text-neutral-800 break-words ${
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
          </>
        )}
        {pictureMode && (
          <>
            <div className="flex flex-row gap-3 py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {data.photos?.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt="review"
                  className="w-40 h-40 rounded-lg"
                />
              ))}
            </div>
            <span className="flex items-center gap-1 text-body-2 text-neutral-500">
              <Eye size={16} />
              126
            </span>
          </>
        )}
      </div>
    </div>
  );
}
