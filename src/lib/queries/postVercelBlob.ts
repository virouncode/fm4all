export const postVercelBlob = async ({
  file,
  filename,
  foldername,
}: {
  file: File;
  filename: string;
  foldername: string;
}) => {
  const response = await fetch(
    `/api/vercelblob?filename=${filename}&foldername=${foldername}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: file,
    }
  );
  return (await response.json()).url as string;
};
