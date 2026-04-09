import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitchworx PPT Generator",
  description: "Generate stunning presentations with AI — Pitchworx PPT Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Helvetica Neue is a system font on macOS/iOS. On Windows/Linux, it falls
            back to the CSS-defined sans-serif, which we override globally in CSS.
            No external font import needed — font is enforced via CSS rule. */}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
