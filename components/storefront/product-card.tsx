import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
      
      <View style={styles.imageWrap}>
        {product.image ? <Image contentFit="cover" source={{ uri: product.image }} style={styles.image} /> : null}
        
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
            color={isUnavailable ? '#ccc' : doorbellTheme.colors.accent}
            name="plus"
            size={22}
          />
        </Pressable>
      </View>

      <View style={styles.copy}>
        {discount ? (
          <View style={styles.discountRow}>
            <View style={styles.discountBadge}>
               <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          </View>
        ) : (
          <View style={{height: 22}} /> // placeholder to align items without discount
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price, product.currency)}</Text>
          {product.regularPrice && product.regularPrice > product.price ? (
             <Text style={styles.regularPrice}>{formatCurrency(product.regularPrice, product.currency)}</Text>
          ) : null}
        </View>

        {categoryLabel ? (
            <View style={styles.tagWrap}>
              <Text style={styles.tagText}>{categoryLabel}</Text>
            </View>
        ) : null}

        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        <Text
          ellipsizeMode="tail"
          numberOfLines={mode === 'grid' ? 2 : 1}
          style={styles.unit}>
          {product.unitLabel || stripHtml(product.shortDescription || '1 pc')}
        </Text>

        <View style={styles.deliveryTimeRow}>
           <MaterialCommunityIcons name="lightning-bolt" size={14} color={doorbellTheme.colors.accent} />
           <Text style={styles.deliveryTimeText}>10 mins</Text>
        </View>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    gap: 8,
  },
  gridCard: {
    width: '100%',
    marginBottom: 16,
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    aspectRatio: 0.9,
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: '#F7F7F7', // soft grey similar to bigbasket images
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addButtonDisabled: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  addButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  stockText: {
    color: '#FFF',
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 10,
  },
  copy: {
    marginTop: 10,
    gap: 4,
  },
  discountRow: {
    flexDirection: 'row',
  },
  discountBadge: {
    backgroundColor: '#FFE357',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#000',
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 16,
  },
  regularPrice: {
    color: '#999',
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  tagWrap: {
    backgroundColor: doorbellTheme.colors.accentSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: doorbellTheme.colors.accentStrong,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  name: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  unit: {
    color: '#888',
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  deliveryTimeText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 11,
  },
});
