import { getApiBaseUrl } from '@/lib/env';
import type {
  AppConfig,
  CartItem,
  CategoryItem,
  GuestCheckoutForm,
  HomeFeed,
  PlacedOrder,
  ProductDetail,
  ProductQuery,
  ProductsResponse,
} from '@/lib/types';

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const buildQueryString = (query: ProductQuery = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      searchParams.set(key, value.join(','));
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Something went wrong while talking to DoorBell.';

    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.error ?? payload.message ?? message;
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  getConfig: () => request<AppConfig>('/config'),
  getHome: () => request<HomeFeed>('/home'),
  getCategories: () => request<CategoryItem[]>('/catalog/categories'),
  getProducts: (query?: ProductQuery) =>
    request<ProductsResponse>(`/catalog/products${buildQueryString(query)}`),
  getProduct: (slug: string) => request<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`),
  placeOrder: (payload: { customer: GuestCheckoutForm; items: CartItem[] }) =>
    request<PlacedOrder>('/checkout/place-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
