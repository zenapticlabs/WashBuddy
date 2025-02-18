import type { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "@/components/ui/checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
}

export const WithDescription: Story = {
  args: {
    label: "Send me marketing emails",
    description: "We'll send you occasional updates about our products and services",
  },
}

export const LeftLabel: Story = {
  args: {
    label: "Label on the left",
    position: "left",
  },
}

export const RightLabel: Story = {
  args: {
    label: "Label on the right",
    position: "right",
  },
}

export const Checked: Story = {
  args: {
    label: "Pre-checked checkbox",
    checked: true,
  },
}

export const WithoutLabel: Story = {
  args: {
    "aria-label": "Checkbox without label",
  },
}

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    disabled: true,
  },
}