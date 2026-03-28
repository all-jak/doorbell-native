import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { doorbellTheme } from '@/constants/theme';
import { useCart } from '@/providers/cart-provider';

type ScreenContainerProps = {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBackPress?: () => void;
  right?: React.ReactNode;
};

type IconCircleButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  accent?: boolean;
  badgeCount?: number;
};

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

type StateCardProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ScreenContainer({ children, edges = ['top'], style }: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function IconCircleButton({
  icon,
  onPress,
  accent = false,
  badgeCount,
}: IconCircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        accent && styles.iconButtonAccent,
        pressed && styles.iconButtonPressed,
      ]}>
      <MaterialCommunityIcons
        color={accent ? doorbellTheme.colors.surface : doorbellTheme.colors.text}
        name={icon}
        size={22}
      />
      {badgeCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function CartIconButton() {
  const router = useRouter();
  const { itemCount } = useCart();

  return (
    <IconCircleButton
      badgeCount={itemCount}
      icon="cart-outline"
      onPress={() => router.push('/cart')}
    />
  );
}

export function PageHeader({ title, subtitle, eyebrow, onBackPress, right }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <View style={styles.headerRow}>
          {onBackPress ? (
            <IconCircleButton icon="arrow-left" onPress={onBackPress} />
          ) : null}
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>
      {right ? <View style={styles.headerActions}>{right}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [pressed && styles.actionPressed]}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StateCard({ title, message, actionLabel, onActionPress }: StateCardProps) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [styles.stateButton, pressed && styles.stateButtonPressed]}>
          <Text style={styles.stateButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: doorbellTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerMain: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  headerSubtitle: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: doorbellTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    shadowColor: '#7A3422',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  iconButtonAccent: {
    backgroundColor: doorbellTheme.colors.accent,
    borderColor: doorbellTheme.colors.accent,
  },
  iconButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: doorbellTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  sectionSubtitle: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  sectionAction: {
    color: doorbellTheme.colors.accent,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 15,
  },
  actionPressed: {
    opacity: 0.72,
  },
  stateCard: {
    backgroundColor: doorbellTheme.colors.surface,
    borderColor: doorbellTheme.colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  stateTitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 20,
  },
  stateMessage: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  stateButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: doorbellTheme.colors.accent,
  },
  stateButtonPressed: {
    opacity: 0.92,
  },
  stateButtonText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
});
