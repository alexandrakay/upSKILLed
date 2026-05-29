import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NavBar } from "@/components/auth/NavBar";

export const metadata: Metadata = {
  title: {
    default: "upSKILLed — Claude, upSKILLed.",
    template: "%s — upSKILLed",
  },
  description: "Generate Claude skill files for any API or CLI tool — in seconds. Give Claude deep knowledge of GitHub, Stripe, Notion, ffuf, and more.",
  metadataBase: new URL("https://getupskilled.dev"),
  openGraph: {
    title: "upSKILLed — Claude, upSKILLed.",
    description: "Generate Claude skill files for any API or CLI tool — in seconds.",
    url: "https://getupskilled.dev",
    siteName: "upSKILLed",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "upSKILLed — Claude, upSKILLed.",
    description: "Generate Claude skill files for any API or CLI tool — in seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <div className="pt-14">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
