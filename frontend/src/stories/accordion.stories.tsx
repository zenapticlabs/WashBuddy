import type { Meta, StoryObj } from "@storybook/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches your theme.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It is animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I open multiple items?</AccordionTrigger>
        <AccordionContent>
          Yes. Just set the type prop to multiple on the Accordion component.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Is this example showing multiple items?</AccordionTrigger>
        <AccordionContent>
          Yes. Try clicking both items - they can be open at the same time.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}