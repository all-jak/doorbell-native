import { useDeferredValue, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
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
import type { ProductCard as ProductCardType } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  const initialQuery = typeof params.q === 'string' ? params.q : '';
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const isStale = query.trim() !== deferredQuery.trim();
  const { addItem } = useCart();

  const trimmedQuery = deferredQuery.trim();

  const { data, loading, error, refresh } = useResource({
    key: trimmedQuery ? `search:${trimmedQuery}` : 'search:fallback',
    request: () =>
      api.getProducts(
        trimmedQuery
          ? {
              search: trimmedQuery,
              perPage: 24,
            }
          : {
              featured: true,
              perPage: 18,
            }
      ),
  });

  return (
    <ScreenContainer>
      <FlatList
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        data={data?.items ?? []}
        key="search-grid"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={doorbellTheme.colors.accent} />
            </View>
          ) : error ? (
            <StateCard
              actionLabel="Retry"
              message={error}
              onActionPress={() => void refresh()}
              title="Search unavailable"
            />
          ) : (
            <StateCard
              actionLabel="Browse categories"
              message="Try a shorter keyword or browse categories instead."
              onActionPress={() => router.replace('/categories')}
              title="No matching products"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHeader
              onBackPress={() => router.back()}
              right={<CartIconButton />}
              subtitle="Responsive search uses a deferred query so typing stays smooth."
              title="Search"
            />
            <SearchBar
              autoFocus
              defaultValue={initialQuery}
              onChangeText={setQuery}
              placeholder="Search DoorBell products"
            />
            <SectionHeader
              subtitle={
                trimmedQuery
                  ? `Showing live Woo results for "${trimmedQuery}"`
                  : 'Featured products while you decide what to search for.'
              }
              title={trimmedQuery ? 'Search results' : 'Popular right now'}
            />
            {isStale ? (
              <Text style={styles.staleText}>Refreshing results for your latest query...</Text>
            ) : null}
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
  staleText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
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
