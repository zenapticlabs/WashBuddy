import { useState } from "react";
import { Switch } from "../ui/switch";
import { TimePicker } from "./TimePicker";
import { Plus } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayType = typeof days[number];

interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
}

interface OperatingHours {
  [key: string]: DaySchedule;
}

export function OperatingHoursRange() {
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(() => {
    // Initialize with default values for each day
    return days.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: false,
        start: "09:00",
        end: "17:00",
      },
    }), {});
  });

  const handleToggleDay = (day: DayType, value: boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: value,
      },
    }));
  };

  const handleTimeChange = (day: DayType, type: 'start' | 'end', time: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: time,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day} className="flex justify-between">
          <Switch
            label={day}
            checked={operatingHours[day].isOpen}
            onCheckedChange={(value) => handleToggleDay(day, value)}
          />
          {operatingHours[day].isOpen && (
            <div className="flex items-center gap-2">
              <TimePicker
                value={operatingHours[day].start}
                onChange={(time) => handleTimeChange(day, 'start', time)}
                endTime={operatingHours[day].end}
              />
              -
              <TimePicker
                value={operatingHours[day].end}
                onChange={(time) => handleTimeChange(day, 'end', time)}
                startTime={operatingHours[day].start}
              />
              <div className="flex items-center justify-center rounded h-5 w-5 border border-neutral-700 p-0.5">
                <Plus />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
