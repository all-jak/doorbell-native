import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { appConfig, featuredCategorySlugs, homeSections } from './home-config';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.set('trust proxy', true);
const wooBaseUrl = process.env.DOORBELL_WOO_BASE_URL?.replace(/\/$/, '');
const wooConsumerKey = process.env.DOORBELL_WOO_CONSUMER_KEY;
const wooConsumerSecret = process.env.DOORBELL_WOO_CONSUMER_SECRET;

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  description?: string;
  image?: { src?: string | null } | false | null;
};

type WooProduct = {
  id: number;
  slug: string;
  name: string;
  type: 'simple' | 'variable';
  price: string;
  regular_price: string;
  sale_price: string;
  short_description: string;
  description: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity?: number | null;
  images?: Array<{ src?: string | null }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  weight?: string;
};

type WooVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  attributes: Array<{
    name: string;
    option: string;
  }>;
};

type CachedCategories = {
  expiresAt: number;
  items: WooCategory[];
};

type WooHttpResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

const CURRENCY = 'BDT';
const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;
const WOO_REQUEST_TIMEOUT_MS = 15000;
const REMOTE_ASSET_TIMEOUT_MS = 20000;
let categoriesCache: CachedCategories | null = null;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((request, _response, next) => {
  console.log('[DoorBell Vercel proxy] Incoming request', {
    method: request.method,
    path: request.path,
    query: request.query,
  });
  next();
});

const toNumber = (value?: string | null) => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const parseJsonSafely = (value: string) => {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause:
        error.cause && typeof error.cause === 'object'
          ? {
              name: 'name' in error.cause ? String(error.cause.name) : undefined,
              code: 'code' in error.cause ? String(error.cause.code) : undefined,
              message: 'message' in error.cause ? String(error.cause.message) : undefined,
            }
          : undefined,
    };
  }

  return {
    value: error,
  };
};

const truncateForLog = (value: string, maxLength = 320) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;

const getPublicBaseUrl = (request: express.Request) =>
  `${request.protocol}://${request.get('host')}`;

const canonicalizeHostname = (value: string) => value.trim().toLowerCase().replace(/^www\./, '');

const normalizeWooAssetUrl = (value?: string | null) => {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value, getWooConfig().wooBaseUrl).toString();
  } catch {
    return null;
  }
};

const isAllowedWooAssetUrl = (url: URL) => {
  const storeHostname = canonicalizeHostname(new URL(getWooConfig().wooBaseUrl).hostname);
  const assetHostname = canonicalizeHostname(url.hostname);

  return (
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    (assetHostname === storeHostname || assetHostname.endsWith(`.${storeHostname}`))
  );
};

const toPublicAssetUrl = (value: string | null | undefined, publicBaseUrl?: string) => {
  const remoteUrl = normalizeWooAssetUrl(value);

  if (!remoteUrl) {
    return null;
  }

  return publicBaseUrl
    ? `${publicBaseUrl}/media?url=${encodeURIComponent(remoteUrl)}`
    : remoteUrl;
};

const isPresent = (value: string | null): value is string => Boolean(value);

const getWooConfig = () => {
  if (!wooBaseUrl || !wooConsumerKey || !wooConsumerSecret) {
    throw new Error(
      'Missing WooCommerce credentials. Configure DOORBELL_WOO_BASE_URL, DOORBELL_WOO_CONSUMER_KEY, and DOORBELL_WOO_CONSUMER_SECRET.'
    );
  }

  return {
    wooBaseUrl,
    wooConsumerKey,
    wooConsumerSecret,
  };
};

const redactWooUrl = (value: string) => {
  try {
    const url = new URL(value);

    ['consumer_key', 'consumer_secret'].forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, '***redacted***');
      }
    });

    return url.toString();
  } catch {
    return value;
  }
};

