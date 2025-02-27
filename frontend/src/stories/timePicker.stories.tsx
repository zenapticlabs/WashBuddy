import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker } from "@/components/molecule/TimePicker";
import React from "react";

const meta: Meta<typeof TimePicker> = {
  title: "Molecule/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    value: new Date("2024-01-01T13:30:00"),
    onChange: (date: Date) => {
      console.log("Time changed:", date);
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date>(
      new Date("2024-01-01T09:00:00")
    );

    return (
      <TimePicker value={value} onChange={(newValue) => setValue(newValue)} />
    );
  },
};
