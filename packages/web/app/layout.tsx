import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NavBar } from "@/components/auth/NavBar";

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
      <body>
        <AuthProvider>
          <NavBar />
          <div className="pt-14">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
