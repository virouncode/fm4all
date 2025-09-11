import ContextWrapper from "@/context/ContextWrapper";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ContextWrapper>{children}</ContextWrapper>;
}
