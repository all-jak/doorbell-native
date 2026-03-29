import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';
import { getCategoryArt } from '@/data/artwork';
import { formatCount } from '@/lib/format';
import type { CategoryItem } from '@/lib/types';

type CategoryCardProps = {
  category: CategoryItem;
  onPress: () => void;
};

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const fallbackArt = getCategoryArt(category.slug);
  const sources = Array.from(
    new Set(
      [...(category.imageSources ?? []), category.image, fallbackArt.imageUrl].filter(Boolean)
    )
  ) as string[];
  const [sourceIndex, setSourceIndex] = useState(0);
  const sourceSignature = sources.join('|');

  const currentSource = sources[sourceIndex];

  useEffect(() => {
    setSourceIndex(0);
  }, [category.id, sourceSignature]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <LinearGradient colors={fallbackArt.colors} style={styles.visual}>
        {currentSource ? (
          <Image
            contentFit="cover"
            onError={() =>
              setSourceIndex((currentIndex) =>
                currentIndex < sources.length - 1 ? currentIndex + 1 : currentIndex
              )
            }
            source={{ uri: currentSource }}
            style={styles.image}
          />
        ) : null}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{fallbackArt.badge}</Text>
        </View>
      </LinearGradient>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {category.name.replace('&amp;', '&')}
        </Text>
        <Text style={styles.meta}>{formatCount(category.count)} live items</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.94,
  },
  visual: {
    aspectRatio: 0.94,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
    justifyContent: 'space-between',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    alignSelf: 'flex-start',
    margin: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  badgeText: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.medium,
    fontSize: 11,
  },
  copy: {
    gap: 4,
  },
  title: {
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.bold,
    fontSize: 16,
    lineHeight: 21,
  },
  meta: {
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 13,
  },
});
