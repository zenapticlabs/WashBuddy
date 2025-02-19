import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react"; // Assuming you're using lucide-react for icons

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
  args: {
    placeholder: "Default input",
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: "Email",
    icon: (
      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    ),
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithType: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};
