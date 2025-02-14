import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

// Static progress bar at 50%
export const Default: Story = {
  args: {
    value: 50,
  },
};

// Progress bar at 75%
export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
};

// Interactive progress bar with state
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(30);
    return (
      <div className="w-[300px]">
        <Progress value={value} />
        <div className="mt-2 text-sm text-gray-500">
          Current value: {value}%
        </div>
      </div>
    );
  },
};

// Progress bar at 100%
export const Complete: Story = {
  args: {
    value: 100,
  },
};

// Progress bar at 0%
export const Empty: Story = {
  args: {
    value: 0,
  },
};