import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { CartIconButton, PageHeader, ScreenContainer, StateCard } from '@/components/storefront/page';
import { doorbellTheme } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { GuestCheckoutForm } from '@/lib/types';
import { useCart } from '@/providers/cart-provider';

const defaultForm: GuestCheckoutForm = {
  fullName: '',
  phone: '',
  address: '',
};

type FormErrors = Partial<Record<keyof GuestCheckoutForm, string>>;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const configResource = useResource({
    key: 'doorbell-config',
    request: api.getConfig,
  });

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (form.phone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Phone number looks too short.';
    }

    if (!form.address.trim()) {
      nextErrors.address = 'Address is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (key: keyof GuestCheckoutForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const placeOrder = async () => {
    if (!items.length) {
      setSubmitError('Your cart is empty.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitError(null);
    setPlacingOrder(true);

    try {
      const result = await api.placeOrder({
        customer: form,
        items,
      });

      clearCart();
      router.replace({
        pathname: '/order-success',
        params: {
          orderNumber: result.orderNumber,
          total: String(result.total),
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'DoorBell could not place the order right now.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!items.length) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrap}>
          <StateCard
            actionLabel="Back to home"
            message="Add a few products before opening the guest checkout form."
            onActionPress={() => router.replace('/')}
            title="Cart is empty"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PageHeader
            onBackPress={() => router.back()}
            right={<CartIconButton />}
            subtitle="Exactly three required fields for V1 guest checkout."
            title="Checkout"
          />

          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Order summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery method</Text>
              <Text style={styles.summaryValue}>
                {configResource.data?.delivery.label ?? 'Standard delivery'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment</Text>
              <Text style={styles.summaryValue}>Cash on Delivery</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Guest details</Text>
            <CheckoutField
              error={errors.fullName}
              label="Full name"
              onChangeText={(value) => updateField('fullName', value)}
              placeholder="Your name"
              value={form.fullName}
            />
            <CheckoutField
              error={errors.phone}
              keyboardType="phone-pad"
              label="Phone number"
              onChangeText={(value) => updateField('phone', value)}
              placeholder="01XXXXXXXXX"
              value={form.phone}
            />
            <CheckoutField
              error={errors.address}
              label="Address"
              multiline
              onChangeText={(value) => updateField('address', value)}
              placeholder="House, road, area, city"
              value={form.address}
            />
          </View>

          {submitError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          ) : null}

          <Pressable
            disabled={placingOrder}
            onPress={() => void placeOrder()}
            style={({ pressed }) => [
              styles.placeOrderButton,
              placingOrder && styles.disabledButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.placeOrderText}>
              {placingOrder ? 'Placing order...' : 'Place COD order'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

type CheckoutFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad';
};

function CheckoutField({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  multiline = false,
  keyboardType = 'default',
}: CheckoutFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={doorbellTheme.colors.textMuted}
        style={[styles.input, multiline && styles.multilineInput, error && styles.inputError]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 20,
    gap: 12,
  },
  formCard: {
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
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
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  input: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    paddingHorizontal: 16,
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 16,
    backgroundColor: doorbellTheme.colors.background,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputError: {
    borderColor: doorbellTheme.colors.accent,
  },
  fieldError: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 12,
  },
  errorCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: doorbellTheme.colors.accentSoft,
  },
  errorText: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  placeOrderButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: doorbellTheme.colors.textMuted,
  },
  placeOrderText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.94,
  },
});
