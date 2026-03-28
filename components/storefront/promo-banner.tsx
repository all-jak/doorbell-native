import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';
import { getBannerArt } from '@/data/artwork';

type PromoBannerProps = {
  artKey: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  compact?: boolean;
  chips?: string[];
  onPress?: () => void;
};

export function PromoBanner({
  artKey,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  compact = false,
  chips = [],
  onPress,
}: PromoBannerProps) {
  const art = getBannerArt(artKey);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient colors={art.colors} style={[styles.banner, compact && styles.bannerCompact]}>
        {!imageFailed ? (
          <Image
            contentFit="cover"
            onError={() => setImageFailed(true)}
            source={{ uri: art.imageUrl }}
            style={[styles.artImage, compact && styles.artImageCompact]}
          />
        ) : null}
        <View style={styles.blurBlob} />
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{eyebrow}</Text>
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {chips.length ? (
            <View style={styles.chipRow}>
              {chips.map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {ctaLabel ? (
            <View style={styles.ctaRow}>
              <Text style={styles.ctaLabel}>{ctaLabel}</Text>
              <MaterialCommunityIcons color={doorbellTheme.colors.surface} name="arrow-right" size={18} />
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.96,
  },
  banner: {
    minHeight: 262,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    padding: 22,
    justifyContent: 'space-between',
  },
  bannerCompact: {
    minHeight: 188,
  },
  artImage: {
    position: 'absolute',
    right: -18,
    bottom: -14,
    width: '56%',
    height: '88%',
    opacity: 0.52,
  },
  artImageCompact: {
    width: '50%',
    height: '84%',
  },
  blurBlob: {
    position: 'absolute',
    right: -22,
    top: -12,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  content: {
    flex: 1,
    maxWidth: '72%',
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(33, 23, 20, 0.84)',
  },
  badgeText: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
  },
  copy: {
    gap: 8,
  },
  title: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 32,
    lineHeight: 36,
  },
  titleCompact: {
    fontSize: 24,
    lineHeight: 29,
  },
  subtitle: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  chipText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 12,
  },
  ctaRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: doorbellTheme.colors.accent,
  },
  ctaLabel: {
    color: doorbellTheme.colors.surface,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 14,
  },
});
