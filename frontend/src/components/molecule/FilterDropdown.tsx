import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  label: string;
  additionalText?: string;
  icon: React.ReactNode;
  dropdownContent: React.ReactNode;
  active?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  additionalText,
  icon,
  dropdownContent,
  active = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "px-4 py-2 h-auto rounded-full",
            active && "bg-blue-100"
          )}
        >
          {icon}
          <div className="text-body-2 text-neutral-900">{label}</div>
          <div className="text-body-2 text-neutral-900">{additionalText}</div>
          <ChevronDown className="text-neutral-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
        {dropdownContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
