import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context/Providers";

export const metadata: Metadata = {
  title: "Bidding Tracking System",
  description: "Job bidding and tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
