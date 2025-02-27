import type { Meta, StoryObj } from "@storybook/react"
import { OperatingHoursRange } from "@/components/molecule/OperatingHoursRange"

const meta = {
  title: "Molecules/OperatingHoursRange",
  component: OperatingHoursRange,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 border rounded-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OperatingHoursRange>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <OperatingHoursRange />,
}

export const WithPresetHours: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Hours Example</h3>
        <OperatingHoursRange />
        <div className="text-sm text-muted-foreground">
          Try toggling different days and adjusting the time ranges
        </div>
      </div>
    )
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] p-4 border rounded-lg">
        <Story />
      </div>
    ),
  ],
  render: () => <OperatingHoursRange />,
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Operating Hours</h3>
        <p className="text-sm text-muted-foreground">
          Set your business hours for each day of the week. Toggle the switch to mark days as open/closed.
        </p>
      </div>
      <OperatingHoursRange />
    </div>
  ),
}