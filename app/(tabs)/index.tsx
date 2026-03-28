import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BannerSlider } from '@/components/storefront/banner-slider';
import { ProductCard } from '@/components/storefront/product-card';
import { doorbellTheme } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import type { HomeSection, ProductCard as ProductCardType } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

const BANGLADESH_CITIES = [
  'Dhaka',
  'Chattogram',
  'Khulna',
  'Rajshahi',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Narayanganj',
] as const;
const ALL_PRODUCTS_PAGE_SIZE = 8;
const CATEGORY_PRODUCTS_PAGE_SIZE = 10;
const CATEGORY_BANNERS = [
  require('@/assets/images/banners/banner-1.jpg'),
  require('@/assets/images/banners/banner-2.jpg'),
  require('@/assets/images/banners/banner-7.jpg'),
  require('@/assets/images/banners/banner-8.jpg'),
  require('@/assets/images/banners/banner-9.jpg'),
  require('@/assets/images/banners/banner-10.jpg'),
] as const;
const CATEGORY_ICONS = [
  require('@/assets/images/categories/cat_fruits.png'),
  require('@/assets/images/categories/cat_dairy.png'),
  require('@/assets/images/categories/cat_snacks.png'),
  require('@/assets/images/categories/cat_meat.png'),
  require('@/assets/images/categories/cat_drinks.png'),
  require('@/assets/images/categories/cat_cleaning.png'),
] as const;
const hasRealProductImage = (product: ProductCardType) =>
  typeof product.image === 'string' && product.image.trim().length > 0;
