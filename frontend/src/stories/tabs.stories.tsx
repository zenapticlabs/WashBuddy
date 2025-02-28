import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Account settings and preferences.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
      <TabsContent value="settings">
        Other settings and configurations.
      </TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Account settings and preferences.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
      <TabsContent value="settings">
        Other settings and configurations.
      </TabsContent>
    </Tabs>
  ),
};