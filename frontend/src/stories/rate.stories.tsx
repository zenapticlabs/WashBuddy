import type { Meta, StoryObj } from "@storybook/react";
import { Rate } from "@/components/ui/rate";

const meta: Meta<typeof Rate> = {
  title: "UI/Rate",
  component: Rate,
  tags: ["autodocs"],
  args: {
    value: 0,
    max: 5,
  },
};

export default meta;
type Story = StoryObj<typeof Rate>;

export const Default: Story = {
  args: {
    value: 0,
  },
};

export const HalfRating: Story = {
  args: {
    value: 2.5,
  },
};

export const FullRating: Story = {
  args: {
    value: 5,
  },
};

export const CustomMax: Story = {
  args: {
    value: 3,
    max: 10,
  },
};