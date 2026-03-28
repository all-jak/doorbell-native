import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';

type SearchBarProps = {
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
};

export function SearchBar({
  defaultValue,
  placeholder = 'Search DoorBell products',
  readOnly = false,
  autoFocus = false,
  onPress,
  onChangeText,
}: SearchBarProps) {
  if (readOnly) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
        <MaterialCommunityIcons color={doorbellTheme.colors.textMuted} name="magnify" size={24} />
        <Text numberOfLines={1} style={[styles.placeholderText, defaultValue && styles.valueText]}>
          {defaultValue || placeholder}
        </Text>
        <MaterialCommunityIcons
          color={doorbellTheme.colors.accent}
          name="arrow-top-right"
          size={20}
        />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons color={doorbellTheme.colors.textMuted} name="magnify" size={24} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={doorbellTheme.colors.textMuted}
        returnKeyType="search"
        style={styles.input}
      />
      <MaterialCommunityIcons color={doorbellTheme.colors.accent} name="tune-variant" size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: doorbellTheme.colors.surface,
    borderWidth: 1,
    borderColor: doorbellTheme.colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  input: {
    flex: 1,
    color: doorbellTheme.colors.text,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 17,
    paddingVertical: 0,
  },
  placeholderText: {
    flex: 1,
    color: doorbellTheme.colors.textMuted,
    fontFamily: doorbellTheme.fonts.regular,
    fontSize: 17,
  },
  valueText: {
    color: doorbellTheme.colors.text,
  },
});
