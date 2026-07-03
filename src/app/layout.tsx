import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Three voices (docs/design.md): Space Grotesk speaks, Inter explains,
// JetBrains Mono annotates.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "alkatera verifier — independent LCA verification",
    template: "%s",
  },
  description:
    "Independent LCA verification that shows its working. Upload any LCA, choose your standards, and get a transparent, clause-by-clause verdict in minutes.",
  openGraph: {
    type: "website",
    siteName: "alkatera verifier",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-body text-ink">
        {children}
      </body>
    </html>
  );
}
