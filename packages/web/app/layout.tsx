import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "upSKILLed — Claude, upSKILLed.",
  description: "Generate Claude skill files for any API or CLI tool — in seconds.",
  openGraph: {
    title: "upSKILLed",
    description: "Generate Claude skill files for any API or CLI tool — in seconds.",
    url: "https://getupskilled.dev",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
