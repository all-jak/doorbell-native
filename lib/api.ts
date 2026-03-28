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
const API_REQUEST_TIMEOUT_MS = 15000;

const parseJsonSafely = (value: string) => {
  try {
    return JSON.parse(value) as { error?: string; message?: string };
  } catch {
    return null;
  }
};

const truncateForLog = (value: string, maxLength = 320) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: error,
  };
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
  const url = `${getApiBaseUrl()}${path}`;
  const method = init?.method ?? 'GET';
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), API_REQUEST_TIMEOUT_MS);

  console.log('[DoorBell API] Request started', {
    method,
    url,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      signal: timeoutController.signal,
      headers: {
        ...jsonHeaders,
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[DoorBell API] Network request failed', {
      method,
      url,
      error: serializeError(error),
    });

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'DoorBell API request timed out. Check that the proxy is running and reachable from your phone.'
      );
    }

    throw error instanceof Error ? error : new Error('Network request failed.');
  }

  clearTimeout(timeoutId);
  const rawBody = await response.text();

  if (!response.ok) {
    const payload = parseJsonSafely(rawBody);
    const message =
      payload?.error ?? payload?.message ?? 'Something went wrong while talking to DoorBell.';

    console.error('[DoorBell API] Request returned an error response', {
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      body: truncateForLog(rawBody),
    });

    throw new Error(message);
  }

  console.log('[DoorBell API] Request succeeded', {
    method,
    url,
    status: response.status,
  });

  return JSON.parse(rawBody) as T;
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
