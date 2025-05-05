import { MapPinIcon } from "lucide-react";
import { Badge } from "../ui/badge";

interface CarOfferCardProps {
  onClick: () => void;
  isSelected?: boolean;
}

export function CarOfferCard({ onClick, isSelected }: CarOfferCardProps) {
  const handleClick = () => {
    onClick();
  }
  return (
    <>
      <div
        className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-neutral-50 hover:border-blue-500"
          }`}
        onClick={handleClick}
      >
        <div className="flex gap-2 rounded-lg w-full">
          <div
            className="relative cursor-pointer group"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 object-cover rounded transition-transform group-hover:scale-105 text-red-500 md:text-8xl text-5xl font-bold bg-neutral-50 flex items-center justify-center">?</div>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded transition-opacity" />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <div className="text-title-2 md:text-title-1 text-neutral-900">
                A carwash nearby
              </div>
              <div className="text-body-3 md:text-body-2 flex items-center text-neutral-500 mt-1">
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 pr-1" />
                <div>Purchase to reveal this carwash location!
                  <span className="px-1">·</span>
                  Within 5 miles
                </div>
              </div>
            </div>
            <Badge
              variant="blue"
              className="text-title-3 text-white w-fit hidden md:block px-2 py-1 rounded-lg mt-2"
            >
              Special Washbuddy Price. Claim the best deal we have
            </Badge>
          </div>
        </div>
        <Badge
          variant="blue"
          className="text-title-3 text-white w-fit block md:hidden px-2 py-1 rounded-lg mt-2"
        >
          Special Washbuddy Price. Claim the best deal we have
        </Badge>
      </div>
    </>
  );
}
