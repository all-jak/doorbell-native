import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  CartIconButton,
  IconCircleButton,
  ScreenContainer,
  StateCard,
} from '@/components/storefront/page';
import { doorbellTheme } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import { formatCurrency, stripHtml } from '@/lib/format';
import { useCart } from '@/providers/cart-provider';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { addItem } = useCart();
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);

  const { data, loading, error } = useResource({
    key: `product:${slug}`,
    enabled: Boolean(slug),
    request: () => api.getProduct(slug),
  });

  useEffect(() => {
    if (!data?.variations.length) {
      return;
    }

    const firstAvailableVariation =
      data.variations.find((variation) => variation.stockStatus !== 'outofstock') ?? data.variations[0];

    setSelectedVariationId(firstAvailableVariation.id);
  }, [data?.variations]);

  if (loading && !data) {
    return (
      <ScreenContainer>
        <View style={styles.centerState}>
          <ActivityIndicator color={doorbellTheme.colors.accent} />
        </View>
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer>
        <View style={styles.fallbackWrap}>
          <StateCard
            actionLabel="Go back"
            message={error ?? 'DoorBell could not load this product right now.'}
            onActionPress={() => router.back()}
            title="Product unavailable"
          />
        </View>
      </ScreenContainer>
    );
  }

  const selectedVariation =
    data.variations.find((variation) => variation.id === selectedVariationId) ?? null;
  const displayPrice = selectedVariation?.price ?? data.price;
  const displayRegularPrice = selectedVariation?.regularPrice ?? data.regularPrice;
  const outOfStock =
    (selectedVariation?.stockStatus ?? data.stockStatus) === 'outofstock';
  const gallery = data.gallery.length ? data.gallery : data.image ? [data.image] : [];

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.galleryWrap}>
            <LinearGradient colors={['#FFF3EC', '#FFE3D5']} style={styles.galleryShell}>
              <View style={styles.galleryActions}>
                <IconCircleButton icon="arrow-left" onPress={() => router.back()} />
                <CartIconButton />
              </View>
              <ScrollView
                contentContainerStyle={styles.galleryContent}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}>
                {gallery.length ? (
                  gallery.map((imageUri) => (
                    <Image
                      key={imageUri}
                      contentFit="contain"
                      source={{ uri: imageUri }}
                      style={styles.galleryImage}
                    />
                  ))
                ) : (
                  <View style={styles.galleryFallback}>
                    <Text style={styles.galleryFallbackText}>DoorBell preview</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>

          <View style={styles.details}>
            <View style={styles.titleBlock}>
              <View style={styles.metaRow}>
                {data.categories.slice(0, 2).map((category) => (
                  <View key={category.id} style={styles.metaChip}>
                    <Text style={styles.metaChipText}>{category.name.replace('&amp;', '&')}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.title}>{data.name}</Text>
              <Text style={styles.subtitle}>
                {data.stockStatus === 'instock' ? 'In stock' : 'Limited stock'} via DoorBell guest checkout
              </Text>
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.price}>{formatCurrency(displayPrice, data.currency)}</Text>
              {displayRegularPrice && displayRegularPrice > displayPrice ? (
                <Text style={styles.regularPrice}>
                  {formatCurrency(displayRegularPrice, data.currency)}
                </Text>
              ) : null}
              <Text style={styles.helper}>
                {data.unitLabel || 'Cash on delivery only in V1'}
              </Text>
            </View>

            {data.variations.length ? (
              <View style={styles.variationBlock}>
                <Text style={styles.sectionTitle}>Choose a variation</Text>
                <View style={styles.variationWrap}>
                  {data.variations.map((variation) => {
                    const selected = variation.id === selectedVariationId;

                    return (
                      <Pressable
                        key={variation.id}
                        onPress={() => setSelectedVariationId(variation.id)}
                        style={({ pressed }) => [
                          styles.variationChip,
                          selected && styles.variationChipSelected,
                          pressed && styles.variationChipPressed,
                        ]}>
                        <Text
                          style={[
                            styles.variationText,
                            selected && styles.variationTextSelected,
                          ]}>
                          {variation.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={styles.descriptionBlock}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.description}>
                {stripHtml(data.description || data.shortDescription) ||
                  'DoorBell pulls this product directly from WooCommerce.'}
              </Text>
            </View>

            <View style={styles.notesCard}>
              <View style={styles.noteRow}>
                <MaterialCommunityIcons
                  color={doorbellTheme.colors.accent}
                  name="truck-fast-outline"
                  size={18}
                />
                <Text style={styles.noteText}>
                  Standard delivery is handled after the guest order is placed.
                </Text>
              </View>
              <View style={styles.noteRow}>
                <MaterialCommunityIcons
                  color={doorbellTheme.colors.accent}
                  name="cash-multiple"
                  size={18}
                />
                <Text style={styles.noteText}>
                  Payment method is locked to Cash on Delivery for V1.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>Subtotal preview</Text>
            <Text style={styles.bottomPrice}>{formatCurrency(displayPrice, data.currency)}</Text>
          </View>
          <View style={styles.bottomActions}>
            <Pressable
              onPress={() => router.push('/cart')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.secondaryButtonText}>View cart</Text>
            </Pressable>
            <Pressable
              disabled={outOfStock}
              onPress={() => addItem(data, { variation: selectedVariation })}
              style={({ pressed }) => [
                styles.primaryButton,
                outOfStock && styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {outOfStock ? 'Unavailable' : 'Add to cart'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 22,
  },
  galleryWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  galleryShell: {
    borderRadius: 32,
    overflow: 'hidden',
    minHeight: 380,
  },
  galleryActions: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  galleryContent: {
    minHeight: 380,
  },
  galleryImage: {
    width: 350,
    height: 380,
  },
  galleryFallback: {
    width: 350,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryFallbackText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 18,
  },
  details: {
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 22,
  },
  titleBlock: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: doorbellTheme.colors.surfaceMuted,
  },
  metaChipText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
  },
  title: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
  },
  priceCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    gap: 4,
  },
  price: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 30,
  },
  regularPrice: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  helper: {
    color: doorbellTheme.colors.success,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  variationBlock: {
    gap: 12,
  },
  sectionTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
  },
  variationWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variationChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  variationChipSelected: {
    backgroundColor: doorbellTheme.colors.accentSoft,
    borderColor: doorbellTheme.colors.accent,
  },
  variationChipPressed: {
    opacity: 0.94,
  },
  variationText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  variationTextSelected: {
    color: doorbellTheme.colors.accent,
  },
  descriptionBlock: {
    gap: 10,
  },
  description: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  notesCard: {
    borderRadius: 24,
    padding: 18,
    gap: 12,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    flex: 1,
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: doorbellTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: doorbellTheme.colors.border,
  },
  bottomLabel: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 12,
  },
  bottomPrice: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 22,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: doorbellTheme.colors.textMuted,
  },
  primaryButtonText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.94,
  },
});
