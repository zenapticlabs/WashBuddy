import { IMyReview } from "@/types";
import { RewardList } from "../rewards/RewardList";

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
  return (
    <div
      className={`block md:hidden absolute bottom-0 left-0 right-0 w-full bg-white transition-all z-30 duration-300 ease-in-out ${showMap ? "h-[400px] rounded-t-2xl" : "h-full"
        } flex flex-col`}
    >
      <div className="w-full px-3 py-3 h-full">
        <RewardList sortBy={sortBy} setSortBy={setSortBy} reviews={reviews} showMap={showMap} setShowMap={setShowMap} />
      </div>
    </div>
  );
}
