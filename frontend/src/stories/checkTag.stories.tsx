import type { Meta, StoryObj } from "@storybook/react";
import { CheckTag } from "@/components/ui/checkTag";

const meta: Meta<typeof CheckTag> = {
  title: "UI/CheckTag",
  component: CheckTag,
  tags: ["autodocs"],
  args: {
    label: "Tag Label",
  },
};

export default meta;
type Story = StoryObj<typeof CheckTag>;

export const Default: Story = {
  args: {
    label: "Default Tag",
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: "Checked Tag",
    checked: true,
  },
};

export const LongLabel: Story = {
  args: {
    label: "This is a very long tag label to show text wrapping",
    checked: false,
  },
};