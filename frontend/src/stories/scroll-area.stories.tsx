import type { Meta, StoryObj } from "@storybook/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const meta = {
  title: "ui/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border p-4">
      <div className="flex w-[600px] gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-48 shrink-0 rounded-md border p-4"
          >
            <div className="font-semibold">Item {i + 1}</div>
            <p className="text-sm text-muted-foreground">
              This is a scrollable item
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const LongContent: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[350px] rounded-md border p-4">
      <h4 className="mb-4 text-sm font-medium leading-none">Lorem Ipsum</h4>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-4">
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
        </div>
      ))}
    </ScrollArea>
  ),
}

export const NestedScrollAreas: Story = {
  render: () => (
    <ScrollArea className="h-96 w-96 rounded-md border p-4">
      <h4 className="mb-4 text-sm font-medium leading-none">Outer ScrollArea</h4>
      <p className="mb-4 text-sm text-muted-foreground">
        This is the outer scroll area content
      </p>
      <ScrollArea className="h-48 w-full rounded-md border p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Inner ScrollArea</h4>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="mb-4">
            <p className="text-sm text-muted-foreground">
              Inner scrollable content {i + 1}
            </p>
          </div>
        ))}
      </ScrollArea>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="mt-4">
          <p className="text-sm text-muted-foreground">
            Outer scrollable content {i + 1}
          </p>
        </div>
      ))}
    </ScrollArea>
  ),
}