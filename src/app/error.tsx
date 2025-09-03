"use client";

import Error from "next/error";

export default function ErrorPage() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  );
}
