const AI_IMAGE_BASE = 'https://image.pollinations.ai/prompt/';

export type PlaceholderArt = {
  prompt: string;
  imageUrl: string;
  colors: [string, string];
  badge: string;
};

const hashSeed = (value: string) =>
  Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 11);

const buildAiImageUrl = (prompt: string, seed: number) =>
  `${AI_IMAGE_BASE}${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed}&nologo=true&enhance=true`;

const makeArt = (key: string, prompt: string, colors: [string, string], badge: string): PlaceholderArt => ({
  prompt,
  colors,
  badge,
  imageUrl: buildAiImageUrl(prompt, hashSeed(key)),
});

const categoryArtBySlug: Record<string, PlaceholderArt> = {
  grocery: makeArt(
    'grocery',
    'DoorBell grocery essentials, branded pantry shelf, soft editorial lighting, warm neutrals, red accents, premium product illustration',
    ['#FFF1EA', '#FFD8C9'],
    'Pantry staples'
  ),
  'fruits-vegetables-2': makeArt(
    'fruits-vegetables-2',
    'DoorBell fresh fruits and vegetables arrangement, modern grocery campaign, airy studio background, clean organic textures, premium illustration',
    ['#F8F3E4', '#D8F0CF'],
    'Fresh picks'
  ),
  fish: makeArt(
    'fish',
    'DoorBell fish market illustration, chilled seafood display, premium food styling, minimal composition, red brand accent',
    ['#E9F6FA', '#CFE7F2'],
    'Fresh catch'
  ),
  'dairy-eggs': makeArt(
    'dairy-eggs',
    'DoorBell dairy and eggs arrangement, bright editorial grocery campaign, creamy whites and warm highlights',
    ['#FFF8EC', '#F8E0BB'],
    'Breakfast ready'
  ),
  'baby-item': makeArt(
    'baby-item',
    'DoorBell baby care essentials, soft packaging layout, calm pastel backdrop, premium retail illustration',
    ['#FFF0EF', '#F9DCE8'],
    'Family care'
  ),
  'home-and-cleaning': makeArt(
    'home-and-cleaning',
    'DoorBell home cleaning essentials, neat household arrangement, modern retail illustration, crisp bright background',
    ['#EEF8FF', '#DDEEFF'],
    'Clean home'
  ),
  food: makeArt(
    'food',
    'DoorBell snack and dry food collection, playful premium grocery ad, red accent pops, modern illustration',
    ['#FFF6E9', '#FDE1B4'],
    'Snack shelf'
  ),
  rice: makeArt(
    'rice',
    'DoorBell rice and grain sacks, warm pantry campaign image, textured studio setup, modern premium illustration',
    ['#FFF5E7', '#EED7B4'],
    'Daily staple'
  ),
  oil: makeArt(
    'oil',
    'DoorBell cooking oil bottles, glossy kitchen essentials illustration, red brand styling, premium grocery retail art',
    ['#FFF5DF', '#F6D89A'],
    'Kitchen essentials'
  ),
  chips: makeArt(
    'chips',
    'DoorBell chips and crunchy snacks assortment, playful retail illustration, graphic packaging, premium snack campaign',
    ['#FFF0ED', '#FFD9BF'],
    'Crunch time'
  ),
  shampoo: makeArt(
    'shampoo',
    'DoorBell shampoo and haircare bottles, clean beauty retail illustration, soft beige backdrop, premium brand accents',
    ['#F8F2FF', '#E4D6FF'],
    'Care routine'
  ),
};

const bannerArtByKey: Record<string, PlaceholderArt> = {
  'doorbell-discovery': makeArt(
    'doorbell-discovery',
    'DoorBell quick commerce hero scene in Dhaka, branded grocery bags, fresh produce, pantry jars, bold red accents, polished app marketing illustration',
    ['#FFE8E2', '#FFD3C5'],
    'Guest checkout'
  ),
  'family-refill': makeArt(
    'family-refill',
    'DoorBell baby care and household restock illustration, premium retail scene, calm soft neutrals, editorial product styling',
    ['#FFF0F1', '#F8DBE2'],
    'Weekly refill'
  ),
  'kitchen-reset': makeArt(
    'kitchen-reset',
    'DoorBell kitchen pantry reset illustration with rice, oil, spices, groceries, warm natural textures, polished campaign image',
    ['#FFF4E5', '#F0D4A9'],
    'Kitchen reset'
  ),
};

export const getCategoryArt = (slug: string) =>
  categoryArtBySlug[slug] ??
  makeArt(
    slug,
    `DoorBell retail category art for ${slug.replaceAll('-', ' ')}, modern grocery illustration, soft neutral background, brand red accent`,
    ['#FFF2EC', '#F6DDD5'],
    'DoorBell pick'
  );

export const getBannerArt = (key: string) =>
  bannerArtByKey[key] ??
  makeArt(
    key,
    'DoorBell branded lifestyle retail hero illustration, warm light, soft premium background, everyday essentials, red brand accents',
    ['#FFEAE4', '#F9D3C6'],
    'DoorBell'
  );
