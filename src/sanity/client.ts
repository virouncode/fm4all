import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "a6zudv26",
  dataset: "production",
  apiVersion: "2024-03-20",
  useCdn: true,
});
