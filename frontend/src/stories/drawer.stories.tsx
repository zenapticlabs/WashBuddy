import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const meta: Meta<typeof Drawer> = {
  title: "UI/Drawer",
  component: Drawer,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Drawer>

export const Basic: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Basic Drawer</DrawerTitle>
          <DrawerDescription>
            This is a basic drawer example with a title and description.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Drawer content goes here.</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Drawer with Footer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer with Footer</DrawerTitle>
          <DrawerDescription>
            This drawer includes footer buttons.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Some content in the drawer body.</p>
        </div>
        <DrawerFooter>
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const CustomSized: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Custom Sized Drawer</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[50vh]">
        <DrawerHeader>
          <DrawerTitle>Custom Height Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer has a custom height set to 50vh.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Content in a taller drawer.</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}