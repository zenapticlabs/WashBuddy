import type { Meta, StoryObj } from "@storybook/react";
import { Rate } from "@/components/ui/rate";

const meta: Meta<typeof Rate> = {
  title: "UI/Rate",
  component: Rate,
  tags: ["autodocs"],
  args: {
    value: 3.5,
    max: 5,
    size: "md",
    fullWidth: false,
    color: "default-yellow",
  },
};

export default meta;
type Story = StoryObj<typeof Rate>;

export const Default: Story = {};

export const SmallSize: Story = {
  args: {
    size: "xs",
    value: 4,
  },
};

export const MediumSize: Story = {
  args: {
    size: "sm",
    value: 3,
  },
};

export const LargeSize: Story = {
  args: {
    size: "md",
    value: 5,
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    value: 4.5,
  },
};

export const CustomColor: Story = {
  args: {
    color: "blue-500",
    value: 3.5,
  },
};

export const CustomMax: Story = {
  args: {
    max: 10,
    value: 7.5,
  },
};