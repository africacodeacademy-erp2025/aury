import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aury.africacodefoundry.com';
const siteName = 'Aury Marketplace';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

/**
 * Generate metadata for pages
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/og-image.webp',
    url = siteUrl,
    type = 'website',
    noIndex = false,
  } = config;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate JSON-LD structured data for products
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}) {
  const {
    name,
    description,
    price,
    currency = 'ZAR',
    image,
    brand = 'Aury',
    category,
    rating,
    reviewCount,
    inStock = true,
  } = product;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    ...(category && { category }),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/marketplace`,
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        },
      }),
  };
}

/**
 * Generate JSON-LD structured data for articles/blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) {
  const {
    title,
    description,
    author,
    publishedDate,
    modifiedDate,
    image,
    url,
  } = article;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/aury-logo.png`,
      },
    },
    datePublished: publishedDate,
    ...(modifiedDate && { dateModified: modifiedDate }),
    ...(image && { image }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate JSON-LD for breadcrumbs
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD for FAQs
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate keywords for crochet/craft marketplace
 */
export const marketplaceKeywords = [
  'handmade marketplace',
  'crochet patterns',
  'knitting patterns',
  'craft marketplace',
  'handmade crafts',
  'artisan marketplace',
  'DIY patterns',
  'crochet items for sale',
  'handcrafted gifts',
  'custom crochet',
  'buy handmade',
  'sell handmade',
  'crochet community',
  'knitting community',
  'craft patterns online',
];

/**
 * Generate alt text for images (SEO-friendly)
 */
export function generateAltText(
  productName: string,
  category?: string
): string {
  if (category) {
    return `Handmade ${category} - ${productName} | Aury Marketplace`;
  }
  return `${productName} - Handcrafted Item | Aury Marketplace`;
}
