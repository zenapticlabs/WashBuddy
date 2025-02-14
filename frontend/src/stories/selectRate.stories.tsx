import type { Meta, StoryObj } from "@storybook/react";
import { SelectRate } from "@/components/ui/selectRate";

const meta: Meta<typeof SelectRate> = {
  title: "UI/SelectRate",
  component: SelectRate,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectRate>;

export const Default: Story = {
  args: {
    title: "Rate your experience",
    value: 0,
    max: 5,
  },
};

export const WithInitialValue: Story = {
  args: {
    title: "Rate your experience",
    value: 3,
    max: 5,
  },
};

export const ReadOnly: Story = {
  args: {
    title: "Rating",
    value: 4,
    max: 5,
    readonly: true,
  },
};

export const CustomMax: Story = {
  args: {
    title: "Rate out of 10",
    value: 7,
    max: 10,
  },
};