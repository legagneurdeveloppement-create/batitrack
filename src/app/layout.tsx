import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BâtiTrack — Gestion de chantier",
  description:
    "Application professionnelle de gestion de parc matériel et de chantiers. Accès par code pour Administrateur, Magasinier et Chef de chantier.",
  authors: [{ name: "LEGAGNEUR DÉVELOPPEMENT" }],
  keywords: ["chantier", "matériel", "BTP", "gestion", "stock", "BâtiTrack"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "BâtiTrack — Gestion de chantier",
    description: "Gestion de parc matériel & chantiers avec accès par code.",
    type: "website",
    locale: "fr_FR",
    siteName: "BâtiTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen batitrack-bg">
        {children}
      </body>
    </html>
  );
}
