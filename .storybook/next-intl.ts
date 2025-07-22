import en from "../src/messages/en.json";
import fr from "../src/messages/fr.json";

const messagesByLocale: Record<string, any> = { en, fr };

const nextIntl = {
  defaultLocale: "fr",
  messagesByLocale,
};

export default nextIntl;
