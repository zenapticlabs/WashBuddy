import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const WithDescription: Story = {
  args: {
    label: "Enable notifications",
    description: "You will receive notifications for important updates",
  },
};

export const LeftPosition: Story = {
  args: {
    label: "Left positioned checkbox",
    position: "left",
  },
};

export const Checked: Story = {
  args: {
    label: "Pre-checked checkbox",
    checked: true,
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
