import type { Meta, StoryObj } from "@storybook/react"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: "Default Label",
  },
}

export const WithPeer: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="input">Input Label</Label>
      <input
        id="input"
        type="text"
        className="peer border rounded p-2"
        placeholder="Input field"
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="disabled-input">Disabled Label</Label>
      <input
        id="disabled-input"
        type="text"
        className="peer border rounded p-2"
        disabled
        placeholder="Disabled input"
      />
    </div>
  ),
}