import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    position: {
      control: { type: "radio" },
      options: ["left", "right"],
    },
    checked: { control: "boolean" },
    optional: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "Remember me",
  },
};

export const Checked: Story = {
  args: {
    label: "Remember me",
    checked: true,
  },
};

export const LabelLeft: Story = {
  args: {
    label: "Remember me",
    position: "left",
  },
};

export const Optional: Story = {
  args: {
    label: "Subscribe to newsletter",
    optional: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    disabled: true,
  },
};

export const NoLabel: Story = {
  args: {},
};