import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aury.africacodefoundry.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Aury - Handmade Marketplace for Crochet, Knitting & Craft Patterns",
    template: "%s | Aury Marketplace",
  },
  description:
    "Discover unique handmade crochet, knitting, and craft items on Aury. Shop from talented artisans, find exclusive patterns, or start selling your handcrafted creations. Join our creative community today!",
  keywords: [
    "Aury",
    "Aury marketplace",
    "handmade marketplace",
    "crochet patterns",
    "knitting patterns",
    "crochet marketplace",
    "handmade crafts",
    "craft patterns",
    "artisan marketplace",
    "handcrafted items",
    "crochet community",
    "sell handmade",
    "buy handmade",
    "craft sellers",
    "DIY patterns",
    "crochet tutorials",
    "knitting community",
    "handmade gifts",
    "custom crochet",
    "pattern marketplace",
  ],
  authors: [{ name: "Aury" }],
  creator: "Aury",
  publisher: "Aury",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Aury Marketplace",
    title: "Aury - Handmade Marketplace for Crochet & Craft Patterns",
    description:
      "Shop unique handmade crochet, knitting, and craft items. Connect with artisans, buy exclusive patterns, or sell your creations on Aury.",
    images: [
      {
        url: `${siteUrl}/aury-logo.png`,
        width: 1200,
        height: 630,
        alt: "Aury - Handmade Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aury - Handmade Marketplace for Crochet & Craft Patterns",
    description:
      "Discover unique handmade items, exclusive patterns, and connect with artisans on Aury marketplace.",
    images: [`${siteUrl}/aury-logo.png`],
    creator: "@AuryMarketplace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "QJ5wp8LK9BL2mUparaW8cpIrPtm_f_8oYnHqWOHVtpo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aury",
    alternateName: "Aury Marketplace",
    url: siteUrl,
    description:
      "Handmade marketplace for crochet, knitting, and craft patterns. Shop unique handcrafted items or sell your creations.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/marketplace?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Aury",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/aury-logo.png`,
      },
      // sameAs: [
      //   "https://twitter.com/AuryMarketplace",
      //   "https://facebook.com/AuryMarketplace",
      //   "https://instagram.com/AuryMarketplace",
      // ],
    },
  };

  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>{children}</PostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}
