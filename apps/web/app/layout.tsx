import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Komala HR",
  description: "HR & payroll system for PT Komala Indonesia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