const buildWooUrl = (
  resourcePath: string,
  params: Record<string, string | number | boolean | undefined> = {}
) => {
  const config = getWooConfig();
  const url = new URL(`/wp-json/wc/v3${resourcePath}`, config.wooBaseUrl);

  url.searchParams.set('consumer_key', config.wooConsumerKey);
  url.searchParams.set('consumer_secret', config.wooConsumerSecret);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const buildWpJsonUrl = () => new URL('/wp-json/', getWooConfig().wooBaseUrl).toString();

async function fetchRemoteAsset(url: string, acceptHeader?: string | null) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REMOTE_ASSET_TIMEOUT_MS);
  const storeOrigin = new URL(getWooConfig().wooBaseUrl).origin;

  try {
    return await fetch(url, {
      signal: timeoutController.signal,
      headers: {
        Accept: acceptHeader?.trim() || 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Origin: storeOrigin,
        Referer: storeOrigin,
        'User-Agent': 'DoorBellProxy/1.0',
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestViaFetch(url: string, init?: RequestInit): Promise<WooHttpResponse> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), WOO_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: timeoutController.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function wooRequest(
  resourcePath: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init?: RequestInit
) {
  const url = buildWooUrl(resourcePath, params);
  const method = init?.method ?? 'GET';
  const safeUrl = redactWooUrl(url);

  console.log('[DoorBell Vercel proxy] Woo request started', {
    method,
    resourcePath,
    url: safeUrl,
  });

  try {
    const response = await requestViaFetch(url, init);

    console.log('[DoorBell Vercel proxy] Woo request completed', {
      method,
      resourcePath,
      url: safeUrl,
      status: response.status,
    });

    return response;
  } catch (error) {
    console.error('[DoorBell Vercel proxy] Woo transport failed', {
      method,
      resourcePath,
      url: safeUrl,
      error: serializeError(error),
    });

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('WooCommerce request timed out.');
    }

    throw error;
  }
}

async function wooJson<T>(
  resourcePath: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init?: RequestInit
) {
  const response = await wooRequest(resourcePath, params, init);

  if (response.status < 200 || response.status >= 300) {
    const payload = parseJsonSafely(response.body || '{}') as
      | {
          message?: string;
          code?: string;
        }
      | null;

    console.error('[DoorBell Vercel proxy] Woo JSON request returned an error response', {
      resourcePath,
      status: response.status,
      body: truncateForLog(response.body),
    });

    throw new Error(payload?.message || `WooCommerce request failed with ${response.status}.`);
  }

  return JSON.parse(response.body) as T;
}

const normalizeCategory = (category: WooCategory, publicBaseUrl?: string) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  count: category.count,
  parent: category.parent,
  description: category.description,
  image: toPublicAssetUrl(
    category.image && typeof category.image === 'object' ? (category.image.src ?? null) : null,
    publicBaseUrl
  ),
});

const normalizeProductCard = (product: WooProduct, publicBaseUrl?: string) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  type: product.type || 'simple',
  price:
    toNumber(product.price) ??
    toNumber(product.sale_price) ??
    toNumber(product.regular_price) ??
    0,
  regularPrice: toNumber(product.regular_price),
  salePrice: toNumber(product.sale_price),
  currency: CURRENCY,
  image: toPublicAssetUrl(product.images?.[0]?.src ?? null, publicBaseUrl),
  categories: product.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  })),
  shortDescription: product.short_description ?? '',
  stockStatus: product.stock_status ?? 'instock',
  unitLabel: product.weight ? `${product.weight} kg` : null,
});

const normalizeVariation = (variation: WooVariation) => ({
  id: variation.id,
  label:
    variation.attributes.map((attribute) => attribute.option).filter(Boolean).join(' · ') ||
    `Variation ${variation.id}`,
  price:
    toNumber(variation.price) ??
    toNumber(variation.sale_price) ??
    toNumber(variation.regular_price) ??
    0,
  regularPrice: toNumber(variation.regular_price),
  salePrice: toNumber(variation.sale_price),
  stockStatus: variation.stock_status ?? 'instock',
  attributes: variation.attributes,
});

