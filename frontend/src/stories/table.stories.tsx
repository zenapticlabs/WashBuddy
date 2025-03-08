import type { Meta, StoryObj } from "@storybook/react";
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "@/components/ui/table";

const meta: Meta<typeof Table> = {
    title: "Components/Table",
    component: Table,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Basic: Story = {
    render: () => (
        <Table>
            <TableCaption>A basic table example</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>john@example.com</TableCell>
                    <TableCell>Admin</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>jane@example.com</TableCell>
                    <TableCell>User</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),
};

export const WithFooter: Story = {
    render: () => (
        <Table>
            <TableCaption>Table with footer</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Product A</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>$20.00</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Product B</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>$15.00</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell>$35.00</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
};