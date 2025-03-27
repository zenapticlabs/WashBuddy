"use client";

import Topbar from "@/components/pages/main/Topbar";
import {
  ChevronDown,
  Eye,
  Image,
  MessageSquareText,
  Search,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { IMyReview, IReviewShow } from "@/types/Review";
import { ReviewShow } from "@/components/organism/reviewShow";
import { MyReview } from "@/components/organism/myReview";
import { RadarMap } from "@/components/organism/RadarMap";
import { MobileRewardView } from "@/components/pages/main/MobileRewardView";
import reviews from "@/mocks/myReviewData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RewardList } from "@/components/pages/rewards/RewardList";
const SortOptions = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Oldest",
    value: "oldest",
  },
];
export default function Rewards() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const [sortBy, setSortBy] = useState<string>(SortOptions[0].value);
  const [showMap, setShowMap] = useState<boolean>(false);
  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar sideBarAlwaysOpen={true} />
        <div className="flex flex-row md:ml-[210px] h-[calc(100vh-66px)] relative">
          <div className="w-[640px] px-3 md:flex hidden ">
            <RewardList
              sortBy={sortBy}
              setSortBy={setSortBy}
              reviews={reviews}
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <RadarMap
              showMap={showMap}
              publishableKey={RADAR_KEY || ""}
              carWashes={[]}
              onMapReady={() => {}}
            />
          </div>
          <MobileRewardView
            showMap={showMap}
            setShowMap={setShowMap}
            sortBy={sortBy}
            setSortBy={setSortBy}
            reviews={reviews}
          />
        </div>
      </div>
    </>
  );
}
