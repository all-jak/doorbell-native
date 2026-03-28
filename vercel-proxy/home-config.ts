export const appConfig = {
  storeName: 'DoorBell Shop',
  currency: 'BDT',
  accentColor: '#DB2728',
  defaultCountry: 'BD',
  delivery: {
    id: 'standard',
    label: 'Standard delivery',
  },
};

export const featuredCategorySlugs = [
  'grocery',
  'fruits-vegetables-2',
  'dairy-eggs',
  'fish',
  'baby-item',
  'home-and-cleaning',
];

export const homeSections = [
  {
    id: 'fresh-today',
    title: 'Fresh today',
    subtitle: 'Produce, fish, and daily essentials pulled live from WooCommerce.',
    categorySlug: 'fruits-vegetables-2',
    perPage: 8,
  },
  {
    id: 'pantry-refill',
    title: 'Pantry refill',
    subtitle: 'Rice, oil, lentils, snacks, and pantry staples for the week.',
    categorySlug: 'grocery',
    perPage: 8,
  },
  {
    id: 'family-care',
    title: 'Family care',
    subtitle: 'Baby care, body care, and everyday household shopping.',
    categorySlug: 'baby-item',
    perPage: 8,
  },
  {
    id: 'home-reset',
    title: 'Home reset',
    subtitle: 'Cleaning and household products with guest checkout simplicity.',
    categorySlug: 'home-and-cleaning',
    perPage: 8,
  },
];
