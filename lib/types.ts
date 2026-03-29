export type CurrencyCode = 'BDT' | string;

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  description?: string;
  image?: string | null;
  imageSources?: string[];
};

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  type: 'simple' | 'variable';
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
  currency: CurrencyCode;
  image: string | null;
  categories: ProductCategory[];
  shortDescription: string;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  unitLabel?: string | null;
};

export type ProductVariant = {
  id: number;
  label: string;
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  attributes: Array<{
    name: string;
    option: string;
  }>;
};

export type ProductDetail = ProductCard & {
  description: string;
  gallery: string[];
  stockQuantity?: number | null;
  variations: ProductVariant[];
};

export type HomeSection = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  categorySlug?: string;
  products: ProductCard[];
};

export type HomeFeed = {
  featuredCategories: CategoryItem[];
  sections: HomeSection[];
};

export type HeroBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  categorySlug?: string;
  artKey: string;
};

export type PromoCard = {
  id: string;
  title: string;
  subtitle: string;
  categorySlug?: string;
  accentLabel: string;
  artKey: string;
};

export type ProductsResponse = {
  items: ProductCard[];
  total: number;
  page: number;
  hasMore: boolean;
};

export type GuestCheckoutForm = {
  fullName: string;
  phone: string;
  address: string;
};

export type CartItem = {
  key: string;
  productId: number;
  variationId?: number;
  slug: string;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  regularPrice?: number | null;
  currency: CurrencyCode;
  stockStatus: ProductCard['stockStatus'];
  categorySlugs: string[];
  unitLabel?: string | null;
  variationLabel?: string | null;
};

export type PlacedOrder = {
  orderId: number;
  orderNumber: string;
  status: string;
  total: number;
  currency: CurrencyCode;
  paymentMethod: 'cod';
  deliveryLabel: string;
};

export type AppConfig = {
  storeName: string;
  currency: CurrencyCode;
  accentColor: string;
  defaultCountry: string;
  delivery: {
    id: string;
    label: string;
  };
};

export type ProductQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  categorySlug?: string;
  featured?: boolean;
  ids?: number[];
};
