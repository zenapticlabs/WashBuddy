import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '800px', minWidth: '300px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

// Basic progress bar
export const Default: Story = {
  args: {
    value: 50,
  },
};

// Custom range progress bar
export const CustomRange: Story = {
  args: {
    value: 25,
    minValue: -50,
    maxValue: 50,
  },
};

// Interactive progress bar with state
const InteractiveProgressBar = () => {
  const [value, setValue] = useState(30);
  
  return (
    <div className="w-full max-w-3xl">
      <Progress 
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveProgressBar />,
};

// Disabled progress bar
export const Disabled: Story = {
  args: {
    value: 70,
    className: "opacity-50 cursor-not-allowed",
    style: { pointerEvents: "none" },
  },
};

// Different sizes
export const Small: Story = {
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  args: {
    value: 60,
  },
};

export const Large: Story = {
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
  args: {
    value: 40,
  },
};