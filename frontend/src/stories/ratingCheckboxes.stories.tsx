import type { Meta, StoryObj } from "@storybook/react";
import RatingCheckboxes from "../components/molecule/RatingCheckboxes";
import { useState } from "react";

const meta: Meta<typeof RatingCheckboxes> = {
  title: "Molecule/RatingCheckboxes",
  component: RatingCheckboxes,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RatingCheckboxes>;

// Uncontrolled version
export const Default: Story = {
  args: {},
};

// Controlled version with state management
export const Controlled: Story = {
  render: () => {
    const ControlledComponent = () => {
      const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

      return (
        <RatingCheckboxes
          value={selectedRatings}
          onChange={setSelectedRatings}
        />
      );
    };

    return <ControlledComponent />;
  },
};

// Pre-selected ratings
export const PreSelected: Story = {
  args: {
    value: [1, 3, 5],
  },
};