async function getAllCategories() {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return categoriesCache.items;
  }

  let page = 1;
  const items: WooCategory[] = [];

  while (true) {
    const batch = await wooJson<WooCategory[]>('/products/categories', {
      per_page: 100,
      page,
      hide_empty: true,
      orderby: 'count',
      order: 'desc',
    });

    items.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  categoriesCache = {
    items,
    expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS,
  };

  return items;
}

async function getCategoryIdFromSlug(slug?: string) {
  if (!slug) {
    return undefined;
  }

  const categories = await getAllCategories();
  return categories.find((category) => category.slug === slug)?.id;
}

async function listProducts(query: {
  page?: number;
  perPage?: number;
  search?: string;
  categorySlug?: string;
  featured?: boolean;
  ids?: string;
}, publicBaseUrl?: string) {
  const page = Math.max(Number(query.page || 1), 1);
  const perPage = Math.min(Math.max(Number(query.perPage || 20), 1), 30);
  const categoryId = await getCategoryIdFromSlug(query.categorySlug);

  const response = await wooRequest('/products', {
    page,
    per_page: perPage,
    status: 'publish',
    orderby: query.search ? 'date' : 'popularity',
    search: query.search,
    category: categoryId,
    featured: query.featured ? true : undefined,
    include: query.ids,
  });

  if (response.status < 200 || response.status >= 300) {
    const payload = parseJsonSafely(response.body || '{}') as { message?: string } | null;

    console.error('[DoorBell Vercel proxy] Woo products request returned an error response', {
      categorySlug: query.categorySlug,
      search: query.search,
      status: response.status,
      body: truncateForLog(response.body),
    });

    throw new Error(payload?.message || `WooCommerce request failed with ${response.status}.`);
  }

  const products = JSON.parse(response.body) as WooProduct[];
  const total = Number(response.headers['x-wp-total'] || products.length);

  return {
    items: products.map((product) => normalizeProductCard(product, publicBaseUrl)),
    total,
    page,
    hasMore: page * perPage < total,
  };
}

const buildGuestEmail = (phone: string) => {
  const digits = phone.replace(/\D/g, '') || `${Date.now()}`;
  return `guest-${digits}@doorbellshopbd.com`;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? 'DoorBell',
    lastName: parts.slice(1).join(' ') || 'Guest',
  };
};

app.get('/', (_request, response) => {
  response.json({
    name: 'DoorBell Vercel proxy',
    routes: [
      '/health',
      '/health/woo',
      '/config',
      '/home',
      '/media',
      '/catalog/categories',
      '/catalog/products',
      '/catalog/products/:slug',
      '/checkout/place-order',
    ],
  });
});

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    wooBaseUrl,
    env: {
      hasWooBaseUrl: Boolean(wooBaseUrl),
      hasWooConsumerKey: Boolean(wooConsumerKey),
      hasWooConsumerSecret: Boolean(wooConsumerSecret),
    },
  });
});

app.get('/health/woo', async (_request, response) => {
  const wpJsonUrl = buildWpJsonUrl();

  try {
    const wpJsonResponse = await requestViaFetch(wpJsonUrl);
    const categoriesResponse = await wooRequest('/products/categories', {
      per_page: 1,
    });

    response.json({
      ok:
        wpJsonResponse.status >= 200 &&
        wpJsonResponse.status < 300 &&
        categoriesResponse.status >= 200 &&
        categoriesResponse.status < 300,
      wpJson: {
        url: wpJsonUrl,
        status: wpJsonResponse.status,
        bodyPreview: truncateForLog(wpJsonResponse.body),
      },
      categories: {
        url: redactWooUrl(buildWooUrl('/products/categories', { per_page: 1 })),
        status: categoriesResponse.status,
        bodyPreview: truncateForLog(categoriesResponse.body),
      },
    });
  } catch (error) {
    response.status(502).json({
      ok: false,
      wpJson: {
        url: wpJsonUrl,
      },
      error: serializeError(error),
    });
  }
});

