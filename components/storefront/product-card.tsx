import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';
import { formatCurrency, getDiscountPercentage, stripHtml } from '@/lib/format';
import type { ProductCard as ProductCardType } from '@/lib/types';

type ProductCardProps = {
  product: ProductCardType;
  mode?: 'rail' | 'grid';
  onPress: () => void;
  onAdd: () => void;
};

export function ProductCard({
  product,
  mode = 'rail',
  onPress,
  onAdd,
}: ProductCardProps) {
  const discount = getDiscountPercentage(product.regularPrice, product.salePrice ?? product.price);
  const categoryLabel = product.categories[0]?.name.replace('&amp;', '&');
  const isUnavailable = product.stockStatus === 'outofstock';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, mode === 'grid' && styles.gridCard, pressed && styles.cardPressed]}>
      <LinearGradient colors={['#FFF4EE', '#FFE9DD']} style={styles.imageWrap}>
        {product.image ? <Image contentFit="cover" source={{ uri: product.image }} style={styles.image} /> : null}
        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% off</Text>
          </View>
        ) : null}
        {isUnavailable ? (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Unavailable</Text>
          </View>
        ) : null}
        <Pressable
          disabled={isUnavailable}
          onPress={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          style={({ pressed }) => [
            styles.addButton,
            isUnavailable && styles.addButtonDisabled,
            pressed && styles.addButtonPressed,
          ]}>
          <MaterialCommunityIcons
            color={doorbellTheme.colors.surface}
            name="plus"
            size={22}
          />
        </Pressable>
      </LinearGradient>
      <View style={styles.copy}>
        {categoryLabel ? <Text style={styles.categoryLabel}>{categoryLabel}</Text> : null}
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        {product.unitLabel ? <Text style={styles.unit}>{product.unitLabel}</Text> : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price, product.currency)}</Text>
          {product.regularPrice && product.regularPrice > product.price ? (
            <Text style={styles.regularPrice}>{formatCurrency(product.regularPrice, product.currency)}</Text>
          ) : null}
        </View>
        <Text numberOfLines={2} style={styles.description}>
          {stripHtml(product.shortDescription) || 'DoorBell storefront pick'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 214,
    gap: 12,
  },
  gridCard: {
    width: '100%',
    flex: 1,
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    aspectRatio: 0.94,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFE357',
  },
  discountText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(33, 23, 20, 0.72)',
  },
  stockText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 11,
  },
  addButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: doorbellTheme.colors.textMuted,
  },
  addButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  copy: {
    gap: 4,
  },
  categoryLabel: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  name: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  unit: {
    color: doorbellTheme.colors.success,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
  },
  regularPrice: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  description: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
