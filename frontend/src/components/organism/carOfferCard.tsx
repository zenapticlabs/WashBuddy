import { MapPinIcon, StarIcon, SparklesIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import hiddenOfferImage from "@/assets/bountyimg-bg-removal.png";

interface CarOfferCardProps {
  onClick: () => void;
  isSelected?: boolean;
  data: any;
}

export function CarOfferCard({ onClick, isSelected, data }: CarOfferCardProps) {
  return (
    <>
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-yellow-400 border-2 hover:border-yellow-400"
        }`}
        onClick={onClick}
      >
        <div className="flex gap-2 rounded-lg w-full">
          <div className="relative cursor-pointer group">
            <div className="w-16 h-16 md:w-24 md:h-24 relative rounded overflow-hidden">
              <Image 
                src={hiddenOfferImage} 
                alt="car-offer-card" 
                className="object-cover transition-transform group-hover:scale-105"
                fill
                priority={true}
                loading="eager"
                quality={75}
              />
            </div>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded transition-opacity" />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-title-2 md:text-title-1 text-neutral-900">
                  Secret Wash Deal Near You
                </div>
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-body-3 md:text-body-2 flex items-center text-neutral-500 mt-1">
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 pr-1" />
                <div>
                  Unlock the deal
                  <span className="px-1">·</span>
                  Just minutes away
                </div>
              </div>
              <Badge
                variant="blue"
                className="text-title-3 text-white w-fit hidden md:block px-2 py-1 rounded-lg mt-2"
              >
                Mystery Wash · WashBuddy Exclusive
              </Badge>
            </div>
            <div className="md:hidden flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <StarIcon className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />
                <span className="text-title-2 text-accent-yellow">
                  {data?.rating || "?"}<span className="text-body-3 text-neutral-300 pl-1">(Secret)</span>
                </span>
              </div>
              <div className="text-headline-4 py-1 text-neutral-900 text-right pl-4">
                ${data?.offer_price || "3"}
              </div>
              <div className="flex-1 text-body-3 text-neutral-900 text-right">
                Special Offer
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col justify-end border-l border-neutral-50 pl-4">
            <div className="flex items-center gap-0.5 justify-end">
              <StarIcon className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />
              <span className="text-title-2 text-accent-yellow">
                {data?.rating || "?"}
              </span>
              <span className="text-body-3 text-neutral-300">
                (Secret)
              </span>
            </div>
            <div className="text-headline-4 py-1 text-neutral-900 text-right">
              ${data?.offer_price || "3"}
            </div>
            <div className="flex-1 text-body-3 text-neutral-900 text-right">
              Special Offer
            </div>
          </div>
        </div>
        <Badge
          variant="blue"
          className="text-title-3 text-white w-fit md:hidden px-2 py-1 rounded-lg mt-2"
        >
          Mystery Wash · WashBuddy Exclusive
        </Badge>
      </div>
    </>
  );
}
