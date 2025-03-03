import type { Meta, StoryObj } from "@storybook/react"
import { Calendar } from "@/components/ui/calendar"

const meta = {
  title: "ui/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mode: "single",
  },
}

export const RangeSelection: Story = {
  args: {
    mode: "range",
  },
}

export const MultipleSelection: Story = {
  args: {
    mode: "multiple",
  },
}

export const WithSelectedDate: Story = {
  args: {
    mode: "single",
    selected: new Date(),
  },
}

export const WithDisabledDates: Story = {
  args: {
    mode: "single",
    disabled: [
      { from: new Date(2024, 0, 1), to: new Date(2024, 0, 10) },
      new Date(2024, 0, 15),
    ],
  },
} 