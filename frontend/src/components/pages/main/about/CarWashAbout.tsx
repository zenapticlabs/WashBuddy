import { Separator } from "@/components/ui/separator";
import WashPackage from "@/components/molecule/WashPackage";
import Image, { StaticImageData } from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import car1_img from "@/assets/car1.png";
import car2_img from "@/assets/car2.png";
import Link from "next/link";
import { CarWashResponse } from "@/types/CarServices";
import { ImageModal } from "@/components/molecule/ImageModal";
import { useState } from "react";

const photos: StaticImageData[] = [car1_img, car2_img, car2_img, car2_img];

const emptyImageURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIRshHRsdIR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export default function CarWashAbout({ data }: { data: CarWashResponse }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 relative">
          <div className="flex gap-2 overflow-x-auto pb-4 w-full max-w-[100vw] px-4 -mx-4">
            {data.packages.map((wp) => (
              <WashPackage key={wp.id} data={wp} />
            ))}
            {data.packages.length === 0 && (
              <div className="text-body-3 text-neutral-500">
                There is no package yet
              </div>
            )}
          </div>
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-white" />
        </div>
        <Separator />
        <div className="p-3 border border-neutral-100 rounded-xl">
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-accent-yellow w-6 h-6 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body-2 text-neutral-900">+ 25 Points</span>
                <span className="w-4 h-4 border text-xs border-neutral-200 text-neutral-200 rounded-full flex items-center justify-center">
                  i
                </span>
              </div>
            </div>
            <Link
              href={`/carwash?id=${data.id}`}
              className="bg-blue-500 text-title-2 text-white rounded-md px-4 py-2"
            >
              Update Info
            </Link>
          </div>
          <div className="text-body-3 text-neutral-500 pt-2">
            Wrong price? New photos? Upload a photo – earn points towards a free
            car wash! 🚗✨
          </div>
        </div>
        <Separator />
        <div className="text-title-2 text-neutral-500 py-1">Photos</div>
        <div className="grid grid-cols-4 gap-2">
          {data.images?.map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => handleImageClick(image.image_url)}
            >
              <Image
                src={image.image_url}
                alt="photo"
                className="w-24 h-24 object-cover rounded transition-transform group-hover:scale-105"
                width={100}
                height={100}
                priority={true}
                loading="eager"
                quality={75}
                blurDataURL={emptyImageURL}
                placeholder="blur"
              />
              <div className="absolute -inset-2 bg-black opacity-0 group-hover:opacity-20 rounded transition-opacity" />
            </div>
          ))}
        </div>
        {data.images.length === 0 && (
          <div className="text-body-3 text-neutral-500">
            There is no photo yet
          </div>
        )}
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || emptyImageURL}
        alt="Car wash photo"
      />
    </>
  );
}
