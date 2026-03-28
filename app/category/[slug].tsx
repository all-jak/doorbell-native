import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  CartIconButton,
  PageHeader,
  ScreenContainer,
  SectionHeader,
  StateCard,
} from '@/components/storefront/page';
import { ProductCard } from '@/components/storefront/product-card';
import { SearchBar } from '@/components/storefront/search-bar';
import { doorbellTheme } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import { formatCount, titleFromSlug } from '@/lib/format';
import type { ProductCard as ProductCardType } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { addItem } = useCart();

  const categoryResource = useResource({
    key: `category-meta:${slug}`,
    request: api.getCategories,
  });

  const productResource = useResource({
    key: `category-products:${slug}`,
    enabled: Boolean(slug),
    request: () =>
      api.getProducts({
        categorySlug: slug,
        perPage: 30,
      }),
  });

  const category = categoryResource.data?.find((item) => item.slug === slug);

  return (
    <ScreenContainer>
      <FlatList
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        data={productResource.data?.items ?? []}
        key="category-grid"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          productResource.loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={doorbellTheme.colors.accent} />
            </View>
          ) : productResource.error ? (
            <StateCard
              actionLabel="Reload"
              message={productResource.error}
              onActionPress={() => void productResource.refresh()}
              title="Category feed unavailable"
            />
          ) : (
            <StateCard
              actionLabel="Back to categories"
              message="This DoorBell aisle does not have any live products right now."
              onActionPress={() => router.replace('/categories')}
              title="No live products"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHeader
              onBackPress={() => router.back()}
              right={<CartIconButton />}
              subtitle={
                category
                  ? `${formatCount(category.count)} live items in this DoorBell aisle.`
                  : 'Live category browse fed from WooCommerce.'
              }
              title={category?.name.replace('&amp;', '&') ?? titleFromSlug(slug)}
            />
            <SearchBar
              onPress={() =>
                router.push({
                  pathname: '/search',
                  params: { q: category?.name ?? '' },
                })
              }
              placeholder="Search within DoorBell"
              readOnly
            />
            <SectionHeader
              subtitle="Guest shopping with local cart state and quick add buttons."
              title="All products"
            />
          </View>
        }
        numColumns={2}
        renderItem={({ item }: { item: ProductCardType }) => (
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
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 18,
  },
  headerBlock: {
    gap: 18,
    paddingBottom: 8,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  gridRow: {
    gap: 12,
  },
  productCell: {
    flex: 1,
  },
});
