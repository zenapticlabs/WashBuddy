import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";
import { SortBy } from "@/utils/constants";
import { FilterState } from "@/types/filters";
import { cn } from "@/lib/utils";
interface SortBySelectProps {
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filters: FilterState;
}

export function SortBySelect({ setFilters, filters }: SortBySelectProps) {
    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "px-4 py-2 h-auto rounded-full bg-white border border-neutral-50"
                    )}
                >
                    <div className="text-body-2 text-neutral-900">
                        {filters.sortBy}
                    </div>
                    <ChevronDown className="text-neutral-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
                {SortBy[filters.carWashType].map((sort) => (
                    <DropdownMenuItem key={sort} onClick={() => setFilters({ ...filters, sortBy: sort })}>{sort}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
