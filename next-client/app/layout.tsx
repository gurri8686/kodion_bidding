import type { Metadata } from "next";
import "./globals.css";
import RootApp from "../components/RootApp";

export const metadata: Metadata = {
  title: "Kodion Bidding Tracker",
  description: "Bidding tracking and management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RootApp>
          {children}
        </RootApp>
      </body>
    </html>
  );
}