app.get('/config', (_request, response) => {
  response.json(appConfig);
});

app.get('/media', async (request, response) => {
  const rawUrl = typeof request.query.url === 'string' ? request.query.url : '';
  const remoteUrl = normalizeWooAssetUrl(rawUrl);

  if (!remoteUrl) {
    response.status(400).json({ error: 'A valid Woo media URL is required.' });
    return;
  }

  const parsedUrl = new URL(remoteUrl);

  if (!isAllowedWooAssetUrl(parsedUrl)) {
    response.status(400).json({ error: 'Only media hosted on the WooCommerce domain can be proxied.' });
    return;
  }

  try {
    const assetResponse = await fetchRemoteAsset(parsedUrl.toString(), request.headers.accept);

    if (!assetResponse.ok) {
      console.error('[DoorBell Vercel proxy] Media proxy returned an error response', {
        url: parsedUrl.toString(),
        status: assetResponse.status,
      });

      response
        .status(assetResponse.status === 404 ? 404 : 502)
        .json({ error: `Image request failed with ${assetResponse.status}.` });
      return;
    }

    const contentType = assetResponse.headers.get('content-type');

    if (!contentType?.startsWith('image/')) {
      console.error('[DoorBell Vercel proxy] Media proxy received a non-image response', {
        url: parsedUrl.toString(),
        contentType,
      });

      response.status(502).json({ error: 'Upstream media response was not an image.' });
      return;
    }

    const body = Buffer.from(await assetResponse.arrayBuffer());
    const cacheControl = assetResponse.headers.get('cache-control');
    const contentLength = assetResponse.headers.get('content-length');
    const etag = assetResponse.headers.get('etag');
    const lastModified = assetResponse.headers.get('last-modified');

    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', cacheControl ?? 'public, max-age=86400, s-maxage=86400');

    if (contentLength) {
      response.setHeader('Content-Length', contentLength);
    }

    if (etag) {
      response.setHeader('ETag', etag);
    }

    if (lastModified) {
      response.setHeader('Last-Modified', lastModified);
    }

    response.status(200).send(body);
  } catch (error) {
    console.error('[DoorBell Vercel proxy] Media proxy transport failed', {
      url: parsedUrl.toString(),
      error: serializeError(error),
    });

    response.status(502).json({
      error:
        error instanceof Error && error.name === 'AbortError'
          ? 'Image request timed out.'
          : 'Image request failed.',
    });
  }
});

