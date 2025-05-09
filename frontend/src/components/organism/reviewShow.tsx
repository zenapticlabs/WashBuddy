import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { IReviewShow } from "@/types/Review";
import { formatTimeAgo } from "@/utils/functions";
import Image from "next/image";
import { Eye } from "lucide-react";
import { ImageModal } from "@/components/molecule/ImageModal";

const emptyImageURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

interface ReviewShowProps {
  data: IReviewShow;
}

export function ReviewShow({ data }: ReviewShowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if the content height is greater than line height * 3
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setIsTextOverflowing(isOverflowing);
    }
  }, [data]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <>
      <div className="flex gap-4 border-b py-2">
        {data?.user_metadata?.avatar_url ? (
          <Image
            src={data?.user_metadata?.avatar_url}
            alt={`${data.user_metadata?.firstName}'s avatar`}
            className="w-10 h-10 rounded-full"
            width={40}
            height={40}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center">
            {data?.user_metadata?.firstName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="text-title-2 text-neutral-900">
            {data.user_metadata?.firstName}
          </div>
          <div className="flex gap-2 items-center">
            <Rate value={data.overall_rating} max={5} size="xs" />
            <span className="text-body-3 text-neutral-600">
              {formatTimeAgo(data.created_at)}
            </span>
          </div>
          <div
            ref={textRef}
            className={`mt-3 text-body-2 text-neutral-800 break-words ${!isExpanded ? "line-clamp-3" : ""}`}
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
          {data.images && data.images.length > 0 && (
            <>
              <div className="flex flex-row gap-3 py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {data.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.image_url}
                    alt="review"
                    className="w-24 h-24 rounded-lg object-cover border border-neutral-100 cursor-pointer hover:opacity-90 transition-opacity"
                    width={160}
                    height={160}
                    onClick={() => handleImageClick(image.image_url)}
                  />
                ))}
              </div>
              <span className="flex items-center gap-1 text-body-2 text-neutral-500">
                <Eye size={16} />
                {data.images.length}
              </span>
            </>
          )}
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || emptyImageURL}
        alt="Review photo"
      />
    </>
  );
}
