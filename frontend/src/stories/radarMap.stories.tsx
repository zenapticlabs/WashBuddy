import type { Meta, StoryObj } from "@storybook/react";
import { RadarMap } from "../components/organism/RadarMap";

const meta = {
  title: "Organism/RadarMap",
  component: RadarMap,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RadarMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    publishableKey: "YOUR_RADAR_PUBLISHABLE_KEY",
  },
  render: (args) => {
    return <RadarMap {...args} />;
  },
};

export const WithUserId: Story = {
  args: {
    publishableKey: "YOUR_RADAR_PUBLISHABLE_KEY",
    userId: "test-user-123",
  },
  render: (args) => {
    return <RadarMap {...args} />;
  },
}; 