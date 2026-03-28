import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PageHeader, ScreenContainer } from '@/components/storefront/page';
import { doorbellTheme } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <PageHeader
            onBackPress={() => router.back()}
            subtitle="Registration is queued for the next step. The button below is just a placeholder."
            title="Register"
          />
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              placeholder="Your full name"
              placeholderTextColor={doorbellTheme.colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@example.com"
              placeholderTextColor={doorbellTheme.colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Create a password"
              placeholderTextColor={doorbellTheme.colors.textMuted}
              secureTextEntry
              style={styles.input}
            />

            <Pressable onPress={() => {}} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>Register</Text>
            </Pressable>

            <Text style={styles.helperText}>This register button is intentionally inactive for now.</Text>
          </View>
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
  },
  headerBlock: {
    paddingBottom: 16,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    gap: 12,
    borderRadius: 28,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 20,
  },
  label: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    backgroundColor: doorbellTheme.colors.background,
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  primaryButton: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 16,
  },
  helperText: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  buttonPressed: {
    opacity: 0.94,
  },
});
