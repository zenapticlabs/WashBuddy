"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CircleBadge } from "@/components/ui/circleBadge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SelectRate } from "@/components/ui/selectRate";
import { Search } from "lucide-react";
import { Rate } from "@/components/ui/rate";
export default function Home() {
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [rateValue, setRateValue] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const handleSwitchChange = () => {
    setSwitchValue(!switchValue);
  };
  const handleCheckboxChange = () => {
    setCheckboxValue(!checkboxValue);
  };

  const handleButtonClick = () => {
    console.log("Button clicked");
  };
  return (
    <div className="w-full h-screen flex flex-col gap-4 items-center justify-center">
      <Switch
        label="Switch"
        checked={switchValue}
        onChange={handleSwitchChange}
      />
      <Checkbox
        label="Checkbox"
        checked={checkboxValue}
        onChange={handleCheckboxChange}
        optional
      />
      <Button variant="default" onClick={handleButtonClick}>
        Button
      </Button>
      <CircleBadge text="1" />
      <div className="flex items-center gap-2 w-64">
        <Progress value={progressValue} onChange={setProgressValue}/>
      </div>
      <Input placeholder="Input"/>
      <Badge variant="green">Free wash! Just upload prices and photos 🎉</Badge>
      <Badge variant="yellow">Special WashBuddy Price. Click to purchase wash ✨</Badge>
      <Rate value={4.3}/>
      <SelectRate value={rateValue} onChange={(value) => setRateValue(value)} title="Price & Value"/>
      <Input icon={<Search className="h-4 w-4 text-default-blue"/>} placeholder="Input" className="rounded-full border-default-blue h-12"/>
    </div>
  );
}
