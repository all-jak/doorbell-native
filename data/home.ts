import type { HeroBanner, PromoCard } from '@/lib/types';

export const homeBanners: HeroBanner[] = [
  {
    id: 'discovery',
    eyebrow: 'DoorBell guest checkout',
    title: 'Daily essentials, fresh picks, and pantry refills in one quick basket.',
    subtitle: 'Browse live products from DoorBell Shop, fill your cart, and place a COD order with just name, phone, and address.',
    ctaLabel: 'Shop grocery',
    categorySlug: 'grocery',
    artKey: 'doorbell-discovery',
  },
];

export const promoCards: PromoCard[] = [
  {
    id: 'family-care',
    title: 'Baby and home care, ready to reorder',
    subtitle: 'Soft daily-use products, wipes, body care, and household basics.',
    categorySlug: 'baby-item',
    accentLabel: 'Family refill',
    artKey: 'family-refill',
  },
  {
    id: 'kitchen-reset',
    title: 'Kitchen restock for the week',
    subtitle: 'Rice, oil, spices, and everyday staples with DoorBell red accents.',
    categorySlug: 'grocery',
    accentLabel: 'Pantry reset',
    artKey: 'kitchen-reset',
  },
];

export const topPickCategorySlugs = [
  'grocery',
  'fruits-vegetables-2',
  'dairy-eggs',
  'fish',
  'baby-item',
  'home-and-cleaning',
  'food',
  'rice',
  'oil',
  'chips',
];
