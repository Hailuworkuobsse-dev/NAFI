import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Plus } from 'lucide-react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon', 'icon-sm'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Primary action', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } };
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } };
export const Danger: Story = { args: { children: 'Delete', variant: 'danger' } };
export const WithLeadingIcon: Story = {
  args: { children: 'Send', leadingIcon: <Mail className="h-4 w-4" /> },
};
export const WithTrailingIcon: Story = {
  args: { children: 'Add new', trailingIcon: <Plus className="h-4 w-4" /> },
};
export const Loading: Story = { args: { children: 'Saving…', loading: true } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };
export const FullWidth: Story = { args: { children: 'Full width', fullWidth: true } };
