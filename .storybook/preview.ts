import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/[locale]/globals.css"; // Import global styles
import nextIntl from "./next-intl";

import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  initialGlobals: {
    locale: "fr",
    locales: {
      en: "English",
      fr: "Français",
    },
  },

  parameters: {
    // controls: {
    //   matchers: {
    //     color: /(background|color)$/i,
    //     date: /Date$/i,
    //   },
    // },
    // a11y: {
    //   // 'todo' - show a11y violations in the test UI only
    //   // 'error' - fail CI on a11y violations
    //   // 'off' - skip a11y checks entirely
    //   test: "todo",
    // },
    nextIntl,
  },

  decorators: [withThemeByClassName({
      themes: {
          // nameOfTheme: 'classNameForTheme',
          light: '',
          dark: 'dark',
      },
      defaultTheme: 'light',
  })]
};

export default preview;
