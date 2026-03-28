import { Pressable, StyleSheet, Text, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';

type QuantityStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: QuantityStepperProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onDecrease} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable onPress={onIncrease} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: doorbellTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: doorbellTheme.colors.surface,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
    lineHeight: 22,
  },
  quantity: {
    minWidth: 24,
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 16,
    textAlign: 'center',
  },
});
