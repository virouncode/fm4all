import BackButton from "@/components/buttons/back-button";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComponentProps } from "react";
import { fn } from "storybook/test";

type StoryProps = ComponentProps<typeof BackButton>;

const meta: Meta<StoryProps> = {
  component: BackButton,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true, // 👈 Set this
    },
    docs: {
      description: {
        component:
          "Ce bouton appelle `router.back()` automatiquement lors du clic. Le `onClick` est défini en interne.",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The title of the button",
      defaultValue: "Retour",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Size of the button",
      defaultValue: "lg",
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Variant of the button",
      defaultValue: "default",
    },
  },
  args: { onClick: fn() },
};
export default meta;

//Créer le type Story
type Story = StoryObj<StoryProps>;

export const Default: Story = {
  args: {
    title: "Retour",
    variant: "default",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};

export const Destructive: Story = {
  args: {
    title: "Retour",
    variant: "destructive",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};

export const Outline: Story = {
  args: {
    title: "Retour",
    variant: "outline",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};

export const Secondary: Story = {
  args: {
    title: "Retour",
    variant: "secondary",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};

export const Ghost: Story = {
  args: {
    title: "Retour",
    variant: "ghost",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};

export const Link: Story = {
  args: {
    title: "Retour",
    variant: "link",
    size: "lg",
  },
  render: (args) => <BackButton {...args} />,
};
