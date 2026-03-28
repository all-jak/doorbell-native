import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CartIconButton, PageHeader, ScreenContainer, StateCard } from '@/components/storefront/page';
import { QuantityStepper } from '@/components/storefront/quantity-stepper';
import { doorbellTheme } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/providers/cart-provider';

export default function CartScreen() {
  const router = useRouter();
  const { hydrated, items, subtotal, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Loading your DoorBell cart...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          <StateCard
            actionLabel="Start shopping"
            message="Your cart is empty. Add a few DoorBell picks to continue to guest checkout."
            onActionPress={() => router.replace('/')}
            title="Nothing in cart yet"
          />
        }
        ListFooterComponent={
          items.length ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Cart summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment</Text>
                <Text style={styles.summaryValue}>Cash on Delivery</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>Standard DoorBell delivery</Text>
              </View>
              <Pressable
                onPress={() => router.push('/checkout')}
                style={({ pressed }) => [styles.checkoutButton, pressed && styles.buttonPressed]}>
                <Text style={styles.checkoutButtonText}>Continue to checkout</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHeader
              onBackPress={() => router.back()}
              right={<CartIconButton />}
              subtitle="Local cart state stays with you while moving around the app."
              title="Cart"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemVisual}>
              {item.image ? <Image contentFit="cover" source={{ uri: item.image }} style={styles.itemImage} /> : null}
            </View>
            <View style={styles.itemCopy}>
              <Text numberOfLines={2} style={styles.itemName}>
                {item.name}
              </Text>
              {item.variationLabel ? <Text style={styles.itemMeta}>{item.variationLabel}</Text> : null}
              <Text style={styles.itemPrice}>{formatCurrency(item.price, item.currency)}</Text>
              <View style={styles.itemActions}>
                <QuantityStepper
                  onDecrease={() => updateQuantity(item.key, item.quantity - 1)}
                  onIncrease={() => updateQuantity(item.key, item.quantity + 1)}
                  quantity={item.quantity}
                />
                <Pressable onPress={() => removeItem(item.key)} style={({ pressed }) => [pressed && styles.buttonPressed]}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
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
    paddingBottom: 32,
    gap: 16,
  },
  headerBlock: {
    paddingBottom: 8,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 26,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  itemVisual: {
    width: 110,
    aspectRatio: 0.9,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: doorbellTheme.colors.surfaceMuted,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemCopy: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 17,
    lineHeight: 22,
  },
  itemMeta: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 13,
  },
  itemPrice: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  removeText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 20,
    gap: 14,
  },
  summaryTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
  },
  summaryValue: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 15,
  },
  checkoutButton: {
    marginTop: 6,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.94,
  },
});
