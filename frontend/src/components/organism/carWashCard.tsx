import { Rate } from "../ui/rate";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ICarWashCard } from "@/types";
import { formatTimeAgo } from "@/utils/functions";
import { DotIcon, MapPinIcon, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
interface CarWashCardProps {
  data: ICarWashCard;
  onClick: () => void;
}

export function CarWashCard({ data, onClick }: CarWashCardProps) {

  return (
    <div className="flex gap-2 border p-3 border-neutral-50 rounded-lg w-full">
      <img
        src={data.image}
        alt={data.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="text-title-1 text-neutral-900">{data.name}</div>
          <div className="text-body-2 flex items-center text-neutral-500 mt-1">
            <MapPinIcon className="w-5 h-5 pr-1" />
            {data.address}
            <DotIcon className="w-4 h-4" />
            {data.howFarAway} miles
          </div>
        </div>
        <Badge variant="green" className="text-title-3 text-white w-fit">
          {data.promotion}
        </Badge>
      </div>
      <div className="flex flex-col justify-end border-l border-neutral-50 pl-4">
        <div className="flex items-center gap-0.5 justify-end">
          <StarIcon className="w-3.5 h-3.5 text-accent-yellow fill-accent-yellow" />
          <span className="text-title-2 text-accent-yellow">
            {data.rating}
          </span>
          <span className="text-body-3 text-neutral-300">
            ({data.reviewsCount})
          </span>
        </div>
        <div className="text-headline-4 py-1 text-neutral-900 text-right">
          ${data.price}
        </div>
        <div className="flex-1 text-body-3 text-neutral-900 text-right">
          {data.washType}
        </div>
        <button className="text-title-2 text-blue-600 p-0" onClick={onClick}>View Details</button>
      </div>
    </div>
  );
}
