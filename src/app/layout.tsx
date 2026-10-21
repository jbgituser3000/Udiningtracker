import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "U Macros",
  description: "Track your macros from University of Utah dining halls.",
  appleWebApp: { capable: true, title: "U Macros", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#be0000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="mx-auto max-w-md px-4 pt-6 pb-28">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
