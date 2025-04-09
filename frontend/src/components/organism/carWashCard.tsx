import { CarWashResponse } from "@/types/CarServices";
import { DotIcon, MapPinIcon, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { ImageModal } from "../molecule/ImageModal";
import { useState } from "react";

interface CarWashCardProps {
  data: CarWashResponse;
  onClick: () => void;
  isSelected?: boolean;
}

const emptyImageURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export function CarWashCard({ data, onClick, isSelected }: CarWashCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  return (
    <>
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-neutral-50 hover:border-blue-500"
        }`}
        onClick={onClick}
      >
        <div className="flex gap-2 rounded-lg w-full">
          <div
            className="relative cursor-pointer group"
            onClick={handleImageClick}
          >
            <Image
              src={
                data.image_url ||
                data.images.find((image) => image.image_type === "Site")
                  ?.image_url ||
                emptyImageURL
              }
              alt={data.car_wash_name}
              className="w-16 h-16 md:w-24 md:h-24 object-cover rounded transition-transform group-hover:scale-105"
              width={100}
              height={100}
              priority={true}
              loading="eager"
              quality={75}
              blurDataURL={emptyImageURL}
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded transition-opacity" />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <div className="text-title-2 md:text-title-1 text-neutral-900">
                {data.car_wash_name}
              </div>
              <div className="text-body-3 md:text-body-2 flex items-center text-neutral-500 mt-1">
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 pr-1" />
                <div>
                  {data.formatted_address}
                  <span className="px-1">·</span>
                  {Number(data.distance).toFixed(2)} miles
                </div>
              </div>
            </div>
            <div className="md:hidden flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <StarIcon className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />
                <span className="text-title-2 text-accent-yellow">
                  {data.reviews_average}

                  <span className="text-body-3 text-neutral-300 pl-1">
                    ({data.reviews_count})
                  </span>
                </span>
              </div>
              <div className="text-headline-4 py-1 text-neutral-900 text-right pl-4">
                $
                {data.packages?.length > 0
                  ? `${Math.min(
                      ...data.packages.map((pkg) => Number(pkg.price))
                    )}`
                  : "N/A"}
              </div>
              <div className="flex-1 text-body-3 text-neutral-900 text-right">
                {data.packages?.length > 0 &&
                  data.packages.reduce((lowest, pkg) =>
                    Number(pkg.price) < Number(lowest.price) ? pkg : lowest
                  ).name}
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col justify-end border-l border-neutral-50 pl-4">
            <div className="flex items-center gap-0.5 justify-end">
              <StarIcon className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />
              <span className="text-title-2 text-accent-yellow">
                {data.reviews_average}
              </span>
              <span className="text-body-3 text-neutral-300">
                ({data.reviews_count})
              </span>
            </div>
            <div className="text-headline-4 py-1 text-neutral-900 text-right">
              $
              {data.packages?.length > 0
                ? `${Math.min(
                    ...data.packages.map((pkg) => Number(pkg.price))
                  )}`
                : "N/A"}
            </div>
            <div className="flex-1 text-body-3 text-neutral-900 text-right">
              {data.packages?.length > 0 &&
                data.packages.reduce((lowest, pkg) =>
                  Number(pkg.price) < Number(lowest.price) ? pkg : lowest
                ).name}
            </div>
          </div>
        </div>
        {/* <Badge
          variant="green"
          className="text-title-3 text-white w-fit block md:hidden px-2 py-1 rounded-lg mt-2"
        >
          Student Discount - 20% Off
        </Badge> */}
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={
          data.image_url ||
          data.images.find((image) => image.image_type === "Site")?.image_url ||
          emptyImageURL
        }
        alt={data.car_wash_name}
      />
    </>
  );
}
