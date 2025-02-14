import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react"; // Assuming you're using lucide-react for icons

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text here...",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {},
};

export const WithIcon: Story = {
  args: {
    icon: <Search className="h-4 w-4" />,
    placeholder: "Search...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: "Sample input text",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password...",
  },
};