import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../utils/colors';
import { haptic } from '../../utils/haptics';

interface Chip<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface Props<T extends string> {
  chips: Chip<T>[];
  selected: T | T[];
  onChange: (value: T) => void;
  multiSelect?: boolean;
  scrollable?: boolean;
}

export function ChipSelect<T extends string>({
  chips,
  selected,
  onChange,
  multiSelect = false,
  scrollable = false,
}: Props<T>) {
  const isSelected = (value: T) =>
    Array.isArray(selected) ? selected.includes(value) : selected === value;

  const content = chips.map((chip) => {
    const active = isSelected(chip.value);
    const activeBg = chip.color || colors.primary;

    return (
      <Pressable
        key={chip.value}
        onPress={() => {
          haptic.selection();
          onChange(chip.value);
        }}
        style={({ pressed }) => [
          styles.chip,
          active && { backgroundColor: activeBg, borderColor: activeBg },
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {chip.label}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  chipTextActive: {
    color: colors.white,
  },
});
