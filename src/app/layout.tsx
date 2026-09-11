import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "alkatera LCA Verifier — independent LCA verification",
    template: "%s",
  },
  description:
    "Independent LCA verification that shows its working. Upload any LCA, choose your standards, and get a transparent, clause-by-clause verdict in minutes.",
  openGraph: {
    type: "website",
    siteName: "alkatera LCA Verifier",
    title: "Independent LCA verification that shows its working",
    description:
      "Upload any LCA, choose your standards, and get a clause-by-clause verdict in minutes. We will even fail our own reports.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-body text-ink">
        {children}
      </body>
    </html>
  );
}
