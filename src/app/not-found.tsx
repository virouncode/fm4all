import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Page introuvable</p>
      <Link href="/">Revenir au site</Link>
    </div>
  );
}
