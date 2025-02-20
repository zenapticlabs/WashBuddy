import type { Meta, StoryObj } from "@storybook/react"
import { Separator } from "@/components/ui/separator"

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
    decorative: true,
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="space-y-4">
      <div>Content above</div>
      <Separator {...args} />
      <div>Content below</div>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-32 items-center space-x-4">
      <div>Left content</div>
      <Separator {...args} />
      <div>Right content</div>
    </div>
  ),
}