import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';

const banners = [
  require('@/assets/images/banners/banner-1.jpg'),
  require('@/assets/images/banners/banner-2.jpg'),
  require('@/assets/images/banners/banner-7.jpg'),
  require('@/assets/images/banners/banner-8.jpg'),
  require('@/assets/images/banners/banner-9.jpg'),
  require('@/assets/images/banners/banner-10.jpg'),
];

const { width } = Dimensions.get('window');

export function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === banners.length - 1 ? 0 : prev + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000); // 4 second interval
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <Image source={item} style={styles.image} contentFit="cover" />
          </View>
        )}
      />
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, activeIndex === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  image: {
    width: width - 32, // Margins of 16 on each side
    height: parseInt(((width - 32) * (500 / 1000)).toString(), 10), // approximately 2:1 aspect ratio
    marginHorizontal: 16,
    borderRadius: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: doorbellTheme.colors.accent,
    width: 16,
  },
});
