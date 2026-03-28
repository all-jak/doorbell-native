import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CartIconButton, PageHeader, ScreenContainer, SectionHeader, StateCard } from '@/components/storefront/page';
import { ProductCard } from '@/components/storefront/product-card';
import { PromoBanner } from '@/components/storefront/promo-banner';
import { SearchBar } from '@/components/storefront/search-bar';
import { doorbellTheme } from '@/constants/theme';
import { getCategoryArt } from '@/data/artwork';
import { homeBanners, promoCards } from '@/data/home';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import type { CategoryItem, HomeSection, ProductCard as ProductCardType } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

export default function HomeScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const { data, loading, error, refresh } = useResource({
    key: 'home-feed',
    request: () => api.getHome(),
  });

  const goToCategory = (slug?: string) => {
    if (!slug) {
      return;
    }

    router.push({
      pathname: '/category/[slug]',
      params: { slug },
    });
  };

  const renderCategoryChip = ({ item }: { item: CategoryItem }) => {
    const art = getCategoryArt(item.slug);

    return (
      <Pressable
        onPress={() => goToCategory(item.slug)}
        style={({ pressed }) => [styles.categoryChip, pressed && styles.categoryChipPressed]}>
        <View style={[styles.categorySwatch, { backgroundColor: art.colors[1] }]} />
        <View style={styles.categoryChipCopy}>
          <Text numberOfLines={1} style={styles.categoryChipTitle}>
            {item.name.replace('&amp;', '&')}
          </Text>
          <Text style={styles.categoryChipMeta}>{art.badge}</Text>
        </View>
      </Pressable>
    );
  };

  const renderProduct = (product: ProductCardType) => (
    <ProductCard
      mode="rail"
      onAdd={() => addItem(product)}
      onPress={() =>
        router.push({
          pathname: '/product/[slug]',
          params: { slug: product.slug },
        })
      }
      product={product}
    />
  );

  const renderSection = ({ item }: { item: HomeSection }) => (
    <View style={styles.section}>
      <SectionHeader
        actionLabel={item.categorySlug ? 'See all' : undefined}
        onActionPress={() => goToCategory(item.categorySlug)}
        subtitle={item.subtitle}
        title={item.title}
      />
      <FlatList
        contentContainerStyle={styles.horizontalList}
        data={item.products}
        horizontal
        keyExtractor={(product) => String(product.id)}
        renderItem={({ item: product }) => renderProduct(product)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const sections = data?.sections ?? [];

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={styles.content}
        data={sections}
        keyExtractor={(section) => section.id}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={doorbellTheme.colors.accent} size="small" />
            </View>
          ) : error ? (
            <StateCard
              actionLabel="Try again"
              message={error}
              onActionPress={() => void refresh()}
              title="Home feed unavailable"
            />
          ) : (
            <StateCard
              actionLabel="Browse categories"
              message="DoorBell did not return any curated sections yet."
              onActionPress={() => router.push('/categories')}
              title="Nothing to show yet"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHeader
              eyebrow="Dhaka guest storefront"
              right={<CartIconButton />}
              subtitle="Live Woo products, cash on delivery, and a three-field native checkout."
              title="DoorBell"
            />
            <SearchBar
              onPress={() => router.push('/search')}
              placeholder="Search grocery, fish, baby care, and more"
              readOnly
            />
            <PromoBanner
              artKey={homeBanners[0].artKey}
              ctaLabel={homeBanners[0].ctaLabel}
              chips={['Cash on delivery', 'No login', 'Woo live catalog']}
              eyebrow={homeBanners[0].eyebrow}
              onPress={() => goToCategory(homeBanners[0].categorySlug)}
              subtitle={homeBanners[0].subtitle}
              title={homeBanners[0].title}
            />
            {data?.featuredCategories?.length ? (
              <View style={styles.categoryRailWrap}>
                <SectionHeader
                  subtitle="Quick jumps into the busiest DoorBell aisles."
                  title="Browse by aisle"
                />
                <FlatList
                  contentContainerStyle={styles.categoryRail}
                  data={data.featuredCategories}
                  horizontal
                  keyExtractor={(item) => String(item.id)}
                  renderItem={renderCategoryChip}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ) : null}
            <View style={styles.promoStack}>
              {promoCards.map((card) => (
                <PromoBanner
                  key={card.id}
                  artKey={card.artKey}
                  compact
                  ctaLabel={card.accentLabel}
                  eyebrow={card.accentLabel}
                  onPress={() => goToCategory(card.categorySlug)}
                  subtitle={card.subtitle}
                  title={card.title}
                />
              ))}
            </View>
          </View>
        }
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
    gap: 28,
  },
  headerBlock: {
    gap: 20,
    paddingBottom: 8,
  },
  categoryRailWrap: {
    gap: 14,
  },
  categoryRail: {
    gap: 12,
    paddingRight: 20,
  },
  categoryChip: {
    width: 164,
    padding: 14,
    borderRadius: 24,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryChipPressed: {
    opacity: 0.94,
  },
  categorySwatch: {
    width: 18,
    height: 46,
    borderRadius: 12,
  },
  categoryChipCopy: {
    flex: 1,
    gap: 2,
  },
  categoryChipTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 15,
  },
  categoryChipMeta: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 12,
  },
  promoStack: {
    gap: 16,
  },
  section: {
    gap: 16,
  },
  horizontalList: {
    gap: 14,
    paddingRight: 20,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
