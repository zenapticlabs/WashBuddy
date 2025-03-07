import type { Meta, StoryObj } from "@storybook/react";
import { CustomPagination } from "@/components/molecule/CustomPagination";
import { useState } from "react";

const meta: Meta<typeof CustomPagination> = {
  title: "Components/CustomPagination",
  component: CustomPagination,
  tags: ["autodocs"],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CustomPagination>;

// Interactive story with state management
const PaginationWithHooks = () => {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <CustomPagination
      currentPage={currentPage}
      totalItems={100}
      pageSize={10}
      onPageChange={setCurrentPage}
    />
  );
};

export const Default: Story = {
  render: () => <PaginationWithHooks />
};

export const FewPages: Story = {
  args: {
    currentPage: 1,
    totalItems: 30,
    pageSize: 10,
    onPageChange: () => {},
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 5,
    totalItems: 200,
    pageSize: 10,
    onPageChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalItems: 100,
    pageSize: 10,
    onPageChange: () => {},
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalItems: 100,
    pageSize: 10,
    onPageChange: () => {},
  },
};

export const CustomPageSize: Story = {
  args: {
    currentPage: 1,
    totalItems: 100,
    pageSize: 20,
    onPageChange: () => {},
  },
};