const isEnglishCategoryName = (value: string) =>
  /^[A-Za-z0-9][A-Za-z0-9\s&(),.'/-]*$/.test(value.replaceAll('&amp;', '&').trim());
const getBannerForCategory = (slug: string) =>
  CATEGORY_BANNERS[
    Array.from(slug).reduce((total, character) => total + character.charCodeAt(0), 17) %
      CATEGORY_BANNERS.length
  ];
const getIconForCategory = (slug: string) =>
  CATEGORY_ICONS[
    Array.from(slug).reduce((total, character) => total + character.charCodeAt(0), 12) %
      CATEGORY_ICONS.length
  ];

export default function HomeScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const categoryProductsRequestRef = useRef(0);
  const [selectedCity, setSelectedCity] = useState<(typeof BANGLADESH_CITIES)[number]>('Dhaka');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductCardType[]>([]);
  const [allProductsPage, setAllProductsPage] = useState(0);
  const [allProductsHasMore, setAllProductsHasMore] = useState(true);
  const [allProductsLoading, setAllProductsLoading] = useState(true);
  const [allProductsLoadingMore, setAllProductsLoadingMore] = useState(false);
  const [allProductsError, setAllProductsError] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<ProductCardType[]>([]);
  const [categoryProductsPage, setCategoryProductsPage] = useState(0);
  const [categoryProductsHasMore, setCategoryProductsHasMore] = useState(true);
  const [categoryProductsLoading, setCategoryProductsLoading] = useState(false);
  const [categoryProductsLoadingMore, setCategoryProductsLoadingMore] = useState(false);
  const [categoryProductsError, setCategoryProductsError] = useState<string | null>(null);
  const { data, loading } = useResource({
    key: 'home-feed',
    request: () => api.getHome(),
  });
  const categoryResource = useResource({
    key: 'home-parent-categories',
    request: async () => {
      const categories = await api.getCategories();

      return categories
        .filter((category) => category.parent === 0 && isEnglishCategoryName(category.name))
        .sort((left, right) => right.count - left.count);
    },
  });
  const deliveryEstimate = selectedCity === 'Dhaka' ? '2 hours' : '1 Days';

  const selectCategory = (slug?: string) => {
    if (!slug) return;
    setSelectedCategorySlug(slug);
  };

  const closeLocationDropdown = () => {
    setIsLocationDropdownOpen(false);
  };

  const closeAccountMenu = () => {
    setIsAccountMenuOpen(false);
  };

  const loadAllProductsPage = useCallback(async (nextPage: number) => {
    const isFirstPage = nextPage === 1;
    let pageToFetch = nextPage;
    let lastFetchedPage = nextPage - 1;
    let nextHasMore = true;
    const nextVisibleProducts: ProductCardType[] = [];

    if (isFirstPage) {
      setAllProductsLoading(true);
    } else {
      setAllProductsLoadingMore(true);
    }

    setAllProductsError(null);

    try {
      while (nextHasMore && nextVisibleProducts.length < ALL_PRODUCTS_PAGE_SIZE) {
        const response = await api.getProducts({
          page: pageToFetch,
          perPage: ALL_PRODUCTS_PAGE_SIZE,
        });

        nextVisibleProducts.push(...response.items.filter(hasRealProductImage));
        lastFetchedPage = response.page;
        nextHasMore = response.hasMore;

        if (!response.hasMore) {
          break;
        }

        pageToFetch = response.page + 1;
      }

      setAllProducts((currentProducts) =>
        isFirstPage ? nextVisibleProducts : [...currentProducts, ...nextVisibleProducts]
      );
      setAllProductsPage(lastFetchedPage);
      setAllProductsHasMore(nextHasMore);
    } catch (error) {
      setAllProductsError(
        error instanceof Error ? error.message : 'DoorBell could not load the full catalog.'
      );
    } finally {
      if (isFirstPage) {
        setAllProductsLoading(false);
      } else {
        setAllProductsLoadingMore(false);
      }
    }
  }, []);

  const loadCategoryProductsPage = useCallback(async (nextPage: number, categorySlug: string) => {
    const requestId = ++categoryProductsRequestRef.current;
    const isFirstPage = nextPage === 1;
    let pageToFetch = nextPage;
    let lastFetchedPage = nextPage - 1;
    let nextHasMore = true;
    const nextVisibleProducts: ProductCardType[] = [];

    if (isFirstPage) {
      setCategoryProductsLoading(true);
    } else {
      setCategoryProductsLoadingMore(true);
    }

    setCategoryProductsError(null);

    try {
      while (nextHasMore && nextVisibleProducts.length < CATEGORY_PRODUCTS_PAGE_SIZE) {
        const response = await api.getProducts({
          categorySlug,
          page: pageToFetch,
          perPage: CATEGORY_PRODUCTS_PAGE_SIZE,
        });

        nextVisibleProducts.push(...response.items.filter(hasRealProductImage));
        lastFetchedPage = response.page;
        nextHasMore = response.hasMore;

        if (!response.hasMore) {
          break;
        }

        pageToFetch = response.page + 1;
      }

      if (categoryProductsRequestRef.current !== requestId) {
        return;
      }

      setCategoryProducts((currentProducts) =>
        isFirstPage ? nextVisibleProducts : [...currentProducts, ...nextVisibleProducts]
      );
      setCategoryProductsPage(lastFetchedPage);
      setCategoryProductsHasMore(nextHasMore);
    } catch (error) {
      if (categoryProductsRequestRef.current !== requestId) {
        return;
      }

      setCategoryProductsError(
        error instanceof Error ? error.message : 'DoorBell could not load this category.'
      );
    } finally {
      if (categoryProductsRequestRef.current !== requestId) {
        return;
      }

      if (isFirstPage) {
        setCategoryProductsLoading(false);
      } else {
        setCategoryProductsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAllProductsPage(1);
  }, [loadAllProductsPage]);

  useEffect(() => {
    if (selectedCategorySlug === 'all') {
      setCategoryProducts([]);
      setCategoryProductsPage(0);
      setCategoryProductsHasMore(true);
      setCategoryProductsLoading(false);
      setCategoryProductsLoadingMore(false);
      setCategoryProductsError(null);
      return;
    }

    setCategoryProducts([]);
    setCategoryProductsPage(0);
    setCategoryProductsHasMore(true);
    setCategoryProductsLoading(false);
    setCategoryProductsLoadingMore(false);
    setCategoryProductsError(null);
    void loadCategoryProductsPage(1, selectedCategorySlug);
  }, [loadCategoryProductsPage, selectedCategorySlug]);

  const renderProduct = (product: ProductCardType) => (
    <ProductCard
      mode="rail"
      onAdd={() => addItem(product)}
      onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
      product={product}
    />
  );

  const renderSection = ({ item }: { item: HomeSection }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <Text style={styles.sectionSubtitle}>{item.subtitle ?? item.categorySlug}</Text>
      </View>
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
  const allProductRows = allProducts.reduce<ProductCardType[][]>((rows, product, index) => {
    if (index % 2 === 0) {
      rows.push([product]);
      return rows;
    }

    rows[rows.length - 1].push(product);
    return rows;
  }, []);
  const categoryProductRows = categoryProducts.reduce<ProductCardType[][]>((rows, product, index) => {
    if (index % 2 === 0) {
      rows.push([product]);
      return rows;
    }

    rows[rows.length - 1].push(product);
    return rows;
  }, []);
  const categories = categoryResource.data ?? [];
  const homeCategories: (
    | { name: string; slug: string; icon: keyof typeof Ionicons.glyphMap; isAll: true }
    | { name: string; slug: string; banner: (typeof CATEGORY_BANNERS)[number]; thumb: (typeof CATEGORY_ICONS)[number]; isAll: false }
  )[] = [
    { name: 'All', slug: 'all', icon: 'basket-outline', isAll: true },
    ...categories.map((category) => ({
      name: category.name.replaceAll('&amp;', '&'),
      slug: category.slug,
      banner: getBannerForCategory(category.slug),
      thumb: getIconForCategory(category.slug),
      isAll: false as const,
    })),
  ];
  const selectedCategory =
    selectedCategorySlug === 'all'
      ? null
      : categories.find((category) => category.slug === selectedCategorySlug) ?? null;

  useEffect(() => {
    if (selectedCategorySlug !== 'all' && categories.length && !selectedCategory) {
      setSelectedCategorySlug('all');
    }
  }, [categories.length, selectedCategory, selectedCategorySlug]);

  const loadMoreAllProducts = useCallback(() => {
    if (
      loading ||
      allProductsLoading ||
      allProductsLoadingMore ||
      !allProductsHasMore ||
      !allProducts.length
    ) {
      return;
    }

    void loadAllProductsPage(allProductsPage + 1);
  }, [
    allProducts.length,
    allProductsHasMore,
    allProductsLoading,
    allProductsLoadingMore,
    allProductsPage,
    loadAllProductsPage,
    loading,
  ]);

  const loadMoreCategoryProducts = useCallback(() => {
    if (
      selectedCategorySlug === 'all' ||
      categoryProductsLoading ||
      categoryProductsLoadingMore ||
      !categoryProductsHasMore
    ) {
      return;
    }

    void loadCategoryProductsPage(categoryProductsPage + 1, selectedCategorySlug);
  }, [
    categoryProductsHasMore,
    categoryProductsLoading,
    categoryProductsLoadingMore,
    categoryProductsPage,
    loadCategoryProductsPage,
    selectedCategorySlug,
  ]);

  const renderAllProductsSection = () => (
    <View style={styles.allProductsSection}>
      <View style={styles.allProductsHeader}>
        <Text style={styles.sectionTitle}>All products</Text>
        <Text style={styles.sectionSubtitle}>
          Full catalog browse with 4 more rows loading in as you reach the end.
        </Text>
      </View>

      {allProductsLoading && !allProducts.length ? (
        <View style={styles.allProductsLoadingWrap}>
          <ActivityIndicator color={doorbellTheme.colors.accent} />
        </View>
      ) : null}

      {allProductsError && !allProducts.length ? (
        <View style={styles.allProductsMessageWrap}>
          <Text style={styles.allProductsMessageText}>{allProductsError}</Text>
          <Pressable onPress={() => void loadAllProductsPage(1)} style={styles.allProductsRetryButton}>
            <Text style={styles.allProductsRetryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {allProductRows.map((row, rowIndex) => (
        <View key={`all-products-row-${rowIndex}`} style={styles.allProductsRow}>
          {row.map((product) => (
            <View key={product.id} style={styles.allProductsCell}>
              <ProductCard
                mode="grid"
                onAdd={() => addItem(product)}
                onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
                product={product}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.allProductsCell} /> : null}
        </View>
      ))}

      {allProductsLoadingMore ? (
        <View style={styles.allProductsLoadingMoreWrap}>
          <ActivityIndicator color={doorbellTheme.colors.accent} size="small" />
        </View>
      ) : null}

      {allProductsError && allProducts.length ? (
        <Pressable onPress={() => void loadAllProductsPage(allProductsPage + 1)} style={styles.allProductsInlineRetry}>
          <Text style={styles.allProductsInlineRetryText}>Retry loading more products</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const renderSelectedCategorySection = () => (
    <View style={styles.allProductsSection}>
      <View style={styles.allProductsHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory?.name.replaceAll('&amp;', '&') ?? 'Category products'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          5 rows load first, then more products continue as you scroll.
        </Text>
      </View>

      {categoryProductsLoading && !categoryProducts.length ? (
        <View style={styles.allProductsLoadingWrap}>
          <ActivityIndicator color={doorbellTheme.colors.accent} />
        </View>
      ) : null}

      {categoryProductsError && !categoryProducts.length ? (
        <View style={styles.allProductsMessageWrap}>
          <Text style={styles.allProductsMessageText}>{categoryProductsError}</Text>
          <Pressable
            onPress={() => selectedCategorySlug !== 'all' && void loadCategoryProductsPage(1, selectedCategorySlug)}
            style={styles.allProductsRetryButton}>
            <Text style={styles.allProductsRetryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!categoryProductsLoading && !categoryProductsError && !categoryProducts.length ? (
        <View style={styles.allProductsMessageWrap}>
          <Text style={styles.allProductsMessageText}>
            No image-backed products are available in this category right now.
          </Text>
        </View>
      ) : null}

      {categoryProductRows.map((row, rowIndex) => (
        <View key={`category-products-row-${rowIndex}`} style={styles.allProductsRow}>
          {row.map((product) => (
            <View key={product.id} style={styles.allProductsCell}>
              <ProductCard
                mode="grid"
                onAdd={() => addItem(product)}
                onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
                product={product}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.allProductsCell} /> : null}
        </View>
      ))}

      {categoryProductsLoadingMore ? (
        <View style={styles.allProductsLoadingMoreWrap}>
          <ActivityIndicator color={doorbellTheme.colors.accent} size="small" />
        </View>
      ) : null}

      {categoryProductsError && categoryProducts.length ? (
        <Pressable
          onPress={() =>
            selectedCategorySlug !== 'all' &&
            void loadCategoryProductsPage(categoryProductsPage + 1, selectedCategorySlug)
          }
          style={styles.allProductsInlineRetry}>
          <Text style={styles.allProductsInlineRetryText}>Retry loading more products</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={selectedCategorySlug === 'all' ? sections : []}
        keyExtractor={(section) => section.id}
        onScrollBeginDrag={() => {
          closeLocationDropdown();
          closeAccountMenu();
        }}
        onEndReached={selectedCategorySlug === 'all' ? loadMoreAllProducts : loadMoreCategoryProducts}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          selectedCategorySlug === 'all' && loading ? (
            <View style={styles.loadingWrap}>
               <ActivityIndicator color={doorbellTheme.colors.accent} size="small" />
            </View>
          ) : null
        }
        ListFooterComponent={
          selectedCategorySlug === 'all' ? renderAllProductsSection() : renderSelectedCategorySection()
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <LinearGradient colors={['#FDE6BB', '#FDF8EC', '#FFFFFF']} style={styles.topGradient}>
              
              <View style={styles.topRow}>
                <View style={styles.locationWrap}>
                  <View style={styles.deliveryTimeRow}>
                    <MaterialCommunityIcons name="lightning-bolt" size={16} color="#000" />
                    <Text style={styles.deliveryTime}>{deliveryEstimate}</Text>
                  </View>
                  <View style={styles.locationSelectorAnchor}>
                    <Pressable
                      onPress={() => {
                        closeAccountMenu();

                        if (isLocationDropdownOpen) {
                          closeLocationDropdown();
                          return;
                        }

                        setIsLocationDropdownOpen(true);
                      }}
                      style={({ pressed }) => [styles.locationSelector, pressed && styles.locationSelectorPressed]}>
                      <Ionicons name="location-sharp" size={14} color="#000" style={styles.locationIcon} />
                      <Text numberOfLines={1} style={styles.locationText}>
                        Selected Location - {selectedCity}
                      </Text>
                      <Ionicons name={isLocationDropdownOpen ? 'caret-up' : 'caret-down'} size={14} color="#000" />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.avatarShadowWrap}>
                  <Pressable
                    onPress={() => {
                      closeLocationDropdown();
                      setIsAccountMenuOpen((current) => !current);
                    }}
                    style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
                    <Ionicons name="person-outline" size={20} color="#000" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.searchRow}>
                <Pressable onPress={() => router.push('/search')} style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="#666" />
                  <Text style={styles.searchPlaceholder}>Search for chips</Text>
                  <Ionicons name="mic-outline" size={20} color="#000" />
                </Pressable>
                <Pressable onPress={() => router.push('/cart')} style={styles.listBtn}>
                  <MaterialCommunityIcons name="cart-outline" size={22} color="#000" />
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {homeCategories.map((cat) => (
                  <Pressable
                    key={cat.slug}
                    onPress={() => selectCategory(cat.slug)}
                    style={[
                      styles.catItem,
                      selectedCategorySlug === cat.slug && styles.catItemActive,
                    ]}>
                    {cat.isAll ? (
                      <Ionicons
                        name={cat.icon}
                        size={24}
                        color={
                          selectedCategorySlug === cat.slug
                            ? doorbellTheme.colors.accent
                            : doorbellTheme.colors.textMuted
                        }
                      />
                    ) : (
                      <Image contentFit="cover" source={cat.thumb} style={styles.catThumb} />
                    )}
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.catText,
                        selectedCategorySlug === cat.slug && styles.catTextActive,
                      ]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

            </LinearGradient>

            {selectedCategorySlug === 'all' ? (
              <BannerSlider />
            ) : selectedCategory ? (
              <View style={styles.categoryBannerWrap}>
                <Image
                  contentFit="cover"
                  source={getBannerForCategory(selectedCategory.slug)}
                  style={styles.categoryBannerImage}
                />
              </View>
            ) : null}

          </View>
        }
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="fade"
        onRequestClose={closeAccountMenu}
        statusBarTranslucent
        transparent
        visible={isAccountMenuOpen}>
        <View style={styles.accountMenuModalRoot}>
          <Pressable style={styles.accountMenuBackdrop} onPress={closeAccountMenu} />
          <View style={styles.accountMenu}>
            <Pressable
              onPress={() => {
                closeAccountMenu();
                router.push('/login');
              }}
              style={({ pressed }) => [styles.accountMenuItem, pressed && styles.locationOptionPressed]}>
              <Text style={styles.accountMenuText}>Login</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                closeAccountMenu();
                router.push('/register');
              }}
              style={({ pressed }) => [
                styles.accountMenuItem,
                styles.accountMenuItemDivider,
                pressed && styles.locationOptionPressed,
              ]}>
              <Text style={styles.accountMenuText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        onRequestClose={closeLocationDropdown}
        statusBarTranslucent
        transparent
        visible={isLocationDropdownOpen}>
        <View style={styles.locationDropdownModalRoot}>
          <Pressable style={styles.locationDropdownBackdrop} onPress={closeLocationDropdown} />
          <View style={styles.locationDropdown}>
            <View style={styles.locationDropdownHeader}>
              <Text style={styles.locationDropdownTitle}>Choose city</Text>
            </View>
            {BANGLADESH_CITIES.map((city) => {
              const isSelected = city === selectedCity;

              return (
                <Pressable
                  key={city}
                  onPress={() => {
                    setSelectedCity(city);
                    closeLocationDropdown();
                  }}
                  style={({ pressed }) => [
                    styles.locationOption,
                    isSelected && styles.locationOptionSelected,
                    pressed && styles.locationOptionPressed,
                  ]}>
                  <Text style={[styles.locationOptionText, isSelected && styles.locationOptionTextSelected]}>
                    {city}
                  </Text>
                  {isSelected ? <Ionicons name="checkmark" size={18} color={doorbellTheme.colors.accent} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    paddingBottom: 130,
  },
  headerBlock: {
    marginBottom: 0,
  },
  topGradient: {
    paddingTop: 50, // For status bar safely
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  locationWrap: {
    flex: 1,
    paddingRight: 12,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  deliveryTime: {
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
    color: '#000',
  },
  locationSelectorAnchor: {
    alignSelf: 'stretch',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '92%',
  },
  locationSelectorPressed: {
    opacity: 0.92,
  },
  locationIcon: {
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 13,
    color: '#333',
  },
  locationDropdownModalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(80, 80, 80, 0.35)',
  },
  locationDropdown: {
    width: '82%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 24,
  },
  locationDropdownHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  locationDropdownTitle: {
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 16,
    color: doorbellTheme.colors.text,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  locationOptionSelected: {
    backgroundColor: '#FFF7F4',
  },
  locationOptionPressed: {
    opacity: 0.9,
  },
  locationOptionText: {
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
    color: doorbellTheme.colors.text,
  },
  locationOptionTextSelected: {
    fontFamily: doorbellTheme.fonts.bold,
    color: doorbellTheme.colors.accentStrong,
  },
  avatarShadowWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginTop: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPressed: {
    opacity: 0.9,
  },
  accountMenuModalRoot: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 102,
    paddingRight: 16,
  },
  accountMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  accountMenu: {
    width: 168,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  accountMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountMenuItemDivider: {
    borderTopWidth: 1,
    borderTopColor: doorbellTheme.colors.border,
  },
  accountMenuText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 15,
    color: '#888',
  },
  listBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  catRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  catItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    minWidth: 88,
  },
  catItemActive: {
    backgroundColor: '#FFF',
    borderColor: doorbellTheme.colors.accentWash,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  catText: {
    marginTop: 6,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
    color: '#333',
    lineHeight: 15,
    textAlign: 'center',
  },
  catTextActive: {
    fontFamily: doorbellTheme.fonts.bold,
    color: doorbellTheme.colors.accent,
  },
  catThumb: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  categoryBannerWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryBannerImage: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
  },
  allProductsSection: {
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  allProductsHeader: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 18,
    color: '#000',
  },
  sectionSubtitle: {
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  horizontalList: {
    gap: 16,
    paddingHorizontal: 16,
  },
  allProductsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  allProductsCell: {
    flex: 1,
  },
  allProductsLoadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  allProductsLoadingMoreWrap: {
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  allProductsMessageWrap: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  allProductsMessageText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  allProductsRetryButton: {
    borderRadius: 999,
    backgroundColor: doorbellTheme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  allProductsInlineRetry: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 18,
  },
  allProductsRetryText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 13,
  },
  allProductsInlineRetryText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 13,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
