import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { TimePicker } from "../ui/TimePicker";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayType = (typeof days)[number];

interface DaySchedule {
  day_of_week: number;
  is_closed: boolean;
  opening_time: string;
  closing_time: string;
}

type OperatingHours = DaySchedule[];

interface OperatingHoursRangeProps {
  open_24_hours: boolean;
  operatingHours: OperatingHours;
  setOperatingHours: (operating_hours: OperatingHours) => void;
}

export function OperatingHoursRange({
  open_24_hours,
  operatingHours,
  setOperatingHours,
}: OperatingHoursRangeProps) {
  useEffect(() => {
    // Initialize operating hours if empty
    if (operatingHours.length === 0) {
      const initialOperatingHours: OperatingHours = days.map((_, index) => ({
        day_of_week: index,
        is_closed: true,
        opening_time: "09:00",
        closing_time: "17:00",
      }));
      setOperatingHours(initialOperatingHours);
    }
  }, []);

  const daySchedule = (day: number) => {
    return operatingHours.find((schedule) => schedule.day_of_week === day);
  };
  const handleToggleDay = (day: number, value: boolean) => {
    let tempDaySchedule = daySchedule(day);
    if (tempDaySchedule) {
      setOperatingHours(
        operatingHours.map((schedule) =>
          schedule.day_of_week === day
            ? {
                ...schedule,
                is_closed: !value,
                opening_time: "09:00",
                closing_time: "17:00",
              }
            : schedule
        )
      );
    } else {
      setOperatingHours([
        ...operatingHours,
        {
          day_of_week: day,
          is_closed: !value,
          opening_time: "09:00",
          closing_time: "17:00",
        },
      ]);
    }
  };

  const handleTimeChange = (
    day: number,
    type: "opening_time" | "closing_time",
    time: string
  ) => {
    setOperatingHours(
      operatingHours.map((schedule) =>
        schedule.day_of_week === day ? { ...schedule, [type]: time } : schedule
      )
    );
  };

  return (
    <div className="flex flex-col">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={!open_24_hours ? "item-1" : ""}
      >
        <AccordionItem value="item-1">
          <AccordionContent>
            <div className="flex flex-col gap-3 py-3">
              {days.map((day, index) => (
                <div key={day} className="flex justify-between h-7">
                  <Switch
                    label={day}
                    checked={
                      daySchedule(index) && !daySchedule(index)?.is_closed
                    }
                    onCheckedChange={(value) => handleToggleDay(index, value)}
                  />
                  {daySchedule(index) && !daySchedule(index)?.is_closed && (
                    <div className="flex items-center gap-2">
                      <TimePicker
                        value={daySchedule(index)?.opening_time}
                        onChange={(time) =>
                          handleTimeChange(index, "opening_time", time)
                        }
                        endTime={daySchedule(index)?.closing_time}
                      />
                      -
                      <TimePicker
                        value={daySchedule(index)?.closing_time}
                        onChange={(time) =>
                          handleTimeChange(index, "closing_time", time)
                        }
                        startTime={daySchedule(index)?.opening_time}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
