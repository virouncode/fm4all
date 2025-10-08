export const deleteVercelBlob = async ({ url }: { url: string }) => {
  return await fetch(`/api/vercelblob?url=${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
