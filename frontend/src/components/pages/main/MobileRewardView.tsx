import { ScrollArea } from "@/components/ui/scroll-area";
import { CarWashCard } from "@/components/organism/carWashCard";
import { FilterState, IMyReview } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Eye,
  Image,
  MessageSquareText,
  Search,
  Star,
} from "lucide-react";
import { useState } from "react";
import { SortBy, Car_Wash_Type } from "@/utils/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CarWashResponse } from "@/types/CarServices";
import { CarWashSkeleton } from "@/components/organism/carWashSkeleton";
import { CustomPagination } from "@/components/molecule/CustomPagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { MyReview } from "@/components/organism/myReview";
import { RewardList } from "../rewards/RewardList";

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

interface MobileRewardViewProps {
  showMap: boolean;
  sortBy: string;
  setShowMap: (showMap: boolean) => void;
  setSortBy: (sortBy: string) => void;
  reviews: IMyReview[];
}

export function MobileRewardView({
  showMap,
  setShowMap,
  sortBy,
  setSortBy,
  reviews,
}: MobileRewardViewProps) {
  const [openSortBy, setOpenSortBy] = useState(false);
  return (
    <div
      className={`block md:hidden absolute bottom-0 left-0 right-0 w-full bg-white transition-all z-30 duration-300 ease-in-out ${
        showMap ? "h-[400px] rounded-t-2xl" : "h-full"
      } flex flex-col`}
    >
      <div className="w-full px-3 py-3 h-full">
        <RewardList sortBy={sortBy} setSortBy={setSortBy} reviews={reviews} showMap={showMap} setShowMap={setShowMap} />
      </div>
    </div>
  );
}
