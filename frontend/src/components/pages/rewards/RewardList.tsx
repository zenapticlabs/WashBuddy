import { ScrollArea } from "@/components/ui/scroll-area";
import { IMyReview } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Eye,
  Image,
  MessageSquareText,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { MyReview } from "@/components/organism/myReview";

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

interface RewardListProps {
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  reviews: IMyReview[];
  showMap?: boolean;
  setShowMap?: (showMap: boolean) => void;
}

export function RewardList({ sortBy, setSortBy, reviews, showMap, setShowMap }: RewardListProps) {
  return (
    <div className="h-full flex flex-col md:px-4 px-1 overflow-hidden">
      <div className="flex md:gap-4 md:flex-row flex-col shrink-0">
        <div className="text-headline-2 text-neutral-900 py-2 md:py-4 flex items-center gap-2 justify-between">
          Your Rewards
          <Button
            variant="outline"
            className="rounded-full shadow-none text-title-2 border-neutral-100 md:hidden"
            onClick={() => setShowMap?.(!showMap)}
          >
            <input
              checked={showMap}
              readOnly
              id="disabled-checked-checkbox"
              type="checkbox"
              value=""
              className="w-4 h-4 text-blue-500 border-gray-300 rounded-md checked:bg-blue-500 checked:border-blue-500"
            ></input>
            Show map
          </Button>
        </div>
        <div className="flex items-center gap-1 py-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-t from-[#FFA100] to-[#FFC35C] flex items-center justify-center">
            <Star className="text-white stroke-0.5" size={16} />
          </div>
          <span className="text-headline-5 text-neutral-800">1260 Points</span>
        </div>
      </div>
      <Tabs defaultValue="reviews" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="bg-transparent w-full justify-start relative shrink-0">
          <TabsTrigger
            value="reviews"
            className="text-title-2 text-neutral-900"
          >
            <MessageSquareText size={20} className="mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="photos" className="text-title-2 text-neutral-900">
            <Image size={20} className="mr-2" />
            Photos
          </TabsTrigger>
          <div className="w-full h-[2px] -z-10 bg-[#e5e5e5] absolute bottom-[1px]"></div>
        </TabsList>
        <div className="flex justify-between items-center py-1 shrink-0">
          <div className="flex gap-4">
            <div className="flex items-center">
              <Image size={20} className="mr-2" />
              23
            </div>
            <div className="flex items-center">
              <Eye size={20} className="mr-2" />
              1321
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "px-4 py-2 h-auto rounded-full bg-[#F6F6F6] border border-neutral-50"
                  )}
                >
                  <div className="text-body-2 text-neutral-900">
                    {
                      SortOptions.find((option) => option.value === sortBy)
                        ?.label
                    }
                  </div>
                  <ChevronDown className="text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
                {SortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="h-4" />
            <Search size={20} className="text-neutral-900" />
          </div>
        </div>
        <TabsContent value="reviews" className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {reviews.map((review) => (
              <MyReview data={review} key={review.id} />
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="photos" className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {reviews.map((review) => (
              <MyReview data={review} key={review.id} pictureMode={true} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
