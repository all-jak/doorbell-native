const htmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

export const formatCurrency = (value: number, currency: string = 'BDT') =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

export const formatCount = (value: number) => new Intl.NumberFormat('en-BD').format(value);

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (match) => htmlEntityMap[match] ?? match)
    .replace(/\s+/g, ' ')
    .trim();

export const getDiscountPercentage = (regularPrice?: number | null, salePrice?: number | null) => {
  if (!regularPrice || !salePrice || regularPrice <= salePrice) {
    return null;
  }

  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

export const titleFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
