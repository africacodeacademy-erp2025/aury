import MarketplaceGrid from '@/components/marketplace/MarketplaceGrid';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace - Shop Handmade Crochet, Knitting & Craft Items',
  description:
    'Browse thousands of unique handmade crochet items, knitting patterns, and craft products from talented artisans. Find the perfect handcrafted gift or DIY pattern on Aury Marketplace.',
  keywords: [
    'handmade marketplace',
    'crochet items for sale',
    'knitting patterns',
    'buy handmade crafts',
    'artisan products',
    'crochet marketplace',
    'handcrafted gifts',
    'DIY craft patterns',
    'custom crochet',
    'handmade gifts online',
  ],
  openGraph: {
    title: 'Shop Handmade Marketplace - Crochet, Knitting & Crafts | Aury',
    description:
      'Discover unique handmade items from talented artisans. Shop crochet, knitting, and craft products on Aury Marketplace.',
    type: 'website',
  },
};

const page = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Aury Marketplace',
    description:
      'Shop handmade crochet, knitting, and craft items from talented artisans',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aury.africacodefoundry.com'}/marketplace`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_SITE_URL || 'https://aury.africacodefoundry.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Marketplace',
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aury.africacodefoundry.com/'}/marketplace`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketplaceGrid />
    </>
  );
};

export default page;