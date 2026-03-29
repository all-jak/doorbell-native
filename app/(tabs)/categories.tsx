import { ActivityIndicator, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategoryCard } from '@/components/storefront/category-card';
import { CartIconButton, PageHeader, ScreenContainer, StateCard } from '@/components/storefront/page';
import { SearchBar } from '@/components/storefront/search-bar';
import { doorbellTheme } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import type { CategoryItem } from '@/lib/types';

const hasCategoryImage = (category: CategoryItem) => Boolean(category.image?.trim());

const sortCategoriesWithImagesFirst = (categories: CategoryItem[]) =>
  [...categories].sort((leftCategory, rightCategory) => {
    const leftHasImage = hasCategoryImage(leftCategory);
    const rightHasImage = hasCategoryImage(rightCategory);

    if (leftHasImage === rightHasImage) {
      return 0;
    }

    return leftHasImage ? -1 : 1;
  });

export default function CategoriesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, loading, error, refresh } = useResource({
    key: 'categories-root',
    request: async () => {
      const categories = await api.getCategories();
      return categories.filter((category) => category.parent === 0);
    },
  });
  const categories = sortCategoriesWithImagesFirst(data ?? []);

  const numColumns = width >= 420 ? 3 : 2;

  return (
    <ScreenContainer>
      <FlatList
        columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
        contentContainerStyle={styles.content}
        data={categories}
        key={numColumns}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={doorbellTheme.colors.accent} />
            </View>
          ) : error ? (
            <StateCard
              actionLabel="Reload"
              message={error}
              onActionPress={() => void refresh()}
              title="Categories unavailable"
            />
          ) : (
            <StateCard
              message="DoorBell did not return any category groups right now."
              title="No categories"
            />
          )
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHeader
              right={<CartIconButton />}
              subtitle="DoorBell category imagery falls back to AI-styled placeholders when Woo artwork is weak."
              title="Categories"
            />
            <SearchBar
              onPress={() => router.push('/search')}
              placeholder="Search from every category"
              readOnly
            />
          </View>
        }
        numColumns={numColumns}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() =>
              router.push({
                pathname: '/category/[slug]',
                params: { slug: item.slug },
              })
            }
          />
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
    paddingBottom: 130,
    gap: 20,
  },
  headerBlock: {
    gap: 18,
    paddingBottom: 8,
  },
  columnWrap: {
    gap: 16,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
