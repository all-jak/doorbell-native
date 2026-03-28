import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { PageHeader, ScreenContainer } from '@/components/storefront/page';
import { doorbellTheme } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderNumber?: string; total?: string }>();
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : 'Pending';
  const total = typeof params.total === 'string' ? Number(params.total) : 0;

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.content}>
        <PageHeader
          subtitle="WooCommerce guest order created successfully."
          title="Order placed"
        />

        <View style={styles.successCard}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons color={doorbellTheme.colors.surface} name="check" size={34} />
          </View>
          <Text style={styles.successTitle}>DoorBell has your order</Text>
          <Text style={styles.successText}>
            Order reference <Text style={styles.strong}>{orderNumber}</Text> has been created as a guest COD order.
          </Text>
          <View style={styles.detailBlock}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order total</Text>
              <Text style={styles.detailValue}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailValue}>Cash on Delivery</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next step</Text>
              <Text style={styles.detailValue}>Manual fulfillment from your submitted address</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionStack}>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Back to home</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/top-picks')}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.secondaryButtonText}>Browse more top picks</Text>
          </Pressable>
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
    paddingBottom: 32,
    justifyContent: 'space-between',
    gap: 20,
  },
  successCard: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 24,
    gap: 18,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: doorbellTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  successText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
  },
  detailBlock: {
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 13,
  },
  detailValue: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  actionStack: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.94,
  },
});
