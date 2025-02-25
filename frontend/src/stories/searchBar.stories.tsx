import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from '../components/molecule/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {
    onChange: (value: string) => {
      console.log('Search value:', value);
    },
  },
};

export const WithRecentSearches: Story = {
  args: {
    onChange: (value: string) => {
      console.log('Search value:', value);
    },
  },
  parameters: {
    mockData: {
      localStorage: {
        'recentSearches': JSON.stringify(['Car Wash NYC', 'Best Car Wash', 'Quick Wash', 'Auto Spa'])
      }
    }
  }
};