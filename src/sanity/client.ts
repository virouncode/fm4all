import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "cp9xh3nu",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
