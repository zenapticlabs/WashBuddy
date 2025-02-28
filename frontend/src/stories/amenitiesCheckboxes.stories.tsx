import type { Meta, StoryObj } from '@storybook/react';
import AmenitiesCheckboxes from '@/components/molecule/AmenitiesCheckboxes';
import { MockAmenities } from '@/mocks';
const meta: Meta<typeof AmenitiesCheckboxes> = {
  title: 'Molecule/AmenitiesCheckboxes',
  component: AmenitiesCheckboxes,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AmenitiesCheckboxes>;

export const Default: Story = {
  args: {
    options: MockAmenities,
  },
};

export const WithPreselectedValues: Story = {
  args: {
    options: MockAmenities,
    value: ['1', '3'],
  },
};

export const WithOnChange: Story = {
  args: {
    options: MockAmenities,
    onChange: (selectedOptions) => {
      console.log('Selected options:', selectedOptions);
    },
  },
};