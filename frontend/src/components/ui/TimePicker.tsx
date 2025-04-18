"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  startTime?: string; // Format: "HH:mm"
  endTime?: string; // Format: "HH:mm"
}

interface TimePickerProps {
  value?: string; // Changed from Date to string
  onChange?: (value: string) => void; // Changed from Date to string
  startTime?: string;
  endTime?: string;
}

export function TimePicker({
  value,
  onChange,
  startTime = "00:00",
  endTime = "23:59",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Convert string time to Date for internal handling
  const getTimeFromString = (timeString?: string) => {
    if (!timeString) return undefined;
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const currentDate = getTimeFromString(value);

  // Convert startTime and endTime strings to numbers for comparison
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const isTimeInRange = (hour: number, minute: number = 0): boolean => {
    const timeValue = hour * 60 + minute;
    const startValue = startHour * 60 + startMinute;
    const endValue = endHour * 60 + endMinute;
    return timeValue >= startValue && timeValue <= endValue;
  };

  // Generate available hours based on the time range
  const hours = Array.from({ length: 24 }, (_, i) => i).filter((hour) => {
    // Include hour if any minute within that hour is valid
    return isTimeInRange(hour, 0) || isTimeInRange(hour, 59);
  });

  const getAvailableMinutes = (selectedHour: number) => {
    return Array.from({ length: 12 }, (_, i) => i * 5).filter((minute) => {
      return isTimeInRange(selectedHour, minute);
    });
  };

  const handleTimeChange = (type: "hour" | "minute", newValue: string) => {
    const newTime = currentDate ? new Date(currentDate) : new Date();
    const newValueNum = parseInt(newValue);

    if (type === "hour") {
      newTime.setHours(newValueNum);
      if (!isTimeInRange(newValueNum, newTime.getMinutes())) {
        newTime.setMinutes(startHour === newValueNum ? startMinute : 0);
      }
    } else if (type === "minute") {
      newTime.setMinutes(newValueNum);
    }

    if (isTimeInRange(newTime.getHours(), newTime.getMinutes())) {
      // Convert Date back to string format before calling onChange
      const timeString = format(newTime, "HH:mm");
      onChange?.(timeString);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal border-neutral-700",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>HH:mm</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex divide-x h-[300px]">
          <ScrollArea className="w-auto">
            <div className="flex flex-col p-2">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  size="icon"
                  variant={
                    currentDate && currentDate.getHours() === hour
                      ? "default"
                      : "ghost"
                  }
                  className="w-full shrink-0 aspect-square"
                  onClick={() => handleTimeChange("hour", hour.toString())}
                >
                  {hour.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="w-auto">
            <div className="flex flex-col p-2">
              {getAvailableMinutes(currentDate?.getHours() ?? startHour).map(
                (minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      currentDate && currentDate.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