app.get('/home', async (_request, response, next) => {
  try {
    const publicBaseUrl = getPublicBaseUrl(_request);
    const categories = (await getAllCategories())
      .filter((category) => category.parent === 0)
      .sort((left, right) => right.count - left.count);

    const featuredCategories = featuredCategorySlugs
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter(Boolean)
      .slice(0, 6)
      .map((category) => normalizeCategory(category!, publicBaseUrl));

    const sections = await Promise.all(
      homeSections.map(async (section) => {
        const products = await listProducts({
          categorySlug: section.categorySlug,
          perPage: section.perPage,
        }, publicBaseUrl);

        return {
          id: section.id,
          title: section.title,
          subtitle: section.subtitle,
          ctaLabel: 'See all',
          categorySlug: section.categorySlug,
          products: products.items,
        };
      })
    );

    response.json({
      featuredCategories,
      sections,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/catalog/categories', async (_request, response, next) => {
  try {
    const publicBaseUrl = getPublicBaseUrl(_request);
    const categories = await getAllCategories();
    response.json(categories.map((category) => normalizeCategory(category, publicBaseUrl)));
  } catch (error) {
    next(error);
  }
});

app.get('/catalog/products', async (request, response, next) => {
  try {
    const products = await listProducts({
      page: Number(request.query.page || 1),
      perPage: Number(request.query.perPage || 20),
      search: String(request.query.search || ''),
      categorySlug: request.query.categorySlug ? String(request.query.categorySlug) : undefined,
      featured: request.query.featured === 'true',
      ids: request.query.ids ? String(request.query.ids) : undefined,
    }, getPublicBaseUrl(request));

    response.json(products);
  } catch (error) {
    next(error);
  }
});

app.get('/catalog/products/:slug', async (request, response, next) => {
  try {
    const products = await wooJson<WooProduct[]>('/products', {
      slug: request.params.slug,
      status: 'publish',
    });

    const product = products[0];
    const publicBaseUrl = getPublicBaseUrl(request);

    if (!product) {
      response.status(404).json({ error: 'Product not found.' });
      return;
    }

    const variations =
      product.type === 'variable'
        ? await wooJson<WooVariation[]>(`/products/${product.id}/variations`, {
            per_page: 50,
          })
        : [];

    response.json({
      ...normalizeProductCard(product, publicBaseUrl),
      description: product.description ?? '',
      gallery:
        product.images
          ?.map((image) => toPublicAssetUrl(image.src, publicBaseUrl))
          .filter(isPresent) ?? [],
      stockQuantity: product.stock_quantity ?? null,
      variations: variations.map(normalizeVariation),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/checkout/place-order', async (request, response, next) => {
  try {
    const payload = request.body as {
      customer?: {
        fullName?: string;
        phone?: string;
        address?: string;
      };
      items?: Array<{
        productId: number;
        quantity: number;
        variationId?: number;
      }>;
    };

    const customer = payload.customer;
    const items = payload.items ?? [];

    if (!customer?.fullName?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      response.status(400).json({ error: 'fullName, phone, and address are required.' });
      return;
    }

    if (!items.length) {
      response.status(400).json({ error: 'Cart items are required.' });
      return;
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    const productLookupResponse = await listProducts({
      perPage: productIds.length,
      ids: productIds.join(','),
    });

    const productIdsAvailable = new Set(productLookupResponse.items.map((item) => item.id));

    for (const item of items) {
      if (!productIdsAvailable.has(item.productId)) {
        response.status(409).json({ error: `Product ${item.productId} is no longer available.` });
        return;
      }

      const matchingProduct = productLookupResponse.items.find(
        (product) => product.id === item.productId
      );

      if (matchingProduct?.stockStatus === 'outofstock') {
        response.status(409).json({ error: `${matchingProduct.name} is out of stock.` });
        return;
      }
    }

    const name = splitName(customer.fullName);
    const guestProfile = {
      first_name: name.firstName,
      last_name: name.lastName,
      address_1: customer.address.trim(),
      country: appConfig.defaultCountry,
      phone: customer.phone.trim(),
      email: buildGuestEmail(customer.phone),
    };

    const order = await wooJson<{
      id: number;
      number: string;
      status: string;
      total: string;
    }>('/orders', {}, {
      method: 'POST',
      body: JSON.stringify({
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        billing: guestProfile,
        shipping: guestProfile,
        shipping_lines: [
          {
            method_id: appConfig.delivery.id,
            method_title: appConfig.delivery.label,
            total: '0',
          },
        ],
        line_items: items.map((item) => ({
          product_id: item.productId,
          variation_id: item.variationId,
          quantity: item.quantity,
        })),
      }),
    });

    response.status(201).json({
      orderId: order.id,
      orderNumber: String(order.number || order.id),
      status: order.status,
      total: toNumber(order.total) ?? 0,
      currency: appConfig.currency,
      paymentMethod: 'cod',
      deliveryLabel: appConfig.delivery.label,
    });
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: Error,
    request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[DoorBell Vercel proxy] Route failed', {
      method: request.method,
      path: request.path,
      query: request.query,
      error: serializeError(error),
    });

    response.status(500).json({
      error: error.message || 'DoorBell Vercel proxy request failed.',
    });
  }
);

export default app;
