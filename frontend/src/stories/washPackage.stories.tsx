import type { Meta, StoryObj } from '@storybook/react';
import WashPackage from '../components/molecule/WashPackage';

const meta: Meta<typeof WashPackage> = {
  title: 'Molecule/WashPackage',
  component: WashPackage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WashPackage>;

export const Default: Story = {
  args: {
    data: {
      id: '1',
      name: 'Basic Wash',
      price: 29.99,
      description: 'Exterior wash with hand dry',
      created_at: new Date(),
      updated_at: new Date(),
    },
  },
};

export const WithDiscount: Story = {
  args: {
    data: {
      id: '2',
      name: 'Premium Wash',
      price: 49.99,
      discount: 10,
      description: 'Complete exterior and interior cleaning with wax',
      created_at: new Date(),
      updated_at: new Date(),
    },
  },
};