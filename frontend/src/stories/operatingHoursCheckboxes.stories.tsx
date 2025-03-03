import type { Meta, StoryObj } from "@storybook/react";
import OperatingHoursCheckboxes from "../components/molecule/OperatingHoursCheckboxes";

const meta: Meta<typeof OperatingHoursCheckboxes> = {
  title: "Molecule/OperatingHoursCheckboxes",
  component: OperatingHoursCheckboxes,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OperatingHoursCheckboxes>;

export const Default: Story = {
  args: {},
};

export const WithPreselectedValue: Story = {
  args: {
    value: ["1"],
    onChange: (options) => console.log("Selected options:", options),
  },
};