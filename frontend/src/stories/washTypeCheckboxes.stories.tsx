import type { Meta, StoryObj } from "@storybook/react";
import WashTypeCheckboxes from "@/components/molecule/WashTypeCheckboxes";
import { MockWashTypes } from "@/mocks";

const meta: Meta<typeof WashTypeCheckboxes> = {
  title: "Molecule/WashTypeCheckboxes",
  component: WashTypeCheckboxes,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WashTypeCheckboxes>;

export const Default: Story = {
  args: {
    options: MockWashTypes,
  },
};

export const WithPreselectedValues: Story = {
  args: {
    options: MockWashTypes,
    value: ["6", "9"],
  },
};