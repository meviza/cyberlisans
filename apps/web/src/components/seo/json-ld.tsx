import * as React from 'react';

const SITE_URL = 'https://cyberlisans.com';

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CyberLisans',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Dijital lisans platformu: oyun, yazılım, AI API.',
    sameAs: [
      'https://twitter.com/cyberlisans',
      'https://discord.gg/cyberlisans',
      'https://instagram.com/cyberlisans',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: '[email protected]',
      availableLanguage: ['Turkish', 'English', 'German', 'Arabic', 'Russian'],
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export interface ProductJsonLdProps {
  product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    availability: 'InStock' | 'OutOfStock';
    url: string;
    image?: string;
  };
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: product.url,
      seller: { '@type': 'Organization', name: 'CyberLisans' },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export interface FAQJsonLdProps {
  items: { question: string; answer: string }[];
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      item: i.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CyberLisans',
    url: SITE_URL,
    inLanguage: ['tr-TR', 'en-US', 'de-DE', 'ar-SA', 'ru-RU'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}