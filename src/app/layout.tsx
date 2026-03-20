import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Responsible Wealth",
  description: "A public research platform for responsible, medium-term investing."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="page">
          <div className="shell">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
