import { useEffect, useState, useTransition } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CartIconButton, PageHeader, ScreenContainer, StateCard } from '@/components/storefront/page';
import { ProductCard } from '@/components/storefront/product-card';
import { SearchBar } from '@/components/storefront/search-bar';
import { doorbellTheme } from '@/constants/theme';
import { getCategoryArt } from '@/data/artwork';
import { topPickCategorySlugs } from '@/data/home';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import type { CategoryItem, ProductCard as ProductCardType } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

const buildTopPickCategories = (categories: CategoryItem[]) => {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const curated = topPickCategorySlugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean) as CategoryItem[];
  const fallbackCategories = categories.filter(
    (category) => !topPickCategorySlugs.includes(category.slug)
  );

  return [...curated, ...fallbackCategories].slice(0, 12);
};

export default function TopPicksScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const categoryResource = useResource({
    key: 'top-picks-categories',
    request: async () => {
      const categories = await api.getCategories();
      return categories.filter((category) => category.parent === 0);
    },
  });

  const categories = buildTopPickCategories(categoryResource.data ?? []);

  useEffect(() => {
    if (!activeCategorySlug && categories.length) {
      setActiveCategorySlug(categories[0].slug);
    }
  }, [activeCategorySlug, categories]);

  const productResource = useResource({
    key: `top-picks:${activeCategorySlug}`,
    enabled: Boolean(activeCategorySlug),
    request: () =>
      api.getProducts({
        categorySlug: activeCategorySlug,
        perPage: 30,
      }),
  });

  const activeCategory =
    categories.find((category) => category.slug === activeCategorySlug) ?? categories[0];

  const renderRailItem = ({ item }: { item: CategoryItem }) => {
    const art = getCategoryArt(item.slug);
    const selected = item.slug === activeCategorySlug;

    return (
      <Pressable
        onPress={() => {
          startTransition(() => setActiveCategorySlug(item.slug));
        }}
        style={({ pressed }) => [
          styles.railItem,
          selected && styles.railItemSelected,
          pressed && styles.railItemPressed,
        ]}>
        <View style={[styles.railSwatch, { backgroundColor: art.colors[1] }]} />
        <Text numberOfLines={2} style={[styles.railText, selected && styles.railTextSelected]}>
          {item.name.replace('&amp;', '&')}
        </Text>
      </Pressable>
    );
  };

  const renderProduct = ({ item }: { item: ProductCardType }) => (
    <View style={styles.productCell}>
      <ProductCard
        mode="grid"
        onAdd={() => addItem(item)}
        onPress={() =>
          router.push({
            pathname: '/product/[slug]',
            params: { slug: item.slug },
          })
        }
        product={item}
      />
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <PageHeader
            right={<CartIconButton />}
            subtitle="Curated by category with a left-side rail and live Woo inventory."
            title="Top Picks"
          />
          <SearchBar
            onPress={() => router.push('/search')}
            placeholder="Jump into search"
            readOnly
          />
        </View>

        <View style={styles.browser}>
          <View style={styles.rail}>
            {categoryResource.loading && !categories.length ? (
              <View style={styles.railLoading}>
                <ActivityIndicator color={doorbellTheme.colors.accent} />
              </View>
            ) : categoryResource.error ? (
              <StateCard
                actionLabel="Retry"
                message={categoryResource.error}
                onActionPress={() => void categoryResource.refresh()}
                title="Category rail unavailable"
              />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderRailItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
          <View style={styles.productPane}>
            <View style={styles.productPaneHeader}>
              <Text style={styles.productPaneTitle}>
                {activeCategory?.name.replace('&amp;', '&') ?? 'Top picks'}
              </Text>
              <Text style={styles.productPaneSubtitle}>
                2-column browse view with quick add to cart.
              </Text>
            </View>
            {productResource.loading && !productResource.data?.items?.length ? (
              <View style={styles.productLoading}>
                <ActivityIndicator color={doorbellTheme.colors.accent} />
              </View>
            ) : productResource.error ? (
              <StateCard
                actionLabel="Reload"
                message={productResource.error}
                onActionPress={() => void productResource.refresh()}
                title="Products unavailable"
              />
            ) : (
              <View style={styles.gridWrap}>
                {isPending ? (
                  <Text style={styles.pendingText}>Updating picks...</Text>
                ) : null}
                <FlatList
                  columnWrapperStyle={styles.gridRow}
                  contentContainerStyle={styles.gridContent}
                  data={productResource.data?.items ?? []}
                  key="top-picks-grid"
                  keyExtractor={(item) => String(item.id)}
                  numColumns={2}
                  renderItem={renderProduct}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 18,
  },
  headerBlock: {
    gap: 18,
  },
  browser: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  rail: {
    width: 124,
    backgroundColor: doorbellTheme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 10,
  },
  railItem: {
    padding: 12,
    borderRadius: 22,
    gap: 8,
    alignItems: 'center',
  },
  railItemSelected: {
    backgroundColor: doorbellTheme.colors.surfaceMuted,
  },
  railItemPressed: {
    opacity: 0.94,
  },
  railSwatch: {
    width: 58,
    height: 46,
    borderRadius: 18,
  },
  railText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  railTextSelected: {
    color: doorbellTheme.colors.text,
  },
  railLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productPane: {
    flex: 1,
    gap: 14,
  },
  productPaneHeader: {
    paddingHorizontal: 2,
    gap: 4,
  },
  productPaneTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 26,
  },
  productPaneSubtitle: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 14,
  },
  productLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridWrap: {
    flex: 1,
    minHeight: 0,
  },
  gridContent: {
    paddingBottom: 24,
    gap: 16,
  },
  gridRow: {
    gap: 12,
  },
  productCell: {
    flex: 1,
  },
  pendingText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
    marginBottom: 10,
  },
});
